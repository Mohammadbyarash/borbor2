// javaScript/Pre-registration.js

const API_BASE = '../api';

// ─── باز/بستن ثبت‌نام ───────────────────────────────────────
let registrationIsOpen = true;

async function loadRegistrationToggle() {
    try {
        const res  = await fetch(`${API_BASE}/registration_status.php`);
        const data = await res.json();
        if (data.success) {
            registrationIsOpen = data.is_open;
            _updateToggleUI();
        }
    } catch { /* silent */ }
}

function _updateToggleUI() {
    const btn   = document.getElementById('registrationToggleBtn');
    const badge = document.getElementById('regStatusBadge');
    const dot   = document.getElementById('regStatusDot');
    const icon  = document.getElementById('regToggleIcon');
    const text  = document.getElementById('regToggleText');
    if (!btn) return;

    if (registrationIsOpen) {
        btn.className       = 'reg-toggle-btn is-open';
        if (icon)  icon.className  = 'fas fa-lock';
        if (text)  text.textContent = 'بستن ثبت‌نام';
        if (badge) { badge.textContent = 'باز';   badge.className = 'reg-status-badge open';   }
        if (dot)   dot.className   = 'reg-status-dot';
    } else {
        btn.className       = 'reg-toggle-btn is-closed';
        if (icon)  icon.className  = 'fas fa-lock-open';
        if (text)  text.textContent = 'باز کردن ثبت‌نام';
        if (badge) { badge.textContent = 'بسته'; badge.className = 'reg-status-badge closed'; }
        if (dot)   dot.className   = 'reg-status-dot closed';
    }
    btn.disabled = false;
}

function toggleRegistration() {
    const action = registrationIsOpen ? 'close' : 'open';
    const modal  = document.getElementById('regToggleModal');
    const iconEl = document.getElementById('regConfirmIcon');
    const iconIn = document.getElementById('regConfirmIconInner');
    const title  = document.getElementById('regConfirmTitle');
    const desc   = document.getElementById('regConfirmDesc');
    const okBtn  = document.getElementById('regConfirmOkBtn');

    if (action === 'close') {
        iconEl.className  = 'reg-confirm-icon close-action';
        iconIn.className  = 'fas fa-lock';
        title.textContent = 'بستن پیش‌ثبت‌نام';
        desc.textContent  = 'با تأیید این عملیات، دانش‌آموزان دیگر قادر به ثبت‌نام نخواهند بود.';
        okBtn.className   = 'reg-confirm-btn ok danger';
    } else {
        iconEl.className  = 'reg-confirm-icon open-action';
        iconIn.className  = 'fas fa-lock-open';
        title.textContent = 'باز کردن پیش‌ثبت‌نام';
        desc.textContent  = 'با تأیید این عملیات، فرم پیش‌ثبت‌نام برای عموم در دسترس قرار می‌گیرد.';
        okBtn.className   = 'reg-confirm-btn ok';
    }
    okBtn.dataset.pendingAction = action;
    modal.classList.add('active');
}

function closeRegToggleModal() {
    document.getElementById('regToggleModal')?.classList.remove('active');
}

