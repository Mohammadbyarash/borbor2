// Menu Toggle
const menuToggle = document.getElementById("menuToggle"),
  sidebar = document.getElementById("sidebar"),
  sidebarOverlay = document.getElementById("sidebarOverlay");
if (menuToggle) {
  console.log("Menu toggle button found");
  menuToggle.addEventListener("click", () => {
    console.log("Menu toggle clicked");
    sidebar.classList.toggle("active");
    sidebarOverlay.classList.toggle("active");
    console.log("Sidebar active:", sidebar.classList.contains("active"));
  });
}
if (sidebarOverlay)
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
  });



// Utilities
const faToEn = (str) =>
  typeof str === "string"
    ? str.replace(
        /[۰-۹]/g,
        (w) =>
          ({
            "۰": "0",
            "۱": "1",
            "۲": "2",
            "۳": "3",
            "۴": "4",
            "۵": "5",
            "۶": "6",
            "۷": "7",
            "۸": "8",
            "۹": "9",
          })[w],
      )
    : "";
const showMsg = (msg) => {
  const m = document.createElement("div");
  m.className = "success-message";
  m.textContent = msg;
  document.body.appendChild(m);
  setTimeout(() => m.remove(), 3000);
};
const showWarning = (msg) => {
  const m = document.createElement("div");
  m.className = "warning-message";
  m.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${msg}</span>`;
  document.body.appendChild(m);
  setTimeout(() => m.remove(), 4000);
};
const hexToRgb = (h) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 32, g: 43, b: 89 };
};

// Format Number with Commas
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Update Balance Display
const updateBalanceDisplay = () => {
  // BUG FIX: parse as int before formatting to avoid NaN display
  const raw = localStorage.getItem("currentBalance");
  const balance = parseInt(raw) || 0;
  const balanceElement = document.getElementById("currentBalance");
  if (balanceElement) {
    balanceElement.textContent = formatNumber(balance);
  }
};

// Check File Size (must be under 1MB)
const checkFileSize = (file, maxSizeMB = 1) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    document.getElementById("currentFileSize").textContent =
      `${sizeInMB} مگابایت`;
    document.getElementById("fileSizeModal").classList.add("active");
    return false;
  }
  return true;
};
const closeFileSizeModal = () => {
  document.getElementById("fileSizeModal").classList.remove("active");
};
document.getElementById("fileSizeModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeFileSizeModal();
});

// Toggle Custom Amount Input
const toggleCustomAmount = () => {
  const selectedValue = document.getElementById("chargeAmount").value;
  const customGroup = document.getElementById("customAmountGroup");
  if (selectedValue === "custom") {
    customGroup.style.display = "flex";
  } else {
    customGroup.style.display = "none";
    document.getElementById("customAmount").value = "";
  }
};

// Process Charge
// BUG FIX: store finalAmount in a variable accessible to confirmCharge
let _pendingChargeAmount = 0;
let _pendingChargePhone = "";

const processCharge = () => {
  const chargePhone = document.getElementById("adminChargePhone").value.trim();
  const chargeAmountSelect = document.getElementById("chargeAmount").value;
  const customAmount = document.getElementById("customAmount").value.trim();

  // Validation
  if (!chargePhone) {
    showWarning("لطفاً شماره موبایل برای شارژ را وارد کنید!");
    return;
  }

  if (!chargePhone.startsWith("09") || chargePhone.length !== 11) {
    showWarning("شماره موبایل باید با 09 شروع شود و دقیقاً 11 رقم باشد!");
    return;
  }

  if (!chargeAmountSelect) {
    showWarning("لطفاً مبلغ شارژ را انتخاب کنید!");
    return;
  }

  let finalAmount = 0;
  if (chargeAmountSelect === "custom") {
    if (!customAmount) {
      showWarning("لطفاً مبلغ دلخواه را وارد کنید!");
      return;
    }
    // BUG FIX: remove commas then convert Persian digits before parseInt
    finalAmount = parseInt(faToEn(customAmount.replace(/,/g, "")));
    if (isNaN(finalAmount) || finalAmount <= 0) {
      showWarning("مبلغ وارد شده معتبر نیست!");
      return;
    }
    if (finalAmount < 10000) {
      showWarning("حداقل مبلغ شارژ 10,000 تومان است!");
      return;
    }
  } else {
    finalAmount = parseInt(chargeAmountSelect);
  }

  // BUG FIX: store values before opening modal so confirmCharge reads correct data
  _pendingChargeAmount = finalAmount;
  _pendingChargePhone = chargePhone;

  // Show confirmation modal
  document.getElementById("chargeAccountDisplay").textContent = chargePhone;
  document.getElementById("chargeAmountDisplay").textContent =
    formatNumber(finalAmount) + " تومان";
  document.getElementById("chargeModal").classList.add("active");
};

// Close Charge Modal
const closeChargeModal = () => {
  document.getElementById("chargeModal").classList.remove("active");
};

// Confirm Charge
const confirmCharge = () => {
  // BUG FIX: use stored _pendingChargeAmount instead of re-parsing the DOM text
  const amount = _pendingChargeAmount;
  const phone = _pendingChargePhone;

  if (!amount || amount <= 0) {
    showWarning("مبلغ شارژ معتبر نیست!");
    closeChargeModal();
    return;
  }

  closeChargeModal();

  // Simulate payment processing
  const loadingMsg = document.createElement("div");
  loadingMsg.className = "success-message";
  loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش پرداخت...';
  document.body.appendChild(loadingMsg);

  setTimeout(() => {
    loadingMsg.remove();

    // BUG FIX: use _pendingChargeAmount directly, no re-parsing needed
    const currentBalance = parseInt(localStorage.getItem("currentBalance")) || 0;
    const newBalance = currentBalance + amount;
    localStorage.setItem("currentBalance", newBalance.toString());
    updateBalanceDisplay();

    // Save charge info to localStorage
    const chargeInfo = {
      phoneNumber: phone,
      amount: formatNumber(amount) + " تومان",
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR')
    };

    let chargeHistory = [];
    try {
      chargeHistory = JSON.parse(localStorage.getItem("chargeHistory") || "[]");
    } catch (_) {}
    chargeHistory.push(chargeInfo);
    localStorage.setItem("chargeHistory", JSON.stringify(chargeHistory));

    showMsg("شارژ حساب با موفقیت انجام شد!");

    // Reset form
    document.getElementById("chargeAmount").value = "";
    document.getElementById("customAmount").value = "";
    toggleCustomAmount();

    // Reset pending values
    _pendingChargeAmount = 0;
    _pendingChargePhone = "";
  }, 2000);
};

document.getElementById("chargeModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeChargeModal();
});

// Validation for Charge Phone Number
const adminChargePhone = document.getElementById("adminChargePhone");
if (adminChargePhone) {
  adminChargePhone.addEventListener("input", (e) => {
    let val = faToEn(e.target.value);
    e.target.value = val.replace(/[^0-9]/g, "").substring(0, 11);
  });
}

// Validation for Custom Amount
const customAmount = document.getElementById("customAmount");
if (customAmount) {
  customAmount.addEventListener("input", (e) => {
    let val = faToEn(e.target.value);
    val = val.replace(/[^0-9]/g, "");
    if (val) {
      e.target.value = formatNumber(val);
    } else {
      e.target.value = "";
    }
  });
}

// Color Picker
let currentColorTarget = null;
const openColorPicker = (target) => {
  currentColorTarget = target;
  const val = document.getElementById(target + "Value").textContent;
  document.getElementById("colorPickerInput").value = val;
  document.getElementById("colorPickerText").value = val;
  document.getElementById("colorPickerModal").classList.add("active");
};
const closeColorPicker = () => {
  document.getElementById("colorPickerModal").classList.remove("active");
  currentColorTarget = null;
};
const confirmColorPicker = () => {
  if (!currentColorTarget) return;
  const color = document.getElementById("colorPickerInput").value;
  document.getElementById(currentColorTarget + "Value").textContent = color;
  document.getElementById(currentColorTarget + "Preview").style.background =
    color;
  if (currentColorTarget === "logoTextColor") {
    document
      .querySelectorAll(".logo-text")
      .forEach((el) => (el.style.color = color));
  }
  updatePreview();
  closeColorPicker();
};
document.getElementById("colorPickerInput")?.addEventListener("input", (e) => {
  document.getElementById("colorPickerText").value = e.target.value;
});
document.getElementById("colorPickerText")?.addEventListener("input", (e) => {
  const val = e.target.value;
  if (/^#[0-9A-F]{6}$/i.test(val))
    document.getElementById("colorPickerInput").value = val;
});
document.getElementById("colorPickerModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeColorPicker();
});

// Profile Image
const profileImageInput = document.getElementById("profileImageInput"),
  profileImage = document.getElementById("profileImage");
if (profileImageInput)
  profileImageInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0],
        ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!["png", "jpg", "jpeg"].includes(ext)) {
        showWarning("فقط فایل‌های PNG و JPG مجاز هستند!");
        e.target.value = "";
        return;
      }
      if (!checkFileSize(file)) {
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        profileImage.src = ev.target.result;
        localStorage.setItem("profileImage", ev.target.result);
        showMsg("عکس پروفایل با موفقیت تغییر کرد!");
      };
      reader.readAsDataURL(file);
    }
  });

// Image Preview
const openImagePreview = () => {
  document.getElementById("previewImageLarge").src = profileImage.src;
  document.getElementById("imagePreviewModal").classList.add("active");
};
const closeImagePreview = () => {
  document.getElementById("imagePreviewModal").classList.remove("active");
};
document.getElementById("imagePreviewModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeImagePreview();
});

// Save Profile
const saveProfile = () => {
  const name = document.getElementById("adminName").value.trim(),
    nc = document.getElementById("adminNationalCode").value.trim(),
    phone = document.getElementById("adminPhone").value.trim(),
    birthday = document.getElementById("adminBirthday").value.trim(),
    chargePhone = document.getElementById("adminChargePhone").value.trim();

  if (!name) {
    showWarning("لطفاً نام و نام خانوادگی را وارد کنید!");
    return;
  }
  if (nc && nc.length !== 10) {
    showWarning("کد ملی باید دقیقاً 10 رقم باشد!");
    return;
  }
  if (phone && (!phone.startsWith("09") || phone.length !== 11)) {
    showWarning("شماره موبایل باید با 09 شروع شود و دقیقاً 11 رقم باشد!");
    return;
  }
  if (chargePhone && (!chargePhone.startsWith("09") || chargePhone.length !== 11)) {
    showWarning("شماره موبایل برای شارژ باید با 09 شروع شود و دقیقاً 11 رقم باشد!");
    return;
  }

  localStorage.setItem(
    "adminProfile",
    JSON.stringify({ name, nc, phone, birthday, chargePhone }),
  );
  document.getElementById("profileNameDisplay").textContent = name;
  showMsg("اطلاعات پروفایل با موفقیت ذخیره شد!");
};

// Validation
const adminNationalCode = document.getElementById("adminNationalCode"),
  adminPhone = document.getElementById("adminPhone");
if (adminNationalCode)
  adminNationalCode.addEventListener("input", (e) => {
    let val = faToEn(e.target.value);
    e.target.value = val.replace(/[^0-9]/g, "").substring(0, 10);
  });
if (adminPhone)
  adminPhone.addEventListener("input", (e) => {
    let val = faToEn(e.target.value);
    e.target.value = val.replace(/[^0-9]/g, "").substring(0, 11);
  });

// Logo Settings
const logoImageInput = document.getElementById("logoImageInput"),
  faviconInput = document.getElementById("faviconInput");
if (logoImageInput)
  logoImageInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!checkFileSize(file)) {
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        localStorage.setItem("logoImage", ev.target.result);
        document.getElementById("logoImageName").textContent =
          file.name.length > 15
            ? file.name.substring(0, 15) + "..."
            : file.name;
        updateLogoDisplay();
        showMsg("تصویر لوگو آپلود شد!");
      };
      reader.readAsDataURL(file);
    }
  });
if (faviconInput)
  faviconInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!checkFileSize(file)) {
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        localStorage.setItem("favicon", ev.target.result);
        document.getElementById("faviconName").textContent =
          file.name.length > 15
            ? file.name.substring(0, 15) + "..."
            : file.name;
        const prev = document.getElementById("faviconPreview");
        prev.innerHTML = `<img src="${ev.target.result}" alt="Favicon">`;
        showMsg("آیکون آپلود شد!");
      };
      reader.readAsDataURL(file);
    }
  });

// Save Logo Settings
const saveLogoSettings = () => {
  const schoolName = document.getElementById("schoolName").value.trim(),
    logoTextColor = document.getElementById("logoTextColorValue").textContent,
    logoDisplayMode = document.getElementById("logoDisplayMode").value,
    logoDirection = document.getElementById("logoDirection").value,
    siteLanguage = document.getElementById("siteLanguage").value,
    pageDirection = document.getElementById("pageDirection").value;
  if (!schoolName) {
    showWarning("لطفاً نام مدرسه را وارد کنید!");
    return;
  }
  const logoImage = localStorage.getItem("logoImage");
  if (
    (logoDisplayMode === "image" || logoDisplayMode === "both") &&
    !logoImage
  ) {
    showWarning(
      "شما حالت نمایش لوگو را روی تصویر یا متن+تصویر گذاشته‌اید، اما هیچ عکسی آپلود نکرده‌اید!",
    );
    return;
  }
  localStorage.setItem("schoolName", schoolName);
  localStorage.setItem("logoTextColor", logoTextColor);
  localStorage.setItem("logoDisplayMode", logoDisplayMode);
  localStorage.setItem("logoDirection", logoDirection);
  localStorage.setItem("siteLanguage", siteLanguage);
  localStorage.setItem("pageDirection", pageDirection);
  document
    .querySelectorAll(".logo-text")
    .forEach((el) => (el.textContent = schoolName));
  document.title = `تنظیمات - مدرسه ${schoolName}`;
  const favicon = localStorage.getItem("favicon");
  if (favicon) {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = favicon;
  }
  updateLogoDisplay();
  applyPageDirection(pageDirection);
  showMsg("تنظیمات لوگو با موفقیت ذخیره شد!");
};

// Update Logo Display
const updateLogoDisplay = () => {
  const mode = document.getElementById("logoDisplayMode")?.value || "text",
    logoImage = localStorage.getItem("logoImage"),
    schoolName = document.getElementById("schoolName")?.value || "بوربور",
    direction = document.getElementById("logoDirection")?.value || "rtl";

  const logoTextColor = localStorage.getItem("logoTextColor") || "#ffffff";

  // --- پیش‌نمایش ---
  const previewLogoImage = document.getElementById("previewLogoImage");
  const previewLogoText = document.getElementById("previewLogoText");
  const previewLogo = document.getElementById("previewLogo");

  if (previewLogo) {
    previewLogo.style.flexDirection = direction === "ltr" ? "row-reverse" : "row";
  }

  // --- Sidebar اصلی ---
  const mainLogoImage = document.getElementById("mainLogoImage");
  const mainLogoText = document.getElementById("mainLogoText");
  const mainLogo = document.getElementById("mainLogo");

  if (mainLogo) {
    mainLogo.style.flexDirection = direction === "ltr" ? "row-reverse" : "row";
  }

  // اعمال روی هر دو (preview + sidebar اصلی)
  const pairs = [
    { img: previewLogoImage, text: previewLogoText },
    { img: mainLogoImage,    text: mainLogoText    },
  ];

  pairs.forEach(({ img, text }) => {
    if (!img || !text) return;

    if (mode === "text") {
      img.style.display = "none";
      text.style.display = "inline";
      text.textContent = schoolName;
    } else if (mode === "image") {
      if (logoImage) {
        img.src = logoImage;
        img.style.display = "inline";
      }
      text.style.display = "none";
    } else { // both
      if (logoImage) {
        img.src = logoImage;
        img.style.display = "inline";
      }
      text.style.display = "inline";
      text.textContent = schoolName;
    }

    text.style.color = logoTextColor;
  });
};

// Update Page Direction (Live Preview)
const updatePageDirection = () => {
  const direction = document.getElementById("pageDirection").value;
  applyPageDirection(direction);
};

// Apply Page Direction
const applyPageDirection = (direction) => {
  document.body.setAttribute("dir", direction);
  document.documentElement.setAttribute("dir", direction);
  const isMobile = window.innerWidth <= 768;
  if (isMobile) return;
  const sidebar = document.querySelector(".sidebar"),
    mainContent = document.querySelector(".main-content"),
    menuToggle = document.querySelector(".menu-toggle");
  if (direction === "ltr") {
    if (sidebar) {
      sidebar.style.right = "auto";
      sidebar.style.left = "0";
      sidebar.style.borderLeft = "none";
      sidebar.style.borderRight = "1px solid rgba(255,255,255,0.1)";
    }
    if (mainContent) {
      mainContent.style.marginRight = "0";
      mainContent.style.marginLeft = "280px";
    }
    if (menuToggle) {
      menuToggle.style.right = "auto";
      menuToggle.style.left = "20px";
    }
  } else {
    if (sidebar) {
      sidebar.style.right = "0";
      sidebar.style.left = "auto";
      sidebar.style.borderRight = "none";
      sidebar.style.borderLeft = "1px solid rgba(255,255,255,0.1)";
    }
    if (mainContent) {
      mainContent.style.marginLeft = "0";
      mainContent.style.marginRight = "280px";
    }
    if (menuToggle) {
      menuToggle.style.left = "auto";
      menuToggle.style.right = "20px";
    }
  }
};

// Themes
const themes = {
  blue: {
    bgColor: "#202b59",
    sidebarColor: "#172047",
    textColor: "#ffffff",
    inputColor: "#1e2957",
    activeMenuColor: "#202b59",
    hoverColor: "#2a3f6b",
    buttonColor: "#139781",
    dangerButtonColor: "#e74c3c",
    scrollbarColor: "#3498db",
  },
  dark: {
    bgColor: "#1a1a2e",
    sidebarColor: "#16213e",
    textColor: "#e0e0e0",
    inputColor: "#0f3460",
    activeMenuColor: "#0f3460",
    hoverColor: "#1a2a4a",
    buttonColor: "#3498db",
    dangerButtonColor: "#e74c3c",
    scrollbarColor: "#2980b9",
  },
  green: {
    bgColor: "#064e3b",
    sidebarColor: "#065f46",
    textColor: "#ffffff",
    inputColor: "#047857",
    activeMenuColor: "#047857",
    hoverColor: "#0a6e5c",
    buttonColor: "#10b981",
    dangerButtonColor: "#dc2626",
    scrollbarColor: "#059669",
  },
  purple: {
    bgColor: "#f8f9fa",
    sidebarColor: "#ffffff",
    textColor: "#2d3748",
    inputColor: "#e2e8f0",
    activeMenuColor: "#6b21a8",
    hoverColor: "#f3f4f6",
    buttonColor: "#7c3aed",
    dangerButtonColor: "#dc2626",
    scrollbarColor: "#a78bfa",
  },
};

const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return;
  [
    "bgColor",
    "sidebarColor",
    "textColor",
    "inputColor",
    "activeMenuColor",
    "hoverColor",
    "buttonColor",
    "dangerButtonColor",
    "scrollbarColor",
  ].forEach((key) => {
    const valueEl = document.getElementById(key + "Value");
    const previewEl = document.getElementById(key + "Preview");
    if (valueEl && previewEl) {
      valueEl.textContent = theme[key];
      previewEl.style.background = theme[key];
    }
  });
  updatePreview();
  saveThemeSettings(themeName, theme);
  applyToCurrentPage(theme);
  document
    .querySelectorAll(".theme-card")
    .forEach((card) => card.classList.remove("active"));
  document.querySelector(`[data-theme="${themeName}"]`)?.classList.add("active");
  showMsg(
    `تم ${{ blue: "آبی", dark: "تیره", green: "سبز", purple: "بنفش سلطنتی" }[themeName]} با موفقیت اعمال شد!`,
  );
};

// Save Custom Settings
const saveCustomSettings = () => {
  const settings = {
    font: document.getElementById("fontSelect").value,
    bgColor: document.getElementById("bgColorValue").textContent,
    sidebarColor: document.getElementById("sidebarColorValue").textContent,
    textColor: document.getElementById("textColorValue").textContent,
    inputColor: document.getElementById("inputColorValue").textContent,
    activeMenuColor: document.getElementById("activeMenuColorValue").textContent,
    hoverColor: document.getElementById("hoverColorValue").textContent,
    buttonColor: document.getElementById("buttonColorValue").textContent,
    dangerButtonColor: document.getElementById("dangerButtonColorValue").textContent,
    scrollbarColor: document.getElementById("scrollbarColorValue").textContent,
    // BUG FIX: these three fields were missing from saveCustomSettings
    enableShadow: document.getElementById("enableShadow").checked,
    shadowColor: document.getElementById("shadowColorValue").textContent,
    shadowOpacity: document.getElementById("shadowOpacity").value,
    isCustom: true,
  };
  localStorage.setItem("themeSettings", JSON.stringify(settings));
  applyToCurrentPage(settings);
  document
    .querySelectorAll(".theme-card")
    .forEach((card) => card.classList.remove("active"));
  showMsg("تنظیمات سفارشی با موفقیت اعمال شد!");
};

// Update Preview
const updatePreview = () => {
  const font = document.getElementById("fontSelect").value,
    bgColor = document.getElementById("bgColorValue").textContent,
    sidebarColor = document.getElementById("sidebarColorValue").textContent,
    textColor = document.getElementById("textColorValue").textContent,
    inputColor = document.getElementById("inputColorValue").textContent,
    activeMenuColor = document.getElementById("activeMenuColorValue").textContent,
    buttonColor = document.getElementById("buttonColorValue").textContent,
    scrollbarColor = document.getElementById("scrollbarColorValue").textContent,
    logoTextColor = document.getElementById("logoTextColorValue").textContent;
  const pc = document.getElementById("previewContainer"),
    ps = document.getElementById("previewSidebar"),
    pcon = document.getElementById("previewContent");
  pc.style.fontFamily = `"${font}",sans-serif`;
  pcon.style.background = bgColor;
  ps.style.background = sidebarColor;
  document.getElementById("previewTitle").style.color = textColor;
  document.getElementById("previewText").style.color = textColor;
  document
    .querySelectorAll(".preview-menu-item")
    .forEach((item) => (item.style.color = textColor));
  const previewLogo = document.querySelector(".preview-logo");
  const previewLogoText = document.querySelector(".preview-logo .logo-text");
  if (previewLogo) previewLogo.style.color = logoTextColor;
  if (previewLogoText) previewLogoText.style.color = logoTextColor;
  document.getElementById("previewInput").style.background = inputColor;
  document.getElementById("previewButton").style.background = buttonColor;
  document.querySelector(".preview-menu-active").style.background =
    activeMenuColor;
};

// Apply To Current Page
const applyToCurrentPage = (settings) => {
  const body = document.body,
    sidebar = document.querySelector(".sidebar");
  if (settings.font) body.style.fontFamily = `"${settings.font}",sans-serif`;
  if (settings.bgColor) {
    body.style.background = settings.bgColor;
    document.querySelectorAll(".settings-section").forEach((section) => {
      const rgb = hexToRgb(settings.bgColor);
      section.style.background = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
    });
  }
  if (settings.sidebarColor && sidebar)
    sidebar.style.background = settings.sidebarColor;
  if (settings.textColor)
    document
      .querySelectorAll(".page-title,.section-title,.form-label,.menu-item a")
      .forEach((el) => (el.style.color = settings.textColor));
if (settings.inputColor)
  applyStyleTag(
    "custom-input-style",
    `.form-input,
     .form-select,
     .preview-input,
     .color-display,
     .upload-btn-custom,
     .favicon-preview,
     .range-input,
     .theme-name {
       background:${settings.inputColor}!important
     }
     .color-display span, .color-display i {
       color: #fff !important;
     }`,
  );
  if (settings.activeMenuColor)
    applyStyleTag(
      "custom-active-menu-style",
      `.menu-item.active a,.preview-menu-active{background:${settings.activeMenuColor}!important}`,
    );
  if (settings.hoverColor)
    applyStyleTag(
      "custom-hover-style",
      `.menu-item a:hover,.preview-menu-item:hover{background:${settings.hoverColor}!important}`,
    );
  if (settings.buttonColor) {
    const rgb = hexToRgb(settings.buttonColor),
      darker = `rgb(${Math.max(0, rgb.r - 30)},${Math.max(0, rgb.g - 30)},${Math.max(0, rgb.b - 30)})`;
    applyStyleTag(
      "custom-button-style",
      `.btn-save,.btn-charge,.preview-btn{background:linear-gradient(90deg,${settings.buttonColor},${darker})!important}.btn-save:hover,.btn-charge:hover,.preview-btn:hover{background:linear-gradient(90deg,${darker},${settings.buttonColor})!important}`,
    );
  }
  if (settings.dangerButtonColor) {
    const rgb = hexToRgb(settings.dangerButtonColor),
      darker = `rgb(${Math.max(0, rgb.r - 30)},${Math.max(0, rgb.g - 30)},${Math.max(0, rgb.b - 30)})`;
    applyStyleTag(
      "custom-danger-button-style",
      `.btn-reset,.modal-btn-confirm{background:linear-gradient(90deg,${settings.dangerButtonColor},${darker})!important}.btn-reset:hover,.modal-btn-confirm:hover{background:linear-gradient(90deg,${darker},${settings.dangerButtonColor})!important}`,
    );
  }
  if (settings.scrollbarColor)
    applyStyleTag(
      "custom-scrollbar-style",
      `*{scrollbar-color:${settings.scrollbarColor} #172047!important}::-webkit-scrollbar-thumb{background:${settings.scrollbarColor}!important}`,
    );
  const logoTextColor = localStorage.getItem("logoTextColor") || "#ffffff";
  document
    .querySelectorAll(".logo-text")
    .forEach((el) => (el.style.color = logoTextColor));
  if (settings.enableShadow) {
    const rgba = hexToRgb(settings.shadowColor || "#000000");
    const opacity = (parseInt(settings.shadowOpacity) || 30) / 100;
    applyStyleTag(
      "custom-shadow-style",
      `.btn-save:hover,.btn-charge:hover,.btn-reset:hover,.preview-btn:hover{box-shadow:0 5px 15px rgba(${rgba.r},${rgba.g},${rgba.b},${opacity})!important}`,
    );
  } else {
    applyStyleTag("custom-shadow-style", "");
  }
};

