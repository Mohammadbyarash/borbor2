// ==========================================
//  ارشیو - archive.js
// ==========================================

const API_BASE = '../api/archive.php';

// ---- Hamburger Menu ----
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
  });
}
if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  });
}

// ---- State ----
let currentPage = 1;
let totalPages  = 1;
let itemToDelete  = null;
let itemToRestore = null;

// ---- Init ----
async function init() {
  await loadStats();
  await loadArchiveItems();
  setupEventListeners();
}

function setupEventListeners() {
  document.getElementById("typeFilter").addEventListener("change", () => { currentPage = 1; loadArchiveItems(); });
  document.getElementById("yearFilter").addEventListener("change", () => { currentPage = 1; loadArchiveItems(); });
  let searchTimer;
  document.getElementById("searchInput").addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { currentPage = 1; loadArchiveItems(); }, 400);
  });
}

// ---- Stats ----
async function loadStats() {
  try {
    const res  = await fetch(`${API_BASE}?action=stats`);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      console.error('Stats parse error:', text);
      return;
    }
    if (!data.success) return;
    document.getElementById("teachersCount").textContent   = data.teachers;
    document.getElementById("assistantsCount").textContent = data.assistants;
    document.getElementById("studentsCount").textContent   = data.students;
    document.getElementById("classesCount").textContent    = data.classes;
    document.getElementById("totalCount").textContent      = data.teachers + data.assistants + data.students + data.classes;
  } catch (e) {
    console.error('خطا در بارگذاری آمار:', e);
  }
}

// ---- List ----
async function loadArchiveItems() {
  const type   = document.getElementById("typeFilter").value;
  const year   = document.getElementById("yearFilter").value;
  const search = document.getElementById("searchInput").value.trim();

  const params = new URLSearchParams({ action: 'list', type, year, search, page: currentPage });
  showLoader();

  try {
    const res  = await fetch(`${API_BASE}?${params}`);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      console.error('List parse error:', text);
      showToast('خطا در پاسخ سرور', 'error');
      return;
    }
    if (!data.success) { showToast(data.message || 'خطا', 'error'); return; }
    totalPages = data.total_pages || 1;
    renderArchiveItems(data.items || []);
    updatePagination(data.total || 0);
  } catch (e) {
    console.error('خطا:', e);
    showToast('خطا در ارتباط با سرور', 'error');
  }
}

