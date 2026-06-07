'use strict';

(function injectExtra() {
    if (document.getElementById('__gradesExtra')) return;
    const s = document.createElement('style');
    s.id = '__gradesExtra';
    s.textContent = `
    .grade-badge {
        display: inline-block; padding: 3px 10px; border-radius: 6px;
        font-weight: 700; font-size: 14px; font-family: Vazirmatn, sans-serif;
    }
    .grade-excellent { background: rgba(46,204,113,.2);  color: #2ecc71; border: 1px solid #2ecc71; }
    .grade-good      { background: rgba(52,152,219,.2);  color: #3498db; border: 1px solid #3498db; }
    .grade-average   { background: rgba(243,156,18,.2);  color: #f39c12; border: 1px solid #f39c12; }
    .grade-weak      { background: rgba(231,76,60,.2);   color: #e74c3c; border: 1px solid #e74c3c; }

    .grade-input {
        width: 80px; background: rgba(255,255,255,.08); border: 1.5px solid rgba(255,255,255,.2);
        border-radius: 8px; color: #fff; font-family: Vazirmatn, sans-serif;
        font-size: 16px; font-weight: 600; padding: 8px 10px; text-align: center;
        transition: border-color .2s;
    }
    .grade-input:focus { outline: none; border-color: #3498db; background: rgba(52,152,219,.1); }
    .grade-input-wrapper { display: flex; align-items: center; gap: 6px; }
    .grade-max { color: rgba(255,255,255,.4); font-size: 13px; font-family: Vazirmatn, sans-serif; }

    .student-grade-item {
        display: flex; align-items: center; gap: 14px; padding: 14px 18px;
        border-radius: 12px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08); margin-bottom: 10px;
    }
    .student-avatar-small {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg,#3498db,#9b59b6);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 700; font-size: 17px; flex-shrink: 0;
    }
    .student-grade-info { flex: 1; min-width: 0; }
    .student-grade-name { font-weight: 600; font-size: 15px; color: #fff; font-family: Vazirmatn,sans-serif; }
    .student-grade-code { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 2px; font-family: Vazirmatn,sans-serif; }

    .term-btn {
        border: 2px solid rgba(255,255,255,.2); border-radius: 8px;
        padding: 8px 20px; cursor: pointer; font-family: Vazirmatn, sans-serif;
        font-size: 14px; font-weight: 600; background: rgba(255,255,255,.06);
        color: rgba(255,255,255,.6); transition: all .2s;
    }
    .term-btn.active { border-color: #3498db; background: #3498db; color: #fff; }

    .grade-tab {
        border: 2px solid rgba(255,255,255,.15); border-radius: 8px;
        padding: 7px 16px; cursor: pointer; font-family: Vazirmatn, sans-serif;
        font-size: 13px; font-weight: 600; background: rgba(255,255,255,.05);
        color: rgba(255,255,255,.55); transition: all .2s;
    }
    .grade-tab.active { background: #3498db; border-color: #3498db; color: #fff; }

    .grades-list-row {
        display: grid;
        grid-template-columns: 55px 140px 1fr 110px 130px;
        align-items: center; padding: 12px 16px; border-radius: 8px;
        border-bottom: 1px solid rgba(255,255,255,.06);
        font-family: Vazirmatn,sans-serif; font-size: 14px;
        color: rgba(255,255,255,.85); gap: 8px;
    }
    .grades-list-row:hover { background: rgba(255,255,255,.04); }

    .btn-view-dashboard {
        background: rgba(52,152,219,.2); border: 1px solid rgba(52,152,219,.4);
        color: #3498db; border-radius: 6px; padding: 5px 12px;
        cursor: pointer; font-family: Vazirmatn,sans-serif; font-size: 13px;
        transition: all .2s;
    }
    .btn-view-dashboard:hover { background: rgba(52,152,219,.4); }

    .sk-row { display:flex; align-items:center; gap:12px; padding:15px 20px;
        border-radius:10px; background:#1e2957; margin-bottom:10px;
        animation:skPulse 1.4s ease-in-out infinite; }
    .sk { border-radius:6px; background:rgba(255,255,255,.1); }
    .sk-av { width:45px; height:45px; border-radius:50%; flex-shrink:0; }
    .sk-tx { height:14px; flex:1; }
    .sk-btn { width:80px; height:36px; border-radius:8px; }
    @keyframes skPulse { 0%,100%{opacity:.5} 50%{opacity:1} }

    .dashboard-tab {
        border: none; background: rgba(255,255,255,.07); border-radius: 8px;
        padding: 9px 18px; cursor: pointer; font-family: Vazirmatn, sans-serif;
        font-size: 14px; color: rgba(255,255,255,.6); transition: all .2s;
    }
    .dashboard-tab.active { background: #3498db; color: #fff; }
    .dashboard-tab-content { display: none; }
    .dashboard-tab-content.active { display: block; }

    .comparison-table-row {
        display: grid; grid-template-columns: 1fr 120px 120px 100px;
        gap: 8px; padding: 11px 14px; border-radius: 8px;
        border-bottom: 1px solid rgba(255,255,255,.06);
        font-family: Vazirmatn,sans-serif; font-size: 14px; color: rgba(255,255,255,.85);
    }
    .comparison-table-row:hover { background: rgba(255,255,255,.04); }
    .comparison-table-header {
        display: grid; grid-template-columns: 1fr 120px 120px 100px;
        gap: 8px; padding: 10px 14px; border-radius: 8px;
        background: rgba(255,255,255,.08); font-weight: 700; font-size: 13px;
        color: rgba(255,255,255,.6); font-family: Vazirmatn,sans-serif; margin-bottom: 6px;
    }

    .monthly-grade-card {
        background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
        border-radius: 12px; padding: 16px; margin-bottom: 12px;
    }
    .monthly-grade-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .monthly-grade-body { display:flex; gap:16px; flex-wrap:wrap; }
    .grade-item { text-align:center; }
    .grade-item-label { font-size:12px; color:rgba(255,255,255,.5); font-family:Vazirmatn,sans-serif; }
    .grade-item-value { font-size:20px; font-weight:700; color:#fff; font-family:Vazirmatn,sans-serif; }

    .exam-day {
        min-height: 72px; border-radius: 10px; padding: 8px;
        background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
        cursor: default; position: relative; transition: all .2s;
    }
    .exam-day.today { border-color: #3498db; background: rgba(52,152,219,.12); }
    .exam-day.has-exam { cursor: pointer; border-color: #f39c12; background: rgba(243,156,18,.08); }
    .exam-day.has-exam:hover { background: rgba(243,156,18,.18); }
    .exam-day.weekend-day { opacity: .45; }
    .exam-day-number { font-size: 15px; font-weight: 700; color: #fff; font-family: Vazirmatn,sans-serif; }
    .exam-indicator { width:8px;height:8px;border-radius:50%;background:#f39c12;margin:4px 0; }
    .exam-count { font-size:11px; color:#f39c12; font-family:Vazirmatn,sans-serif; }

    .upcoming-exam-item {
        display:flex; align-items:center; gap:14px; padding:14px 18px;
        border-radius:12px; background:rgba(255,255,255,.04);
        border:1px solid rgba(255,255,255,.08); margin-bottom:10px; flex-wrap:wrap;
    }
    .exam-date-badge { text-align:center; min-width:46px; }
    .exam-day-text { font-size:22px; font-weight:800; color:#fff; font-family:Vazirmatn,sans-serif; line-height:1; }
    .exam-month-text { font-size:12px; color:rgba(255,255,255,.5); font-family:Vazirmatn,sans-serif; }
    .exam-info { flex:1; min-width:0; }
    .exam-subject { font-weight:600; font-size:15px; color:#fff; font-family:Vazirmatn,sans-serif; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .exam-details { font-size:12px; color:rgba(255,255,255,.5); margin-top:3px; font-family:Vazirmatn,sans-serif; }
    .exam-type-badge { padding:4px 12px; border-radius:20px; font-size:12px; font-family:Vazirmatn,sans-serif; font-weight:600; }
    .exam-type-midterm  { background:rgba(52,152,219,.2);  color:#3498db; }
    .exam-type-final    { background:rgba(231,76,60,.2);   color:#e74c3c; }
    .exam-type-quiz     { background:rgba(46,204,113,.2);  color:#2ecc71; }
    .exam-type-project  { background:rgba(155,89,182,.2);  color:#9b59b6; }
    .exam-status-badge { font-size:11px; padding:2px 8px; border-radius:6px; }
    .status-pending   { background:rgba(243,156,18,.2);  color:#f39c12; }
    .status-completed { background:rgba(46,204,113,.2);  color:#2ecc71; }
    .status-cancelled { background:rgba(231,76,60,.2);   color:#e74c3c; }
    .exam-action-btn { border:none; border-radius:7px; padding:6px 10px; cursor:pointer; font-size:13px; transition:all .2s; }
    .btn-toggle { background:rgba(46,204,113,.15); color:#2ecc71; }
    .btn-edit   { background:rgba(52,152,219,.15);  color:#3498db; }
    .btn-delete { background:rgba(231,76,60,.15);   color:#e74c3c; }
    .exam-actions-btns { display:flex; gap:6px; }

    .grades-table { width:100%; border-collapse:collapse; margin-bottom:20px; font-family:Vazirmatn,sans-serif; }
    .grades-table th { background:rgba(52,152,219,.3); color:#fff; padding:10px 8px; text-align:center; border:1px solid rgba(255,255,255,.1); font-size:12px; }
    .grades-table td { padding:9px 8px; text-align:center; border:1px solid rgba(255,255,255,.06); font-size:13px; color:rgba(255,255,255,.85); }
    .grades-table tbody tr:nth-child(even) { background:rgba(255,255,255,.03); }
    .report-card-header { text-align:center; margin-bottom:24px; }
    .school-name { font-size:20px; font-weight:700; color:#fff; margin-bottom:6px; font-family:Vazirmatn,sans-serif; }
    .card-title  { font-size:16px; color:#3498db; font-family:Vazirmatn,sans-serif; }
    .report-card-student-info { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:20px; background:rgba(255,255,255,.05); padding:14px; border-radius:10px; }
    .info-item { display:flex; gap:6px; font-family:Vazirmatn,sans-serif; }
    .info-item-label { color:rgba(255,255,255,.5); font-size:13px; }
    .info-item-value { font-weight:600; color:#fff; font-size:13px; }
    .report-card-footer { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; padding-top:16px; border-top:1px solid rgba(255,255,255,.1); margin-top:16px; }
    .footer-item { text-align:center; }
    .footer-label { color:rgba(255,255,255,.5); font-size:12px; margin-bottom:4px; font-family:Vazirmatn,sans-serif; }
    .footer-value { font-size:18px; font-weight:700; color:#fff; font-family:Vazirmatn,sans-serif; }

    @media(max-width:768px){
        .grades-list-row { grid-template-columns:50px 1fr 100px 110px; }
        .grades-list-row .col-code { display:none; }
        .comparison-table-row,.comparison-table-header { grid-template-columns:1fr 90px 90px 80px; font-size:13px; }
        .report-card-student-info { grid-template-columns:1fr 1fr; }
    }
    `;
    document.head.appendChild(s);
})();

