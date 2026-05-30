// ==================== HAMBURGER MENU ====================
var menuToggle = document.getElementById("menuToggle");
var sidebar = document.getElementById("sidebar");
var sidebarOverlay = document.getElementById("sidebarOverlay");

var currentTeacherPhotoData = null;   // data URL عکس در مودال ویرایش
var newTeacherPhotoData     = null;   // data URL عکس در مودال افزودن
var ALLOWED_TYPES = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
var MAX_SIZE_MB   = 1;

function isValidNationalCodeChecksum(code) {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  var sum = 0;
  for (var i = 0; i < 9; i++) sum += parseInt(code[i]) * (10 - i);
  var rem   = sum % 11;
  var check = parseInt(code[9]);
  return rem < 2 ? check === rem : check === (11 - rem);
}
 
// ── تبدیل ارقام فارسی/عربی ──
function faToEn(str) {
  if (!str) return "";
  return String(str).replace(/[۰-۹]/g, function(d){ return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); })
                    .replace(/[٠-٩]/g, function(d){ return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });
}
 

function _processImage(file, maxMB, callback) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast("فقط فرمت‌های JPG، PNG، WEBP و GIF مجاز هستند", "error");
    return;
  }
  if (file.size > maxMB * 1024 * 1024) {
    showToast("حجم تصویر نباید بیشتر از " + maxMB + " مگابایت باشد", "error");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var w = img.width, h = img.height, maxSize = 600;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else        { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.80));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}


if (menuToggle) {
  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
  });
}
if (sidebarOverlay) {
  sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  });
}

// ==================== STATE ====================
var teachers = [];
var filteredTeachers = [];
var currentPage = 1;
var rowsPerPage = 5;
var teacherToDelete = null;
var teacherToDisable = null;
var currentEditId = null;
var editSelectedSubjects = [];
var editSelectedGrades   = [];
var selectedSubjects = [];
var selectedGrades = [];
var API = '../api/teachers.php';

// ==================== LOADER ====================
var windowLoaded = false;
var statsLoaded  = false;

function tryHideLoader() {
  if (!windowLoaded || !statsLoaded) return;
  var loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(function() { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 550);
  }
}

window.addEventListener('load', function() {
  windowLoaded = true;
  tryHideLoader();
});

// ==================== API CALLS ====================
function fetchTeachers() {
  showTableLoading();

  fetch('../api/stats.php')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success && d.currentUser) {
        var el = document.getElementById("adminInfo");
        if (el) el.textContent = (d.currentUser.role_label || '') + ': ' + (d.currentUser.name || '');
      }
    })
    .catch(function() {});

  fetch(API)
    .then(function(res) { return res.text(); })
    .then(function(text) {
      var data;
      try { data = JSON.parse(text); }
      catch(e) { throw new Error('پاسخ سرور معتبر نیست'); }
      if (!data.success) throw new Error(data.message || 'خطای ناشناخته');
      teachers = data.data || [];
      filteredTeachers = teachers.slice();
      renderTeachersTable();
      updateStats();
      statsLoaded = true;
      tryHideLoader();
    })
    .catch(function(err) {
      showTableError(err.message || 'خطا در ارتباط با سرور');
      statsLoaded = true;
      tryHideLoader();
    });
}

