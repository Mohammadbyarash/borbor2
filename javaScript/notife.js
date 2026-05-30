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

// Sample Data
let announcements = [
    {
        id: 1,
        title: 'تغییر ساعت شروع امتحانات نهایی',
        content: 'به اطلاع دانش‌آموزان گرامی می‌رساند که ساعت شروع امتحانات نهایی از ساعت 8 صبح به ساعت 9 صبح تغییر یافته است. لطفاً این موضوع را در برنامه‌ریزی خود مدنظر قرار دهید.',
        category: 'educational',
        priority: 'high',
        author: 'حسن رضایی',
        date: '1403/11/11',
        views: 245,
        pinned: true,
        status: 'active',
        targets: ['students', 'parents'],
        grades: ['10', '11', '12'],
        attachments: [
            { name: 'برنامه_امتحانات.pdf', size: '2.3 MB', type: 'pdf' }
        ]
    },
    {
        id: 2,
        title: 'جشن دهه فجر مدرسه',
        content: 'به مناسبت فرارسیدن دهه مبارک فجر، مراسم ویژه‌ای در مدرسه برگزار خواهد شد. از تمامی دانش‌آموزان و اولیاء دعوت می‌شود در این مراسم شرکت فرمایند.',
        category: 'event',
        priority: 'medium',
        author: 'علی احمدی',
        date: '1403/11/10',
        views: 189,
        pinned: true,
        status: 'active',
        targets: ['students', 'teachers', 'parents'],
        grades: ['10', '11', '12'],
        attachments: []
    },
    {
        id: 3,
        title: 'یادآوری پرداخت شهریه',
        content: 'به اطلاع اولیاء محترم می‌رساند که آخرین مهلت پرداخت شهریه ماه جاری، پایان همین هفته می‌باشد. لطفاً نسبت به پرداخت اقدام فرمایید.',
        category: 'financial',
        priority: 'high',
        author: 'محمد کریمی',
        date: '1403/11/09',
        views: 312,
        pinned: false,
        status: 'active',
        targets: ['parents'],
        grades: ['10', '11', '12'],
        attachments: []
    },
    {
        id: 4,
        title: 'برگزاری کلاس فوق‌برنامه ریاضی',
        content: 'کلاس فوق‌برنامه ریاضی برای دانش‌آموزان پایه دوازدهم هر شنبه و چهارشنبه از ساعت 14 الی 16 در کلاس 301 برگزار می‌گردد.',
        category: 'educational',
        priority: 'low',
        author: 'رضا حسینی',
        date: '1403/11/08',
        views: 156,
        pinned: false,
        status: 'active',
        targets: ['students'],
        grades: ['12'],
        attachments: [
            { name: 'برنامه_کلاس.pdf', size: '1.1 MB', type: 'pdf' }
        ]
    },
    {
        id: 5,
        title: 'تعطیلی مدرسه به دلیل بارش برف',
        content: 'با توجه به بارش شدید برف و سرما، مدرسه روز شنبه تعطیل خواهد بود. تکالیف درسی از طریق سامانه آموزشی ارسال خواهد شد.',
        category: 'urgent',
        priority: 'high',
        author: 'علی احمدی',
        date: '1403/11/07',
        views: 428,
        pinned: true,
        status: 'active',
        targets: ['students', 'teachers', 'parents'],
        grades: ['10', '11', '12'],
        attachments: []
    },
    {
        id: 6,
        title: 'مسابقه شعر و داستان‌نویسی',
        content: 'مسابقه شعر و داستان‌نویسی با موضوع آزادی برگزار می‌گردد. علاقه‌مندان می‌توانند تا پایان ماه آثار خود را به دبیرخانه تحویل دهند.',
        category: 'event',
        priority: 'medium',
        author: 'سارا نوری',
        date: '1403/11/06',
        views: 203,
        pinned: false,
        status: 'active',
        targets: ['students'],
        grades: ['10', '11', '12'],
        attachments: [
            { name: 'آیین‌نامه_مسابقه.pdf', size: '850 KB', type: 'pdf' }
        ]
    },
    {
        id: 7,
        title: 'جلسه شورای معلمان',
        content: 'جلسه شورای معلمان روز یکشنبه ساعت 13 در اتاق معلمین برگزار می‌شود. حضور تمامی اعضا الزامی است.',
        category: 'administrative',
        priority: 'medium',
        author: 'حسین محمدی',
        date: '1403/11/05',
        views: 87,
        pinned: false,
        status: 'active',
        targets: ['teachers'],
        grades: ['10', '11', '12'],
        attachments: []
    },
    {
        id: 8,
        title: 'اردوی علمی به تهران',
        content: 'اردوی علمی دو روزه به موزه‌ها و مراکز علمی تهران برای دانش‌آموزان پایه یازدهم برگزار می‌شود. ثبت‌نام از طریق دبیرخانه.',
        category: 'event',
        priority: 'low',
        author: 'امیر جعفری',
        date: '1403/11/04',
        views: 167,
        pinned: false,
        status: 'active',
        targets: ['students', 'parents'],
        grades: ['11'],
        attachments: [
            { name: 'برنامه_اردو.pdf', size: '1.5 MB', type: 'pdf' },
            { name: 'فرم_ثبت_نام.pdf', size: '650 KB', type: 'pdf' }
        ]
    }
];

