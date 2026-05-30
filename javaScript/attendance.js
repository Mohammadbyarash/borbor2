'use strict';

(function injectExtra() {
    if (document.getElementById('__attExtra')) return;
    const s = document.createElement('style');
    s.id = '__attExtra';
    s.textContent = `
    .status-btn { 
        border: 2px solid transparent; border-radius: 8px; padding: 8px 14px;
        cursor: pointer; font-family: Vazirmatn, sans-serif; font-size: 13px;
        font-weight: 600; transition: all .2s ease; background: rgba(255,255,255,.08);
        color: rgba(255,255,255,.6); display: inline-flex; align-items: center; gap: 6px;
    }
    .status-btn:hover { opacity: .85; transform: translateY(-1px); }
    .status-btn.active.present   { border-color:#2ecc71; background:#2ecc71; color:#fff; }
    .status-btn.active.absent    { border-color:#e74c3c; background:#e74c3c; color:#fff; }
    .status-btn.active.late      { border-color:#f39c12; background:#f39c12; color:#fff; }
    .status-btn.active.leave     { border-color:#3498db; background:#3498db; color:#fff; }
    .status-btn.active.expulsion { border-color:#9b59b6; background:#9b59b6; color:#fff; }

    .timeline-dot.present    { background:#2ecc71; border-color:#2ecc71; }
    .timeline-dot.absent     { background:#e74c3c; border-color:#e74c3c; }
    .timeline-dot.late       { background:#f39c12; border-color:#f39c12; }
    .timeline-dot.leave      { background:#3498db; border-color:#3498db; }
    .timeline-dot.expulsion  { background:#9b59b6; border-color:#9b59b6; }
    .timeline-status.present   { background:#2ecc71; color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; }
    .timeline-status.absent    { background:#e74c3c; color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; }
    .timeline-status.late      { background:#f39c12; color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; }
    .timeline-status.leave     { background:#3498db; color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; }
    .timeline-status.expulsion { background:#9b59b6; color:#fff; padding:2px 8px; border-radius:6px; font-size:12px; }

    .calendar-day.has-attendance.present   { border-color:#2ecc71; background:rgba(46,204,113,.15); }
    .calendar-day.has-attendance.absent    { border-color:#e74c3c; background:rgba(231,76,60,.15); }
    .calendar-day.has-attendance.late      { border-color:#f39c12; background:rgba(243,156,18,.15); }
    .calendar-day.has-attendance.leave     { border-color:#3498db; background:rgba(52,152,219,.15); }
    .calendar-day.has-attendance.expulsion { border-color:#9b59b6; background:rgba(155,89,182,.15); }

    #holidayNotice{
        background:linear-gradient(135deg,#e74c3c,#c0392b);
        color:#fff; padding:14px 20px; border-radius:10px;
        margin-bottom:20px; display:none;
        align-items:center; gap:12px;
        font-size:15px; font-weight:600; font-family:Vazirmatn,sans-serif;
        border:1.5px solid rgba(255,255,255,.25);
        box-shadow:0 6px 20px rgba(231,76,60,.35);
    }

    .sk-row{display:flex;align-items:center;gap:12px;padding:15px 20px;
        border-radius:10px;background:#1e2957;margin-bottom:10px;
        animation:skPulse 1.4s ease-in-out infinite;}
    .sk{border-radius:6px;background:rgba(255,255,255,.1);}
    .sk-av{width:45px;height:45px;border-radius:50%;flex-shrink:0;}
    .sk-tx{height:14px;flex:1;}
    .sk-btn{width:72px;height:36px;border-radius:8px;}
    @keyframes skPulse{0%,100%{opacity:.5}50%{opacity:1}}

    .student-attendance-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px; border-radius: 12px; background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08); margin-bottom: 10px;
        flex-wrap: wrap; gap: 12px;
    }
    .student-info-compact { display: flex; align-items: center; gap: 12px; min-width: 180px; }
    .student-avatar-compact {
        width: 44px; height: 44px; border-radius: 50%;
        background: linear-gradient(135deg,#3498db,#9b59b6);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 700; font-size: 18px; flex-shrink: 0;
    }
    .student-name-compact { font-weight: 600; font-size: 15px; color: #fff; font-family: Vazirmatn,sans-serif; }
    .student-code-compact { font-size: 12px; color: rgba(255,255,255,.5); margin-top:2px; font-family: Vazirmatn,sans-serif; }
    .attendance-status-buttons { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

    .btn-send-sms {
        background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
        color: rgba(255,255,255,.7); border-radius: 8px; padding: 8px 12px;
        cursor: pointer; transition: all .2s ease; font-size: 14px;
    }
    .btn-send-sms:hover { background: rgba(52,152,219,.3); color: #fff; }

    .att-empty{text-align:center;padding:40px 20px;
        color:rgba(255,255,255,.4);font-family:Vazirmatn,sans-serif;font-size:15px;}
    .att-empty i{font-size:48px;display:block;margin-bottom:16px;opacity:.4;}

    @media(max-width:768px){
        .attendance-status-buttons .status-btn{ flex:1; min-width:0; padding:7px 4px; font-size:11px; }
        .attendance-status-buttons .status-btn i { display:none; }
    }
    @media(max-width:480px){
        .attendance-status-buttons{ flex-wrap:wrap; }
        .attendance-status-buttons .status-btn{ min-width:calc(50% - 6px); }
    }

    .attendance-list-row {
        display: grid;
        grid-template-columns: 60px 140px 1fr 90px 90px 90px 110px 120px;
        align-items: center; padding: 12px 16px; border-radius: 8px;
        border-bottom: 1px solid rgba(255,255,255,.06);
        font-family: Vazirmatn,sans-serif; font-size: 14px; color: rgba(255,255,255,.85);
        gap: 8px;
    }
    .attendance-list-row:hover { background: rgba(255,255,255,.04); }
    .stat-present { color: #2ecc71; font-weight: 700; }
    .stat-absent  { color: #e74c3c; font-weight: 700; }
    .stat-excused { color: #f39c12; font-weight: 700; }
    .stat-percentage { font-weight: 700; }
    .btn-view-details {
        background: rgba(52,152,219,.2); border: 1px solid rgba(52,152,219,.4);
        color: #3498db; border-radius: 6px; padding: 5px 12px;
        cursor: pointer; font-family: Vazirmatn,sans-serif; font-size: 13px;
        transition: all .2s;
    }
    .btn-view-details:hover { background: rgba(52,152,219,.4); }

    .absent-student-card {
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 18px; border-radius: 10px; background: rgba(231,76,60,.1);
        border: 1px solid rgba(231,76,60,.25); margin-bottom: 10px;
        font-family: Vazirmatn,sans-serif;
    }
    .absent-student-info h4 { margin:0 0 4px; color:#fff; font-size:15px; }
    .absent-student-info p  { margin:0; color:rgba(255,255,255,.5); font-size:13px; }
    .absent-count { font-size:28px; font-weight:800; color:#e74c3c; }
    `;
    document.head.appendChild(s);
})();