const applyStyleTag = (id, css) => {
  let style = document.getElementById(id);
  if (style) style.remove();
  if (css) {
    style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
};

// Save Theme Settings
const saveThemeSettings = (themeName, theme) => {
  const settings = {
    themeName,
    font: document.getElementById("fontSelect").value,
    // BUG FIX: also persist shadow settings when saving a preset theme
    enableShadow: document.getElementById("enableShadow").checked,
    shadowColor: document.getElementById("shadowColorValue").textContent,
    shadowOpacity: document.getElementById("shadowOpacity").value,
    ...theme,
  };
  localStorage.setItem("themeSettings", JSON.stringify(settings));
};

// Load Saved Settings
const loadSavedSettings = () => {
  const savedProfile = localStorage.getItem("adminProfile");
  if (savedProfile) {
    try {
      const p = JSON.parse(savedProfile);
      document.getElementById("adminName").value = p.name || "";
      document.getElementById("adminNationalCode").value = p.nc || "";
      document.getElementById("adminPhone").value = p.phone || "";
      document.getElementById("adminBirthday").value = p.birthday || "";
      document.getElementById("adminChargePhone").value = p.chargePhone || "";
      document.getElementById("profileNameDisplay").textContent =
        p.name || "آقای بیارش";
    } catch (_) {}
  }

  // Update balance display
  updateBalanceDisplay();

  const savedImage = localStorage.getItem("profileImage");
  if (savedImage && profileImage) profileImage.src = savedImage;
  const schoolName = localStorage.getItem("schoolName") || "بوربور";
  document.getElementById("schoolName").value = schoolName;
  document
    .querySelectorAll(".logo-text")
    .forEach((el) => (el.textContent = schoolName));
  document.title = `تنظیمات - مدرسه ${schoolName}`;
  const logoTextColor = localStorage.getItem("logoTextColor") || "#ffffff";
  document.getElementById("logoTextColorValue").textContent = logoTextColor;
  document.getElementById("logoTextColorPreview").style.background =
    logoTextColor;
  const logoDisplayMode = localStorage.getItem("logoDisplayMode") || "text";
  document.getElementById("logoDisplayMode").value = logoDisplayMode;
  const logoDirection = localStorage.getItem("logoDirection") || "rtl";
  document.getElementById("logoDirection").value = logoDirection;
  const siteLanguage = localStorage.getItem("siteLanguage") || "fa";
  document.getElementById("siteLanguage").value = siteLanguage;
  const pageDirection = localStorage.getItem("pageDirection") || "rtl";
  document.getElementById("pageDirection").value = pageDirection;
  applyPageDirection(pageDirection);
  updateLogoDisplay();
  const favicon = localStorage.getItem("favicon");
  if (favicon) {
    let link = document.querySelector("link[rel*='icon']");
    if (link) link.href = favicon;
    const prev = document.getElementById("faviconPreview");
    if (prev) prev.innerHTML = `<img src="${favicon}" alt="Favicon">`;
  }
  const savedTheme = localStorage.getItem("themeSettings");
  const defaults = {
    bgColor: "#202b59",
    sidebarColor: "#172047",
    textColor: "#ffffff",
    inputColor: "#1e2957",
    activeMenuColor: "#202b59",
    hoverColor: "#2a3f6b",
    buttonColor: "#139781",
    dangerButtonColor: "#e74c3c",
    scrollbarColor: "#3498db",
  };
  if (savedTheme) {
    try {
      const theme = JSON.parse(savedTheme);
      if (theme.font) document.getElementById("fontSelect").value = theme.font;
      [
        "bgColor",
        "sidebarColor",
        "textColor",
        "inputColor",
        "activeMenuColor",
        "hoverColor",
        "buttonColor",
        "dangerButtonColor",
        "scrollbarColor",
      ].forEach((key) => {
        if (theme[key]) {
          const valueEl = document.getElementById(key + "Value");
          const previewEl = document.getElementById(key + "Preview");
          if (valueEl && previewEl) {
            valueEl.textContent = theme[key];
            previewEl.style.background = theme[key];
          }
        }
      });
      // BUG FIX: load enableShadow as boolean correctly (was broken when stored as string "true"/"false")
      if (theme.enableShadow !== undefined)
        document.getElementById("enableShadow").checked =
          theme.enableShadow === true || theme.enableShadow === "true";
      if (theme.shadowColor) {
        document.getElementById("shadowColorValue").textContent = theme.shadowColor;
        document.getElementById("shadowColorPreview").style.background = theme.shadowColor;
      }
      if (theme.shadowOpacity !== undefined) {
        document.getElementById("shadowOpacity").value = theme.shadowOpacity;
        document.getElementById("shadowOpacityValue").textContent =
          theme.shadowOpacity + "%";
      }
      toggleShadowInputs();
      updatePreview();
      applyToCurrentPage(theme);
      if (theme.themeName && !theme.isCustom)
        document
          .querySelector(`[data-theme="${theme.themeName}"]`)
          ?.classList.add("active");
    } catch (_) {
      // BUG FIX: if JSON is corrupt, fall back to defaults gracefully
      applyDefaultTheme(defaults);
    }
  } else {
    applyDefaultTheme(defaults);
  }
};

// BUG FIX: extracted helper to avoid code duplication
const applyDefaultTheme = (defaults) => {
  [
    "bgColor",
    "sidebarColor",
    "textColor",
    "inputColor",
    "activeMenuColor",
    "hoverColor",
    "buttonColor",
    "dangerButtonColor",
    "scrollbarColor",
  ].forEach((key) => {
    const valueEl = document.getElementById(key + "Value");
    const previewEl = document.getElementById(key + "Preview");
    if (valueEl && previewEl) {
      valueEl.textContent = defaults[key];
      previewEl.style.background = defaults[key];
    }
  });
  updatePreview();
  applyToCurrentPage(defaults);
};

// Toggle Shadow Inputs
const toggleShadowInputs = () => {
  const enabled = document.getElementById("enableShadow").checked;
  document.getElementById("shadowColorGroup").style.opacity = enabled ? "1" : "0.5";
  document.getElementById("shadowOpacityGroup").style.opacity = enabled ? "1" : "0.5";
  document.getElementById("shadowColorGroup").style.pointerEvents = enabled ? "auto" : "none";
  document.getElementById("shadowOpacityGroup").style.pointerEvents = enabled ? "auto" : "none";
};

// Update Shadow Opacity
const updateShadowOpacity = () => {
  const val = document.getElementById("shadowOpacity").value;
  document.getElementById("shadowOpacityValue").textContent = val + "%";
};

// Reset Modal
const openResetModal = () => {
  document.getElementById("resetModal").classList.add("active");
};
const closeResetModal = () => {
  document.getElementById("resetModal").classList.remove("active");
};
const confirmReset = () => {
  resetToDefault();
  closeResetModal();
};
document.getElementById("resetModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeResetModal();
});

