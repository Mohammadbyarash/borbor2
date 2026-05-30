// javaScript/sign.js
const API_BASE = '../api';

// ===== تبدیل اعداد فارسی =====
function faToEn(str) {
  if (typeof str !== 'string') return '';
  const map = {'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'};
  return str.replace(/[۰-۹]/g, w => map[w]);
}

// ===== Toast =====
function showToast(message, type = 'error') {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toastMessage');
  const icon   = toast.querySelector('i');
  msgEl.textContent = message;
  if (type === 'error') {
    toast.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    icon.className = 'fas fa-exclamation-circle';
  } else {
    toast.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
    icon.className = 'fas fa-check-circle';
  }
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== اعتبارسنجی تاریخ شمسی =====
function validateJalaliDate(dateStr, type = 'student') {
  if (!dateStr) return false;
  dateStr = faToEn(dateStr).replace(/-/g, '/');
  const m = dateStr.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!m) return false;

  const year = parseInt(m[1]), month = parseInt(m[2]), day = parseInt(m[3]);
  if (month < 1 || month > 12) return false;
  if (day   < 1 || day   > 31) return false;
  if (month > 6  && day  > 30) return false;
  if (month === 12 && day > 29) return false;

  // سال شمسی جاری (تقریبی)
  const currentJY = new Date().getFullYear() - 621;

  if (type === 'student') {
    // دانش‌آموز: بین ۱۲ تا ۲۰ سال
    if (year < currentJY - 20 || year > currentJY - 12) return false;
  } else {
    // والدین: بین ۳۰ تا ۸۰ سال
    if (year < currentJY - 80 || year > currentJY - 25) return false;
  }
  return true;
}