let _pageLoaded  = false;
let _statsLoaded = false;

function tryHideLoader() {
    if (!_pageLoaded || !_statsLoaded) return;
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

const API_URL = '../api/attendance_api.php';

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

const S = {
    user:      null,
    classes:   [],
    cls:       null,
    schedId:   null,
    date:      '',
    students:  [],
    attMap:    {},
    schedules: [],
    calStudId: null,
    calYear:   0,
    calMonth:  0,
    chartInst: null,
};

const STATUS = {
    present:   { label:'حاضر',  icon:'fa-check',      cssCls:'present'   },
    absent:    { label:'غایب',  icon:'fa-times',      cssCls:'absent'    },
    late:      { label:'تأخیر', icon:'fa-clock',      cssCls:'late'      },
    leave:     { label:'مرخصی', icon:'fa-door-open',  cssCls:'leave'     },
    expulsion: { label:'اخراج', icon:'fa-user-slash', cssCls:'expulsion' },
};

const PM  = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const PWD = ['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
const DNM = {1:'شنبه',2:'یکشنبه',3:'دوشنبه',4:'سه‌شنبه',5:'چهارشنبه',6:'پنجشنبه'};

function todayJ() {
    try {
        if (typeof jalaali === 'undefined') {
            throw new Error('jalaali not loaded');
        }
        const n = new Date();
        const j = jalaali.toJalaali(n.getFullYear(), n.getMonth()+1, n.getDate());
        return { year:j.jy, month:j.jm, day:j.jd, dow: n.getDay()===6?0:n.getDay()+1 };
    } catch(e) {
        const n = new Date();
        return { 
            year: n.getFullYear(), 
            month: n.getMonth() + 1, 
            day: n.getDate(), 
            dow: n.getDay() 
        };
    }
}

function jStr(y,m,d){ return `${y}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`; }
function daysInM(y,m){ return m<=6?31:m<=11?30:29; }

function firstDow(y,m){
    try {
        const g=jalaali.toGregorian(y,m,1), dt=new Date(g.gy,g.gm-1,g.gd);
        return dt.getDay()===6?0:dt.getDay()+1;
    } catch(e) {
        return 0;
    }
}

function isWknd(y,m,d){
    try {
        const g=jalaali.toGregorian(y,m,d), dt=new Date(g.gy,g.gm-1,g.gd);
        const dw=dt.getDay()===6?0:dt.getDay()+1;
        return dw===5||dw===6;
    } catch(e) {
        return false;
    }
}

function showCurDate(){
    const t=todayJ(), el=document.getElementById('currentDateDisplay');
    if(el) el.textContent=`${PWD[t.dow]} ${t.day} ${PM[t.month-1]} ${t.year}`;
}

const HC={};

async function getHols(year) {
    if (HC[year]) return HC[year];
    HC[year] = {};
    return {};
}

async function checkHoliday(dateStr){
    if(!dateStr) return {is:false,name:''};
    const [y,m,d]=dateStr.split('/').map(Number);
    if(isWknd(y,m,d)) return {is:true,name:'آخر هفته'};
    const h=await getHols(y);
    return h[dateStr]?{is:true,name:h[dateStr]}:{is:false,name:''};
}

async function init(){
    try {
        showCurDate();
        setInterval(showCurDate,60000);
        
        if (typeof jalaali === 'undefined') {
            throw new Error('کتابخانه jalaali لود نشده است');
        }
        
        const res = await apiFetch('GET',{action:'classes'});
        S.user = {
            id:        res.user_id,
            name:      res.user_name,
            role:      res.user_role,
            isTeacher: res.is_teacher,
        };
        S.classes = res.data || [];

        const t = todayJ();
        getHols(t.year);
        getHols(t.year+1);

        renderClasses();
        _setAdminText();

        _statsLoaded = true;
        tryHideLoader();
        
    } catch(err) {
        _statsLoaded = true;
        tryHideLoader();
        toast('خطا در ارتباط با سرور: '+err.message,'error');
    }
}

function _setAdminText(){
    const el = document.querySelector('.admin-info');
    if(!el || !S.user) return;
    const rl = {teacher:'معلم',manager:'مدیر',owner:'مالک',assistant:'معاون'};
    el.textContent = `${rl[S.user.role]||S.user.role}: ${S.user.name}`;
}

function renderClasses(){
    const grid = document.getElementById('classesGrid');
    if(!grid) return;
    grid.innerHTML = '';
    if(!S.classes.length){
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
                <span class="class-grade">${cls.grade||''}</span>
            </div>
            <div class="class-info">
                <div class="info-row">
                    <span class="info-label">تعداد دانش‌آموزان:</span>
                    <span class="info-value">${cls.student_count} نفر</span>
                </div>
                <div class="info-row">
                    <span class="info-label">رشته:</span>
                    <span class="info-value">${cls.field||'—'}</span>
                </div>
            </div>
            <div class="class-actions">
                <button class="btn btn-view-attendance" onclick="openViewModal(${cls.id})">
                    <i class="fas fa-eye"></i> مشاهده
                </button>
                <button class="btn btn-register-attendance" onclick="openRegisterModal(${cls.id})">
                    <i class="fas fa-clipboard-check"></i> ثبت حضور
                </button>
            </div>`;
        grid.appendChild(card);
    });
}

function _findCls(id){ return S.classes.find(c=>c.id===id)||null; }

async function openRegisterModal(classId){
    try {
        S.cls = _findCls(classId);
        if(!S.cls) {
            toast('کلاس یافت نشد', 'error');
            return;
        }
        
        document.getElementById('registerModalTitle').textContent =
            `ثبت حضور — کلاس ${S.cls.code} | ${S.cls.grade||''} ${S.cls.field||''}`;
        
        const t = todayJ();
        S.date = jStr(t.year, t.month, t.day);
        const dInp = document.getElementById('attendanceDate');
        if(dInp) dInp.value = S.date;
        
        _updateDayDisplay();
        
        const hol = await checkHoliday(S.date);
        _showHolidayNotice(hol);
        
        document.getElementById('registerAttendanceModal')?.classList.add('active');
        _showSkeleton();
        
        const [sRes, stRes] = await Promise.all([
            apiFetch('GET',{action:'schedules', class_id:classId}),
            apiFetch('GET',{action:'students',  class_id:classId}),
        ]);
        
        S.schedules = sRes.data || [];
        S.students  = stRes.data || [];
        
        _buildSchedSelect();
        
        if(S.schedId) {
            await _loadAtt();
        }
        
        renderStudentList();
        
        setTimeout(()=>{
            if(window.jalaliDatepicker){
                try {
                    jalaliDatepicker.startWatch({
                        selector:'#attendanceDate',
                        closeAfterSelect:true,
                        autoFill:false
                    });
                } catch(e) {
                    console.warn('jalaliDatepicker error:', e);
                }
            }
        }, 200);
        
    } catch(err) {
        console.error('Error in openRegisterModal:', err);
        toast('خطا در بارگذاری: '+err.message,'error');
    }
}

function closeRegisterAttendanceModal(){
    document.getElementById('registerAttendanceModal')?.classList.remove('active');
    S.cls=null; S.schedId=null; S.students=[]; S.attMap={};
}

function _showSkeleton(){
    const c = document.getElementById('studentsAttendanceList');
    if(!c) return;
    c.innerHTML = Array(5).fill(0).map(()=>`
        <div class="sk-row">
            <div class="sk sk-av"></div>
            <div class="sk sk-tx"></div>
            <div class="sk sk-btn"></div>
            <div class="sk sk-btn"></div>
            <div class="sk sk-btn"></div>
        </div>`).join('');
}

function _buildSchedSelect(){
    const sel = document.getElementById('attendancePeriod');
    if(!sel) return;
    sel.innerHTML = '<option value="">— انتخاب زنگ —</option>';
    S.schedules.forEach(s=>{
        const day  = DNM[s.day_of_week]||'—';
        const time = `${(s.time_start||'').slice(0,5)}–${(s.time_end||'').slice(0,5)}`;
        const opt  = document.createElement('option');
        opt.value  = s.schedule_id;
        opt.textContent = `${day} | ${s.lesson_name} | ${time}`;
        sel.appendChild(opt);
    });
    if(S.schedules.length === 1) sel.selectedIndex = 1;
    S.schedId = sel.value ? +sel.value : null;
}

async function onScheduleChange(){
    const sel = document.getElementById('attendancePeriod');
    S.schedId = sel?.value ? +sel.value : null;
    if(!S.schedId) return;
    _showSkeleton();
    await _loadAtt();
    renderStudentList();
}

async function onDateChange(){
    const inp = document.getElementById('attendanceDate');
    S.date = inp?.value||'';
    _updateDayDisplay();
    const hol = await checkHoliday(S.date);
    _showHolidayNotice(hol);
    if(!hol.is && S.schedId){
        _showSkeleton();
        await _loadAtt();
        renderStudentList();
    }
}

function _updateDayDisplay(){
    const el = document.getElementById('selectedDayDisplay');
    if(!el||!S.date) return;
    try{
        const [y,m,d] = S.date.split('/').map(Number);
        const g  = jalaali.toGregorian(y,m,d);
        const dt = new Date(g.gy,g.gm-1,g.gd);
        el.textContent = PWD[dt.getDay()===6?0:dt.getDay()+1];
    }catch{ el.textContent=''; }
}

function _showHolidayNotice(hol){
    let n = document.getElementById('holidayNotice');
    if(!n){
        n = document.createElement('div');
        n.id = 'holidayNotice';
        document.querySelector('.date-selection-section')?.after(n);
    }
    if(hol.is){
        n.innerHTML = `<i class="fas fa-exclamation-triangle"></i> این روز تعطیل است (${hol.name}) — ثبت حضور ممکن نیست`;
        n.style.display = 'flex';
        _setFormDis(true);
    }else{
        n.style.display = 'none';
        _setFormDis(false);
    }
}

function _setFormDis(dis){
    document.querySelectorAll(
        '#attendancePeriod,.quick-action-btn,.save-attendance-btn,.status-btn,.btn-send-sms'
    ).forEach(el=>{
        el.disabled = dis;
        el.style.opacity = dis?'0.45':'';
        el.style.cursor  = dis?'not-allowed':'';
    });
}

async function _loadAtt(){
    if(!S.cls||!S.schedId||!S.date){ S.attMap={}; return; }
    try{
        const r = await apiFetch('GET',{
            action: 'attendance',
            class_id: S.cls.id,
            schedule_id: S.schedId,
            date: S.date,
        });
        S.attMap = r.data || {};
    }catch{ S.attMap={}; }
}

function renderStudentList(){
    const c = document.getElementById('studentsAttendanceList');
    if(!c) return;
    c.innerHTML = '';
    if(!S.students.length){
        c.innerHTML = '<div class="att-empty"><i class="fas fa-users-slash"></i>دانش‌آموزی یافت نشد</div>';
        return;
    }
    S.students.forEach(st=>{
        const att       = S.attMap[st.id]||null;
        const curStatus = att?.status||null;
        const item = document.createElement('div');
        item.className = 'student-attendance-item';
        item.dataset.sid = st.id;
        const btns = Object.entries(STATUS).map(([key,cfg])=>{
            const active = curStatus === key;
            return `<button class="status-btn${active?' active '+cfg.cssCls:''}"
                        onclick="setStatus(${st.id},'${key}')"
                        data-status="${key}" title="${cfg.label}">
                        <i class="fas ${cfg.icon}"></i> ${cfg.label}
                    </button>`;
        }).join('');
        item.innerHTML = `
            <div class="student-info-compact">
                <div class="student-avatar-compact">${(st.first_name||'؟').charAt(0)}</div>
                <div class="student-details-compact">
                    <div class="student-name-compact">${st.full_name}</div>
                    <div class="student-code-compact">کد ملی: ${st.national_code||'—'}</div>
                </div>
            </div>
            <div class="attendance-status-buttons">
                ${btns}
                <button class="btn-send-sms" onclick="openSmsModal(${st.id})" title="پیامک">
                    <i class="fas fa-sms"></i>
                </button>
            </div>`;
        c.appendChild(item);
    });
}

function setStatus(studentId, status){
    if(!S.attMap[studentId]) S.attMap[studentId] = {status:null, attendance_id:null};
    S.attMap[studentId].status = status;
    const item = document.querySelector(`.student-attendance-item[data-sid="${studentId}"]`);
    if(!item) return;
    item.querySelectorAll('.status-btn').forEach(btn=>{
        const key = btn.dataset.status;
        const cfg = STATUS[key];
        btn.className = 'status-btn';
        if(key===status && cfg) btn.classList.add('active', cfg.cssCls);
    });
}

function markAllStudents(status){
    S.students.forEach(st => setStatus(st.id, status));
}

async function saveAttendance(){
    if(!S.cls||!S.schedId||!S.date){
        toast('تاریخ و زنگ را انتخاب کنید','warning'); return;
    }
    const hol = await checkHoliday(S.date);
    if(hol.is){ toast('روز تعطیل — ثبت ممکن نیست','error'); return; }
    const records = S.students
        .filter(st => S.attMap[st.id]?.status)
        .map(st => ({student_id: st.id, status: S.attMap[st.id].status}));
    if(!records.length){ toast('هیچ وضعیتی ثبت نشده','warning'); return; }
    const btn = document.querySelector('.save-attendance-btn');
    if(btn){ btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }
    try{
        await apiFetch('POST',{},{
            action:      'save_attendance',
            class_id:    S.cls.id,
            schedule_id: S.schedId,
            date:        S.date,
            records,
        });
        toast('حضور و غیاب با موفقیت ثبت شد ✓','success');

        const detailsModal = document.getElementById('studentAttendanceDetailsModal');
        if (detailsModal?.classList.contains('active') && S.calStudId && S.cls) {
            try {
                const r = await apiFetch('GET', {
                    action:     'student_history',
                    student_id: S.calStudId,
                    class_id:   S.cls.id,
                });
                const history = r.data || [];
                _renderStudentStats(history);
                _renderTimeline(history);
                await _renderCalendar(history);
            } catch(e) { }
        }

        closeRegisterAttendanceModal();
    }catch(err){
        toast('خطا: '+err.message,'error');
    }finally{
        if(btn){ btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> ثبت حضور و غیاب'; }
    }
}

async function openViewModal(classId){
    S.cls = _findCls(classId);
    if(!S.cls) return;
    document.getElementById('viewModalTitle').textContent = `مشاهده حضور — کلاس ${S.cls.code}`;
    document.getElementById('viewAttendanceModal')?.classList.add('active');
    const t = todayJ();
    const viewDateEl = document.getElementById('viewingDateDisplay');
    if(viewDateEl) viewDateEl.textContent = `${t.day} ${PM[t.month-1]} ${t.year}`;
    _showViewSkeleton();
    try{ await _loadViewData(); }catch(err){ toast('خطا: '+err.message,'error'); }
    setTimeout(()=>{
        if(window.jalaliDatepicker){
            jalaliDatepicker.startWatch({selector:'#filterStartDate',closeAfterSelect:true,autoFill:false});
            jalaliDatepicker.startWatch({selector:'#filterEndDate',closeAfterSelect:true,autoFill:false});
        }
    },100);
}

function _showViewSkeleton(){
    const b = document.getElementById('attendanceListBody');
    if(!b) return;
    b.innerHTML = Array(6).fill(0).map(()=>`
        <div class="sk-row" style="display:grid;grid-template-columns:60px 150px 1fr 90px 90px 90px 120px;gap:10px;padding:12px 10px;">
            ${Array(7).fill('<div class="sk sk-tx" style="height:14px;"></div>').join('')}
        </div>`).join('');
}

async function _loadViewData(from=null, to=null){
    if(!S.cls) return;
    const p = {action:'class_stats', class_id:S.cls.id};
    if(from) p.from_date = from;
    if(to)   p.to_date   = to;
    const res = await apiFetch('GET', p);
    _renderViewTable(res.data||[]);
    _updateSummary(res.data||[]);
}

function _updateSummary(data){
    let p=0, a=0, l=0;
    data.forEach(r=>{ p+=+r.present_count; a+=+r.absent_count; l+=+r.late_count; });
    document.getElementById('totalPresent').textContent = p;
    document.getElementById('totalAbsent').textContent  = a;
    document.getElementById('totalExcused').textContent = l;
}

function _renderViewTable(data){
    const body = document.getElementById('attendanceListBody');
    if(!body) return;
    body.innerHTML = '';
    if(!data.length){
        body.innerHTML = '<div class="att-empty"><i class="fas fa-inbox"></i>رکوردی یافت نشد</div>';
        return;
    }
    data.forEach((st, i)=>{
        const tot = +st.total_sessions||0;
        const pct = tot>0 ? Math.round((+st.present_count/tot)*100) : 0;
        const row = document.createElement('div');
        row.className = 'attendance-list-row';
        row.innerHTML = `
            <div class="list-col col-index">${i+1}</div>
            <div class="list-col col-code">${st.national_code||'—'}</div>
            <div class="list-col col-name">${st.full_name}</div>
            <div class="list-col col-present stat-present">${st.present_count}</div>
            <div class="list-col col-absent stat-absent">${st.absent_count}</div>
            <div class="list-col col-excused stat-excused">${st.late_count}</div>
            <div class="list-col col-percentage stat-percentage">${pct}%</div>
            <div class="list-col col-actions">
                <button class="btn-view-details" onclick="openStudentDetails(${st.student_id})">
                    <i class="fas fa-chart-line"></i> جزئیات
                </button>
            </div>`;
        body.appendChild(row);
    });
}

function closeViewAttendanceModal(){
    document.getElementById('viewAttendanceModal')?.classList.remove('active');
    S.cls = null;
}

async function applyDateFilter(){
    const from = document.getElementById('filterStartDate')?.value||'';
    const to   = document.getElementById('filterEndDate')?.value||'';
    _showViewSkeleton();
    try{ await _loadViewData(from||null, to||null); }
    catch(err){ toast('خطا: '+err.message,'error'); }
}

function resetDateFilter(){
    const s = document.getElementById('filterStartDate');
    const e = document.getElementById('filterEndDate');
    if(s) s.value=''; if(e) e.value='';
    _loadViewData();
}

function searchAttendanceStudents(){
    const q = (document.getElementById('studentSearchInput')?.value||'').toLowerCase();
    document.querySelectorAll('#attendanceListBody .attendance-list-row').forEach(row=>{
        row.style.display = row.textContent.toLowerCase().includes(q)?'':'none';
    });
}

async function openStudentDetails(studentId){
    if(!S.cls) return;
    document.getElementById('studentAttendanceDetailsModal')?.classList.add('active');
    S.calStudId = studentId;
    const t = todayJ();
    S.calYear  = t.year;
    S.calMonth = t.month;
    try{
        const histRes = await apiFetch('GET',{
            action:     'student_history',
            student_id: studentId,
            class_id:   S.cls.id,
        });
        const history = histRes.data||[];
        const st = (S.students.find(s=>s.id===studentId)) || {full_name:'دانش‌آموز',first_name:'د',national_code:''};
        document.getElementById('studentDetailsTitle').textContent = `جزئیات — ${st.full_name}`;
        document.getElementById('studentAvatarDetails').textContent = (st.first_name||'د').charAt(0);
        document.getElementById('studentNameDetails').textContent  = st.full_name;
        document.getElementById('studentCodeDetails').textContent  = `کد ملی: ${st.national_code||'—'}`;
        _renderStudentStats(history);
        _renderTimeline(history);
        await _renderCalendar(history);
    }catch(err){ toast('خطا: '+err.message,'error'); }
}

function _renderStudentStats(history){
    const c = {present:0, absent:0, late:0, leave:0, expulsion:0};
    history.forEach(r=>{ if(c[r.status]!==undefined) c[r.status]++; });
    document.getElementById('detailPresentCount').textContent = c.present;
    document.getElementById('detailAbsentCount').textContent  = c.absent;
    document.getElementById('detailExcusedCount').textContent = c.late + c.leave + c.expulsion;
}

function _renderTimeline(history){
    const c = document.getElementById('attendanceTimeline');
    if(!c) return;
    c.innerHTML = '';
    if(!history.length){
        c.innerHTML = '<p class="att-empty">رکوردی یافت نشد</p>'; return;
    }
    history.forEach(item=>{
        const cfg = STATUS[item.status]||{label:item.status, icon:'fa-circle'};
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <div class="timeline-dot ${item.status}"></div>
            <div class="timeline-content">
                <div class="timeline-date">${item.date} — ${DNM[item.day_of_week]||''}</div>
                <div class="timeline-info">${item.lesson_name||''} | ${(item.time_start||'').slice(0,5)}–${(item.time_end||'').slice(0,5)}</div>
                <span class="timeline-status ${item.status}">${cfg.label}</span>
            </div>`;
        c.appendChild(div);
    });
}

function closeStudentAttendanceDetailsModal(){
    document.getElementById('studentAttendanceDetailsModal')?.classList.remove('active');
    S.calStudId = null;
}

async function _renderCalendar(history){
    const y = S.calYear, m = S.calMonth;
    document.getElementById('calendarCurrentMonth').textContent = `${PM[m-1]} ${y}`;
    const dayMap = {};
    history.forEach(r=>{
        const dateKey = (r.date||'').replace(/-/g, '/');
        if(!dayMap[dateKey]) dayMap[dateKey]=[];
        dayMap[dateKey].push(r.status);
    });
    const hols  = await getHols(y);
    const total = daysInM(y,m);
    const fDow  = firstDow(y,m);
    const today = todayJ();
    const grid = document.getElementById('calendarDays');
    if(!grid) return;
    grid.innerHTML = '';
    for(let i=0; i<fDow; i++){
        const b = document.createElement('div');
        b.className = 'calendar-day other-month';
        b.innerHTML = '<div class="calendar-day-number" style="opacity:.2">—</div>';
        grid.appendChild(b);
    }
    for(let d=1; d<=total; d++){
        const ds       = jStr(y,m,d);
        const statuses = dayMap[ds]||[];
        const isToday  = y===today.year&&m===today.month&&d===today.day;
        const wknd     = isWknd(y,m,d);
        const holName  = hols[ds]||'';
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        if(isToday)  cell.classList.add('today');
        if(wknd||holName) cell.classList.add('weekend');
        let extra = '';
        if(statuses.length){
            cell.classList.add('has-attendance');
            const cnt = {};
            statuses.forEach(s=>{ cnt[s]=(cnt[s]||0)+1; });
            const dom = Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];
            cell.classList.add(dom);
            const cfg = STATUS[dom];
            extra = `<div class="calendar-day-status"><i class="fas ${cfg?.icon||'fa-circle'}" style="font-size:12px"></i></div>`;
        }else if(holName){
            extra = `<div class="calendar-day-info holiday-name">${holName.slice(0,6)}</div>`;
        }else if(wknd&&!isToday){
            extra = '<div class="calendar-day-info">تعطیل</div>';
        }
        cell.innerHTML = `<div class="calendar-day-number">${d}</div>${extra}`;
        if(holName) cell.title = holName;
        grid.appendChild(cell);
    }
}