function apiPost(payload) {
  return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(function(res) { return res.text(); })
    .then(function(text) { try { return JSON.parse(text); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}
function apiPut(payload) {
  return fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(function(res) { return res.text(); })
    .then(function(text) { try { return JSON.parse(text); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}
function apiDelete(id) {
  return fetch(API, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) })
    .then(function(res) { return res.text(); })
    .then(function(text) { try { return JSON.parse(text); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}

// ==================== TABLE HELPERS ====================
function showTableLoading() {
  var tbody = document.getElementById("teachersTableBody");
  if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.6);grid-column:1/-1"><i class="fas fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;display:block"></i><p>در حال بارگذاری...</p></div>';
}
function showTableError(msg) {
  var tbody = document.getElementById("teachersTableBody");
  if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;grid-column:1/-1"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;display:block"></i><p>' + (msg || 'خطا در بارگذاری') + '</p><button onclick="fetchTeachers()" style="margin-top:12px;padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer">تلاش مجدد</button></div>';
}

// ==================== RENDER TABLE ====================
function renderTeachersTable() {
  var tbody = document.getElementById("teachersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  var start = (currentPage - 1) * rowsPerPage;
  var page  = filteredTeachers.slice(start, start + rowsPerPage);
  if (page.length === 0) {
    tbody.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.6);grid-column:1/-1"><i class="fas fa-user-slash" style="font-size:48px;margin-bottom:15px;opacity:0.5;display:block"></i><p style="font-size:16px">هیچ معلمی یافت نشد</p></div>';
    updatePagination();
    return;
  }
  for (var i = 0; i < page.length; i++) {
    var t = page[i];
    var row = document.createElement("div");
    row.className = "grid-row";
    var fullName = ((t.first_name || '') + ' ' + (t.last_name || '')).trim();
    var initial  = (t.first_name || '؟').charAt(0);
    row.innerHTML =
      '<div class="grid-cell" data-label="معلم"><div class="teacher-info"><div class="teacher-avatar">' + initial + '</div><span class="teacher-name">' + fullName + '</span></div></div>' +
      '<div class="grid-cell" data-label="موبایل">' + (t.mobile || '-') + '</div>' +
      '<div class="grid-cell" data-label="کد ملی">' + (t.national_code || '-') + '</div>' +
      '<div class="grid-cell" data-label="نام کاربری">' + (t.username || '-') + '</div>' +
      '<div class="grid-cell" data-label="وضعیت"><span class="status-badge status-present">فعال</span></div>' +
      '<div class="grid-cell" data-label="عملیات"><div class="action-btns-vertical"><button class="action-btn-vertical btn-info" onclick="openTeacherInfo(' + t.id + ')"><i class="fas fa-info-circle"></i> اطلاعات</button><button class="action-btn-vertical btn-disable" onclick="openDeleteModal(' + t.id + ')"><i class="fas fa-trash"></i> ارشیو</button></div></div>';
    tbody.appendChild(row);
  }
  updatePagination();
}

// ==================== STATS ====================
function updateStats() {
  var el = document.getElementById("totalTeachers");
  if (el) el.textContent = teachers.length;
}

// ==================== PAGINATION ====================
function updatePagination() {
  var total    = Math.ceil(filteredTeachers.length / rowsPerPage) || 1;
  var pageInfo = document.getElementById("pageInfo");
  var prevBtn  = document.getElementById("prevBtn");
  var nextBtn  = document.getElementById("nextBtn");
  if (!pageInfo) return;
  pageInfo.textContent  = 'صفحه ' + currentPage + ' از ' + total;
  prevBtn.disabled      = currentPage === 1;
  nextBtn.disabled      = currentPage >= total;
  prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
  nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
  prevBtn.style.cursor  = prevBtn.disabled ? 'not-allowed' : 'pointer';
  nextBtn.style.cursor  = nextBtn.disabled ? 'not-allowed' : 'pointer';
}
function changePage(dir) {
  var total = Math.ceil(filteredTeachers.length / rowsPerPage);
  var next  = currentPage + dir;
  if (next < 1 || next > total) return;
  currentPage = next;
  renderTeachersTable();
  var tc = document.querySelector(".table-container");
  if (tc) tc.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== SEARCH / FILTER ====================
function applyFilters() {
  var searchEl = document.getElementById("teacherSearch");
  var q = searchEl ? searchEl.value.toLowerCase().trim() : '';
  filteredTeachers = teachers.filter(function(t) {
    var name = ((t.first_name || '') + ' ' + (t.last_name || '')).toLowerCase();
    return !q || name.indexOf(q) !== -1 || (t.mobile || '').indexOf(q) !== -1 || (t.national_code || '').indexOf(q) !== -1 || (t.username || '').indexOf(q) !== -1;
  });
  currentPage = 1;
  renderTeachersTable();
}
var _ts = document.getElementById("teacherSearch"); if (_ts) _ts.addEventListener("input", applyFilters);
var _gf = document.getElementById("gradeFilter");   if (_gf) _gf.addEventListener("change", applyFilters);
var _wf = document.getElementById("workloadFilter"); if (_wf) _wf.addEventListener("change", applyFilters);

// ==================== INFO MODAL ====================
function openTeacherInfo(id) {
  var t = null;
  for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === id) { t = teachers[i]; break; } }
  if (!t) return;
  currentEditId = id;
  currentTeacherPhotoData = null;
 
  var fullName = ((t.first_name || "") + " " + (t.last_name || "")).trim();
  var initial  = (t.first_name || "؟").charAt(0);
 
  document.getElementById("infoTeacherName").textContent       = fullName;
  document.getElementById("infoTeacherPhone").textContent      = t.mobile || "-";
  document.getElementById("infoTeacherNationalId").textContent = t.national_code || "-";
  document.getElementById("infoTeacherUsername").textContent   = t.username || "-";
  document.getElementById("infoTeacherSubjects").textContent   = "—";
  document.getElementById("infoTeacherGrades").textContent     = "—";
  document.getElementById("infoTeacherBirthDate").textContent  = "—";
  document.getElementById("infoTeacherWeeklyHours").textContent= "—";
  document.getElementById("infoTeacherClassCount").textContent = "—";
 
  // آواتار حالت نمایش
  _setAvatarView("infoTeacherAvatar", t.photo || null, initial);
 
  document.getElementById("infoViewMode").style.display = "flex";
  document.getElementById("infoEditMode").style.display = "none";
  document.getElementById("editBtn").style.display      = "flex";
  document.getElementById("saveBtn").style.display      = "none";
  document.getElementById("cancelBtn").style.display    = "none";
 
  document.getElementById("teacherInfoModal").classList.add("active");
}


function closeTeacherInfoModal() {
  document.getElementById("teacherInfoModal").classList.remove("active");
  currentEditId = null;
}

function enableInfoEdit() {
  var t = null;
  for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === currentEditId) { t = teachers[i]; break; } }
  if (!t) return;
 
  var fullName = ((t.first_name || "") + " " + (t.last_name || "")).trim();
  var initial  = (t.first_name || "؟").charAt(0);
 
  document.getElementById("editTeacherFirstName").value  = t.first_name || "";
  document.getElementById("editTeacherLastName").value   = t.last_name  || "";
  document.getElementById("editTeacherPhone").value      = t.mobile     || "";
  document.getElementById("editTeacherNationalId").value = t.national_code || "";
  document.getElementById("editTeacherBirthDate").value  = "";

  document.getElementById("editTeacherUsername").value = t.username || "";
document.getElementById("editTeacherPassword").value = "";

editSelectedSubjects = t.subjects ? t.subjects.slice() : [];
editSelectedGrades   = t.grades   ? t.grades.slice()   : [];
renderEditTags();
 
  // آواتار حالت ویرایش
  currentTeacherPhotoData = t.photo || null;
  _setAvatarEdit("infoTeacherAvatarEdit", t.photo || null, initial);
 
  document.getElementById("infoViewMode").style.display = "none";
  document.getElementById("infoEditMode").style.display = "flex";
  document.getElementById("editBtn").style.display      = "none";
  document.getElementById("saveBtn").style.display      = "flex";
  document.getElementById("cancelBtn").style.display    = "flex";
 
  // پاک کردن خطاها
  ["editTeacherFirstName","editTeacherLastName","editTeacherPhone","editTeacherNationalId"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) { el.classList.remove("error","success"); _removeErrMsg(el); }
  });
 
  setTimeout(function() { initJdpInputs(); setupEditTeacherValidation(); }, 50);
}


function saveInfoEdit() {
  var fn  = document.getElementById("editTeacherFirstName");
  var ln  = document.getElementById("editTeacherLastName");
  var ph  = document.getElementById("editTeacherPhone");
  var nc  = document.getElementById("editTeacherNationalId");
  var usr = document.getElementById("editTeacherUsername");
  var pw  = document.getElementById("editTeacherPassword");
 
  var firstName    = (fn  ? fn.value.trim()  : "");
  var lastName     = (ln  ? ln.value.trim()  : "");
  var mobile       = faToEn((ph  ? ph.value.trim()  : ""));
  var nationalCode = faToEn((nc  ? nc.value.trim()  : ""));
  var username     = (usr ? usr.value.trim() : "");
  var password     = (pw  ? pw.value.trim()  : "");
 
  // اعتبارسنجی
  var ok = true;
  if (!firstName || /[\d\u06F0-\u06F9]/.test(firstName)) {
    _showErr(fn, firstName ? "نام نمی‌تواند شامل عدد باشد" : "نام الزامی است"); ok = false;
  }
  if (!lastName || /[\d\u06F0-\u06F9]/.test(lastName)) {
    _showErr(ln, lastName ? "نام خانوادگی نمی‌تواند شامل عدد باشد" : "نام خانوادگی الزامی است"); ok = false;
  }
  if (!mobile || !/^09\d{9}$/.test(mobile)) {
    _showErr(ph, "شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد"); ok = false;
  }
  if (!nationalCode || !isValidNationalCodeChecksum(nationalCode)) {
    _showErr(nc, nationalCode && nationalCode.length === 10 ? "کد ملی معتبر نیست" : "کد ملی باید ۱۰ رقم باشد"); ok = false;
  }
  if (!username) {
    _showErr(usr, "نام کاربری الزامی است"); ok = false;
  }
  if (password && password.length < 6) {
    _showErr(pw, "رمز عبور حداقل ۶ کاراکتر باشد"); ok = false;
  }
  if (!ok) { showToast("لطفاً خطاها را برطرف کنید", "error"); return; }
 
  var saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
 
  var payload = {
    id:            currentEditId,
    first_name:    firstName,
    last_name:     lastName,
    mobile:        mobile,
    national_code: nationalCode,
    username:      username,
    subjects:      editSelectedSubjects,
    grades:        editSelectedGrades,
  };
  if (password) payload.password = password;
  if (currentTeacherPhotoData && currentTeacherPhotoData.startsWith("data:")) {
    payload.photo = currentTeacherPhotoData;
  }
 
  apiPut(payload)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === currentEditId) {
          teachers[i].first_name    = firstName;
          teachers[i].last_name     = lastName;
          teachers[i].mobile        = mobile;
          teachers[i].national_code = nationalCode;
          teachers[i].username      = username;
          teachers[i].subjects      = editSelectedSubjects.slice();
          teachers[i].grades        = editSelectedGrades.slice();
          if (payload.photo)     teachers[i].photo    = payload.photo;
          if (payload.password)  teachers[i].password = payload.password;
          break;
        }
      }
      filteredTeachers = teachers.slice();
      renderTeachersTable();
      closeTeacherInfoModal();
      showToast("اطلاعات با موفقیت ذخیره شد", "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در ذخیره", "error"); })
    .finally(function() {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-check"></i> ذخیره';
    });
}

