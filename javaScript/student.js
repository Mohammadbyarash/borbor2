// ==================== CONFIG ====================
const API = "/borbor/api/students.php";
const UPLOADS_URL = "/borbor/uploads/students/";

// ==================== PHOTO URL ====================
function photoUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return "/borbor/" + path;
}
// ==================== STATE ====================
let classes = {};
let currentClassId = null;
let currentStudentId = null;
let classToDelete = null;
let classToArchive = null;
let studentToArchive = null;
let newStudentPhotoData = null;
let currentImageQuality = 0.6;
let currentStudentPhoto = null;

// ==================== EDUCATION MAP ====================
const educationLevels = {
  bisavad: "بی‌سواد",
  nahzat: "نهضت سواد آموزی",
  ebtida: "ابتدایی",
  sikol: "سیکل",
  diplom: "دیپلم",
  fawq_diplom: "فوق دیپلم",
  karshenas: "کارشناسی (لیسانس)",
  karshenas_napeyvaeste: "کارشناسی ناپیوسته",
  karshenas_arshad: "کارشناسی ارشد (فوق لیسانس)",
  doktori: "دکتری",
  fawq_doktori: "فوق دکتری (پست‌دکتری)",
};

// ==================== HELPERS ====================
function faToEnNumbers(str) {
  if (typeof str !== "string") return "";
  var map = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  return str.replace(/[۰-۹]/g, function (w) {
    return map[w];
  });
}
function isValidNationalCode(val) {
  return /^\d{10}$/.test(val);
}
function isValidMobile(val) {
  return /^09\d{9}$/.test(val);
}

// ==================== API ====================
function apiGet(params = {}) {
  return fetch(API + "?" + new URLSearchParams(params), {
    credentials: "include",
  }).then((r) => r.json());
}
function apiPost(body) {
  return fetch(API, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}
function apiPut(body) {
  return fetch(API, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}
function apiDelete(body) {
  return fetch(API, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", function () {
  loadClasses();
  initMenu();
  initModalCloseListeners();
  setupAddStudentValidation();
  setupNameFieldListeners();  // ← جدید
  setupPhotoInputAccept();    // ← جدید
});

function setupNameFieldListeners() {
  document.addEventListener("keydown", function (e) {
    if (!NAME_FIELD_IDS.includes(e.target.id)) return;
    // اجازه: کلیدهای کنترلی
    const allowed = ["Backspace","Delete","Tab","Enter","ArrowLeft","ArrowRight",
                     "ArrowUp","ArrowDown","Home","End"];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    // بلوک: ارقام انگلیسی
    if (/^\d$/.test(e.key)) { e.preventDefault(); shakeInput(e.target); return; }
    // بلوک: ارقام فارسی / عربی
    if (/^[\u06F0-\u06F9\u0660-\u0669]$/.test(e.key)) { e.preventDefault(); shakeInput(e.target); return; }
  });
 
  document.addEventListener("input", function (e) {
    if (!NAME_FIELD_IDS.includes(e.target.id)) return;
    // پاک‌سازی هر رقمی که از روش‌های دیگر (paste ، IME) وارد شده
    const before = e.target.value;
    const after  = before.replace(/[\d\u06F0-\u06F9\u0660-\u0669]/g, "");
    if (before !== after) {
      const pos = e.target.selectionStart - (before.length - after.length);
      e.target.value = after;
      try { e.target.setSelectionRange(pos, pos); } catch (ex) {}
      showFieldError(e.target, "نام نمی‌تواند شامل عدد باشد");
      setTimeout(() => {
        if (!e.target.value.replace(/[\d\u06F0-\u06F9\u0660-\u0669]/g, "").match(/[\d]/))
          clearFieldError(e.target);
      }, 2000);
    }
  });
 
  document.addEventListener("paste", function (e) {
    if (!NAME_FIELD_IDS.includes(e.target.id)) return;
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = pasted.replace(/[\d\u06F0-\u06F9\u0660-\u0669]/g, "");
    const el = e.target;
    const newVal = (
      el.value.slice(0, el.selectionStart) + cleaned + el.value.slice(el.selectionEnd)
    );
    el.value = newVal;
    if (pasted !== cleaned) showFieldError(el, "اعداد از متن حذف شدند");
    validateFieldById(el.id);
    validateAddStudentForm();
  });
}


function initMenu() {
  const toggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (toggle)
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    });
  if (overlay)
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  const link = document.querySelector('a[href*="student"]');
  if (link) {
    link.classList.add("active");
    const p = link.closest(".menu-item.has-submenu");
    if (p) p.classList.add("open", "active");
  }
}

// ==================== LOAD CLASSES ====================
function loadClasses() {
  showLoader();

  fetch("/borbor/api/stats.php", { credentials: "include" })
    .then((r) => r.json())
    .then((d) => {
      if (d.success && d.currentUser) {
        const el = document.getElementById("adminInfo");
        if (el)
          el.textContent =
            (d.currentUser.role_label || "") +
            " : " +
            (d.currentUser.name || "");
      }
    })
    .catch(() => {});

  apiGet({ action: "classes" })
    .then((data) => {
      hideLoader();
      if (!data.success) throw new Error(data.message || "خطا");
      classes = {};
      (data.data || []).forEach((c) => {
        classes[c.id] = c;
      });
      renderClasses();
    })
    .catch((err) => {
      hideLoader();
      toast("خطا: " + err.message, true);
    });
}

function showLoader() {
  const el = document.getElementById("pageLoader");
  if (el) {
    el.classList.remove("hide");
    el.style.display = "flex";
  }
}
function hideLoader() {
  const el = document.getElementById("pageLoader");
  if (!el) return;
  el.classList.add("hide");
  setTimeout(function () {
    el.style.display = "none";
    el.classList.remove("hide");
  }, 550);
}

// ==================== RENDER CLASSES ====================
function renderClasses() {
  const grid = document.getElementById("classesGrid");
  grid.innerHTML = "";
  const arr = Object.values(classes);
  if (!arr.length) {
    grid.innerHTML =
      '<div style="text-align:center;padding:60px;color:rgba(255,255,255,0.4);grid-column:1/-1"><i class="fas fa-school" style="font-size:48px;display:block;margin-bottom:14px"></i><p>هیچ کلاسی ثبت نشده</p></div>';
    return;
  }
  arr.forEach((c) => {
    const card = document.createElement("div");
    card.className = "class-card";
    card.innerHTML = `
            <button class="delete-class-btn" onclick="openDeleteClassModal(${c.id})"><i class="fas fa-times"></i></button>
            <div class="class-header">
                <span class="class-number">کلاس ${c.code || c.id}</span>
                <span class="class-grade">${c.grade || ""}</span>
            </div>
            <div class="class-info">
                <div class="info-row"><span class="info-label">رشته:</span><span class="info-value">${c.field || "-"}</span></div>
                <div class="info-row"><span class="info-label">تعداد دانش‌آموزان:</span><span class="info-value">${c.student_count || 0} نفر</span></div>
            </div>
            <div class="class-actions">
                <button class="btn btn-students" onclick="showStudents(${c.id})">مشخصات</button>
            </div>
            <button class="btn btn-archive" onclick="openArchiveClassModal(${c.id})">
                <i class="fas fa-archive"></i> انتقال به ارشیو
            </button>`;
    grid.appendChild(card);
  });
  const countEl = document.getElementById("allClassesCount");
  if (countEl) countEl.textContent = arr.length + " کلاس";
}

