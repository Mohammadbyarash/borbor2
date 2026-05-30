// ==================== HAMBURGER MENU ====================
var menuToggle = document.getElementById("menuToggle");
var sidebar = document.getElementById("sidebar");
var sidebarOverlay = document.getElementById("sidebarOverlay");

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
var assistants = [];
var filteredAssistants = [];
var currentPage = 1;
var rowsPerPage = 5;
var assistantToDelete = null;
var currentEditId = null;
var currentAssistantPhotoData = null;
var newAssistantPhotoData = null;
var ALLOWED_PHOTO_TYPES = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
var MAX_PHOTO_MB = 1;
var API = '../api/assistants.php';

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
function fetchAssistants() {
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
      assistants = data.data || [];
      filteredAssistants = assistants.slice();
      renderAssistantsTable();
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
  var tbody = document.getElementById("assistantsTableBody");
  if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.6);grid-column:1/-1"><i class="fas fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;display:block"></i><p>در حال بارگذاری...</p></div>';
}
function showTableError(msg) {
  var tbody = document.getElementById("assistantsTableBody");
  if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;grid-column:1/-1"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;display:block"></i><p>' + (msg || 'خطا در بارگذاری') + '</p><button onclick="fetchAssistants()" style="margin-top:12px;padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer">تلاش مجدد</button></div>';
}