async function navigateCalendarMonth(dir){
    S.calMonth += dir;
    if(S.calMonth<1){  S.calMonth=12; S.calYear--; }
    if(S.calMonth>12){ S.calMonth=1;  S.calYear++; }
    if(!S.calStudId||!S.cls) return;
    try{
        const r = await apiFetch('GET',{
            action:     'student_history',
            student_id: S.calStudId,
            class_id:   S.cls.id,
        });
        await _renderCalendar(r.data||[]);
    }catch{}
}

function openStatsModal(){
    document.getElementById('statsModal')?.classList.add('active');
    document.getElementById('statTotalClasses').textContent  = S.classes.length;
    document.getElementById('statTotalStudents').textContent =
        S.classes.reduce((s,c)=>s+(+c.student_count),0);
    document.getElementById('statTodayPresent').textContent = '—';
    document.getElementById('statTodayAbsent').textContent  = '—';
    _renderStatsChart();
}

function closeStatsModal(){
    document.getElementById('statsModal')?.classList.remove('active');
    if(S.chartInst){ S.chartInst.destroy(); S.chartInst=null; }
}

function _renderStatsChart(){
    const ctx = document.getElementById('attendanceChart');
    if(!ctx||!window.Chart) return;
    if(S.chartInst){ S.chartInst.destroy(); S.chartInst=null; }
    S.chartInst = new Chart(ctx,{
        type:'bar',
        data:{
            labels:   S.classes.map(c=>`کلاس ${c.code}`),
            datasets:[{
                label:'دانش‌آموز',
                data:  S.classes.map(c=>+c.student_count),
                backgroundColor:'rgba(52,152,219,.7)',
                borderColor:'#3498db',
                borderWidth:2,
                borderRadius:6,
            }]
        },
        options:{
            responsive:true, maintainAspectRatio:false,
            plugins:{
                legend:{labels:{color:'#fff',font:{family:'Vazirmatn'}}},
                tooltip:{backgroundColor:'rgba(0,0,0,.8)',titleFont:{family:'Vazirmatn'},bodyFont:{family:'Vazirmatn'}},
            },
            scales:{
                y:{beginAtZero:true,ticks:{color:'#fff',font:{family:'Vazirmatn'}},grid:{color:'rgba(255,255,255,.1)'}},
                x:{ticks:{color:'#fff',font:{family:'Vazirmatn',size:11},maxRotation:45},grid:{color:'rgba(255,255,255,.1)'}},
            }
        }
    });
}

