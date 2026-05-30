// javaScript/pending.js
const API_BASE = '../api';
let refreshTimer = null;
let currentData  = null;

window.addEventListener('DOMContentLoaded', () => {
    const tracking = sessionStorage.getItem('tracking_code')
                  || localStorage.getItem('bourbour_tracking_code');
    if (!tracking) {
        showState('error', 'کد پیگیری یافت نشد. ابتدا پیش‌ثبت‌نام کنید.');
        return;
    }
    checkStatus(tracking);
});

async function checkStatus(tracking) {
    showState('loading');
    try {
        const res  = await fetch(`${API_BASE}/check_status.php?tracking_code=${encodeURIComponent(tracking)}`);
        const data = await res.json();

        if (!data.success) {
            showState('error', data.message || 'کد پیگیری یافت نشد');
            return;
        }

        // check_status.php ممکنه داده رو در data.data یا data.registration یا مستقیم برگردونه
        const r = data.data || data.registration || data;

        currentData = {
            status:       r.status || data.status || 'pending',
            trackingCode: r.tracking_code || r.trackingCode || tracking,
            createdAt:    r.created_at    || r.createdAt    || '',
            firstName:    r.first_name    || r.firstName    || '',
            lastName:     r.last_name     || r.lastName     || '',
            nationalCode: r.national_code || r.nationalCode || '',
            birthDate:    r.birth_date    || r.birthDate    || '',
            studentPhone: r.student_phone || r.studentPhone || '',
            grade:        r.grade_label   || r.grade        || '',
            major:        r.major_label   || r.major        || '',
            photo:        r.photo_file    ? `../uploads/registrations/${r.photo_file}`   : (r.photo || ''),
            reportCard:   r.karname_file  ? `../uploads/registrations/${r.karname_file}` : (r.reportCard || ''),
            guidanceDoc:  r.hedayat_file  ? `../uploads/registrations/${r.hedayat_file}` : (r.guidanceDoc || ''),
            fatherName:      r.father_name       || r.fatherName      || '',
            fatherLastName:  r.father_last_name  || r.fatherLastName  || '',
            fatherBirthDate: r.father_birth_date || r.fatherBirthDate || '',
            fatherJob:       r.father_job        || r.fatherJob       || '',
            fatherPhone:     r.mobile1           || r.fatherPhone     || '',
            fatherEducation: r.father_education_label || r.fatherEducation || r.father_education || '',
            fatherEducationRaw: r.father_education || '',
            motherName:      r.mother_name       || r.motherName      || '',
            motherLastName:  r.mother_last_name  || r.motherLastName  || '',
            motherBirthDate: r.mother_birth_date || r.motherBirthDate || '',
            motherJob:       r.mother_job        || r.motherJob       || '',
            motherPhone:     r.mobile3           || r.motherPhone     || '',
            motherEducation: r.mother_education_label || r.motherEducation || r.mother_education || '',
            motherEducationRaw: r.mother_education || '',
        };

        const st = currentData.status;
        showState(['pending','accepted','rejected'].includes(st) ? st : 'error');
        renderCard(st);

        if (st === 'pending') startRefresh(tracking);
        else stopRefresh();

    } catch(e) {
        showState('error', 'خطا در ارتباط با سرور');
    }
}