// Reset To Default
const resetToDefault = () => {
  localStorage.clear();
  document.getElementById("adminName").value = "آقای بیارش";
  document.getElementById("adminNationalCode").value = "";
  document.getElementById("adminPhone").value = "";
  document.getElementById("adminBirthday").value = "";
  document.getElementById("adminChargePhone").value = "";
  document.getElementById("chargeAmount").value = "";
  document.getElementById("customAmount").value = "";
  toggleCustomAmount();
  document.getElementById("profileNameDisplay").textContent = "آقای بیارش";
  updateBalanceDisplay();
  if (profileImage) profileImage.src = "../image/default-avatar.png";
  document.getElementById("schoolName").value = "بوربور";
  document
    .querySelectorAll(".logo-text")
    .forEach((el) => (el.textContent = "بوربور"));
  document.title = "تنظیمات - مدرسه بوربور";

  // BUG FIX: logoTextColor was in defaults but the loop below didn't include it,
  // causing logoTextColor to never be reset. Now handled separately.
  const defaults = {
    bgColor: "#202b59",
    sidebarColor: "#172047",
    textColor: "#ffffff",
    inputColor: "#1e2957",
    activeMenuColor: "#202b59",
    hoverColor: "#2a3f6b",
    buttonColor: "#139781",
    dangerButtonColor: "#e74c3c",
    scrollbarColor: "#3498db",
  };

  [
    "bgColor",
    "sidebarColor",
    "textColor",
    "inputColor",
    "activeMenuColor",
    "hoverColor",
    "buttonColor",
    "dangerButtonColor",
    "scrollbarColor",
  ].forEach((key) => {
    const valueEl = document.getElementById(key + "Value");
    const previewEl = document.getElementById(key + "Preview");
    if (valueEl && previewEl) {
      valueEl.textContent = defaults[key];
      previewEl.style.background = defaults[key];
    }
  });

  // BUG FIX: reset logoTextColor separately and correctly
  const logoTextColorValueEl = document.getElementById("logoTextColorValue");
  const logoTextColorPreviewEl = document.getElementById("logoTextColorPreview");
  if (logoTextColorValueEl) logoTextColorValueEl.textContent = "#ffffff";
  if (logoTextColorPreviewEl) logoTextColorPreviewEl.style.background = "#ffffff";

  document.getElementById("fontSelect").value = "Vazirmatn";
  document.getElementById("logoDisplayMode").value = "text";
  document.getElementById("logoDirection").value = "rtl";
  document.getElementById("siteLanguage").value = "fa";
  document.getElementById("pageDirection").value = "rtl";
  applyPageDirection("rtl");
  document.getElementById("enableShadow").checked = true;
  document.getElementById("shadowColorValue").textContent = "#000000";
  document.getElementById("shadowColorPreview").style.background = "#000000";
  document.getElementById("shadowOpacity").value = "30";
  document.getElementById("shadowOpacityValue").textContent = "30%";
  document
    .querySelectorAll(".theme-card")
    .forEach((card) => card.classList.remove("active"));
  toggleShadowInputs();
  updatePreview();
  applyToCurrentPage({
    ...defaults,
    font: "Vazirmatn",
    enableShadow: true,
    shadowColor: "#000000",
    shadowOpacity: 30,
  });
  updateLogoDisplay();
  [
    "custom-button-style",
    "custom-danger-button-style",
    "custom-scrollbar-style",
    "custom-shadow-style",
    "custom-input-style",
    "custom-active-menu-style",
    "custom-hover-style",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  const faviconPrev = document.getElementById("faviconPreview");
  if (faviconPrev) faviconPrev.innerHTML = "";
  document.getElementById("logoImageName").textContent = "آپلود تصویر";
  document.getElementById("faviconName").textContent = "آپلود آیکون";
  let link = document.querySelector("link[rel*='icon']");
  if (link) link.href = "../image/iconB.png";
  showMsg("تمام تنظیمات به حالت پیش‌فرض بازگشت!");
};

// Init
window.addEventListener("DOMContentLoaded", () => {
  loadSavedSettings();
  if (typeof jalaliDatepicker !== "undefined")
    jalaliDatepicker.startWatch({
      selector: "input[data-jdp]",
      observer: true,
      closeAfterSelect: true,
      autoFill: true,
      showPlaceholder: true,
    });
});
window.addEventListener("resize", () => {
  const pageDirection = localStorage.getItem("pageDirection") || "rtl";
  applyPageDirection(pageDirection);
  const sidebar = document.querySelector(".sidebar"),
    sidebarOverlay = document.querySelector(".sidebar-overlay");
  if (window.innerWidth > 768 && sidebar) {
    sidebar.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
  }
});

// ==================== SIDEBAR SUBMENU TOGGLE ====================

const initSubmenus = () => {
  const submenuItems = document.querySelectorAll(".menu-item.has-submenu");

  submenuItems.forEach((item) => {
    const link = item.querySelector("a.menu-link");
    if (!link) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();

      const isOpen = item.classList.contains("open");

      // بستن سایر زیرمنوهای باز
      submenuItems.forEach((other) => {
        if (other !== item) other.classList.remove("open");
      });

      // باز/بستن زیرمنوی کلیک‌شده
      item.classList.toggle("open", !isOpen);
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initSubmenus();
});