function navigateChartMonth(dir){ _renderStatsChart(); }

let _smsStudId=null, _smsReason=null;
const _smsTpls = {absence:[], delay:[], leave:[]};
const _smsDefs = {
    absence:['با سلام، فرزند شما امروز غایب بوده است. لطفاً دلیل را اطلاع دهید.'],
    delay:  ['با سلام، فرزند شما امروز با تأخیر وارد مدرسه شده است.'],
    leave:  ['با سلام، امروز کلاس فرزند شما تعطیل بود.'],
};

function _loadTpls(){
    try{
        const s = localStorage.getItem('smsTpls');
        Object.assign(_smsTpls, s?JSON.parse(s):JSON.parse(JSON.stringify(_smsDefs)));
    }catch{ Object.assign(_smsTpls,JSON.parse(JSON.stringify(_smsDefs))); }
}
function _saveTpls(){ try{ localStorage.setItem('smsTpls',JSON.stringify(_smsTpls)); }catch{} }

function openSmsModal(studentId){
    _smsStudId = studentId;
    const st   = S.students.find(s=>s.id===studentId);
    _openSmsDialog(
        (st?.first_name||'؟').charAt(0),
        st?.full_name||'دانش‌آموز',
        `کد ملی: ${st?.national_code||'—'}`
    );
}

