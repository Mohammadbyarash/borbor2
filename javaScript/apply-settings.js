(function () {

  /* ── کش sessionStorage برای لود سریع‌تر ── */
  async function fetchJSON(url) {
    const key = 'bb_' + url;
    const cached = sessionStorage.getItem(key);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    try {
      const r = await fetch(url, { credentials: 'include' });
      if (!r.ok) return null;
      const d = await r.json();
      if (d && d.success) sessionStorage.setItem(key, JSON.stringify(d));
      return (d && d.success) ? d : null;
    } catch { return null; }
  }

  /* ── تم‌های آماده ── */
  var THEMES = {
    'آبی اقیانوسی': { bg:'#0f1629', sidebar:'#0b1120', card:'#162040', text:'#e8f0ff', accent:'#4a90d9', accent3:'#06d6a0', danger:'#e74c3c' },
    'سبز جنگل':     { bg:'#0a1f0e', sidebar:'#061408', card:'#0d2b14', text:'#e0ffe8', accent:'#2ecc71', accent3:'#06d6a0', danger:'#e74c3c' },
    'شب بنفش':      { bg:'#1a0a2e', sidebar:'#10061e', card:'#2d1556', text:'#f0e8ff', accent:'#c084fc', accent3:'#818cf8', danger:'#f43f5e' },
    'غروب آتشین':   { bg:'#1f0a0a', sidebar:'#120505', card:'#2d1010', text:'#fff0e8', accent:'#f97316', accent3:'#fb923c', danger:'#dc2626' },
    'فیروزه‌ای':    { bg:'#042f2e', sidebar:'#021e1d', card:'#064e3b', text:'#e0fff8', accent:'#06d6a0', accent3:'#34d399', danger:'#f43f5e' },
    'طلایی':        { bg:'#1a1000', sidebar:'#0f0900', card:'#2d1d00', text:'#fff8e8', accent:'#f39c12', accent3:'#f59e0b', danger:'#ef4444' },
    'صورتی گرم':    { bg:'#1f0a14', sidebar:'#12060c', card:'#2d1020', text:'#ffe8f4', accent:'#f472b6', accent3:'#ec4899', danger:'#ef4444' },
  };

  /* ── اعمال تم روی صفحه ── */
  function applyTheme(t) {
    var r = document.documentElement;
    r.style.setProperty('--bg-main',    t.bg);
    r.style.setProperty('--bg-sidebar', t.sidebar);
    r.style.setProperty('--bg-card',    t.card);
    r.style.setProperty('--bg-card2',   t.card + 'cc');
    r.style.setProperty('--text',       t.text);
    r.style.setProperty('--accent',     t.accent);
    r.style.setProperty('--accent3',    t.accent3);
    r.style.setProperty('--accent5',    t.danger);
    r.style.setProperty('--absent',     t.danger);
    document.body.style.background = t.bg;
  }

  /* ── اعمال پروفایل روی sidebar و دکمه‌ها ── */
  function applyProfile(u) {
    if (!u) return;
    var full   = ((u.first_name || '') + (u.last_name ? ' ' + u.last_name : '')).trim();
    var letter = (u.first_name || 'م').charAt(0);
    var roleMap = { owner:'مالک', manager:'مدیر', teacher:'معلم', assistant:'معاون', parent:'والدین', student:'دانش‌آموز' };

    /* همه سلکتورهای احتمالی برای اسم */
    var nameSelectors = ['#managerName', '.manager-name', '[data-role="manager-name"]'];
    nameSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el && full) el.textContent = full;
      });
    });

    /* نقش */
    var roleSelectors = ['#managerRole', '.manager-role', '[data-role="manager-role"]'];
    roleSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el) el.textContent = roleMap[u.role] || u.role || '';
      });
    });

    /* آواتار — همه حالت‌های ممکن */
    var avatarSelectors = [
      '#managerAvatar',
      '#managerAvatarLetter',
      '.manager-avatar',
      '[data-role="manager-avatar"]'
    ];
    avatarSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el) return;
        if (u.photo_url) {
          el.innerHTML = '<img src="' + u.photo_url + '" alt="پروفایل" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
        } else {
          /* فقط اگه عکس نداره حرف اول بذار */
          var img = el.querySelector('img');
          if (!img) {
            var ph = el.querySelector('.manager-avatar-ph');
            if (ph) ph.textContent = letter;
            else el.textContent = letter;
          }
        }
      });
    });

    /* دکمه پروفایل گوشه بالا */
    var profileBtnSelectors = [
      '#profileBtn',
      '#profileBtnLetter',
      '.profile-btn',
      '[data-role="profile-btn"]'
    ];
    profileBtnSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el) return;
        if (u.photo_url) {
          el.innerHTML = '<img src="' + u.photo_url + '" alt="پروفایل" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
          el.style.padding  = '0';
          el.style.overflow = 'hidden';
        } else {
          el.textContent = letter;
        }
      });
    });

    /* admin-info / top-bar info */
    var adminInfoSelectors = ['#adminInfo', '#adminInfoDisplay', '.admin-info', '[data-role="admin-info"]'];
    adminInfoSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el) {
          el.innerHTML = '<span class="live-dot"></span>' + (roleMap[u.role] || u.role || '') + ': ' + (full || '');
        }
      });
    });
  }

  /* ── اجرای اصلی ── */
  async function run() {
    var [themeData, profileData] = await Promise.all([
      fetchJSON('../api/settings.php?action=get_theme'),
      fetchJSON('../api/settings.php?action=get_profile'),
    ]);

    /* تم */
    if (themeData && themeData.theme) {
      var t = themeData.theme;
      var preset = THEMES[t.name];
      if (preset) {
        applyTheme(preset);
      } else {
        applyTheme({
          bg:      t.secondary_color || '#0f1629',
          sidebar: '#0b1120',
          card:    '#162040',
          text:    '#e8f0ff',
          accent:  t.primary_color  || '#4a90d9',
          accent3: '#06d6a0',
          danger:  '#e74c3c',
        });
      }
    }

    /* پروفایل */
    if (profileData && profileData.user) {
      applyProfile(profileData.user);
    }
  }

  /* ── صبر کن DOM آماده بشه ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    /* DOM آماده‌ست ولی ممکنه JS‌های دیگه هنوز sidebar رو رندر نکرده باشن */
    /* یه تاخیر کوچیک برای اطمینان */
    setTimeout(run, 50);
  }

  /* ── اگه کشی بود سریع اعمالش کن، بعد آپدیت بگیر ── */
  (function quickApplyFromCache() {
    try {
      var tCached = sessionStorage.getItem('bb_../api/settings.php?action=get_theme');
      var pCached = sessionStorage.getItem('bb_../api/settings.php?action=get_profile');
      if (tCached) {
        var td = JSON.parse(tCached);
        if (td && td.theme) {
          var preset = THEMES[td.theme.name];
          if (preset) applyTheme(preset);
        }
      }
      if (pCached) {
        var pd = JSON.parse(pCached);
        if (pd && pd.user) {
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { applyProfile(pd.user); });
          } else {
            applyProfile(pd.user);
          }
        }
      }
    } catch (e) {}
  })();

})();