function setupEditTeacherValidation() {
  var ids = ["editTeacherFirstName","editTeacherLastName","editTeacherPhone","editTeacherNationalId"];
  var nameIds = ["editTeacherFirstName","editTeacherLastName"];
  var numIds  = ["editTeacherPhone","editTeacherNationalId"];
 
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
 
    // clone برای حذف listenerهای قبلی
    var fresh = el.cloneNode(true);
    el.parentNode.replaceChild(fresh, el);
 
    // جلوگیری از عدد در نام
    if (nameIds.includes(id)) {
      fresh.addEventListener("keydown", function(e) {
        var allowed = ["Backspace","Delete","Tab","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
        if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (/^\d$/.test(e.key) || /^[\u06F0-\u06F9\u0660-\u0669]$/.test(e.key)) {
          e.preventDefault(); _shakeInput(fresh);
          _showErr(fresh, "نام نمی‌تواند شامل عدد باشد");
        }
      });
      fresh.addEventListener("input", function() { _validateEditField(this); });
      fresh.addEventListener("blur",  function() { _validateEditField(this); });
    }
 
    // فیلدهای عددی
    if (numIds.includes(id)) {
      fresh.addEventListener("input", function() {
        var max = this.id === "editTeacherNationalId" ? 10 : 11;
        this.value = faToEn(this.value).replace(/\D/g,"").substring(0, max);
        _validateEditField(this);
      });
      fresh.addEventListener("blur", function() { _validateEditField(this); });
    }
  });
}


function _validateEditField(input) {
  if (!input) return true;
  var raw   = input.value.trim();
  var value = faToEn(raw);
  input.classList.remove("error","success");
  _removeErrMsg(input);
 
  if (input.id === "editTeacherFirstName" || input.id === "editTeacherLastName") {
    if (!raw) { _showErr(input, "این فیلد الزامی است"); return false; }
    if (/[\d\u06F0-\u06F9]/.test(raw)) { _showErr(input, "نام نمی‌تواند شامل عدد باشد"); return false; }
    input.classList.add("success"); return true;
  }
  if (input.id === "editTeacherPhone") {
    if (!raw) { _showErr(input, "شماره موبایل الزامی است"); return false; }
    if (!/^09\d{9}$/.test(value)) { _showErr(input, "موبایل باید با ۰۹ شروع و ۱۱ رقم باشد"); return false; }
    input.classList.add("success"); return true;
  }
  if (input.id === "editTeacherNationalId") {
    if (!raw) { _showErr(input, "کد ملی الزامی است"); return false; }
    if (!/^\d{10}$/.test(value)) { _showErr(input, "کد ملی باید ۱۰ رقم باشد"); return false; }
    if (!isValidNationalCodeChecksum(value)) { _showErr(input, "کد ملی معتبر نیست"); return false; }
    input.classList.add("success"); return true;
  }
  if (raw) input.classList.add("success");
  return true;
}




function cancelInfoEdit() {
  document.getElementById("infoViewMode").style.display = "flex";
  document.getElementById("infoEditMode").style.display = "none";
  document.getElementById("editBtn").style.display      = "flex";
  document.getElementById("saveBtn").style.display      = "none";
  document.getElementById("cancelBtn").style.display    = "none";
}

function handleInfoPhotoUpload(input) {
  var file = input.files[0];
  if (!file) return;
  _processImage(file, MAX_SIZE_MB, function(dataUrl) {
    currentTeacherPhotoData = dataUrl;
    _setAvatarEdit("infoTeacherAvatarEdit", dataUrl, "");
    showToast("عکس بارگذاری شد", "success");
  });
  input.value = "";
}


function downloadTeacherPhoto() {
  var src = currentTeacherPhotoData;
  if (!src) {
    // سعی می‌کنیم از حالت نمایش بگیریم
    var imgEl = document.querySelector("#infoTeacherAvatar img");
    if (imgEl) src = imgEl.src;
  }
  if (!src || src === "") { showToast("این معلم عکس پروفایل ندارد", "error"); return; }
 
  var t = null;
  for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === currentEditId) { t = teachers[i]; break; } }
  var name = t ? ((t.first_name || "") + "_" + (t.last_name || "")).trim() : "teacher";
 
  var link = document.createElement("a");
  link.download = "عکس_" + name + ".jpg";
 
  if (src.startsWith("data:")) {
    link.href = src;
    link.click();
    showToast("عکس دانلود شد", "success");
  } else {
    // تبدیل URL به data URL از طریق canvas
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      var canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
      showToast("عکس دانلود شد", "success");
    };
    img.onerror = function() {
      link.href = src; link.target = "_blank"; link.click();
    };
    img.src = src;
  }
}

function handleNewTeacherPhoto(input) {
  var file = input.files[0];
  if (!file) return;
  _processImage(file, MAX_SIZE_MB, function(dataUrl) {
    newTeacherPhotoData = dataUrl;
    var img = document.getElementById("newTeacherPhotoPreview");
    var ph  = document.getElementById("newTeacherPhotoPH");
    if (img) { img.src = dataUrl; img.style.display = "block"; }
    if (ph)  ph.style.display = "none";
    showToast("عکس بارگذاری شد", "success");
  });
  input.value = "";
}