function openGroupSmsModal(){
    _smsStudId = null;
    _openSmsDialog(
        '<i class="fas fa-users"></i>',
        `کلاس ${S.cls?.code||''} — گروهی`,
        `${S.students.length} دانش‌آموز`
    );
}

function _openSmsDialog(avatar, name, sub){
    _loadTpls(); _smsReason=null;
    const info = document.getElementById('smsStudentInfo');
    if(info) info.innerHTML=`
        <div class="sms-student-avatar">${avatar}</div>
        <div class="sms-student-details">
            <div class="sms-student-name">${name}</div>
            <div class="sms-student-code">${sub}</div>
        </div>`;
    const ta = document.getElementById('smsMessage');
    if(ta) ta.value='';
    document.querySelectorAll('.sms-reason-btn').forEach(b=>b.classList.remove('active'));
    _renderQuickMsgs();
    updateCharCount();
    document.getElementById('smsModal')?.classList.add('active');
}

function closeSmsModal(){
    document.getElementById('smsModal')?.classList.remove('active');
    _smsStudId=null; _smsReason=null;
}

function selectSmsReason(reason){
    _smsReason = reason;
    document.querySelectorAll('.sms-reason-btn').forEach(b=>{
        b.classList.toggle('active', b.dataset.reason===reason);
    });
    _renderQuickMsgs();
}