// ==================== SHOW STUDENTS ====================
function showStudents(classId) {
  currentClassId = classId;
  const c = classes[classId];
  document.getElementById("studentsModalTitle").textContent =
    `لیست دانش‌آموزان - کلاس ${c.code || classId} (${c.grade || ""} ${c.field || ""})`;
  const container = document.getElementById("studentsContainer");
  container.innerHTML =
    '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">در حال بارگذاری...</div>';
  document.getElementById("studentsModal").classList.add("active");

  apiGet({ action: "students", class_id: classId })
    .then((data) => {
      if (!data.success) throw new Error(data.message);
      renderStudentCards(data.data || []);
    })
    .catch((err) => {
      container.innerHTML = `<div style="text-align:center;padding:30px;color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> خطا: ${err.message}</div>`;
    });
}

function renderStudentCards(students) {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = "";
  if (!students.length) {
    container.innerHTML =
      '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.4);"><i class="fas fa-user-graduate" style="font-size:42px;display:block;margin-bottom:12px"></i><p>هیچ دانش‌آموزی در این کلاس ثبت نشده</p></div>';
    return;
  }
  students.forEach((s) => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.setAttribute("data-student-code", s.national_code || "");
    card.setAttribute("data-student-name", (s.full_name || "").toLowerCase());
    card.setAttribute("data-student-national-id", s.national_code || "");
    card.setAttribute("data-student-phone", s.mobile || "");
    const initial = (s.first_name || "؟").charAt(0);
    const photoHtml = s.photo
      ? `<img src="${photoUrl(s.photo)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-size:22px;">${initial}</span>`
      : initial;
    card.innerHTML = `
            <div class="student-card-header">
                <div class="student-photo-placeholder" style="${s.photo ? "overflow:hidden;" : ""}">${photoHtml}</div>
                <div class="student-card-info">
                    <div class="student-card-name">${s.full_name || "-"}</div>
                    <div class="student-card-code">کد ملی: ${s.national_code || "-"}</div>
                </div>
            </div>
            <div class="student-card-details">
                <div class="student-detail-row">
                    <span class="student-detail-label">شماره همراه:</span>
                    <span class="student-detail-value">${s.mobile || "-"}</span>
                </div>
            </div>
            <div class="student-card-actions">
                <button class="btn-view-student" onclick="showStudentDetails(${currentClassId},${s.id})">
                    <i class="fas fa-eye"></i> مشاهده جزئیات
                </button>
                <button class="btn-archive-student" onclick="openArchiveStudentModal(${currentClassId},${s.id},'${(s.full_name || "").replace(/'/g, "")}')">
                    <i class="fas fa-archive"></i> انتقال به ارشیو
                </button>
            </div>`;
    container.appendChild(card);
  });
}

// ==================== STUDENT DETAILS ====================
function showStudentDetails(classId, studentId) {
  currentClassId = classId;
  currentStudentId = studentId;
  apiGet({ action: "student_detail", student_id: studentId })
    .then((data) => {
      if (!data.success) throw new Error(data.message);
      const s = data.data;

      if (s.photo) {
        document.getElementById("studentAvatarImg").src = photoUrl(s.photo);
        document.getElementById("studentAvatarImg").style.display = "block";
        document.getElementById("studentAvatarPlaceholder").style.display =
          "none";
      } else {
        document.getElementById("studentAvatarPlaceholder").textContent = (
          s.first_name || "؟"
        ).charAt(0);
        document.getElementById("studentAvatarImg").style.display = "none";
        document.getElementById("studentAvatarPlaceholder").style.display =
          "flex";
      }

      document.getElementById("studentName").textContent =
        `${s.first_name || ""} ${s.last_name || ""}`;
      document.getElementById("studentCodeDisplay").textContent =
        `کد ملی: ${s.national_code || "-"}`;
      document.getElementById("editFirstName").value = s.first_name || "";
      document.getElementById("editLastName").value = s.last_name || "";
      document.getElementById("editNationalId").value = s.national_code || "";
      document.getElementById("editMobile").value = s.mobile || "";

      const bdEl = document.getElementById("editBirthdate");
      if (bdEl) bdEl.value = s.birth_date || "";

      [
        "editHomePhone",
        "editFatherName",
        "editFatherNationalId",
        "editFatherBirthdate",
        "editFatherMobile",
        "editFatherJob",
        "editMotherName",
        "editMotherNationalId",
        "editMotherBirthdate",
        "editMotherMobile",
        "editMotherJob",
        "editAddress",
        "editPostalCode",
      ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      ["editFatherEducation", "editMotherEducation"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });

      currentStudentPhoto = s.photo || null;

      document.getElementById("studentDetailsModal").classList.add("active");
      setTimeout(() => initStudentJdpInputs(), 100);
    })
    .catch((err) => toast("خطا: " + err.message, true));
}

function saveStudentDetails() {
  if (!currentStudentId) return;
 
  // validate همه فیلدهای ویرایش
  const fieldsToValidate = [
    "editFirstName","editLastName","editNationalId","editMobile",
    "editHomePhone","editFatherNationalId","editMotherNationalId",
    "editFatherMobile","editMotherMobile","editPostalCode",
  ];
  let hasError = false;
  fieldsToValidate.forEach(id => {
    const el = document.getElementById(id);
    if (el && !validateStudentInputField(el)) hasError = true;
  });
  if (hasError) {
    toast("لطفاً خطاهای مشخص‌شده را برطرف کنید", true);
    return;
  }
 
  const firstName    = document.getElementById("editFirstName").value.trim();
  const lastName     = document.getElementById("editLastName").value.trim();
  const nationalCode = faToEnNumbers(document.getElementById("editNationalId").value.trim());
  const mobile       = faToEnNumbers(document.getElementById("editMobile").value.trim());
  const birthDate    = document.getElementById("editBirthdate")?.value.trim() || "";
 
  if (!firstName || !lastName) { toast("نام و نام خانوادگی الزامی است", true); return; }
 
  const body = {
    id: currentStudentId,
    first_name:    firstName,
    last_name:     lastName,
    national_code: nationalCode,
    mobile:        mobile,
    birth_date:    birthDate,
    photo: currentStudentPhoto && currentStudentPhoto.startsWith("data:")
           ? currentStudentPhoto : undefined,
  };
 
  apiPut(body)
    .then(data => {
      if (!data.success) throw new Error(data.message);
      if (data.photo) currentStudentPhoto = data.photo;
      closeStudentDetailsModal();
      showStudents(currentClassId);
      toast("اطلاعات ذخیره شد!");
    })
    .catch(err => toast("خطا: " + err.message, true));
}


// ==================== ADD STUDENT ====================
function openAddStudentOptionsModal() {
  document.getElementById("addStudentOptionsModal").classList.add("active");
}
function closeAddStudentOptionsModal() {
  document.getElementById("addStudentOptionsModal").classList.remove("active");
}

function openAddStudentFormModal() {
  closeAddStudentOptionsModal();
  [
    "newFirstName",
    "newLastName",
    "newNationalId",
    "newBirthdate",
    "newMobile",
    "newHomePhone",
    "newFatherName",
    "newFatherNationalId",
    "newFatherBirthdate",
    "newFatherMobile",
    "newFatherJob",
    "newMotherName",
    "newMotherNationalId",
    "newMotherBirthdate",
    "newMotherMobile",
    "newMotherJob",
    "newAddress",
    "newPostalCode",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = "";
      el.classList.remove("error", "success");
    }
  });
  ["newFatherEducation", "newMotherEducation"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  newStudentPhotoData = null;
  document.getElementById("newStudentPhoto").style.display = "none";
  document.getElementById("newStudentPhotoPlaceholder").style.display = "flex";

  const saveBtn = document.getElementById("saveNewStudentBtn");
  if (saveBtn) saveBtn.disabled = true;

  document.getElementById("addStudentFormModal").classList.add("active");
  setTimeout(() => {
    initStudentJdpInputs();
    setupAddStudentValidation();
  }, 100);
}
function closeAddStudentFormModal() {
  document.getElementById("addStudentFormModal").classList.remove("active");
}