function showLoader() {
  const grid = document.getElementById("archiveGrid");
  grid.style.display = "grid";
  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:rgba(255,255,255,0.5)">
    <i class="fas fa-circle-notch fa-spin" style="font-size:48px;margin-bottom:16px;display:block"></i>در حال بارگذاری...</div>`;
  document.getElementById("emptyState").style.display = "none";
  document.getElementById("pagination").style.display = "none";
}

// ---- Render ----
function renderArchiveItems(items) {
  const grid       = document.getElementById("archiveGrid");
  const emptyState = document.getElementById("emptyState");
  grid.innerHTML   = "";

  if (items.length === 0) {
    grid.style.display = "none";
    emptyState.style.display = "block";
    document.getElementById("pagination").style.display = "none";
    return;
  }

  grid.style.display = "grid";
  emptyState.style.display = "none";
  document.getElementById("pagination").style.display = "flex";
  items.forEach(item => grid.appendChild(createArchiveCard(item)));
}

function createArchiveCard(item) {
  const card = document.createElement("div");
  card.className = "archive-item";

  const cfg = {
    teacher:   { icon: 'fa-user-tie',      label: 'معلم',       avatarClass: '' },
    assistant: { icon: 'fa-user-cog',      label: 'معاون',      avatarClass: 'assistant' },
    student:   { icon: 'fa-user-graduate', label: 'دانش‌آموز', avatarClass: 'student' },
    class:     { icon: 'fa-chalkboard',    label: 'کلاس',       avatarClass: 'class' },
  }[item.type] || { icon: 'fa-question', label: '', avatarClass: '' };

  let detailsHTML = '';
  if (item.type === 'teacher') {
    detailsHTML = `
      <div class="detail-row"><span class="detail-label">دروس:</span><span class="detail-value">${(item.subjects||[]).join('، ')||'-'}</span></div>
      <div class="detail-row"><span class="detail-label">پایه‌ها:</span><span class="detail-value">${(item.grades||[]).join('، ')||'-'}</span></div>`;
  } else if (item.type === 'assistant') {
    detailsHTML = `<div class="detail-row"><span class="detail-label">موبایل:</span><span class="detail-value">${item.mobile||'-'}</span></div>`;
  } else if (item.type === 'student') {
    detailsHTML = `
      <div class="detail-row"><span class="detail-label">پایه:</span><span class="detail-value">${item.grade||'-'}</span></div>
      <div class="detail-row"><span class="detail-label">رشته:</span><span class="detail-value">${item.field||'-'}</span></div>`;
  } else if (item.type === 'class') {
    detailsHTML = `
      <div class="detail-row"><span class="detail-label">کد کلاس:</span><span class="detail-value">${item.code||'-'}</span></div>
      <div class="detail-row"><span class="detail-label">پایه:</span><span class="detail-value">${item.grade||'-'}</span></div>
      <div class="detail-row"><span class="detail-label">رشته:</span><span class="detail-value">${item.field||'-'}</span></div>
      <div class="detail-row"><span class="detail-label">تعداد دانش‌آموزان:</span><span class="detail-value">${item.student_count} نفر</span></div>`;
  }

  const archivedDate = item.archived_at ? new Date(item.archived_at).toLocaleDateString('fa-IR') : '-';
  const avatarLetter = (item.name||'?').charAt(0);

  // ذخیره safe برای onclick
  const itemData = JSON.stringify(item).replace(/'/g, "\\'");

  let actionButtons = '';
  if (item.type === 'class') {
    actionButtons += `<button class="action-btn btn-view-students" onclick='showArchivedClassStudents(${JSON.stringify(JSON.stringify(item))})'><i class="fas fa-users"></i> دانش‌آموزان</button>`;
  } else {
    actionButtons += `<button class="action-btn btn-view-details" onclick='showArchivedItemDetails(${JSON.stringify(JSON.stringify(item))})'><i class="fas fa-eye"></i> مشاهده جزئیات</button>`;
  }
  actionButtons += `
    <button class="action-btn btn-restore" onclick='openRestoreModal(${JSON.stringify(JSON.stringify(item))})'>
      <i class="fas fa-undo-alt"></i> بازگردانی
    </button>
    <button class="action-btn btn-delete-permanent" onclick='openDeleteModal(${JSON.stringify(JSON.stringify(item))})'>
      <i class="fas fa-trash-alt"></i> حذف دائمی
    </button>`;

  card.innerHTML = `
    <div class="archive-badge"><i class="fas ${cfg.icon}"></i><span>ارشیو شده</span></div>
    <div class="item-header">
      <div class="item-avatar ${cfg.avatarClass}">${avatarLetter}</div>
      <div class="item-main-info">
        <div class="item-name">${item.name}</div>
        <div class="item-type">${cfg.label}</div>
      </div>
    </div>
    <div class="item-details">
      ${detailsHTML}
      <div class="detail-row"><span class="detail-label">تاریخ ارشیو:</span><span class="detail-value">${archivedDate}</span></div>
      <div class="detail-row"><span class="detail-label">دلیل:</span><span class="detail-value">${item.reason||'-'}</span></div>
    </div>
    <div class="item-actions">${actionButtons}</div>`;

  return card;
}

// ---- Class Students Modal ----
function showArchivedClassStudents(itemJson) {
  const item = JSON.parse(typeof itemJson === 'string' ? itemJson : JSON.stringify(itemJson));
  document.getElementById('archivedStudentsModalTitle').textContent = `لیست دانش‌آموزان ${item.name}`;

  const container = document.getElementById('archivedStudentsContainer');
  container.innerHTML = '';
  const students = item.students || [];

  if (students.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:rgba(255,255,255,0.5);grid-column:1/-1">
      <i class="fas fa-user-slash" style="font-size:48px;margin-bottom:16px;display:block;opacity:0.4"></i>
      <p>هیچ دانش‌آموزی یافت نشد</p></div>`;
  } else {
    students.forEach(s => {
      const card = document.createElement('div');
      card.className = 'student-card';
      card.dataset.name     = (s.name||'').toLowerCase();
      card.dataset.national = s.national_id||'';
      card.dataset.mobile   = s.mobile||'';
      const photoHtml = s.photo
        ? `<img src="${s.photo}" class="student-photo" alt="${s.name}">`
        : `<div class="student-photo-placeholder">${(s.name||'?').charAt(0)}</div>`;
      card.innerHTML = `
        <div class="student-card-header">
          ${photoHtml}
          <div class="student-card-info">
            <div class="student-card-name">${s.name}</div>
            <div class="student-card-code">کد ملی: ${s.national_id||'-'}</div>
          </div>
        </div>
        <div class="student-card-details">
          <div class="student-detail-row"><span class="student-detail-label">موبایل:</span><span class="student-detail-value">${s.mobile||'-'}</span></div>
        </div>
        <div class="archived-badge"><i class="fas fa-archive"></i> ارشیو شده</div>`;
      container.appendChild(card);
    });
  }
  document.getElementById('archivedStudentsModal').classList.add('active');
}

