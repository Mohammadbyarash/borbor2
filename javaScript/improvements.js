// ==================== IMPROVEMENTS & FIXES ====================

// ✅ 1. LocalStorage Support
const Storage = {
  save() {
    try {
      localStorage.setItem('teachers_data', JSON.stringify(teachers));
      localStorage.setItem('last_update', new Date().toISOString());
    } catch (e) {
      console.error('خطا در ذخیره‌سازی:', e);
      showToast('خطا در ذخیره اطلاعات', 'error');
    }
  },
  
  load() {
    try {
      const saved = localStorage.getItem('teachers_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('خطا در بارگذاری:', e);
    }
    return null;
  },
  
  clear() {
    localStorage.removeItem('teachers_data');
    localStorage.removeItem('last_update');
  }
};

// ✅ 2. Loading Overlay
function showLoading(message = 'در حال بارگذاری...') {
  const existing = document.getElementById('loading-overlay');
  if (existing) return;
  
  const loader = document.createElement('div');
  loader.id = 'loading-overlay';
  loader.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  document.body.appendChild(loader);
  document.body.style.overflow = 'hidden';
}

function hideLoading() {
  const loader = document.getElementById('loading-overlay');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// ✅ 3. Enhanced Validation
const Validation = {
  isDuplicateNationalId(nationalId, excludeId = null) {
    return teachers.some(t => 
      t.nationalId === nationalId && 
      (excludeId === null || t.id !== excludeId)
    );
  },
  
  isDuplicatePhone(phone, excludeId = null) {
    return teachers.some(t => 
      t.phone === phone && 
      (excludeId === null || t.id !== excludeId)
    );
  },
  
  checkScheduleConflict(teacherId, day, period) {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return null;
    
    const conflict = teacher.schedule[day].find(session => session.period === period);
    return conflict || null;
  }
};

// ✅ 4. Real Excel Export (needs SheetJS library)
function exportTeachersExcel() {
  // بررسی وجود کتابخانه
  if (typeof XLSX === 'undefined') {
    showToast('کتابخانه Excel یافت نشد. لطفاً SheetJS را اضافه کنید.', 'warning');
    console.log('Add this to HTML: <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>');
    return;
  }
  
  showLoading('در حال آماده‌سازی فایل Excel...');
  
  setTimeout(() => {
    try {
      // آماده‌سازی داده‌ها
      const ws_data = [
        ['نام', 'شماره موبایل', 'کد ملی', 'تاریخ تولد', 'دروس', 'پایه‌ها', 'ساعات هفتگی', 'تعداد کلاس‌ها', 'وضعیت']
      ];
      
      filteredTeachers.forEach(teacher => {
        ws_data.push([
          teacher.name,
          teacher.phone,
          teacher.nationalId,
          teacher.birthDate,
          teacher.subjects.join('، '),
          teacher.grades.join('، '),
          teacher.weeklyHours,
          teacher.classCount,
          teacher.isDisabled ? 'غیرفعال' : 'فعال'
        ]);
      });
      
      // ساخت فایل
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "لیست معلمان");
      
      // استایل‌دهی (اختیاری)
      const wscols = [
        {wch: 20}, // نام
        {wch: 15}, // موبایل
        {wch: 12}, // کد ملی
        {wch: 12}, // تاریخ تولد
        {wch: 25}, // دروس
        {wch: 20}, // پایه‌ها
        {wch: 12}, // ساعات
        {wch: 12}, // کلاس‌ها
        {wch: 10}  // وضعیت
      ];
      ws['!cols'] = wscols;
      
      // دانلود
      const fileName = `teachers_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      hideLoading();
      showSuccessToast(`فایل ${fileName} با موفقیت دانلود شد`);
    } catch (error) {
      hideLoading();
      console.error('خطا در ساخت Excel:', error);
      showToast('خطا در ساخت فایل Excel', 'error');
    }
  }, 500);
}

// ✅ 5. Combined Filters
function applyAllFilters() {
  const searchTerm = document.getElementById('teacherSearch').value.toLowerCase().trim();
  const gradeFilter = document.getElementById('gradeFilter').value;
  const workloadFilter = document.getElementById('workloadFilter').value;
  
  filteredTeachers = teachers.filter(teacher => {
    // فیلتر جستجو
    const matchesSearch = !searchTerm || 
      teacher.name.toLowerCase().includes(searchTerm) ||
      teacher.subjects.some(s => s.toLowerCase().includes(searchTerm)) ||
      teacher.phone.includes(searchTerm) ||
      teacher.nationalId.includes(searchTerm);
    
    // فیلتر پایه
    const matchesGrade = !gradeFilter || teacher.grades.includes(gradeFilter);
    
    // فیلتر بار کاری
    const matchesWorkload = !workloadFilter || teacher.workload === workloadFilter;
    
    return matchesSearch && matchesGrade && matchesWorkload;
  });
  
  currentPage = 1;
  renderTeachersTable();
  updateFilterSummary();
}

function updateFilterSummary() {
  let summaryEl = document.getElementById('filterSummary');
  
  // ایجاد المنت اگر وجود نداشت
  if (!summaryEl) {
    summaryEl = document.createElement('div');
    summaryEl.id = 'filterSummary';
    summaryEl.className = 'filter-summary';
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
      filterSection.appendChild(summaryEl);
    }
  }
  
  if (filteredTeachers.length !== teachers.length) {
    summaryEl.innerHTML = `
      <i class="fas fa-filter"></i>
      نمایش <strong>${filteredTeachers.length}</strong> از <strong>${teachers.length}</strong> معلم
      <button class="clear-filters-btn" onclick="clearAllFilters()">
        <i class="fas fa-times"></i> پاک کردن فیلترها
      </button>
    `;
    summaryEl.style.display = 'flex';
  } else {
    summaryEl.style.display = 'none';
  }
}

function clearAllFilters() {
  document.getElementById('teacherSearch').value = '';
  document.getElementById('gradeFilter').value = '';
  document.getElementById('workloadFilter').value = '';
  filteredTeachers = [...teachers];
  currentPage = 1;
  renderTeachersTable();
  updateFilterSummary();
}

// ✅ 6. Debounced Search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedSearch = debounce(applyAllFilters, 300);

// ✅ 7. Keyboard Shortcuts
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: معلم جدید
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openAddTeacherModal();
    }
    
    // Ctrl/Cmd + F: فوکوس روی جستجو
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.getElementById('teacherSearch');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Esc: بستن modal‌ها
    if (e.key === 'Escape') {
      closeAllModals();
    }
    
    // Alt + E: Export Excel
    if (e.altKey && e.key === 'e') {
      e.preventDefault();
      exportTeachersExcel();
    }
  });
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal.active');
  modals.forEach(modal => modal.classList.remove('active'));
}

// ✅ 8. Auto-Save with debounce
const autoSave = debounce(() => {
  Storage.save();
  // نمایش نشانگر ذخیره
  showAutoSaveIndicator();
}, 2000);

function showAutoSaveIndicator() {
  let indicator = document.getElementById('auto-save-indicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'auto-save-indicator';
    indicator.className = 'auto-save-indicator';
    document.body.appendChild(indicator);
  }
  
  indicator.innerHTML = '<i class="fas fa-check-circle"></i> ذخیره شد';
  indicator.classList.add('show');
  
  setTimeout(() => {
    indicator.classList.remove('show');
  }, 2000);
}

// ✅ 9. Enhanced Conflict Detection
function showConflictWarning(conflict, day) {
  const warning = document.getElementById('conflictWarning');
  const dayNames = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه'
  };
  
  warning.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <strong>تداخل زمانی!</strong><br>
      این معلم در زنگ ${conflict.period} روز ${dayNames[day]} 
      کلاس <strong>${conflict.class}</strong> - ${conflict.subject} دارد
      <small>(${conflict.time})</small>
    </div>
  `;
  warning.style.display = 'flex';
}

// ✅ 10. Statistics Dashboard
function getTeacherStatistics() {
  const stats = {
    total: teachers.length,
    active: teachers.filter(t => !t.isDisabled).length,
    disabled: teachers.filter(t => t.isDisabled).length,
    onLeave: teachers.filter(t => t.status === 'leave').length,
    overloaded: teachers.filter(t => t.workload === 'high').length,
    underloaded: teachers.filter(t => t.workload === 'low').length,
    totalHours: teachers.reduce((sum, t) => sum + t.weeklyHours, 0),
    avgHours: teachers.length > 0 ? 
      (teachers.reduce((sum, t) => sum + t.weeklyHours, 0) / teachers.length).toFixed(1) : 0
  };
  
  return stats;
}

function renderStatistics() {
  const stats = getTeacherStatistics();
  let statsEl = document.getElementById('teacher-statistics');
  
  if (!statsEl) {
    statsEl = document.createElement('div');
    statsEl.id = 'teacher-statistics';
    statsEl.className = 'statistics-panel';
    const mainContent = document.querySelector('.main-content');
    const searchSection = document.querySelector('.search-section');
    if (mainContent && searchSection) {
      mainContent.insertBefore(statsEl, searchSection);
    }
  }
  
  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon"><i class="fas fa-users"></i></div>
      <div class="stat-info">
        <div class="stat-label">مجموع معلمان</div>
        <div class="stat-value">${stats.total}</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
      <div class="stat-info">
        <div class="stat-label">فعال</div>
        <div class="stat-value">${stats.active}</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon orange"><i class="fas fa-calendar-times"></i></div>
      <div class="stat-info">
        <div class="stat-label">مرخصی</div>
        <div class="stat-value">${stats.onLeave}</div>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon blue"><i class="fas fa-clock"></i></div>
      <div class="stat-info">
        <div class="stat-label">میانگین ساعات</div>
        <div class="stat-value">${stats.avgHours}</div>
      </div>
    </div>
  `;
}

// ✅ 11. Enhanced Initialization
function initApp() {
  console.log('🚀 Starting Teacher Management System...');
  
  // بارگذاری از LocalStorage
  const savedData = Storage.load();
  if (savedData && savedData.length > 0) {
    teachers.splice(0, teachers.length, ...savedData);
    filteredTeachers = [...teachers];
    console.log('✅ Loaded', teachers.length, 'teachers from storage');
  }
  
  // رندر اولیه
  renderTeachersTable();
  renderStatistics();
  
  // فعال‌سازی Keyboard Shortcuts
  initKeyboardShortcuts();
  
  // تنظیم Event Listeners
  setupEventListeners();
  
  console.log('✅ App initialized successfully');
}

function setupEventListeners() {
  // جستجو با debounce
  const searchInput = document.getElementById('teacherSearch');
  if (searchInput) {
    searchInput.removeEventListener('input', debouncedSearch);
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // فیلترها
  const gradeFilter = document.getElementById('gradeFilter');
  if (gradeFilter) {
    gradeFilter.removeEventListener('change', applyAllFilters);
    gradeFilter.addEventListener('change', applyAllFilters);
  }
  
  const workloadFilter = document.getElementById('workloadFilter');
  if (workloadFilter) {
    workloadFilter.removeEventListener('change', applyAllFilters);
    workloadFilter.addEventListener('change', applyAllFilters);
  }
}

// ✅ 12. Override Original Functions with Improvements
const originalSaveNewTeacher = saveNewTeacher;
saveNewTeacher = function() {
  // بررسی تکراری بودن کد ملی
  const nationalId = faToEnNumbers(document.getElementById('addTeacherNationalId').value.trim());
  if (Validation.isDuplicateNationalId(nationalId)) {
    showToast('این کد ملی قبلاً ثبت شده است!', 'error');
    document.getElementById('addTeacherNationalId').focus();
    return;
  }
  
  // بررسی تکراری بودن شماره موبایل
  const phone = faToEnNumbers(document.getElementById('addTeacherPhone').value.trim());
  if (Validation.isDuplicatePhone(phone)) {
    showToast('این شماره موبایل قبلاً ثبت شده است!', 'error');
    document.getElementById('addTeacherPhone').focus();
    return;
  }
  
  // اجرای فانکشن اصلی
  originalSaveNewTeacher();
  
  // ذخیره خودکار و به‌روزرسانی آمار
  autoSave();
  renderStatistics();
};

const originalAddSession = addSession;
addSession = function() {
  const day = document.getElementById('sessionDay').value;
  const period = parseInt(document.getElementById('sessionPeriod').value);
  
  // بررسی تداخل
  const conflict = Validation.checkScheduleConflict(currentTeacher.id, day, period);
  if (conflict) {
    showConflictWarning(conflict, day);
    return;
  }
  
  // اجرای فانکشن اصلی
  originalAddSession();
  
  // ذخیره خودکار
  autoSave();
};

// ✅ 13. Initialize on Load
window.addEventListener('DOMContentLoaded', initApp);

// ✅ 14. Periodic Auto-Save
setInterval(() => {
  if (teachers.length > 0) {
    Storage.save();
  }
}, 60000); // هر 1 دقیقه

// ✅ 15. Before Unload Warning
window.addEventListener('beforeunload', (e) => {
  Storage.save();
  // اگر تغییرات ذخیره نشده دارید، هشدار نمایش داده شود
  // e.preventDefault();
  // e.returnValue = '';
});