// ==================== RENDER TABLE ====================
function renderAssistantsTable() {
  var tbody = document.getElementById("assistantsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  var start = (currentPage - 1) * rowsPerPage;
  var page  = filteredAssistants.slice(start, start + rowsPerPage);
  if (page.length === 0) {
    tbody.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.6);grid-column:1/-1"><i class="fas fa-user-slash" style="font-size:48px;margin-bottom:15px;opacity:0.5;display:block"></i><p style="font-size:16px">هیچ معاونی یافت نشد</p></div>';
    updatePagination();
    return;
  }
  for (var i = 0; i < page.length; i++) {
    var a = page[i];
    var row = document.createElement("div");
    row.className = "grid-row";
    var fullName = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
    var initial  = (a.first_name || '؟').charAt(0);
    row.innerHTML =
      '<div class="grid-cell" data-label="معاون"><div class="assistant-info"><div class="assistant-avatar">' + (a.photo ? '<img src="' + a.photo + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />' : initial) + '</div><span class="assistant-name">' + fullName + '</span></div></div>' +
      '<div class="grid-cell" data-label="کد ملی">' + (a.national_code || '-') + '</div>' +
      '<div class="grid-cell" data-label="موبایل">' + (a.mobile || '-') + '</div>' +
      '<div class="grid-cell" data-label="نام کاربری">' + (a.username || '-') + '</div>' +
      '<div class="grid-cell" data-label="وضعیت حضور"><span class="status-badge status-present">حاضر</span></div>' +
      '<div class="grid-cell" data-label="عملیات"><div class="action-btns-vertical"><button class="action-btn-vertical btn-info" onclick="openAssistantInfo(' + a.id + ')"><i class="fas fa-info-circle"></i> اطلاعات</button><button class="action-btn-vertical btn-disable" onclick="openDeleteModal(' + a.id + ')"><i class="fas fa-archive"></i> ارشیو</button></div></div>';
    tbody.appendChild(row);
  }
  updatePagination();
}

// ==================== PAGINATION ====================
function updatePagination() {
  var total    = Math.ceil(filteredAssistants.length / rowsPerPage) || 1;
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
  var total = Math.ceil(filteredAssistants.length / rowsPerPage);
  var next  = currentPage + dir;
  if (next < 1 || next > total) return;
  currentPage = next;
  renderAssistantsTable();
  var tc = document.querySelector(".table-container");
  if (tc) tc.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ==================== STATS ====================
function updateStats() {
  document.getElementById("totalAssistants").textContent   = assistants.length;
  document.getElementById("presentAssistants").textContent = assistants.length;
  document.getElementById("onLeaveAssistants").textContent = 0;
  document.getElementById("activeTasks").textContent       = 0;
}

// ==================== SEARCH ====================
function applyFilters() {
  var searchEl = document.getElementById("assistantSearch");
  var q = searchEl ? searchEl.value.toLowerCase().trim() : '';
  filteredAssistants = assistants.filter(function(a) {
    var name = ((a.first_name || '') + ' ' + (a.last_name || '')).toLowerCase();
    return !q || name.indexOf(q) !== -1 || (a.mobile || '').indexOf(q) !== -1 || (a.national_code || '').indexOf(q) !== -1 || (a.username || '').indexOf(q) !== -1;
  });
  currentPage = 1;
  renderAssistantsTable();
}
var _as = document.getElementById("assistantSearch"); if (_as) _as.addEventListener("input", applyFilters);
var _pf = document.getElementById("positionFilter");  if (_pf) _pf.addEventListener("change", applyFilters);
var _sf = document.getElementById("statusFilter");    if (_sf) _sf.addEventListener("change", applyFilters);

// ==================== INFO MODAL ====================
function openAssistantInfo(id) {
  var a = null;
  for (var i = 0; i < assistants.length; i++) { if (assistants[i].id === id) { a = assistants[i]; break; } }
  if (!a) return;
  currentEditId = id;
  var fullName = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
  document.getElementById("infoAssistantName").textContent       = fullName;
  document.getElementById("infoAssistantPosition").textContent   = '—';
  document.getElementById("infoAssistantExperience").textContent = '—';
  document.getElementById("infoAssistantDegree").textContent     = '—';
  document.getElementById("infoAssistantPhone").textContent      = a.mobile || '-';
  document.getElementById("infoAssistantEmail").textContent      = '—';
  document.getElementById("infoAssistantNationalId").textContent = a.national_code || '-';
  document.getElementById("infoAssistantBirthDate").textContent  = '—';
  document.getElementById("infoAssistantCoopDate").textContent   = '—';
  var avatarContainer = document.getElementById("infoAssistantAvatar");
  avatarContainer.innerHTML = '<div class="info-avatar-large">' + (a.first_name || '؟').charAt(0) + '</div>';
  currentAssistantPhotoData = null;
  document.getElementById("infoViewMode").style.display = "flex";

  document.getElementById("infoEditMode").style.display = "none";
  document.getElementById("editBtn").style.display      = "flex";
  document.getElementById("saveBtn").style.display      = "none";
  document.getElementById("cancelBtn").style.display    = "none";
  document.getElementById("assistantInfoModal").setAttribute("data-assistant-id", id);
  document.getElementById("assistantInfoModal").classList.add("active");
}
function closeAssistantInfoModal() {
  document.getElementById("assistantInfoModal").classList.remove("active");
  currentEditId = null;
}

function enableInfoEdit() {
  var a = null;
  for (var i = 0; i < assistants.length; i++) {
    if (assistants[i].id === currentEditId) { a = assistants[i]; break; }
  }
  if (!a) return;

  var fullName = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
  document.getElementById("editAssistantName").value       = fullName;
  document.getElementById("editAssistantPhone").value      = a.mobile || '';
  document.getElementById("editAssistantNationalId").value = a.national_code || '';
  document.getElementById("editAssistantPosition").value   = '';
  document.getElementById("editAssistantDegree").value     = '';
  document.getElementById("editAssistantEmail").value      = '';
  document.getElementById("editAssistantBirthDate").value  = '';
  document.getElementById("editAssistantCoopDate").value   = '';

  // آواتار در حالت ویرایش
  currentAssistantPhotoData = a.photo || null;
  var editAvatarContainer = document.getElementById("infoAssistantAvatarEdit");
  if (editAvatarContainer) {
    if (a.photo) {
      editAvatarContainer.innerHTML = '<img src="' + a.photo + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3)" />';
    } else {
      editAvatarContainer.innerHTML = '<div class="info-avatar-large">' + (a.first_name || '؟').charAt(0) + '</div>';
    }
  }

  document.getElementById("infoViewMode").style.display = "none";
  document.getElementById("infoEditMode").style.display = "flex";
  document.getElementById("editBtn").style.display      = "none";
  document.getElementById("saveBtn").style.display      = "flex";
  document.getElementById("cancelBtn").style.display    = "flex";
  setTimeout(function() { initJdpInputs(); }, 50);
}

function saveInfoEdit() {
  var nameVal      = document.getElementById("editAssistantName").value.trim();
  var nameParts    = nameVal.split(' ');
  var firstName    = nameParts[0] || '';
  var lastName     = nameParts.slice(1).join(' ');
  var mobile       = document.getElementById("editAssistantPhone").value.trim();
  var nationalCode = document.getElementById("editAssistantNationalId").value.trim();

  if (!firstName || !mobile || !nationalCode) {
    showToast("نام، موبایل و کد ملی الزامی است", "error"); return;
  }

  var saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';

  var payload = {
    id:            currentEditId,
    first_name:    firstName,
    last_name:     lastName,
    mobile:        mobile,
    national_code: nationalCode
  };
  if (currentAssistantPhotoData && currentAssistantPhotoData.startsWith("data:")) {
    payload.photo = currentAssistantPhotoData;
  }

  apiPut(payload)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      for (var i = 0; i < assistants.length; i++) {
        if (assistants[i].id === currentEditId) {
          assistants[i].first_name    = firstName;
          assistants[i].last_name     = lastName;
          assistants[i].mobile        = mobile;
          assistants[i].national_code = nationalCode;
          if (payload.photo) assistants[i].photo = payload.photo;
          break;
        }
      }
      filteredAssistants = assistants.slice();
      renderAssistantsTable();
      updateStats();
      closeAssistantInfoModal();
      showToast("اطلاعات با موفقیت به‌روزرسانی شد", "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در ذخیره", "error"); })
    .then(function() {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-check"></i> ذخیره';
    });
}