function isValidNationalCodeWithChecksum(code) {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(code[i]) * (10 - i);
  const rem = sum % 11;
  const check = parseInt(code[9]);
  return rem < 2 ? check === rem : check === 11 - rem;
}

// ==================== VALIDATION ====================
function shakeInput(el) {
  if (el.classList.contains("shaking")) return;
  el.classList.add("shaking");
  setTimeout(() => el.classList.remove("shaking"), 400);
}
 
// ── validation یک فیلد بر اساس id ──
function validateFieldById(id) {
  const el = document.getElementById(id);
  return validateStudentInputField(el);
}
 
// ── validation اصلی هر فیلد ──
function validateStudentInputField(input) {
  if (!input) return true;
  const rawValue = input.value.trim();
  const value    = faToEnNumbers(rawValue);
 
  // فیلدهای تاریخ – اختیاری
  if (input.classList.contains("jdp-input")) {
    if (rawValue) setFieldSuccess(input); else clearFieldError(input);
    return true;
  }
 
  // ── فیلدهای نام ──
  if (NAME_FIELD_IDS.includes(input.id)) {
    const requiredNames = ["newFirstName","newLastName","editFirstName","editLastName"];
    if (!rawValue) {
      if (requiredNames.includes(input.id)) {
        showFieldError(input, "این فیلد الزامی است");
        return false;
      }
      clearFieldError(input);
      return true;
    }
    setFieldSuccess(input);
    return true;
  }
 
  // ── فیلدهای اختیاری ──
  const optionalIds = [
    "newMobile","newHomePhone","newFatherMobile","newMotherMobile",
    "newFatherNationalId","newMotherNationalId","newPostalCode",
    "editMobile","editHomePhone","editFatherMobile","editMotherMobile",
    "editFatherNationalId","editMotherNationalId","editPostalCode",
    "newFatherName","newFatherJob","newMotherName","newMotherJob",
    "editFatherName","editFatherJob","editMotherName","editMotherJob",
    "newAddress","editAddress",
  ];
  if (optionalIds.includes(input.id)) {
    if (!rawValue) { clearFieldError(input); return true; }
 
    if (["newMobile","editMobile","newFatherMobile","editFatherMobile",
         "newMotherMobile","editMotherMobile"].includes(input.id)) {
      if (!/^09\d{9}$/.test(value)) {
        showFieldError(input, "شماره موبایل باید با ۰۹ شروع و ۱۱ رقم باشد");
        return false;
      }
    }
    if (["newHomePhone","editHomePhone"].includes(input.id)) {
      if (!/^0\d{10}$/.test(value)) {
        showFieldError(input, "تلفن ثابت باید با ۰ شروع و ۱۱ رقم باشد");
        return false;
      }
    }
    if (["newFatherNationalId","editFatherNationalId",
         "newMotherNationalId","editMotherNationalId"].includes(input.id)) {
      if (!/^\d{10}$/.test(value)) {
        showFieldError(input, "کد ملی باید دقیقاً ۱۰ رقم باشد");
        return false;
      }
      if (!isValidNationalCodeWithChecksum(value)) {
        showFieldError(input, "کد ملی وارد شده معتبر نیست");
        return false;
      }
    }
    if (["newPostalCode","editPostalCode"].includes(input.id)) {
      if (!/^\d{10}$/.test(value)) {
        showFieldError(input, "کد پستی باید دقیقاً ۱۰ رقم باشد");
        return false;
      }
    }
 
    setFieldSuccess(input);
    return true;
  }
 
  // ── فیلدهای اجباری ──
  if (!rawValue) {
    showFieldError(input, "این فیلد الزامی است");
    return false;
  }
  if (["newNationalId","editNationalId"].includes(input.id)) {
    if (!/^\d{10}$/.test(value)) {
      showFieldError(input, "کد ملی باید دقیقاً ۱۰ رقم باشد");
      return false;
    }
    if (!isValidNationalCodeWithChecksum(value)) {
      showFieldError(input, "کد ملی وارد شده معتبر نیست (چک‌رقم اشتباه)");
      return false;
    }
  }
 
  setFieldSuccess(input);
  return true;
}
 
// ── validate فرم افزودن دانش‌آموز ──
function validateAddStudentForm() {
  const fn  = document.getElementById("newFirstName");
  const ln  = document.getElementById("newLastName");
  const nc  = document.getElementById("newNationalId");
  const mob = document.getElementById("newMobile");
 
  const ncVal  = faToEnNumbers((nc?.value  || "").trim());
  const mobVal = faToEnNumbers((mob?.value || "").trim());
 
  const isValid =
    fn?.value.trim() &&
    ln?.value.trim() &&
    isValidNationalCodeWithChecksum(ncVal) &&
    (!mobVal || /^09\d{9}$/.test(mobVal));
 
  const saveBtn = document.getElementById("saveNewStudentBtn");
  if (saveBtn) {
    saveBtn.disabled        = !isValid;
    saveBtn.style.opacity   = isValid ? "1"       : "0.5";
    saveBtn.style.cursor    = isValid ? "pointer" : "not-allowed";
  }
  return !!isValid;
}





function validateAddStudentForm() {
  const firstName    = document.getElementById("newFirstName");
  const lastName     = document.getElementById("newLastName");
  const nationalCode = document.getElementById("newNationalId");
  const mobile       = document.getElementById("newMobile");
 
  const ncVal  = faToEnNumbers((nationalCode?.value || "").trim());
  const mobVal = faToEnNumbers((mobile?.value || "").trim());
 
  const isValid =
    firstName?.value.trim() &&
    lastName?.value.trim() &&
    isValidNationalCodeWithChecksum(ncVal) &&
    (!mobVal || /^09\d{9}$/.test(mobVal));
 
  const saveBtn = document.getElementById("saveNewStudentBtn");
  if (saveBtn) {
    saveBtn.disabled = !isValid;
    saveBtn.style.opacity = isValid ? "1" : "0.5";
    saveBtn.style.cursor  = isValid ? "pointer" : "not-allowed";
  }
  return !!isValid;
}


// ==================== NUMERIC IDS ====================
const NAME_FIELD_IDS = [
  "newFirstName", "newLastName",
  "newFatherName", "newFatherJob",
  "newMotherName", "newMotherJob",
  "editFirstName", "editLastName",
  "editFatherName", "editFatherJob",
  "editMotherName", "editMotherJob",
];
 
// ── فیلدهای عددی در فرم افزودن ──
const NUMERIC_IDS = [
  "newNationalId", "newFatherNationalId", "newMotherNationalId", "newPostalCode",
  "editNationalId", "editFatherNationalId", "editMotherNationalId", "editPostalCode",
];
const PHONE_IDS = [
  "newMobile", "newFatherMobile", "newMotherMobile", "newHomePhone",
  "editMobile", "editFatherMobile", "editMotherMobile", "editHomePhone",
];
const MAX_LEN = {
  newNationalId: 10,    newFatherNationalId: 10, newMotherNationalId: 10,
  newMobile: 11,        newFatherMobile: 11,      newMotherMobile: 11,     newHomePhone: 11,
  newPostalCode: 10,
  editNationalId: 10,   editFatherNationalId: 10, editMotherNationalId: 10,
  editMobile: 11,       editFatherMobile: 11,     editMotherMobile: 11,    editHomePhone: 11,
  editPostalCode: 10,
};
 


document.addEventListener("keydown", function (e) {
  const id = e.target.id;
  if (!NUMERIC_IDS.includes(id) && !PHONE_IDS.includes(id)) return;
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (allowed.includes(e.key)) return;
  if (e.ctrlKey || e.metaKey) return;
  if (/^\d$/.test(e.key)) return;
  if (/^[\u06F0-\u06F9\u0660-\u0669]$/.test(e.key)) return;
  e.preventDefault();
});