function _renderQuickMsgs(){
    const g = document.getElementById('smsQuickGrid');
    if(!g) return;
    g.innerHTML='';
    if(!_smsReason){
        g.innerHTML='<div class="sms-no-quick-messages">ابتدا دلیل ارسال را انتخاب کنید</div>';
        return;
    }
    const tpls = _smsTpls[_smsReason]||[];
    if(!tpls.length){
        g.innerHTML='<div class="sms-no-quick-messages">پیام سریعی ذخیره نشده</div>'; return;
    }
    tpls.forEach((t,i)=>{
        const item = document.createElement('div');
        item.className = 'sms-quick-item';
        item.innerHTML = `
            <i class="fas fa-comment sms-quick-icon"></i>
            <div class="sms-quick-text">${t}</div>
            <button class="sms-quick-delete" onclick="event.stopPropagation();deleteTpl(${i})">
                <i class="fas fa-trash"></i>
            </button>`;
        item.addEventListener('click',()=>{
            const ta = document.getElementById('smsMessage');
            if(ta){ ta.value=t; updateCharCount(); }
        });
        g.appendChild(item);
    });
}

function deleteTpl(i){
    if(!_smsReason) return;
    if(confirm('این پیام حذف شود؟')){
        _smsTpls[_smsReason].splice(i,1);
        _saveTpls(); _renderQuickMsgs();
        toast('پیام حذف شد','success');
    }
}