// ==================== DELETE MODAL ====================
function openDeleteModal(id) {
  var t = null;
  for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === id) { t = teachers[i]; break; } }
  if (!t) return;
  teacherToDelete = t;
  document.getElementById("deleteTeacherName").textContent = ((t.first_name || '') + ' ' + (t.last_name || '')).trim();
  document.getElementById("deletePermanentModal").classList.add("active");
}
function closeDeletePermanentModal() {
  document.getElementById("deletePermanentModal").classList.remove("active");
  teacherToDelete = null;
}
function confirmDeletePermanent() {
  if (!teacherToDelete) return;
  var id = teacherToDelete.id;
  var fullName = ((teacherToDelete.first_name || '') + ' ' + (teacherToDelete.last_name || '')).trim();
  var btn = document.querySelector("#deletePermanentModal .confirm-btn.btn-danger");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارشیو...'; }
  apiDelete(id)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      teachers         = teachers.filter(function(x) { return x.id !== id; });
      filteredTeachers = filteredTeachers.filter(function(x) { return x.id !== id; });
      closeDeletePermanentModal(); renderTeachersTable(); updateStats();
      showToast(fullName + ' با موفقیت ارشیو شد', 'info');
    })
    .catch(function(err) { showToast(err.message || "خطا در ارشیو", "error"); })
    .then(function() {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-archive"></i> انتقال به ارشیو'; }
      teacherToDelete = null;
    });
}

// ==================== DISABLE (سازگاری) ====================
function disableTeacher(id) { openDeleteModal(id); }
function closeDisableModal() { var el = document.getElementById("disableConfirmModal"); if (el) el.classList.remove("active"); teacherToDisable = null; }
function confirmDisableTeacher() { closeDisableModal(); }
function enableTeacher(id) {}

// ==================== ADD TEACHER MODAL ====================
function openAddTeacherModal() {
  var el = document.getElementById("chooseMethodModal"); if (el) el.classList.add("active");
}
function closeChooseMethodModal() {
  var el = document.getElementById("chooseMethodModal"); if (el) el.classList.remove("active");
}

function setupAddTeacherValidation() {
  var ids = ["addTeacherFirstName","addTeacherLastName","addTeacherPhone",
             "addTeacherNationalId","addTeacherUsername","addTeacherPassword"];
 
  // جلوگیری از عدد در نام
  var nameIds = ["addTeacherFirstName","addTeacherLastName"];
  document.addEventListener("keydown", function _nk(e) {
    if (!nameIds.includes(e.target.id)) return;
    var allowed = ["Backspace","Delete","Tab","Enter","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key) || /^[\u06F0-\u06F9\u0660-\u0669]$/.test(e.key)) {
      e.preventDefault();
      _shakeInput(e.target);
      _showErr(e.target, "نام نمی‌تواند شامل عدد باشد");
    }
  });
 
  // فیلدهای عددی
  var numIds = ["addTeacherPhone","addTeacherNationalId"];
  document.addEventListener("input", function _ni(e) {
    if (!numIds.includes(e.target.id)) return;
    var max = e.target.id === "addTeacherNationalId" ? 10 : 11;
    e.target.value = faToEn(e.target.value).replace(/\D/g,"").substring(0, max);
    validateInputField(e.target);
    validateAddTeacherForm();
  });
 
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el || el.classList.contains("jdp-input")) return;
    el.addEventListener("input",  function() { validateInputField(this); validateAddTeacherForm(); });
    el.addEventListener("blur",   function() { validateInputField(this); validateAddTeacherForm(); });
  });
}

function openManualAddModal() {
  closeChooseMethodModal();
 
  var fields = ["addTeacherFirstName","addTeacherLastName","addTeacherPhone",
                "addTeacherNationalId","addTeacherBirthDate","addTeacherUsername","addTeacherPassword"];
  for (var i = 0; i < fields.length; i++) {
    var el = document.getElementById(fields[i]);
    if (el) { el.value = ""; el.classList.remove("error","success"); _removeErrMsg(el); }
  }
  selectedSubjects = []; selectedGrades = [];
  newTeacherPhotoData = null;
 
  // reset پیش‌نمایش عکس
  var img = document.getElementById("newTeacherPhotoPreview");
  var ph  = document.getElementById("newTeacherPhotoPH");
  if (img) { img.src = ""; img.style.display = "none"; }
  if (ph)  ph.style.display = "flex";
 
  renderTags();
 
  document.getElementById("saveTeacherBtn").disabled = true;
  document.getElementById("manualAddModal").classList.add("active");
 
  setupAddTeacherValidation();
  setTimeout(function() { initJdpInputs(); }, 50);
}


function closeManualAddModal() {
  var el = document.getElementById("manualAddModal"); if (el) el.classList.remove("active");
}
function openExcelImportModal() {
  closeChooseMethodModal();
  showToast("قابلیت افزودن از طریق Excel به زودی اضافه می‌شود", "info");
}

// ==================== TAGS ====================
function renderTags() {
  var subjectsDisplay = document.getElementById("subjectsDisplay");
  if (subjectsDisplay) {
    subjectsDisplay.innerHTML = "";
    for (var i = 0; i < selectedSubjects.length; i++) {
      (function(idx, val) {
        var tag = document.createElement("div"); tag.className = "tag-item";
        tag.innerHTML = '<span>' + val + '</span><button type="button" class="tag-remove" onclick="removeSubject(' + idx + ')"><i class="fas fa-times"></i></button>';
        subjectsDisplay.appendChild(tag);
      })(i, selectedSubjects[i]);
    }
  }
  var gradesDisplay = document.getElementById("gradesDisplay");
  if (gradesDisplay) {
    gradesDisplay.innerHTML = "";
    for (var i = 0; i < selectedGrades.length; i++) {
      (function(idx, val) {
        var tag = document.createElement("div"); tag.className = "tag-item";
        tag.innerHTML = '<span>' + val + '</span><button type="button" class="tag-remove" onclick="removeGrade(' + idx + ')"><i class="fas fa-times"></i></button>';
        gradesDisplay.appendChild(tag);
      })(i, selectedGrades[i]);
    }
  }
  validateAddTeacherForm();
}
function addSubject() {
  var input = document.getElementById("subjectInput"); if (!input) return;
  var value = input.value.trim(); if (!value) { showToast("لطفاً نام درس را وارد کنید", "warning"); return; }
  if (selectedSubjects.indexOf(value) !== -1) { showToast("این درس قبلاً اضافه شده", "warning"); input.value = ""; return; }
  selectedSubjects.push(value); input.value = ""; renderTags();
}
function addSubjectFromSuggestion(s) {
  if (selectedSubjects.indexOf(s) !== -1) { showToast("این درس قبلاً اضافه شده", "warning"); return; }
  selectedSubjects.push(s); renderTags();
}
function removeSubject(idx) { selectedSubjects.splice(idx, 1); renderTags(); }
function addGrade() {
  var input = document.getElementById("gradeInput"); if (!input) return;
  var value = input.value.trim(); if (!value) { showToast("لطفاً نام پایه را وارد کنید", "warning"); return; }
  if (selectedGrades.indexOf(value) !== -1) { showToast("این پایه قبلاً اضافه شده", "warning"); input.value = ""; return; }
  selectedGrades.push(value); input.value = ""; renderTags();
}
function addGradeFromSuggestion(g) {
  if (selectedGrades.indexOf(g) !== -1) { showToast("این پایه قبلاً اضافه شده", "warning"); return; }
  selectedGrades.push(g); renderTags();
}
function removeGrade(idx) { selectedGrades.splice(idx, 1); renderTags(); }