let _pageLoaded = false;
let _dataLoaded = false;

function tryHideLoader() {
    if (!_pageLoaded || !_dataLoaded) return;
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 550);
    }
}

window.addEventListener('load', () => {
    _pageLoaded = true;
    tryHideLoader();
});

const API_URL = '../api/grades_api.php';

async function apiFetch(method, params = {}, body = null) {
    let url = API_URL;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (method === 'GET') {
        const qs = new URLSearchParams(params).toString();
        if (qs) url += '?' + qs;
    } else {
        opts.body = JSON.stringify(body ?? params);
    }
    const res  = await fetch(url, opts);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'خطای سرور');
    return json;
}

function jalaliToGregorian(jy, jm, jd) {
    jy += 1595;
    let days = -355779 + (365 * jy) + (Math.floor(jy / 33) * 8)
             + Math.floor(((jy % 33) + 3) / 4) + jd;
    if (jm <= 6) { days += (jm - 1) * 31; }
    else         { days += ((jm - 7) * 30) + 186; }

    let gy = 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
        gy   += 100 * Math.floor(--days / 36524);
        days %= 36524;
        if (days >= 365) days++;
    }
    gy   += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 364) {
        gy   += Math.floor((days - 1) / 365);
        days  = (days - 1) % 365;
    }
    let gd = days + 1;
    const gDIM = [29, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) gDIM[1] = 29;
    let gm = 0;
    for (let i = 0; i < gDIM.length; i++) {
        if (gd <= gDIM[i]) { gm = i + 1; break; }
        gd -= gDIM[i];
    }
    return `${gy}-${String(gm).padStart(2,'0')}-${String(gd).padStart(2,'0')}`;
}

function convertDateToGregorian(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.replace(/-/g, '/').split('/');
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0]), m = parseInt(parts[1]), d = parseInt(parts[2]);
    if (y >= 1300 && y <= 1500) {
        return jalaliToGregorian(y, m, d);
    }
    return dateStr;
}

const S = {
    user:       null,
    classes:    [],
    cls:        null,
    classId:    null,
    students:   [],
    lessons:    [],
    scores:     {},
    examEvents: [],
    currentTerm:      1,
    currentUnitId:    null,
    currentGradeType: 'continuous',
    calYear:    0,
    calMonth:   0,
    calStudId:  null,
    charts:     {},
};

const PM  = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const PWD = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];

function todayJ() {
    try {
        if (typeof jalaali === 'undefined') throw new Error('jalaali not loaded');
        const n = new Date();
        const j = jalaali.toJalaali(n.getFullYear(), n.getMonth() + 1, n.getDate());
        return { year: j.jy, month: j.jm, day: j.jd, dow: n.getDay() === 6 ? 0 : n.getDay() + 1 };
    } catch(e) {
        const n = new Date();
        return { year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate(), dow: n.getDay() };
    }
}

function jStr(y, m, d) {
    return `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
}

function daysInM(y, m) { return m <= 6 ? 31 : m <= 11 ? 30 : 29; }

function firstDow(y, m) {
    try {
        const g = jalaali.toGregorian(y, m, 1), dt = new Date(g.gy, g.gm - 1, g.gd);
        return dt.getDay() === 6 ? 0 : dt.getDay() + 1;
    } catch(e) { return 0; }
}

function isWknd(y, m, d) {
    try {
        const g = jalaali.toGregorian(y, m, d), dt = new Date(g.gy, g.gm - 1, g.gd);
        const dw = dt.getDay() === 6 ? 0 : dt.getDay() + 1;
        return dw === 5 || dw === 6;
    } catch(e) { return false; }
}

function showCurDate() {
    const t = todayJ(), el = document.getElementById('currentDateDisplay');
    if (el) el.textContent = `${PWD[t.dow]} ${t.day} ${PM[t.month - 1]} ${t.year}`;
}

async function init() {
    showCurDate();
    setInterval(showCurDate, 60000);
    try {
        if (typeof jalaali === 'undefined') throw new Error('کتابخانه jalaali لود نشده است');
        const res = await apiFetch('GET', { action: 'classes' });
        S.user = {
            id:        res.user_id,
            name:      res.user_name,
            role:      res.user_role,
            isTeacher: res.is_teacher,
        };
        S.classes = res.data || [];
        _setAdminText();
        renderClasses();
        _dataLoaded = true;
        tryHideLoader();
    } catch (err) {
        _dataLoaded = true;
        tryHideLoader();
        toast('خطا در ارتباط با سرور: ' + err.message, 'error');
    }
}

function _setAdminText() {
    const el = document.querySelector('.admin-info');
    if (!el || !S.user) return;
    const rl = { teacher: 'معلم', manager: 'مدیر', owner: 'مالک', assistant: 'معاون' };
    el.textContent = `${rl[S.user.role] || S.user.role}: ${S.user.name}`;
}

function renderClasses() {
    const grid = document.getElementById('classesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!S.classes.length) {
        grid.innerHTML = `<div class="att-empty" style="grid-column:1/-1">
            <i class="fas fa-chalkboard"></i>کلاسی یافت نشد</div>`;
        return;
    }
    S.classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <div class="class-header">
                <span class="class-number">کلاس ${cls.code}</span>
                <span class="class-grade">${cls.grade || ''}</span>
            </div>
            <div class="class-info">
                <div class="info-row">
                    <span class="info-label">تعداد دانش‌آموزان:</span>
                    <span class="info-value">${cls.student_count} نفر</span>
                </div>
                <div class="info-row">
                    <span class="info-label">رشته:</span>
                    <span class="info-value">${cls.field || '—'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">میانگین کلاس:</span>
                    <span class="info-value" id="avg-${cls.id}">...</span>
                </div>
            </div>
            <div class="class-actions">
                <button class="btn btn-view-attendance" onclick="openViewGradesModal(${cls.id})">
                    <i class="fas fa-eye"></i> مشاهده نمرات
                </button>
                <button class="btn btn-register-attendance" onclick="openEnterGradesModal(${cls.id})">
                    <i class="fas fa-pen"></i> ثبت نمره
                </button>
            </div>`;
        grid.appendChild(card);
        _loadClassAvg(cls.id);
    });
}