function renderCard(status) {
    const d = currentData;
    if (!d) return;
    const ids = { pending:'pendingStudentInfo', accepted:'acceptedStudentInfo', rejected:'rejectedStudentInfo' };
    const el  = document.getElementById(ids[status]);
    if (!el) return;

    const badgeLabel = { pending:'⏳ در انتظار بررسی', accepted:'✅ قبول شده', rejected:'❌ رد شده' }[status];
    const canEdit    = status === 'pending';

    el.innerHTML = `
        <div class="sc-name">${esc(d.firstName)} ${esc(d.lastName)}</div>
        <div class="sc-meta">
            ${d.nationalCode ? `<span><i class="fas fa-id-card"></i> ${esc(d.nationalCode)}</span>` : ''}
            ${d.grade        ? `<span><i class="fas fa-graduation-cap"></i> ${esc(d.grade)}</span>` : ''}
            ${d.major        ? `<span><i class="fas fa-book"></i> ${esc(d.major)}</span>` : ''}
        </div>
        <div class="sc-tracking">
            <span class="sc-tracking-label">کد پیگیری:</span>
            <span class="sc-tracking-code">${esc(d.trackingCode)}</span>
            <span class="sc-badge ${status}">${badgeLabel}</span>
        </div>
        ${d.createdAt ? `<div class="sc-date"><i class="fas fa-calendar-alt"></i> تاریخ ثبت: ${esc(d.createdAt)}</div>` : ''}
        <div class="sc-actions">
            <button class="sc-btn view" onclick="openModal(false)">
                <i class="fas fa-eye"></i> مشاهده اطلاعات
            </button>
            ${canEdit ? `<button class="sc-btn edit" onclick="openModal(true)">
                <i class="fas fa-edit"></i> ویرایش اطلاعات
            </button>` : ''}
            <button class="sc-btn print" onclick="printSummary()">
                <i class="fas fa-print"></i> دریافت خلاصه
            </button>
        </div>`;
}

function startRefresh(t) { stopRefresh(); refreshTimer = setInterval(() => checkStatus(t), 60000); }
function stopRefresh()    { if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; } }

function showState(st, msg = '') {
    ['stateLoading','statePending','stateAccepted','stateRejected','stateError']
        .forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
    const map = { loading:'stateLoading', pending:'statePending', accepted:'stateAccepted', rejected:'stateRejected', error:'stateError' };
    const el  = document.getElementById(map[st]);
    if (el) el.style.display = 'block';
    if (st === 'error' && msg) { const em = document.getElementById('errorMessage'); if (em) em.textContent = msg; }
}