document.addEventListener("paste", function (e) {
  const id = e.target.id;
  if (!NUMERIC_IDS.includes(id) && !PHONE_IDS.includes(id)) return;
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData("text");
  const cleaned = faToEnNumbers(pasted).replace(/\D/g, "");
  const max = MAX_LEN[id] || 11;
  const el = e.target;
  const newVal = (
    el.value.slice(0, el.selectionStart) +
    cleaned +
    el.value.slice(el.selectionEnd)
  ).substring(0, max);
  el.value = newVal;
  validateStudentInputField(el);
  validateAddStudentForm();
});

document.addEventListener("input", function (e) {
  const id = e.target.id;
  if (!NUMERIC_IDS.includes(id) && !PHONE_IDS.includes(id)) return;
  const max = MAX_LEN[id] || 11;
  const pos = e.target.selectionStart;
  e.target.value = faToEnNumbers(e.target.value)
    .replace(/\D/g, "")
    .substring(0, max);
  try {
    e.target.setSelectionRange(pos, pos);
  } catch (ex) {}
  validateStudentInputField(e.target);
  validateAddStudentForm();
});

document.addEventListener("input", function (e) {
  const id = e.target.id;
  const allIds = [
    "newFirstName",
    "newLastName",
    "newNationalId",
    "newMobile",
    "newHomePhone",
    "newFatherName",
    "newFatherNationalId",
    "newFatherMobile",
    "newFatherJob",
    "newMotherName",
    "newMotherNationalId",
    "newMotherMobile",
    "newMotherJob",
    "newAddress",
    "newPostalCode",
  ];
  if (!allIds.includes(id)) return;
  validateStudentInputField(e.target);
  validateAddStudentForm();
});

document.addEventListener(
  "blur",
  function (e) {
    const allIds = [
      "newFirstName",
      "newLastName",
      "newNationalId",
      "newMobile",
      "newHomePhone",
      "newFatherName",
      "newFatherNationalId",
      "newFatherMobile",
      "newFatherJob",
      "newMotherName",
      "newMotherNationalId",
      "newMotherMobile",
      "newMotherJob",
      "newAddress",
      "newPostalCode",
    ];
    if (!allIds.includes(e.target.id)) return;
    validateStudentInputField(e.target);
    validateAddStudentForm();
  },
  true,
);

function setupAddStudentValidation() {
  setTimeout(function () {
    NUMERIC_IDS.concat(PHONE_IDS).forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.setAttribute("inputmode", "numeric");
      el.setAttribute("maxlength", MAX_LEN[id] || 11);
    });
    const saveBtn = document.getElementById("saveNewStudentBtn");
    if (saveBtn) saveBtn.disabled = true;
  }, 150);
}

function addNewStudent() {
  if (!currentClassId) return;
  if (!validateAddStudentForm()) {
    toast("لطفاً فیلدهای الزامی را صحیح پر کنید", true);
    return;
  }

  const firstName = document.getElementById("newFirstName").value.trim();
  const lastName = document.getElementById("newLastName").value.trim();
  const nationalCode = faToEnNumbers(
    document.getElementById("newNationalId").value.trim(),
  );
  const mobile = faToEnNumbers(
    document.getElementById("newMobile").value.trim(),
  );
  const birthDate = document.getElementById("newBirthdate")
    ? document.getElementById("newBirthdate").value.trim()
    : "";

  const saveBtn = document.getElementById("saveNewStudentBtn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';
  }

  const formEl = document.querySelector("#addStudentFormModal .modal-body");
  if (formEl) {
    formEl.style.opacity = "0.5";
    formEl.style.pointerEvents = "none";
  }

  showLoader();

  apiPost({
    action: "add_student",
    class_id: currentClassId,
    first_name: firstName,
    last_name: lastName,
    national_code: nationalCode,
    mobile: mobile,
    birth_date: birthDate,
    password: nationalCode,
    photo: newStudentPhotoData || "",
  })
    .then((data) => {
      hideLoader();
      if (!data.success) throw new Error(data.message);
      closeAddStudentFormModal();
      loadClasses();
      showStudents(currentClassId);
      toast("دانش‌آموز اضافه شد!");
    })
    .catch((err) => {
      hideLoader();
      toast("خطا: " + err.message, true);
    })
    .finally(() => {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-plus"></i> افزودن دانش‌آموز';
      }
      if (formEl) {
        formEl.style.opacity = "";
        formEl.style.pointerEvents = "";
      }
    });
}

// ==================== ARCHIVE STUDENT (آرشیو کامل) ====================
function openArchiveStudentModal(classId, studentId, name) {
  studentToArchive = { classId, studentId, name };
  document.getElementById("archiveStudentText").innerHTML =
    `آیا مطمئن هستید که می‌خواهید <strong>${name || "این دانش‌آموز"}</strong> را به آرشیو منتقل کنید؟`;
  document.getElementById("archiveStudentModal").classList.add("active");
}
function closeArchiveStudentModal() {
  document.getElementById("archiveStudentModal").classList.remove("active");
  studentToArchive = null;
}
function confirmArchiveStudent() {
  if (!studentToArchive) return;
  const { classId, studentId, name } = studentToArchive;

  const btn = document.querySelector("#archiveStudentModal .modal-btn-archive");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال آرشیو...';
  }

  // آرشیو کامل دانش‌آموز (نه فقط حذف از کلاس)
  apiDelete({ action: "delete_student", student_id: studentId })
    .then((data) => {
      if (!data.success) throw new Error(data.message);
      closeArchiveStudentModal();
      loadClasses();
      showStudents(classId);
      toast((name || "دانش‌آموز") + " با موفقیت آرشیو شد!");
    })
    .catch((err) => toast("خطا: " + err.message, true))
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-archive"></i> انتقال به ارشیو';
      }
      studentToArchive = null;
    });
}

// ==================== ARCHIVE/DELETE CLASS ====================
function openDeleteClassModal(classId) {
  classToDelete = classId;
  const c = classes[classId];
  document.getElementById("deleteClassText").innerHTML =
    `آیا مطمئن هستید که می‌خواهید کلاس <strong>${c ? c.code : classId}</strong> را حذف کنید؟`;
  document.getElementById("deleteClassModal").classList.add("active");
}
function closeDeleteClassModal() {
  document.getElementById("deleteClassModal").classList.remove("active");
  classToDelete = null;
}
function confirmDeleteClass() {
  if (classToDelete && classes[classToDelete]) {
    delete classes[classToDelete];
    closeDeleteClassModal();
    renderClasses();
    toast("کلاس حذف شد!");
  }
}

function openArchiveClassModal(classId) {
  classToArchive = classId;
  const c = classes[classId];
  document.getElementById("archiveClassText").innerHTML =
    `آیا مطمئن هستید که می‌خواهید کلاس <strong>${c ? c.code : classId}</strong> را به ارشیو منتقل کنید؟`;
  document.getElementById("archiveClassModal").classList.add("active");
}
function closeArchiveClassModal() {
  document.getElementById("archiveClassModal").classList.remove("active");
  classToArchive = null;
}
function confirmArchiveClass() {
  if (classToArchive) {
    const code = classes[classToArchive]?.code || classToArchive;
    delete classes[classToArchive];
    closeArchiveClassModal();
    renderClasses();
    toast(`کلاس ${code} به ارشیو منتقل شد!`);
  }
}

// ==================== EXCEL ====================
function openExcelModal() {
  const container = document.getElementById("individualClassOptions");
  container.innerHTML = "";
  Object.values(classes).forEach((c) => {
    const btn = document.createElement("button");
    btn.className = "individual-class-btn";
    btn.innerHTML = `<span class="class-num">کلاس ${c.code}</span><span class="class-info">${c.grade} - ${c.field}</span>`;
    btn.onclick = () => exportSingleClass(c.id, c.code);
    container.appendChild(btn);
  });
  document.getElementById("excelModal").classList.add("active");
}
function closeExcelModal() {
  document.getElementById("excelModal").classList.remove("active");
}