async function _loadClassAvg(classId) {
    try {
        const res = await apiFetch('GET', { action: 'class_stats', class_id: classId });
        const rows = (res.data || []).filter(r => +r.avg_score > 0);
        const avg  = rows.length
            ? (rows.reduce((s, r) => s + +r.avg_score, 0) / rows.length).toFixed(2)
            : '—';
        const el = document.getElementById(`avg-${classId}`);
        if (el) el.textContent = avg;
    } catch {
        const el = document.getElementById(`avg-${classId}`);
        if (el) el.textContent = '—';
    }
}

function _findCls(id) { return S.classes.find(c => +c.id === +id) || null; }

async function openEnterGradesModal(classId) {
    S.cls     = _findCls(classId);
    S.classId = classId;
    if (!S.cls) return;

    document.getElementById('enterGradesModalTitle').textContent =
        `ثبت نمرات — کلاس ${S.cls.code} | ${S.cls.grade || ''} ${S.cls.field || ''}`;

    S.currentTerm      = 1;
    S.currentUnitId    = null;
    S.currentGradeType = 'continuous';

    document.querySelectorAll('.term-btn').forEach(b =>
        b.classList.toggle('active', b.getAttribute('data-term') === '1'));
    document.querySelectorAll('.grade-tab').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-type') === 'continuous') b.classList.add('active');
    });

    const t = todayJ();
    const dateEl = document.getElementById('gradeDate');
    if (dateEl) dateEl.value = jStr(t.year, t.month, t.day);

    _showEnterSkeleton();
    document.querySelector('.save-grades-btn').style.display = 'none';
    document.getElementById('enterGradesModal').classList.add('active');

    try {
        const [sRes, lRes, scRes] = await Promise.all([
            apiFetch('GET', { action: 'students', class_id: classId }),
            apiFetch('GET', { action: 'lessons',  class_id: classId }),
            apiFetch('GET', { action: 'scores',   class_id: classId }),
        ]);
        S.students = sRes.data || [];
        S.lessons  = lRes.data || [];
        S.scores   = _parseScores(scRes.data || []);

        const sel = document.getElementById('subjectSelect');
        sel.innerHTML = '<option value="">— انتخاب درس —</option>';
        S.lessons.forEach(l => {
            const o = document.createElement('option');
            o.value = l.unit_id;
            o.textContent = l.name;
            sel.appendChild(o);
        });
        document.getElementById('studentsGradesList').innerHTML =
            '<div class="att-empty"><i class="fas fa-clipboard-list"></i>درس را انتخاب کنید</div>';
    } catch (err) {
        toast('خطا: ' + err.message, 'error');
    }

    setTimeout(() => {
        if (window.jalaliDatepicker)
            jalaliDatepicker.startWatch({ selector: '#gradeDate', closeAfterSelect: true, autoFill: false });
    }, 100);
}

function _showEnterSkeleton() {
    const c = document.getElementById('studentsGradesList');
    if (!c) return;
    c.innerHTML = Array(5).fill(0).map(() => `
        <div class="sk-row">
            <div class="sk sk-av"></div>
            <div class="sk sk-tx"></div>
            <div class="sk sk-btn"></div>
        </div>`).join('');
}

function closeEnterGradesModal() {
    document.getElementById('enterGradesModal').classList.remove('active');
    S.cls = null; S.classId = null; S.students = []; S.lessons = []; S.scores = {};
}

function _parseScores(apiData) {
    const r = {};
    apiData.forEach(row => {
        const sid  = String(row.student_id);
        const uid  = String(row.units_id);
        const tKey = `term${row.term}`;
        if (!r[sid])       r[sid]       = {};
        if (!r[sid][uid])  r[sid][uid]  = {};
        if (!r[sid][uid][tKey]) r[sid][uid][tKey] = {};
        r[sid][uid][tKey][row.grade_type] = +row.score;
        if (row.date) r[sid][uid][tKey].date = row.date;
    });
    return r;
}

function selectTerm(term) {
    S.currentTerm = term;
    document.querySelectorAll('.term-btn').forEach(b =>
        b.classList.toggle('active', +b.getAttribute('data-term') === term));
    _renderGradeInputs();
}

function selectGradeType(type) {
    S.currentGradeType = type;
    document.querySelectorAll('.grade-tab').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-type') === type) b.classList.add('active');
    });
    _renderGradeInputs();
}

function loadStudentsForGrading() {
    const sel = document.getElementById('subjectSelect');
    S.currentUnitId = sel.value ? +sel.value : null;
    _renderGradeInputs();
}

function _renderGradeInputs() {
    const container = document.getElementById('studentsGradesList');
    if (!S.currentUnitId) {
        container.innerHTML = '<div class="att-empty"><i class="fas fa-clipboard-list"></i>درس را انتخاب کنید</div>';
        document.querySelector('.save-grades-btn').style.display = 'none';
        return;
    }

    const maxGrade = 20;
    const tKey     = `term${S.currentTerm}`;
    const uid      = String(S.currentUnitId);
    container.innerHTML = '';

    S.students.forEach(st => {
        const sid      = String(st.id);
        const existing = S.scores[sid]?.[uid]?.[tKey]?.[S.currentGradeType] ?? '';

        const item = document.createElement('div');
        item.className = 'student-grade-item';
        item.innerHTML = `
            <div class="student-avatar-small">${(st.first_name || '؟').charAt(0)}</div>
            <div class="student-grade-info">
                <div class="student-grade-name">${st.full_name}</div>
                <div class="student-grade-code">کد ملی: ${st.national_code || '—'}</div>
            </div>
            <div class="grade-input-wrapper">
                <input type="text" 
                    class="grade-input"
                    inputmode="decimal"
                    placeholder="—" 
                    value="${existing}"
                    data-student="${sid}"
                    oninput="validateGradeInput(this)"
                    onblur="formatGradeInput(this)"
                    onkeydown="return validateGradeKey(event, this)">
                <span class="grade-max">/ ${maxGrade}</span>
            </div>`;
        container.appendChild(item);
    });

    document.querySelector('.save-grades-btn').style.display = 'flex';
}

