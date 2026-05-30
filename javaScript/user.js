// Hamburger Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
});

sidebarOverlay.addEventListener('click', function() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
});

let currentRow = null;
let currentPage = 1;
const rowsPerPage = 6;
let allRows = [];
let currentEditRow = null;

// مدیریت صفحه‌بندی
function initPagination() {
    const tbody = document.getElementById('userTableBody');
    allRows = Array.from(tbody.querySelectorAll('.grid-row'));
    showPage(currentPage);
}

function showPage(page) {
    const tbody = document.getElementById('userTableBody');
    const totalPages = Math.ceil(allRows.length / rowsPerPage);
    
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    allRows.forEach(row => row.style.display = 'none');

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    for (let i = start; i < end && i < allRows.length; i++) {
        allRows[i].style.display = 'grid';
    }

    document.getElementById('pageInfo').textContent = `صفحه ${currentPage} از ${totalPages}`;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function changePage(direction) {
    showPage(currentPage + direction);
}

// Image Preview Functions
function openImagePreview(imgSrc) {
    const modal = document.getElementById('imagePreviewModal');
    const img = document.getElementById('imagePreviewContent');
    img.src = imgSrc;
    modal.classList.add('active');
}

function closeImagePreview() {
    document.getElementById('imagePreviewModal').classList.remove('active');
}

// Photo Upload Function
function handlePhotoUpload(input, row) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const cells = row.querySelectorAll('.grid-cell');
            // ⭐ FIX: عکس باید در cells[6] قرار بگیره
            const photoCell = cells[6];
            const photoContainer = photoCell.querySelector('.book-photo-container');
            if (photoContainer) {
                photoContainer.innerHTML = `<img class="book-photo" src="${e.target.result}" alt="Book Cover">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

// Export Modal
function openExportModal() {
    document.getElementById('exportModal').classList.add('active');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

function exportToExcel(type) {
    let dataToExport = [];
    
    allRows.forEach(row => {
        const cells = row.querySelectorAll('.grid-cell');
        const role = cells[4].textContent;
        
        if (type === 'all' || 
            (type === 'admin' && role === 'مدیر') ||
            (type === 'teacher' && role === 'معلم') ||
            (type === 'assistant' && role === 'معاون')) {
            
            const photoCell = cells[6];
            const photoImg = photoCell.querySelector('.user-photo');
            const photoUrl = photoImg ? photoImg.src : 'بدون عکس';
            
            dataToExport.push({
                name: cells[5].textContent,
                role: cells[4].textContent,
                phone: cells[3].textContent,
                nationalId: cells[2].textContent,
                birthDate: cells[1].textContent,
                photo: photoUrl
            });
        }
    });

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "نام,نقش,شماره موبایل,کد ملی,تاریخ تولد,عکس\n";
    
    dataToExport.forEach(user => {
        csvContent += `${user.name},${user.role},${user.phone},${user.nationalId},${user.birthDate},${user.photo}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closeExportModal();
}

// Add User Modal
function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('active');
}

function addUserManual() {
    closeAddUserModal();
    alert('فرم افزودن دستی کاربر به زودی اضافه خواهد شد!');
}

function addUserExcel() {
    closeAddUserModal();
    alert('قابلیت آپلود فایل Excel برای افزودن کاربران به زودی اضافه خواهد شد!');
}

// باز کردن مودال حذف
function openDeleteModal(button) {
    currentRow = button.closest('.grid-row');
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentRow = null;
}

function confirmDelete() {
    if (currentRow) {
        currentRow.style.transition = 'opacity 0.3s ease';
        currentRow.style.opacity = '0';
        setTimeout(() => {
            const index = allRows.indexOf(currentRow);
            if (index > -1) {
                allRows.splice(index, 1);
            }
            currentRow.remove();
            closeDeleteModal();
            
            const totalPages = Math.ceil(allRows.length / rowsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                currentPage = totalPages;
            }
            showPage(currentPage);
        }, 300);
    }
}

