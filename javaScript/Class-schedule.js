// Hamburger Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// ==================== STATE ====================
var API          = '../api/classes.php';
var classes      = [];
var lessons      = [];
var teachers     = [];
var fields       = [];
var grades       = [];
var currentClass = null;
var classToDelete= null;
var days         = ['شنبه','یکشنبه','دوشنبه','سه شنبه','چهارشنبه','پنجشنبه'];
var dayNumbers   = {'شنبه':1,'یکشنبه':2,'دوشنبه':3,'سه شنبه':4,'چهارشنبه':5,'پنجشنبه':6};

// ==================== LOADER ====================
function showLoader() {
    var existing = document.getElementById('pageLoader'); if (existing) return;
    var loader = document.createElement('div'); loader.id = 'pageLoader';
    loader.innerHTML = '<div class="loader-spinner"></div><div class="loader-text">در حال بارگذاری...</div><div class="loader-sub">در حال دریافت اطلاعات...</div>';
    loader.style.cssText = 'position:fixed;inset:0;background:#0f1b3d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:18px;transition:opacity 0.5s ease;';
    var style = document.createElement('style');
    style.textContent = '.loader-spinner{width:58px;height:58px;border:5px solid rgba(255,255,255,0.12);border-top-color:#4da3ff;border-radius:50%;animation:spin 0.85s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.loader-text{color:#c8d8f0;font-family:Vazirmatn,sans-serif;font-size:15px}.loader-sub{color:#6a8ab0;font-family:Vazirmatn,sans-serif;font-size:12px;margin-top:-8px}#pageLoader.hide{opacity:0;pointer-events:none}';
    document.head.appendChild(style); document.body.appendChild(loader);
}
function hideLoader() {
    var loader = document.getElementById('pageLoader'); if (!loader) return;
    loader.classList.add('hide');
    setTimeout(function() { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 550);
}

// ==================== TOAST ====================
function showToast(msg, type) {
    type = type || 'success';
    var existing = document.getElementById('csToast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'csToast';
    var bg = type==='error'?'#e74c3c':type==='info'?'#3498db':'#27ae60';
    t.style.cssText = 'position:fixed;top:20px;right:20px;background:'+bg+';color:#fff;padding:14px 24px;border-radius:10px;z-index:10000;font-family:Vazirmatn,sans-serif;font-size:14px;box-shadow:0 5px 20px rgba(0,0,0,.3);transition:opacity .4s';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){ if(t.parentNode) t.remove(); },400); }, 3000);
}

// ==================== FETCH ALL DATA ====================
function fetchAll() {
    showLoader();
    Promise.all([
        fetch(API + '?action=classes').then(function(r){return r.json();}),
        fetch(API + '?action=lessons').then(function(r){return r.json();}),
        fetch(API + '?action=teachers').then(function(r){return r.json();}),
        fetch(API + '?action=fields').then(function(r){return r.json();}),
        fetch(API + '?action=grades').then(function(r){return r.json();})
    ]).then(function(results) {
        var classRes = results[0], lessonRes = results[1], teacherRes = results[2], fieldRes = results[3], gradeRes = results[4];

        if (!classRes.success) throw new Error(classRes.message || 'خطا در دریافت کلاس‌ها');

        classes  = classRes.data  || [];
        lessons  = lessonRes.success  ? lessonRes.data  : [];
        teachers = teacherRes.success ? teacherRes.data : [];
        fields   = fieldRes.success   ? fieldRes.data   : [];
        grades   = gradeRes.success   ? gradeRes.data   : [];

        // آپدیت اطلاعات ادمین
        if (classRes.admin && classRes.admin.name) {
            var el = document.getElementById('adminInfoDisplay');
            if (el) el.textContent = (classRes.admin.role ? classRes.admin.role + ': ' : '') + classRes.admin.name;
        }

        renderClasses();
        hideLoader();
    }).catch(function(err) {
        hideLoader();
        showToast(err.message || 'خطا در بارگذاری', 'error');
    });
}