async function saveGrades() {
    if (!S.classId || !S.currentUnitId) {
        toast('کلاس و درس را انتخاب کنید', 'warning');
        return;
    }

    const jalaliDate = document.getElementById('gradeDate')?.value || '';
    if (!jalaliDate) {
        toast('تاریخ را وارد کنید', 'warning');
        return;
    }

    const date = convertDateToGregorian(jalaliDate);

    const records = [];
    let hasInvalidScore = false;
    let firstInvalidInput = null;
    
    document.querySelectorAll('.grade-input').forEach(inp => {
        let val = inp.value.trim();
        
        if (val === '' || val === null || val === undefined) {
            return;
        }
        
        val = val.replace(/\//g, '.');
        val = val.replace(/[^\d.]/g, '');
        
        let score = parseFloat(val);
        
        if (isNaN(score)) {
            hasInvalidScore = true;
            inp.style.borderColor = '#e74c3c';
            inp.style.background = 'rgba(231,76,60,.15)';
            if (!firstInvalidInput) firstInvalidInput = inp;
            return;
        }
        
        if (score > 20) {
            score = 20;
        }
        
        if (score < 0) {
            score = 0;
        }
        
        score = Math.round(score / 0.25) * 0.25;
        score = Math.min(20, Math.max(0, score));
        
        let remainder = score % 0.25;
        if (Math.abs(remainder) > 0.001) {
            hasInvalidScore = true;
            inp.style.borderColor = '#e74c3c';
            inp.style.background = 'rgba(231,76,60,.15)';
            if (!firstInvalidInput) firstInvalidInput = inp;
            return;
        }
        
        inp.style.borderColor = '#2ecc71';
        inp.style.background = 'rgba(46,204,113,.1)';
        
        let displayValue = score % 1 === 0 ? score.toString() : score.toFixed(2);
        inp.value = displayValue;
        
        records.push({
            student_id: +inp.getAttribute('data-student'),
            score: score
        });
    });

    if (hasInvalidScore) {
        toast('لطفاً نمرات نامعتبر را اصلاح کنید. نمره باید بین 0 تا 20 و مضرب 0.25 باشد', 'error');
        if (firstInvalidInput) {
            firstInvalidInput.focus();
            firstInvalidInput.select();
        }
        return;
    }

    if (!records.length) {
        toast('حداقل یک نمره وارد کنید', 'warning');
        return;
    }

    const btn = document.querySelector('.save-grades-btn');
    if (btn) { 
        btn.disabled = true; 
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; 
    }

    try {
        await apiFetch('POST', {}, {
            action:     'save_scores',
            class_id:   +S.classId,
            unit_id:    +S.currentUnitId,
            term:       S.currentTerm,
            grade_type: S.currentGradeType,
            date,
            records,
        });
        toast('نمرات با موفقیت ثبت شد ✓', 'success');
        
        document.querySelectorAll('.grade-input').forEach(inp => {
            inp.style.borderColor = '';
            inp.style.background = '';
        });
        
        const scRes = await apiFetch('GET', { action: 'scores', class_id: S.classId });
        S.scores = _parseScores(scRes.data || []);
        _renderGradeInputs();
        _loadClassAvg(S.classId);
        closeEnterGradesModal();
    } catch (err) {
        toast('خطا: ' + err.message, 'error');
    } finally {
        if (btn) { 
            btn.disabled = false; 
            btn.innerHTML = '<i class="fas fa-save"></i> ثبت نمرات'; 
        }
    }
}
async function openViewGradesModal(classId) {
    S.cls     = _findCls(classId);
    S.classId = classId;
    if (!S.cls) return;

    document.getElementById('viewGradesModalTitle').textContent =
        `مشاهده نمرات — کلاس ${S.cls.code} | ${S.cls.grade || ''} ${S.cls.field || ''}`;
    document.getElementById('viewGradesModal').classList.add('active');
    _showViewSkeleton();

    try {
        const [sRes, stRes, lRes] = await Promise.all([
            apiFetch('GET', { action: 'class_stats', class_id: classId }),
            apiFetch('GET', { action: 'students',    class_id: classId }),
            apiFetch('GET', { action: 'lessons',     class_id: classId }),
        ]);
        S.students = stRes.data || [];
        S.lessons  = lRes.data || [];
        const statsRows = sRes.data || [];
        _renderViewSummary(statsRows);
        _renderViewTable(statsRows);
    } catch (err) {
        toast('خطا: ' + err.message, 'error');
    }
}

function _showViewSkeleton() {
    const b = document.getElementById('gradesListBody');
    if (!b) return;
    b.innerHTML = Array(5).fill(0).map(() => `
        <div class="sk-row" style="display:grid;grid-template-columns:55px 140px 1fr 110px 130px;gap:10px;padding:12px 10px">
            ${Array(5).fill('<div class="sk sk-tx" style="height:14px"></div>').join('')}
        </div>`).join('');
}

function _renderViewSummary(rows) {
    let excellent = 0, good = 0, average = 0, weak = 0;
    rows.forEach(r => {
        const avg = +r.avg_score;
        if (avg >= 18)      excellent++;
        else if (avg >= 15) good++;
        else if (avg >= 12) average++;
        else if (avg > 0)   weak++;
    });
    document.getElementById('excellentCount').textContent = excellent;
    document.getElementById('goodCount').textContent      = good;
    document.getElementById('averageCount').textContent   = average;
    document.getElementById('weakCount').textContent      = weak;
}

function _renderViewTable(rows) {
    const body = document.getElementById('gradesListBody');
    if (!body) return;
    body.innerHTML = '';
    if (!rows.length) {
        body.innerHTML = '<div class="att-empty"><i class="fas fa-inbox"></i>رکوردی یافت نشد</div>';
        return;
    }
    rows.forEach((st, i) => {
        const avg = +st.avg_score;
        let cls = 'grade-weak';
        if (avg >= 18)      cls = 'grade-excellent';
        else if (avg >= 15) cls = 'grade-good';
        else if (avg >= 12) cls = 'grade-average';

        const row = document.createElement('div');
        row.className = 'grades-list-row';
        row.innerHTML = `
            <div class="list-col">${i + 1}</div>
            <div class="list-col">${st.national_code || '—'}</div>
            <div class="list-col">${st.full_name}</div>
            <div class="list-col"><span class="grade-badge ${cls}">${avg > 0 ? avg.toFixed(2) : '—'}</span></div>
            <div class="list-col">
                <button class="btn-view-dashboard" onclick="openStudentDashboard(${st.student_id})">
                    <i class="fas fa-chart-line"></i> داشبورد
                </button>
            </div>`;
        body.appendChild(row);
    });
}

function closeViewGradesModal() {
    document.getElementById('viewGradesModal').classList.remove('active');
    S.cls = null; S.classId = null;
}

function searchStudentGrades() {
    const q = (document.getElementById('studentGradesSearchInput')?.value || '').toLowerCase();
    document.querySelectorAll('.grades-list-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

async function openStudentDashboard(studentId) {
    S.calStudId = studentId;
    const t = todayJ();
    S.calYear  = t.year;
    S.calMonth = t.month;

    const student = S.students.find(s => +s.id === +studentId);
    if (!student) return;

    document.getElementById('studentDashboardTitle').textContent = `داشبورد — ${student.full_name}`;
    document.getElementById('studentAvatarLarge').textContent    = (student.first_name || '؟').charAt(0);
    document.getElementById('studentNameLarge').textContent      = student.full_name;
    document.getElementById('studentCodeLarge').textContent      = `کد ملی: ${student.national_code || '—'}`;
    document.getElementById('studentClassLarge').textContent     = `کلاس: ${S.cls?.code || ''} — ${S.cls?.grade || ''} ${S.cls?.field || ''}`;
    document.getElementById('studentDashboardModal').classList.add('active');

    if (!Object.keys(S.scores).length) {
        try {
            const scRes = await apiFetch('GET', { action: 'scores', class_id: S.classId });
            S.scores = _parseScores(scRes.data || []);
        } catch {}
    }

    const sid = String(studentId);
    const avg = _calcStudentAvg(S.scores[sid] || {});
    document.getElementById('overallAverage').textContent = avg > 0 ? avg.toFixed(2) : '—';

    const allAvgs = S.students
        .map(s => ({ id: String(s.id), avg: _calcStudentAvg(S.scores[String(s.id)] || {}) }))
        .sort((a, b) => b.avg - a.avg);
    const rank = allAvgs.findIndex(s => s.id === sid) + 1;
    document.getElementById('classRank').textContent = rank || '—';

    document.querySelectorAll('.dashboard-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    document.querySelectorAll('.dashboard-tab-content').forEach((c, i) => c.classList.toggle('active', i === 0));
    renderReportCard();
}

function closeStudentDashboardModal() {
    document.getElementById('studentDashboardModal').classList.remove('active');
    S.calStudId = null;
    Object.values(S.charts).forEach(c => c?.destroy?.());
    S.charts = {};
}

function switchDashboardTab(tabName) {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    event?.target?.closest('.dashboard-tab')?.classList.add('active');
    document.querySelectorAll('.dashboard-tab-content').forEach(c => c.classList.remove('active'));
    const map = { 'report-card': 'reportCardTab', 'monthly-progress': 'monthlyProgressTab', 'comparison': 'comparisonTab' };
    const el = document.getElementById(map[tabName]);
    if (el) {
        el.classList.add('active');
        if (tabName === 'report-card')           renderReportCard();
        else if (tabName === 'monthly-progress') renderMonthlyProgress();
        else if (tabName === 'comparison')       renderComparison();
    }
}

function _calcStudentAvg(studentGrades) {
    let total = 0, count = 0;
    Object.values(studentGrades).forEach(unitData => {
        const t1 = _termTotal(unitData.term1);
        const t2 = _termTotal(unitData.term2);
        if (t1 > 0 || t2 > 0) {
            total += (t1 > 0 && t2 > 0) ? (t1 + t2) / 2 : (t1 || t2);
            count++;
        }
    });
    return count > 0 ? total / count : 0;
}

function _termTotal(term) {
    if (!term) return 0;
    return (term.continuous || 0) + (term.midterm || 0) + (term.final || 0);
}

function renderReportCard() {
    const sid     = String(S.calStudId);
    const student = S.students.find(s => String(s.id) === sid);
    if (!student) return;

    const studentGrades = S.scores[sid] || {};
    let tableRows = '';
    let t1Total = 0, t2Total = 0, subjCount = 0;

    S.lessons.forEach(lesson => {
        const uid  = String(lesson.unit_id);
        const data = studentGrades[uid] || {};
        const t1c  = data.term1?.continuous || 0;
        const t1m  = data.term1?.midterm    || 0;
        const t1f  = data.term1?.final      || 0;
        const t1Sum = t1c + t1m + t1f;
        const t2c  = data.term2?.continuous || 0;
        const t2m  = data.term2?.midterm    || 0;
        const t2f  = data.term2?.final      || 0;
        const t2Sum = t2c + t2m + t2f;
        const yAvg = t1Sum > 0 && t2Sum > 0 ? ((t1Sum + t2Sum) / 2).toFixed(2)
                     : (t1Sum || t2Sum || '—');
        if (t1Sum > 0 || t2Sum > 0) { t1Total += t1Sum; t2Total += t2Sum; subjCount++; }

        tableRows += `<tr>
            <td>${lesson.name}</td>
            <td>${t1c || '—'}</td><td>${t1m || '—'}</td><td>${t1f || '—'}</td><td><strong>${t1Sum || '—'}</strong></td>
            <td>${t2c || '—'}</td><td>${t2m || '—'}</td><td>${t2f || '—'}</td><td><strong>${t2Sum || '—'}</strong></td>
            <td><strong>${yAvg}</strong></td>
        </tr>`;
    });

    const t1Avg = subjCount > 0 ? (t1Total / subjCount).toFixed(2) : '—';
    const t2Avg = subjCount > 0 ? (t2Total / subjCount).toFixed(2) : '—';
    const yAvg  = subjCount > 0 ? ((t1Total + t2Total) / (subjCount * 2)).toFixed(2) : '—';

    document.getElementById('reportCardContainer').innerHTML = `
        <div class="report-card-header">
            <div class="school-name">🏫 هنرستان فنی و حرفه‌ای</div>
            <div class="card-title">کارنامه تحصیلی سال 1404-1403</div>
        </div>
        <div class="report-card-student-info">
            <div class="info-item"><span class="info-item-label">نام:</span><span class="info-item-value">${student.full_name}</span></div>
            <div class="info-item"><span class="info-item-label">کد ملی:</span><span class="info-item-value">${student.national_code || '—'}</span></div>
            <div class="info-item"><span class="info-item-label">کلاس:</span><span class="info-item-value">${S.cls?.code || '—'}</span></div>
            <div class="info-item"><span class="info-item-label">پایه:</span><span class="info-item-value">${S.cls?.grade || '—'}</span></div>
            <div class="info-item"><span class="info-item-label">رشته:</span><span class="info-item-value">${S.cls?.field || '—'}</span></div>
        </div>
        <table class="grades-table">
            <thead>
                <tr>
                    <th rowspan="2">درس</th>
                    <th colspan="4">نیمسال اول</th>
                    <th colspan="4">نیمسال دوم</th>
                    <th rowspan="2">سالانه</th>
                </tr>
                <tr>
                    <th>مستمر(20)</th><th>میان‌ترم(20)</th><th>نهایی(20)</th><th>جمع</th>
                    <th>مستمر(20)</th><th>میان‌ترم(20)</th><th>نهایی(20)</th><th>جمع</th>
                </tr>
            </thead>
            <tbody>${tableRows || '<tr><td colspan="10" style="text-align:center;color:rgba(255,255,255,.4);padding:20px">نمره‌ای ثبت نشده</td></tr>'}</tbody>
        </table>
        <div class="report-card-footer">
            <div class="footer-item"><div class="footer-label">معدل نیمسال اول</div><div class="footer-value">${t1Avg}</div></div>
            <div class="footer-item"><div class="footer-label">معدل نیمسال دوم</div><div class="footer-value">${t2Avg}</div></div>
            <div class="footer-item"><div class="footer-label">معدل کل</div><div class="footer-value">${yAvg}</div></div>
        </div>`;
}

function printReportCard() {
    const content = document.getElementById('reportCardContainer').innerHTML;
    const win = window.open('', '', 'height=800,width=1000');
    win.document.write(`<html dir="rtl"><head><title>کارنامه</title>
    <style>
        body{font-family:Tahoma,sans-serif;padding:24px;background:#fff;color:#000}
        .report-card-header{text-align:center;margin-bottom:24px}
        .school-name{font-size:20px;font-weight:700;margin-bottom:6px}
        .card-title{font-size:16px;color:#3498db}
        .report-card-student-info{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;background:#f8f9fa;padding:14px;border-radius:8px}
        .info-item{display:flex;gap:6px}.info-item-label{color:#666}.info-item-value{font-weight:600}
        .grades-table{width:100%;border-collapse:collapse;margin-bottom:20px}
        .grades-table th{background:#3498db;color:#fff;padding:8px;text-align:center;border:1px solid #2980b9;font-size:11px}
        .grades-table td{padding:7px;text-align:center;border:1px solid #ddd;font-size:12px}
        .grades-table tbody tr:nth-child(even){background:#f8f9fa}
        .report-card-footer{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding-top:16px;border-top:2px solid #ddd}
        .footer-item{text-align:center}.footer-label{color:#666;font-size:11px;margin-bottom:4px}.footer-value{font-size:18px;font-weight:700}
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
}

function downloadReportCardPDF() {
    if (!window.html2pdf) { toast('کتابخانه PDF بارگذاری نشده', 'error'); return; }
    html2pdf().set({
        margin: 10, filename: `karname_${S.calStudId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(document.getElementById('reportCardContainer')).save();
}

function renderMonthlyProgress() {
    const t = todayJ();
    S.calYear  = t.year;
    S.calMonth = t.month;
    _updateMonthDisplay();
    _renderMonthlyGrades();
    _renderProgressChart();
}

function navigateMonth(dir) {
    S.calMonth += dir;
    if (S.calMonth < 1)  { S.calMonth = 12; S.calYear--; }
    if (S.calMonth > 12) { S.calMonth = 1;  S.calYear++; }
    _updateMonthDisplay();
    _renderMonthlyGrades();
    _renderProgressChart();
}

function _updateMonthDisplay() {
    const el = document.getElementById('currentMonthDisplay');
    if (el) el.textContent = `${PM[S.calMonth - 1]} ${S.calYear}`;
}

function _renderMonthlyGrades() {
    const sid = String(S.calStudId);
    const container = document.getElementById('monthlyGradesGrid');
    if (!container) return;
    container.innerHTML = '';
    let found = false;

    S.lessons.forEach(lesson => {
        const uid  = String(lesson.unit_id);
        const data = (S.scores[sid] || {})[uid] || {};
        ['term1', 'term2'].forEach(tKey => {
            const term = data[tKey];
            if (!term?.date) return;
            const [y, m] = (term.date || '').replace(/-/g, '/').split('/').map(Number);
            if (y !== S.calYear || m !== S.calMonth) return;
            found = true;
            const card = document.createElement('div');
            card.className = 'monthly-grade-card';
            card.innerHTML = `
                <div class="monthly-grade-header">
                    <div class="subject-name" style="font-weight:600;color:#fff;font-family:Vazirmatn,sans-serif">${lesson.name}</div>
                    <div class="grade-date" style="font-size:12px;color:rgba(255,255,255,.5);font-family:Vazirmatn,sans-serif">📅 ${term.date}</div>
                </div>
                <div class="monthly-grade-body">
                    <div class="grade-item"><div class="grade-item-label">مستمر</div><div class="grade-item-value">${term.continuous || '—'}</div></div>
                    <div class="grade-item"><div class="grade-item-label">میان‌ترم</div><div class="grade-item-value">${term.midterm || '—'}</div></div>
                    <div class="grade-item"><div class="grade-item-label">نهایی</div><div class="grade-item-value">${term.final || '—'}</div></div>
                </div>`;
            container.appendChild(card);
        });
    });

    if (!found) {
        container.innerHTML = '<div class="att-empty"><i class="fas fa-calendar-times"></i>نمره‌ای در این ماه ثبت نشده</div>';
    }
}

function _renderProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx || !window.Chart) return;
    S.charts.progress?.destroy();

    const sid    = String(S.calStudId);
    const labels = S.lessons.map(l => l.name);
    const t1Data = [], t2Data = [];

    S.lessons.forEach(lesson => {
        const uid  = String(lesson.unit_id);
        const data = (S.scores[sid] || {})[uid] || {};
        t1Data.push(_termTotal(data.term1) || null);
        t2Data.push(_termTotal(data.term2) || null);
    });

    S.charts.progress = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'نیمسال اول', data: t1Data, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,.1)', tension: 0.4, fill: true },
                { label: 'نیمسال دوم', data: t2Data, borderColor: '#2ecc71', backgroundColor: 'rgba(46,204,113,.1)', tension: 0.4, fill: true },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff', font: { family: 'Vazirmatn', size: 13 } } } },
            scales: {
                y: { beginAtZero: true, max: 60, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,.1)' } },
                x: { ticks: { color: '#fff', font: { family: 'Vazirmatn', size: 11 } }, grid: { color: 'rgba(255,255,255,.1)' } },
            }
        }
    });
}

