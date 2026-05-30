// ==================== HAMBURGER MENU ====================
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

// ==================== DATA STRUCTURE ====================
const teacherData = {
    name: 'آقای احمدی',
    subjects: ['ریاضی', 'فیزیک'],
    maxHours: 30,
    minHours: 15,
    currentHours: 20,
    attendance: {
        present: 8,
        late: 2,
        absent: 0,
        leave: 1
    }
};

// زمان‌های ثابت برای زنگ‌ها
const timeSlots = [
    { start: '08:00', end: '09:30', label: '08:00 - 09:30' },
    { start: '10:00', end: '11:30', label: '10:00 - 11:30' },
    { start: '12:30', end: '14:00', label: '12:30 - 14:00' }
];

// روزهای هفته
const weekDays = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه'
};

// برنامه هفتگی معلم (Session ID ها باید یکتا باشند)
let sessions = [
    {
        id: 1,
        day: 'saturday',
        startTime: '08:00',
        endTime: '09:30',
        class: '303',
        subject: 'ریاضی',
        field: 'الکترونیک',
        grade: 'دوازدهم'
    },
    {
        id: 2,
        day: 'saturday',
        startTime: '12:30',
        endTime: '14:00',
        class: '308',
        subject: 'ریاضی',
        field: 'کامپیوتر',
        grade: 'دوازدهم'
    },
    {
        id: 3,
        day: 'sunday',
        startTime: '10:00',
        endTime: '11:30',
        class: '204',
        subject: 'فیزیک',
        field: 'کامپیوتر',
        grade: 'یازدهم'
    },
    {
        id: 4,
        day: 'monday',
        startTime: '10:00',
        endTime: '11:30',
        class: '204',
        subject: 'ورزشی',
        field: 'الکترونیک',
        grade: 'یازدهم'
    },
    {
        id: 5,
        day: 'tuesday',
        startTime: '12:30',
        endTime: '14:00',
        class: '101',
        subject: 'ریاضی',
        field: 'کامپیوتر',
        grade: 'دهم'
    }
];

// کلاس‌های تحت مسئولیت
const managedClasses = [
    {
        number: '303',
        grade: 'دوازدهم',
        field: 'الکترونیک',
        students: 28,
        time: '08:00 - 09:30',
        day: 'شنبه'
    },
    {
        number: '204',
        grade: 'یازدهم',
        field: 'کامپیوتر',
        students: 32,
        time: '10:00 - 11:30',
        day: 'یکشنبه'
    },
    {
        number: '101',
        grade: 'دهم',
        field: 'کامپیوتر',
        students: 26,
        time: '12:30 - 14:00',
        day: 'سه‌شنبه'
    }
];

// معلمان جایگزین
const substituteTeachers = [
    {
        name: 'حسین محمدی',
        subject: 'ریاضی',
        code: '650:35:00',
        avatar: 'https://ui-avatars.com/api/?name=حسین+محمدی&background=27ae60&color=fff&size=50&bold=true&font-size=0.4'
    },
    {
        name: 'علی اکبری',
        subject: 'ریاضی',
        code: '650:35:00',
        avatar: 'https://ui-avatars.com/api/?name=علی+اکبری&background=3498db&color=fff&size=50&bold=true&font-size=0.4'
    }
];

let currentEditingSessionId = null;
let sessionIdCounter = 6;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    renderScheduleTable();
    renderManagedClasses();
    renderSubstituteTeachers();
    updateStats();
    checkWorkloadWarning();
});

// ==================== SCHEDULE TABLE RENDERING ====================
function renderScheduleTable() {
    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';

    timeSlots.forEach(slot => {
        const row = document.createElement('tr');
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = slot.label;
        row.appendChild(timeCell);

        // Day columns
        Object.keys(weekDays).forEach(dayKey => {
            const dayCell = document.createElement('td');
            dayCell.className = 'session-cell';

            // Find sessions for this day and time
            const daySessions = sessions.filter(s => 
                s.day === dayKey && 
                s.startTime === slot.start && 
                s.endTime === slot.end
            );

            if (daySessions.length > 0) {
                daySessions.forEach(session => {
                    const sessionCard = createSessionCard(session);
                    dayCell.appendChild(sessionCard);
                });
            }

            row.appendChild(dayCell);
        });

        tbody.appendChild(row);
    });
}

function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    
    // Set color based on subject
    if (session.subject === 'فیزیک') {
        card.classList.add('physics');
    } else if (session.subject === 'ورزشی') {
        card.classList.add('sports');
    }

    card.innerHTML = `
        <div class="session-class">کلاس ${session.class}</div>
        <div class="session-subject">${session.subject}</div>
        <div class="session-time">${session.startTime} - ${session.endTime}</div>
        <div class="session-field">${session.field}</div>
    `;

    card.addEventListener('click', () => openEditSessionModal(session.id));

    return card;
}