// ==================== RENDER CLASSES ====================
function renderClasses() {
    var grid = document.getElementById('classesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (classes.length === 0) {
        grid.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,.5);padding:60px;grid-column:1/-1"><i class="fas fa-chalkboard" style="font-size:48px;margin-bottom:16px;display:block"></i><p>هیچ کلاسی ثبت نشده است</p></div>';
        updateExcelCount();
        return;
    }

    classes.forEach(function(cls) {
        var totalPeriods = 0;
        days.forEach(function(d){ totalPeriods += (cls.schedule[d] || []).length; });

        var card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML =
            '<button class="delete-class-btn" onclick="openDeleteClassModal(' + cls.id + ')"><i class="fas fa-times"></i></button>' +
            '<div class="class-header">' +
                '<span class="class-number">کلاس ' + (cls.code || cls.id) + '</span>' +
                '<span class="class-grade">' + (cls.grade || '-') + '</span>' +
            '</div>' +
            '<div class="class-info">' +
                '<div class="info-row"><span class="info-label">تعداد دانش‌آموزان:</span><span class="info-value">' + (cls.student_count || 0) + ' نفر</span></div>' +
                '<div class="info-row"><span class="info-label">رشته:</span><span class="info-value">' + (cls.field || '-') + '</span></div>' +
                '<div class="info-row"><span class="info-label">تعداد جلسات:</span><span class="info-value">' + totalPeriods + ' جلسه</span></div>' +
            '</div>' +
            '<div class="class-actions">' +
                '<button class="btn btn-schedule" onclick="showSchedule(' + cls.id + ')">برنامه هفتگی</button>' +
                '<button class="btn btn-edit" onclick="showEditModal(' + cls.id + ')">ویرایش</button>' +
            '</div>';
        grid.appendChild(card);
    });

    updateExcelCount();
}

function updateExcelCount() {
    var el = document.getElementById('allClassesCount');
    if (el) el.textContent = classes.length + ' کلاس';
}

function getClassById(id) {
    for (var i = 0; i < classes.length; i++) { if (classes[i].id == id) return classes[i]; }
    return null;
}

// ==================== SCHEDULE MODAL ====================
function showSchedule(classId) {
    var cls = getClassById(classId);
    if (!cls) return;
    currentClass = cls;

    document.getElementById('scheduleModalTitle').textContent = 'برنامه هفتگی کلاس ' + (cls.code || cls.id);

    var maxPeriods = 0;
    days.forEach(function(d){ var l = (cls.schedule[d]||[]).length; if(l>maxPeriods) maxPeriods=l; });
    var total = Math.max(maxPeriods, 4);

    var html = '<div class="schedule-container"><div class="schedule-row schedule-header"><div class="schedule-cell time-header">زمان</div>';
    days.forEach(function(d){ html += '<div class="schedule-cell day-header">'+d+'</div>'; });
    html += '</div>';

    for (var i = 0; i < total; i++) {
        html += '<div class="schedule-row">';
        var firstPeriod = (cls.schedule[days[0]] || [])[i];
        html += '<div class="schedule-cell time-col">' + (firstPeriod ? firstPeriod.time_start + ' - ' + firstPeriod.time_end : '-') + '</div>';
        days.forEach(function(d) {
            var p = (cls.schedule[d] || [])[i];
            if (p) {
                html += '<div class="schedule-cell"><div class="lesson-cell"><span class="lesson-name">' + p.lesson_name + '</span><span class="lesson-teacher">' + p.teacher + '</span></div></div>';
            } else {
                html += '<div class="schedule-cell empty-cell">خالی</div>';
            }
        });
        html += '</div>';
    }
    html += '</div>';

    document.getElementById('scheduleTable').innerHTML = html;
    document.getElementById('scheduleModal').classList.add('active');
}
function closeScheduleModal() { document.getElementById('scheduleModal').classList.remove('active'); }