// فعال کردن حالت ویرایش
function enableEdit(button) {
    const row = button.closest('.grid-row');
    currentEditRow = row;
    const cells = row.querySelectorAll('.grid-cell');
    
    // ⭐ ترتیب ستون‌ها در HTML (از راست به چپ):
    // cells[0] = عملیات ها
    // cells[1] = PDF
    // cells[2] = رشته
    // cells[3] = تعداد واحد
    // cells[4] = کد درس
    // cells[5] = نام درس
    // cells[6] = عکس جلد
    
    const photoCell = cells[6]; // ⭐ FIX: عکس در ستون 6
    const photoImg = photoCell.querySelector('.book-photo');
    const currentPhotoSrc = photoImg ? photoImg.src : '';
    
    const originalValues = {
        courseName: cells[5].textContent,
        courseCode: cells[4].textContent,
        units: cells[3].textContent,
        field: cells[2].textContent,
        photo: currentPhotoSrc
    };
    
    // تبدیل به input
    cells[5].innerHTML = `<input type="text" class="edit-input" value="${originalValues.courseName}">`;
    cells[4].innerHTML = `<input type="text" class="edit-input" value="${originalValues.courseCode}">`;
    cells[3].innerHTML = `<input type="number" class="edit-input" value="${originalValues.units}">`;
    
    // انتخاب رشته
    cells[2].innerHTML = `
        <select class="edit-input">
            <option value="ریاضی" ${originalValues.field === 'ریاضی' ? 'selected' : ''}>ریاضی</option>
            <option value="تجربی" ${originalValues.field === 'تجربی' ? 'selected' : ''}>تجربی</option>
            <option value="انسانی" ${originalValues.field === 'انسانی' ? 'selected' : ''}>انسانی</option>
        </select>
    `;
    
    // ⭐ FIX: اضافه کردن دکمه تغییر عکس در ستون صحیح
    const photoUploadId = 'photoUpload_' + Date.now();
    cells[6].innerHTML = `
        <div class="book-photo-container">
            ${originalValues.photo ? `<img class="book-photo" src="${originalValues.photo}" alt="Book Cover">` : '<div class="no-photo">بدون عکس</div>'}
        </div>
        <input type="file" id="${photoUploadId}" class="photo-input" accept="image/*" onchange="handlePhotoUpload(this, currentEditRow)">
        <label for="${photoUploadId}" class="photo-upload-btn"><i class="fas fa-camera"></i> تغییر</label>
    `;
    
    // ⭐ FIX: دکمه‌های ذخیره و لغو - بدون single quote در مقادیر
    const photoData = originalValues.photo.replace(/'/g, '&apos;'); // جلوگیری از خطای syntax
    
    cells[0].innerHTML = `
        <div class="edit-actions">
            <button class="edit-btn edit-btn-confirm" onclick="saveEdit(this)"><i class="fas fa-check"></i> ذخیره</button>
            <button class="edit-btn edit-btn-cancel" data-name="${originalValues.courseName}" data-code="${originalValues.courseCode}" data-units="${originalValues.units}" data-field="${originalValues.field}" data-photo="${photoData}" onclick="cancelEditNew(this)"><i class="fas fa-times"></i> لغو</button>
        </div>
    `;
}

function saveEdit(button) {
    const row = button.closest('.grid-row');
    const cells = row.querySelectorAll('.grid-cell');
    
    // دریافت مقادیر جدید
    const newCourseName = cells[5].querySelector('input').value.trim();
    const newCourseCode = cells[4].querySelector('input').value.trim();
    const newUnits = cells[3].querySelector('input').value.trim();
    const newField = cells[2].querySelector('select').value;
    
    // بررسی خالی نبودن فیلدها
    if (!newCourseName || !newCourseCode || !newUnits || !newField) {
        alert('لطفاً تمام فیلدها را پر کنید!');
        return;
    }
    
    // دریافت عکس
    const photoImg = cells[6].querySelector('.book-photo');
    const photoSrc = photoImg ? photoImg.src : '';
    
    // ⭐ FIX: ذخیره در ستون‌های صحیح
    cells[5].textContent = newCourseName;  // نام درس
    cells[4].textContent = newCourseCode;  // کد درس
    cells[3].textContent = newUnits;       // تعداد واحد
    cells[2].textContent = newField;       // رشته
    
    // ⭐ FIX: ذخیره عکس در ستون 6 (نه 5)
    if (photoSrc) {
        cells[6].innerHTML = `
            <div class="book-photo-container">
                <img class="book-photo" src="${photoSrc}" onclick="openImagePreview('${photoSrc}')" alt="Book Cover">
            </div>
        `;
    } else {
        cells[6].innerHTML = `
            <div class="book-photo-container">
                <div class="no-photo">بدون عکس</div>
            </div>
        `;
    }
    
    // بازگرداندن دکمه‌های عملیات
    cells[0].innerHTML = `
        <div class="action-buttons">
            <button class="action-btn btn-specs" onclick="showSpecs(this)">مشخصات</button>
            <button class="action-btn btn-edit" onclick="enableEdit(this)">ویرایش</button>
            <button class="action-btn btn-delete" onclick="openDeleteModal(this)">حذف</button>
        </div>
    `;
    
    currentEditRow = null;
    showSuccessModal('تغییرات با موفقیت ذخیره شد!');
}

function cancelEditNew(button) {
    const courseName = button.getAttribute('data-name');
    const courseCode = button.getAttribute('data-code');
    const units = button.getAttribute('data-units');
    const field = button.getAttribute('data-field');
    const photoSrc = button.getAttribute('data-photo').replace(/&apos;/g, "'");
    
    const row = button.closest('.grid-row');
    const cells = row.querySelectorAll('.grid-cell');
    
    // بازگرداندن مقادیر قبلی
    cells[5].textContent = courseName;
    cells[4].textContent = courseCode;
    cells[3].textContent = units;
    cells[2].textContent = field;
    
    // بازگرداندن عکس
    if (photoSrc) {
        cells[6].innerHTML = `
            <div class="book-photo-container">
                <img class="book-photo" src="${photoSrc}" onclick="openImagePreview('${photoSrc}')" alt="Book Cover">
            </div>
        `;
    } else {
        cells[6].innerHTML = `
            <div class="book-photo-container">
                <div class="no-photo">بدون عکس</div>
            </div>
        `;
    }
    
    // بازگرداندن دکمه‌ها
    cells[0].innerHTML = `
        <div class="action-buttons">
            <button class="action-btn btn-specs" onclick="showSpecs(this)">مشخصات</button>
            <button class="action-btn btn-edit" onclick="enableEdit(this)">ویرایش</button>
            <button class="action-btn btn-delete" onclick="openDeleteModal(this)">حذف</button>
        </div>
    `;
    
    currentEditRow = null;
}


function showSpecs(button) {
    const row = button.closest('.grid-row');
    const cells = row.querySelectorAll('.grid-cell');
    
    const photoCell = cells[6];
    const photoImg = photoCell.querySelector('.user-photo');
    const photoSrc = photoImg ? photoImg.src : '';
    
    const name = cells[5].textContent;
    const role = cells[4].textContent;
    const phone = cells[3].textContent;
    const nationalId = cells[2].textContent;
    const birthDate = cells[1].textContent;
    
    document.getElementById('specName').textContent = name;
    document.getElementById('specRole').textContent = role;
    document.getElementById('specPhone').textContent = phone;
    document.getElementById('specNationalId').textContent = nationalId;
    document.getElementById('specBirthDate').textContent = birthDate;
    
    const photoContainer = document.getElementById('specPhotoContainer');
    if (photoSrc) {
        photoContainer.innerHTML = `<img class="specs-photo" src="${photoSrc}" onclick="openImagePreview('${photoSrc}')" alt="User Photo">`;
    } else {
        photoContainer.innerHTML = '<div class="no-photo" style="width: 100px; height: 100px; font-size: 14px;">بدون عکس</div>';
    }
    
    document.getElementById('specsModal').classList.add('active');
}

function closeSpecsModal() {
    document.getElementById('specsModal').classList.remove('active');
}

// بستن مودال‌ها با کلیک روی پس‌زمینه
document.getElementById('deleteModal').addEventListener('click', function(e) {
    if (e.target === this) closeDeleteModal();
});

document.getElementById('specsModal').addEventListener('click', function(e) {
    if (e.target === this) closeSpecsModal();
});

document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) closeExportModal();
});

document.getElementById('addUserModal').addEventListener('click', function(e) {
    if (e.target === this) closeAddUserModal();
});

window.addEventListener('DOMContentLoaded', function() {
    initPagination();
});