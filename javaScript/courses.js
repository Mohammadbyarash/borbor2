// ==================== HAMBURGER MENU ====================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
if (menuToggle) menuToggle.addEventListener("click", function () { sidebar.classList.toggle("active"); sidebarOverlay.classList.toggle("active"); });
if (sidebarOverlay) sidebarOverlay.addEventListener("click", function () { sidebar.classList.remove("active"); sidebarOverlay.classList.remove("active"); });

// ==================== LOADER ====================
function showLoader() {
  var existing = document.getElementById('pageLoader'); if (existing) return;
  var loader = document.createElement('div'); loader.id = 'pageLoader';
  loader.innerHTML = '<div class="loader-spinner"></div><div class="loader-text">در حال بارگذاری...</div><div class="loader-sub">در حال دریافت اطلاعات...</div>';
  loader.style.cssText = 'position:fixed;inset:0;background:#0f1629;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:18px;transition:opacity 0.5s ease;';
  document.body.appendChild(loader);
}
function hideLoader() {
  var loader = document.getElementById('pageLoader'); if (!loader) return;
  loader.classList.add('hide');
  setTimeout(function() { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 550);
}

// ==================== STATE ====================
var courses         = [];
var filteredCourses = [];
var fields          = [];
var currentPage     = 1;
var rowsPerPage     = 5;
var currentCourse   = null;
var courseToDelete  = null;
var API             = '../api/courses.php';
var UPLOAD_API      = '../api/upload.php';

// ==================== UPLOAD HELPER ====================
function uploadFile(file) {
  return new Promise(function(resolve, reject) {
    var formData = new FormData();
    formData.append('file', file);
    fetch(UPLOAD_API, { method: 'POST', body: formData })
      .then(function(r) { return r.json(); })
      .then(function(data) { if (!data.success) reject(new Error(data.message)); else resolve(data.path); })
      .catch(function(e) { reject(e); });
  });
}

// ==================== FIELD HELPERS ====================
function buildFieldOptions(selectedId) {
  var opts = '<option value="">انتخاب رشته</option>';
  fields.forEach(function(f) {
    var sel = (String(f.id) === String(selectedId)) ? ' selected' : '';
    opts += '<option value="' + f.id + '"' + sel + '>' + f.title + '</option>';
  });
  return opts;
}

function getFieldTitle(fieldId) {
  for (var i = 0; i < fields.length; i++) {
    if (String(fields[i].id) === String(fieldId)) return fields[i].title;
  }
  return '-';
}

function populateFilterField() {
  var filter = document.getElementById('fieldFilter');
  if (!filter) return;
  var current = filter.value;
  filter.innerHTML = '<option value="">همه رشته‌ها</option>';
  fields.forEach(function(f) {
    var sel = (String(f.id) === String(current)) ? ' selected' : '';
    filter.innerHTML += '<option value="' + f.id + '"' + sel + '>' + f.title + '</option>';
  });
}

// ==================== SAFE GET ELEMENT ====================
function safeSet(id, value, prop) {
  var el = document.getElementById(id);
  if (!el) return;
  if (prop === 'innerHTML') el.innerHTML = value;
  else el.textContent = value;
}
function safeVal(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value;
}

// ==================== API ====================
function fetchCourses() {
  showLoader(); showTableLoading();
  fetch(API)
    .then(function(r) { return r.text(); })
    .then(function(t) {
      var data; try { data = JSON.parse(t); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); }
      if (!data.success) throw new Error(data.message || 'خطای ناشناخته');
      courses         = data.data   || [];
      fields          = data.fields || [];
      filteredCourses = courses.slice();
      populateFilterField();
      renderCoursesTable();
      updateExcelCounts();
      hideLoader();
    })
    .catch(function(err) { showTableError(err.message); hideLoader(); });
}