// ==================== EDIT MODAL ====================
function showEditModal(classId) {
    var cls = getClassById(classId);
    if (!cls) return;
    currentClass = cls;

    document.getElementById('editModalTitle').textContent = 'ویرایش کلاس ' + (cls.code || cls.id);
    document.getElementById('editField').value = cls.field || '-';

    var grid = document.getElementById('editScheduleGrid');
    grid.innerHTML = '';

    days.forEach(function(day) {
        var periods = cls.schedule[day] || [];
        var dayDiv = document.createElement('div');
        dayDiv.className = 'day-schedule';

        var html = '<div class="day-title"><span>' + day + '</span>' +
            '<button class="btn btn-add" onclick="openAddPeriodModal(\'' + day + '\')"><i class="fas fa-plus"></i> افزودن درس</button></div>';

        if (periods.length === 0) {
            html += '<p style="color:rgba(255,255,255,.5);text-align:center;padding:20px;">هیچ درسی برای این روز تعریف نشده است</p>';
        } else {
            periods.forEach(function(p) {
                html += '<div class="period-row">' +
                    '<span class="period-time">' + p.time_start + ' - ' + p.time_end + '</span>' +
                    '<span class="period-lesson">' + p.lesson_name + '</span>' +
                    '<span class="period-teacher">' + p.teacher + '</span>' +
                    '<button class="btn btn-delete" onclick="deletePeriod(' + p.id + ')"><i class="fas fa-times"></i></button>' +
                    '</div>';
            });
        }

        dayDiv.innerHTML = html;
        grid.appendChild(dayDiv);
    });

    document.getElementById('editModal').classList.add('active');
}
function closeEditModal() { document.getElementById('editModal').classList.remove('active'); }

// ==================== ADD PERIOD MODAL ====================
function openAddPeriodModal(day) {
    if (!currentClass) return;

    var modal = document.getElementById('addPeriodModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addPeriodModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e){ if(e.target===this) closeAddPeriodModal(); });
    }

    // ساخت options دروس
    var lessonOpts = '<option value="">انتخاب درس</option>';
    lessons.forEach(function(l){ lessonOpts += '<option value="'+l.id+'">'+(l.name)+(l.field?' - '+l.field:'')+'</option>'; });

    // ساخت options معلم‌ها
    var teacherOpts = '<option value="">انتخاب معلم</option>';
    teachers.forEach(function(t){ teacherOpts += '<option value="'+t.id+'">'+t.name+'</option>'; });

    modal.innerHTML =
        '<div class="add-class-modal-content">' +
        '<button class="close-btn" onclick="closeAddPeriodModal()"><i class="fas fa-times"></i></button>' +
        '<h2 class="modal-title">افزودن درس — ' + day + '</h2>' +
        '<div class="edit-section"><div class="form-grid">' +
            '<div class="form-group"><label class="form-label">درس:</label><select class="form-select" id="apLesson">' + lessonOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">معلم:</label><select class="form-select" id="apTeacher">' + teacherOpts + '</select></div>' +
            '<div class="form-group"><label class="form-label">ساعت شروع:</label><input type="time" class="form-input" id="apStart" value="08:00"></div>' +
            '<div class="form-group"><label class="form-label">ساعت پایان:</label><input type="time" class="form-input" id="apEnd" value="09:20"></div>' +
        '</div></div>' +
        '<button class="save-btn" onclick="savePeriod(\'' + day + '\')"><i class="fas fa-plus-circle"></i> افزودن</button>' +
        '</div>';

    modal.classList.add('active');
}
function closeAddPeriodModal() {
    var m = document.getElementById('addPeriodModal');
    if (m) m.classList.remove('active');
}