// ==================== VALIDATION ====================
function setupLiveValidation() {
  var inputs = document.querySelectorAll("#manualAddModal .form-input");
  var arr = [];
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i].classList.contains('tag-input') && !inputs[i].classList.contains('jdp-input')) arr.push(inputs[i]);
  }
  for (var i = 0; i < arr.length; i++) { var fresh = arr[i].cloneNode(true); arr[i].parentNode.replaceChild(fresh, arr[i]); }

  var newInputs = document.querySelectorAll("#manualAddModal .form-input");
  for (var i = 0; i < newInputs.length; i++) {
    if (newInputs[i].classList.contains('tag-input') || newInputs[i].classList.contains('jdp-input')) continue;
    (function(inp) {
      inp.addEventListener("input", function() {
        this.value = faToEnNumbers(this.value);
        if (this.id === "addTeacherNationalId") this.value = this.value.replace(/\D/g, '').substring(0, 10);
        if (this.id === "addTeacherPhone")      this.value = this.value.replace(/\D/g, '').substring(0, 11);
        validateInputField(this); validateAddTeacherForm();
      });
      inp.addEventListener("blur",   function() { validateInputField(this); validateAddTeacherForm(); });
      inp.addEventListener("change", function() { validateInputField(this); validateAddTeacherForm(); });
    })(newInputs[i]);
  }
}

function validateInputField(input) {
  if (!input) return true;
  var raw   = input.value.trim();
  var value = faToEn(raw);
 
  input.classList.remove("error","success");
  _removeErrMsg(input);
 
  if (input.classList.contains("jdp-input")) {
    if (raw) input.classList.add("success");
    return true;
  }
 
  // فیلدهای نام — ممنوع بودن عدد
  if (input.id === "addTeacherFirstName" || input.id === "addTeacherLastName") {
    if (!raw) { _showErr(input, "این فیلد الزامی است"); return false; }
    if (/[\d\u06F0-\u06F9\u0660-\u0669]/.test(raw)) {
      _showErr(input, "نام نمی‌تواند شامل عدد باشد"); return false;
    }
    input.classList.add("success"); return true;
  }
 
  if (!raw) { _showErr(input, "این فیلد الزامی است"); return false; }
 
  if (input.id === "addTeacherNationalId") {
    if (!/^\d{10}$/.test(value)) { _showErr(input, "کد ملی باید ۱۰ رقم باشد"); return false; }
    if (!isValidNationalCodeChecksum(value)) { _showErr(input, "کد ملی معتبر نیست"); return false; }
  }
  if (input.id === "addTeacherPhone") {
    if (!/^09\d{9}$/.test(value)) { _showErr(input, "موبایل باید با ۰۹ شروع و ۱۱ رقم باشد"); return false; }
  }
  if (input.id === "addTeacherPassword" && raw.length < 6) {
    _showErr(input, "رمز عبور حداقل ۶ کاراکتر باشد"); return false;
  }
 
  input.classList.add("success"); return true;
}


function validateAddTeacherForm() {
  var fn   = document.getElementById("addTeacherFirstName");
  var ln   = document.getElementById("addTeacherLastName");
  var ph   = document.getElementById("addTeacherPhone");
  var nc   = document.getElementById("addTeacherNationalId");
  var dt   = document.getElementById("addTeacherBirthDate");
  var usr  = document.getElementById("addTeacherUsername");
  var pw   = document.getElementById("addTeacherPassword");
 
  var phV  = faToEn((ph  ? ph.value.trim()  : ""));
  var ncV  = faToEn((nc  ? nc.value.trim()  : ""));
  var fnV  = fn  ? fn.value.trim()  : "";
  var lnV  = ln  ? ln.value.trim()  : "";
  var dtV  = dt  ? dt.value.trim()  : "";
  var usrV = usr ? usr.value.trim() : "";
  var pwV  = pw  ? pw.value.trim()  : "";
 
  var isValid =
    fnV && lnV && phV && ncV && dtV && usrV && pwV &&
    !/[\d\u06F0-\u06F9]/.test(fnV) &&
    !/[\d\u06F0-\u06F9]/.test(lnV) &&
    /^09\d{9}$/.test(phV) &&
    isValidNationalCodeChecksum(ncV) &&
    pwV.length >= 6;
 
  var btn = document.getElementById("saveTeacherBtn");
  if (btn) {
    btn.disabled      = !isValid;
    btn.style.opacity = isValid ? "1" : "0.6";
    btn.style.cursor  = isValid ? "pointer" : "not-allowed";
  }
  return !!isValid;
}


// ==================== SAVE TEACHER ====================
function saveNewTeacher() {
  if (!validateAddTeacherForm()) { showToast("لطفاً فیلدهای الزامی را پر کنید", "error"); return; }
 
  var firstName = document.getElementById("addTeacherFirstName").value.trim();
  var lastName  = document.getElementById("addTeacherLastName").value.trim();
  var mobile    = faToEn(document.getElementById("addTeacherPhone").value.trim());
  var natCode   = faToEn(document.getElementById("addTeacherNationalId").value.trim());
  var username  = document.getElementById("addTeacherUsername").value.trim();
  var password  = document.getElementById("addTeacherPassword").value.trim();
 
  var btn = document.getElementById("saveTeacherBtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
 
  var formEl = document.querySelector("#manualAddModal .add-teacher-form");
  if (formEl) { formEl.style.opacity = "0.4"; formEl.style.pointerEvents = "none"; }
 
  var payload = {
    first_name:    firstName,
    last_name:     lastName,
    mobile:        mobile,
    national_code: natCode,
    username:      username,
    password:      password,
  };
  if (newTeacherPhotoData) payload.photo = newTeacherPhotoData;
 
  apiPost(payload)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      fetchTeachers();
      closeManualAddModal();
      showToast(firstName + " " + lastName + " با موفقیت اضافه شد", "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در افزودن معلم", "error"); })
    .finally(function() {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus"></i> افزودن معلم';
      if (formEl) { formEl.style.opacity = ""; formEl.style.pointerEvents = ""; }
    });
}