function cancelInfoEdit() {
  document.getElementById("infoViewMode").style.display = "flex";
  document.getElementById("infoEditMode").style.display = "none";
  document.getElementById("editBtn").style.display      = "flex";
  document.getElementById("saveBtn").style.display      = "none";
  document.getElementById("cancelBtn").style.display    = "none";
}

// ==================== ADD ASSISTANT MODAL ====================

function openAddAssistantModal() {
  var fields = ['addAssistantFirstName','addAssistantLastName','addAssistantPhone',
                'addAssistantEmail','addAssistantNationalId','addAssistantBirthDate',
                'addAssistantCoopDate','addAssistantField','addAssistantExperience',
                'addAssistantUsername','addAssistantPassword'];
  var legacyName = document.getElementById('addAssistantName');
  if (legacyName) legacyName.value = '';
  for (var i = 0; i < fields.length; i++) {
    var el = document.getElementById(fields[i]);
    if (el) { el.value = ''; el.classList.remove('error','success'); }
  }
  var pos = document.getElementById("addAssistantPosition"); if (pos) { pos.value = ''; pos.classList.remove('error','success'); }
  var deg = document.getElementById("addAssistantDegree");   if (deg) { deg.value = ''; deg.classList.remove('error','success'); }

  // ریست عکس
  newAssistantPhotoData = null;
  var img = document.getElementById("newAssistantPhotoPreview");
  var ph  = document.getElementById("newAssistantPhotoPH");
  if (img) { img.src = ""; img.style.display = "none"; }
  if (ph)  ph.style.display = "flex";

  document.getElementById("saveAssistantBtn").disabled = true;
  document.getElementById("addAssistantModal").classList.add("active");
  setupLiveValidation();
  setTimeout(function() { initJdpInputs(); }, 50);
}

function closeAddAssistantModal() { document.getElementById("addAssistantModal").classList.remove("active"); }

function setupLiveValidation() {
  var inputs = document.querySelectorAll("#addAssistantModal .form-input");
  var arr = [];
  for (var i = 0; i < inputs.length; i++) { if (!inputs[i].classList.contains('jdp-input')) arr.push(inputs[i]); }
  for (var i = 0; i < arr.length; i++) { var fresh = arr[i].cloneNode(true); arr[i].parentNode.replaceChild(fresh, arr[i]); }
  var newInputs = document.querySelectorAll("#addAssistantModal .form-input");
  for (var i = 0; i < newInputs.length; i++) {
    if (newInputs[i].classList.contains('jdp-input')) continue;
    (function(inp) {
      inp.addEventListener("input", function() {
        this.value = faToEnNumbers(this.value);
        if (this.id === "addAssistantNationalId") this.value = this.value.replace(/\D/g, '').substring(0, 10);
        if (this.id === "addAssistantPhone")      this.value = this.value.replace(/\D/g, '').substring(0, 11);
        validateInput(this); validateAddAssistantForm();
      });
      inp.addEventListener("blur",   function() { validateInput(this); validateAddAssistantForm(); });
      inp.addEventListener("change", function() { validateInput(this); validateAddAssistantForm(); });
    })(newInputs[i]);
  }
}