let currentPage = 1;
const itemsPerPage = 6;
let filteredAnnouncements = [...announcements];
let currentEditId = null;
let uploadedFiles = [];
let confirmCallback = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderAnnouncements();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', applyFilters);

    // Filter selects
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('audienceFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('gradeFilter').addEventListener('change', applyFilters);
    document.getElementById('priorityFilter').addEventListener('change', applyFilters);

    // Filter tags
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });

    // File upload
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    // Close modals on background click
    document.getElementById('viewModal').addEventListener('click', function(e) {
        if (e.target === this) closeViewModal();
    });

    document.getElementById('formModal').addEventListener('click', function(e) {
        if (e.target === this) closeFormModal();
    });

    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) closeConfirmModal();
    });

    // Confirm modal buttons
    document.getElementById('confirmYes').addEventListener('click', function() {
        if (confirmCallback) confirmCallback(true);
        closeConfirmModal();
    });

    document.getElementById('confirmNo').addEventListener('click', function() {
        if (confirmCallback) confirmCallback(false);
        closeConfirmModal();
    });
}

// Show Confirmation Modal
function showConfirm(title, message, iconType = 'warning') {
    return new Promise((resolve) => {
        confirmCallback = resolve;
        
        const iconMap = {
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            danger: '<i class="fas fa-exclamation-circle"></i>',
            success: '<i class="fas fa-check-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        document.getElementById('confirmIcon').innerHTML = iconMap[iconType] || iconMap.warning;
        document.getElementById('confirmIcon').className = `confirm-icon ${iconType}`;
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').classList.add('active');
    });
}

// Close Confirmation Modal
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    confirmCallback = null;
}