function renderComparison() {
    const sid = String(S.calStudId);
    const studentGrades = S.scores[sid] || {};
    const classAvgs = {};

    S.lessons.forEach(lesson => {
        const uid = String(lesson.unit_id);
        let total = 0, count = 0;
        S.students.forEach(st => {
            const d  = (S.scores[String(st.id)] || {})[uid] || {};
            const t1 = _termTotal(d.term1), t2 = _termTotal(d.term2);
            if (t1 > 0 || t2 > 0) {
                total += (t1 > 0 && t2 > 0) ? (t1 + t2) / 2 : (t1 || t2);
                count++;
            }
        });
        classAvgs[uid] = count > 0 ? total / count : 0;
    });

    _renderRadarChart(studentGrades, classAvgs);
    _renderComparisonTable(studentGrades, classAvgs);
}

function _renderRadarChart(studentGrades, classAvgs) {
    const ctx = document.getElementById('radarChart');
    if (!ctx || !window.Chart) return;
    S.charts.radar?.destroy();

    const labels = S.lessons.map(l => l.name);
    const stData = [], clData = [];
    S.lessons.forEach(lesson => {
        const uid = String(lesson.unit_id);
        const d   = studentGrades[uid] || {};
        const t1  = _termTotal(d.term1), t2 = _termTotal(d.term2);
        stData.push((t1 > 0 && t2 > 0) ? (t1 + t2) / 2 : (t1 || t2 || 0));
        clData.push(classAvgs[uid] || 0);
    });

    S.charts.radar = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [
                { label: 'دانش‌آموز',      data: stData, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,.2)', pointBackgroundColor: '#3498db' },
                { label: 'میانگین کلاس', data: clData, borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,.2)',  pointBackgroundColor: '#e74c3c' },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff', font: { family: 'Vazirmatn', size: 13 } } } },
            scales: { r: { beginAtZero: true, max: 60, ticks: { color: '#fff' }, pointLabels: { color: '#fff', font: { family: 'Vazirmatn', size: 11 } }, grid: { color: 'rgba(255,255,255,.2)' } } }
        }
    });
}