function apiPost(payload) {
  return fetch(API, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    .then(function(r) { return r.text(); })
    .then(function(t) { try { return JSON.parse(t); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}
function apiPut(payload) {
  return fetch(API, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    .then(function(r) { return r.text(); })
    .then(function(t) { try { return JSON.parse(t); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}
function apiDelete(id) {
  return fetch(API, { method: 'DELETE', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id: id}) })
    .then(function(r) { return r.text(); })
    .then(function(t) { try { return JSON.parse(t); } catch(e) { throw new Error('پاسخ سرور معتبر نیست'); } });
}

// ==================== TABLE HELPERS ====================
function showTableLoading() {
  var tbody = document.getElementById("coursesTableBody"); if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.6);"><i class="fas fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;display:block"></i><p>در حال بارگذاری...</p></div>';
}
function showTableError(msg) {
  var tbody = document.getElementById("coursesTableBody"); if (!tbody) return;
  tbody.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;display:block"></i><p>' + (msg||'خطا') + '</p><button onclick="fetchCourses()" style="margin-top:12px;padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer">تلاش مجدد</button></div>';
}

// ==================== RENDER TABLE ====================
function renderCoursesTable() {
  var tbody = document.getElementById("coursesTableBody"); if (!tbody) return;
  tbody.innerHTML = "";
  var start = (currentPage - 1) * rowsPerPage;
  var page  = filteredCourses.slice(start, start + rowsPerPage);

  if (page.length === 0) {
    tbody.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><h3>هیچ درسی یافت نشد</h3><p>لطفاً فیلترها را تغییر دهید یا درس جدیدی اضافه کنید</p></div>';
    updatePagination(); return;
  }

  for (var i = 0; i < page.length; i++) {
    (function(course) {
      var row = document.createElement("div");
      row.className = "grid-row";

      // --- Cover ---
      var coverCell = document.createElement("div");
      coverCell.className = "grid-cell";
      coverCell.setAttribute("data-label", "جلد");
      if (course.cover_image) {
        var img = document.createElement("img");
        img.className = "course-cover";
        img.src = buildFileUrl(course.cover_image);
        img.alt = course.name || '';
        img.onerror = function() { this.style.display='none'; };
        coverCell.appendChild(img);
      } else {
        coverCell.innerHTML = '<div class="course-cover-placeholder"><i class="fas fa-book"></i></div>';
      }

      // --- Name ---
      var nameCell = document.createElement("div");
      nameCell.className = "grid-cell";
      nameCell.setAttribute("data-label", "نام درس");
      nameCell.innerHTML = '<strong>' + (course.name || '') + '</strong>';

      // --- Code ---
      var codeCell = document.createElement("div");
      codeCell.className = "grid-cell";
      codeCell.setAttribute("data-label", "کد درس");
      codeCell.textContent = course.code || '-';

      // --- Unit ---
      var unitCell = document.createElement("div");
      unitCell.className = "grid-cell";
      unitCell.setAttribute("data-label", "واحد");
      unitCell.textContent = course.unit || '-';

      // --- Field ---
      var fieldCell = document.createElement("div");
      fieldCell.className = "grid-cell";
      fieldCell.setAttribute("data-label", "رشته");
      var badge = document.createElement("span");
      badge.className = "field-badge fb-blue";
      badge.textContent = course.field || '-';
      fieldCell.appendChild(badge);

      // --- PDF ---
      var pdfCell = document.createElement("div");
      pdfCell.className = "grid-cell";
      pdfCell.setAttribute("data-label", "PDF");
      if (course.pdf_file) {
        var pdfBtn = document.createElement("button");
        pdfBtn.className = "pdf-btn";
        pdfBtn.innerHTML = '<i class="fas fa-download"></i> دانلود';
        pdfBtn.addEventListener("click", (function(f) { return function() { downloadPDF(f); }; })(course.pdf_file));
        pdfCell.appendChild(pdfBtn);
      } else {
        var noPdf = document.createElement("span");
        noPdf.className = "no-pdf";
        noPdf.textContent = "بدون PDF";
        pdfCell.appendChild(noPdf);
      }

      // --- Actions ---
      var actCell = document.createElement("div");
      actCell.className = "grid-cell";
      actCell.setAttribute("data-label", "عملیات");
      var actDiv = document.createElement("div");
      actDiv.className = "action-btns-vertical";

      var detailsBtn = document.createElement("button");
      detailsBtn.className = "action-btn-vertical btn-info";
      detailsBtn.innerHTML = '<i class="fas fa-eye"></i> مشخصات';
      detailsBtn.addEventListener("click", (function(id) { return function() { openCourseDetails(id); }; })(course.id));

      var editBtn = document.createElement("button");
      editBtn.className = "action-btn-vertical btn-edit2";
      editBtn.innerHTML = '<i class="fas fa-edit"></i> ویرایش';
      editBtn.addEventListener("click", (function(id) { return function() { openCourseDetailsForEdit(id); }; })(course.id));

      var deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn-vertical btn-del2";
      deleteBtn.innerHTML = '<i class="fas fa-archive"></i> آرشیو';
      deleteBtn.addEventListener("click", (function(id) { return function() { openDeleteModal(id); }; })(course.id));

      actDiv.appendChild(detailsBtn);
      actDiv.appendChild(editBtn);
      actDiv.appendChild(deleteBtn);
      actCell.appendChild(actDiv);

      row.appendChild(coverCell);
      row.appendChild(nameCell);
      row.appendChild(codeCell);
      row.appendChild(unitCell);
      row.appendChild(fieldCell);
      row.appendChild(pdfCell);
      row.appendChild(actCell);
      tbody.appendChild(row);
    })(page[i]);
  }
  updatePagination();
}

// ==================== FILE URL HELPER ====================
function buildFileUrl(filePath) {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) return filePath;
  // حذف ../  از ابتدا
  var clean = filePath.replace(/^(\.\.\/)+/, '');
  return window.location.origin + '/borbor/' + clean;
}

// ==================== PAGINATION ====================
function updatePagination() {
  var total = Math.ceil(filteredCourses.length / rowsPerPage) || 1;
  var pageInfo = document.getElementById("pageInfo");
  var prevBtn  = document.getElementById("prevBtn");
  var nextBtn  = document.getElementById("nextBtn");
  if (!pageInfo) return;
  pageInfo.textContent = 'صفحه ' + currentPage + ' از ' + total;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= total;
}

function changePage(direction) {
  var total = Math.ceil(filteredCourses.length / rowsPerPage);
  var next  = currentPage + direction;
  if (next < 1 || next > total) return;
  currentPage = next;
  renderCoursesTable();
}

// ==================== SEARCH & FILTER ====================
function applyFilters() {
  var q       = (document.getElementById("courseSearch") ? document.getElementById("courseSearch").value : '').toLowerCase().trim();
  var fieldId = document.getElementById("fieldFilter") ? document.getElementById("fieldFilter").value : '';
  var unit    = document.getElementById("unitFilter")  ? document.getElementById("unitFilter").value  : '';
  filteredCourses = courses.filter(function(c) {
    var matchQ = !q || (c.name||'').toLowerCase().includes(q) || (c.code||'').toLowerCase().includes(q) || (c.author||'').toLowerCase().includes(q) || (c.field||'').toLowerCase().includes(q);
    var matchF = !fieldId || String(c.field_id) === String(fieldId);
    var matchU = !unit    || String(c.unit) === unit;
    return matchQ && matchF && matchU;
  });
  currentPage = 1;
  renderCoursesTable();
}

// ==================== COURSE DETAILS MODAL ====================
function openCourseDetails(courseId) {
  currentCourse = null;
  for (var i = 0; i < courses.length; i++) {
    if (courses[i].id == courseId) { currentCourse = courses[i]; break; }
  }
  if (!currentCourse) return;

  // Cover
  var coverImage = document.getElementById("courseCoverImage");
  var coverPH    = document.getElementById("coverPlaceholderView");
  if (coverImage) {
    if (currentCourse.cover_image) {
      coverImage.src = buildFileUrl(currentCourse.cover_image);
      coverImage.style.display = "block";
      if (coverPH) coverPH.style.display = "none";
    } else {
      coverImage.style.display = "none";
      if (coverPH) coverPH.style.display = "flex";
    }
  }

  safeSet("detailCourseName",       currentCourse.name        || '-');
  safeSet("detailCourseCode",       currentCourse.code        || '-');
  safeSet("detailCourseUnits",      currentCourse.unit        || '-');
  safeSet("detailCourseField",      currentCourse.field       || '-');
  safeSet("detailCourseAuthor",     currentCourse.author      || '-');
  safeSet("detailCoursePublisher",  currentCourse.publisher   || '-');
  safeSet("detailCourseYear",       currentCourse.year        || '-');
  safeSet("detailCourseEvaluation", currentCourse.evaluation  || '-');

  // PDF
  var detailPDF = document.getElementById("detailCoursePDF");
  if (detailPDF) {
    detailPDF.innerHTML = '';
    if (currentCourse.pdf_file) {
      var pdfBtn = document.createElement("button");
      pdfBtn.className = "pdf-btn";
      pdfBtn.innerHTML = '<i class="fas fa-download"></i> دانلود PDF';
      pdfBtn.addEventListener("click", function() { downloadPDF(currentCourse.pdf_file); });
      detailPDF.appendChild(pdfBtn);
    } else {
      detailPDF.textContent = "بدون فایل";
    }
  }

  // نمایش حالت view
  var viewMode = document.getElementById("detailsViewMode");
  var editMode = document.getElementById("detailsEditMode");
  var editBtn  = document.getElementById("detailsEditBtn");
  var saveBtn  = document.getElementById("detailsSaveBtn");
  var cancelBtn= document.getElementById("detailsCancelBtn");
  if (viewMode)  viewMode.style.display  = "flex";
  if (editMode)  editMode.style.display  = "none";
  if (editBtn)   editBtn.style.display   = "flex";
  if (saveBtn)   saveBtn.style.display   = "none";
  if (cancelBtn) cancelBtn.style.display = "none";

  var modal = document.getElementById("courseDetailsModal");
  if (modal) modal.classList.add("active");
}

function openCourseDetailsForEdit(courseId) {
  openCourseDetails(courseId);
  enableDetailsEdit();
}

function closeCourseDetailsModal() {
  var modal = document.getElementById("courseDetailsModal");
  if (modal) modal.classList.remove("active");
  currentCourse = null;
}

// ==================== EDIT MODE ====================
function enableDetailsEdit() {
  if (!currentCourse) return;

  var editFieldEl = document.getElementById("editCourseField");
  if (editFieldEl) editFieldEl.innerHTML = buildFieldOptions(currentCourse.field_id || '');

  var editCoverImage = document.getElementById("editCourseCoverImage");
  if (editCoverImage) {
    if (currentCourse.cover_image) {
      editCoverImage.src = buildFileUrl(currentCourse.cover_image);
      editCoverImage.style.display = "block";
    } else {
      editCoverImage.style.display = "none";
    }
  }

  safeVal("editCourseName",       currentCourse.name       || '');
  safeVal("editCourseCode",       currentCourse.code       || '');
  safeVal("editCourseUnits",      currentCourse.unit       || '');
  safeVal("editCourseAuthor",     currentCourse.author     || '');
  safeVal("editCoursePublisher",  currentCourse.publisher  || '');
  safeVal("editCourseYear",       currentCourse.year       || '');
  safeVal("editCourseEvaluation", currentCourse.evaluation || 'امتحان ترم');

  currentCourse.tempCoverFile = null;
  currentCourse.tempPDFFile   = null;

  var pdfStatus = document.getElementById("editPDFStatus");
  if (pdfStatus) {
    if (currentCourse.pdf_file) {
      pdfStatus.textContent = "دارای فایل PDF";
      pdfStatus.style.color = "#27ae60";
    } else {
      pdfStatus.textContent = "بدون فایل";
      pdfStatus.style.color = "rgba(255,255,255,0.7)";
    }
  }

  var viewMode  = document.getElementById("detailsViewMode");
  var editMode  = document.getElementById("detailsEditMode");
  var editBtn   = document.getElementById("detailsEditBtn");
  var saveBtn   = document.getElementById("detailsSaveBtn");
  var cancelBtn = document.getElementById("detailsCancelBtn");
  if (viewMode)  viewMode.style.display  = "none";
  if (editMode)  editMode.style.display  = "flex";
  if (editBtn)   editBtn.style.display   = "none";
  if (saveBtn)   saveBtn.style.display   = "flex";
  if (cancelBtn) cancelBtn.style.display = "flex";
}

function saveDetailsEdit() {
  if (!currentCourse) return;
  var name       = (document.getElementById("editCourseName")       ? document.getElementById("editCourseName").value.trim()       : '');
  var code       = (document.getElementById("editCourseCode")       ? document.getElementById("editCourseCode").value.trim()       : '');
  var unit       = parseInt(document.getElementById("editCourseUnits") ? document.getElementById("editCourseUnits").value : 0);
  var field_id   = parseInt(document.getElementById("editCourseField") ? document.getElementById("editCourseField").value : 0) || null;
  var author     = (document.getElementById("editCourseAuthor")     ? document.getElementById("editCourseAuthor").value.trim()     : '');
  var publisher  = (document.getElementById("editCoursePublisher")  ? document.getElementById("editCoursePublisher").value.trim()  : '');
  var year       = (document.getElementById("editCourseYear")       ? document.getElementById("editCourseYear").value.trim()       : '');
  var evaluation = (document.getElementById("editCourseEvaluation") ? document.getElementById("editCourseEvaluation").value       : '');
  var topics     = currentCourse.topics      || '';
  var description= currentCourse.description || '';

  if (!name || !unit) { showToast("نام درس و تعداد واحد الزامی است!", "error"); return; }

  var saveBtn = document.getElementById("detailsSaveBtn");
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }

  var uploadPromises = [], newCoverPath = null, newPDFPath = null;
  if (currentCourse.tempCoverFile) uploadPromises.push(uploadFile(currentCourse.tempCoverFile).then(function(p){ newCoverPath = p; }));
  if (currentCourse.tempPDFFile)   uploadPromises.push(uploadFile(currentCourse.tempPDFFile).then(function(p){ newPDFPath = p; }));

  Promise.all(uploadPromises)
    .then(function() {
      return apiPut({
        id: currentCourse.id, name: name, code: code, unit: unit, field_id: field_id,
        author: author, publisher: publisher, year: year, evaluation: evaluation,
        cover_image: newCoverPath || currentCourse.cover_image || '',
        pdf_file:    newPDFPath   || currentCourse.pdf_file    || '',
        topics: topics, description: description
      });
    })
    .then(function(data) {
      if (!data.success) throw new Error(data.message);

      currentCourse.name        = name;
      currentCourse.code        = code;
      currentCourse.unit        = unit;
      currentCourse.field_id    = field_id;
      currentCourse.field       = getFieldTitle(field_id);
      currentCourse.author      = author;
      currentCourse.publisher   = publisher;
      currentCourse.year        = year;
      currentCourse.evaluation  = evaluation;
      if (newCoverPath) currentCourse.cover_image = newCoverPath;
      if (newPDFPath)   currentCourse.pdf_file    = newPDFPath;
      currentCourse.tempCoverFile = null;
      currentCourse.tempPDFFile   = null;

      safeSet("detailCourseName",       name);
      safeSet("detailCourseCode",       code);
      safeSet("detailCourseUnits",      unit);
      safeSet("detailCourseField",      currentCourse.field);
      safeSet("detailCourseAuthor",     author      || '-');
      safeSet("detailCoursePublisher",  publisher   || '-');
      safeSet("detailCourseYear",       year        || '-');
      safeSet("detailCourseEvaluation", evaluation);

      var coverImage = document.getElementById("courseCoverImage");
      if (coverImage) {
        if (currentCourse.cover_image) { coverImage.src = buildFileUrl(currentCourse.cover_image); coverImage.style.display = "block"; }
        else { coverImage.style.display = "none"; }
      }

      var detailPDF = document.getElementById("detailCoursePDF");
      if (detailPDF) {
        detailPDF.innerHTML = '';
        if (currentCourse.pdf_file) {
          var pdfBtn = document.createElement("button"); pdfBtn.className = "pdf-btn";
          pdfBtn.innerHTML = '<i class="fas fa-download"></i> دانلود PDF';
          pdfBtn.addEventListener("click", function(){ downloadPDF(currentCourse.pdf_file); });
          detailPDF.appendChild(pdfBtn);
        } else { detailPDF.textContent = "بدون فایل"; }
      }

      var viewMode  = document.getElementById("detailsViewMode");
      var editMode  = document.getElementById("detailsEditMode");
      var editBtn2  = document.getElementById("detailsEditBtn");
      var cancelBtn = document.getElementById("detailsCancelBtn");
      if (viewMode)  viewMode.style.display  = "flex";
      if (editMode)  editMode.style.display  = "none";
      if (editBtn2)  editBtn2.style.display  = "flex";
      if (saveBtn)   saveBtn.style.display   = "none";
      if (cancelBtn) cancelBtn.style.display = "none";

      renderCoursesTable();
      showToast("اطلاعات با موفقیت به‌روزرسانی شد!", "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در ذخیره", "error"); })
    .then(function() {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-check"></i> ذخیره'; }
    });
}

function cancelDetailsEdit() {
  if (currentCourse) { currentCourse.tempCoverFile = null; currentCourse.tempPDFFile = null; }
  var editCoverUpload = document.getElementById("editCoverUpload");
  var editPDFUpload   = document.getElementById("editPDFUpload");
  if (editCoverUpload) editCoverUpload.value = "";
  if (editPDFUpload)   editPDFUpload.value   = "";

  var viewMode  = document.getElementById("detailsViewMode");
  var editMode  = document.getElementById("detailsEditMode");
  var editBtn   = document.getElementById("detailsEditBtn");
  var saveBtn   = document.getElementById("detailsSaveBtn");
  var cancelBtn = document.getElementById("detailsCancelBtn");
  if (viewMode)  viewMode.style.display  = "flex";
  if (editMode)  editMode.style.display  = "none";
  if (editBtn)   editBtn.style.display   = "flex";
  if (saveBtn)   saveBtn.style.display   = "none";
  if (cancelBtn) cancelBtn.style.display = "none";
}

// ==================== FILE UPLOADS ====================
function handleEditCoverUpload(input) {
  var file = input.files[0]; if (!file) return;
  if (!['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)) { showToast("فقط فایل‌های تصویری مجاز هستند!", "error"); input.value = ""; return; }
  if (file.size > 5 * 1024 * 1024) { showToast("حجم فایل نباید بیشتر از 5MB باشد!", "error"); input.value = ""; return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = document.getElementById("editCourseCoverImage");
    if (img) { img.src = e.target.result; img.style.display = "block"; }
  };
  reader.readAsDataURL(file);
  if (currentCourse) currentCourse.tempCoverFile = file;
  showToast("عکس انتخاب شد", "info");
}

function handleEditPDFUpload(input) {
  var file = input.files[0]; if (!file) return;
  if (file.type !== 'application/pdf') { showToast("فقط فایل PDF مجاز است!", "error"); input.value = ""; return; }
  if (file.size > 20 * 1024 * 1024) { showToast("حجم فایل نباید بیشتر از 20MB باشد!", "error"); input.value = ""; return; }
  if (currentCourse) currentCourse.tempPDFFile = file;
  var pdfStatus = document.getElementById("editPDFStatus");
  if (pdfStatus) { pdfStatus.textContent = "فایل انتخاب شد: " + file.name; pdfStatus.style.color = "#27ae60"; }
  showToast("PDF انتخاب شد", "info");
}

function handleAddCoverUpload(input) {
  var file = input.files[0]; if (!file) return;
  if (!['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)) { showToast("فقط فایل‌های تصویری مجاز هستند!", "error"); input.value = ""; return; }
  if (file.size > 5 * 1024 * 1024) { showToast("حجم فایل نباید بیشتر از 5MB باشد!", "error"); input.value = ""; return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    var ph   = document.getElementById("newCoursePH");
    var prev = document.getElementById("newCoursePreview");
    if (ph)   ph.style.display   = "none";
    if (prev) { prev.src = e.target.result; prev.style.display = "block"; }
  };
  reader.readAsDataURL(file);
  window.tempAddCoverFile = file;
  showToast("عکس انتخاب شد", "info");
}

function handleAddPDFUpload(input) {
  var file = input.files[0]; if (!file) return;
  if (file.type !== 'application/pdf') { showToast("فقط فایل PDF مجاز است!", "error"); input.value = ""; return; }
  if (file.size > 20 * 1024 * 1024) { showToast("حجم فایل نباید بیشتر از 20MB باشد!", "error"); input.value = ""; return; }
  window.tempAddPDFFile = file;
  var st = document.getElementById("addPDFStatus");
  if (st) { st.textContent = "فایل: " + file.name; st.style.color = "#27ae60"; }
  showToast("PDF انتخاب شد", "info");
}

// ==================== DELETE ====================
function openDeleteModal(courseId) {
  courseToDelete = null;
  for (var i = 0; i < courses.length; i++) {
    if (courses[i].id == courseId) { courseToDelete = courses[i]; break; }
  }
  if (!courseToDelete) return;
  safeSet("deleteCourseNameDisplay", courseToDelete.name);
  var modal = document.getElementById("deleteConfirmModal");
  if (modal) modal.classList.add("active");
}

function closeDeleteModal() {
  var modal = document.getElementById("deleteConfirmModal");
  if (modal) modal.classList.remove("active");
  courseToDelete = null;
}

function confirmDeleteCourse() {
  if (!courseToDelete) return;
  var id = courseToDelete.id, name = courseToDelete.name;
  apiDelete(id)
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      courses         = courses.filter(function(c) { return c.id != id; });
      filteredCourses = filteredCourses.filter(function(c) { return c.id != id; });
      closeDeleteModal();
      renderCoursesTable();
      updateExcelCounts();
      showToast('درس "' + name + '" با موفقیت آرشیو شد', "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در آرشیو", "error"); })
    .then(function() { courseToDelete = null; });
}

// ==================== ADD MODAL ====================
function openAddCourseModal() {
  var modal = document.getElementById("chooseMethodModal");
  if (modal) modal.classList.add("active");
}
function closeChooseMethodModal() {
  var modal = document.getElementById("chooseMethodModal");
  if (modal) modal.classList.remove("active");
}

function openManualAddModal() {
  closeChooseMethodModal();

  // ریست فرم
  ['addCourseName','addCourseCode','addCourseUnits','addCourseAuthor','addCoursePublisher','addCourseYear','addCourseTopics','addCourseDescription'].forEach(function(id) {
    safeVal(id, '');
  });

  var fieldEl = document.getElementById("addCourseField");
  if (fieldEl) fieldEl.innerHTML = buildFieldOptions('');

  var evalEl = document.getElementById("addCourseEvaluation");
  if (evalEl) evalEl.value = 'امتحان ترم';

  // ریست preview تصویر
  var ph   = document.getElementById("newCoursePH");
  var prev = document.getElementById("newCoursePreview");
  if (ph)   ph.style.display   = "flex";
  if (prev) { prev.style.display = "none"; prev.src = ''; }

  var addCoverUpload = document.getElementById("addCoverUpload");
  var addPDFUpload   = document.getElementById("addPDFUpload");
  if (addCoverUpload) addCoverUpload.value = '';
  if (addPDFUpload)   addPDFUpload.value   = '';

  var pdfSt = document.getElementById("addPDFStatus");
  if (pdfSt) { pdfSt.textContent = 'بدون فایل'; pdfSt.style.color = 'var(--text-muted)'; }

  window.tempAddCoverFile = null;
  window.tempAddPDFFile   = null;

  var modal = document.getElementById("manualAddModal");
  if (modal) modal.classList.add("active");
}

function closeManualAddModal() {
  var modal = document.getElementById("manualAddModal");
  if (modal) modal.classList.remove("active");
  window.tempAddCoverFile = null;
  window.tempAddPDFFile   = null;
}

function openExcelImportModal() {
  closeChooseMethodModal();
  showToast("قابلیت افزودن از طریق Excel به زودی اضافه می‌شود", "info");
}

function saveNewCourse() {
  var name        = document.getElementById("addCourseName")        ? document.getElementById("addCourseName").value.trim()        : '';
  var code        = document.getElementById("addCourseCode")        ? document.getElementById("addCourseCode").value.trim()        : '';
  var unit        = parseInt(document.getElementById("addCourseUnits") ? document.getElementById("addCourseUnits").value : 0);
  var field_id    = parseInt(document.getElementById("addCourseField") ? document.getElementById("addCourseField").value : 0) || null;
  var author      = document.getElementById("addCourseAuthor")      ? document.getElementById("addCourseAuthor").value.trim()      : '';
  var publisher   = document.getElementById("addCoursePublisher")   ? document.getElementById("addCoursePublisher").value.trim()   : '';
  var year        = document.getElementById("addCourseYear")        ? document.getElementById("addCourseYear").value.trim()        : '';
  var evaluation  = document.getElementById("addCourseEvaluation")  ? document.getElementById("addCourseEvaluation").value        : 'امتحان ترم';
  var topics      = document.getElementById("addCourseTopics")      ? document.getElementById("addCourseTopics").value.trim()      : '';
  var description = document.getElementById("addCourseDescription") ? document.getElementById("addCourseDescription").value.trim(): '';

  if (!name || !unit || !field_id) { showToast("نام درس، تعداد واحد و رشته الزامی است!", "error"); return; }

  var saveBtn = document.getElementById("saveCourseBtn");
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }

  var uploadPromises = [], coverPath = '', pdfPath = '';
  if (window.tempAddCoverFile) uploadPromises.push(uploadFile(window.tempAddCoverFile).then(function(p){ coverPath = p; }));
  if (window.tempAddPDFFile)   uploadPromises.push(uploadFile(window.tempAddPDFFile).then(function(p){ pdfPath = p; }));

  Promise.all(uploadPromises)
    .then(function() {
      return apiPost({name:name, code:code, unit:unit, field_id:field_id, author:author, publisher:publisher, year:year, evaluation:evaluation, cover_image:coverPath, pdf_file:pdfPath, topics:topics, description:description});
    })
    .then(function(data) {
      if (!data.success) throw new Error(data.message);
      if (data.data) { courses.unshift(data.data); filteredCourses = courses.slice(); renderCoursesTable(); updateExcelCounts(); }
      else fetchCourses();
      closeManualAddModal();
      showToast('درس "' + name + '" با موفقیت اضافه شد!', "success");
    })
    .catch(function(err) { showToast(err.message || "خطا در افزودن درس", "error"); })
    .then(function() {
      if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-plus"></i> افزودن درس'; }
    });
}

// ==================== EXCEL EXPORT ====================
function openExcelExportModal() {
  updateExcelCounts();
  var modal = document.getElementById("excelExportModal");
  if (modal) modal.classList.add("active");
}
function closeExcelExportModal() {
  var modal = document.getElementById("excelExportModal");
  if (modal) modal.classList.remove("active");
}

function updateExcelCounts() {
  var el = document.getElementById("allCoursesCount");
  if (el) el.textContent = courses.length;
  var container = document.getElementById("dynamicFieldCounts");
  if (!container) return;
  container.innerHTML = '';
  fields.forEach(function(f) {
    var count = courses.filter(function(c){ return String(c.field_id) === String(f.id); }).length;
    var btn = document.createElement('button');
    btn.className = 'excel-option-btn';
    btn.innerHTML = '<div class="excel-btn-content"><i class="fas fa-layer-group"></i>' + f.title + '</div><span class="excel-badge">' + count + '</span>';
    btn.onclick = function(){ exportExcelByField(f.id, f.title); };
    container.appendChild(btn);
  });
}

function generateExcelCSV(data) {
  var headers = ['نام درس','کد درس','تعداد واحد','رشته','نویسنده','ناشر','سال انتشار','نوع ارزیابی'];
  var rows = data.map(function(c) {
    return [c.name||'',c.code||'',c.unit||'',c.field||'',c.author||'',c.publisher||'',c.year||'',c.evaluation||'']
      .map(function(v){ return '"' + String(v).replace(/"/g,'""') + '"'; }).join(',');
  });
  return '\uFEFF' + headers.map(function(h){ return '"' + h + '"'; }).join(',') + '\n' + rows.join('\n');
}

function downloadCSV(csvContent, filename) {
  var blob = new Blob([csvContent], {type:'text/csv;charset=utf-8;'});
  var url  = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.appendChild(link); link.click(); document.body.removeChild(link);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

function exportExcelAll() {
  if (courses.length === 0) { showToast("هیچ درسی برای خروجی وجود ندارد", "error"); return; }
  downloadCSV(generateExcelCSV(courses), 'همه_دروس.csv');
  showToast("خروجی CSV از " + courses.length + " درس دانلود شد", "success");
  closeExcelExportModal();
}

function exportExcelByField(fieldId, fieldTitle) {
  var filtered = courses.filter(function(c){ return String(c.field_id) === String(fieldId); });
  if (filtered.length === 0) { showToast("درسی برای رشته " + fieldTitle + " وجود ندارد", "error"); return; }
  downloadCSV(generateExcelCSV(filtered), 'دروس_' + fieldTitle + '.csv');
  showToast("خروجی CSV از " + filtered.length + " درس " + fieldTitle + " دانلود شد", "success");
  closeExcelExportModal();
}

// ==================== DOWNLOAD PDF ====================
function downloadPDF(filePath) {
  if (!filePath) { showToast("فایل PDF موجود نیست", "error"); return; }
  if (filePath.startsWith('data:')) {
    try {
      var parts  = filePath.split(','), base64 = parts[1];
      var binary = atob(base64), array = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) { array[i] = binary.charCodeAt(i); }
      var blob    = new Blob([array], {type:'application/pdf'});
      var blobUrl = URL.createObjectURL(blob);
      var link    = document.createElement('a');
      link.href   = blobUrl; link.download = 'course.pdf';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(function(){ URL.revokeObjectURL(blobUrl); }, 2000);
      showToast("در حال دانلود...", "success");
    } catch(e) { showToast("خطا در دانلود فایل", "error"); }
    return;
  }
  var fullUrl = buildFileUrl(filePath);
  showToast("در حال دانلود...", "success");
  fetch(fullUrl)
    .then(function(r) { if (!r.ok) throw new Error('خطا'); return r.blob(); })
    .then(function(blob) {
      var blobUrl = URL.createObjectURL(blob);
      var link    = document.createElement('a');
      link.href   = blobUrl;
      link.download = fullUrl.split('/').pop() || 'course.pdf';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      setTimeout(function(){ URL.revokeObjectURL(blobUrl); }, 2000);
    })
    .catch(function() { showToast("خطا در دانلود فایل", "error"); });
}

// ==================== TOAST ====================
function showToast(message, type) {
  type = type || "success";
  var toast = document.getElementById("successToast");
  var msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;
  toast.classList.remove("error","warning","info");
  if (type !== "success") toast.classList.add(type);
  msgEl.textContent = message;
  toast.classList.remove("hide"); toast.classList.add("show");
  setTimeout(closeToast, 3000);
}
function closeToast() {
  var toast = document.getElementById("successToast"); if (!toast) return;
  toast.classList.remove("show"); toast.classList.add("hide");
  setTimeout(function(){ toast.classList.remove("hide"); }, 400);
}

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", function() {
  fetchCourses();

  var courseSearch = document.getElementById("courseSearch");
  var fieldFilter  = document.getElementById("fieldFilter");
  var unitFilter   = document.getElementById("unitFilter");
  if (courseSearch) courseSearch.addEventListener("input", applyFilters);
  if (fieldFilter)  fieldFilter.addEventListener("change", applyFilters);
  if (unitFilter)   unitFilter.addEventListener("change", applyFilters);

  // بستن مودال با کلیک خارج
  var modalMap = {
    'chooseMethodModal':   closeChooseMethodModal,
    'manualAddModal':      closeManualAddModal,
    'courseDetailsModal':  closeCourseDetailsModal,
    'deleteConfirmModal':  closeDeleteModal,
    'excelExportModal':    closeExcelExportModal
  };
  Object.keys(modalMap).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function(e) { if (e.target === this) modalMap[id](); });
  });
});