// ==================== UNUSED (سازگاری) ====================
function openTeacherDetails(id) { showToast("این بخش به زودی فعال می‌شود", "info"); }
function closeTeacherDetailsModal() { var el = document.getElementById("teacherDetailsModal"); if (el) el.classList.remove("active"); }
function openAddSessionModal() { showToast("این بخش به زودی فعال می‌شود", "info"); }
function closeAddSessionModal() { var el = document.getElementById("addSessionModal"); if (el) el.classList.remove("active"); }
function addSession() {} function editSession() {} function deleteSession() {}
function setTeacherStatus() {} function renderWeeklySchedule() {} function renderTeacherClasses() {}
function renderWorkload() {} function renderReports() {} function renderReplacementSuggestions() {}
function selectReplacement() {}
function openDeletePermanentModal(id) { openDeleteModal(id); }
function exportTeachersExcel() { showToast("خروجی Excel در حال آماده‌سازی است...", "info"); }
function importFromExcel() { showToast("قابلیت افزودن از طریق Excel به زودی اضافه می‌شود", "info"); }

// ==================== TOAST ====================
function showSuccessToast(message) { showToast(message, "success"); }
function showToast(message, type) {
  type = type || "success";
  var toast = document.getElementById("successToast"), msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;
  toast.classList.remove("error", "warning", "info");
  if (type !== "success") toast.classList.add(type);
  msgEl.textContent = message;
  toast.classList.remove("hide"); toast.classList.add("show");
  setTimeout(closeToast, 3000);
}
function closeToast() {
  var toast = document.getElementById("successToast"); if (!toast) return;
  toast.classList.remove("show"); toast.classList.add("hide");
  setTimeout(function() { toast.classList.remove("hide"); }, 400);
}

// ==================== MODAL CLICK OUTSIDE ====================
var _tim = document.getElementById("teacherInfoModal");     if (_tim) _tim.addEventListener("click", function(e){ if(e.target===this) closeTeacherInfoModal(); });
var _cmm = document.getElementById("chooseMethodModal");    if (_cmm) _cmm.addEventListener("click", function(e){ if(e.target===this) closeChooseMethodModal(); });
var _mam = document.getElementById("manualAddModal");       if (_mam) _mam.addEventListener("click", function(e){ if(e.target===this) closeManualAddModal(); });
var _dpm = document.getElementById("deletePermanentModal"); if (_dpm) _dpm.addEventListener("click", function(e){ if(e.target===this) closeDeletePermanentModal(); });
var _dcm = document.getElementById("disableConfirmModal");  if (_dcm) _dcm.addEventListener("click", function(e){ if(e.target===this) closeDisableModal(); });

// ==================== HELPERS ====================
function faToEnNumbers(str) {
  if (typeof str !== "string") return "";
  var map = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"};
  return str.replace(/[۰-۹]/g, function(w) { return map[w]; });
}
function isValidNationalCode(val) { return /^\d{10}$/.test(val); }
function isValidMobile(val)       { return /^09\d{9}$/.test(val); }