// Apply Filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const audience = document.getElementById('audienceFilter').value;
    const status = document.getElementById('statusFilter').value;
    const grade = document.getElementById('gradeFilter').value;
    const priority = document.getElementById('priorityFilter').value;

    const activeTag = document.querySelector('.filter-tag.active').dataset.filter;

    filteredAnnouncements = announcements.filter(announcement => {
        // Search filter
        if (searchTerm && !announcement.title.toLowerCase().includes(searchTerm) && 
            !announcement.content.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Category filter
        if (category !== 'all' && announcement.category !== category) {
            return false;
        }

        // Audience filter
        if (audience !== 'all' && !announcement.targets.includes(audience)) {
            return false;
        }

        // Status filter
        if (status !== 'all' && announcement.status !== status) {
            return false;
        }

        // Grade filter
        if (grade !== 'all' && !announcement.grades.includes(grade)) {
            return false;
        }

        // Priority filter
        if (priority !== 'all' && announcement.priority !== priority) {
            return false;
        }

        // Tag filter
        if (activeTag === 'pinned' && !announcement.pinned) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    renderAnnouncements();
}

// Render Announcements
function renderAnnouncements() {
    const pinnedAnnouncements = filteredAnnouncements.filter(a => a.pinned);
    const regularAnnouncements = filteredAnnouncements.filter(a => !a.pinned);

    // Render pinned
    const pinnedGrid = document.getElementById('pinnedGrid');
    if (pinnedAnnouncements.length > 0) {
        document.getElementById('pinnedSection').style.display = 'block';
        pinnedGrid.innerHTML = pinnedAnnouncements.map(a => createAnnouncementCard(a, true)).join('');
    } else {
        document.getElementById('pinnedSection').style.display = 'none';
    }

    // Render regular with pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAnnouncements = regularAnnouncements.slice(startIndex, endIndex);

    const announcementsGrid = document.getElementById('announcementsGrid');
    if (paginatedAnnouncements.length > 0) {
        announcementsGrid.innerHTML = paginatedAnnouncements.map(a => createAnnouncementCard(a, false)).join('');
    } else {
        announcementsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-inbox"></i></div>
                <div class="empty-title">اطلاعیه‌ای یافت نشد</div>
                <div class="empty-description">
                    ${filteredAnnouncements.length === 0 ? 'هیچ اطلاعیه‌ای با این فیلترها یافت نشد' : 'اطلاعیه‌ای برای نمایش وجود ندارد'}
                </div>
            </div>
        `;
    }

    // Render pagination
    renderPagination(regularAnnouncements.length);
}

// Create Announcement Card
function createAnnouncementCard(announcement, isPinned) {
    const categoryColors = {
        general: '#3498DB',
        educational: '#9B59B6',
        financial: '#27AE60',
        event: '#E67E22',
        urgent: '#E74C3C',
        administrative: '#34495E'
    };

    const categoryNames = {
        general: 'عمومی',
        educational: 'آموزشی',
        financial: 'مالی',
        event: 'رویداد',
        urgent: 'فوری',
        administrative: 'اداری'
    };

    const targetIcons = {
        students: 'fa-users',
        teachers: 'fa-chalkboard-teacher',
        parents: 'fa-user-friends',
        staff: 'fa-user-tie'
    };

    const targetNames = {
        students: 'دانش‌آموزان',
        teachers: 'معلمان',
        parents: 'اولیاء',
        staff: 'کارکنان'
    };

    const priorityClasses = {
        high: 'priority-high',
        medium: 'priority-medium',
        low: 'priority-low'
    };

    const priorityNames = {
        high: 'فوری',
        medium: 'متوسط',
        low: 'عادی'
    };

    return `
        <div class="announcement-card ${isPinned ? 'pinned' : ''}" style="--category-color: ${categoryColors[announcement.category]}" onclick="viewAnnouncement(${announcement.id})">
            ${announcement.priority === 'high' ? `<div class="priority-badge priority-high">${priorityNames[announcement.priority]}</div>` : ''}
            
            <div class="card-header">
                <div class="card-title-section">
                    <div class="card-title">${announcement.title}</div>
                    <div class="card-meta">
                        <span class="category-badge category-${announcement.category}">
                            ${categoryNames[announcement.category]}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-user"></i>
                            ${announcement.author}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${announcement.date}
                        </span>
                    </div>
                </div>
                ${isPinned ? `<i class="fas fa-thumbtack pin-icon"></i>` : ''}
            </div>

            <div class="target-tags">
                ${announcement.targets.map(target => `
                    <span class="target-tag">
                        <i class="fas ${targetIcons[target]}"></i>
                        ${targetNames[target]}
                    </span>
                `).join('')}
            </div>

            <div class="card-content">${announcement.content}</div>

            ${announcement.attachments.length > 0 ? `
                <div class="attachment-preview">
                    ${announcement.attachments.slice(0, 2).map(file => `
                        <div class="attachment-item">
                            <i class="fas fa-paperclip"></i>
                            ${file.name}
                        </div>
                    `).join('')}
                    ${announcement.attachments.length > 2 ? `
                        <div class="attachment-item">
                            +${announcement.attachments.length - 2} فایل دیگر
                        </div>
                    ` : ''}
                </div>
            ` : ''}

            <div class="card-footer">
                <div class="card-stats">
                    <span class="stat-item">
                        <i class="fas fa-eye"></i>
                        ${announcement.views} بازدید
                    </span>
                    <span class="status-badge status-${announcement.status}">
                        ${announcement.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </span>
                </div>
                <div class="card-actions" onclick="event.stopPropagation()">
                    <button class="action-btn view" onclick="viewAnnouncement(${announcement.id})" title="مشاهده">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editAnnouncement(${announcement.id})" title="ویرایش">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteAnnouncement(${announcement.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Render Pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="color: white;">...</span>`;
        }
    }

    html += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    pagination.innerHTML = html;
}

// Change Page
function changePage(page) {
    currentPage = page;
    renderAnnouncements();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// View Announcement
function viewAnnouncement(id) {
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;

    // Increase view count
    announcement.views++;

    const targetNames = {
        students: 'دانش‌آموزان',
        teachers: 'معلمان',
        parents: 'اولیاء',
        staff: 'کارکنان'
    };

    const categoryNames = {
        general: 'عمومی',
        educational: 'آموزشی',
        financial: 'مالی',
        event: 'رویداد',
        urgent: 'فوری',
        administrative: 'اداری'
    };

    const priorityNames = {
        high: 'فوری',
        medium: 'متوسط',
        low: 'عادی'
    };

    const detailHtml = `
        <div class="detail-header">
            <h2 class="detail-title">${announcement.title}</h2>
            <div class="detail-meta">
                <div class="meta-item">
                    <i class="fas fa-tag"></i>
                    <strong>دسته‌بندی:</strong>
                    <span class="category-badge category-${announcement.category}">
                        ${categoryNames[announcement.category]}
                    </span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-exclamation-circle"></i>
                    <strong>اولویت:</strong>
                    ${priorityNames[announcement.priority]}
                </div>
                <div class="meta-item">
                    <i class="fas fa-user"></i>
                    <strong>نویسنده:</strong>
                    ${announcement.author}
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <strong>تاریخ:</strong>
                    ${announcement.date}
                </div>
            </div>
        </div>

        <div class="detail-stats">
            <div class="stats-box">
                <div class="stats-value">${announcement.views}</div>
                <div class="stats-label">بازدید</div>
            </div>
            <div class="stats-box">
                <div class="stats-value">${announcement.targets.length}</div>
                <div class="stats-label">گروه مخاطب</div>
            </div>
            <div class="stats-box">
                <div class="stats-value">${announcement.attachments.length}</div>
                <div class="stats-label">فایل پیوست</div>
            </div>
            <div class="stats-box">
                <div class="stats-value">${announcement.pinned ? 'بله' : 'خیر'}</div>
                <div class="stats-label">پین شده</div>
            </div>
        </div>

        <div class="detail-content">
            ${announcement.content}
        </div>

        <div class="form-group">
            <label class="form-label">مخاطبان:</label>
            <div class="target-tags">
                ${announcement.targets.map(target => `
                    <span class="target-tag">
                        ${targetNames[target]}
                    </span>
                `).join('')}
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">پایه‌های تحصیلی:</label>
            <div class="target-tags">
                ${announcement.grades.map(grade => `
                    <span class="target-tag">
                        پایه ${grade === '10' ? 'دهم' : grade === '11' ? 'یازدهم' : 'دوازدهم'}
                    </span>
                `).join('')}
            </div>
        </div>

        ${announcement.attachments.length > 0 ? `
            <div class="detail-attachments">
                <h4 class="attachments-title">
                    <i class="fas fa-paperclip"></i>
                    فایل‌های پیوست (${announcement.attachments.length})
                </h4>
                <div class="attachment-list">
                    ${announcement.attachments.map(file => `
                        <div class="attachment-card" onclick="downloadFile('${file.name}')">
                            <i class="fas fa-file-${file.type} attachment-icon"></i>
                            <div class="attachment-info">
                                <div class="attachment-name">${file.name}</div>
                                <div class="attachment-size">${file.size}</div>
                            </div>
                            <i class="fas fa-download"></i>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    document.getElementById('announcementDetail').innerHTML = detailHtml;
    document.getElementById('viewModal').classList.add('active');
    renderAnnouncements();
}

// Close View Modal
function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// Open Create Modal
function openCreateModal() {
    currentEditId = null;
    uploadedFiles = [];
    document.getElementById('formModalTitle').innerHTML = '<i class="fas fa-plus"></i> افزودن اطلاعیه جدید';
    document.getElementById('announcementForm').reset();
    document.getElementById('uploadedFiles').innerHTML = '';
    document.getElementById('formModal').classList.add('active');
}

// Edit Announcement
function editAnnouncement(id) {
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return;

    currentEditId = id;
    uploadedFiles = [...announcement.attachments];

    document.getElementById('formModalTitle').innerHTML = '<i class="fas fa-edit"></i> ویرایش اطلاعیه';
    document.getElementById('titleInput').value = announcement.title;
    document.getElementById('categoryInput').value = announcement.category;
    document.getElementById('priorityInput').value = announcement.priority;
    document.getElementById('contentInput').value = announcement.content;
    document.getElementById('pinCheckbox').checked = announcement.pinned;

    // Set targets
    announcement.targets.forEach(target => {
        const checkbox = document.getElementById(`target${target.charAt(0).toUpperCase() + target.slice(1)}`);
        if (checkbox) checkbox.checked = true;
    });

    // Set grades
    announcement.grades.forEach(grade => {
        const checkbox = document.getElementById(`grade${grade}`);
        if (checkbox) checkbox.checked = true;
    });

    // Display uploaded files
    displayUploadedFiles();

    document.getElementById('formModal').classList.add('active');
}

// Delete Announcement
async function deleteAnnouncement(id) {
    const confirmed = await showConfirm(
        'حذف اطلاعیه',
        'آیا از حذف این اطلاعیه اطمینان دارید؟ این عمل قابل بازگشت نیست.',
        'danger'
    );

    if (confirmed) {
        announcements = announcements.filter(a => a.id !== id);
        showToast('اطلاعیه با موفقیت حذف شد', 'error');
        applyFilters();
    }
}

// Close Form Modal
function closeFormModal() {
    document.getElementById('formModal').classList.remove('active');
    currentEditId = null;
    uploadedFiles = [];
}

// Handle File Upload
function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const fileObj = {
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileType(file.name)
        };
        uploadedFiles.push(fileObj);
    });
    displayUploadedFiles();
}

// Display Uploaded Files
function displayUploadedFiles() {
    const container = document.getElementById('uploadedFiles');
    if (uploadedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = uploadedFiles.map((file, index) => `
        <div class="uploaded-file">
            <div class="file-info">
                <i class="fas fa-file-${file.type}"></i>
                <span>${file.name} (${file.size})</span>
            </div>
            <button class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove File
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayUploadedFiles();
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Get File Type
function getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    return 'alt';
}

// Save Announcement
function saveAnnouncement() {
    const title = document.getElementById('titleInput').value.trim();
    const category = document.getElementById('categoryInput').value;
    const priority = document.getElementById('priorityInput').value;
    const content = document.getElementById('contentInput').value.trim();
    const pinned = document.getElementById('pinCheckbox').checked;

    if (!title || !category || !content) {
        showToast('لطفاً تمام فیلدهای الزامی را پر کنید', 'error');
        return;
    }

    // Get selected targets
    const targets = [];
    ['students', 'teachers', 'parents', 'staff'].forEach(target => {
        const checkbox = document.getElementById(`target${target.charAt(0).toUpperCase() + target.slice(1)}`);
        if (checkbox && checkbox.checked) targets.push(target);
    });

    // Get selected grades
    const grades = [];
    ['10', '11', '12'].forEach(grade => {
        const checkbox = document.getElementById(`grade${grade}`);
        if (checkbox && checkbox.checked) grades.push(grade);
    });

    const announcementData = {
        title,
        category,
        priority,
        content,
        pinned,
        targets,
        grades,
        attachments: uploadedFiles,
        author: 'علی احمدی',
        date: new Date().toLocaleDateString('fa-IR'),
        views: 0,
        status: 'active'
    };

    if (currentEditId) {
        // Edit existing
        const index = announcements.findIndex(a => a.id === currentEditId);
        if (index !== -1) {
            announcements[index] = { ...announcements[index], ...announcementData };
            showToast('اطلاعیه با موفقیت ویرایش شد', 'success');
        }
    } else {
        // Create new
        const newId = Math.max(...announcements.map(a => a.id), 0) + 1;
        announcements.unshift({ id: newId, ...announcementData });
        showToast('اطلاعیه با موفقیت ایجاد شد', 'success');
    }

    closeFormModal();
    applyFilters();
}

// Export to Excel
function exportToExcel() {
    showToast('در حال آماده‌سازی فایل Excel...', 'info');

    // Prepare data for export
    const categoryNames = {
        general: 'عمومی',
        educational: 'آموزشی',
        financial: 'مالی',
        event: 'رویداد',
        urgent: 'فوری',
        administrative: 'اداری'
    };

    const priorityNames = {
        high: 'فوری',
        medium: 'متوسط',
        low: 'عادی'
    };

    const targetNames = {
        students: 'دانش‌آموزان',
        teachers: 'معلمان',
        parents: 'اولیاء',
        staff: 'کارکنان'
    };

    const statusNames = {
        active: 'فعال',
        inactive: 'غیرفعال',
        expired: 'منقضی شده'
    };

    // Main announcements data
    const mainData = filteredAnnouncements.map((a, index) => ({
        'ردیف': index + 1,
        'عنوان': a.title,
        'دسته‌بندی': categoryNames[a.category],
        'اولویت': priorityNames[a.priority],
        'نویسنده': a.author,
        'تاریخ': a.date,
        'بازدید': a.views,
        'مخاطبان': a.targets.map(t => targetNames[t]).join(', '),
        'پایه‌های تحصیلی': a.grades.map(g => g === '10' ? 'دهم' : g === '11' ? 'یازدهم' : 'دوازدهم').join(', '),
        'وضعیت': statusNames[a.status],
        'پین شده': a.pinned ? 'بله' : 'خیر',
        'تعداد فایل‌های پیوست': a.attachments.length,
        'محتوا': a.content
    }));

    // Statistics data
    const statsData = [
        { 'عنوان آمار': 'کل اطلاعیه‌ها', 'مقدار': announcements.length },
        { 'عنوان آمار': 'اطلاعیه‌های فعال', 'مقدار': announcements.filter(a => a.status === 'active').length },
        { 'عنوان آمار': 'اطلاعیه‌های پین شده', 'مقدار': announcements.filter(a => a.pinned).length },
        { 'عنوان آمار': 'اطلاعیه‌های فوری', 'مقدار': announcements.filter(a => a.priority === 'high').length },
        { 'عنوان آمار': 'میانگین بازدید', 'مقدار': Math.round(announcements.reduce((sum, a) => sum + a.views, 0) / announcements.length) }
    ];

    // Category breakdown
    const categoryData = Object.keys(categoryNames).map(cat => ({
        'دسته‌بندی': categoryNames[cat],
        'تعداد': announcements.filter(a => a.category === cat).length
    }));

    // Priority breakdown
    const priorityData = Object.keys(priorityNames).map(pri => ({
        'اولویت': priorityNames[pri],
        'تعداد': announcements.filter(a => a.priority === pri).length
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add main sheet
    const wsMain = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, wsMain, 'اطلاعیه‌ها');

    // Add statistics sheet
    const wsStats = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, wsStats, 'آمار');

    // Add category breakdown sheet
    const wsCat = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, wsCat, 'دسته‌بندی');

    // Add priority breakdown sheet
    const wsPri = XLSX.utils.json_to_sheet(priorityData);
    XLSX.utils.book_append_sheet(wb, wsPri, 'اولویت');

    // Generate and download file
    const date = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
    XLSX.writeFile(wb, `اطلاعیه‌ها_${date}.xlsx`);

    setTimeout(() => {
        showToast('فایل Excel با موفقیت دانلود شد', 'success');
    }, 500);
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show Notifications
function showNotifications() {
    showToast('5 اعلان جدید دارید', 'info');
}

// Download File
function downloadFile(filename) {
    showToast(`در حال دانلود ${filename}...`, 'info');
}