async function confirmToggleRegistration() {
    const okBtn  = document.getElementById('regConfirmOkBtn');
    const action = okBtn?.dataset.pendingAction;
    if (!action) return;

    closeRegToggleModal();
    const btn = document.getElementById('registrationToggleBtn');
    if (btn) btn.disabled = true;

    try {
        const res  = await fetch(`${API_BASE}/registration_status.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ action }),
        });
        const data = await res.json();
        if (data.success) {
            registrationIsOpen = data.is_open;
            _updateToggleUI();
            showToast(data.message);
        } else {
            showToast(data.message || 'خطا', true);
            if (btn) { btn.disabled = false; _updateToggleUI(); }
        }
    } catch {
        showToast('خطا در ارتباط با سرور', true);
        if (btn) { btn.disabled = false; _updateToggleUI(); }
    }
}

// ─── Hamburger Menu ──────────────────────────────────────────
const menuToggle     = document.getElementById('menuToggle');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// ─── State ───────────────────────────────────────────────────
let registrations         = [];
let filteredRegistrations = [];
let currentRegistration   = null;

const ITEMS_PER_PAGE = 16;
let currentPage = 1;
let totalPages  = 1;

let currentSmsRecipient     = null;
let currentSmsReason        = null;
let currentSmsRecipientType = null;
let smsBalance = 0;
const smsPrice = 150;

let smsTemplates = {};
const defaultSmsTemplates = {
    acceptance: [
        'تبریک! فرزند گرامی شما در پیش ثبت نام پذیرفته شد. لطفاً جهت تکمیل ثبت نام به مدرسه مراجعه فرمایید.',
        'با سلام، با کمال مسرت به اطلاع می‌رساند فرزندتان در پیش ثبت نام قبول شده است.',
    ],
    rejection: [
        'با سلام، متأسفانه فرزند گرامی شما در پیش ثبت نام پذیرفته نشد.',
        'احتراماً به اطلاع می‌رساند درخواست پیش ثبت نام فرزندتان مورد تأیید قرار نگرفت.',
    ],
    interview: [
        'با سلام، لطفاً جهت انجام مصاحبه فرزندتان روز {تاریخ} ساعت {ساعت} به مدرسه تشریف بیاورید.',
    ],
    documents: [
        'لطفاً مدارک ناقص پیش ثبت نام را تا تاریخ {تاریخ} تکمیل و ارسال فرمایید.',
    ],
    other: [
        'با سلام والدین محترم، لطفاً در اسرع وقت با مدرسه تماس حاصل فرمایید.',
    ],
};

// ─── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    loadSmsBalance();
    loadSmsTemplates();
    fetchRegistrations();
    setupFilters();
    loadRegistrationToggle();

    document.getElementById('smsMessage')?.addEventListener('input', updateCharCount);
    document.getElementById('customChargeAmount')?.addEventListener('input', updateChargeButton);

    // بستن مودال toggle با کلیک بیرون
    document.getElementById('regToggleModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeRegToggleModal();
    });
});

// ─── Admin Info ──────────────────────────────────────────────
function fetchAdminInfo() {
    fetch('../api/stats.php')
        .then(r => r.json())
        .then(d => {
            if (d.success && d.currentUser) {
                const el = document.getElementById('adminInfo');
                if (el) el.textContent = (d.currentUser.role_label || '') + ': ' + (d.currentUser.name || '');
            }
        })
        .catch(() => {});
}

// ─── API: دریافت لیست ────────────────────────────────────────
async function fetchRegistrations() {
    fetchAdminInfo();
    showLoadingState(true);
    try {
        const params = new URLSearchParams({
            search: document.getElementById('searchInput')?.value  || '',
            grade:  document.getElementById('filterGrade')?.value  || '',
            status: document.getElementById('filterStatus')?.value || '',
        });

        const response = await fetch(`${API_BASE}/get_registrations.php?${params}`);
        const result   = await response.json();

        if (!result.success) {
            showToast(result.message || 'خطا در دریافت اطلاعات', true);
            return;
        }

        registrations         = result.registrations;
        filteredRegistrations = [...registrations];

        updateStatsFromAPI(result.stats);
        updateExcelCounts(result.stats);
        currentPage = 1;
        renderRegistrations();

    } catch {
        showToast('خطا در ارتباط با سرور. صفحه را رفرش کنید.', true);
    } finally {
        showLoadingState(false);
    }
}

function showLoadingState(loading) {
    const grid = document.getElementById('registrationsGrid');
    if (!grid) return;
    if (loading) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px;color:rgba(255,255,255,0.6);">
                <i class="fas fa-spinner fa-spin" style="font-size:40px;margin-bottom:15px;display:block;"></i>
                در حال بارگذاری...
            </div>`;
    }
}

// ─── API: تغییر وضعیت ────────────────────────────────────────
async function updateStatusAPI(id, newStatus) {
    try {
        const response = await fetch(`${API_BASE}/update_status.php`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id, status: newStatus }),
        });
        const result = await response.json();
        return result.success;
    } catch {
        return false;
    }
}

// ─── آمار ────────────────────────────────────────────────────
function updateStatsFromAPI(stats) {
    document.getElementById('pendingCount').textContent  = stats.pending;
    document.getElementById('acceptedCount').textContent = stats.accepted;
    document.getElementById('rejectedCount').textContent = stats.rejected;
    document.getElementById('totalCount').textContent    = stats.total;
}

function updateExcelCounts(stats) {
    ['excelAllCount','excelPendingCount','excelAcceptedCount','excelRejectedCount']
        .forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.textContent = [stats.total, stats.pending, stats.accepted, stats.rejected][i];
        });
}

