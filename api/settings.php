/**
 * theme-loader.js
 * فایل مشترک برای اعمال تنظیمات تم در تمام صفحات
 * کافیه این فایل رو به همه صفحات HTML اضافه کنی
 */

(function () {
  'use strict';

  // ─── آدرس API ───
  const API_URL = '../api/settings.php';

  // ─── تنظیمات پیش‌فرض (fallback) ───
  const DEFAULT_SETTINGS = {
    bgColor:           '#202b59',
    sidebarColor:      '#172047',
    textColor:         '#ffffff',
    inputColor:        '#1e2957',
    activeMenuColor:   '#202b59',
    hoverColor:        '#2a3f6b',
    buttonColor:       '#139781',
    dangerButtonColor: '#e74c3c',
    scrollbarColor:    '#3498db',
    font:              'Vazirmatn',
    enableShadow:      true,
    shadowColor:       '#000000',
    shadowOpacity:     30,
    logoDisplayMode:   'text',
    logoDirection:     'rtl',
    logoTextColor:     '#ffffff',
    pageDirection:     'rtl',
    schoolName:        'بوربور',
  };

  // ─── ابزارها ───
  const hexToRgb = (h) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return r
      ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
      : { r: 32, g: 43, b: 89 };
  };

  const applyStyleTag = (id, css) => {
    let el = document.getElementById(id);
    if (el) el.remove();
    if (!css) return;
    el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    document.head.appendChild(el);
  };

  // ─── اعمال تنظیمات به صفحه ───
  const applySettings = (settings) => {
    const s = { ...DEFAULT_SETTINGS, ...settings };

    // فونت
    document.body.style.fontFamily = `"${s.font}", "Vazirmatn", sans-serif`;

    // جهت صفحه
    document.body.setAttribute('dir', s.pageDirection);
    document.documentElement.setAttribute('dir', s.pageDirection);

    // رنگ پس‌زمینه
    document.body.style.background = s.bgColor;

    // بخش‌های کارت/سکشن
    document.querySelectorAll(
      '.settings-section, .card, .dashboard-card, .stat-card, .section-box'
    ).forEach((el) => {
      const rgb = hexToRgb(s.bgColor);
      el.style.background = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
    });

    // Sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.background = s.sidebarColor;

    // جهت sidebar
    applySidebarDirection(s.pageDirection);

    // رنگ متن
    document.querySelectorAll(
      '.page-title, .section-title, .form-label, .menu-item a, .card-title, .stat-title'
    ).forEach((el) => (el.style.color = s.textColor));

    // رنگ input ها
    applyStyleTag(
      'tl-input-style',
      `.form-input, .form-select, .search-input, input[type="text"], input[type="tel"], input[type="email"], select, textarea {
         background: ${s.inputColor} !important;
         color: #fff !important;
      }`
    );

    // آیتم منوی فعال
    applyStyleTag(
      'tl-active-menu-style',
      `.menu-item.active a, .menu-item.active > a { background: ${s.activeMenuColor} !important; }`
    );

    // hover منو
    applyStyleTag(
      'tl-hover-style',
      `.menu-item a:hover { background: ${s.hoverColor} !important; }`
    );

    // دکمه‌های اصلی
    if (s.buttonColor) {
      const rgb = hexToRgb(s.buttonColor);
      const darker = `rgb(${Math.max(0, rgb.r - 30)},${Math.max(0, rgb.g - 30)},${Math.max(0, rgb.b - 30)})`;
      applyStyleTag(
        'tl-button-style',
        `.btn-save, .btn-primary, .btn-add, .btn-submit, .modal-btn-confirm {
           background: linear-gradient(90deg, ${s.buttonColor}, ${darker}) !important;
           color: #fff !important;
         }
         .btn-save:hover, .btn-primary:hover, .btn-add:hover, .btn-submit:hover, .modal-btn-confirm:hover {
           background: linear-gradient(90deg, ${darker}, ${s.buttonColor}) !important;
         }`
      );
    }

    // دکمه‌های خطر
    if (s.dangerButtonColor) {
      const rgb = hexToRgb(s.dangerButtonColor);
      const darker = `rgb(${Math.max(0, rgb.r - 30)},${Math.max(0, rgb.g - 30)},${Math.max(0, rgb.b - 30)})`;
      applyStyleTag(
        'tl-danger-button-style',
        `.btn-delete, .btn-danger, .btn-reset {
           background: linear-gradient(90deg, ${s.dangerButtonColor}, ${darker}) !important;
           color: #fff !important;
         }
         .btn-delete:hover, .btn-danger:hover, .btn-reset:hover {
           background: linear-gradient(90deg, ${darker}, ${s.dangerButtonColor}) !important;
         }`
      );
    }

    // اسکرول‌بار
    applyStyleTag(
      'tl-scrollbar-style',
      `* { scrollbar-color: ${s.scrollbarColor} ${s.sidebarColor} !important; }
       ::-webkit-scrollbar-thumb { background: ${s.scrollbarColor} !important; }
       ::-webkit-scrollbar-track { background: ${s.sidebarColor} !important; }`
    );

    // سایه
    if (s.enableShadow && s.shadowColor) {
      const rgb = hexToRgb(s.shadowColor);
      const opacity = (parseInt(s.shadowOpacity) || 30) / 100;
      applyStyleTag(
        'tl-shadow-style',
        `.btn-save:hover, .btn-primary:hover, .btn-add:hover, .btn-delete:hover, .btn-danger:hover {
           box-shadow: 0 5px 15px rgba(${rgb.r},${rgb.g},${rgb.b},${opacity}) !important;
         }`
      );
    } else {
      applyStyleTag('tl-shadow-style', '');
    }

    // لوگو sidebar
    applyLogoToSidebar(s);
  };

  // ─── اعمال لوگو به sidebar اصلی ───
  const applyLogoToSidebar = (s) => {
    const mainLogo = document.querySelector('.sidebar .logo, .sidebar #mainLogo');
    if (!mainLogo) return;

    // آدرس تصویر و تنظیمات لوگو از localStorage
    const logoImage = localStorage.getItem('logoImage');
    const favicon   = localStorage.getItem('favicon');
    const mode      = s.logoDisplayMode || 'text';
    const direction = s.logoDirection   || 'rtl';
    const color     = s.logoTextColor   || '#ffffff';
    const name      = s.schoolName      || 'بوربور';

    mainLogo.style.flexDirection = direction === 'ltr' ? 'row-reverse' : 'row';
    mainLogo.style.display       = 'flex';
    mainLogo.style.alignItems    = 'center';
    mainLogo.style.justifyContent= 'center';
    mainLogo.style.gap           = '10px';
    mainLogo.style.flexWrap      = 'wrap';

    // ساخت ساختار داخلی اگر وجود نداره
    let imgEl  = mainLogo.querySelector('img.logo-image,  #mainLogoImage');
    let textEl = mainLogo.querySelector('span.logo-text, #mainLogoText');

    if (!imgEl) {
      imgEl = document.createElement('img');
      imgEl.className = 'logo-image';
      imgEl.alt = '';
      imgEl.style.maxWidth  = '50px';
      imgEl.style.maxHeight = '50px';
      imgEl.style.objectFit = 'contain';
      mainLogo.appendChild(imgEl);
    }
    if (!textEl) {
      textEl = document.createElement('span');
      textEl.className = 'logo-text';
      mainLogo.appendChild(textEl);
    }

    // اعمال محتوا
    textEl.textContent  = name;
    textEl.style.color  = color;
    textEl.style.fontSize   = '32px';
    textEl.style.fontWeight = '700';

    if (mode === 'text') {
      imgEl.style.display  = 'none';
      textEl.style.display = 'inline';
    } else if (mode === 'image') {
      imgEl.style.display  = logoImage ? 'inline' : 'none';
      textEl.style.display = 'none';
      if (logoImage) imgEl.src = logoImage;
    } else { // both
      imgEl.style.display  = logoImage ? 'inline' : 'none';
      textEl.style.display = 'inline';
      if (logoImage) imgEl.src = logoImage;
    }

    // favicon
    if (favicon) {
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.href = favicon;
    }

    // عنوان صفحه
    const currentTitle = document.title;
    const schoolPart   = `مدرسه ${name}`;
    // اگه قبلاً نام مدرسه دیگه‌ای داشت جایگزین میشه
    document.title = currentTitle.replace(/مدرسه\s+\S+/, schoolPart);
    if (!document.title.includes(name)) {
      document.title = `${currentTitle} - ${name}`;
    }
  };

  // ─── جهت Sidebar بر اساس direction ───
  const applySidebarDirection = (direction) => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) return;

    const sidebar     = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const menuToggle  = document.querySelector('.menu-toggle');

    if (direction === 'ltr') {
      if (sidebar) {
        sidebar.style.right      = 'auto';
        sidebar.style.left       = '0';
        sidebar.style.borderLeft = 'none';
        sidebar.style.borderRight= '1px solid rgba(255,255,255,0.1)';
      }
      if (mainContent) {
        mainContent.style.marginRight = '0';
        mainContent.style.marginLeft  = '280px';
      }
      if (menuToggle) {
        menuToggle.style.right = 'auto';
        menuToggle.style.left  = '20px';
      }
    } else {
      if (sidebar) {
        sidebar.style.right       = '0';
        sidebar.style.left        = 'auto';
        sidebar.style.borderRight = 'none';
        sidebar.style.borderLeft  = '1px solid rgba(255,255,255,0.1)';
      }
      if (mainContent) {
        mainContent.style.marginLeft  = '0';
        mainContent.style.marginRight = '280px';
      }
      if (menuToggle) {
        menuToggle.style.left  = 'auto';
        menuToggle.style.right = '20px';
      }
    }
  };

  // ─── بارگذاری تنظیمات ───
  const loadSettings = async () => {
    // ابتدا از localStorage بخون (سریع و بدون delay)
    const cached = localStorage.getItem('themeSettings');
    if (cached) {
      try {
        const settings = JSON.parse(cached);
        applySettings(settings);
      } catch (_) {}
    } else {
      // اگه cache نیست، پیش‌فرض رو اعمال کن
      applySettings(DEFAULT_SETTINGS);
    }

    // سپس از سرور بخون و آپدیت کن (async)
    try {
      const res  = await fetch(`${API_URL}?action=get_theme`, { credentials: 'include' });
      const data = await res.json();

      if (data.success && data.theme) {
        let serverSettings = DEFAULT_SETTINGS;
        try {
          serverSettings = JSON.parse(data.theme.name || '{}');
        } catch (_) {}

        if (data.school_name) {
          serverSettings.schoolName = data.school_name;
        }

        // ذخیره در localStorage برای دفعات بعد
        localStorage.setItem('themeSettings', JSON.stringify(serverSettings));
        if (data.school_name) {
          localStorage.setItem('schoolName', data.school_name);
        }

        // اعمال تنظیمات سرور
        applySettings(serverSettings);
      }
    } catch (err) {
      // اگه سرور در دسترس نبود، از localStorage استفاده میشه (قبلاً اعمال شده)
      console.warn('ThemeLoader: Could not fetch from server, using cache.');
    }
  };

  // ─── اجرا ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings);
  } else {
    loadSettings();
  }

  // re-apply on resize (برای مدیریت direction در موبایل)
  window.addEventListener('resize', () => {
    const cached = localStorage.getItem('themeSettings');
    if (cached) {
      try {
        const s = JSON.parse(cached);
        applySidebarDirection(s.pageDirection || 'rtl');
      } catch (_) {}
    }
  });

  // ─── صادر کردن برای استفاده در settings.js ───
  window.ThemeLoader = {
    applySettings,
    loadSettings,
  };
})();