function openModal(editMode) {
    const d = currentData;
    if (!d) return;
    const inner = document.getElementById('dataModalInner');
    const modal = document.getElementById('dataModal');
    if (!inner || !modal) return;

    const eduOpts = [
        ['bisavad','بی‌سواد'],['nahzat','نهضت سواد آموزی'],['ebtida','ابتدایی'],
        ['sikol','سیکل'],['diplom','دیپلم'],['fawq_diplom','فوق دیپلم'],
        ['karshenas','کارشناسی (لیسانس)'],['karshenas_napeyvaeste','کارشناسی ناپیوسته'],
        ['karshenas_arshad','کارشناسی ارشد'],['doktori','دکتری'],['fawq_doktori','فوق دکتری'],
    ];

    const field = (label, name, value, type = 'text') => `
        <div class="mf"><label>${label}</label>
        ${editMode
            ? `<input type="${type}" name="${name}" value="${esc(value||'')}" class="mi">`
            : `<span class="mv">${esc(value||'—')}</span>`}
        </div>`;

    const eduField = (label, name, rawVal, displayVal) => `
        <div class="mf"><label>${label}</label>
        ${editMode
            ? `<select name="${name}" class="mi msel">${eduOpts.map(([v,l])=>`<option value="${v}"${v===rawVal?' selected':''}>${l}</option>`).join('')}</select>`
            : `<span class="mv">${esc(displayVal || eduOpts.find(e=>e[0]===rawVal)?.[1] || rawVal || '—')}</span>`}
        </div>`;

    inner.innerHTML = `
    <div class="mhd">
        <h3><i class="fas fa-${editMode?'edit':'user-circle'}"></i> ${editMode?'ویرایش اطلاعات':'مشاهده اطلاعات'}</h3>
        <button class="mx" onclick="closeModal()"><i class="fas fa-times"></i></button>
    </div>
    <form id="editForm" onsubmit="submitEdit(event)">
        ${editMode ? `<input type="hidden" name="tracking_code" value="${esc(d.trackingCode)}">` : ''}
        <div class="ms-title"><i class="fas fa-user-graduate"></i> دانش‌آموز</div>
        <div class="mg">
            ${field('نام','first_name',d.firstName)}
            ${field('نام خانوادگی','last_name',d.lastName)}
            ${field('کد ملی','national_code',d.nationalCode)}
            ${field('تاریخ تولد','birth_date',d.birthDate)}
            ${field('شماره تماس','student_phone',d.studentPhone,'tel')}
            <div class="mf"><label>پایه</label><span class="mv">${esc(d.grade)}</span></div>
            <div class="mf"><label>رشته</label><span class="mv">${esc(d.major)}</span></div>
        </div>
        <div class="ms-title"><i class="fas fa-male"></i> پدر</div>
        <div class="mg">
            ${field('نام','father_name',d.fatherName)}
            ${field('نام خانوادگی','father_last_name',d.fatherLastName)}
            ${field('تاریخ تولد','father_birth_date',d.fatherBirthDate)}
            ${field('شغل','father_job',d.fatherJob)}
            ${field('موبایل','mobile1',d.fatherPhone,'tel')}
            ${eduField('تحصیلات','father_education',d.fatherEducationRaw,d.fatherEducation)}
        </div>
        <div class="ms-title"><i class="fas fa-female"></i> مادر</div>
        <div class="mg">
            ${field('نام','mother_name',d.motherName)}
            ${field('نام خانوادگی','mother_last_name',d.motherLastName)}
            ${field('تاریخ تولد','mother_birth_date',d.motherBirthDate)}
            ${field('شغل','mother_job',d.motherJob)}
            ${field('موبایل','mobile3',d.motherPhone,'tel')}
            ${eduField('تحصیلات','mother_education',d.motherEducationRaw,d.motherEducation)}
        </div>
        ${(d.photo||d.reportCard||d.guidanceDoc) ? `
        <div class="ms-title"><i class="fas fa-paperclip"></i> مدارک</div>
        <div class="mdocs">
            ${d.photo       ? `<a href="${d.photo}"       target="_blank" class="da"><i class="fas fa-image"></i> عکس</a>` : ''}
            ${d.reportCard  ? `<a href="${d.reportCard}"  target="_blank" class="da"><i class="fas fa-file"></i> کارنامه</a>` : ''}
            ${d.guidanceDoc ? `<a href="${d.guidanceDoc}" target="_blank" class="da"><i class="fas fa-file-pdf"></i> هدایت تحصیلی</a>` : ''}
        </div>
        ${editMode ? `<div class="mg" style="margin-top:8px">
            <div class="mf">
                <label>کارنامه جدید <span style="color:rgba(255,255,255,0.4);font-size:11px">(JPG/PNG - حداکثر ۱MB)</span></label>
                <label class="mu-label" id="lbl_karname" for="inp_karname">
                    <span class="mu-icon"><i class="fas fa-cloud-upload-alt"></i></span>
                    <span class="mu-text" id="txt_karname">انتخاب فایل</span>
                    <input type="file" id="inp_karname" name="karname_file" accept=".jpg,.jpeg,.png" style="display:none"
                        onchange="handleModalFile(this,'lbl_karname','txt_karname')">
                </label>
            </div>
            <div class="mf">
                <label>عکس جدید <span style="color:rgba(255,255,255,0.4);font-size:11px">(JPG/PNG - حداکثر ۱MB)</span></label>
                <label class="mu-label" id="lbl_photo" for="inp_photo">
                    <span class="mu-icon"><i class="fas fa-cloud-upload-alt"></i></span>
                    <span class="mu-text" id="txt_photo">انتخاب فایل</span>
                    <input type="file" id="inp_photo" name="photo_file" accept=".jpg,.jpeg,.png" style="display:none"
                        onchange="handleModalFile(this,'lbl_photo','txt_photo')">
                </label>
            </div>
        </div>` : ''}` : ''}
        <div class="macts">
            <button type="button" class="btn-cancel" onclick="closeModal()">بستن</button>
            ${editMode
                ? `<button type="submit" id="saveBtn" class="btn-save"><i class="fas fa-save"></i> ذخیره تغییرات</button>`
                : `<button type="button" class="btn-save" onclick="closeModal();printSummary()"><i class="fas fa-print"></i> دریافت خلاصه</button>`}
        </div>
    </form>`;

    
    modal.classList.add('open');
document.body.style.overflow = 'hidden';

// اتصال JDP به فیلدهای تاریخ (فقط در حالت ویرایش)
if (editMode) {
  setTimeout(function() { JDP_PENDING.initModal(); }, 50);
}
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('dataModal')?.classList.remove('open');
    document.body.style.overflow = '';
}