function updateCharCount(){
    const ta  = document.getElementById('smsMessage');
    const el  = document.getElementById('smsCharCount');
    const n   = ta?.value.length||0;
    if(el){ el.textContent=n; el.style.color=n>300?'#e74c3c':'#e67e22'; }
}

function saveSmsTemplate(){
    const msg = document.getElementById('smsMessage')?.value.trim();
    if(!msg){ toast('متن را وارد کنید','warning'); return; }
    if(!_smsReason){ toast('دلیل را انتخاب کنید','warning'); return; }
    if(msg.length>300){ toast('متن نباید بیش از ۳۰۰ کاراکتر باشد','warning'); return; }
    if(_smsTpls[_smsReason]?.includes(msg)){ toast('این پیام قبلاً ذخیره شده','warning'); return; }
    if(!_smsTpls[_smsReason]) _smsTpls[_smsReason]=[];
    _smsTpls[_smsReason].push(msg);
    _saveTpls(); _renderQuickMsgs();
    toast('پیام ذخیره شد','success');
}

function sendSms(){
    const msg = document.getElementById('smsMessage')?.value.trim();
    if(!msg){ toast('متن پیامک را وارد کنید','warning'); return; }
    if(!_smsReason){ toast('دلیل ارسال را انتخاب کنید','warning'); return; }
    if(_smsStudId){
        const st = S.students.find(s=>s.id===_smsStudId);
        toast(`پیامک به ${st?.full_name||'دانش‌آموز'} ارسال شد`,'success');
    }else{
        toast(`پیامک گروهی به ${S.students.length} نفر ارسال شد`,'success');
    }
    closeSmsModal();
}