function validateInput(input) {
  var value = input.value.trim();
  input.classList.remove("error", "success");
  if (input.classList.contains("jdp-input")) { if (value) input.classList.add("success"); return true; }
  var optionalFields = ['addAssistantLastName','addAssistantEmail','addAssistantBirthDate','addAssistantCoopDate','addAssistantField','addAssistantExperience','addAssistantPosition','addAssistantDegree'];
  for (var i = 0; i < optionalFields.length; i++) {
    if (input.id === optionalFields[i]) { if (value) input.classList.add("success"); return true; }
  }
  if (!value) { input.classList.add("error"); return false; }
  if (input.id === "addAssistantNationalId" && !isValidNationalCode(value)) { input.classList.add("error"); return false; }
  if (input.id === "addAssistantPhone"      && !isValidMobile(value))       { input.classList.add("error"); return false; }
  if (input.id === "addAssistantPassword"   && value.length < 6)            { input.classList.add("error"); return false; }
  input.classList.add("success"); return true;
}

function validateAddAssistantForm() {
  var firstName = '';
  var firstNameEl = document.getElementById("addAssistantFirstName");
  var nameEl      = document.getElementById("addAssistantName");
  if (firstNameEl) { firstName = firstNameEl.value.trim(); }
  else if (nameEl) { firstName = nameEl.value.trim().split(' ')[0] || ''; }
  var phoneEl = document.getElementById("addAssistantPhone");
  var natEl   = document.getElementById("addAssistantNationalId");
  var passEl  = document.getElementById("addAssistantPassword");
  var phone = phoneEl ? phoneEl.value.trim() : '';
  var nat   = natEl   ? natEl.value.trim()   : '';
  var pass  = passEl  ? passEl.value.trim()  : '';
  var isValid = firstName && phone && nat && pass && isValidMobile(phone) && isValidNationalCode(nat) && pass.length >= 6;
  var btn = document.getElementById("saveAssistantBtn"); if (btn) btn.disabled = !isValid;
  return isValid;
}

function saveNewAssistant() {
  if (!validateAddAssistantForm()) { showToast("لطفاً فیلدهای الزامی را پر کنید", "error"); return; }

  var firstName = '', lastName = '';
  var firstNameEl = document.getElementById("addAssistantFirstName");
  var lastNameEl  = document.getElementById("addAssistantLastName");
  var nameEl      = document.getElementById("addAssistantName");
  if (firstNameEl) {
    firstName = firstNameEl.value.trim();
    lastName  = lastNameEl ? lastNameEl.value.trim() : '';
  } else if (nameEl) {
    var nameParts = nameEl.value.trim().split(' ');
    firstName = nameParts[0] || '';
    lastName  = nameParts.slice(1).join(' ');
  }

  var mobile   = faToEnNumbers(document.getElementById("addAssistantPhone").value.trim());
  var natCode  = faToEnNumbers(document.getElementById("addAssistantNationalId").value.trim());
  var userEl   = document.getElementById("addAssistantUsername");
  var username = userEl ? userEl.value.trim() : natCode;
  if (!username) username = natCode;
  var password = document.getElementById("addAssistantPassword").value.trim();

  var btn = document.getElementById("saveAssistantBtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
  var formEl = document.querySelector("#addAssistantModal .add-assistant-form");
  if (formEl) { formEl.style.opacity = '0.4'; formEl.style.pointerEvents = 'none'; }

  var newPayload = {
    first_name:    firstName,
    last_name:     lastName,
    mobile:        mobile,
    national_code: natCode,
    username:      username,
    password:      password
  };
  if (newAssistantPhotoData) newPayload.photo = newAssistantPhotoData;

  apiPost(newPayload)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      fetchAssistants();
      closeAddAssistantModal();
      showToast((firstName + ' ' + lastName).trim() + ' با موفقیت اضافه شد', 'success');
    })
    .catch(function(err) { showToast(err.message || "خطا در افزودن معاون", "error"); })
    .then(function() {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus"></i> افزودن معاون';
      if (formEl) { formEl.style.opacity = ''; formEl.style.pointerEvents = ''; }
    });
}