document.addEventListener('click', e => {
    const modal = document.getElementById('dataModal');
    if (modal && e.target === modal) closeModal();
});

function handleModalFile(input, lblId, txtId) {
    const lbl  = document.getElementById(lblId);
    const txt  = document.getElementById(txtId);
    const file = input.files?.[0];

    if (!file) { resetModalFile(lbl, txt); return; }

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg','jpeg','png'].includes(ext)) {
        toast('فقط فایل‌های JPG و PNG مجاز هستند!', true);
        input.value = '';
        resetModalFile(lbl, txt);
        return;
    }
    if (file.size > 1 * 1024 * 1024) {
        toast('حجم فایل نباید بیشتر از ۱ مگابایت باشد!', true);
        input.value = '';
        resetModalFile(lbl, txt);
        return;
    }
    lbl.classList.add('mu-uploaded');
    const name = file.name.length > 22 ? file.name.substring(0,22)+'...' : file.name;
    txt.innerHTML = `<i class="fas fa-check-circle" style="color:#27ae60;margin-left:6px"></i>${name}`;
}

function resetModalFile(lbl, txt) {
    lbl?.classList.remove('mu-uploaded');
    if (txt) txt.textContent = 'انتخاب فایل';
}

async function submitEdit(e) {
    e.preventDefault();
    const form = document.getElementById('editForm');
    const btn  = document.getElementById('saveBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }
    try {
        const res  = await fetch(`${API_BASE}/edit_registration.php`, { method:'POST', body: new FormData(form) });
        const data = await res.json();
        if (data.success) {
            closeModal();
            toast('اطلاعات با موفقیت ویرایش شد ✓');
            const tr = sessionStorage.getItem('tracking_code') || localStorage.getItem('bourbour_tracking_code');
            setTimeout(() => checkStatus(tr), 800);
        } else {
            toast(data.message || 'خطا در ویرایش', true);
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> ذخیره تغییرات'; }
        }
    } catch {
        toast('خطا در ارتباط با سرور', true);
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> ذخیره تغییرات'; }
    }
}

function printSummary() {
    const d = currentData;
    if (!d) return;
    const stLabel = { pending:'در انتظار بررسی', accepted:'قبول شده', rejected:'رد شده' };
    const stColor = { pending:'#f39c12', accepted:'#27ae60', rejected:'#e74c3c' };
    const st = d.status || 'pending';
    const row = (l,v) => v ? `<div class="f"><div class="fl">${l}</div><div class="fv">${v}</div></div>` : '';

    const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8">
<title>خلاصه پیش‌ثبت‌نام — ${d.firstName} ${d.lastName}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Tahoma,Arial,sans-serif;background:#f0f4f8;color:#1a202c;padding:24px;direction:rtl;font-size:13px}.page{background:#fff;border-radius:12px;padding:32px;max-width:800px;margin:0 auto;box-shadow:0 2px 12px rgba(0,0,0,.1)}.hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1d4ed8;padding-bottom:16px;margin-bottom:20px}.school{font-size:20px;font-weight:bold;color:#1d4ed8}.doc-sub{font-size:12px;color:#64748b;margin-top:4px}.dates{font-size:11px;color:#94a3b8;text-align:left;line-height:1.8}.tracking-box{background:#eff6ff;border:2px dashed #3b82f6;border-radius:10px;padding:16px 24px;text-align:center;margin-bottom:20px}.t-code{font-size:30px;font-weight:bold;letter-spacing:6px;color:#1d4ed8;margin-bottom:8px;font-family:monospace}.st-pill{display:inline-block;padding:5px 20px;border-radius:20px;color:#fff;font-size:13px;font-weight:bold;background:${stColor[st]}}.sec{margin-bottom:16px}.sec-title{background:#1d4ed8;color:#fff;padding:7px 14px;border-radius:6px;font-size:12px;font-weight:bold;margin-bottom:10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.f{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:9px 12px}.fl{font-size:11px;color:#64748b;margin-bottom:2px}.fv{font-size:13px;font-weight:600;color:#0f172a}.footer{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}.print-btn{display:block;margin:20px auto 0;background:#1d4ed8;color:#fff;border:none;padding:11px 36px;border-radius:8px;cursor:pointer;font-size:14px;font-family:Tahoma}@media print{.print-btn{display:none}body{background:#fff}}</style></head>
<body><div class="page">
<div class="hd"><div><div class="school">🏫 مدرسه بوربور</div><div class="doc-sub">فرم خلاصه پیش‌ثبت‌نام</div></div><div class="dates"><div>تاریخ ثبت: ${d.createdAt}</div><div>تاریخ چاپ: ${new Date().toLocaleDateString('fa-IR')}</div></div></div>
<div class="tracking-box"><div class="t-code">${d.trackingCode}</div><div class="st-pill">${stLabel[st]}</div></div>
<div class="sec"><div class="sec-title">👨‍🎓 اطلاعات دانش‌آموز</div><div class="grid">${row('نام',d.firstName)}${row('نام خانوادگی',d.lastName)}${row('کد ملی',d.nationalCode)}${row('تاریخ تولد',d.birthDate)}${row('پایه تحصیلی',d.grade)}${row('رشته',d.major)}${d.studentPhone?row('شماره تماس',d.studentPhone):''}</div></div>
<div class="sec"><div class="sec-title">👨 اطلاعات پدر</div><div class="grid">${row('نام',d.fatherName)}${row('نام خانوادگی',d.fatherLastName)}${row('تحصیلات',d.fatherEducation)}${row('شغل',d.fatherJob)}${row('موبایل',d.fatherPhone)}${d.fatherBirthDate?row('تاریخ تولد',d.fatherBirthDate):''}</div></div>
<div class="sec"><div class="sec-title">👩 اطلاعات مادر</div><div class="grid">${row('نام',d.motherName)}${row('نام خانوادگی',d.motherLastName)}${row('تحصیلات',d.motherEducation)}${row('شغل',d.motherJob)}${row('موبایل',d.motherPhone)}${d.motherBirthDate?row('تاریخ تولد',d.motherBirthDate):''}</div></div>
<div class="footer"><span>این سند خلاصه پیش‌ثبت‌نام می‌باشد. کد پیگیری را نزد خود نگه دارید.</span><span>مدرسه بوربور</span></div>
</div><button class="print-btn" onclick="window.print()">🖨 چاپ / ذخیره PDF</button></body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
    else toast('لطفاً پاپ‌آپ مرورگر را فعال کنید', true);
}

function toast(msg, isErr = false) {
    let t = document.getElementById('_pToast');
    if (!t) { t = document.createElement('div'); t.id = '_pToast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);padding:12px 28px;border-radius:12px;font-size:14px;z-index:99999;color:#fff;min-width:240px;text-align:center;font-family:"Vazirmatn",sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:opacity .35s;background:${isErr?'#dc2626':'#16a34a'};opacity:1;`;
    clearTimeout(t._tm);
    t._tm = setTimeout(() => { t.style.opacity = '0'; }, 3200);
}

function esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}



// ==================== JALALI DATE PICKER ====================
var JDP_PENDING = (function() {
  var MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

  function toJalali(gy,gm,gd) {
    var msPerDay=86400000;
    var diff=Math.round((new Date(+gy,+gm-1,+gd).getTime()-new Date(1970,0,1).getTime())/msPerDay);
    var jy=1348,jm=10,jd=11;
    jd+=diff;
    while(jd>_jDays(jy,jm)){jd-=_jDays(jy,jm);jm++;if(jm>12){jm=1;jy++;}}
    while(jd<1){jm--;if(jm<1){jm=12;jy--;}jd+=_jDays(jy,jm);}
    return [jy,jm,jd];
  }

  function toGregorian(jy,jm,jd) {
    var ry=1348,rm=10,rd=11,diff=0;
    while(ry<jy||(ry===jy&&rm<jm)||(ry===jy&&rm===jm&&rd<jd)){rd++;if(rd>_jDays(ry,rm)){rd=1;rm++;if(rm>12){rm=1;ry++;}}diff++;}
    while(ry>jy||(ry===jy&&rm>jm)||(ry===jy&&rm===jm&&rd>jd)){rd--;if(rd<1){rm--;if(rm<1){rm=12;ry--;}rd=_jDays(ry,rm);}diff--;}
    var g=new Date(1970,0,1+diff);
    return [g.getFullYear(),g.getMonth()+1,g.getDate()];
  }

  function _jDays(jy,jm) {
    if(jm<=6) return 31;
    if(jm<=11) return 30;
    return (((((jy-(jy>0?474:473))%2820)+474+38)*682)%2816<682)?30:29;
  }

  function _firstCol(jy,jm) {
    var g=toGregorian(jy,jm,1);
    return (new Date(g[0],g[1]-1,g[2]).getDay()+1)%7;
  }

  function _today() {
    var n=new Date();
    return toJalali(n.getFullYear(),n.getMonth()+1,n.getDate());
  }

  function _fa(n) {
    return String(n).replace(/\d/g,function(d){return"۰۱۲۳۴۵۶۷۸۹"[d];});
  }

  var vY,vM,selY=null,selM=null,selD=null;
  var mode="day",yrStart,activeInput=null;

  function _renderDays() {
    var grid=document.getElementById("jdpDaysGrid");
    if(!grid) return;
    grid.innerHTML="";
    var t=_today(),fc=_firstCol(vY,vM),dm=_jDays(vY,vM);
    for(var i=0;i<fc;i++){var e=document.createElement("div");e.className="jdp-day empty";grid.appendChild(e);}
    for(var d=1;d<=dm;d++){
      (function(day){
        var el=document.createElement("div");el.className="jdp-day";
        el.textContent=_fa(day);
        if(vY===t[0]&&vM===t[1]&&day===t[2]) el.classList.add("today");
        if(selY===vY&&selM===vM&&selD===day) el.classList.add("selected");
        el.addEventListener("click",function(){_selectDay(day);});
        grid.appendChild(el);
      })(d);
    }
  }

  function _renderMonths() {
    var grid=document.getElementById("jdpMonthGrid");
    if(!grid) return;
    grid.innerHTML="";
    MONTHS.forEach(function(name,i){
      (function(idx){
        var el=document.createElement("div");el.className="jdp-ym-item";
        el.textContent=name;
        if(idx+1===vM) el.classList.add("active");
        el.addEventListener("click",function(){vM=idx+1;mode="day";_render();});
        grid.appendChild(el);
      })(i);
    });
  }

  function _renderYears() {
    var grid=document.getElementById("jdpYearGrid");
    if(!grid) return;
    grid.innerHTML="";
    var pl=document.getElementById("jdpYearRangePrev");
    var nl=document.getElementById("jdpYearRangeNext");
    var rl=document.getElementById("jdpYearRangeLabel");
    if(pl) pl.onclick=function(){yrStart-=12;_render();};
    if(nl) nl.onclick=function(){yrStart+=12;_render();};
    if(rl) rl.textContent=_fa(yrStart)+" - "+_fa(yrStart+11);
    for(var y=yrStart;y<yrStart+12;y++){
      (function(year){
        var el=document.createElement("div");el.className="jdp-ym-item";
        el.textContent=_fa(year);
        if(year===vY) el.classList.add("active");
        el.addEventListener("click",function(){vY=year;mode="month";_render();});
        grid.appendChild(el);
      })(y);
    }
  }

  function _render() {
    var dayV=document.getElementById("jdpDayView");
    var monV=document.getElementById("jdpMonthView");
    var yrV=document.getElementById("jdpYearView");
    var mY=document.getElementById("jdpMonthYear");
    var pB=document.getElementById("jdpPrevBtn");
    var nB=document.getElementById("jdpNextBtn");
    if(!dayV) return;
    dayV.style.display="none";
    if(monV) monV.style.display="none";
    if(yrV)  yrV.style.display="none";
    if(mode==="day"){
      dayV.style.display="block";
      if(mY) mY.textContent=MONTHS[vM-1]+"  "+_fa(vY);
      _renderDays();
      if(pB) pB.onclick=function(){_navMonth(-1);};
      if(nB) nB.onclick=function(){_navMonth(+1);};
    } else if(mode==="month"){
      if(monV) monV.style.display="block";
      if(mY) mY.textContent=_fa(vY);
      _renderMonths();
      if(pB) pB.onclick=function(){vY--;_render();};
      if(nB) nB.onclick=function(){vY++;_render();};
    } else {
      if(yrV) yrV.style.display="block";
      _renderYears();
      if(pB) pB.onclick=function(){yrStart-=12;_render();};
      if(nB) nB.onclick=function(){yrStart+=12;_render();};
    }
  }

  function _navMonth(dir) {
    vM+=dir;
    if(vM>12){vM=1;vY++;}
    if(vM<1){vM=12;vY--;}
    _render();
  }

  function _position(input) {
    var popup=document.getElementById("jdp-custom-popup");
    if(!popup) return;
    var rect=input.getBoundingClientRect();
    var pw=310,ph=380,vw=window.innerWidth,vh=window.innerHeight;
    var top=rect.bottom+6,left=rect.right-pw;
    if(left<8) left=8;
    if(left+pw>vw-8) left=vw-pw-8;
    if(top+ph>vh-8) top=rect.top-ph-6;
    if(top<8) top=8;
    popup.style.top=top+"px";
    popup.style.left=left+"px";
  }

  function _open(input) {
    activeInput=input;
    var val=input.value.trim();
    if(/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(val)){
      var p=val.split("/").map(Number);
      selY=vY=p[0];selM=vM=p[1];selD=p[2];
    } else {
      selY=selM=selD=null;
      var t=_today();vY=t[0];vM=t[1];
    }
    mode="day";
    yrStart=Math.floor(vY/12)*12;
    _render();
    _position(input);
    document.getElementById("jdp-custom-overlay").style.display="block";
    document.getElementById("jdp-custom-popup").style.display="block";
  }

  function _close() {
    var po=document.getElementById("jdp-custom-popup");
    var ov=document.getElementById("jdp-custom-overlay");
    if(po) po.style.display="none";
    if(ov) ov.style.display="none";
    activeInput=null;
  }

  function _selectDay(d) {
    selY=vY;selM=vM;selD=d;
    if(activeInput){
      activeInput.value=vY+"/"+String(vM).padStart(2,"0")+"/"+String(d).padStart(2,"0");
      activeInput.dispatchEvent(new Event("change",{bubbles:true}));
      activeInput.dispatchEvent(new Event("input",{bubbles:true}));
    }
    _render();
    setTimeout(_close,120);
  }

  function _goToday() {
    var t=_today();vY=t[0];vM=t[1];mode="day";
    yrStart=Math.floor(t[0]/12)*12;
    _render();_selectDay(t[2]);
  }

  function _goClear() {
    selY=selM=selD=null;
    if(activeInput){
      activeInput.value="";
      activeInput.dispatchEvent(new Event("change",{bubbles:true}));
    }
    _close();
  }

  function _toggleMode() {
    if(mode==="day") mode="month";
    else if(mode==="month"){mode="year";yrStart=Math.floor(vY/12)*12;}
    else mode="day";
    _render();
  }

  // اتصال به فیلدهای تاریخ داخل مودال (چون مودال داینامیک ساخته میشه)
  function _initModalDateInputs() {
    var dateFields = ["birth_date","father_birth_date","mother_birth_date"];
    dateFields.forEach(function(name) {
      var input = document.querySelector('#editForm input[name="' + name + '"]');
      if(!input) return;
      input.readOnly = true;
      input.style.cursor = "pointer";
      // حذف listener قبلی
      var fresh = input.cloneNode(true);
      input.parentNode.replaceChild(fresh, input);
      fresh.addEventListener("click", function(e) {
        e.stopPropagation();
        _open(this);
      });
      fresh.addEventListener("keydown", function(e) {
        if(e.key==="Escape") _close();
      });
    });

    var ov=document.getElementById("jdp-custom-overlay");
    if(ov) { ov.onclick = function(){_close();}; }
  }

  return {
    initModal: _initModalDateInputs,
    close: _close,
    jdpGoToday: _goToday,
    jdpClear: _goClear,
    jdpToggleMonthView: _toggleMode
  };
})();

function jdpGoToday()         { JDP_PENDING.jdpGoToday(); }
function jdpClear()           { JDP_PENDING.jdpClear(); }
function jdpToggleMonthView() { JDP_PENDING.jdpToggleMonthView(); }