// ===== بررسی ثبت‌نام قبلی =====
function checkPreviousRegistration() {
  const registered = localStorage.getItem('bourbour_registered');
  if (registered) {
    const trackingCode = localStorage.getItem('bourbour_tracking_code');
    if (trackingCode) sessionStorage.setItem('tracking_code', trackingCode);
    window.location.href = '../html/pending.html';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  checkPreviousRegistration();

  const form = document.getElementById('registerForm');
  if (!form) return;

  const submitBtn    = form.querySelector('.btn-submit');
  const gradeSelect  = document.getElementById('student-grade');
  const fieldSelect  = document.getElementById('student-field');
  const hedayatGroup = document.getElementById('hedayat-group');

  // ===== بارگذاری رشته‌ها و پایه‌ها از API =====
  try {
    const res  = await fetch(`${API_BASE}/registration_status.php`);
    const data = await res.json();

    if (!data.success) {
      showToast('خطا در بارگذاری اطلاعات مدرسه');
      return;
    }

    // بررسی باز/بسته بودن ثبت‌نام
    if (!data.is_open) {
      showClosedMessage();
      return;
    }

    // پر کردن رشته‌ها
    if (data.fields && data.fields.length > 0 && fieldSelect) {
      fieldSelect.innerHTML = '<option value="" disabled selected>انتخاب کنید</option>';
      data.fields.forEach(f => {
        const opt   = document.createElement('option');
        opt.value   = f.id;      // id رشته از DB
        opt.textContent = f.title;
        fieldSelect.appendChild(opt);
      });
    }

    // پر کردن پایه‌ها
    if (data.grades && data.grades.length > 0 && gradeSelect) {
      gradeSelect.innerHTML = '<option value="" disabled selected>انتخاب کنید</option>';
      data.grades.forEach(g => {
        const opt   = document.createElement('option');
        opt.value   = g.value;   // grade_10, grade_11, ...
        opt.textContent = g.label;
        gradeSelect.appendChild(opt);
      });
    }

  } catch (err) {
    showToast('خطا در ارتباط با سرور');
    return;
  }

  // ===== هدایت تحصیلی فقط برای دهم =====
  function updateHedayat() {
    const val = gradeSelect?.value || '';
    const inp = document.getElementById('file-hedayat');
    const show = val === 'grade_10' || val === 'tenth';
    if (hedayatGroup) hedayatGroup.style.display = show ? 'block' : 'none';
    if (inp) {
      inp.required = show;
      if (!show) { inp.value = ''; resetFileLabel(inp); }
    }
    validateForm();
  }
  gradeSelect?.addEventListener('change', updateHedayat);
  updateHedayat();

  // ===== آپلود فایل =====
  function resetFileLabel(input) {
    const label  = input.closest('.upload-label');
    const fnSpan = label?.querySelector('.filename');
    const utSpan = label?.querySelector('.upload-text');
    label?.classList.remove('uploaded');
    if (fnSpan) fnSpan.textContent = '';
    if (utSpan) utSpan.textContent = 'انتخاب فایل';
  }

 document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', () => {
        if (!input.files?.length) { resetFileLabel(input); validateForm(); return; }
        const file = input.files[0];
        const ext  = (file.name.split('.').pop() || '').toLowerCase();

        // فقط jpg/jpeg/png مجاز (pdf فقط برای کارنامه و هدایت)
        const isPdfAllowed = ['file-karname','file-hedayat'].includes(input.id);
        const allowed = isPdfAllowed ? ['png','jpg','jpeg','pdf'] : ['png','jpg','jpeg'];

        if (!allowed.includes(ext)) {
            const msg = isPdfAllowed
                ? 'فقط فایل‌های JPG، PNG و PDF مجاز هستند!'
                : 'فقط فایل‌های JPG و PNG مجاز هستند!';
            showToast(msg);
            input.value = ''; resetFileLabel(input); validateForm(); return;
        }

        // حداکثر ۱ مگابایت
        if (file.size > 1 * 1024 * 1024) {
            showToast('حجم فایل نباید بیشتر از ۱ مگابایت باشد!');
            input.value = ''; resetFileLabel(input); validateForm(); return;
        }

        const label  = input.closest('.upload-label');
        const fnSpan = label?.querySelector('.filename');
        const utSpan = label?.querySelector('.upload-text');
        label?.classList.add('uploaded');
        const name = file.name.length > 20 ? file.name.substring(0,20)+'...' : file.name;
        if (fnSpan) fnSpan.textContent = name;
        if (utSpan) utSpan.textContent = 'فایل انتخاب شد';
        validateForm();
    });
});


  // ===== اعتبارسنجی =====
  function isValidMobile(v)  { return /^09\d{9}$/.test(v); }
  function isValidNID(v) {
    if (!/^\d{10}$/.test(v)) return false;
    const d = parseInt(v[9]);
    let s = 0;
    for (let i=0;i<9;i++) s += parseInt(v[i])*(10-i);
    const r = s%11;
    return (r<2 && d===r)||(r>=2 && d===11-r);
  }

  function validateForm() {
    let valid = true;

    form.querySelectorAll('input[type="text"],input[type="tel"],select').forEach(inp => {
      let val = faToEn(inp.value.trim());
      if (['text','tel'].includes(inp.type)) inp.value = val;
      if (inp.required && val === '') { valid = false; return; }
      if (!inp.required && val === '') return;

      if (inp.id === 'student-national-id') {
        if (!isValidNID(val)) { valid = false; if (val.length===10) inp.classList.add('error'); }
        else inp.classList.remove('error');
      }
      if (inp.type === 'tel' && val) {
        if (!isValidMobile(val)) { valid = false; if (val.length===11) inp.classList.add('error'); }
        else inp.classList.remove('error');
      }
    });

    // اعتبارسنجی تاریخ دانش‌آموز
    const studentDate = document.getElementById('student-birthdate');
    if (studentDate?.value) {
      if (!validateJalaliDate(faToEn(studentDate.value), 'student')) {
        valid = false;
        studentDate.classList.add('error');
      } else studentDate.classList.remove('error');
    }

    // تاریخ والدین
    ['father-birthdate','mother-birthdate'].forEach(id => {
      const el = document.getElementById(id);
      if (el?.value) {
        if (!validateJalaliDate(faToEn(el.value), 'parent')) {
          valid = false;
          el.classList.add('error');
        } else el.classList.remove('error');
      }
    });

    form.querySelectorAll('input[type="file"][required]').forEach(fi => {
      if (!fi.files?.length) valid = false;
    });

    if (!document.getElementById('agree')?.checked) valid = false;

    if (submitBtn) {
      submitBtn.disabled = !valid;
      submitBtn.classList.toggle('active', valid);
    }
    return valid;
  }

  // ===== رویدادهای live =====
  form.addEventListener('input', e => {
    const inp = e.target;
    if (!inp || inp.type==='file') return;
    if (['text','tel'].includes(inp.type)) inp.value = faToEn(inp.value);
    if (inp.id==='student-national-id') inp.value = inp.value.replace(/\D/g,'').substring(0,10);
    if (inp.type==='tel') inp.value = inp.value.replace(/\D/g,'').substring(0,11);
    validateForm();
  });
  form.addEventListener('change', e => {
    if (['SELECT','INPUT'].includes(e.target.tagName)) validateForm();
  });

  // ===== ارسال فرم =====
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('لطفاً تمام فیلدها را صحیح تکمیل کنید.');
      return;
    }

    const fd = new FormData();
    fd.append('first_name',        document.getElementById('student-name').value.trim());
    fd.append('last_name',         document.getElementById('student-family').value.trim());
    fd.append('national_code',     document.getElementById('student-national-id').value.trim());
    fd.append('grade',             document.getElementById('student-grade').value);
    fd.append('major',             document.getElementById('student-field').value);
    fd.append('birth_date',        faToEn(document.getElementById('student-birthdate').value.trim()));
    fd.append('student_phone',     document.getElementById('student-phone')?.value.trim() || '');
    fd.append('father_name',       document.getElementById('father-name').value.trim());
    fd.append('father_last_name',  document.getElementById('father-family').value.trim());
    fd.append('father_birth_date', faToEn(document.getElementById('father-birthdate').value.trim()));
    fd.append('father_education',  document.getElementById('father-education').value);
    fd.append('father_job',        document.getElementById('father-job').value.trim());
    fd.append('mobile1',           document.getElementById('father-phone').value.trim());
    fd.append('mother_name',       document.getElementById('mother-name').value.trim());
    fd.append('mother_last_name',  document.getElementById('mother-family').value.trim());
    fd.append('mother_birth_date', faToEn(document.getElementById('mother-birthdate').value.trim()));
    fd.append('mother_education',  document.getElementById('mother-education').value);
    fd.append('mother_job',        document.getElementById('mother-job').value.trim());
    fd.append('mobile3',           document.getElementById('mother-phone').value.trim());
    fd.append('mobile2',           document.getElementById('second-phone')?.value.trim() || '');

    const karname = document.getElementById('file-karname').files[0];
    const photo   = document.getElementById('file-photo').files[0];
    const hedayat = document.getElementById('file-hedayat')?.files[0];
    if (karname) fd.append('karname_file', karname);
    if (photo)   fd.append('photo_file',   photo);
    if (hedayat) fd.append('hedayat_file', hedayat);

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';

    try {
      const res  = await fetch(`${API_BASE}/submit_registration.php`, { method:'POST', body:fd });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('bourbour_registered',    'true');
        localStorage.setItem('bourbour_tracking_code', data.tracking_code);
        sessionStorage.setItem('tracking_code',        data.tracking_code);
        window.location.href = '../html/pending.html';
      } else {
        showToast(data.message || 'خطایی رخ داد.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال فرم پیش‌ثبت‌نام';
        submitBtn.classList.add('active');
      }
    } catch {
      showToast('خطا در ارتباط با سرور.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> ارسال فرم پیش‌ثبت‌نام';
      submitBtn.classList.add('active');
    }
  });

  validateForm();


});