function exportExcel(type) {
  let ids;
  let title;
  if (type === "all") {
    ids = Object.keys(classes);
    title = "همه کلاس‌ها";
  } else {
    const g = { grade10: "دهم", grade11: "یازدهم", grade12: "دوازدهم" }[type];
    ids = Object.values(classes)
      .filter((c) => c.grade === g)
      .map((c) => c.id);
    title = `پایه ${g}`;
  }
  Promise.all(
    ids.map((id) => apiGet({ action: "students", class_id: id })),
  ).then((results) => {
    const all = results.flatMap((r) => r.data || []);
    makeExcel(all, title);
    closeExcelModal();
  });
}
function exportSingleClass(classId, code) {
  apiGet({ action: "students", class_id: classId }).then((data) => {
    makeExcel(data.data || [], `کلاس ${code}`);
    closeExcelModal();
  });
}
function makeExcel(students, title) {
  const wb = XLSX.utils.book_new();
  const rows = [["نام", "نام خانوادگی", "کد ملی", "شماره همراه", "نام کاربری"]];
  students.forEach((s) =>
    rows.push([
      s.first_name || "",
      s.last_name || "",
      s.national_code || "",
      s.mobile || "",
      s.username || "",
    ]),
  );
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30));
  XLSX.writeFile(wb, `students_${new Date().toISOString().split("T")[0]}.xlsx`);
  toast(`${students.length} دانش‌آموز دانلود شد!`);
}

function downloadStudentExcel() {
  if (!currentStudentId) return;
  apiGet({ action: "student_detail", student_id: currentStudentId }).then(
    (data) => {
      if (!data.success) return;
      const s = data.data;
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ["فیلد", "مقدار"],
        ["نام", s.first_name || ""],
        ["نام خانوادگی", s.last_name || ""],
        ["کد ملی", s.national_code || ""],
        ["شماره همراه", s.mobile || ""],
      ]);
      ws["!cols"] = [{ wch: 20 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, ws, "اطلاعات");
      XLSX.writeFile(wb, `student_${s.national_code || s.id}.xlsx`);
      toast("Excel دانلود شد!");
    },
  );
}

// ==================== SEARCH ====================
function searchStudents() {
  const term = document
    .getElementById("studentSearchInput")
    .value.toLowerCase()
    .trim();
  document.querySelectorAll(".student-card").forEach((card) => {
    if (!term) {
      card.style.display = "";
      return;
    }
    const match = [
      "data-student-name",
      "data-student-code",
      "data-student-national-id",
      "data-student-phone",
    ].some((attr) =>
      (card.getAttribute(attr) || "").toLowerCase().includes(term),
    );
    card.style.display = match ? "" : "none";
  });
}

function _processPhotoFile(file, callback) {
  const img    = new Image();
  const reader = new FileReader();
  reader.onload = (ev) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      const maxSize = 600;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round((h * maxSize) / w); w = maxSize; }
        else        { w = Math.round((w * maxSize) / h); h = maxSize; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// ==================== PHOTO ====================
function handlePhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast("فقط فرمت‌های JPG، PNG، WEBP و GIF مجاز هستند", true);
    e.target.value = ""; return;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toast(`حجم تصویر نباید بیشتر از ${MAX_FILE_SIZE_MB} مگابایت باشد`, true);
    e.target.value = ""; return;
  }
  _processPhotoFile(file, (dataUrl) => {
    currentStudentPhoto = dataUrl;
    const img = document.getElementById("studentAvatarImg");
    const ph  = document.getElementById("studentAvatarPlaceholder");
    img.src           = dataUrl;
    img.style.display = "block";
    ph.style.display  = "none";
    toast("عکس با موفقیت بارگذاری شد");
  });
}


const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 1;
 

function handleNewStudentPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    toast("فقط فرمت‌های JPG، PNG، WEBP و GIF مجاز هستند", true);
    e.target.value = ""; return;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    toast(`حجم تصویر نباید بیشتر از ${MAX_FILE_SIZE_MB} مگابایت باشد`, true);
    e.target.value = ""; return;
  }
  _processPhotoFile(file, (dataUrl) => {
    newStudentPhotoData = dataUrl;
    document.getElementById("newStudentPhoto").src                    = dataUrl;
    document.getElementById("newStudentPhoto").style.display          = "block";
    document.getElementById("newStudentPhotoPlaceholder").style.display = "none";
  });
}


function showPhotoFullscreen(src) {
  document.getElementById("fullscreenPhoto").src = src;
  document.getElementById("photoFullscreenModal").classList.add("active");
}
function showPlaceholderFullscreen() {
  toast("دانش‌آموز عکس ندارد");
}
function closePhotoFullscreen() {
  document.getElementById("photoFullscreenModal").classList.remove("active");
}

// ==================== IMAGE COMPRESSION (stubs) ====================
function openImageCompressionModal() {
  if (!currentStudentPhoto) {
    toast("این دانش‌آموز عکس پروفایل ندارد", true);
    return;
  }
  document.getElementById("imageCompressionModal").classList.add("active");
  // مقدار slider رو reset کن
  const slider = document.getElementById("qualitySlider");
  if (slider) { slider.value = 0.6; updateImageQuality(0.6); }
  updateEstimatedSize();
}
 
function confirmImageDownload() {
  if (!currentStudentPhoto) { toast("عکسی برای دانلود وجود ندارد", true); return; }
 
  const quality = currentImageQuality || 0.6;
  const img     = new Image();
  img.crossOrigin = "anonymous";
 
  img.onload = function () {
    const canvas  = document.createElement("canvas");
    canvas.width  = img.naturalWidth  || img.width;
    canvas.height = img.naturalHeight || img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
 
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const link    = document.createElement("a");
 
    // نام فایل = نام دانش‌آموز
    const studentName = document.getElementById("studentName")?.textContent?.trim() || "student";
    link.download = `عکس_${studentName}.jpg`;
    link.href     = dataUrl;
    link.click();
 
    closeImageCompressionModal();
    toast("عکس دانلود شد!");
  };
 
  img.onerror = function () {
    // اگه src یه data URL باشه مستقیم دانلود می‌کنیم
    if (currentStudentPhoto.startsWith("data:")) {
      const link    = document.createElement("a");
      const studentName = document.getElementById("studentName")?.textContent?.trim() || "student";
      link.download = `عکس_${studentName}.jpg`;
      link.href     = currentStudentPhoto;
      link.click();
      closeImageCompressionModal();
      toast("عکس دانلود شد!");
    } else {
      toast("خطا در بارگذاری تصویر برای دانلود", true);
    }
  };
 
  img.src = currentStudentPhoto;
}

function closeImageCompressionModal() {
  document.getElementById("imageCompressionModal").classList.remove("active");
}

function setImageQuality(q) {
  currentImageQuality = q;
  const slider = document.getElementById("qualitySlider");
  if (slider) slider.value = q;
  updateImageQuality(q);
}


function updateImageQuality(q) {
  currentImageQuality = parseFloat(q);
  // sync دکمه‌های کم/متوسط/بالا
  document.querySelectorAll(".quality-option").forEach(btn => btn.classList.remove("active"));
  if (currentImageQuality <= 0.3) document.querySelectorAll(".quality-option")[0]?.classList.add("active");
  else if (currentImageQuality >= 0.9) document.querySelectorAll(".quality-option")[2]?.classList.add("active");
  else document.querySelectorAll(".quality-option")[1]?.classList.add("active");
  updateEstimatedSize();
}