// ==================== JALALI DATE PICKER (Teacher Management) ====================
var JDP = (function () {

  var MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  var DAYS   = ["ش","ی","د","س","چ","پ","ج"];

  // ── تبدیل میلادی → شمسی (epoch-based، صددرصد صحیح) ──
  function toJalali(gy, gm, gd) {
    var msPerDay = 86400000;
    var diff = Math.round((new Date(+gy, +gm - 1, +gd).getTime() - new Date(1970, 0, 1).getTime()) / msPerDay);
    var jy = 1348, jm = 10, jd = 11;
    jd += diff;
    while (jd > _jDays(jy, jm)) { jd -= _jDays(jy, jm); jm++; if (jm > 12) { jm = 1; jy++; } }
    while (jd < 1) { jm--; if (jm < 1) { jm = 12; jy--; } jd += _jDays(jy, jm); }
    return [jy, jm, jd];
  }

  // ── تبدیل شمسی → میلادی ──
  function toGregorian(jy, jm, jd) {
    var ry = 1348, rm = 10, rd = 11, diff = 0;
    while (ry < jy || (ry === jy && rm < jm) || (ry === jy && rm === jm && rd < jd)) {
      rd++; if (rd > _jDays(ry, rm)) { rd = 1; rm++; if (rm > 12) { rm = 1; ry++; } } diff++;
    }
    while (ry > jy || (ry === jy && rm > jm) || (ry === jy && rm === jm && rd > jd)) {
      rd--; if (rd < 1) { rm--; if (rm < 1) { rm = 12; ry--; } rd = _jDays(ry, rm); } diff--;
    }
    var g = new Date(1970, 0, 1 + diff);
    return [g.getFullYear(), g.getMonth() + 1, g.getDate()];
  }

function _jDays(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return 30;
}

  // ستون شروع ماه: شنبه=0
  function _firstCol(jy, jm) {
    var g = toGregorian(jy, jm, 1);
    return (new Date(g[0], g[1] - 1, g[2]).getDay() + 1) % 7;
  }

  function _today() {
    var n = new Date();
    return toJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }

  function _fa(n) {
    return String(n).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; });
  }

  // ── state ──
  var vY, vM, selY = null, selM = null, selD = null;
  var mode = "day", yrStart, activeInput = null;

  // ── render روزها در DOM موجود ──
  function _renderDays() {
    var grid = document.getElementById("jdpDaysGrid");
    if (!grid) return;
    grid.innerHTML = "";
    var t = _today();
    var fc = _firstCol(vY, vM);
    var dm = _jDays(vY, vM);

    for (var i = 0; i < fc; i++) {
      var emp = document.createElement("div");
      emp.className = "jdp-day empty";
      grid.appendChild(emp);
    }
    for (var d = 1; d <= dm; d++) {
      (function (day) {
        var el = document.createElement("div");
        el.className = "jdp-day";
        el.textContent = _fa(day);
        if (vY === t[0] && vM === t[1] && day === t[2]) el.classList.add("today");
        if (selY === vY && selM === vM && selD === day) el.classList.add("selected");
        el.addEventListener("click", function () { _selectDay(day); });
        grid.appendChild(el);
      })(d);
    }
  }

  function _renderMonths() {
    var grid = document.getElementById("jdpMonthGrid");
    if (!grid) return;
    grid.innerHTML = "";
    MONTHS.forEach(function (name, i) {
      (function (idx) {
        var el = document.createElement("div");
        el.className = "jdp-ym-item" + (idx + 1 === vM ? " active" : "");
        el.textContent = name;
        el.addEventListener("click", function () { vM = idx + 1; mode = "day"; _render(); });
        grid.appendChild(el);
      })(i);
    });
  }

  function _renderYears() {
    var grid = document.getElementById("jdpYearGrid");
    if (!grid) return;
    grid.innerHTML = "";
    var pl = document.getElementById("jdpYearRangePrev");
    var nl = document.getElementById("jdpYearRangeNext");
    var rl = document.getElementById("jdpYearRangeLabel");
    if (pl) pl.onclick = function () { yrStart -= 12; _render(); };
    if (nl) nl.onclick = function () { yrStart += 12; _render(); };
    if (rl) rl.textContent = _fa(yrStart) + " - " + _fa(yrStart + 11);
    for (var y = yrStart; y < yrStart + 12; y++) {
      (function (year) {
        var el = document.createElement("div");
        el.className = "jdp-ym-item" + (year === vY ? " active" : "");
        el.textContent = _fa(year);
        el.addEventListener("click", function () { vY = year; mode = "month"; _render(); });
        grid.appendChild(el);
      })(y);
    }
  }

  function _render() {
    var dayV = document.getElementById("jdpDayView");
    var monV = document.getElementById("jdpMonthView");
    var yrV  = document.getElementById("jdpYearView");
    var mY   = document.getElementById("jdpMonthYear");
    var pB   = document.getElementById("jdpPrevBtn");
    var nB   = document.getElementById("jdpNextBtn");
    if (!dayV) return;

    [dayV, monV, yrV].forEach(function (v) { if (v) v.style.display = "none"; });

    if (mode === "day") {
      dayV.style.display = "block";
      if (mY) mY.textContent = MONTHS[vM - 1] + "  " + _fa(vY);
      _renderDays();
      if (pB) pB.onclick = function () { _navMonth(-1); };
      if (nB) nB.onclick = function () { _navMonth(+1); };
    } else if (mode === "month") {
      monV.style.display = "block";
      if (mY) mY.textContent = _fa(vY);
      _renderMonths();
      if (pB) pB.onclick = function () { vY--; _render(); };
      if (nB) nB.onclick = function () { vY++; _render(); };
    } else {
      yrV.style.display = "block";
      if (mY) mY.textContent = _fa(yrStart) + " - " + _fa(yrStart + 11);
      _renderYears();
      if (pB) pB.onclick = function () { yrStart -= 12; _render(); };
      if (nB) nB.onclick = function () { yrStart += 12; _render(); };
    }
  }

  function _navMonth(dir) {
    vM += dir;
    if (vM > 12) { vM = 1; vY++; }
    if (vM < 1)  { vM = 12; vY--; }
    _render();
  }

  function _open(input) {
    activeInput = input;
    var val = input.value.trim();
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(val)) {
      var p = val.split("/").map(Number);
      selY = vY = p[0]; selM = vM = p[1]; selD = p[2];
    } else {
      selY = selM = selD = null;
      var t = _today(); vY = t[0]; vM = t[1];
    }
    mode = "day";
    yrStart = Math.floor(vY / 12) * 12;
    _render();
    _position(input);
    document.getElementById("jdp-custom-overlay").style.display = "block";
    document.getElementById("jdp-custom-popup").style.display = "block";
  }

  function _close() {
    var po = document.getElementById("jdp-custom-popup");
    var ov = document.getElementById("jdp-custom-overlay");
    if (po) po.style.display = "none";
    if (ov) ov.style.display = "none";
    activeInput = null;
  }

  function _position(input) {
    var popup = document.getElementById("jdp-custom-popup");
    if (!popup) return;
    var rect = input.getBoundingClientRect();
    var pw = 300, ph = 380, vw = window.innerWidth, vh = window.innerHeight;
    var top = rect.bottom + 6, left = rect.right - pw;
    if (left < 8) left = 8;
    if (left + pw > vw - 8) left = vw - pw - 8;
    if (top + ph > vh - 8) top = rect.top - ph - 6;
    if (top < 8) top = 8;
    popup.style.top = top + "px";
    popup.style.left = left + "px";
  }

  function _selectDay(d) {
    selY = vY; selM = vM; selD = d;
    if (activeInput) {
      activeInput.value = vY + "/" + String(vM).padStart(2, "0") + "/" + String(d).padStart(2, "0");
      activeInput.classList.remove("error"); activeInput.classList.add("success");
      activeInput.dispatchEvent(new Event("change", { bubbles: true }));
      activeInput.dispatchEvent(new Event("input",  { bubbles: true }));
      if (typeof validateAddTeacherForm === "function") validateAddTeacherForm();
    }
    _render();
    setTimeout(_close, 120);
  }

  function _goToday() {
    var t = _today(); vY = t[0]; vM = t[1]; mode = "day";
    yrStart = Math.floor(t[0] / 12) * 12;
    _render(); _selectDay(t[2]);
  }

  function _goClear() {
    selY = selM = selD = null;
    if (activeInput) {
      activeInput.value = "";
      activeInput.classList.remove("success", "error");
      activeInput.dispatchEvent(new Event("change", { bubbles: true }));
      if (typeof validateAddTeacherForm === "function") validateAddTeacherForm();
    }
    _close();
  }

  function _toggleMode() {
    if (mode === "day")        { mode = "month"; }
    else if (mode === "month") { mode = "year"; yrStart = Math.floor(vY / 12) * 12; }
    else                       { mode = "day"; }
    _render();
  }

  return {
    open:              _open,
    close:             _close,
    jdpGoToday:        _goToday,
    jdpClear:          _goClear,
    jdpToggleMonthView: _toggleMode,
  };
})();

// ── توابع global که HTML مستقیم صدا می‌زند ──
function jdpGoToday()         { JDP.jdpGoToday(); }
function jdpClear()           { JDP.jdpClear(); }
function jdpToggleMonthView() { JDP.jdpToggleMonthView(); }

// ── بستن با کلیک روی overlay ──
var _ov = document.getElementById("jdp-custom-overlay");
if (_ov) _ov.addEventListener("click", function () { JDP.close(); });