function searchArchivedStudents() {
  const q = (document.getElementById('archivedStudentSearchInput').value||'').toLowerCase().trim();
  document.querySelectorAll('#archivedStudentsContainer .student-card').forEach(card => {
    const match = !q || (card.dataset.name||'').includes(q) || (card.dataset.national||'').includes(q) || (card.dataset.mobile||'').includes(q);
    card.style.display = match ? '' : 'none';
  });
}

// ---- Item Details Modal ----
function showArchivedItemDetails(itemJson) {
  const item = JSON.parse(typeof itemJson === 'string' ? itemJson : JSON.stringify(itemJson));

  const img = document.getElementById('itemAvatarImg');
  const ph  = document.getElementById('itemAvatarPlaceholder');
  if (item.photo) { img.src=item.photo; img.style.display='block'; ph.style.display='none'; }
  else { ph.textContent=(item.name||'?').charAt(0); img.style.display='none'; ph.style.display='flex'; }

  document.getElementById('itemName').textContent = item.name;
  document.getElementById('itemType').textContent = {teacher:'معلم',assistant:'معاون',student:'دانش‌آموز'}[item.type]||'';

  ['teacherDetailsSection','assistantDetailsSection','studentDetailsSection'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });

  if (item.type === 'teacher') {
    document.getElementById('teacherDetailsSection').style.display = 'block';
    document.getElementById('teacherCode').textContent       = item.id||'-';
    document.getElementById('teacherNationalId').textContent = item.national_id||'-';
    document.getElementById('teacherSubjects').textContent   = (item.subjects||[]).join('، ')||'-';
    document.getElementById('teacherGrades').textContent     = (item.grades||[]).join('، ')||'-';
    document.getElementById('teacherMobile').textContent     = item.mobile||'-';
    document.getElementById('teacherEmail').textContent      = item.email||'-';
    document.getElementById('teacherAddress').textContent    = item.address||'-';
  } else if (item.type === 'assistant') {
    document.getElementById('assistantDetailsSection').style.display = 'block';
    document.getElementById('assistantCode').textContent       = item.id||'-';
    document.getElementById('assistantNationalId').textContent = item.national_id||'-';
    document.getElementById('assistantPosition').textContent   = item.position||'-';
    document.getElementById('assistantDepartment').textContent = item.department||'-';
    document.getElementById('assistantMobile').textContent     = item.mobile||'-';
    document.getElementById('assistantEmail').textContent      = item.email||'-';
    document.getElementById('assistantAddress').textContent    = item.address||'-';
  } else if (item.type === 'student') {
    document.getElementById('studentDetailsSection').style.display = 'block';
    document.getElementById('studentCodeDetail').textContent       = item.id||'-';
    document.getElementById('studentGrade').textContent            = item.grade||'-';
    document.getElementById('studentField').textContent            = item.field||'-';
    document.getElementById('studentNationalIdDetail').textContent = item.national_id||'-';
  }

  document.getElementById('itemArchivedDate').textContent = item.archived_at ? new Date(item.archived_at).toLocaleDateString('fa-IR') : '-';
  document.getElementById('itemAcademicYear').textContent = item.academic_year||'-';
  document.getElementById('itemReason').textContent       = item.reason||'-';

  document.getElementById('archivedItemDetailsModal').classList.add('active');
}

function closeArchivedItemDetailsModal() { document.getElementById('archivedItemDetailsModal').classList.remove('active'); }
function closeArchivedStudentsModal()    { document.getElementById('archivedStudentsModal').classList.remove('active'); }

// ---- Restore ----
function openRestoreModal(itemJson) {
  itemToRestore = JSON.parse(typeof itemJson === 'string' ? itemJson : JSON.stringify(itemJson));
  const label = {teacher:'معلم',assistant:'معاون',student:'دانش‌آموز',class:'کلاس'}[itemToRestore.type]||'';
  document.getElementById("restoreText").innerHTML = `آیا مطمئن هستید که می‌خواهید ${label} <strong>${itemToRestore.name}</strong> را بازگردانی کنید؟`;
  document.getElementById("restoreModal").classList.add("active");
}

function closeRestoreModal() {
  document.getElementById("restoreModal").classList.remove("active");
  itemToRestore = null;
}