// ==================== DELETE MODAL (آرشیو) ====================
function openDeleteModal(id) {
  var a = null;
  for (var i = 0; i < assistants.length; i++) { if (assistants[i].id === id) { a = assistants[i]; break; } }
  if (!a) return;
  assistantToDelete = a;
  document.getElementById("deleteAssistantName").textContent = ((a.first_name || '') + ' ' + (a.last_name || '')).trim();
  document.getElementById("deletePermanentModal").classList.add("active");
}
function closeDeletePermanentModal() {
  document.getElementById("deletePermanentModal").classList.remove("active");
  assistantToDelete = null;
}
function confirmDeletePermanent() {
  if (!assistantToDelete) return;
  var id = assistantToDelete.id;
  var fullName = ((assistantToDelete.first_name || '') + ' ' + (assistantToDelete.last_name || '')).trim();
  var btn = document.querySelector("#deletePermanentModal .confirm-btn.btn-danger");
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال آرشیو...'; }

  // ارسال به API آرشیو
  apiDelete(id)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      assistants         = assistants.filter(function(x) { return x.id !== id; });
      filteredAssistants = filteredAssistants.filter(function(x) { return x.id !== id; });
      closeDeletePermanentModal();
      renderAssistantsTable();
      updateStats();
      showToast(fullName + ' با موفقیت آرشیو شد', 'success');
    })
    .catch(function(err) { showToast(err.message || "خطا در آرشیو", "error"); })
    .then(function() {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-archive"></i> ارشیو'; }
      assistantToDelete = null;
    });
}

// ==================== UNUSED ====================
function openAssistantDetails() { showToast("این بخش به زودی فعال می‌شود", "info"); }
function closeAssistantDetailsModal() { var el = document.getElementById("assistantDetailsModal"); if (el) el.classList.remove("active"); }
function disableAssistant(id) { openDeleteModal(id); }
function closeDisableModal() { var el = document.getElementById("disableConfirmModal"); if (el) el.classList.remove("active"); }
function confirmDisableAssistant() { closeDisableModal(); }
function enableAssistant() {}
function openAddTaskModal() { showToast("این بخش به زودی فعال می‌شود", "info"); }
function exportAssistantsExcel() { showToast("خروجی Excel در حال آماده‌سازی است...", "info"); }
function setAssistantStatus() {} function handleInfoPhotoUpload() {}

// ==================== TOAST ====================
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

// ==================== HELPERS ====================
function faToEnNumbers(str) {
  if (typeof str !== "string") return "";
  var map = {"۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"};
  return str.replace(/[۰-۹]/g, function(w) { return map[w]; });
}
function isValidNationalCode(val) { return /^\d{10}$/.test(val); }
function isValidMobile(val)       { return /^09\d{9}$/.test(val); }