function _renderComparisonTable(studentGrades, classAvgs) {
    const container = document.getElementById('comparisonTableContainer');
    if (!container) return;
    let rows = '';

    S.lessons.forEach(lesson => {
        const uid  = String(lesson.unit_id);
        const d    = studentGrades[uid] || {};
        const t1   = _termTotal(d.term1), t2 = _termTotal(d.term2);
        const sAvg = (t1 > 0 && t2 > 0) ? (t1 + t2) / 2 : (t1 || t2 || 0);
        const cAvg = classAvgs[uid] || 0;
        const diff = sAvg - cAvg;
        const cls  = diff >= 0 ? 'grade-good' : 'grade-weak';
        const sign = diff >= 0 ? '+' : '';

        rows += `<div class="comparison-table-row">
            <div>${lesson.name}</div>
            <div>${sAvg > 0 ? sAvg.toFixed(2) : '—'}</div>
            <div>${cAvg > 0 ? cAvg.toFixed(2) : '—'}</div>
            <div>${sAvg > 0 ? `<span class="grade-badge ${cls}">${sign + diff.toFixed(2)}</span>` : '—'}</div>
        </div>`;
    });

    container.innerHTML = `
        <div class="comparison-table-header">
            <div>درس</div><div>نمره دانش‌آموز</div><div>میانگین کلاس</div><div>اختلاف</div>
        </div>${rows}`;
}

async function openExamCalendarModal() {
    const t = todayJ();
    S.calYear  = t.year;
    S.calMonth = t.month;
    document.getElementById('examCalendarModal').classList.add('active');

    try {
        const evRes = await apiFetch('GET', { action: 'exam_events' });
        S.examEvents = evRes.data || [];

        const sel = document.getElementById('examEventClass');
        if (sel) {
            sel.innerHTML = '<option value="">— انتخاب کنید —</option>';
            S.classes.forEach(cls => {
                const o = document.createElement('option');
                o.value = cls.id;
                o.textContent = `کلاس ${cls.code} — ${cls.grade || ''}`;
                sel.appendChild(o);
            });
        }

        _updateExamCalendarDisplay();
        _renderExamCalendar();
        _renderUpcomingExams();
    } catch (err) {
        toast('خطا: ' + err.message, 'error');
    }
}

function closeExamCalendarModal() {
    document.getElementById('examCalendarModal').classList.remove('active');
}

function navigateExamCalendar(dir) {
    S.calMonth += dir;
    if (S.calMonth < 1)  { S.calMonth = 12; S.calYear--; }
    if (S.calMonth > 12) { S.calMonth = 1;  S.calYear++; }
    _updateExamCalendarDisplay();
    _renderExamCalendar();
}

function _updateExamCalendarDisplay() {
    const el = document.getElementById('examCalendarMonth');
    if (el) el.textContent = `${PM[S.calMonth - 1]} ${S.calYear}`;
}

