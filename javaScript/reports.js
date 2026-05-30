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

// Global data storage
let allData = {
    students: [
        { name: 'علی احمدی', grade: '12', class: '12-1', average: 19.85 },
        { name: 'محمد رضایی', grade: '11', class: '11-1', average: 19.72 },
        { name: 'حسین کریمی', grade: '12', class: '12-2', average: 19.65 },
        { name: 'رضا محمدی', grade: '10', class: '10-1', average: 19.50 },
        { name: 'امیر حسینی', grade: '11', class: '11-2', average: 19.45 },
        { name: 'مهدی جعفری', grade: '10', class: '10-2', average: 19.30 },
        { name: 'سعید نوری', grade: '12', class: '12-1', average: 19.15 },
        { name: 'حمید صادقی', grade: '11', class: '11-1', average: 19.00 }
    ],
    classes: [
        { name: 'دهم-1', grade: '10', students: 25, average: 18.50, status: 'active' },
        { name: 'دهم-2', grade: '10', students: 28, average: 18.25, status: 'active' },
        { name: 'یازدهم-1', grade: '11', students: 30, average: 17.90, status: 'active' },
        { name: 'یازدهم-2', grade: '11', students: 27, average: 18.10, status: 'active' },
        { name: 'دوازدهم-1', grade: '12', students: 26, average: 18.75, status: 'active' },
        { name: 'دوازدهم-2', grade: '12', students: 24, average: 18.60, status: 'active' }
    ],
    enrollment: [
        { month: 'شهریور', count: 45 },
        { month: 'مهر', count: 58 },
        { month: 'آبان', count: 72 },
        { month: 'آذر', count: 68 },
        { month: 'دی', count: 55 },
        { month: 'بهمن', count: 44 }
    ],
    attendance: [
        { day: 'شنبه', present: 320, absent: 22 },
        { day: 'یکشنبه', present: 315, absent: 27 },
        { day: 'دوشنبه', present: 325, absent: 17 },
        { day: 'سه‌شنبه', present: 318, absent: 24 },
        { day: 'چهارشنبه', present: 322, absent: 20 }
    ]
};

let charts = {};