// ==================== JALALI DATE PICKER ====================
var JDP = (function() {
  var JALALI_MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  
function toJalali(gy, gm, gd) {
  var msPerDay = 86400000;
  var diff = Math.round(
    (new Date(+gy, +gm - 1, +gd).getTime() - new Date(1970, 0, 1).getTime()) / msPerDay
  );
  var jy = 1348, jm = 10, jd = 11;
  jd += diff;
  while (jd > _jDays(jy, jm)) { 
    jd -= _jDays(jy, jm); jm++; 
    if (jm > 12) { jm = 1; jy++; } 
  }
  while (jd < 1) { 
    jm--; 
    if (jm < 1) { jm = 12; jy--; } 
    jd += _jDays(jy, jm); 
  }
  return [jy, jm, jd];
}

function toGregorian(jy, jm, jd) {
  var ry = 1348, rm = 10, rd = 11, diff = 0;
  while (ry < jy || (ry === jy && rm < jm) || (ry === jy && rm === jm && rd < jd)) {
    rd++; 
    if (rd > _jDays(ry, rm)) { rd = 1; rm++; if (rm > 12) { rm = 1; ry++; } } 
    diff++;
  }
  while (ry > jy || (ry === jy && rm > jm) || (ry === jy && rm === jm && rd > jd)) {
    rd--; 
    if (rd < 1) { rm--; if (rm < 1) { rm = 12; ry--; } rd = _jDays(ry, rm); } 
    diff--;
  }
  var g = new Date(1970, 0, 1 + diff);
  return [g.getFullYear(), g.getMonth() + 1, g.getDate()];
}

function _jDays(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // اسفند - کبیسه شمسی
  return ((((jy - (jy > 0 ? 474 : 473)) % 2820) + 474 + 38) * 682) % 2816 < 682 ? 30 : 29;
}

  function toGregorian(jy,jm,jd){var j_d_no=[31,31,31,31,31,31,30,30,30,30,30,29];jy-=979;jm-=1;var j_day_no=365*jy+Math.floor(jy/33)*8+Math.floor((jy%33+3)/4);for(var i=0;i<jm;i++)j_day_no+=j_d_no[i];j_day_no+=jd-1;var g_day_no=j_day_no+79,gy=1600+400*Math.floor(g_day_no/146097);g_day_no%=146097;var leap=true;if(g_day_no>=36525){g_day_no--;gy+=100*Math.floor(g_day_no/36524);g_day_no%=36524;if(g_day_no>=365)g_day_no++;else leap=false;}gy+=4*Math.floor(g_day_no/1461);g_day_no%=1461;if(g_day_no>=366){leap=false;g_day_no--;gy+=Math.floor(g_day_no/365);g_day_no%=365;}var g_d_no=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31],gm;for(gm=0;gm<12&&g_day_no>=g_d_no[gm];gm++)g_day_no-=g_d_no[gm];return[gy,gm+1,g_day_no+1];}
  
  function jalaliMonthLength(jy,jm){if(jm<=6)return 31;return 30;}

  function firstDayOfMonth(jy,jm){var r=toGregorian(jy,jm,1);return(new Date(r[0],r[1]-1,r[2]).getDay()+1)%7;}
  function toFa(n){return String(n).replace(/\d/g,function(d){return"۰۱۲۳۴۵۶۷۸۹"[d];});}
  var curJY,curJM,curJD=null,viewJY,viewJM,activeInput=null,viewMode="day",yearRangeStart;
  function todayJalali(){var n=new Date();return toJalali(n.getFullYear(),n.getMonth()+1,n.getDate());}
  function open(input){activeInput=input;var val=input.value.trim();if(val&&/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(val)){var p=val.split("/").map(Number);curJY=p[0];curJM=p[1];curJD=p[2];viewJY=curJY;viewJM=curJM;}else{curJD=null;var t=todayJalali();viewJY=t[0];viewJM=t[1];}viewMode="day";yearRangeStart=Math.floor(viewJY/12)*12;render();positionPopup(input);document.getElementById("jdp-custom-overlay").style.display="block";document.getElementById("jdp-custom-popup").style.display="block";}
  function close(){document.getElementById("jdp-custom-overlay").style.display="none";document.getElementById("jdp-custom-popup").style.display="none";activeInput=null;}
  function positionPopup(input){var popup=document.getElementById("jdp-custom-popup"),rect=input.getBoundingClientRect(),popupH=380,popupW=300,vw=window.innerWidth,vh=window.innerHeight,top=rect.bottom+6,left=rect.right-popupW;if(left<8)left=8;if(left+popupW>vw-8)left=vw-popupW-8;if(top+popupH>vh-8)top=rect.top-popupH-6;if(top<8)top=8;popup.style.top=top+"px";popup.style.left=left+"px";}
  function render(){var vs=["#jdpDayView","#jdpMonthView","#jdpYearView"];for(var i=0;i<vs.length;i++){var el=document.querySelector(vs[i]);if(el)el.style.display="none";}var pB=document.getElementById("jdpPrevBtn"),nB=document.getElementById("jdpNextBtn");if(viewMode==="day"){document.getElementById("jdpDayView").style.display="block";document.getElementById("jdpMonthYear").textContent=JALALI_MONTHS[viewJM-1]+" "+toFa(viewJY);renderDays();pB.onclick=function(){navMonth(-1);};nB.onclick=function(){navMonth(1);};}else if(viewMode==="month"){document.getElementById("jdpMonthView").style.display="block";document.getElementById("jdpMonthYear").textContent=toFa(viewJY);document.getElementById("jdpYearLabel").textContent=toFa(viewJY);renderMonths();pB.onclick=function(){viewJY--;render();};nB.onclick=function(){viewJY++;render();};}else{document.getElementById("jdpYearView").style.display="block";document.getElementById("jdpYearRangeLabel").textContent=toFa(yearRangeStart)+" - "+toFa(yearRangeStart+11);document.getElementById("jdpMonthYear").textContent=toFa(yearRangeStart)+" - "+toFa(yearRangeStart+11);renderYears();pB.onclick=function(){yearRangeStart-=12;render();};nB.onclick=function(){yearRangeStart+=12;render();};}}
  function renderDays(){var grid=document.getElementById("jdpDaysGrid");grid.innerHTML="";var firstDay=firstDayOfMonth(viewJY,viewJM),daysInMonth=jalaliMonthLength(viewJY,viewJM),t=todayJalali(),ty=t[0],tm=t[1],td=t[2];for(var i=0;i<firstDay;i++){var emp=document.createElement("div");emp.className="jdp-day empty";grid.appendChild(emp);}for(var d=1;d<=daysInMonth;d++){(function(day){var el=document.createElement("div");el.className="jdp-day";el.textContent=toFa(day);if(viewJY===ty&&viewJM===tm&&day===td)el.classList.add("today");if(curJD&&viewJY===curJY&&viewJM===curJM&&day===curJD)el.classList.add("selected");el.addEventListener("click",function(){selectDay(day);});grid.appendChild(el);})(d);}}
  function renderMonths(){var grid=document.getElementById("jdpMonthGrid");grid.innerHTML="";for(var i=0;i<JALALI_MONTHS.length;i++){(function(idx){var el=document.createElement("div");el.className="jdp-ym-item";el.textContent=JALALI_MONTHS[idx];if(idx+1===viewJM)el.classList.add("active");el.addEventListener("click",function(){viewJM=idx+1;viewMode="day";render();});grid.appendChild(el);})(i);}}
  function renderYears(){var grid=document.getElementById("jdpYearGrid");grid.innerHTML="";document.getElementById("jdpYearRangePrev").onclick=function(){yearRangeStart-=12;render();};document.getElementById("jdpYearRangeNext").onclick=function(){yearRangeStart+=12;render();};for(var y=yearRangeStart;y<yearRangeStart+12;y++){(function(year){var el=document.createElement("div");el.className="jdp-ym-item";el.textContent=toFa(year);if(year===viewJY)el.classList.add("active");el.addEventListener("click",function(){viewJY=year;viewMode="month";render();});grid.appendChild(el);})(y);}}
  function navMonth(dir){viewJM+=dir;if(viewJM>12){viewJM=1;viewJY++;}if(viewJM<1){viewJM=12;viewJY--;}render();}
  function selectDay(d){curJY=viewJY;curJM=viewJM;curJD=d;if(activeInput){activeInput.value=curJY+"/"+String(curJM).padStart(2,"0")+"/"+String(curJD).padStart(2,"0");activeInput.classList.remove("error");activeInput.classList.add("success");activeInput.dispatchEvent(new Event("change",{bubbles:true}));activeInput.dispatchEvent(new Event("input",{bubbles:true}));validateAddAssistantForm();}render();setTimeout(close,120);}
  function jdpGoToday(){var t=todayJalali();viewJY=t[0];viewJM=t[1];viewMode="day";yearRangeStart=Math.floor(t[0]/12)*12;render();selectDay(t[2]);}
  function jdpClear(){curJD=null;if(activeInput){activeInput.value="";activeInput.classList.remove("success");activeInput.dispatchEvent(new Event("change",{bubbles:true}));validateAddAssistantForm();}render();close();}
  function jdpToggleMonthView(){if(viewMode==="day")viewMode="month";else if(viewMode==="month"){viewMode="year";yearRangeStart=Math.floor(viewJY/12)*12;}else viewMode="day";render();}
  return {open:open,close:close,jdpGoToday:jdpGoToday,jdpClear:jdpClear,jdpToggleMonthView:jdpToggleMonthView};
})();