// ===== نمایش پیام بسته بودن ثبت‌نام =====
function showClosedMessage() {
  // هدر رو نگه دار، فقط main رو عوض کن
  const main = document.querySelector('main.register-section') || document.querySelector('main') || document.body;
  
  main.innerHTML = `
    <div class="closed-wrapper">
      <div class="closed-card">
        <div class="closed-icon-wrap">
          <div class="closed-icon-ring ring1"></div>
          <div class="closed-icon-ring ring2"></div>
          <div class="closed-icon-center">
            <i class="fas fa-lock"></i>
          </div>
        </div>
        <h2 class="closed-title">پیش‌ثبت‌نام بسته است</h2>
        <p class="closed-desc">
          متأسفانه در حال حاضر پیش‌ثبت‌نام مدرسه بسته می‌باشد.<br>
          برای اطلاعات بیشتر با دفتر مدرسه تماس بگیرید.
        </p>
        <div class="closed-info-items">
          <div class="closed-info-item">
            <i class="fas fa-phone"></i>
            <span>۰۹۱۲-۰۰۰-۰۰۰۰</span>
          </div>
          <div class="closed-info-item">
            <i class="fas fa-envelope"></i>
            <span>info@bourbour.edu</span>
          </div>
          <div class="closed-info-item">
            <i class="fas fa-clock"></i>
            <span>شنبه تا چهارشنبه، ۸ صبح الی ۲ بعدازظهر</span>
          </div>
        </div>
        <a href="tel:09120000000" class="closed-btn">
          <i class="fas fa-phone-alt"></i>
          تماس با مدرسه
        </a>
      </div>
    </div>
    <style>
      body {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .register-section, main {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
      }
      .closed-wrapper {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .closed-card {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 28px;
        padding: 52px 44px;
        max-width: 520px;
        width: 100%;
        text-align: center;
        backdrop-filter: blur(12px);
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        animation: closedFadeIn 0.5s ease;
      }
      @keyframes closedFadeIn {
        from { opacity:0; transform:translateY(24px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .closed-icon-wrap {
        position: relative;
        width: 110px;
        height: 110px;
        margin: 0 auto 32px;
      }
      .closed-icon-ring {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        border: 2px solid rgba(230,126,34,0.3);
        animation: ringPulse 2.5s ease-in-out infinite;
      }
      .ring1 { animation-delay: 0s; }
      .ring2 {
        inset: 10px;
        border-color: rgba(230,126,34,0.5);
        animation-delay: 0.5s;
      }
      @keyframes ringPulse {
        0%,100% { transform:scale(1); opacity:1; }
        50%      { transform:scale(1.08); opacity:0.6; }
      }
      .closed-icon-center {
        position: absolute;
        inset: 20px;
        background: linear-gradient(135deg, #e67e22, #d35400);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 24px rgba(230,126,34,0.5);
      }
      .closed-icon-center i {
        font-size: 28px;
        color: #fff;
      }
      .closed-title {
        color: #fff;
        font-size: 26px;
        font-weight: 700;
        font-family: "Shabnam", sans-serif;
        margin-bottom: 14px;
      }
      .closed-desc {
        color: rgba(255,255,255,0.7);
        font-size: 15px;
        line-height: 1.9;
        margin-bottom: 28px;
      }
      .closed-info-items {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 32px;
      }
      .closed-info-item {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 12px 20px;
        color: rgba(255,255,255,0.8);
        font-size: 14px;
      }
      .closed-info-item i {
        color: #e67e22;
        font-size: 16px;
        width: 18px;
      }
      .closed-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, #e67e22, #d35400);
        color: #fff;
        text-decoration: none;
        padding: 14px 36px;
        border-radius: 14px;
        font-size: 15px;
        font-weight: 700;
        font-family: "Vazirmatn", sans-serif;
        box-shadow: 0 6px 20px rgba(230,126,34,0.4);
        transition: all 0.3s ease;
      }
      .closed-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 28px rgba(230,126,34,0.6);
      }
      @media (max-width:480px) {
        .closed-card { padding: 36px 24px; }
        .closed-title { font-size: 22px; }
      }
    </style>
  `;
}