function savePeriod(day) {
    if (!currentClass) return;
    var lesson_id  = document.getElementById('apLesson').value;
    var teacher_id = document.getElementById('apTeacher').value;
    var time_start = document.getElementById('apStart').value;
    var time_end   = document.getElementById('apEnd').value;

    if (!lesson_id || !teacher_id || !time_start || !time_end) {
        showToast('همه فیلدها الزامی است!', 'error'); return;
    }

    var btn = document.querySelector('#addPeriodModal .save-btn');
    if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }

    fetch(API, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            action: 'add_schedule',
            class_id:   currentClass.id,
            lesson_id:  parseInt(lesson_id),
            teacher_id: parseInt(teacher_id),
            day:        dayNumbers[day],
            time_start: time_start,
            time_end:   time_end
        })
    }).then(function(r){return r.json();})
    .then(function(data) {
        if (!data.success) throw new Error(data.message);

        // پیدا کردن نام درس و معلم
        var lessonName = '';
        lessons.forEach(function(l){ if(l.id==lesson_id) lessonName=l.name; });
        var teacherName = '';
        teachers.forEach(function(t){ if(t.id==teacher_id) teacherName=t.name; });

        if (!currentClass.schedule[day]) currentClass.schedule[day] = [];
        currentClass.schedule[day].push({
            id:          data.schedule_id,
            unit_id:     data.unit_id,
            time_start:  time_start,
            time_end:    time_end,
            lesson_name: lessonName,
            lesson_id:   parseInt(lesson_id),
            teacher_id:  parseInt(teacher_id),
            teacher:     teacherName,
        });

        closeAddPeriodModal();
        showEditModal(currentClass.id);
        showToast('درس با موفقیت اضافه شد', 'success');
    }).catch(function(err){
        showToast(err.message || 'خطا در ذخیره', 'error');
    }).finally(function(){
        if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-plus-circle"></i> افزودن'; }
    });
}

function deletePeriod(scheduleId) {
    if (!confirm('آیا از ارشیو این درس مطمئن هستید؟')) return;

    fetch(API, {
        method: 'DELETE',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({action:'delete_schedule', schedule_id: scheduleId})
    }).then(function(r){return r.json();})
    .then(function(data) {
        if (!data.success) throw new Error(data.message);

        // ارشیو از state
        days.forEach(function(d) {
            if (!currentClass.schedule[d]) return;
            currentClass.schedule[d] = currentClass.schedule[d].filter(function(p){ return p.id != scheduleId; });
        });

        showEditModal(currentClass.id);
        showToast('درس از برنامه ارشیو شد', 'success');
    }).catch(function(err){
        showToast(err.message || 'خطا در ارشیو', 'error');
    });
}

// ==================== DELETE CLASS ====================
function openDeleteClassModal(classId) {
    var cls = getClassById(classId);
    if (!cls) return;
    classToDelete = cls;
    document.getElementById('deleteClassText').innerHTML =
        'آیا مطمئن هستید که می‌خواهید کلاس <strong>' + (cls.code||cls.id) + '</strong> (' + (cls.grade||'') + ' - ' + (cls.field||'') + ') را ارشیو کنید؟<br>این عملیات قابل بازگشت نیست.';
    document.getElementById('deleteClassModal').classList.add('active');
}
function closeDeleteClassModal() {
    document.getElementById('deleteClassModal').classList.remove('active');
    classToDelete = null;
}

function confirmDeleteClass() {
    if (!classToDelete) return;
    var btn = document.querySelector('#deleteClassModal .modal-btn-confirm');
    if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال انتقال به ارشیو...'; }

    fetch('../api/archive.php?action=archive', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            type: 'class',
            id: classToDelete.id,
            reason: 'آرشیو توسط مدیر'
        })
    }).then(function(r){return r.json();})
    .then(function(data) {
        if (!data.success) throw new Error(data.message);
        var code = classToDelete.code || classToDelete.id;
        classes = classes.filter(function(c){ return c.id != classToDelete.id; });
        closeDeleteClassModal();
        renderClasses();
        showToast('کلاس ' + code + ' با موفقیت به ارشیو منتقل شد', 'success');
    }).catch(function(err){
        showToast(err.message || 'خطا در انتقال به ارشیو', 'error');
    }).finally(function(){
        if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-trash-alt"></i> ارشیو کلاس'; }
    });
}