// ─── Pagination ──────────────────────────────────────────────
function updatePagination() {
    totalPages = Math.ceil(filteredRegistrations.length / ITEMS_PER_PAGE);
    const container = document.getElementById('paginationContainer');
    if (totalPages <= 1) { container.style.display = 'none'; return; }
    container.style.display = 'flex';
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent  = totalPages;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderRegistrations();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ─── رندر کارت‌ها ────────────────────────────────────────────
function renderRegistrations() {
    const grid       = document.getElementById('registrationsGrid');
    const emptyState = document.getElementById('emptyState');
    grid.innerHTML   = '';

    if (filteredRegistrations.length === 0) {
        grid.style.display       = 'none';
        emptyState.style.display = 'block';
        document.getElementById('paginationContainer').style.display = 'none';
        return;
    }

    grid.style.display       = 'grid';
    emptyState.style.display = 'none';

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const items = filteredRegistrations.slice(start, start + ITEMS_PER_PAGE);
    items.forEach(reg => grid.appendChild(createRegistrationCard(reg)));
    updatePagination();
}

function createRegistrationCard(reg) {
    const card     = document.createElement('div');
    card.className = `registration-card ${reg.status}`;
    const fullName = `${reg.studentName} ${reg.studentFamily}`;
    const avatar   = reg.studentName.charAt(0);

    const statusMap = {
        pending:  { icon: 'fa-clock',        text: 'در انتظار' },
        accepted: { icon: 'fa-check-circle', text: 'قبول شده'  },
        rejected: { icon: 'fa-times-circle', text: 'رد شده'    },
    };
    const s           = statusMap[reg.status] || statusMap.pending;
    const smsDisabled = reg.status === 'pending';
    const regJSON     = JSON.stringify(reg).replace(/'/g, '&#39;');

    card.innerHTML = `
          <button
            class="card-archive-btn ${reg.archived ? 'archived' : ''}"
            onclick="openArchiveModal(${regJSON})"
            title="${reg.archived ? 'خارج کردن از آرشیو' : 'آرشیو کردن'}"
        >
            <i class="fas fa-${reg.archived ? 'box-open' : 'archive'}"></i>
            <span class="tooltip">${reg.archived ? 'خارج از آرشیو' : 'آرشیو کن'}</span>
        </button>
        <div class="card-header">
            ${reg.photo
                ? `<img src="${reg.photo}" class="card-avatar" alt="${fullName}">`
                : `<div class="card-avatar">${avatar}</div>`}
            <div class="card-main-info">
                <div class="card-name">${fullName}</div>
                <div class="card-code">کد پیگیری: ${reg.trackingCode || reg.registrationId}</div>
            </div>
        </div>
        <div class="card-details">
            <div class="detail-row">
                <span class="detail-label">پایه تحصیلی:</span>
                <span class="detail-value">${reg.studentGrade}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">کد ملی:</span>
                <span class="detail-value">${reg.studentNationalId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">شماره پدر:</span>
                <span class="detail-value">${reg.fatherPhone}</span>
            </div>
            <div class="detail-row status-row">
                <span class="detail-label">وضعیت:</span>
                <span class="status-display ${reg.status}">
                    <i class="fas ${s.icon}"></i> ${s.text}
                </span>
                <button class="btn-change-status" onclick='openStatusModal(${regJSON})'>
                    <i class="fas fa-edit"></i> تغییر وضعیت
                </button>
            </div>
        </div>
        <div class="card-actions">
            <button class="action-btn btn-view-details" onclick='showSpecs(${regJSON})'>
                <i class="fas fa-info-circle"></i> مشاهده جزئیات
            </button>
            <button class="action-btn btn-sms ${smsDisabled ? 'disabled' : ''}"
                onclick='openSmsModal(${regJSON})' ${smsDisabled ? 'disabled' : ''}>
                <i class="fas fa-sms"></i> ارسال پیامک
            </button>
        </div>`;

    return card;
}

// ─── فیلترها ─────────────────────────────────────────────────
function setupFilters() {
    let debounceTimer;
    document.getElementById('searchInput')?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 400);
    });
    document.getElementById('filterGrade')?.addEventListener('change',  applyFilters);
    document.getElementById('filterStatus')?.addEventListener('change', applyFilters);
}

function applyFilters() {
    const search       = (document.getElementById('searchInput')?.value  || '').toLowerCase();
    const gradeFilter  =  document.getElementById('filterGrade')?.value  || '';
    const statusFilter =  document.getElementById('filterStatus')?.value || '';

    filteredRegistrations = registrations.filter(reg => {
        const fullName = `${reg.studentName} ${reg.studentFamily}`.toLowerCase();
        if (search && !fullName.includes(search)
            && !(reg.studentNationalId || '').includes(search)
            && !(reg.fatherPhone || '').includes(search)) return false;
        if (gradeFilter && reg.studentGradeRaw !== gradeFilter) return false;
        if (statusFilter && reg.status !== statusFilter) return false;
        return true;
    });

    currentPage = 1;
    renderRegistrations();
}

