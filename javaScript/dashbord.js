document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('sidebarOverlay').classList.toggle('active');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
});

document.querySelectorAll('.menu-item.has-submenu').forEach(item => {
    item.querySelector('.menu-link')?.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.menu-item.has-submenu').forEach(o => {
            if (o !== item) o.classList.remove('open', 'active');
        });
        item.classList.toggle('open');
        item.classList.toggle('active');
    });
});
document.querySelectorAll('.submenu-item').forEach(si => {
    si.addEventListener('click', () => {
        document.querySelectorAll('.submenu-item').forEach(x => x.classList.remove('active'));
        si.classList.add('active');
    });
});

const FULL_DASHBOARD_ROLES = ['owner', 'manager', 'vice_principal', 'assistant'];

let gradesChart   = null;
let apiData       = null;
let chartJsLoaded = false;
let windowLoaded  = false;
let statsLoaded   = false;

function showWelcomeView(user) {
    document.querySelector('.cards-grid')?.remove();
    document.querySelector('.chart-section')?.remove();

    const roleLabel = {
        teacher: 'معلم',
        student: 'دانش‌آموز',
        parent:  'ولی دانش‌آموز',
    }[user.role] || user.role;

    const icons = {
        teacher: 'fa-chalkboard-teacher',
        student: 'fa-user-graduate',
        parent:  'fa-user-friends',
    }[user.role] || 'fa-user';

    const hints = {
        teacher: [
            { icon: 'fa-clipboard-check', text: 'حضور و غیاب کلاس‌هایتان را ثبت کنید' },
            { icon: 'fa-star',            text: 'نمرات دانش‌آموزان را وارد کنید' },
            { icon: 'fa-calendar-alt',    text: 'برنامه کلاسی خود را مشاهده کنید' },
        ],
        student: [
            { icon: 'fa-star',            text: 'نمرات خود را مشاهده کنید' },
            { icon: 'fa-clipboard-check', text: 'وضعیت حضور و غیاب خود را ببینید' },
            { icon: 'fa-calendar-alt',    text: 'برنامه هفتگی کلاس‌ها را مشاهده کنید' },
        ],
        parent: [
            { icon: 'fa-star',            text: 'نمرات فرزندتان را مشاهده کنید' },
            { icon: 'fa-clipboard-check', text: 'وضعیت حضور و غیاب فرزندتان را ببینید' },
            { icon: 'fa-bell',            text: 'اطلاعیه‌های مدرسه را دنبال کنید' },
        ],
    }[user.role] || [];

    const hintsHTML = hints.map(h => `
        <div class="welcome-hint">
            <i class="fas ${h.icon}"></i>
            <span>${h.text}</span>
        </div>
    `).join('');

    const welcomeHTML = `
        <div class="welcome-view">
            <div class="welcome-icon"><i class="fas ${icons}"></i></div>
            <h1 class="welcome-title">خوش آمدید، ${user.name}</h1>
            <p class="welcome-role">${roleLabel}</p>
            <div class="welcome-hints">${hintsHTML}</div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .welcome-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            text-align: center;
            gap: 16px;
            animation: fadeInUp 0.5s ease;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .welcome-icon {
            width: 100px;
            height: 100px;
            background: rgba(77,163,255,0.12);
            border: 2px solid rgba(77,163,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: #4da3ff;
            margin-bottom: 8px;
        }
        .welcome-title {
            font-size: 26px;
            font-weight: 700;
            color: #fff;
            font-family: Vazirmatn, Tahoma, sans-serif;
        }
        .welcome-role {
            font-size: 14px;
            color: rgba(255,255,255,0.45);
            background: rgba(255,255,255,0.07);
            padding: 4px 16px;
            border-radius: 20px;
        }
        .welcome-hints {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
            width: 100%;
            max-width: 400px;
        }
        .welcome-hint {
            display: flex;
            align-items: center;
            gap: 14px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 14px 18px;
            color: rgba(255,255,255,0.75);
            font-size: 14px;
            font-family: Vazirmatn, Tahoma, sans-serif;
        }
        .welcome-hint i {
            color: #4da3ff;
            font-size: 18px;
            width: 22px;
            text-align: center;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        const header = document.getElementById('userHeader');
        mainContent.innerHTML = '';
        if (header) mainContent.appendChild(header);
        mainContent.insertAdjacentHTML('beforeend', welcomeHTML);
    }
}

async function loadStats() {
    try {
        const res  = await fetch('../api/stats.php');
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'خطای سرور');
        apiData = data;

        statsLoaded = true;
        tryHideLoader();

        const user = data.currentUser;

        const header = document.getElementById('userHeader');
        if (header && user) {
            header.textContent = user.role_label + ' : ' + user.name;
        }

        if (!FULL_DASHBOARD_ROLES.includes(user?.role)) {
            showWelcomeView(user);
            return;
        }

        const s = data.stats;
        const values = [s.registrations, s.teachers, s.students, s.classes, s.attendance, s.messages];
        document.querySelectorAll('.card-number').forEach((el, i) => {
            el.textContent   = (values[i] !== undefined && values[i] !== null) ? values[i] : '۰';
            el.style.opacity = '1';
        });

        if (chartJsLoaded && gradesChart) applyChartData(data.chart);

    } catch (err) {
        console.error('خطا در بارگذاری آمار:', err);
        statsLoaded = true;
        tryHideLoader();
        document.querySelectorAll('.card-number').forEach(el => {
            el.textContent   = '—';
            el.style.opacity = '1';
        });
        const header = document.getElementById('userHeader');
        if (header) header.textContent = 'داشبورد';
    }
}

function initChart() {
    if (window.__chartJsFailed) {
        document.getElementById('chartWrapper').style.display  = 'none';
        document.getElementById('chartFallback').style.display = 'block';
        return;
    }

    const ctx = document.getElementById('gradesChart')?.getContext('2d');
    if (!ctx) return;

    gradesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'میانگین نمرات',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#4CAF50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8,
                tension: 0.4,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { color: 'white', font: { size: 14, family: 'Vazirmatn' }, padding: 15 },
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white', bodyColor: 'white',
                    borderColor: '#4CAF50', borderWidth: 1, padding: 12,
                    callbacks: {
                        title: c => 'کلاس ' + c[0].label,
                        label: c => 'میانگین: ' + c.parsed.y + ' از 20',
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true, max: 20,
                    ticks: { color: 'white', font: { family: 'Vazirmatn' }, stepSize: 2 },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                },
                x: {
                    ticks: { color: 'white', font: { family: 'Vazirmatn' } },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                },
            },
        },
    });

    chartJsLoaded = true;
    if (apiData) applyChartData(apiData.chart);
}

function applyChartData(chart) {
    if (!gradesChart) return;
    const labels = chart?.labels ?? [];
    const data   = chart?.data   ?? [];
    if (labels.length === 0) {
        document.getElementById('chartWrapper')?.insertAdjacentHTML('afterend',
            '<p style="color:#aaa;text-align:center;font-family:Vazirmatn,sans-serif;margin-top:10px">هنوز نمره‌ای در سیستم ثبت نشده</p>'
        );
        return;
    }
    gradesChart.data.labels           = labels;
    gradesChart.data.datasets[0].data = data;
    gradesChart.update();
}

function waitForChart(callback, maxAttempts = 100) {
    if (window.Chart) {
        callback();
    } else if (maxAttempts > 0) {
        setTimeout(() => waitForChart(callback, maxAttempts - 1), 50);
    } else {
        console.warn('Chart.js بارگذاری نشد');
        window.__chartJsFailed = true;
        if (document.getElementById('chartWrapper')) {
            document.getElementById('chartWrapper').style.display = 'none';
            document.getElementById('chartFallback').style.display = 'block';
        }
    }
}

function tryHideLoader() {
    if (!windowLoaded || !statsLoaded) return;
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 550);
    }
}

window.addEventListener('load', () => {
    windowLoaded = true;
    tryHideLoader();
});

waitForChart(initChart);
loadStats();