async function confirmRestore() {
  if (!itemToRestore) return;
  // قبل از close همه چیز رو ذخیره کن
  const name = itemToRestore.name;
  const type = itemToRestore.type;
  const id   = itemToRestore.id;
  closeRestoreModal(); // اینجا itemToRestore = null میشه

  try {
    const res  = await fetch(API_BASE, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: 'restore', type, id }),
    });
    const text = await res.text();
    console.log('Restore raw response:', text);

    // پیدا کردن JSON حتی اگه چیز اضافه‌ای قبلش باشه
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.success) {
        showToast(`${name} با موفقیت بازگردانی شد`, 'success');
        await loadStats();
        await loadArchiveItems();
      } else {
        showToast(data.message || 'خطا در بازگردانی', 'error');
      }
      return;
    }

    // JSON پیدا نشد
    if (res.ok) {
      showToast(`${name} با موفقیت بازگردانی شد`, 'success');
      await loadStats();
      await loadArchiveItems();
    } else {
      showToast('خطا در بازگردانی', 'error');
    }
  } catch(e) {
    console.error('Restore error:', e);
    showToast('خطا در ارتباط با سرور', 'error');
  }
}

// ---- Delete ----
function openDeleteModal(itemJson) {
  itemToDelete = JSON.parse(typeof itemJson === 'string' ? itemJson : JSON.stringify(itemJson));
  const label = {teacher:'معلم',assistant:'معاون',student:'دانش‌آموز',class:'کلاس'}[itemToDelete.type]||'';
  document.getElementById("deleteText").innerHTML = `آیا مطمئن هستید که می‌خواهید ${label} <strong>${itemToDelete.name}</strong> را به صورت دائمی حذف کنید؟`;
  document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("active");
  itemToDelete = null;
}

async function confirmDelete() {
  if (!itemToDelete) return;
  // قبل از close همه چیز رو ذخیره کن
  const name = itemToDelete.name;
  const type = itemToDelete.type;
  const id   = itemToDelete.id;
  closeDeleteModal(); // اینجا itemToDelete = null میشه

  try {
    const res  = await fetch(API_BASE, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action: 'delete', type, id }),
    });
    const text = await res.text();
    console.log('Delete raw response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.success) {
        showToast(`${name} با موفقیت حذف شد`, 'error');
        await loadStats();
        await loadArchiveItems();
      } else {
        showToast(data.message || 'خطا در حذف', 'error');
      }
      return;
    }

    if (res.ok) {
      showToast(`${name} با موفقیت حذف شد`, 'error');
      await loadStats();
      await loadArchiveItems();
    } else {
      showToast('خطا در حذف', 'error');
    }
  } catch(e) {
    console.error('Delete error:', e);
    showToast('خطا در ارتباط با سرور', 'error');
  }
}

// ---- Pagination ----
function updatePagination(total) {
  document.getElementById("pageInfo").textContent = `صفحه ${currentPage} از ${totalPages} (${total} مورد)`;
  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled = currentPage >= totalPages;
}

function changePage(dir) {
  const np = currentPage + dir;
  if (np < 1 || np > totalPages) return;
  currentPage = np;
  loadArchiveItems();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ---- Toast ----
function showToast(message, type='success') {
  const toast = document.getElementById("successToast");
  const msgEl = document.getElementById("toastMessage");
  toast.classList.remove("error");
  if (type === 'error') toast.classList.add("error");
  msgEl.textContent = message;
  toast.classList.remove("hide");
  toast.classList.add("show");
  setTimeout(closeToast, 3500);
}

function closeToast() {
  const toast = document.getElementById("successToast");
  toast.classList.remove("show");
  toast.classList.add("hide");
  setTimeout(() => toast.classList.remove("hide"), 400);
}

// ---- Excel ----
function openExcelModal()  { document.getElementById('excelExportModal').classList.add('active'); }
function closeExcelModal() { document.getElementById('excelExportModal').classList.remove('active'); }

// ---- Close on backdrop ----
['deleteModal','restoreModal','archivedStudentsModal','archivedItemDetailsModal','excelExportModal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', function(e) {
    if (e.target !== this) return;
    if (id === 'deleteModal')                closeDeleteModal();
    else if (id === 'restoreModal')          closeRestoreModal();
    else if (id === 'archivedStudentsModal') closeArchivedStudentsModal();
    else if (id === 'archivedItemDetailsModal') closeArchivedItemDetailsModal();
    else if (id === 'excelExportModal')      closeExcelModal();
  });
});

window.addEventListener("DOMContentLoaded", init);