// ==================== MANAGED CLASSES RENDERING ====================
function renderManagedClasses() {
    const grid = document.getElementById('managedClassesGrid');
    grid.innerHTML = '';

    managedClasses.forEach(classData => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <div class="class-header">
                <div class="class-number">کلاس ${classData.number}</div>
                <div class="class-field">${classData.field}</div>
            </div>
            <div class="class-info-row">
                <span class="class-info-label">مقطع:</span>
                <span class="class-info-value">${classData.grade}</span>
            </div>
            <div class="class-info-row">
                <span class="class-info-label">تعداد دانش‌آموز:</span>
                <span class="class-info-value">${classData.students} نفر</span>
            </div>
            <div class="class-info-row">
                <span class="class-info-label">زمان:</span>
                <span class="class-info-value">${classData.time}</span>
            </div>
            <div class="class-info-row">
                <span class="class-info-label">روز:</span>
                <span class="class-info-value">${classData.day}</span>
            </div>
            <div class="class-actions">
                <button class="btn-primary btn-small" onclick="viewClassDetails('${classData.number}')">
                    <i class="fas fa-eye"></i>
                    مشاهده
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==================== SUBSTITUTE TEACHERS RENDERING ====================
function renderSubstituteTeachers() {
    const list = document.getElementById('substituteTeachersList');
    list.innerHTML = '';

    substituteTeachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'substitute-teacher-card';
        card.innerHTML = `
            <div class="substitute-teacher-info">
                <div class="substitute-teacher-avatar">
                    <img src="${teacher.avatar}" alt="${teacher.name}">
                </div>
                <div class="substitute-teacher-details">
                    <h4>${teacher.name}</h4>
                    <p>${teacher.subject}: ${teacher.code}</p>
                </div>
            </div>
            <button class="btn-substitute">
                استخدام
            </button>
        `;
        list.appendChild(card);
    });
}

// ==================== UPDATE STATS ====================
function updateStats() {
    // Calculate total classes
    const totalClasses = sessions.length;
    document.getElementById('totalClasses').textContent = totalClasses;

    // Calculate hours (each session is 1.5 hours)
    const currentHours = sessions.length * 1.5;
    document.getElementById('currentHours').textContent = Math.round(currentHours);
    
    teacherData.currentHours = currentHours;
}

// ==================== CHECK WORKLOAD WARNING ====================
function checkWorkloadWarning() {
    const warningBanner = document.getElementById('warningBanner');
    const warningText = document.getElementById('warningText');

    if (teacherData.currentHours > teacherData.maxHours) {
        warningText.textContent = `⚠️ هشدار: بار تدریس شما (${teacherData.currentHours} ساعت) از حداکثر مجاز (${teacherData.maxHours} ساعت) بیشتر است!`;
        warningBanner.style.display = 'flex';
    } else if (teacherData.currentHours < teacherData.minHours) {
        warningText.textContent = `⚠️ توجه: بار تدریس شما (${teacherData.currentHours} ساعت) کمتر از حداقل استاندارد (${teacherData.minHours} ساعت) است!`;
        warningBanner.style.display = 'flex';
        warningBanner.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)';
    } else {
        warningBanner.style.display = 'none';
    }

    // Update progress bar
    const percentage = (teacherData.currentHours / teacherData.maxHours) * 100;
    document.querySelector('.progress-fill').style.width = `${percentage}%`;

    // Change color based on percentage
    if (percentage > 100) {
        document.querySelector('.progress-fill').style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
    } else if (percentage < 50) {
        document.querySelector('.progress-fill').style.background = 'linear-gradient(90deg, #f39c12 0%, #e67e22 100%)';
    } else {
        document.querySelector('.progress-fill').style.background = 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)';
    }
}

// ==================== TIME CONFLICT CHECK ====================
function checkTimeConflict(day, startTime, endTime, excludeSessionId = null) {
    const conflicts = sessions.filter(s => {
        if (excludeSessionId && s.id === excludeSessionId) return false;
        if (s.day !== day) return false;

        // Check time overlap
        const sessionStart = s.startTime;
        const sessionEnd = s.endTime;

        // Overlap conditions
        const overlap = (
            (startTime >= sessionStart && startTime < sessionEnd) ||
            (endTime > sessionStart && endTime <= sessionEnd) ||
            (startTime <= sessionStart && endTime >= sessionEnd)
        );

        return overlap;
    });

    return conflicts;
}

// ==================== ADD SESSION MODAL ====================
function openAddSessionModal() {
    document.getElementById('addSessionModal').classList.add('active');
    document.getElementById('addSessionForm').reset();
    document.getElementById('conflictWarning').style.display = 'none';
}

function closeAddSessionModal() {
    document.getElementById('addSessionModal').classList.remove('active');
}

