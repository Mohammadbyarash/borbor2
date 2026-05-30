/**
 * theme-loader.js
 * فایل مشترک برای اعمال تنظیمات تم در تمام صفحات
 * کافیه این فایل رو به همه صفحات HTML اضافه کنی
 */

(function () {
  'use strict';

  const API_URL = '../api/settings.php';

  const DEFAULT_SETTINGS = {
    bgColor:           '#202b59',
    sidebarColor:      '#172047',
    textColor:         '#ffffff',
    inputColor:        '#1e2957',
    activeMenuColor:   '#202b59',
    hoverColor:        '#2a3f6b',
    buttonColor:       '#1e2957',
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

  const applySettings = (settings) => {
    const s = { ...DEFAULT_SETTINGS, ...settings };

    document.body.style.fontFamily = `"${s.font}", "Vazirmatn", sans-serif`;
    document.body.setAttribute('dir', s.pageDirection);
    document.documentElement.setAttribute('dir', s.pageDirection);
    document.body.style.background = s.bgColor;

    // اعمال رنگ کارت‌ها بر اساس sidebarColor تم
    const cardRgb = hexToRgb(s.sidebarColor);
    const cardBg = `rgba(${Math.min(255, cardRgb.r + 20)},${Math.min(255, cardRgb.g + 20)},${Math.min(255, cardRgb.b + 20)},0.9)`;
    applyStyleTag(
      'tl-card-style',
      `.card, .chart-section, .settings-section, .stat-card, .section-box {
         background: ${cardBg} !important;
       }
       .card-button {
         background: ${s.buttonColor} !important;
         color: #fff !important;
       }
       .card-button:hover {
         filter: brightness(0.85) !important;
       }`
    );

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.style.background = s.sidebarColor;

    // رنگ دکمه همبرگر با sidebar هماهنگ بشه
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
      menuToggle.style.background = s.sidebarColor;
      menuToggle.style.borderColor = 'rgba(255,255,255,0.2)';
      menuToggle.style.color = s.textColor;
    }

    applySidebarDirection(s.pageDirection);

    // فقط عناصر غیر منو رو با inline style رنگ بزن
    document.querySelectorAll(
      '.page-title, .section-title, .form-label, .card-title, .stat-title'
    ).forEach((el) => (el.style.color = s.textColor));

    // رنگ متن منو رو با CSS بزن نه inline style
    applyStyleTag(
      'tl-menu-text-style',
      `.menu-item a, .menu-item .menu-link { color: ${s.textColor} !important; }
       .submenu-item { color: rgba(255,255,255,0.7) !important; }
       .submenu-item.active, .submenu-item:hover { color: #fff !important; }`
    );

    // محاسبه رنگ‌های مشتق شده
    const bgRgb   = hexToRgb(s.bgColor);
    const sideRgb = hexToRgb(s.sidebarColor);
    const inputRgb = hexToRgb(s.inputColor);

    // رنگ کارت‌ها و جداول کمی روشن‌تر از bgColor
    const tableBg  = `rgba(${Math.min(255,bgRgb.r+15)},${Math.min(255,bgRgb.g+15)},${Math.min(255,bgRgb.b+15)},1)`;
    // رنگ ردیف‌های جدول کمی تیره‌تر از inputColor
    const rowBg    = `rgba(${Math.max(0,inputRgb.r-10)},${Math.max(0,inputRgb.g-10)},${Math.max(0,inputRgb.b-10)},1)`;
    const rowAltBg = `rgba(${Math.max(0,inputRgb.r-20)},${Math.max(0,inputRgb.g-20)},${Math.max(0,inputRgb.b-20)},1)`;

    applyStyleTag(
      'tl-input-style',
      `.form-input, .form-select, .search-input,
       input[type="text"], input[type="tel"], input[type="email"],
       select, textarea,
       .filter-select {
         background: ${s.inputColor} !important;
         color: #fff !important;
      }
      .color-display {
         background: ${s.inputColor} !important;
         border-color: rgba(255,255,255,0.15) !important;
      }
      .color-display span, .color-display i {
         color: #fff !important;
      }
      .range-input {
         accent-color: ${s.scrollbarColor} !important;
         background: ${s.inputColor} !important;
      }
      .table-container, .section-box {
         background: ${tableBg} !important;
      }
      .grid-row {
         background: ${s.inputColor} !important;
      }
      .grid-row:nth-child(even) {
         background: ${rowAltBg} !important;
      }
      .stat-card {
         background: ${tableBg} !important;
      }
      .form-section, .assistant-profile-header,
      .attendance-status, .attendance-stat-card,
      .permissions-grid, .task-card, .report-card,
      .specs-row, .modal-content, .specs-modal-content,
      .confirm-modal-content {
         background: ${s.inputColor} !important;
      }
      .upload-btn-custom, .favicon-preview {
         background: ${s.inputColor} !important;
      }
      .theme-name {
         background: ${s.inputColor} !important;
      }`
    );

    // active فقط برای منوهای معمولی - منوهای زیرمنودار فقط با open
    applyStyleTag(
      'tl-active-menu-style',
      `.menu-item:not(.has-submenu).active > a { background: ${s.activeMenuColor} !important; }
       .menu-item.has-submenu:not(.open) > a,
       .menu-item.has-submenu:not(.open) > .menu-link { background: ${s.sidebarColor} !important; }
       .menu-item.has-submenu.open > a,
       .menu-item.has-submenu.open > .menu-link { background: ${s.activeMenuColor} !important; }
       .submenu { background: rgba(0,0,0,0.2) !important; }
       .upload-btn-custom, .favicon-preview { background: ${s.inputColor} !important; }
       .theme-name { background: ${s.inputColor} !important; }`
    );

    applyStyleTag(
      'tl-hover-style',
      `.menu-item:not(.has-submenu) > a:hover { background: ${s.hoverColor} !important; }
       .menu-item.has-submenu > a:hover,
       .menu-item.has-submenu > .menu-link:hover { background: ${s.hoverColor} !important; }`
    );

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

    applyStyleTag(
      'tl-scrollbar-style',
      `* { scrollbar-color: ${s.scrollbarColor} ${s.sidebarColor} !important; }
       ::-webkit-scrollbar-thumb { background: ${s.scrollbarColor} !important; }
       ::-webkit-scrollbar-track { background: ${s.sidebarColor} !important; }`
    );

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

    applyLogoToSidebar(s);
  };

  const applyLogoToSidebar = (s) => {
    const mainLogo = document.querySelector('.sidebar .logo, .sidebar #mainLogo');
    if (!mainLogo) return;

    const logoImage = localStorage.getItem('logoImage');
    const favicon   = localStorage.getItem('favicon');
    const mode      = s.logoDisplayMode || 'text';
    const direction = s.logoDirection   || 'rtl';
    const color     = s.logoTextColor   || '#ffffff';
    const name      = s.schoolName      || 'بوربور';

    mainLogo.innerHTML = '';

    mainLogo.style.flexDirection  = direction === 'ltr' ? 'row-reverse' : 'row';
    mainLogo.style.display        = 'flex';
    mainLogo.style.alignItems     = 'center';
    mainLogo.style.justifyContent = 'center';
    mainLogo.style.gap            = '10px';
    mainLogo.style.flexWrap       = 'wrap';

    const imgEl = document.createElement('img');
    imgEl.id          = 'mainLogoImage';
    imgEl.className   = 'logo-image';
    imgEl.alt         = name;
    imgEl.style.maxWidth  = '50px';
    imgEl.style.maxHeight = '50px';
    imgEl.style.objectFit = 'contain';

    const textEl = document.createElement('span');
    textEl.id          = 'mainLogoText';
    textEl.className   = 'logo-text';
    textEl.textContent = name;
    textEl.style.color      = color;
    textEl.style.fontSize   = '32px';
    textEl.style.fontWeight = '700';

    if (mode === 'text') {
      imgEl.style.display  = 'none';
      textEl.style.display = 'inline';
    } else if (mode === 'image') {
      imgEl.style.display  = logoImage ? 'inline' : 'none';
      textEl.style.display = 'none';
      if (logoImage) imgEl.src = logoImage;
    } else {
      imgEl.style.display  = logoImage ? 'inline' : 'none';
      textEl.style.display = 'inline';
      if (logoImage) imgEl.src = logoImage;
    }

    if (direction === 'ltr') {
      mainLogo.appendChild(imgEl);
      mainLogo.appendChild(textEl);
    } else {
      mainLogo.appendChild(textEl);
      mainLogo.appendChild(imgEl);
    }

    if (favicon) {
      const link = document.querySelector("link[rel*='icon']");
      if (link) link.href = favicon;
    }

    if (!document.title.includes(name)) {
      document.title = document.title.replace(/مدرسه\s+\S+/, `مدرسه ${name}`);
      if (!document.title.includes(name)) {
        document.title = `${document.title} - ${name}`;
      }
    }
  };

  const applySidebarDirection = (direction) => {
    if (window.innerWidth <= 768) return;

    const sidebar = document.querySelector('.sidebar');

    if (direction === 'ltr') {
      if (sidebar) {
        sidebar.style.order       = '2';
        sidebar.style.borderLeft  = 'none';
        sidebar.style.borderRight = '1px solid rgba(255,255,255,0.1)';
      }
    } else {
      if (sidebar) {
        sidebar.style.order       = '';
        sidebar.style.borderRight = 'none';
        sidebar.style.borderLeft  = '1px solid rgba(255,255,255,0.1)';
      }
    }
  };

  const loadSettings = async () => {
    const cached = localStorage.getItem('themeSettings');
    if (cached) {
      try { applySettings(JSON.parse(cached)); }
      catch (_) { applySettings(DEFAULT_SETTINGS); }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }

    try {
      const res  = await fetch(`${API_URL}?action=get_theme`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.theme) {
        let s = { ...DEFAULT_SETTINGS };
        try { s = { ...s, ...JSON.parse(data.theme.name || '{}') }; } catch (_) {}
        if (data.school_name) s.schoolName = data.school_name;
        localStorage.setItem('themeSettings', JSON.stringify(s));
        if (data.school_name) localStorage.setItem('schoolName', data.school_name);
        applySettings(s);
      }
    } catch (_) {
      console.warn('ThemeLoader: Could not fetch from server, using cache.');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSettings);
  } else {
    loadSettings();
  }

  window.addEventListener('resize', () => {
    try {
      const s = JSON.parse(localStorage.getItem('themeSettings') || '{}');
      applySidebarDirection(s.pageDirection || 'rtl');
    } catch (_) {}
  });

  window.ThemeLoader = { applySettings, loadSettings };
})();