function confirmImageDownload() {
  closeImageCompressionModal();
}
function updateEstimatedSize() {
  if (!currentStudentPhoto) return;
  const quality = currentImageQuality || 0.6;
  const img     = new Image();
  img.onload = function () {
    const canvas  = document.createElement("canvas");
    canvas.width  = img.naturalWidth  || 400;
    canvas.height = img.naturalHeight || 400;
    canvas.getContext("2d").drawImage(img, 0, 0);
    const dataUrl  = canvas.toDataURL("image/jpeg", quality);
    const bytes    = Math.round((dataUrl.length * 3) / 4);
    const kb       = (bytes / 1024).toFixed(0);
    const el       = document.getElementById("estimatedSize");
    if (el) el.textContent = kb > 1024 ? `~ ${(kb/1024).toFixed(1)} MB` : `~ ${kb} KB`;
  };
  img.src = currentStudentPhoto;
}


// ==================== REPORT ====================
function showReport(classId, studentId) {
  const c = classes[classId];
  apiGet({ action: "student_detail", student_id: studentId }).then((data) => {
    if (!data.success) return;
    const s = data.data;
    document.getElementById("reportStudentName").textContent =
      `${s.first_name} ${s.last_name}`;
    document.getElementById("reportStudentCode").textContent =
      s.national_code || s.id;
    document.getElementById("reportStudentGrade").textContent = c
      ? c.grade
      : "-";
    document.getElementById("reportStudentClass").textContent = c
      ? c.code
      : "-";
    document.getElementById("reportStudentField").textContent = c
      ? c.field
      : "-";
    document.getElementById("reportStudentNationalId").textContent =
      s.national_code || "-";
    document.getElementById("reportModal").classList.add("active");
  });
}
async function downloadReportPDF() {
  document.getElementById("pdfLoading").classList.add("active");
  try {
    const { jsPDF } = window.jspdf;
    const closeBtn = document.querySelector("#reportModal .close-btn");
    const btns = document.querySelectorAll(".btn-download-report");
    if (closeBtn) closeBtn.style.display = "none";
    btns.forEach((b) => (b.style.display = "none"));
    const canvas = await html2canvas(
      document.getElementById("reportCardContent"),
      { scale: 2, useCORS: true, backgroundColor: "#283369" },
    );
    if (closeBtn) closeBtn.style.display = "flex";
    btns.forEach((b) => (b.style.display = "inline-flex"));
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      210,
      (canvas.height * 210) / canvas.width,
    );
    pdf.save(
      `کارنامه_${document.getElementById("reportStudentName").textContent}.pdf`,
    );
    toast("PDF دانلود شد!");
  } catch (e) {
    toast("خطا در PDF", true);
  } finally {
    document.getElementById("pdfLoading").classList.remove("active");
  }
}
function downloadReportExcel() {
  const name = document.getElementById("reportStudentName").textContent,
    code = document.getElementById("reportStudentCode").textContent;
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["نام", "کد"],
    [name, code],
  ]);
  XLSX.utils.book_append_sheet(wb, ws, "کارنامه");
  XLSX.writeFile(wb, `کارنامه_${name}.xlsx`);
  toast("Excel دانلود شد!");
}
function closeReportModal() {
  document.getElementById("reportModal").classList.remove("active");
}

// ==================== ADD CLASS (placeholder) ====================
function openAddClassModal() {
  toast("برای اضافه کردن کلاس جدید به صفحه برنامه کلاسی بروید");
}
function closeAddClassModal() {
  document.getElementById("addClassModal").classList.remove("active");
}
function addNewClass() {
  closeAddClassModal();
}
function showEditModal() {}
function closeEditModal() {}
function saveClassChanges() {}

// ==================== MODAL CLOSE ====================
function closeStudentsModal() {
  document.getElementById("studentsModal").classList.remove("active");
}
function closeStudentDetailsModal() {
  document.getElementById("studentDetailsModal").classList.remove("active");
}

function initModalCloseListeners() {
  [
    ["studentsModal", closeStudentsModal],
    ["studentDetailsModal", closeStudentDetailsModal],
    ["editModal", closeEditModal],
    ["excelModal", closeExcelModal],
    ["deleteClassModal", closeDeleteClassModal],
    ["addClassModal", closeAddClassModal],
    ["addStudentOptionsModal", closeAddStudentOptionsModal],
    ["addStudentFormModal", closeAddStudentFormModal],
    ["reportModal", closeReportModal],
    ["photoFullscreenModal", closePhotoFullscreen],
    ["imageCompressionModal", closeImageCompressionModal],
    ["archiveClassModal", closeArchiveClassModal],
    ["archiveStudentModal", closeArchiveStudentModal],
  ].forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el)
      el.addEventListener("click", (e) => {
        if (e.target === el) fn();
      });
  });
}


// ==================== JALALI DATE PICKER ====================