// ── اتصال date picker به فیلدهای تاریخ داخل مودال‌ها ──
function initJdpInputs() {
  var selectors = [
    "#manualAddModal .jdp-input",
    "#teacherInfoModal .jdp-input"
  ];
  for (var s = 0; s < selectors.length; s++) {
    var inputs = document.querySelectorAll(selectors[s]);
    for (var i = 0; i < inputs.length; i++) {
      (function (input) {
        var fresh = input.cloneNode(true);
        input.parentNode.replaceChild(fresh, input);
        fresh.readOnly = true;
        fresh.style.cursor = "pointer";
        fresh.addEventListener("click", function (e) {
          e.stopPropagation();
          JDP.open(this);
        });
        fresh.addEventListener("keydown", function (e) {
          if (e.key === "Escape") JDP.close();
        });
      })(inputs[i]);
    }
  }
}

function jdpGoToday()         { JDP.jdpGoToday(); }
function jdpClear()           { JDP.jdpClear(); }
function jdpToggleMonthView() { JDP.jdpToggleMonthView(); }

var _ov = document.getElementById("jdp-custom-overlay");
if (_ov) _ov.addEventListener("click", function() { JDP.close(); });

function initJdpInputs() {
  // فقط داخل مودال‌های معلم - نه کل صفحه
  var selectors = [
    "#manualAddModal .jdp-input",
    "#teacherInfoModal .jdp-input"
  ];
  for (var s = 0; s < selectors.length; s++) {
    var inputs = document.querySelectorAll(selectors[s]);
    for (var i = 0; i < inputs.length; i++) {
      (function(input) {
        var fresh = input.cloneNode(true);
        input.parentNode.replaceChild(fresh, input);
        fresh.addEventListener("click", function(e) { e.stopPropagation(); JDP.open(this); });
        fresh.addEventListener("keydown", function(e) { if(e.key==="Escape") JDP.close(); });
      })(inputs[i]);
    }
  }
}

// ==================== ENTER KEY FOR TAGS ====================
window.addEventListener("DOMContentLoaded", function() {
  var si = document.getElementById("subjectInput");
  if (si) si.addEventListener("keypress", function(e){ if(e.key==="Enter"){e.preventDefault();addSubject();} });
  var gi = document.getElementById("gradeInput");
  if (gi) gi.addEventListener("keypress", function(e){ if(e.key==="Enter"){e.preventDefault();addGrade();} });
});

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", function () {
  showTableLoading();
  fetchTeachers();
});

document.addEventListener('DOMContentLoaded', function() {
  var teacherLink = document.querySelector('a[href*="Teacher_management"]');
  if (teacherLink) {
    teacherLink.classList.add('active');
    var parentMenu = teacherLink.closest('.menu-item.has-submenu');
    if (parentMenu) parentMenu.classList.add('open', 'active');
  }
});



function _showErr(input, msg) {
  if (!input) return;
  input.classList.add("error");
  input.classList.remove("success");
  var existing = input.parentElement && input.parentElement.querySelector(".t-field-err");
  if (existing) { existing.textContent = msg; existing.style.display = "block"; return; }
  var span = document.createElement("span");
  span.className = "t-field-err";
  span.textContent = msg;
  if (input.parentElement) input.parentElement.appendChild(span);
}


function _removeErrMsg(input) {
  if (!input || !input.parentElement) return;
  var span = input.parentElement.querySelector(".t-field-err");
  if (span) span.style.display = "none";
}
 
function _shakeInput(el) {
  if (el.classList.contains("t-shaking")) return;
  el.classList.add("t-shaking");
  setTimeout(function() { el.classList.remove("t-shaking"); }, 400);
}



function _setAvatarView(containerId, photoSrc, initial) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (photoSrc) {
    container.innerHTML =
      '<img src="' + photoSrc + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3);cursor:pointer" onclick="downloadTeacherPhoto()" title="کلیک برای دانلود" />' +
      '<div style="font-size:11px;color:rgba(255,255,255,0.5);text-align:center;margin-top:5px;cursor:pointer" onclick="downloadTeacherPhoto()"><i class="fas fa-download"></i> دانلود عکس</div>';
  } else {
    container.innerHTML = '<div class="info-avatar-large">' + initial + '</div>';
  }
}


function _setAvatarEdit(containerId, photoSrc, initial) {
  var container = document.getElementById(containerId);
  if (!container) return;
  if (photoSrc) {
    container.innerHTML =
      '<img src="' + photoSrc + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3)" />';
  } else {
    container.innerHTML = '<div class="info-avatar-large">' + (initial || "؟") + '</div>';
  }
}



function renderEditTags() {
  var sd = document.getElementById("editSubjectsDisplay");
  if (sd) {
    sd.innerHTML = "";
    editSelectedSubjects.forEach(function(v, idx) {
      var tag = document.createElement("div"); tag.className = "tag-item";
      tag.innerHTML = '<span>' + v + '</span><button type="button" class="tag-remove" onclick="editRemoveSubject(' + idx + ')"><i class="fas fa-times"></i></button>';
      sd.appendChild(tag);
    });
  }
  var gd = document.getElementById("editGradesDisplay");
  if (gd) {
    gd.innerHTML = "";
    editSelectedGrades.forEach(function(v, idx) {
      var tag = document.createElement("div"); tag.className = "tag-item";
      tag.innerHTML = '<span>' + v + '</span><button type="button" class="tag-remove" onclick="editRemoveGrade(' + idx + ')"><i class="fas fa-times"></i></button>';
      gd.appendChild(tag);
    });
  }
}

function editAddSubject() {
  var inp = document.getElementById("editSubjectInput"); if (!inp) return;
  var v = inp.value.trim(); if (!v) return;
  if (editSelectedSubjects.indexOf(v) !== -1) { showToast("قبلاً اضافه شده", "warning"); inp.value = ""; return; }
  editSelectedSubjects.push(v); inp.value = ""; renderEditTags();
}
function editAddSubjectSug(s) {
  if (editSelectedSubjects.indexOf(s) !== -1) { showToast("قبلاً اضافه شده", "warning"); return; }
  editSelectedSubjects.push(s); renderEditTags();
}
function editRemoveSubject(idx) { editSelectedSubjects.splice(idx, 1); renderEditTags(); }

function editAddGrade() {
  var inp = document.getElementById("editGradeInput"); if (!inp) return;
  var v = inp.value.trim(); if (!v) return;
  if (editSelectedGrades.indexOf(v) !== -1) { showToast("قبلاً اضافه شده", "warning"); inp.value = ""; return; }
  editSelectedGrades.push(v); inp.value = ""; renderEditTags();
}
function editAddGradeSug(g) {
  if (editSelectedGrades.indexOf(g) !== -1) { showToast("قبلاً اضافه شده", "warning"); return; }
  editSelectedGrades.push(g); renderEditTags();
}
function editRemoveGrade(idx) { editSelectedGrades.splice(idx, 1); renderEditTags(); }