// ==================== JALALI DATE PICKER ====================
var JDP_SIGN = (function() {
  var MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];

  function toJalali(gy, gm, gd) {
    var msPerDay = 86400000;
    var diff = Math.round(
      (new Date(+gy,+gm-1,+gd).getTime() - new Date(1970,0,1).getTime()) / msPerDay
    );
    var jy=1348, jm=10, jd=11;
    jd += diff;
    while(jd > _jDays(jy,jm)){jd-=_jDays(jy,jm);jm++;if(jm>12){jm=1;jy++;}}
    while(jd < 1){jm--;if(jm<1){jm=12;jy--;}jd+=_jDays(jy,jm);}
    return [jy,jm,jd];
  }

  function toGregorian(jy, jm, jd) {
    var ry=1348,rm=10,rd=11,diff=0;
    while(ry<jy||(ry===jy&&rm<jm)||(ry===jy&&rm===jm&&rd<jd)){
      rd++;if(rd>_jDays(ry,rm)){rd=1;rm++;if(rm>12){rm=1;ry++;}}diff++;
    }
    while(ry>jy||(ry===jy&&rm>jm)||(ry===jy&&rm===jm&&rd>jd)){
      rd--;if(rd<1){rm--;if(rm<1){rm=12;ry--;}rd=_jDays(ry,rm);}diff--;
    }
    var g = new Date(1970,0,1+diff);
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
    if(dayV) dayV.style.display="none";
    if(monV) monV.style.display="none";
    if(yrV)  yrV.style.display="none";
    if(mode==="day"){
      dayV.style.display="block";
      if(mY) mY.textContent=MONTHS[vM-1]+"  "+_fa(vY);
      _renderDays();
      if(pB) pB.onclick=function(){_navMonth(-1);};
      if(nB) nB.onclick=function(){_navMonth(+1);};
    } else if(mode==="month"){
      monV.style.display="block";
      if(mY) mY.textContent=_fa(vY);
      _renderMonths();
      if(pB) pB.onclick=function(){vY--;_render();};
      if(nB) nB.onclick=function(){vY++;_render();};
    } else {
      yrV.style.display="block";
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
    var top=rect.bottom+6, left=rect.right-pw;
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

  // اتصال به همه input[data-jdp]
  function _initAll() {
    var inputs=document.querySelectorAll("input[data-jdp]");
    for(var i=0;i<inputs.length;i++){
      (function(inp){
        inp.readOnly=true;
        inp.style.cursor="pointer";
        inp.addEventListener("click",function(e){
          e.stopPropagation();
          _open(this);
        });
        inp.addEventListener("keydown",function(e){
          if(e.key==="Escape") _close();
        });
      })(inputs[i]);
    }
    var ov=document.getElementById("jdp-custom-overlay");
    if(ov) ov.addEventListener("click",function(){_close();});
  }

  return {
    init:_initAll,
    open:_open,
    close:_close,
    jdpGoToday:_goToday,
    jdpClear:_goClear,
    jdpToggleMonthView:_toggleMode
  };
})();

function jdpGoToday()         { JDP_SIGN.jdpGoToday(); }
function jdpClear()           { JDP_SIGN.jdpClear(); }
function jdpToggleMonthView() { JDP_SIGN.jdpToggleMonthView(); }

// init بعد از لود صفحه
document.addEventListener("DOMContentLoaded", function() {
  JDP_SIGN.init();
});





