// Initialize charts
function initCharts() {
    // Enrollment Chart (Line)
    const enrollmentCtx = document.getElementById('enrollmentChart').getContext('2d');
    charts.enrollment = new Chart(enrollmentCtx, {
        type: 'line',
        data: {
            labels: allData.enrollment.map(d => d.month),
            datasets: [{
                label: 'تعداد ثبت نام',
                data: allData.enrollment.map(d => d.count),
                borderColor: '#3498DB',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });

    // Distribution Chart (Bar)
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    const gradeDistribution = {
        '10': allData.classes.filter(c => c.grade === '10').reduce((sum, c) => sum + c.students, 0),
        '11': allData.classes.filter(c => c.grade === '11').reduce((sum, c) => sum + c.students, 0),
        '12': allData.classes.filter(c => c.grade === '12').reduce((sum, c) => sum + c.students, 0)
    };
    
    charts.distribution = new Chart(distributionCtx, {
        type: 'bar',
        data: {
            labels: ['دهم', 'یازدهم', 'دوازدهم'],
            datasets: [{
                label: 'تعداد دانش‌آموزان',
                data: [gradeDistribution['10'], gradeDistribution['11'], gradeDistribution['12']],
                backgroundColor: ['#3498DB', '#27AE60', '#E67E22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });

    // Attendance Chart (Bar)
    const attendanceCtx = document.getElementById('attendanceChart').getContext('2d');
    charts.attendance = new Chart(attendanceCtx, {
        type: 'bar',
        data: {
            labels: allData.attendance.map(d => d.day),
            datasets: [
                {
                    label: 'حاضر',
                    data: allData.attendance.map(d => d.present),
                    backgroundColor: '#27AE60'
                },
                {
                    label: 'غایب',
                    data: allData.attendance.map(d => d.absent),
                    backgroundColor: '#E74C3C'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: 'white' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });

    // Grades Chart (Doughnut)
    const gradesCtx = document.getElementById('gradesChart').getContext('2d');
    charts.grades = new Chart(gradesCtx, {
        type: 'doughnut',
        data: {
            labels: allData.classes.map(c => c.name),
            datasets: [{
                label: 'معدل کلاس',
                data: allData.classes.map(c => c.average),
                backgroundColor: [
                    '#3498DB',
                    '#27AE60',
                    '#E67E22',
                    '#9B59B6',
                    '#E74C3C',
                    '#F1C40F'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: 'white' }
                }
            }
        }
    });
}

// Filter Functions
function applyFilters() {
    const gradeFilter = document.getElementById('gradeFilter').value;
    const classFilter = document.getElementById('classFilter').value;

    let filteredStudents = [...allData.students];
    let filteredClasses = [...allData.classes];

    // Apply grade filter
    if (gradeFilter !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.grade === gradeFilter);
        filteredClasses = filteredClasses.filter(c => c.grade === gradeFilter);
    }

    // Apply class filter
    if (classFilter !== 'all') {
        filteredStudents = filteredStudents.filter(s => s.class === classFilter);
        filteredClasses = filteredClasses.filter(c => c.name === classFilter);
    }

    // Update tables
    updateStudentsTable(filteredStudents);
    updateClassesTable(filteredClasses);

    // Update statistics
    updateStatistics(filteredStudents, filteredClasses);

    showSuccessMessage('فیلترها با موفقیت اعمال شدند!');
}

function resetFilters() {
    document.getElementById('timeRange').value = 'term';
    document.getElementById('reportType').value = 'all';
    document.getElementById('gradeFilter').value = 'all';
    document.getElementById('classFilter').value = 'all';
    
    updateStudentsTable(allData.students);
    updateClassesTable(allData.classes);
    updateStatistics(allData.students, allData.classes);
    
    showSuccessMessage('فیلترها بازنشانی شدند!');
}

function updateStudentsTable(students) {
    const tbody = document.querySelector('#topStudentsTable tbody');
    tbody.innerHTML = '';
    
    students.slice(0, 5).forEach((student, index) => {
        const row = document.createElement('tr');
        let rankBadge = '';
        if (index === 0) rankBadge = '<div class="rank-badge rank-1">1</div>';
        else if (index === 1) rankBadge = '<div class="rank-badge rank-2">2</div>';
        else if (index === 2) rankBadge = '<div class="rank-badge rank-3">3</div>';
        else rankBadge = index + 1;

        row.innerHTML = `
            <td>${rankBadge}</td>
            <td>${student.name}</td>
            <td>${student.grade === '10' ? 'دهم' : student.grade === '11' ? 'یازدهم' : 'دوازدهم'}</td>
            <td>${student.average}</td>
        `;
        tbody.appendChild(row);
    });
}

function updateClassesTable(classes) {
    const tbody = document.querySelector('#classesTable tbody');
    tbody.innerHTML = '';
    
    classes.forEach(cls => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cls.name}</td>
            <td>${cls.students}</td>
            <td>${cls.average}</td>
            <td><span class="status-${cls.status}">${cls.status === 'active' ? 'فعال' : 'غیرفعال'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateStatistics(students, classes) {
    const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalClasses').textContent = classes.length;
}

// Export Functions
function exportChart(chartName) {
    showSuccessMessage('خروجی نمودار ' + chartName + ' در حال آماده‌سازی است...');
}

function exportReport(format) {
    if (format === 'excel') {
        exportToExcel();
    } else {
        document.getElementById('exportModal').classList.add('active');
        
        setTimeout(() => {
            closeExportModal();
            showSuccessMessage('گزارش PDF با موفقیت دانلود شد!');
        }, 2000);
    }
}

function exportToExcel() {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Students sheet
    const studentsData = allData.students.map((s, i) => ({
        'رتبه': i + 1,
        'نام و نام خانوادگی': s.name,
        'پایه': s.grade === '10' ? 'دهم' : s.grade === '11' ? 'یازدهم' : 'دوازدهم',
        'کلاس': s.class,
        'معدل': s.average
    }));
    const wsStudents = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'دانش‌آموزان');

    // Classes sheet
    const classesData = allData.classes.map(c => ({
        'کلاس': c.name,
        'پایه': c.grade === '10' ? 'دهم' : c.grade === '11' ? 'یازدهم' : 'دوازدهم',
        'تعداد دانش‌آموز': c.students,
        'معدل کلاس': c.average,
        'وضعیت': c.status === 'active' ? 'فعال' : 'غیرفعال'
    }));
    const wsClasses = XLSX.utils.json_to_sheet(classesData);
    XLSX.utils.book_append_sheet(wb, wsClasses, 'کلاس‌ها');

    // Enrollment sheet
    const enrollmentData = allData.enrollment.map(e => ({
        'ماه': e.month,
        'تعداد ثبت نام': e.count
    }));
    const wsEnrollment = XLSX.utils.json_to_sheet(enrollmentData);
    XLSX.utils.book_append_sheet(wb, wsEnrollment, 'ثبت‌نام');

    // Attendance sheet
    const attendanceData = allData.attendance.map(a => ({
        'روز': a.day,
        'حاضر': a.present,
        'غایب': a.absent
    }));
    const wsAttendance = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, wsAttendance, 'حضور و غیاب');

    // Save file
    XLSX.writeFile(wb, 'گزارش_مدرسه.xlsx');
    showSuccessMessage('گزارش Excel با موفقیت دانلود شد!');
}

function printReport() {
    window.print();
}

function shareReport() {
    const url = 'https://example.com/report/' + Math.random().toString(36).substr(2, 9);
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showSuccessMessage('لینک اشتراک‌گذاری کپی شد!\n\n' + url);
        });
    } else {
        alert('لینک اشتراک‌گذاری:\n\n' + url);
    }
}

function closeExportModal() {
    document.getElementById('exportModal').classList.remove('active');
}

// View More Functions
function viewMore(section) {
    showSuccessMessage('نمایش همه ' + section + ' در حال بارگذاری...');
}

// Success message
function showSuccessMessage(text) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #27AE60; color: white; padding: 15px 30px; border-radius: 10px; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 5px 20px rgba(0,0,0,0.3); font-family: Vazirmatn, sans-serif;';
    successMsg.textContent = text;
    document.body.appendChild(successMsg);
    setTimeout(() => successMsg.remove(), 3000);
}

// Close modal on background click
document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) closeExportModal();
});

// Initialize on page load
window.addEventListener('load', () => {
    initCharts();
});

// Simulate real-time data updates
setInterval(() => {
    const attendanceValue = document.getElementById('attendanceRate');
    const currentRate = parseInt(attendanceValue.textContent);
    const newRate = Math.max(85, Math.min(98, currentRate + Math.floor(Math.random() * 3) - 1));
    attendanceValue.textContent = newRate + '%';
}, 10000);