function openAdvancedReportsModal(){
    document.getElementById('advancedReportsModal')?.classList.add('active');
    _loadAbsentReport();
}
function closeAdvancedReportsModal(){
    document.getElementById('advancedReportsModal')?.classList.remove('active');
}
function switchReportTab(name){
    document.querySelectorAll('.report-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.report-content').forEach(c=>c.classList.remove('active'));
    event.target.closest('.report-tab').classList.add('active');
    document.getElementById(name+'Report')?.classList.add('active');
    if(name==='absent') _loadAbsentReport();
}

function generateComparisonReport(){ }

async function _loadAbsentReport(){
    const thr  = +(document.getElementById('absentThreshold')?.value||3);
    const from = document.getElementById('absentStartDate')?.value||'';
    const to   = document.getElementById('absentEndDate')?.value||'';
    try{
        const p = {action:'absent_report', threshold:thr};
        if(from) p.from_date=from;
        if(to)   p.to_date=to;
        const res = await apiFetch('GET',p);
        const c   = document.getElementById('absentStudentsList');
        if(!c) return;
        c.innerHTML='';
        if(!res.data?.length){
            c.innerHTML='<p class="att-empty"><i class="fas fa-check-circle"></i>دانش‌آموزی با این آستانه غیبت یافت نشد</p>'; return;
        }
        res.data.forEach(st=>{
            const card = document.createElement('div');
            card.className='absent-student-card';
            card.innerHTML=`
                <div class="absent-student-info">
                    <h4>${st.full_name}</h4>
                    <p>کلاس ${st.class_code} | ${st.grade||''} ${st.field||''}</p>
                </div>
                <div class="absent-count">${st.absent_count}</div>`;
            c.appendChild(card);
        });
    }catch(err){ toast('خطا: '+err.message,'error'); }
}

function generateAbsentReport(){ _loadAbsentReport(); }

async function exportAttendanceExcel(){
    if(!window.XLSX){ toast('کتابخانه Excel بارگذاری نشده','error'); return; }
    if(!S.cls){ toast('ابتدا یک کلاس را باز کنید','warning'); return; }
    try{
        const res  = await apiFetch('GET',{action:'class_stats', class_id:S.cls.id});
        const rows = [['ردیف','نام','کد ملی','حاضر','غایب','تأخیر','مرخصی','اخراج','کل']];
        (res.data||[]).forEach((st,i)=>{
            rows.push([
                i+1, st.full_name, st.national_code,
                st.present_count, st.absent_count, st.late_count,
                st.leave_count, st.expulsion_count||0, st.total_sessions,
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `کلاس ${S.cls.code}`);
        XLSX.writeFile(wb, `attendance_${S.cls.code}.xlsx`);
        toast('فایل Excel دانلود شد','success');
    }catch(err){ toast('خطا: '+err.message,'error'); }
}

let _toastStyled=false;
function toast(msg, type='success'){
    if(!_toastStyled){
        const s=document.createElement('style');
        s.textContent=`@keyframes tIn{from{opacity:0;transform:translateX(-50%) translateY(-18px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
        document.head.appendChild(s); _toastStyled=true;
    }
    const clr={success:'#27ae60',error:'#e74c3c',warning:'#f39c12',info:'#3498db'};
    const ico={success:'fa-check-circle',error:'fa-times-circle',warning:'fa-exclamation-triangle',info:'fa-info-circle'};
    const div=document.createElement('div');
    div.style.cssText=`position:fixed;top:24px;left:50%;transform:translateX(-50%);
        background:${clr[type]||clr.info};color:#fff;
        padding:13px 26px;border-radius:12px;z-index:100000;
        font-family:Vazirmatn,sans-serif;font-size:15px;font-weight:600;
        box-shadow:0 8px 30px rgba(0,0,0,.3);display:flex;align-items:center;
        gap:10px;animation:tIn .3s ease;white-space:nowrap;`;
    div.innerHTML=`<i class="fas ${ico[type]||ico.info}"></i> ${msg}`;
    document.body.appendChild(div);
    setTimeout(()=>{
        div.style.transition='opacity .4s,transform .4s';
        div.style.opacity='0';
        div.style.transform='translateX(-50%) translateY(-14px)';
        setTimeout(()=>div.remove(),400);
    },3000);
}

document.getElementById('menuToggle')?.addEventListener('click',()=>{
    document.getElementById('sidebar')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
});
document.getElementById('sidebarOverlay')?.addEventListener('click',()=>{
    document.getElementById('sidebar')?.classList.remove('active');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
});

['registerAttendanceModal','viewAttendanceModal','studentAttendanceDetailsModal',
 'statsModal','smsModal','advancedReportsModal','editAttendanceModal']
.forEach(id=>{
    document.getElementById(id)?.addEventListener('click',function(e){
        if(e.target===this) this.classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded',()=>{
    const link = document.querySelector('a[href*="Attendance"]');
    if(link){
        link.classList.add('active');
        link.closest('.menu-item.has-submenu')?.classList.add('open','active');
    }
    document.addEventListener('change',e=>{
        if(e.target.id==='attendanceDate') onDateChange();
    });
    document.getElementById('attendancePeriod')?.addEventListener('change', onScheduleChange);
    document.getElementById('smsMessage')?.addEventListener('input', updateCharCount);
    init();
});