function _renderExamCalendar() {
    const grid = document.getElementById('examDaysGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const total  = daysInM(S.calYear, S.calMonth);
    const fDow   = firstDow(S.calYear, S.calMonth);
    const today  = todayJ();

    for (let i = 0; i < fDow; i++) {
        const b = document.createElement('div');
        b.className = 'exam-day other-month';
        b.innerHTML = '<div class="exam-day-number" style="opacity:.2">—</div>';
        grid.appendChild(b);
    }

    for (let d = 1; d <= total; d++) {
        const ds    = jStr(S.calYear, S.calMonth, d);
        const isToday = S.calYear === today.year && S.calMonth === today.month && d === today.day;
        const wknd  = isWknd(S.calYear, S.calMonth, d);
        const dayExams = S.examEvents.filter(e => (e.date || '').replace(/-/g, '/') === ds);

        const cell = document.createElement('div');
        cell.className = 'exam-day';
        if (isToday) cell.classList.add('today');

        if (wknd) {
            cell.classList.add('weekend-day');
            cell.innerHTML = `<div class="exam-day-number">${d}</div><div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px">تعطیل</div>`;
        } else if (dayExams.length) {
            cell.classList.add('has-exam');
            cell.innerHTML = `<div class="exam-day-number">${d}</div><div class="exam-indicator"></div><div class="exam-count">${dayExams.length} آزمون</div>`;
            cell.addEventListener('click', () => {
                toast(`آزمون‌های ${ds}: ${dayExams.map(e => e.subject_name).join('، ')}`, 'info');
            });
        } else {
            cell.innerHTML = `<div class="exam-day-number">${d}</div>`;
        }
        grid.appendChild(cell);
    }
}

function _renderUpcomingExams() {
    const today = todayJ();
    const todayStr = jStr(today.year, today.month, today.day);
    const upcoming = S.examEvents
        .filter(e => (e.date || '') >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    const container = document.getElementById('upcomingExamsList');
    if (!container) return;

    if (!upcoming.length) {
        container.innerHTML = '<div class="att-empty"><i class="fas fa-calendar-check"></i>آزمون پیش‌رویی وجود ندارد</div>';
        return;
    }

    const typeText  = { midterm:'میان‌ترم', final:'نهایی', quiz:'آزمونک', project:'پروژه' };
    const statusTxt = { pending:'📅 برنامه‌ریزی شده', completed:'✅ برگزار شده', cancelled:'❌ لغو شده' };

    container.innerHTML = '';
    upcoming.forEach(exam => {
        const [y, m, d] = (exam.date || '').replace(/-/g, '/').split('/');
        const item = document.createElement('div');
        item.className = 'upcoming-exam-item';
        item.innerHTML = `
            <div class="exam-date-badge">
                <div class="exam-day-text">${d}</div>
                <div class="exam-month-text">${PM[parseInt(m) - 1] || ''}</div>
            </div>
            <div class="exam-info">
                <div class="exam-subject">
                    ${exam.subject_name || '—'}
                    <span class="exam-status-badge ${exam.status === 'pending' ? 'status-pending' : exam.status === 'completed' ? 'status-completed' : 'status-cancelled'}">${statusTxt[exam.status] || ''}</span>
                </div>
                <div class="exam-details">کلاس ${exam.class_code || '—'} | ⏰ ${exam.time || ''}${exam.description ? ' | ' + exam.description : ''}</div>
            </div>
            <div class="exam-type-badge exam-type-${exam.type}">${typeText[exam.type] || exam.type}</div>
            <div class="exam-actions-btns">
                <button class="exam-action-btn btn-toggle" onclick="toggleExamStatus(${exam.id})" title="تغییر وضعیت"><i class="fas fa-check"></i></button>
                <button class="exam-action-btn btn-edit"   onclick="editExamEvent(${exam.id})"    title="ویرایش"><i class="fas fa-edit"></i></button>
                <button class="exam-action-btn btn-delete" onclick="deleteExamEvent(${exam.id})"  title="حذف"><i class="fas fa-trash"></i></button>
            </div>`;
        container.appendChild(item);
    });
}

function openAddExamEventModal() {
    document.getElementById('addExamEventModal').removeAttribute('data-editing-id');
    document.getElementById('examEventSubject').innerHTML = '<option value="">— ابتدا کلاس را انتخاب کنید —</option>';
    document.getElementById('examEventType').value   = 'midterm';
    document.getElementById('examEventStatus').value = 'pending';
    document.getElementById('examEventDescription').value = '';
    document.getElementById('examEventTime').value   = '';
    const t = todayJ();
    document.getElementById('examEventDate').value   = jStr(t.year, t.month, t.day);
    document.querySelector('#addExamEventModal .modal-title').textContent = 'افزودن رویداد امتحانی';
    document.querySelector('.save-exam-event-btn').innerHTML = '<i class="fas fa-save"></i> ذخیره رویداد';
    document.getElementById('addExamEventModal').classList.add('active');
    setTimeout(() => {
        if (window.jalaliDatepicker)
            jalaliDatepicker.startWatch({ selector: '#examEventDate', closeAfterSelect: true, autoFill: false });
    }, 100);
}

function closeAddExamEventModal() {
    document.getElementById('addExamEventModal').classList.remove('active');
}

async function loadSubjectsForExam() {
    const classId = document.getElementById('examEventClass').value;
    const sel     = document.getElementById('examEventSubject');
    if (!classId) { sel.innerHTML = '<option value="">— ابتدا کلاس را انتخاب کنید —</option>'; return; }
    try {
        const res = await apiFetch('GET', { action: 'lessons', class_id: classId });
        sel.innerHTML = '<option value="">— انتخاب کنید —</option>';
        (res.data || []).forEach(l => {
            const o = document.createElement('option');
            o.value = l.lesson_id;
            o.textContent = l.name;
            sel.appendChild(o);
        });
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

async function saveExamEvent() {
    const classId   = document.getElementById('examEventClass').value;
    const lessonId  = document.getElementById('examEventSubject').value;
    const type      = document.getElementById('examEventType').value;
    const jalaliDate = document.getElementById('examEventDate').value;
    const time      = document.getElementById('examEventTime').value;
    const desc      = document.getElementById('examEventDescription').value;
    const status    = document.getElementById('examEventStatus').value;
    const editingId = document.getElementById('addExamEventModal').getAttribute('data-editing-id');

    if (!classId || !lessonId || !jalaliDate || !time) {
        toast('فیلدهای الزامی را کامل کنید', 'warning');
        return;
    }

    const date = convertDateToGregorian(jalaliDate);

    try {
        await apiFetch('POST', {}, {
            action: 'save_exam_event',
            id: editingId ? +editingId : 0,
            class_id: +classId, lesson_id: +lessonId,
            type, date, time, description: desc, status,
        });
        toast(editingId ? 'رویداد ویرایش شد' : 'رویداد ثبت شد', 'success');
        const evRes = await apiFetch('GET', { action: 'exam_events' });
        S.examEvents = evRes.data || [];
        closeAddExamEventModal();
        _renderExamCalendar();
        _renderUpcomingExams();
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

async function editExamEvent(id) {
    const exam = S.examEvents.find(e => +e.id === +id);
    if (!exam) return;
    document.getElementById('examEventClass').value = exam.class_id;
    await loadSubjectsForExam();
    setTimeout(() => {
        document.getElementById('examEventSubject').value     = exam.lesson_id;
        document.getElementById('examEventType').value        = exam.type;
        document.getElementById('examEventDate').value        = (exam.date || '').replace(/-/g, '/');
        document.getElementById('examEventTime').value        = exam.time;
        document.getElementById('examEventDescription').value = exam.description || '';
        document.getElementById('examEventStatus').value      = exam.status || 'pending';
    }, 150);
    document.getElementById('addExamEventModal').setAttribute('data-editing-id', id);
    document.querySelector('#addExamEventModal .modal-title').textContent = 'ویرایش رویداد';
    document.querySelector('.save-exam-event-btn').innerHTML = '<i class="fas fa-save"></i> ذخیره تغییرات';
    document.getElementById('addExamEventModal').classList.add('active');
    setTimeout(() => {
        if (window.jalaliDatepicker)
            jalaliDatepicker.startWatch({ selector: '#examEventDate', closeAfterSelect: true, autoFill: false });
    }, 100);
}

async function deleteExamEvent(id) {
    const exam = S.examEvents.find(e => +e.id === +id);
    if (!exam) return;
    if (!confirm(`حذف رویداد "${exam.subject_name}"؟`)) return;
    try {
        await apiFetch('POST', {}, { action: 'delete_exam_event', id });
        toast('رویداد حذف شد', 'success');
        const evRes = await apiFetch('GET', { action: 'exam_events' });
        S.examEvents = evRes.data || [];
        _renderExamCalendar();
        _renderUpcomingExams();
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

async function toggleExamStatus(id) {
    try {
        await apiFetch('POST', {}, { action: 'toggle_exam_status', id });
        const evRes = await apiFetch('GET', { action: 'exam_events' });
        S.examEvents = evRes.data || [];
        _renderExamCalendar();
        _renderUpcomingExams();
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

async function openStatsModal() {
    document.getElementById('overallStatsModal').classList.add('active');
    try {
        const res = await apiFetch('GET', { action: 'school_stats' });
        const d   = res.data || {};
        document.getElementById('totalStudentsCount').textContent = d.total_students || '—';
        document.getElementById('schoolAverage').textContent      = d.school_avg ? (+d.school_avg).toFixed(2) : '—';

        const distRes = await apiFetch('GET', { action: 'score_distribution' });
        _renderDistributionChart(distRes.data || {});
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

function closeStatsModal() {
    document.getElementById('overallStatsModal').classList.remove('active');
    S.charts.dist?.destroy();
}

function _renderDistributionChart(data) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx || !window.Chart) return;
    S.charts.dist?.destroy();
    S.charts.dist = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['عالی (18-20)', 'خوب (15-17.99)', 'متوسط (12-14.99)', 'ضعیف (<12)'],
            datasets: [{
                label: 'تعداد دانش‌آموزان',
                data: [data.excellent || 0, data.good || 0, data.average || 0, data.weak || 0],
                backgroundColor: ['rgba(46,204,113,.7)','rgba(52,152,219,.7)','rgba(243,156,18,.7)','rgba(231,76,60,.7)'],
                borderColor:     ['#2ecc71','#3498db','#f39c12','#e74c3c'],
                borderWidth: 2, borderRadius: 8,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#fff', font: { family: 'Vazirmatn' } }, grid: { color: 'rgba(255,255,255,.1)' } },
                x: { ticks: { color: '#fff', font: { family: 'Vazirmatn' } }, grid: { color: 'rgba(255,255,255,.1)' } },
            }
        }
    });
}

function validateGradeInput(input) {
    let value = input.value.trim();
    
    if (value === '' || value === '-') {
        input.value = '';
        input.style.borderColor = '';
        input.style.background = '';
        return;
    }
    
    value = value.replace(/[^\d.\/]/g, '');
    value = value.replace(/\//g, '.');
    
    let parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    let numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        input.style.borderColor = '#e74c3c';
        input.style.background = 'rgba(231,76,60,.15)';
        return;
    }
    
    if (numValue > 20) {
        numValue = 20;
        value = '20';
        input.value = value;
    }
    
    if (numValue < 0) {
        input.value = '0';
        input.style.borderColor = '';
        input.style.background = '';
        return;
    }
    
    let remainder = numValue % 0.25;
    if (Math.abs(remainder) > 0.001 && Math.abs(remainder - 0.25) > 0.001) {
        input.style.borderColor = '#e74c3c';
        input.style.background = 'rgba(231,76,60,.15)';
    } else {
        input.style.borderColor = '#2ecc71';
        input.style.background = 'rgba(46,204,113,.1)';
    }
}

function formatGradeInput(input) {
    let value = input.value.trim();
    
    if (value === '') {
        input.style.borderColor = '';
        input.style.background = '';
        return;
    }
    
    value = value.replace(/\//g, '.');
    let numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        input.value = '';
        input.style.borderColor = '';
        input.style.background = '';
        return;
    }
    
    if (numValue > 20) {
        numValue = 20;
    }
    
    if (numValue < 0) {
        numValue = 0;
    }
    
    let remainder = numValue % 0.25;
    if (Math.abs(remainder) > 0.001 && Math.abs(remainder - 0.25) > 0.001) {
        numValue = Math.round(numValue / 0.25) * 0.25;
        if (numValue > 20) numValue = 20;
        if (numValue < 0) numValue = 0;
    }
    
    let displayValue = numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
    input.value = displayValue;
    
    remainder = numValue % 0.25;
    if (Math.abs(remainder) > 0.001 && Math.abs(remainder - 0.25) > 0.001) {
        input.style.borderColor = '#e74c3c';
        input.style.background = 'rgba(231,76,60,.15)';
    } else {
        input.style.borderColor = '#2ecc71';
        input.style.background = 'rgba(46,204,113,.1)';
    }
}

function validateGradeKey(event, input) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        let value = parseFloat(input.value) || 0;
        value = Math.min(20, value + 0.25);
        value = Math.round(value / 0.25) * 0.25;
        let displayValue = value % 1 === 0 ? value.toString() : value.toFixed(2);
        input.value = displayValue;
        validateGradeInput(input);
        return false;
    }
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        let value = parseFloat(input.value) || 0;
        value = Math.max(0, value - 0.25);
        value = Math.round(value / 0.25) * 0.25;
        let displayValue = value % 1 === 0 ? value.toString() : value.toFixed(2);
        input.value = displayValue;
        validateGradeInput(input);
        return false;
    }
    
    if (event.key === 'e' || event.key === 'E') {
        event.preventDefault();
        return false;
    }
    
    return true;
}

async function exportGradesExcel() {
    if (!window.XLSX) { toast('کتابخانه Excel بارگذاری نشده', 'error'); return; }
    try {
        const wb = XLSX.utils.book_new();
        for (const cls of S.classes) {
            const scRes = await apiFetch('GET', { action: 'class_stats', class_id: cls.id });
            const rows  = [['ردیف', 'نام و نام خانوادگی', 'کد ملی', 'معدل']];
            (scRes.data || []).forEach((st, i) => {
                rows.push([i + 1, st.full_name, st.national_code || '—', (+st.avg_score || 0).toFixed(2)]);
            });
            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, ws, `کلاس ${cls.code}`);
        }
        XLSX.writeFile(wb, `grades_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast('فایل Excel دانلود شد', 'success');
    } catch (err) { toast('خطا: ' + err.message, 'error'); }
}

let _toastStyled = false;
function toast(msg, type = 'success') {
    if (!_toastStyled) {
        const s = document.createElement('style');
        s.textContent = `@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(-18px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
        document.head.appendChild(s); _toastStyled = true;
    }
    const clr = { success: '#27ae60', error: '#e74c3c', warning: '#f39c12', info: '#3498db' };
    const ico  = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const div  = document.createElement('div');
    div.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%);
        background:${clr[type] || clr.info};color:#fff;
        padding:13px 26px;border-radius:12px;z-index:100000;
        font-family:Vazirmatn,sans-serif;font-size:15px;font-weight:600;
        box-shadow:0 8px 30px rgba(0,0,0,.3);display:flex;align-items:center;
        gap:10px;animation:tIn .3s ease;white-space:nowrap;`;
    div.innerHTML = `<i class="fas ${ico[type] || ico.info}"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.transition = 'opacity .4s,transform .4s';
        div.style.opacity = '0';
        div.style.transform = 'translateX(-50%) translateY(-14px)';
        setTimeout(() => div.remove(), 400);
    }, 3000);
}




['enterGradesModal','viewGradesModal','studentDashboardModal',
 'examCalendarModal','addExamEventModal','overallStatsModal'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const link = document.querySelector('a[href*="grades"], a[href*="Grades"]');
    if (link) {
        link.classList.add('active');
        link.closest('.menu-item.has-submenu')?.classList.add('open', 'active');
    }
    init();
});