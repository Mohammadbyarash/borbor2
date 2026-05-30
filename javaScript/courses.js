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

    // ==================== STATE ====================
    var courses        = [];
    var filteredCourses= [];
    var fields         = [];   // {id, title} از DB
    var currentPage    = 1;
    var rowsPerPage    = 5;
    var currentCourse  = null;
    var courseToDelete = null;
    var API            = '../api/courses.php';
    var UPLOAD_API     = '../api/upload.php';

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
    // value = field_id (عدد)
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

    // ==================== ADMIN INFO ====================
    function setAdminInfo(admin) {
      var el = document.getElementById('adminInfoDisplay'); if (!el) return;
      if (admin && admin.name) el.textContent = (admin.role ? admin.role + ': ' : '') + admin.name;
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
          if (data.admin) setAdminInfo(data.admin);
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
      tbody.innerHTML = '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.6);grid-column:1/-1"><i class="fas fa-spinner fa-spin" style="font-size:32px;margin-bottom:12px;display:block"></i><p>در حال بارگذاری...</p></div>';
    }
    function showTableError(msg) {
      var tbody = document.getElementById("coursesTableBody"); if (!tbody) return;
      tbody.innerHTML = '<div style="text-align:center;padding:50px;color:#e74c3c;grid-column:1/-1"><i class="fas fa-exclamation-circle" style="font-size:32px;margin-bottom:12px;display:block"></i><p>' + (msg||'خطا') + '</p><button onclick="fetchCourses()" style="margin-top:12px;padding:8px 20px;background:#e74c3c;color:#fff;border:none;border-radius:8px;cursor:pointer">تلاش مجدد</button></div>';
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
          var row = document.createElement("div"); row.className = "grid-row";

          var coverCell = document.createElement("div"); coverCell.className = "grid-cell"; coverCell.setAttribute("data-label", "عکس جلد");
          if (course.cover_image) {
            var img = document.createElement("img"); img.className = "course-cover"; img.src = course.cover_image; img.alt = course.name || '';
            coverCell.appendChild(img);
          } else { coverCell.innerHTML = '<div class="course-cover-placeholder"><i class="fas fa-book"></i></div>'; }

          var nameCell = document.createElement("div"); nameCell.className = "grid-cell"; nameCell.setAttribute("data-label", "نام درس");
          nameCell.innerHTML = '<strong>' + (course.name || '') + '</strong>';

          var codeCell = document.createElement("div"); codeCell.className = "grid-cell"; codeCell.setAttribute("data-label", "کد درس");
          codeCell.textContent = course.code || '-';

          var unitCell = document.createElement("div"); unitCell.className = "grid-cell"; unitCell.setAttribute("data-label", "تعداد واحد");
          unitCell.textContent = course.unit || '-';

          var fieldCell = document.createElement("div"); fieldCell.className = "grid-cell"; fieldCell.setAttribute("data-label", "رشته");
          var badge = document.createElement("span"); badge.className = "field-badge";
          badge.textContent = course.field || '-';
          fieldCell.appendChild(badge);

          var pdfCell = document.createElement("div"); pdfCell.className = "grid-cell"; pdfCell.setAttribute("data-label", "PDF");
          if (course.pdf_file) {
            var pdfBtn = document.createElement("button"); pdfBtn.className = "pdf-download-btn";
            pdfBtn.innerHTML = '<i class="fas fa-download"></i> دانلود';
            pdfBtn.addEventListener("click", (function(f) { return function() { downloadPDF(f); }; })(course.pdf_file));
            pdfCell.appendChild(pdfBtn);
          } else { var noPdf = document.createElement("span"); noPdf.className = "no-pdf"; noPdf.textContent = "بدون PDF"; pdfCell.appendChild(noPdf); }

          var actCell = document.createElement("div"); actCell.className = "grid-cell"; actCell.setAttribute("data-label", "عملیات");
          var actDiv = document.createElement("div"); actDiv.className = "action-btns-vertical";

          var detailsBtn = document.createElement("button"); detailsBtn.className = "action-btn-vertical btn-details";
          detailsBtn.innerHTML = '<i class="fas fa-eye"></i> مشخصات';
          detailsBtn.addEventListener("click", (function(id) { return function() { openCourseDetails(id); }; })(course.id));

          var editBtn = document.createElement("button"); editBtn.className = "action-btn-vertical btn-edit";
          editBtn.innerHTML = '<i class="fas fa-edit"></i> ویرایش';
          editBtn.addEventListener("click", (function(id) { return function() { openCourseDetailsForEdit(id); }; })(course.id));

          var deleteBtn = document.createElement("button"); deleteBtn.className = "action-btn-vertical btn-delete";
          deleteBtn.innerHTML = '<i class="fas fa-trash"></i> ارشیو';
          deleteBtn.addEventListener("click", (function(id) { return function() { openDeleteModal(id); }; })(course.id));

          actDiv.appendChild(detailsBtn); actDiv.appendChild(editBtn); actDiv.appendChild(deleteBtn);
          actCell.appendChild(actDiv);
          row.appendChild(coverCell); row.appendChild(nameCell); row.appendChild(codeCell);
          row.appendChild(unitCell);  row.appendChild(fieldCell); row.appendChild(pdfCell); row.appendChild(actCell);
          tbody.appendChild(row);
        })(page[i]);
      }
      updatePagination();
    }

    // ==================== PAGINATION ====================
    function updatePagination() {
      var total = Math.ceil(filteredCourses.length / rowsPerPage) || 1;
      var pageInfo = document.getElementById("pageInfo"), prevBtn = document.getElementById("prevBtn"), nextBtn = document.getElementById("nextBtn");
      if (!pageInfo) return;
      pageInfo.textContent = 'صفحه ' + currentPage + ' از ' + total;
      prevBtn.disabled = currentPage === 1; nextBtn.disabled = currentPage >= total;
      prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1'; nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
      prevBtn.style.cursor = prevBtn.disabled ? 'not-allowed' : 'pointer'; nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
    }
    function changePage(direction) {
      var total = Math.ceil(filteredCourses.length / rowsPerPage), next = currentPage + direction;
      if (next < 1 || next > total) return;
      currentPage = next; renderCoursesTable();
      var tc = document.querySelector(".table-container"); if (tc) tc.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // ==================== SEARCH & FILTER ====================
    // فیلتر بر اساس field_id
    function applyFilters() {
      var q      = (document.getElementById("courseSearch") ? document.getElementById("courseSearch").value : '').toLowerCase().trim();
      var fieldId= document.getElementById("fieldFilter") ? document.getElementById("fieldFilter").value : '';
      var unit   = document.getElementById("unitFilter")  ? document.getElementById("unitFilter").value  : '';
      filteredCourses = courses.filter(function(c) {
        var matchQ = !q || (c.name||'').toLowerCase().includes(q) || (c.code||'').toLowerCase().includes(q) || (c.author||'').toLowerCase().includes(q) || (c.field||'').toLowerCase().includes(q);
        var matchF = !fieldId || String(c.field_id) === String(fieldId);
        var matchU = !unit    || String(c.unit) === unit;
        return matchQ && matchF && matchU;
      });
      currentPage = 1; renderCoursesTable();
    }

    // ==================== COURSE DETAILS MODAL ====================
    function openCourseDetails(courseId) {
      currentCourse = null;
      for (var i = 0; i < courses.length; i++) { if (courses[i].id == courseId) { currentCourse = courses[i]; break; } }
      if (!currentCourse) return;

      var coverImage = document.getElementById("courseCoverImage");
      if (currentCourse.cover_image) { coverImage.src = currentCourse.cover_image; coverImage.style.display = "block"; }
      else { coverImage.style.display = "none"; }

      document.getElementById("detailCourseName").textContent        = currentCourse.name || '-';
      document.getElementById("detailCourseCode").textContent        = currentCourse.code || '-';
      document.getElementById("detailCourseUnits").textContent       = currentCourse.unit || '-';
      document.getElementById("detailCourseField").textContent       = currentCourse.field || '-';
      document.getElementById("detailCourseAuthor").textContent      = currentCourse.author || '-';
      document.getElementById("detailCoursePublisher").textContent   = currentCourse.publisher || '-';
      document.getElementById("detailCourseYear").textContent        = currentCourse.year || '-';
      document.getElementById("detailCourseEvaluation").textContent  = currentCourse.evaluation || '-';
      document.getElementById("detailCourseTopics").textContent      = currentCourse.topics || '-';
      document.getElementById("detailCourseDescription").textContent = currentCourse.description || '-';

      var detailPDF = document.getElementById("detailCoursePDF"); detailPDF.innerHTML = '';
      if (currentCourse.pdf_file) {
        var pdfBtn = document.createElement("button"); pdfBtn.className = "pdf-download-btn";
        pdfBtn.innerHTML = '<i class="fas fa-download"></i> دانلود PDF';
        pdfBtn.addEventListener("click", function() { downloadPDF(currentCourse.pdf_file); });
        detailPDF.appendChild(pdfBtn);
      } else { detailPDF.textContent = "بدون فایل"; }

      document.getElementById("detailsViewMode").style.display  = "flex";
      document.getElementById("detailsEditMode").style.display  = "none";
      document.getElementById("detailsEditBtn").style.display   = "flex";
      document.getElementById("detailsSaveBtn").style.display   = "none";
      document.getElementById("detailsCancelBtn").style.display = "none";
      document.getElementById("courseDetailsModal").classList.add("active");
    }

    function openCourseDetailsForEdit(courseId) { openCourseDetails(courseId); enableDetailsEdit(); }
    function closeCourseDetailsModal() { document.getElementById("courseDetailsModal").classList.remove("active"); currentCourse = null; }

    // ==================== EDIT MODE ====================
    function enableDetailsEdit() {
      if (!currentCourse) return;

      // رشته داینامیک با field_id
      var editFieldEl = document.getElementById("editCourseField");
      if (editFieldEl) editFieldEl.innerHTML = buildFieldOptions(currentCourse.field_id || '');

      var editCoverImage = document.getElementById("editCourseCoverImage");
      if (currentCourse.cover_image) { editCoverImage.src = currentCourse.cover_image; editCoverImage.style.display = "block"; }
      else { editCoverImage.style.display = "none"; }

      document.getElementById("editCourseName").value        = currentCourse.name || '';
      document.getElementById("editCourseCode").value        = currentCourse.code || '';
      document.getElementById("editCourseUnits").value       = currentCourse.unit || '';
      document.getElementById("editCourseAuthor").value      = currentCourse.author || '';
      document.getElementById("editCoursePublisher").value   = currentCourse.publisher || '';
      document.getElementById("editCourseYear").value        = currentCourse.year || '';
      document.getElementById("editCourseEvaluation").value  = currentCourse.evaluation || 'امتحان ترم';
      document.getElementById("editCourseTopics").value      = currentCourse.topics || '';
      document.getElementById("editCourseDescription").value = currentCourse.description || '';

      currentCourse.tempCoverFile = null; currentCourse.tempPDFFile = null;

      var pdfStatus = document.getElementById("editPDFStatus");
      if (currentCourse.pdf_file) { pdfStatus.textContent = "دارای فایل PDF"; pdfStatus.style.color = "#27ae60"; }
      else { pdfStatus.textContent = "بدون فایل"; pdfStatus.style.color = "rgba(255,255,255,0.7)"; }

      document.getElementById("detailsViewMode").style.display  = "none";
      document.getElementById("detailsEditMode").style.display  = "flex";
      document.getElementById("detailsEditBtn").style.display   = "none";
      document.getElementById("detailsSaveBtn").style.display   = "flex";
      document.getElementById("detailsCancelBtn").style.display = "flex";
    }

    function saveDetailsEdit() {
      if (!currentCourse) return;
      var name        = document.getElementById("editCourseName").value.trim();
      var code        = document.getElementById("editCourseCode").value.trim();
      var unit        = parseInt(document.getElementById("editCourseUnits").value);
      var field_id    = parseInt(document.getElementById("editCourseField").value) || null;
      var author      = document.getElementById("editCourseAuthor").value.trim();
      var publisher   = document.getElementById("editCoursePublisher").value.trim();
      var year        = document.getElementById("editCourseYear").value.trim();
      var evaluation  = document.getElementById("editCourseEvaluation").value;
      var topics      = document.getElementById("editCourseTopics").value.trim();
      var description = document.getElementById("editCourseDescription").value.trim();

      if (!name || !unit) { showToast("نام درس و تعداد واحد الزامی است!", "error"); return; }

      var saveBtn = document.getElementById("detailsSaveBtn");
      saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';

      var uploadPromises = [], newCoverPath = null, newPDFPath = null;
      if (currentCourse.tempCoverFile) uploadPromises.push(uploadFile(currentCourse.tempCoverFile).then(function(p){ newCoverPath=p; }));
      if (currentCourse.tempPDFFile)   uploadPromises.push(uploadFile(currentCourse.tempPDFFile).then(function(p){ newPDFPath=p; }));

      Promise.all(uploadPromises)
        .then(function() {
          return apiPut({
            id: currentCourse.id, name, code, unit, field_id,
            author, publisher, year, evaluation,
            cover_image: newCoverPath || currentCourse.cover_image || '',
            pdf_file:    newPDFPath   || currentCourse.pdf_file    || '',
            topics, description
          });
        })
        .then(function(data) {
          if (!data.success) throw new Error(data.message);

          currentCourse.name=name; currentCourse.code=code; currentCourse.unit=unit;
          currentCourse.field_id=field_id; currentCourse.field=getFieldTitle(field_id);
          currentCourse.author=author; currentCourse.publisher=publisher; currentCourse.year=year;
          currentCourse.evaluation=evaluation; currentCourse.topics=topics; currentCourse.description=description;
          if (newCoverPath) currentCourse.cover_image=newCoverPath;
          if (newPDFPath)   currentCourse.pdf_file=newPDFPath;
          currentCourse.tempCoverFile=null; currentCourse.tempPDFFile=null;

          document.getElementById("detailCourseName").textContent        = name;
          document.getElementById("detailCourseCode").textContent        = code;
          document.getElementById("detailCourseUnits").textContent       = unit;
          document.getElementById("detailCourseField").textContent       = currentCourse.field;
          document.getElementById("detailCourseAuthor").textContent      = author || '-';
          document.getElementById("detailCoursePublisher").textContent   = publisher || '-';
          document.getElementById("detailCourseYear").textContent        = year || '-';
          document.getElementById("detailCourseEvaluation").textContent  = evaluation;
          document.getElementById("detailCourseTopics").textContent      = topics || '-';
          document.getElementById("detailCourseDescription").textContent = description || '-';

          var coverImage = document.getElementById("courseCoverImage");
          if (currentCourse.cover_image) { coverImage.src=currentCourse.cover_image; coverImage.style.display="block"; }
          else { coverImage.style.display="none"; }

          var detailPDF = document.getElementById("detailCoursePDF"); detailPDF.innerHTML='';
          if (currentCourse.pdf_file) {
            var pdfBtn=document.createElement("button"); pdfBtn.className="pdf-download-btn";
            pdfBtn.innerHTML='<i class="fas fa-download"></i> دانلود PDF';
            pdfBtn.addEventListener("click",function(){ downloadPDF(currentCourse.pdf_file); });
            detailPDF.appendChild(pdfBtn);
          } else { detailPDF.textContent="بدون فایل"; }

          document.getElementById("detailsViewMode").style.display  = "flex";
          document.getElementById("detailsEditMode").style.display  = "none";
          document.getElementById("detailsEditBtn").style.display   = "flex";
          document.getElementById("detailsSaveBtn").style.display   = "none";
          document.getElementById("detailsCancelBtn").style.display = "none";
          renderCoursesTable();
          showToast("اطلاعات با موفقیت به‌روزرسانی شد!", "success");
        })
        .catch(function(err) { showToast(err.message || "خطا در ذخیره", "error"); })
        .then(function() { saveBtn.disabled=false; saveBtn.innerHTML='<i class="fas fa-check"></i> ذخیره'; });
    }

    function cancelDetailsEdit() {
      if (currentCourse) { currentCourse.tempCoverFile=null; currentCourse.tempPDFFile=null; }
      document.getElementById("editCoverUpload").value=""; document.getElementById("editPDFUpload").value="";
      document.getElementById("detailsViewMode").style.display="flex"; document.getElementById("detailsEditMode").style.display="none";
      document.getElementById("detailsEditBtn").style.display="flex"; document.getElementById("detailsSaveBtn").style.display="none";
      document.getElementById("detailsCancelBtn").style.display="none";
    }

    // ==================== FILE UPLOADS ====================
    function handleEditCoverUpload(input) {
      var file=input.files[0]; if(!file) return;
      if(!['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)){showToast("فقط فایل‌های تصویری مجاز هستند!","error");input.value="";return;}
      if(file.size>5*1024*1024){showToast("حجم فایل نباید بیشتر از 5MB باشد!","error");input.value="";return;}
      var reader=new FileReader();
      reader.onload=function(e){var img=document.getElementById("editCourseCoverImage");img.src=e.target.result;img.style.display="block";};
      reader.readAsDataURL(file);
      if(currentCourse) currentCourse.tempCoverFile=file;
      showToast("عکس انتخاب شد","info");
    }
    function handleEditPDFUpload(input) {
      var file=input.files[0]; if(!file) return;
      if(file.type!=='application/pdf'){showToast("فقط فایل PDF مجاز است!","error");input.value="";return;}
      if(file.size>20*1024*1024){showToast("حجم فایل نباید بیشتر از 20MB باشد!","error");input.value="";return;}
      if(currentCourse) currentCourse.tempPDFFile=file;
      document.getElementById("editPDFStatus").textContent="فایل انتخاب شد: "+file.name;
      document.getElementById("editPDFStatus").style.color="#27ae60";
      showToast("PDF انتخاب شد","info");
    }
    function handleAddCoverUpload(input) {
      var file=input.files[0]; if(!file) return;
      if(!['image/png','image/jpeg','image/jpg','image/webp'].includes(file.type)){showToast("فقط فایل‌های تصویری مجاز هستند!","error");input.value="";return;}
      if(file.size>5*1024*1024){showToast("حجم فایل نباید بیشتر از 5MB باشد!","error");input.value="";return;}
      var reader=new FileReader();
      reader.onload=function(e){
        var container=document.getElementById("addCourseCoverContainer"); container.innerHTML='';
        var img=document.createElement("img"); img.className="course-cover-large"; img.src=e.target.result; img.alt="جلد کتاب";
        container.appendChild(img);
      };
      reader.readAsDataURL(file); window.tempAddCoverFile=file;
      showToast("عکس انتخاب شد","info");
    }
    function handleAddPDFUpload(input) {
      var file=input.files[0]; if(!file) return;
      if(file.type!=='application/pdf'){showToast("فقط فایل PDF مجاز است!","error");input.value="";return;}
      if(file.size>20*1024*1024){showToast("حجم فایل نباید بیشتر از 20MB باشد!","error");input.value="";return;}
      window.tempAddPDFFile=file;
      document.getElementById("addPDFStatus").textContent="فایل: "+file.name;
      document.getElementById("addPDFStatus").style.color="#27ae60";
      showToast("PDF انتخاب شد","info");
    }

    // ==================== DELETE ====================
    function openDeleteModal(courseId) {
      courseToDelete=null;
      for(var i=0;i<courses.length;i++){if(courses[i].id==courseId){courseToDelete=courses[i];break;}}
      if(!courseToDelete) return;
      document.getElementById("deleteCourseNameDisplay").textContent=courseToDelete.name;
      document.getElementById("deleteConfirmModal").classList.add("active");
    }
    function closeDeleteModal(){document.getElementById("deleteConfirmModal").classList.remove("active");courseToDelete=null;}
    function confirmDeleteCourse() {
      if(!courseToDelete) return;
      var id=courseToDelete.id, name=courseToDelete.name;
      var btn=document.querySelector("#deleteConfirmModal .confirm-btn.btn-danger");
      if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال ارشیو...';}
      apiDelete(id)
        .then(function(data){
          if(!data.success) throw new Error(data.message);
          courses=courses.filter(function(c){return c.id!=id;});
          filteredCourses=filteredCourses.filter(function(c){return c.id!=id;});
          closeDeleteModal(); renderCoursesTable(); updateExcelCounts();
          showToast('درس "'+name+'" با موفقیت ارشیو شد',"success");
        })
        .catch(function(err){showToast(err.message||"خطا در ارشیو","error");})
        .then(function(){if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-trash"></i> ارشیو درس';}courseToDelete=null;});
    }

    // ==================== ADD MODAL ====================
    function openAddCourseModal(){document.getElementById("chooseMethodModal").classList.add("active");}
    function closeChooseMethodModal(){document.getElementById("chooseMethodModal").classList.remove("active");}
    function openManualAddModal() {
      closeChooseMethodModal();
      ['addCourseName','addCourseCode','addCourseUnits','addCourseAuthor','addCoursePublisher','addCourseYear','addCourseTopics','addCourseDescription'].forEach(function(id){
        var el=document.getElementById(id); if(el) el.value='';
      });
      // رشته داینامیک
      var fieldEl=document.getElementById("addCourseField");
      if(fieldEl) fieldEl.innerHTML=buildFieldOptions('');

      document.getElementById("addCourseEvaluation").value='امتحان ترم';
      var container=document.getElementById("addCourseCoverContainer"); container.innerHTML='';
      var placeholder=document.createElement("div"); placeholder.className="course-cover-placeholder";
      placeholder.innerHTML='<i class="fas fa-book"></i><p>عکس جلد کتاب</p>';
      container.appendChild(placeholder);
      document.getElementById("addCoverUpload").value=''; document.getElementById("addPDFUpload").value='';
      document.getElementById("addPDFStatus").textContent='بدون فایل';
      document.getElementById("addPDFStatus").style.color='rgba(255,255,255,0.7)';
      window.tempAddCoverFile=null; window.tempAddPDFFile=null;
      document.getElementById("manualAddModal").classList.add("active");
    }
    function closeManualAddModal(){document.getElementById("manualAddModal").classList.remove("active");window.tempAddCoverFile=null;window.tempAddPDFFile=null;}
    function openExcelImportModal(){closeChooseMethodModal();showToast("قابلیت افزودن از طریق Excel به زودی اضافه می‌شود","info");}

    function saveNewCourse() {
      var name        = document.getElementById("addCourseName").value.trim();
      var code        = document.getElementById("addCourseCode").value.trim();
      var unit        = parseInt(document.getElementById("addCourseUnits").value);
      var field_id    = parseInt(document.getElementById("addCourseField").value) || null;
      var author      = document.getElementById("addCourseAuthor").value.trim();
      var publisher   = document.getElementById("addCoursePublisher").value.trim();
      var year        = document.getElementById("addCourseYear").value.trim();
      var evaluation  = document.getElementById("addCourseEvaluation").value;
      var topics      = document.getElementById("addCourseTopics").value.trim();
      var description = document.getElementById("addCourseDescription").value.trim();

      if(!name||!unit||!field_id){showToast("نام درس، تعداد واحد و رشته الزامی است!","error");return;}

      var saveBtn=document.getElementById("saveCourseBtn");
      saveBtn.disabled=true; saveBtn.innerHTML='<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...';

      var uploadPromises=[], coverPath='', pdfPath='';
      if(window.tempAddCoverFile) uploadPromises.push(uploadFile(window.tempAddCoverFile).then(function(p){coverPath=p;}));
      if(window.tempAddPDFFile)   uploadPromises.push(uploadFile(window.tempAddPDFFile).then(function(p){pdfPath=p;}));

      Promise.all(uploadPromises)
        .then(function(){
          return apiPost({name,code,unit,field_id,author,publisher,year,evaluation,cover_image:coverPath,pdf_file:pdfPath,topics,description});
        })
        .then(function(data){
          if(!data.success) throw new Error(data.message);
          if(data.data){courses.unshift(data.data);filteredCourses=courses.slice();renderCoursesTable();updateExcelCounts();}
          else fetchCourses();
          closeManualAddModal();
          showToast('درس "'+name+'" با موفقیت اضافه شد!',"success");
        })
        .catch(function(err){showToast(err.message||"خطا در افزودن درس","error");})
        .then(function(){saveBtn.disabled=false;saveBtn.innerHTML='<i class="fas fa-plus"></i> افزودن درس';});
    }

    // ==================== EXCEL EXPORT ====================
    function openExcelExportModal(){updateExcelCounts();document.getElementById("excelExportModal").classList.add("active");}
    function closeExcelExportModal(){document.getElementById("excelExportModal").classList.remove("active");}

    function updateExcelCounts() {
      var el = document.getElementById("allCoursesCount"); if(el) el.textContent=courses.length;
      // دکمه‌های رشته داینامیک
      var container = document.getElementById("dynamicFieldCounts");
      if (!container) return;
      container.innerHTML='';
      fields.forEach(function(f) {
        var count = courses.filter(function(c){ return String(c.field_id)===String(f.id); }).length;
        var btn = document.createElement('button'); btn.className='excel-option-btn';
        btn.innerHTML='<div class="excel-btn-content"><i class="fas fa-layer-group"></i>'+f.title+'</div><span class="excel-badge">'+count+'</span>';
        btn.onclick=function(){ exportExcelByField(f.id, f.title); };
        container.appendChild(btn);
      });
    }

    function generateExcelCSV(data) {
      var headers=['نام درس','کد درس','تعداد واحد','رشته','نویسنده','ناشر','سال انتشار','نوع ارزیابی'];
      var rows=data.map(function(c){
        return [c.name||'',c.code||'',c.unit||'',c.field||'',c.author||'',c.publisher||'',c.year||'',c.evaluation||'']
          .map(function(v){return '"'+String(v).replace(/"/g,'""')+'"';}).join(',');
      });
      return '\uFEFF'+headers.map(function(h){return '"'+h+'"';}).join(',')+'\n'+rows.join('\n');
    }
    function downloadCSV(csvContent,filename) {
      var blob=new Blob([csvContent],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob);
      var link=document.createElement('a');link.href=url;link.download=filename;
      document.body.appendChild(link);link.click();document.body.removeChild(link);
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
    }
    function exportExcelAll() {
      if(courses.length===0){showToast("هیچ درسی برای خروجی وجود ندارد","error");return;}
      downloadCSV(generateExcelCSV(courses),'همه_دروس.csv');
      showToast("خروجی CSV از "+courses.length+" درس دانلود شد","success");
      closeExcelExportModal();
    }
    function exportExcelByField(fieldId, fieldTitle) {
      var filtered=courses.filter(function(c){return String(c.field_id)===String(fieldId);});
      if(filtered.length===0){showToast("درسی برای رشته "+fieldTitle+" وجود ندارد","error");return;}
      downloadCSV(generateExcelCSV(filtered),'دروس_'+fieldTitle+'.csv');
      showToast("خروجی CSV از "+filtered.length+" درس "+fieldTitle+" دانلود شد","success");
      closeExcelExportModal();
    }

    // ==================== DOWNLOAD PDF ====================
    function downloadPDF(filePath) {
      if(!filePath){showToast("فایل PDF موجود نیست","error");return;}
      if(filePath.startsWith('data:')){
        try{
          var parts=filePath.split(','),base64=parts[1],binary=atob(base64),array=new Uint8Array(binary.length);
          for(var i=0;i<binary.length;i++){array[i]=binary.charCodeAt(i);}
          var blob=new Blob([array],{type:'application/pdf'}),blobUrl=URL.createObjectURL(blob);
          var link=document.createElement('a');link.href=blobUrl;link.download='course.pdf';
          document.body.appendChild(link);link.click();document.body.removeChild(link);
          setTimeout(function(){URL.revokeObjectURL(blobUrl);},2000);
          showToast("در حال دانلود...","success");
        }catch(e){showToast("خطا در دانلود فایل","error");}
        return;
      }
      var fullUrl;
      if(filePath.startsWith('http://')||filePath.startsWith('https://')){fullUrl=filePath;}
      else{
        var cleanPath=filePath.replace(/^(\.\.\/)+/,'');
        if(cleanPath.indexOf('/')===-1) cleanPath='uploads/'+cleanPath;
        fullUrl=window.location.origin+'/borbor/'+cleanPath;
      }
      showToast("در حال دانلود...","success");
      fetch(fullUrl)
        .then(function(r){if(!r.ok) throw new Error('خطا');return r.blob();})
        .then(function(blob){
          var blobUrl=URL.createObjectURL(blob),link=document.createElement('a');
          link.href=blobUrl;link.download=fullUrl.split('/').pop()||'course.pdf';
          document.body.appendChild(link);link.click();document.body.removeChild(link);
          setTimeout(function(){URL.revokeObjectURL(blobUrl);},2000);
        })
        .catch(function(){showToast("خطا در دانلود فایل","error");});
    }

    // ==================== TOAST ====================
    function showToast(message,type) {
      type=type||"success";
      var toast=document.getElementById("successToast"),msgEl=document.getElementById("toastMessage");
      if(!toast||!msgEl) return;
      toast.classList.remove("error","warning","info");
      if(type!=="success") toast.classList.add(type);
      msgEl.textContent=message;
      toast.classList.remove("hide");toast.classList.add("show");
      setTimeout(closeToast,3000);
    }
    function closeToast() {
      var toast=document.getElementById("successToast");if(!toast) return;
      toast.classList.remove("show");toast.classList.add("hide");
      setTimeout(function(){toast.classList.remove("hide");},400);
    }

    // ==================== INIT ====================
    window.addEventListener("DOMContentLoaded", function() {
      fetchCourses();
      var courseSearch=document.getElementById("courseSearch");
      var fieldFilter =document.getElementById("fieldFilter");
      var unitFilter  =document.getElementById("unitFilter");
      if(courseSearch) courseSearch.addEventListener("input",applyFilters);
      if(fieldFilter)  fieldFilter.addEventListener("change",applyFilters);
      if(unitFilter)   unitFilter.addEventListener("change",applyFilters);

      ['chooseMethodModal','manualAddModal','courseDetailsModal','deleteConfirmModal','excelExportModal'].forEach(function(id) {
        var fns={'chooseMethodModal':closeChooseMethodModal,'manualAddModal':closeManualAddModal,'courseDetailsModal':closeCourseDetailsModal,'deleteConfirmModal':closeDeleteModal,'excelExportModal':closeExcelExportModal};
        var el=document.getElementById(id);
        if(el) el.addEventListener("click",function(e){if(e.target===this) fns[id]();});
      });

      var link=document.querySelector('a[href*="Courses"]');
      if(link){
        link.classList.add('active');
        var parent=link.closest('.menu-item.has-submenu');
        if(parent) parent.classList.add('open','active');
      }
    });