function jdpGoToday()         { JDP.jdpGoToday(); }
function jdpClear()           { JDP.jdpClear(); }
function jdpToggleMonthView() { JDP.jdpToggleMonthView(); }

var _ov = document.getElementById("jdp-custom-overlay");
if (_ov) _ov.addEventListener("click", function() { JDP.close(); });

function initJdpInputs() {
  var selectors = ["#addAssistantModal .jdp-input", "#assistantInfoModal .jdp-input"];
  for (var s = 0; s < selectors.length; s++) {
    var inputs = document.querySelectorAll(selectors[s]);
    for (var i = 0; i < inputs.length; i++) {
      (function(input) {
        var fresh = input.cloneNode(true); input.parentNode.replaceChild(fresh, input);
        fresh.addEventListener("click", function(e) { e.stopPropagation(); JDP.open(this); });
        fresh.addEventListener("keydown", function(e) { if(e.key==="Escape") JDP.close(); });
      })(inputs[i]);
    }
  }
}

function processAssistantPhoto(file, callback) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    showToast("فقط JPG، PNG، WEBP و GIF مجاز است", "error"); return;
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    showToast("حجم عکس نباید بیشتر از ۱ مگابایت باشد", "error"); return;
  }
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement("canvas");
      var w = img.width, h = img.height, max = 600;
      if (w > max || h > max) {
        if (w > h) { h = Math.round(h * max / w); w = max; }
        else        { w = Math.round(w * max / h); h = max; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAssistantPhotoUpload(input) {
  var file = input.files[0];
  if (!file) return;
  processAssistantPhoto(file, function(dataUrl) {
    currentAssistantPhotoData = dataUrl;
    var container = document.getElementById("infoAssistantAvatarEdit");
    if (container) {
      container.innerHTML = '<img src="' + dataUrl + '" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3)" />';
    }
    showToast("عکس بارگذاری شد", "success");
  });
  input.value = "";
}
// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", function () {
  showTableLoading();
  fetchAssistants();
  initJdpInputs();

  var _im = document.getElementById("assistantInfoModal");   if (_im) _im.addEventListener("click", function(e){ if(e.target===this) closeAssistantInfoModal(); });
  var _am = document.getElementById("addAssistantModal");    if (_am) _am.addEventListener("click", function(e){ if(e.target===this) closeAddAssistantModal(); });
  var _dm = document.getElementById("deletePermanentModal"); if (_dm) _dm.addEventListener("click", function(e){ if(e.target===this) closeDeletePermanentModal(); });
  var _dsm= document.getElementById("disableConfirmModal");  if (_dsm)_dsm.addEventListener("click",function(e){ if(e.target===this) closeDisableModal(); });
  var _adm= document.getElementById("assistantDetailsModal");if (_adm)_adm.addEventListener("click",function(e){ if(e.target===this) closeAssistantDetailsModal(); });

  var assistantLink = document.querySelector('a[href*="Assistant_management"]');
  if (assistantLink) {
    assistantLink.classList.add('active');
    var parentMenu = assistantLink.closest('.menu-item.has-submenu');
    if (parentMenu) parentMenu.classList.add('open', 'active');
  }
});




function handleNewAssistantPhoto(input) {
  var file = input.files[0];
  if (!file) return;
  processAssistantPhoto(file, function(dataUrl) {
    newAssistantPhotoData = dataUrl;
    var img = document.getElementById("newAssistantPhotoPreview");
    var ph  = document.getElementById("newAssistantPhotoPH");
    if (img) { img.src = dataUrl; img.style.display = "block"; }
    if (ph)  ph.style.display = "none";
    showToast("عکس بارگذاری شد", "success");
  });
  input.value = "";
}