// ==================== JALALI DATE PICKER v2 ====================
var JDP_S = (function () {

  var MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
  var DAYS   = ["ش","ی","د","س","چ","پ","ج"];

  // ── تبدیل میلادی → شمسی (epoch-based، صددرصد صحیح) ──
  function toJalali(gy, gm, gd) {
    var msPerDay = 86400000;
    var diff = Math.round((new Date(+gy, +gm - 1, +gd).getTime() - new Date(1970, 0, 1).getTime()) / msPerDay);
    var jy = 1348, jm = 10, jd = 11; // ref: 1348/10/11 = 1970/01/01
    jd += diff;
    while (jd > _jDays(jy, jm)) { jd -= _jDays(jy, jm); jm++; if (jm > 12) { jm = 1; jy++; } }
    while (jd < 1) { jm--; if (jm < 1) { jm = 12; jy--; } jd += _jDays(jy, jm); }
    return [jy, jm, jd];
  }

  // ── تبدیل شمسی → میلادی ──
  function toGregorian(jy, jm, jd) {
    // شمارش فاصله روز از مرجع 1348/10/11
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

  // ستون شروع ماه: شنبه=0، یکشنبه=1، ...، جمعه=6
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
  var PID = "jdp2-popup", OID = "jdp2-overlay";

  // ── ایجاد DOM پاپ‌اپ ──
  function _boot() {
    if (document.getElementById(PID)) return;

    var ov = document.createElement("div");
    ov.id = OID;
    ov.style.cssText = "display:none;position:fixed;inset:0;z-index:99990;";
    ov.onclick = _close;
    document.body.appendChild(ov);

    var p = document.createElement("div");
    p.id = PID;
    p.style.cssText = [
      "display:none;position:fixed;z-index:99991;",
      "width:310px;",
      "background:linear-gradient(145deg,#0f1c3f,#162850);",
      "border:1px solid rgba(100,160,255,0.25);",
      "border-radius:16px;",
      "box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04);",
      "direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;",
      "overflow:hidden;user-select:none;"
    ].join("");
    p.innerHTML = _tpl();
    document.body.appendChild(p);

    document.getElementById("jdp2-prev").onclick = function () { _nav(-1); };
    document.getElementById("jdp2-next").onclick = function () { _nav(+1); };
    document.getElementById("jdp2-hdr").onclick  = _toggleMode;
    document.getElementById("jdp2-today").onclick = _goToday;
    document.getElementById("jdp2-clear").onclick = _goClear;
  }

  function _tpl() {
    return [
      // هدر
      '<div style="display:flex;align-items:center;justify-content:space-between;',
        'padding:14px 16px 10px;border-bottom:1px solid rgba(255,255,255,0.07);">',
        '<button id="jdp2-prev" style="',
          'background:rgba(255,255,255,0.06);border:none;color:#7eb8ff;',
          'width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;',
          'display:flex;align-items:center;justify-content:center;transition:background 0.2s;">&#8249;</button>',
        '<span id="jdp2-hdr" style="',
          'color:#e0eeff;font-size:15px;font-weight:600;cursor:pointer;',
          'padding:4px 10px;border-radius:8px;transition:background 0.2s;',
          'letter-spacing:0.3px;"></span>',
        '<button id="jdp2-next" style="',
          'background:rgba(255,255,255,0.06);border:none;color:#7eb8ff;',
          'width:32px;height:32px;border-radius:8px;cursor:pointer;font-size:18px;',
          'display:flex;align-items:center;justify-content:center;transition:background 0.2s;">&#8250;</button>',
      '</div>',
      // بدنه
      '<div id="jdp2-body" style="padding:12px 14px;min-height:180px;"></div>',
      // فوتر
      '<div style="display:flex;gap:8px;padding:10px 14px 14px;border-top:1px solid rgba(255,255,255,0.07);">',
        '<button id="jdp2-today" style="',
          'flex:1;background:rgba(80,150,255,0.15);border:1px solid rgba(80,150,255,0.35);',
          'color:#7eb8ff;border-radius:8px;padding:8px;cursor:pointer;',
          'font-family:Vazirmatn,Tahoma,sans-serif;font-size:12px;font-weight:500;',
          'transition:all 0.2s;">امروز</button>',
        '<button id="jdp2-clear" style="',
          'flex:1;background:rgba(220,60,60,0.12);border:1px solid rgba(220,60,60,0.3);',
          'color:#f08080;border-radius:8px;padding:8px;cursor:pointer;',
          'font-family:Vazirmatn,Tahoma,sans-serif;font-size:12px;font-weight:500;',
          'transition:all 0.2s;">پاک کردن</button>',
      '</div>'
    ].join("");
  }

  // ── نمایش روزها ──
  function _renderDays() {
    var t = _today();
    var fc = _firstCol(vY, vM);
    var dm = _jDays(vY, vM);
    var html = [];

    // سربرگ روزهای هفته
    html.push('<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:8px;">');
    DAYS.forEach(function (d) {
      html.push('<div style="text-align:center;font-size:11px;color:rgba(180,200,255,0.5);',
        'padding:3px 0;font-weight:500;">' + d + '</div>');
    });
    html.push('</div>');

    // شبکه روزها
    html.push('<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">');
    for (var i = 0; i < fc; i++) html.push('<div></div>');
    for (var d = 1; d <= dm; d++) {
      var isToday = (vY === t[0] && vM === t[1] && d === t[2]);
      var isSel   = (selY === vY && selM === vM && selD === d);
      var bg, border, color;
      if (isSel) {
        bg = "linear-gradient(135deg,#3d8bff,#1a5fd4)";
        border = "none";
        color = "#fff";
      } else if (isToday) {
        bg = "rgba(80,150,255,0.12)";
        border = "1px solid rgba(80,150,255,0.5)";
        color = "#7eb8ff";
      } else {
        bg = "rgba(255,255,255,0.03)";
        border = "1px solid transparent";
        color = "#c8d8f0";
      }
      html.push(
        '<div onclick="JDP_S._pick(' + d + ')" style="',
        'text-align:center;padding:7px 2px;border-radius:8px;cursor:pointer;',
        'font-size:12px;font-weight:500;',
        'background:' + bg + ';border:' + border + ';color:' + color + ';',
        'transition:all 0.15s;"',
        ' onmouseover="if(!this.style.background.includes(\'linear\')){this.style.background=\'rgba(80,150,255,0.18)\';}"',
        ' onmouseout="this.style.background=\'' + bg.replace(/'/g, "\\'") + '\';"',
        '>' + _fa(d) + '</div>'
      );
    }
    html.push('</div>');
    document.getElementById("jdp2-body").innerHTML = html.join("");
  }

  // ── نمایش ماه‌ها ──
  function _renderMonths() {
    var html = ['<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'];
    MONTHS.forEach(function (name, i) {
      var active = (i + 1 === vM);
      html.push(
        '<div onclick="JDP_S._pickM(' + (i + 1) + ')" style="',
        'text-align:center;padding:10px 4px;border-radius:10px;cursor:pointer;',
        'font-size:12px;font-weight:500;transition:all 0.15s;',
        active
          ? 'background:linear-gradient(135deg,#3d8bff,#1a5fd4);color:#fff;'
          : 'background:rgba(255,255,255,0.05);color:#a0c0f0;border:1px solid rgba(255,255,255,0.07);',
        '"',
        ' onmouseover="if(!this.style.background.includes(\'linear\')){this.style.background=\'rgba(80,150,255,0.2)\';}"',
        ' onmouseout="this.style.background=\'' + (active ? 'linear-gradient(135deg,#3d8bff,#1a5fd4)' : 'rgba(255,255,255,0.05)') + '\';"',
        '>' + name + '</div>'
      );
    });
    html.push('</div>');
    document.getElementById("jdp2-body").innerHTML = html.join("");
  }

  // ── نمایش سال‌ها ──
  function _renderYears() {
    var html = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">',
        '<button onclick="JDP_S._yNav(-12)" style="background:rgba(255,255,255,0.06);border:none;',
          'color:#7eb8ff;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:16px;">‹</button>',
        '<span style="color:rgba(180,200,255,0.6);font-size:12px;">',
          _fa(yrStart) + ' - ' + _fa(yrStart + 11),
        '</span>',
        '<button onclick="JDP_S._yNav(+12)" style="background:rgba(255,255,255,0.06);border:none;',
          'color:#7eb8ff;width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:16px;">›</button>',
      '</div>',
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">'
    ];
    for (var y = yrStart; y < yrStart + 12; y++) {
      var active = (y === vY);
      html.push(
        '<div onclick="JDP_S._pickY(' + y + ')" style="',
        'text-align:center;padding:10px 4px;border-radius:10px;cursor:pointer;',
        'font-size:12px;font-weight:500;transition:all 0.15s;',
        active
          ? 'background:linear-gradient(135deg,#3d8bff,#1a5fd4);color:#fff;'
          : 'background:rgba(255,255,255,0.05);color:#a0c0f0;border:1px solid rgba(255,255,255,0.07);',
        '"',
        ' onmouseover="if(!this.style.background.includes(\'linear\')){this.style.background=\'rgba(80,150,255,0.2)\';}"',
        ' onmouseout="this.style.background=\'' + (active ? 'linear-gradient(135deg,#3d8bff,#1a5fd4)' : 'rgba(255,255,255,0.05)') + '\';"',
        '>' + _fa(y) + '</div>'
      );
    }
    html.push('</div>');
    document.getElementById("jdp2-body").innerHTML = html.join("");
  }

  function _render() {
    var hdr = document.getElementById("jdp2-hdr");
    if (!hdr) return;
    if (mode === "day") {
      hdr.textContent = MONTHS[vM - 1] + "  " + _fa(vY);
      _renderDays();
    } else if (mode === "month") {
      hdr.textContent = _fa(vY);
      _renderMonths();
    } else {
      hdr.textContent = _fa(yrStart) + " - " + _fa(yrStart + 11);
      _renderYears();
    }
  }

  function _nav(dir) {
    if (mode === "day") {
      vM += dir; if (vM > 12) { vM = 1; vY++; } if (vM < 1) { vM = 12; vY--; }
    } else if (mode === "month") {
      vY += dir;
    } else {
      yrStart += dir * 12;
    }
    _render();
  }

  function _toggleMode() {
    if (mode === "day")        { mode = "month"; }
    else if (mode === "month") { mode = "year"; yrStart = Math.floor(vY / 12) * 12; }
    else                       { mode = "day"; }
    _render();
  }

  function _position(input) {
    var p = document.getElementById(PID);
    var r = input.getBoundingClientRect();
    var pw = 310, ph = 370, vw = window.innerWidth, vh = window.innerHeight;
    var top = r.bottom + 8, left = r.right - pw;
    if (left < 8) left = 8;
    if (left + pw > vw - 8) left = vw - pw - 8;
    if (top + ph > vh - 8) top = r.top - ph - 8;
    if (top < 8) top = 8;
    p.style.top = top + "px"; p.style.left = left + "px";
  }

  function _open(input) {
    _boot();
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
    _render();
    _position(input);
    document.getElementById(OID).style.display = "block";
    document.getElementById(PID).style.display = "block";
  }

  function _close() {
    var p = document.getElementById(PID), o = document.getElementById(OID);
    if (p) p.style.display = "none";
    if (o) o.style.display = "none";
    activeInput = null;
  }

  function _commit(jy, jm, jd) {
    selY = jy; selM = jm; selD = jd;
    if (activeInput) {
      activeInput.value = jy + "/" + String(jm).padStart(2,"0") + "/" + String(jd).padStart(2,"0");
      activeInput.style.direction = "ltr";
      activeInput.style.textAlign = "right";
      activeInput.classList.remove("error"); activeInput.classList.add("success");
      activeInput.dispatchEvent(new Event("change", {bubbles:true}));
      activeInput.dispatchEvent(new Event("input",  {bubbles:true}));
      if (typeof validateAddStudentForm === "function") validateAddStudentForm();
    }
    _render();
    setTimeout(_close, 150);
  }

  function _goToday() {
    var t = _today(); vY = t[0]; vM = t[1]; mode = "day"; _render();
    _commit(t[0], t[1], t[2]);
  }

  function _goClear() {
    selY = selM = selD = null;
    if (activeInput) {
      activeInput.value = "";
      activeInput.classList.remove("success","error");
      activeInput.dispatchEvent(new Event("change", {bubbles:true}));
      if (typeof validateAddStudentForm === "function") validateAddStudentForm();
    }
    _close();
  }

  return {
    open:   _open,
    close:  _close,
    // برای فراخوانی از inline onclick در DOM
    _pick:  function(d) { _commit(vY, vM, d); },
    _pickM: function(m) { vM = m; mode = "day"; _render(); },
    _pickY: function(y) { vY = y; mode = "month"; _render(); },
    _yNav:  function(n) { yrStart += n; _render(); },
    toggleMonthView: _toggleMode,
    goToday: _goToday,
    clear:   _goClear,
  };
})();

// ── اتصال date picker به همه فیلدهای تاریخ ──
function initStudentJdpInputs() {
  var ids = [
    "newBirthdate","newFatherBirthdate","newMotherBirthdate",
    "editBirthdate","editFatherBirthdate","editMotherBirthdate"
  ];
  ids.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.readOnly = true;
    el.style.cursor = "pointer";
    el.style.direction = "ltr";
    el.style.textAlign = "right";
    el.removeEventListener("click", el._jdp2);
    el._jdp2 = function (e) { e.stopPropagation(); JDP_S.open(this); };
    el.addEventListener("click", el._jdp2);
    el.addEventListener("keydown", function (e) { if (e.key === "Escape") JDP_S.close(); });
  });
}