function addSession(event) {
    event.preventDefault();

    const day = document.getElementById('sessionDay').value;
    const startTime = document.getElementById('sessionStartTime').value;
    const endTime = document.getElementById('sessionEndTime').value;
    const classNum = document.getElementById('sessionClass').value;
    const subject = document.getElementById('sessionSubject').value;
    const field = document.getElementById('sessionField').value;

    // Check for conflicts
    const conflicts = checkTimeConflict(day, startTime, endTime);
    if (conflicts.length > 0) {
        const conflictWarning = document.getElementById('conflictWarning');
        const conflictText = document.getElementById('conflictText');
        conflictText.textContent = `⛔ تداخل زمانی! در این زمان کلاس ${conflicts[0].class} (${conflicts[0].subject}) دارید.`;
        conflictWarning.style.display = 'flex';
        return;
    }

    // Check if time is within allowed slots
    const validSlot = timeSlots.find(slot => 
        slot.start === startTime && slot.end === endTime
    );

    if (!validSlot) {
        alert('زمان انتخابی معتبر نیست. لطفاً یکی از زمان‌های ثابت را انتخاب کنید:\n08:00-09:30\n10:00-11:30\n12:30-14:00');
        return;
    }

    // Add new session
    const newSession = {
        id: sessionIdCounter++,
        day: day,
        startTime: startTime,
        endTime: endTime,
        class: classNum,
        subject: subject,
        field: field,
        grade: getGradeFromClass(classNum)
    };

    sessions.push(newSession);
    
    renderScheduleTable();
    updateStats();
    checkWorkloadWarning();
    closeAddSessionModal();
    
    showSuccessMessage('زنگ جدید با موفقیت اضافه شد!');
}

// ==================== EDIT SESSION MODAL ====================
function openEditSessionModal(sessionId) {
    currentEditingSessionId = sessionId;
    const session = sessions.find(s => s.id === sessionId);

    if (!session) return;

    document.getElementById('editSessionId').value = session.id;
    document.getElementById('editSessionDay').value = session.day;
    document.getElementById('editSessionStartTime').value = session.startTime;
    document.getElementById('editSessionEndTime').value = session.endTime;
    document.getElementById('editSessionClass').value = session.class;
    document.getElementById('editSessionSubject').value = session.subject;
    document.getElementById('editSessionField').value = session.field;

    document.getElementById('editSessionModal').classList.add('active');
}

function closeEditSessionModal() {
    document.getElementById('editSessionModal').classList.remove('active');
    currentEditingSessionId = null;
}

function saveEditSession(event) {
    event.preventDefault();

    const sessionId = parseInt(document.getElementById('editSessionId').value);
    const day = document.getElementById('editSessionDay').value;
    const startTime = document.getElementById('editSessionStartTime').value;
    const endTime = document.getElementById('editSessionEndTime').value;

    // Check for conflicts (excluding current session)
    const conflicts = checkTimeConflict(day, startTime, endTime, sessionId);
    if (conflicts.length > 0) {
        alert(`⛔ تداخل زمانی! در این زمان کلاس ${conflicts[0].class} (${conflicts[0].subject}) دارید.`);
        return;
    }

    // Update session
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex !== -1) {
        sessions[sessionIndex].day = day;
        sessions[sessionIndex].startTime = startTime;
        sessions[sessionIndex].endTime = endTime;
    }

    renderScheduleTable();
    closeEditSessionModal();
    showSuccessMessage('تغییرات با موفقیت ذخیره شد!');
}

function deleteSession() {
    document.getElementById('editSessionModal').classList.remove('active');
    document.getElementById('deleteConfirmModal').classList.add('active');
}

function closeDeleteConfirmModal() {
    document.getElementById('deleteConfirmModal').classList.remove('active');
}

function confirmDelete() {
    if (currentEditingSessionId) {
        sessions = sessions.filter(s => s.id !== currentEditingSessionId);
        
        renderScheduleTable();
        updateStats();
        checkWorkloadWarning();
        closeDeleteConfirmModal();
        
        showSuccessMessage('زنگ با موفقیت حذف شد!');
        currentEditingSessionId = null;
    }
}

// ==================== HELPER FUNCTIONS ====================
function getGradeFromClass(classNum) {
    const firstDigit = classNum.charAt(0);
    if (firstDigit === '1') return 'دهم';
    if (firstDigit === '2') return 'یازدهم';
    if (firstDigit === '3') return 'دوازدهم';
    return '';
}

function showSuccessMessage(text) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(39, 174, 96, 0.4);
        font-family: Vazirmatn, sans-serif;
        font-weight: 600;
    `;
    successMsg.textContent = text;
    document.body.appendChild(successMsg);

    setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => successMsg.remove(), 300);
    }, 3000);
}

function toggleViewMode() {
    alert('حالت نمایش کارتی به زودی اضافه خواهد شد!');
}

function viewClassDetails(classNumber) {
    alert(`جزئیات کلاس ${classNumber} به زودی اضافه خواهد شد!`);
}

function refreshPage() {
    location.reload();
}

// ==================== CLOSE MODALS ON BACKGROUND CLICK ====================
document.getElementById('addSessionModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAddSessionModal();
});

document.getElementById('editSessionModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeEditSessionModal();
});

document.getElementById('deleteConfirmModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeDeleteConfirmModal();
});

// ==================== ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);