// ==================== ADD CLASS MODAL ====================
function openAddClassModal() {
    // پر کردن select پایه
    var gradeSelect = document.getElementById('newClassGrade');
    gradeSelect.innerHTML = '<option value="">انتخاب پایه</option>';
    grades.forEach(function(g){ gradeSelect.innerHTML += '<option value="'+g.id+'">'+g.title+'</option>'; });

    // پر کردن select رشته
    var fieldSelect = document.getElementById('newClassField');
    fieldSelect.innerHTML = '<option value="">انتخاب رشته</option>';
    fields.forEach(function(f){ fieldSelect.innerHTML += '<option value="'+f.id+'">'+f.title+'</option>'; });

    document.getElementById('newClassNumber').value = '';
    document.getElementById('addClassModal').classList.add('active');
}
function closeAddClassModal() {
    document.getElementById('addClassModal').classList.remove('active');
}
function addNewClass() {
    var code     = document.getElementById('newClassNumber').value.trim();
    var grade_id = document.getElementById('newClassGrade').value;
    var field_id = document.getElementById('newClassField').value;

    if (!code || !grade_id || !field_id) {
        showToast('همه فیلدها الزامی است!', 'error'); return;
    }

    var btn = document.querySelector('#addClassModal .save-btn');
    if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }

    fetch(API, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({action:'add_class', code:code, grade_id:parseInt(grade_id), field_id:parseInt(field_id)})
    }).then(function(r){return r.json();})
    .then(function(data) {
        if (!data.success) throw new Error(data.message);
        classes.unshift(data.data);
        closeAddClassModal();
        renderClasses();
        showToast('کلاس ' + code + ' با موفقیت اضافه شد', 'success');
    }).catch(function(err){
        showToast(err.message || 'خطا در افزودن', 'error');
    }).finally(function(){
        if (btn) { btn.disabled=false; btn.innerHTML='<i class="fas fa-plus-circle"></i> افزودن کلاس'; }
    });
}

// ==================== EXCEL EXPORT ====================
function openExcelModal() {
    var container = document.getElementById('individualClassOptions');
    if (container) {
        container.innerHTML = '';
        classes.forEach(function(cls) {
            var btn = document.createElement('button');
            btn.className = 'individual-class-btn';
            btn.innerHTML = '<span class="class-num">کلاس '+(cls.code||cls.id)+'</span><span class="class-info">'+(cls.grade||'-')+' - '+(cls.field||'-')+'</span>';
            btn.onclick = function(){ exportExcel('class', cls.id); };
            container.appendChild(btn);
        });
    }
    updateExcelCount();
    document.getElementById('excelModal').classList.add('active');
}
function closeExcelModal() { document.getElementById('excelModal').classList.remove('active'); }

function exportExcel(type, classId) {
    var toExport = [];
    if (type === 'all') toExport = classes;
    else if (type === 'class') { var c = getClassById(classId); if(c) toExport=[c]; }

    if (toExport.length === 0) { showToast('داده‌ای برای خروجی وجود ندارد','error'); return; }

    var csv = '\uFEFFشماره کلاس,پایه,رشته,تعداد دانش‌آموزان,روز,ساعت شروع,ساعت پایان,درس,معلم\n';
    toExport.forEach(function(cls) {
        days.forEach(function(day) {
            var periods = cls.schedule[day] || [];
            if (periods.length === 0) {
                csv += (cls.code||cls.id)+','+cls.grade+','+cls.field+','+cls.student_count+','+day+',-,-,-,-\n';
            } else {
                periods.forEach(function(p){
                    csv += '"'+(cls.code||cls.id)+'","'+cls.grade+'","'+cls.field+'",'+cls.student_count+',"'+day+'","'+p.time_start+'","'+p.time_end+'","'+p.lesson_name+'","'+p.teacher+'"\n';
                });
            }
        });
    });

    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var url  = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'classes_' + new Date().toISOString().split('T')[0] + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    showToast('فایل Excel دانلود شد', 'success');
    closeExcelModal();
}

// ==================== MODAL CLOSE ON BG CLICK ====================
window.addEventListener('DOMContentLoaded', function() {
    fetchAll();

    ['scheduleModal','editModal','excelModal','deleteClassModal','addClassModal'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        var closeFns = {
            scheduleModal:   closeScheduleModal,
            editModal:       closeEditModal,
            excelModal:      closeExcelModal,
            deleteClassModal:closeDeleteClassModal,
            addClassModal:   closeAddClassModal
        };
        el.addEventListener('click', function(e){ if(e.target===this) closeFns[id](); });
    });

    // active کردن منو
    var link = document.querySelector('a[href*="Class-schedule"]');
    if (link) {
        link.classList.add('active');
        var parent = link.closest('.menu-item.has-submenu');
        if (parent) parent.classList.add('open','active');
    }
});