function showFieldError(inputEl, message) {
  if (!inputEl) return;
  inputEl.classList.remove("success");
  inputEl.classList.add("error");
  let err = inputEl.parentElement.querySelector(".field-error-msg");
  if (!err) {
    err = document.createElement("span");
    err.className = "field-error-msg";
    inputEl.parentElement.appendChild(err);
  }
  err.textContent = message;
  err.style.display = "block";
}
function clearFieldError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove("error");
  const err = inputEl.parentElement.querySelector(".field-error-msg");
  if (err) err.style.display = "none";
}
function setFieldSuccess(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove("error");
  inputEl.classList.add("success");
  const err = inputEl.parentElement.querySelector(".field-error-msg");
  if (err) err.style.display = "none";
}

function setupPhotoInputAccept() {
  ["newStudentPhotoInput","changePhotoInput"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("accept", "image/jpeg,image/jpg,image/png,image/webp,image/gif");
  });
}

 
// ── بخش ۷: toast (اگر در کدت نیست، این نسخه جایگزین می‌شود) ──
function toast(msg, isError = false) {
  const existing = document.querySelector(".success-message");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "success-message";
  if (isError) el.style.background = "linear-gradient(135deg,#e74c3c,#c0392b)";
  el.innerHTML = `<i class="fas fa-${isError ? "exclamation-circle" : "check-circle"}"></i>${msg}`;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("hide");
    setTimeout(() => el.remove(), 400);
  }, 3500);
}



function validateEditStudentForm() {
  const fn  = document.getElementById("editFirstName");
  const ln  = document.getElementById("editLastName");
  const nc  = document.getElementById("editNationalId");
  const mob = document.getElementById("editMobile");
 
  const ncVal  = faToEnNumbers((nc?.value  || "").trim());
  const mobVal = faToEnNumbers((mob?.value || "").trim());
 
  return (
    !!fn?.value.trim() &&
    !!ln?.value.trim() &&
    (!/\d/.test(fn.value) && !/\d/.test(ln.value)) &&
    (!ncVal  || isValidNationalCodeWithChecksum(ncVal)) &&
    (!mobVal || /^09\d{9}$/.test(mobVal))
  );
}
 
// این بخش جایگزین event listenerهای قبلی می‌شود
(function setupNumericListeners() {
  const allNumeric = [...NUMERIC_IDS, ...PHONE_IDS];
 
  document.addEventListener("keydown", function (e) {
    if (!allNumeric.includes(e.target.id)) return;
    const allowed = ["Backspace","Delete","Tab","Enter","ArrowLeft","ArrowRight",
                     "ArrowUp","ArrowDown","Home","End"];
    if (allowed.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (/^\d$/.test(e.key)) return;
    if (/^[\u06F0-\u06F9\u0660-\u0669]$/.test(e.key)) return;
    e.preventDefault();
  });
 
  document.addEventListener("paste", function (e) {
    if (!allNumeric.includes(e.target.id)) return;
    e.preventDefault();
    const pasted  = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = faToEnNumbers(pasted).replace(/\D/g, "");
    const max     = MAX_LEN[e.target.id] || 11;
    const el      = e.target;
    const newVal  = (
      el.value.slice(0, el.selectionStart) + cleaned + el.value.slice(el.selectionEnd)
    ).substring(0, max);
    el.value = newVal;
    validateStudentInputField(el);
    validateAddStudentForm();
  });
 
  document.addEventListener("input", function (e) {
    if (!allNumeric.includes(e.target.id)) return;
    const max = MAX_LEN[e.target.id] || 11;
    const pos = e.target.selectionStart;
    e.target.value = faToEnNumbers(e.target.value).replace(/\D/g, "").substring(0, max);
    try { e.target.setSelectionRange(pos, pos); } catch (ex) {}
    validateStudentInputField(e.target);
    validateAddStudentForm();
  });
})();


// ── event listeners عمومی برای همه فیلدهای متنی ──
(function setupTextListeners() {
  const allTextIds = [
    "newFirstName","newLastName","newFatherName","newFatherJob","newMotherName","newMotherJob",
    "newAddress","newPostalCode",
    "editFirstName","editLastName","editFatherName","editFatherJob","editMotherName","editMotherJob",
    "editAddress","editPostalCode",
  ];
 
  document.addEventListener("input", function (e) {
    if (!allTextIds.includes(e.target.id)) return;
    validateStudentInputField(e.target);
    // اگه در فرم افزودن هستیم دکمه رو هم چک کن
    if (e.target.id.startsWith("new")) validateAddStudentForm();
  });
 
  document.addEventListener("blur", function (e) {
    if (!allTextIds.includes(e.target.id)) return;
    validateStudentInputField(e.target);
    if (e.target.id.startsWith("new")) validateAddStudentForm();
  }, true);
})();