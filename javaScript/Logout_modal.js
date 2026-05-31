/**
 * ═══════════════════════════════════════════
 *  بوربور — مودال خروج از سامانه
 *  فایل: logout-modal.js
 *  نحوه استفاده: فقط این فایل رو در هر صفحه include کن
 *  <script src="../javaScript/logout-modal.js"></script>
 * ═══════════════════════════════════════════
 */

(function () {
  /* ── CSS ── */
  const style = document.createElement("style");
  style.textContent = `
    /* ══ LOGOUT MODAL OVERLAY ══ */
    #logoutModalOverlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      pointer-events: none;
      transition: background 0.35s ease;
    }
    #logoutModalOverlay.lm-open {
      background: rgba(0, 0, 0, 0.78);
      pointer-events: all;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }

    /* ══ CARD ══ */
    #logoutModalCard {
      background: linear-gradient(145deg, #162040, #1a2650);
      border: 1px solid rgba(74, 144, 217, 0.2);
      border-radius: 22px;
      padding: 0;
      width: 100%;
      max-width: 420px;
      position: relative;
      box-shadow:
        0 32px 80px rgba(0, 0, 0, 0.7),
        0 0 0 1px rgba(255, 255, 255, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
      transform: translateY(28px) scale(0.94);
      opacity: 0;
      transition:
        transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.28s ease;
      overflow: hidden;
      font-family: "Vazirmatn", "Shabnam", Tahoma, sans-serif;
      direction: rtl;
    }
    #logoutModalOverlay.lm-open #logoutModalCard {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    /* ── top accent bar ── */
    #logoutModalCard::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, #e74c3c, #f39c12, #e74c3c);
      background-size: 200% 100%;
      animation: lm-bar-move 2.5s linear infinite;
    }
    @keyframes lm-bar-move {
      0%   { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    /* ── glow circle background ── */
    #logoutModalCard::after {
      content: "";
      position: absolute;
      top: -60px; left: 50%; transform: translateX(-50%);
      width: 220px; height: 220px;
      background: radial-gradient(circle, rgba(231, 76, 60, 0.12) 0%, transparent 70%);
      pointer-events: none;
    }

    /* ══ HEADER ══ */
    .lm-header {
      padding: 32px 28px 20px;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    /* ── icon ring ── */
    .lm-icon-ring {
      width: 76px;
      height: 76px;
      margin: 0 auto 18px;
      position: relative;
    }
    .lm-icon-ring-outer {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: rgba(231, 76, 60, 0.08);
      border: 2px solid rgba(231, 76, 60, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: lm-ring-pulse 2.2s ease-in-out infinite;
    }
    @keyframes lm-ring-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.25); }
      50%       { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
    }
    .lm-icon-ring-inner {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.22), rgba(243, 156, 18, 0.18));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 21px;
      color: #e74c3c;
    }

    .lm-title {
      font-size: 17px;
      font-weight: 800;
      color: #e8f0ff;
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }
    .lm-subtitle {
      font-size: 12.5px;
      color: rgba(180, 200, 255, 0.55);
      line-height: 1.7;
    }

    /* ══ USER BADGE ══ */
    .lm-user-badge {
      margin: 0 28px 22px;
      background: rgba(74, 144, 217, 0.07);
      border: 1px solid rgba(74, 144, 217, 0.15);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    .lm-user-av {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4a90d9, #8e5fd4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 3px 10px rgba(74, 144, 217, 0.3);
    }
    .lm-user-name {
      font-size: 13px;
      font-weight: 700;
      color: #e8f0ff;
    }
    .lm-user-role {
      font-size: 10.5px;
      color: rgba(180, 200, 255, 0.5);
      margin-top: 2px;
    }
    .lm-session-dot {
      margin-right: auto;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: #06d6a0;
      font-weight: 700;
    }
    .lm-session-dot::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #06d6a0;
      box-shadow: 0 0 6px rgba(6, 214, 160, 0.6);
      animation: lm-dot-blink 2s infinite;
    }
    @keyframes lm-dot-blink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    /* ══ DIVIDER ══ */
    .lm-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
      margin: 0 0 22px;
    }

    /* ══ BUTTONS ══ */
    .lm-btn-row {
      display: flex;
      gap: 10px;
      padding: 0 28px 28px;
      position: relative;
      z-index: 1;
    }

    .lm-btn {
      flex: 1;
      padding: 12px 14px;
      border-radius: 12px;
      font-family: "Vazirmatn", "Shabnam", Tahoma, sans-serif;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      border: 1px solid;
      letter-spacing: -0.2px;
    }
    .lm-btn:active {
      transform: scale(0.96) !important;
    }

    /* cancel */
    .lm-btn-cancel {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.09);
      color: rgba(180, 200, 255, 0.7);
    }
    .lm-btn-cancel:hover {
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(255, 255, 255, 0.15);
      color: #e8f0ff;
      transform: translateY(-2px);
    }

    /* confirm */
    .lm-btn-confirm {
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.18), rgba(231, 76, 60, 0.1));
      border-color: rgba(231, 76, 60, 0.35);
      color: #e74c3c;
      position: relative;
      overflow: hidden;
    }
    .lm-btn-confirm::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(231, 76, 60, 0.25), rgba(243, 156, 18, 0.15));
      opacity: 0;
      transition: opacity 0.22s;
    }
    .lm-btn-confirm:hover {
      border-color: rgba(231, 76, 60, 0.6);
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(231, 76, 60, 0.25);
    }
    .lm-btn-confirm:hover::before {
      opacity: 1;
    }
    .lm-btn-confirm span,
    .lm-btn-confirm i {
      position: relative;
      z-index: 1;
    }

    /* loading state */
    .lm-btn-confirm.lm-loading {
      pointer-events: none;
      opacity: 0.8;
    }
    .lm-btn-confirm.lm-loading .lm-btn-txt { display: none; }
    .lm-btn-confirm .lm-spinner {
      display: none;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(231, 76, 60, 0.3);
      border-top-color: #e74c3c;
      border-radius: 50%;
      animation: lm-spin 0.7s linear infinite;
      position: relative;
      z-index: 1;
    }
    .lm-btn-confirm.lm-loading .lm-spinner { display: block; }
    @keyframes lm-spin {
      to { transform: rotate(360deg); }
    }

    /* ══ CLOSE BTN ══ */
    #logoutModalClose {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(180, 200, 255, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      transition: all 0.2s;
      z-index: 2;
      font-family: inherit;
    }
    #logoutModalClose:hover {
      background: rgba(231, 76, 60, 0.15);
      border-color: rgba(231, 76, 60, 0.3);
      color: #e74c3c;
      transform: rotate(90deg);
    }

    /* ══ KEYBOARD HINT ══ */
    .lm-kbd-hint {
      text-align: center;
      font-size: 10px;
      color: rgba(180, 200, 255, 0.22);
      padding-bottom: 14px;
      position: relative;
      z-index: 1;
    }
    .lm-kbd {
      display: inline-block;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 9px;
      margin: 0 2px;
    }
  `;
  document.head.appendChild(style);

  /* ── HTML ── */
  const overlay = document.createElement("div");
  overlay.id = "logoutModalOverlay";
  overlay.innerHTML = `
    <div id="logoutModalCard">
      <button id="logoutModalClose" title="بستن">✕</button>

      <div class="lm-header">
        <div class="lm-icon-ring">
          <div class="lm-icon-ring-outer">
            <div class="lm-icon-ring-inner">
              <i class="fas fa-sign-out-alt"></i>
            </div>
          </div>
        </div>
        <div class="lm-title">خروج از سامانه</div>
        <div class="lm-subtitle">آیا مطمئن هستید که می‌خواهید<br>از حساب خود خارج شوید؟</div>
      </div>

      <div class="lm-user-badge">
        <div class="lm-user-av" id="lmUserAv">م</div>
        <div>
          <div class="lm-user-name" id="lmUserName">در حال بارگذاری...</div>
          <div class="lm-user-role" id="lmUserRole">کاربر سامانه</div>
        </div>
        <div class="lm-session-dot">آنلاین</div>
      </div>

      <div class="lm-divider"></div>

      <div class="lm-btn-row">
        <button class="lm-btn lm-btn-cancel" id="lmCancelBtn">
          <i class="fas fa-times"></i> انصراف
        </button>
        <button class="lm-btn lm-btn-confirm" id="lmConfirmBtn" onclick="logoutModalConfirm()">
          <div class="lm-spinner"></div>
          <span class="lm-btn-txt"><i class="fas fa-sign-out-alt"></i> <span>بله، خارج شو</span></span>
        </button>
      </div>

      <div class="lm-kbd-hint">
        <span class="lm-kbd">Esc</span> برای انصراف &nbsp;·&nbsp;
        <span class="lm-kbd">Enter</span> برای تأیید
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* ── open / close ── */
  window.openLogoutModal = function () {
    overlay.classList.add("lm-open");
    document.body.style.overflow = "hidden";
    _fillUser();
    setTimeout(() => {
      document.getElementById("lmCancelBtn")?.focus();
    }, 350);
  };

  window.closeLogoutModal = function () {
    overlay.classList.remove("lm-open");
    document.body.style.overflow = "";
  };

  /* ── confirm (redirect to logout endpoint) ── */
  window.logoutModalConfirm = function () {
    const btn = document.getElementById("lmConfirmBtn");
    btn.classList.add("lm-loading");
    setTimeout(() => {
      window.location.href = "../api/logout.php";
    }, 900);
  };

  /* ── fill user info from sidebar DOM (if present) ── */
  function _fillUser() {
    const nameEl =
      document.getElementById("managerName") ||
      document.getElementById("adminName");
    const roleEl =
      document.getElementById("managerRole") ||
      document.getElementById("adminRole");

    const name = nameEl?.textContent?.trim();
    const role = roleEl?.textContent?.trim();

    if (name && name !== "در حال بارگذاری...") {
      document.getElementById("lmUserName").textContent = name;
      document.getElementById("lmUserAv").textContent = name.charAt(0);
    }
    if (role && role !== "در حال بارگذاری...") {
      document.getElementById("lmUserRole").textContent = role;
    }
  }

  /* ── close on overlay click ── */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLogoutModal();
  });

  /* ── close btn ── */
  document
    .getElementById("logoutModalClose")
    .addEventListener("click", closeLogoutModal);
  document
    .getElementById("lmCancelBtn")
    .addEventListener("click", closeLogoutModal);

  /* ── keyboard ── */
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("lm-open")) return;
    if (e.key === "Escape") closeLogoutModal();
    if (e.key === "Enter") logoutModalConfirm();
  });

  /* ══════════════════════════════════════════
     سیم‌کشی خودکار لینک‌های خروج در sidebar
     هر <a> که href آن شامل logout باشد
  ══════════════════════════════════════════ */
  function _hookLogoutLinks() {
    document.querySelectorAll('a[href*="logout"]').forEach((link) => {
      if (link.dataset.lmHooked) return;
      link.dataset.lmHooked = "1";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        openLogoutModal();
      });
    });
  }

  /* اجرا بعد از لود DOM */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _hookLogoutLinks);
  } else {
    _hookLogoutLinks();
  }

  /* اگر sidebar بعداً به DOM اضافه شد */
  const _obs = new MutationObserver(_hookLogoutLinks);
  _obs.observe(document.body, { childList: true, subtree: true });
})();