// ─── مودال جزئیات ────────────────────────────────────────────
function showSpecs(regData) {
    currentRegistration = regData;

    document.getElementById('specStudentName').textContent       = `${regData.studentName} ${regData.studentFamily}`;
    document.getElementById('specRegistrationId').textContent    = regData.trackingCode || regData.registrationId;
    document.getElementById('specStudentFirstName').textContent  = regData.studentName;
    document.getElementById('specStudentLastName').textContent   = regData.studentFamily;
    document.getElementById('specStudentNationalId').textContent = regData.studentNationalId;
    document.getElementById('specStudentBirthDate').textContent  = regData.studentBirthDate;
    document.getElementById('specStudentGrade').textContent      = regData.studentGrade;
    document.getElementById('specStudentPhone').textContent      = regData.studentPhone || '---';

    document.getElementById('specFatherName').textContent        = regData.fatherName;
    document.getElementById('specFatherFamily').textContent      = regData.fatherFamily     || '---';
    document.getElementById('specFatherNationalId').textContent  = '---';
    document.getElementById('specFatherBirthDate').textContent   = regData.fatherBirthDate  || '---';
    document.getElementById('specFatherEducation').textContent   = regData.fatherEducation;
    document.getElementById('specFatherJob').textContent         = regData.fatherJob        || '---';
    document.getElementById('specFatherPhone').textContent       = regData.fatherPhone;

    document.getElementById('specMotherName').textContent        = regData.motherName;
    document.getElementById('specMotherFamily').textContent      = regData.motherFamily     || '---';
    document.getElementById('specMotherNationalId').textContent  = '---';
    document.getElementById('specMotherBirthDate').textContent   = regData.motherBirthDate  || '---';
    document.getElementById('specMotherEducation').textContent   = regData.motherEducation;
    document.getElementById('specMotherJob').textContent         = regData.motherJob        || '---';
    document.getElementById('specMotherPhone').textContent       = regData.motherPhone;

    const photoContainer = document.getElementById('specPhotoContainer');
    photoContainer.innerHTML = regData.photo
        ? `<img src="${regData.photo}" onclick="openImagePreview('${regData.photo}')" alt="photo"
               style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
        : regData.studentName.charAt(0);

    const renderDoc = (elId, src, label) => {
        document.getElementById(elId).innerHTML = src
            ? `<img src="${src}" onclick="openImagePreview('${src}')" alt="${label}">`
            : `<div class="document-placeholder"><i class="fas fa-file-image"></i><span>${label}</span></div>`;
    };
    renderDoc('reportCardDoc', regData.reportCard,  'کارنامه');
    renderDoc('guidanceDoc',   regData.guidanceDoc, 'هدایت تحصیلی');

    document.getElementById('specsModal').classList.add('active');
}

function closeSpecsModal() { document.getElementById('specsModal').classList.remove('active'); }

// ─── مودال تغییر وضعیت ───────────────────────────────────────
function openStatusModal(regData) {
    currentRegistration = regData;
    document.getElementById('statusModal').classList.add('active');
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('active');
    currentRegistration = null;
}

async function changeStatus(newStatus) {
    if (!currentRegistration) return;
    const ok = await updateStatusAPI(currentRegistration.registrationId, newStatus);
    if (ok) {
        const update = arr => {
            const idx = arr.findIndex(r => r.registrationId === currentRegistration.registrationId);
            if (idx !== -1) arr[idx].status = newStatus;
        };
        update(registrations);
        update(filteredRegistrations);
        closeStatusModal();
        renderRegistrations();
        fetchStats();
        showToast('وضعیت با موفقیت تغییر کرد!');
    } else {
        showToast('خطا در تغییر وضعیت. دوباره تلاش کنید.', true);
        closeStatusModal();
    }
}

async function fetchStats() {
    try {
        const r    = await fetch(`${API_BASE}/get_registrations.php?stats_only=1`);
        const data = await r.json();
        if (data.success) {
            updateStatsFromAPI(data.stats);
            updateExcelCounts(data.stats);
        }
    } catch { /* silent */ }
}

// ─── SMS Balance ──────────────────────────────────────────────
function loadSmsBalance() {
    const saved = localStorage.getItem('preRegSmsBalance');
    smsBalance  = saved ? parseInt(saved) : 50000;
    if (!saved) saveSmsBalance();
    updateBalanceDisplay();
}

function saveSmsBalance() {
    localStorage.setItem('preRegSmsBalance', smsBalance.toString());
    updateBalanceDisplay();
}

function updateBalanceDisplay() {
    ['smsBalanceAmount','smsBalanceAmount2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = formatCurrency(smsBalance);
    });
    const box = document.getElementById('smsBalanceBox');
    if (box) {
        box.classList.remove('low-balance','medium-balance');
        if      (smsBalance < 10000) box.classList.add('low-balance');
        else if (smsBalance < 50000) box.classList.add('medium-balance');
    }
}

function formatCurrency(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ─── SMS Templates ────────────────────────────────────────────
function loadSmsTemplates() {
    const saved  = localStorage.getItem('preRegSmsTemplates');
    smsTemplates = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultSmsTemplates));
}

function saveSmsTemplatesStorage() {
    localStorage.setItem('preRegSmsTemplates', JSON.stringify(smsTemplates));
}

// ─── SMS Modal ────────────────────────────────────────────────
function openSmsModal(regData) {
    if (regData.status === 'pending') {
        showWarningModal('امکان ارسال پیامک وجود ندارد!', 'فقط برای متقاضیانی که وضعیتشان قبول یا رد شده است می‌توانید پیامک ارسال کنید.');
        return;
    }
    currentSmsRecipient     = regData;
    currentSmsReason        = null;
    currentSmsRecipientType = null;

    document.getElementById('smsRecipientInfo').innerHTML = `
        <div class="sms-student-info">
            <div class="sms-student-avatar">${regData.studentName.charAt(0)}</div>
            <div class="sms-student-details">
                <div class="sms-student-name">${regData.studentName} ${regData.studentFamily}</div>
                <div class="sms-student-code">کد پیگیری: ${regData.trackingCode || regData.registrationId}</div>
            </div>
        </div>
        <div class="parent-phones-info">
            <div class="phone-item">
                <i class="fas fa-male"></i>
                <span>پدر: ${regData.fatherName}</span>
                <span class="ltr-text">${regData.fatherPhone}</span>
            </div>
            <div class="phone-item">
                <i class="fas fa-female"></i>
                <span>مادر: ${regData.motherName}</span>
                <span class="ltr-text">${regData.motherPhone}</span>
            </div>
        </div>`;

    document.querySelectorAll('.recipient-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sms-reason-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('smsMessage').value = '';
    updateCharCount();
    renderQuickMessages();
    document.getElementById('smsModal').classList.add('active');
}

function closeSmsModal() {
    document.getElementById('smsModal').classList.remove('active');
    currentSmsRecipient = currentSmsReason = currentSmsRecipientType = null;
}

function selectRecipient(type) {
    currentSmsRecipientType = type;
    document.querySelectorAll('.recipient-btn').forEach(b =>
        b.classList.toggle('active', b.getAttribute('data-recipient') === type));
}

function selectSmsReason(reason) {
    currentSmsReason = reason;
    document.querySelectorAll('.sms-reason-btn').forEach(b =>
        b.classList.toggle('active', b.getAttribute('data-reason') === reason));
    renderQuickMessages();
}

function renderQuickMessages() {
    const grid = document.getElementById('smsQuickGrid');
    grid.innerHTML = '';
    if (!currentSmsReason) {
        grid.innerHTML = '<div class="sms-no-quick-messages">لطفاً ابتدا دلیل ارسال پیامک را انتخاب کنید</div>';
        return;
    }
    const templates = smsTemplates[currentSmsReason] || [];
    if (!templates.length) {
        grid.innerHTML = '<div class="sms-no-quick-messages">هیچ پیام سریعی ذخیره نشده است</div>';
        return;
    }
    templates.forEach((tpl, idx) => {
        const item = document.createElement('div');
        item.className = 'sms-quick-item';
        item.innerHTML = `
            <i class="fas fa-comment sms-quick-icon"></i>
            <div class="sms-quick-text">${tpl}</div>
            <button class="sms-quick-delete" onclick="deleteQuickMessage(${idx})"><i class="fas fa-trash"></i></button>`;
        item.addEventListener('click', e => {
            if (!e.target.closest('.sms-quick-delete')) {
                document.getElementById('smsMessage').value = tpl;
                updateCharCount();
            }
        });
        grid.appendChild(item);
    });
}

function deleteQuickMessage(idx) {
    if (!currentSmsReason) return;
    if (confirm('آیا می‌خواهید این پیام سریع را حذف کنید؟')) {
        smsTemplates[currentSmsReason].splice(idx, 1);
        saveSmsTemplatesStorage();
        renderQuickMessages();
        showToast('پیام سریع حذف شد');
    }
}

function updateCharCount() {
    const count = document.getElementById('smsMessage').value.length;
    const el    = document.getElementById('smsCharCount');
    if (el) { el.textContent = count; el.style.color = count > 300 ? '#e74c3c' : '#e67e22'; }
}

function saveSmsTemplate() {
    const msg = document.getElementById('smsMessage').value.trim();
    if (!msg)              { showWarningModal('خطا', 'لطفاً متن پیامک را وارد کنید!'); return; }
    if (!currentSmsReason) { showWarningModal('خطا', 'لطفاً دلیل ارسال پیامک را انتخاب کنید!'); return; }
    if (msg.length > 300)  { showWarningModal('خطا', 'متن پیامک نباید بیش از ۳۰۰ کاراکتر باشد!'); return; }
    if (smsTemplates[currentSmsReason]?.includes(msg)) { showWarningModal('خطا', 'این پیام قبلاً ذخیره شده است!'); return; }
    smsTemplates[currentSmsReason].push(msg);
    saveSmsTemplatesStorage();
    renderQuickMessages();
    showToast('متن پیامک به پیام‌های سریع اضافه شد');
}

function sendSms() {
    const msg = document.getElementById('smsMessage').value.trim();
    if (!msg)                     { showWarningModal('متن خالی است!',       'لطفاً متن پیامک را وارد کنید.'); return; }
    if (!currentSmsReason)        { showWarningModal('دلیل انتخاب نشده!',   'لطفاً دلیل ارسال را انتخاب کنید.'); return; }
    if (msg.length > 300)         { showWarningModal('متن طولانی است!',      `متن ${msg.length} کاراکتر دارد. حداکثر ۳۰۰.`); return; }
    if (!currentSmsRecipientType) { showWarningModal('گیرنده انتخاب نشده!', 'لطفاً گیرنده را انتخاب کنید.'); return; }

    const count = currentSmsRecipientType === 'both' ? 2 : 1;
    const text  = currentSmsRecipientType === 'father'
        ? `پدر ${currentSmsRecipient.studentName} ${currentSmsRecipient.studentFamily}`
        : currentSmsRecipientType === 'mother'
            ? `مادر ${currentSmsRecipient.studentName} ${currentSmsRecipient.studentFamily}`
            : `والدین ${currentSmsRecipient.studentName} ${currentSmsRecipient.studentFamily}`;
    const cost = count * smsPrice;
    if (smsBalance < cost) { openLowBalanceModal(count, cost); return; }
    openSmsConfirmModal(count, cost, text);
}

function openSmsConfirmModal(count, cost, text) {
    document.getElementById('smsConfirmRecipients').textContent    = count;
    document.getElementById('smsConfirmCost').textContent          = formatCurrency(cost);
    document.getElementById('smsConfirmRecipientText').textContent = text;
    document.getElementById('smsConfirmModal').classList.add('active');
    window.pendingSmsData = { count, cost, text };
}

function closeSmsConfirmModal() {
    document.getElementById('smsConfirmModal').classList.remove('active');
    window.pendingSmsData = null;
}

function confirmSendSms() {
    const data = window.pendingSmsData;
    if (!data) return;
    closeSmsConfirmModal();
    smsBalance -= data.cost;
    saveSmsBalance();
    showToast(`پیامک با موفقیت به ${data.text} ارسال شد.`);
    closeSmsModal();
}

function openLowBalanceModal(count, cost) {
    document.getElementById('lowBalanceNeeded').textContent  = formatCurrency(cost);
    document.getElementById('lowBalanceCurrent').textContent = formatCurrency(smsBalance);
    document.getElementById('lowBalanceModal').classList.add('active');
}

function closeLowBalanceModal() { document.getElementById('lowBalanceModal').classList.remove('active'); }

function goToChargeFromLowBalance() {
    closeLowBalanceModal();
    closeSmsModal();
    openChargeModal();
}

// ─── Charge Modal ─────────────────────────────────────────────
function openChargeModal() {
    document.getElementById('chargeModal').classList.add('active');
    document.querySelectorAll('.charge-option-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('customChargeAmount').value = '';
    updateChargeButton();
}

function closeChargeModal() { document.getElementById('chargeModal').classList.remove('active'); }

function selectChargeOption(amount) {
    document.querySelectorAll('.charge-option-btn').forEach(b => b.classList.remove('active'));
    event.target.closest('.charge-option-btn').classList.add('active');
    document.getElementById('customChargeAmount').value = '';
    updateChargeButton();
}

function selectCustomCharge() {
    document.querySelectorAll('.charge-option-btn').forEach(b => b.classList.remove('active'));
    updateChargeButton();
}

function updateChargeButton() {
    const active = document.querySelector('.charge-option-btn.active');
    const custom = document.getElementById('customChargeAmount');
    const btn    = document.querySelector('.charge-btn-pay');
    const amount = active ? parseInt(active.getAttribute('data-amount')) : (parseInt(custom?.value) || 0);
    if (btn) {
        btn.disabled  = amount <= 0;
        btn.innerHTML = amount > 0
            ? `<i class="fas fa-credit-card"></i> پرداخت ${formatCurrency(amount)} تومان`
            : `<i class="fas fa-credit-card"></i> انتخاب مبلغ الزامی است`;
    }
}

function proceedToPayment() {
    const active = document.querySelector('.charge-option-btn.active');
    const custom = document.getElementById('customChargeAmount');
    const amount = active ? parseInt(active.getAttribute('data-amount')) : parseInt(custom?.value || 0);
    if (amount < 10000) { showWarningModal('خطا', 'حداقل مبلغ شارژ ۱۰٬۰۰۰ تومان است!'); return; }
    closeChargeModal();
    document.getElementById('chargeConfirmAmount').textContent = formatCurrency(amount);
    document.getElementById('chargeConfirmModal').classList.add('active');
    window.pendingChargeAmount = amount;
}

function closeChargeConfirmModal() {
    document.getElementById('chargeConfirmModal').classList.remove('active');
    window.pendingChargeAmount = null;
}

function confirmCharge() {
    const amount = window.pendingChargeAmount;
    if (!amount) return;
    closeChargeConfirmModal();
    showToast('در حال انتقال به درگاه پرداخت...');
    setTimeout(() => {
        smsBalance += amount;
        saveSmsBalance();
        showToast(`حساب شما ${formatCurrency(amount)} تومان شارژ شد!`);
    }, 1500);
}

// ─── Warning Modal ────────────────────────────────────────────
function showWarningModal(title, message) {
    document.getElementById('warningTitle').textContent   = title;
    document.getElementById('warningMessage').textContent = message;
    document.getElementById('warningModal').classList.add('active');
}

function closeWarningModal() { document.getElementById('warningModal').classList.remove('active'); }

// ─── Image Preview ────────────────────────────────────────────
function openImagePreview(src) {
    document.getElementById('imagePreviewContent').src = src;
    document.getElementById('imagePreviewModal').classList.add('active');
}

function closeImagePreview() { document.getElementById('imagePreviewModal').classList.remove('active'); }

// ─── Export ───────────────────────────────────────────────────
function openExportModal()  { document.getElementById('exportModal').classList.add('active'); }
function closeExportModal() { document.getElementById('exportModal').classList.remove('active'); }

function exportToExcel(type) {
    let csv = 'data:text/csv;charset=utf-8,\uFEFF';
    csv += 'کد پیگیری,نام,نام خانوادگی,کد ملی,پایه,رشته,تاریخ تولد,نام پدر,تحصیلات پدر,شغل پدر,شماره پدر,نام مادر,تحصیلات مادر,شغل مادر,شماره مادر,وضعیت,تاریخ ثبت\n';

    const statusLabel = { pending:'در انتظار', accepted:'قبول شده', rejected:'رد شده' };
    const rows = type === 'all' ? registrations : registrations.filter(r => r.status === type);

    if (!rows.length) { showToast('هیچ رکوردی یافت نشد!', true); closeExportModal(); return; }

    rows.forEach(r => {
        csv += `${r.trackingCode||r.registrationId},${r.studentName},${r.studentFamily},${r.studentNationalId},${r.studentGrade},${r.studentMajor||''},${r.studentBirthDate},${r.fatherName},${r.fatherEducation},${r.fatherJob||''},${r.fatherPhone},${r.motherName},${r.motherEducation},${r.motherJob||''},${r.motherPhone},${statusLabel[r.status]},${r.createdAt}\n`;
    });

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `registrations_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    closeExportModal();
    showToast('فایل Excel با موفقیت دانلود شد!');
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(message, isError = false) {
    const toast  = document.getElementById('toast');
    const msgEl  = document.getElementById('toastMessage');
    const iconEl = toast.querySelector('.toast-icon i');
    msgEl.textContent = message;
    iconEl.className  = isError ? 'fas fa-times-circle' : 'fas fa-check-circle';
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeToast() { document.getElementById('toast').classList.remove('show'); }

// ─── بستن مودال‌ها با کلیک بیرون ────────────────────────────
['specsModal','statusModal','exportModal','imagePreviewModal','smsModal','chargeModal',
 'smsConfirmModal','lowBalanceModal','chargeConfirmModal','warningModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
});


function loadAutoArchiveDays() {
    const saved = localStorage.getItem('autoArchiveDays') || '30';
    const input = document.getElementById('autoArchiveDays');
    if (input) input.value = saved;
}

function saveAutoArchiveDays() {
    const input = document.getElementById('autoArchiveDays');
    const btn   = document.getElementById('autoArchiveSaveBtn');
    const val   = parseInt(input?.value);

    if (!val || val < 1 || val > 365) {
        showToast('عدد روز باید بین ۱ تا ۳۶۵ باشد', true);
        return;
    }

    localStorage.setItem('autoArchiveDays', val.toString());

    // نمایش حالت ذخیره شد
    btn.classList.add('saved');
    btn.innerHTML = '<i class="fas fa-check"></i> ذخیره شد';
    setTimeout(() => {
        btn.classList.remove('saved');
        btn.innerHTML = '<i class="fas fa-save"></i> ذخیره';
    }, 2000);

    showToast(`آرشیو خودکار پس از ${val} روز تنظیم شد`);
}

// ─── مودال آرشیو ──────────────────────────────────────────────
let _pendingArchiveReg = null;

function openArchiveModal(regData) {
    _pendingArchiveReg = regData;
    const isArchived = regData.archived === true || regData.archived == 1;
    const fullName   = `${regData.studentName} ${regData.studentFamily}`;

    const icon     = document.getElementById('archiveModalIcon');
    const iconIn   = document.getElementById('archiveModalIconInner');
    const title    = document.getElementById('archiveModalTitle');
    const desc     = document.getElementById('archiveModalDesc');
    const nameEl   = document.getElementById('archiveModalStudentName');
    const confirmBtn = document.getElementById('archiveModalConfirmBtn');

    nameEl.textContent = fullName;

    if (isArchived) {
        // حالت خارج کردن از آرشیو
        icon.className        = 'archive-modal-icon undo-archive';
        iconIn.className      = 'fas fa-box-open';
        title.textContent     = 'خارج کردن از آرشیو';
        desc.innerHTML        = `آیا می‌خواهید این پیش‌ثبت‌نام را از آرشیو خارج کنید؟<br>پس از تأیید، دوباره در لیست اصلی نمایش داده می‌شود.`;
        confirmBtn.className  = 'arch-btn confirm-unarchive';
        confirmBtn.innerHTML  = '<i class="fas fa-box-open"></i> از آرشیو خارج کن';
    } else {
        // حالت آرشیو کردن
        icon.className        = 'archive-modal-icon do-archive';
        iconIn.className      = 'fas fa-archive';
        title.textContent     = 'آرشیو کردن';
        desc.innerHTML        = `آیا می‌خواهید این پیش‌ثبت‌نام را آرشیو کنید؟<br>پس از آرشیو، در صفحه آرشیو قابل مشاهده خواهد بود.`;
        confirmBtn.className  = 'arch-btn confirm-archive';
        confirmBtn.innerHTML  = '<i class="fas fa-archive"></i> آرشیو کن';
    }

    document.getElementById('archiveModal').classList.add('active');
}

function closeArchiveModal() {
    document.getElementById('archiveModal')?.classList.remove('active');
    _pendingArchiveReg = null;
}

function confirmArchive() {
    if (!_pendingArchiveReg) return;
    // TODO: اتصال به API — فعلاً فقط UI
    const isArchived = _pendingArchiveReg.archived === true || _pendingArchiveReg.archived == 1;
    const fullName   = `${_pendingArchiveReg.studentName} ${_pendingArchiveReg.studentFamily}`;
    const msg = isArchived
        ? `${fullName} از آرشیو خارج شد`
        : `${fullName} آرشیو شد`;
    closeArchiveModal();
    showToast(msg);
}

// ─── init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadAutoArchiveDays();
    // بستن مودال آرشیو با کلیک بیرون
    document.getElementById('archiveModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeArchiveModal();
    });
});
