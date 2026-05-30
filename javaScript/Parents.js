// ==============================
// DATA STRUCTURE
// ==============================

const classes = {
  101: {
    number: "101",
    grade: "دهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  102: {
    number: "102",
    grade: "دهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  103: {
    number: "103",
    grade: "دهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  104: {
    number: "104",
    grade: "دهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  201: {
    number: "201",
    grade: "یازدهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  202: {
    number: "202",
    grade: "یازدهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  203: {
    number: "203",
    grade: "یازدهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  204: {
    number: "204",
    grade: "یازدهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  301: {
    number: "301",
    grade: "دوازدهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  302: {
    number: "302",
    grade: "دوازدهم",
    field: "الکترونیک",
    studentCount: 30,
    students: [],
  },
  303: {
    number: "303",
    grade: "دوازدهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  304: {
    number: "304",
    grade: "دوازدهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
  305: {
    number: "305",
    grade: "دوازدهم",
    field: "کامپیوتر",
    studentCount: 30,
    students: [],
  },
};

// Sample names for generating data
const studentFirstNames = [
  "علی",
  "محمد",
  "حسین",
  "رضا",
  "امیر",
  "مهدی",
  "سعید",
  "حامد",
  "احمد",
  "فرهاد",
  "کاوه",
  "داود",
  "بهروز",
  "مسعود",
  "سینا",
  "پوریا",
  "آرمین",
  "امیرحسین",
  "محمدرضا",
  "علیرضا",
];
const studentLastNames = [
  "احمدی",
  "محمدی",
  "حسینی",
  "کریمی",
  "رضایی",
  "نوری",
  "مرادی",
  "یوسفی",
  "رحیمی",
  "اکبری",
  "ملکی",
  "جعفری",
  "صادقی",
  "فروزان",
  "زارعی",
  "حیدری",
  "عباسی",
  "موسوی",
];
const fatherFirstNames = [
  "احمد",
  "محمود",
  "حسن",
  "علیرضا",
  "مهدی",
  "رضا",
  "امیر",
  "جواد",
  "مجید",
  "داود",
  "فرهاد",
  "بهروز",
  "مسعود",
  "کاظم",
  "ابراهیم",
  "اسماعیل",
];
const motherFirstNames = [
  "فاطمه",
  "زهرا",
  "مریم",
  "سمیه",
  "مهسا",
  "نرگس",
  "لیلا",
  "سارا",
  "نازنین",
  "الهام",
  "مینا",
  "پریسا",
  "شیدا",
  "نیلوفر",
  "زینب",
  "معصومه",
];
const educationLevels = [
  "دیپلم",
  "فوق دیپلم",
  "لیسانس",
  "فوق لیسانس",
  "دکترا",
  "زیر دیپلم",
];
const jobs = [
  "آزاد",
  "کارمند",
  "معلم",
  "مهندس",
  "پزشک",
  "کارگر",
  "بازنشسته",
  "راننده",
  "فروشنده",
  "خانه‌دار",
];

// Generate students with parent information
function generateStudents() {
  Object.keys(classes).forEach((classNum) => {
    for (let i = 1; i <= 30; i++) {
      const studentFirstName =
        studentFirstNames[Math.floor(Math.random() * studentFirstNames.length)];
      const studentLastName =
        studentLastNames[Math.floor(Math.random() * studentLastNames.length)];
      const fatherFirstName =
        fatherFirstNames[Math.floor(Math.random() * fatherFirstNames.length)];
      const motherFirstName =
        motherFirstNames[Math.floor(Math.random() * motherFirstNames.length)];

      const studentCode = classNum + String(i).padStart(3, "0");
      const nationalId = String(
        Math.floor(Math.random() * 10000000000),
      ).padStart(10, "0");
      const fatherPhone =
        "0912" + String(Math.floor(Math.random() * 10000000)).padStart(7, "0");
      const motherPhone =
        "0935" + String(Math.floor(Math.random() * 10000000)).padStart(7, "0");

      // Generate birth dates
      const fatherBirthYear = 1350 + Math.floor(Math.random() * 25);
      const motherBirthYear = 1355 + Math.floor(Math.random() * 25);
      const fatherBirthDate = `${fatherBirthYear}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
      const motherBirthDate = `${motherBirthYear}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;

      // تعیین وضعیت والدین (90% زنده، 10% فوت)
      const fatherStatus = Math.random() > 0.1 ? "alive" : "deceased";
      const motherStatus = Math.random() > 0.1 ? "alive" : "deceased";

      // Father complete info
      const fatherNationalId = String(
        Math.floor(Math.random() * 10000000000),
      ).padStart(10, "0");
      const fatherEducation =
        educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const fatherJob = jobs[Math.floor(Math.random() * jobs.length)];

      // Mother complete info
      const motherNationalId = String(
        Math.floor(Math.random() * 10000000000),
      ).padStart(10, "0");
      const motherEducation =
        educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const motherJob = jobs[Math.floor(Math.random() * jobs.length)];

      // اگر هر دو والد فوت شده باشند، اطلاعات سرپرست
      let guardianFirstName = null;
      let guardianLastName = null;
      let guardianNationalId = null;
      let guardianBirthDate = null;
      let guardianEducation = null;
      let guardianJob = null;
      let guardianPhone = null;
      let guardianRelation = null;

      if (fatherStatus === "deceased" && motherStatus === "deceased") {
        const guardianFNames = ["علی", "محمد", "حسین", "فاطمه", "زهرا", "مریم"];
        const relations = ["عمو", "دایی", "عمه", "خاله", "پدربزرگ", "مادربزرگ"];
        guardianFirstName =
          guardianFNames[Math.floor(Math.random() * guardianFNames.length)];
        guardianLastName = studentLastName;
        guardianNationalId = String(
          Math.floor(Math.random() * 10000000000),
        ).padStart(10, "0");
        const guardianBirthYear = 1340 + Math.floor(Math.random() * 30);
        guardianBirthDate = `${guardianBirthYear}/${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}/${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`;
        guardianEducation =
          educationLevels[Math.floor(Math.random() * educationLevels.length)];
        guardianJob = jobs[Math.floor(Math.random() * jobs.length)];
        guardianPhone =
          "0911" +
          String(Math.floor(Math.random() * 10000000)).padStart(7, "0");
        guardianRelation =
          relations[Math.floor(Math.random() * relations.length)];
      }

      // تعیین بدهی شهریه (70% بدهی ندارند، 30% بدهی دارند)
      const hasTuitionDebt = Math.random() > 0.7;
      const tuitionDebt = hasTuitionDebt
        ? Math.floor(Math.random() * 10) * 500000 + 500000
        : 0;

      // تعیین غیبت (80% غیبت ندارند، 20% غیبت دارند)
      const hasAbsence = Math.random() > 0.8;
      const absenceDays = hasAbsence ? Math.floor(Math.random() * 15) + 1 : 0;

      // تعیین تأخیر (85% تأخیر ندارند، 15% تأخیر دارند)
      const hasDelay = Math.random() > 0.85;
      const delayCount = hasDelay ? Math.floor(Math.random() * 10) + 1 : 0;

      classes[classNum].students.push({
        code: studentCode,
        studentFirstName: studentFirstName,
        studentLastName: studentLastName,
        studentFullName: `${studentFirstName} ${studentLastName}`,
        nationalId: nationalId,
        // Father info
        fatherFirstName: fatherFirstName,
        fatherLastName: studentLastName,
        fatherFullName: `${fatherFirstName} ${studentLastName}`,
        fatherNationalId: fatherNationalId,
        fatherBirthDate: fatherBirthDate,
        fatherEducation: fatherEducation,
        fatherJob: fatherJob,
        fatherPhone: fatherPhone,
        fatherStatus: fatherStatus,
        // Mother info
        motherFirstName: motherFirstName,
        motherLastName: studentLastName,
        motherFullName: `${motherFirstName} ${studentLastName}`,
        motherNationalId: motherNationalId,
        motherBirthDate: motherBirthDate,
        motherEducation: motherEducation,
        motherJob: motherJob,
        motherPhone: motherPhone,
        motherStatus: motherStatus,
        // Guardian info
        guardianFirstName: guardianFirstName,
        guardianLastName: guardianLastName,
        guardianFullName: guardianFirstName
          ? `${guardianFirstName} ${guardianLastName}`
          : null,
        guardianNationalId: guardianNationalId,
        guardianBirthDate: guardianBirthDate,
        guardianEducation: guardianEducation,
        guardianJob: guardianJob,
        guardianPhone: guardianPhone,
        guardianRelation: guardianRelation,
        // Student status
        tuitionDebt: tuitionDebt,
        absenceDays: absenceDays,
        delayCount: delayCount,
      });
    }
  });
}

generateStudents();

// SMS Templates
let smsTemplates = {
  absence: [],
  delay: [],
  behavior: [],
  academic: [],
  meeting: [],
  tuition: [],
  other: [],
};

// Default SMS Templates
const defaultSmsTemplates = {
  absence: [
    "با سلام، فرزند گرامی شما امروز در کلاس حضور نداشت. لطفاً دلیل غیبت را اطلاع دهید.",
    "والدین محترم، فرزندتان در روز {تاریخ} غایب بوده است. لطفاً پیگیری فرمایید.",
    "احتراماً به اطلاع می‌رساند فرزند شما در زنگ {زنگ} حضور نداشته است.",
  ],
  delay: [
    "با سلام، فرزند گرامی شما امروز با تأخیر به کلاس آمده است.",
    "والدین محترم، فرزندتان امروز {دقیقه} دقیقه تأخیر داشته است. لطفاً دقت فرمایید.",
    "احتراماً به اطلاع می‌رساند فرزند شما با تأخیر وارد کلاس شده است.",
  ],
  behavior: [
    "با سلام، خواهشمند است جهت صحبت در خصوص رفتار فرزندتان به مدرسه مراجعه فرمایید.",
    "والدین محترم، لطفاً در اسرع وقت با مدیر مدرسه تماس حاصل فرمایید.",
    "احتراماً درخواست می‌شود برای هماهنگی جلسه ملاقات با مدیر آموزشی اقدام فرمایید.",
  ],
  academic: [
    "با سلام، فرزندتان در درس {درس} عملکرد ضعیفی داشته است. لطفاً پیگیری فرمایید.",
    "والدین محترم، نمرات فرزندتان در آزمون اخیر نیازمند توجه بیشتر شماست.",
    "احتراماً به اطلاع می‌رساند فرزندتان در تکالیف درسی کوتاهی کرده است.",
  ],
  meeting: [
    "با سلام، جلسه اولیا و مربیان روز {تاریخ} ساعت {ساعت} برگزار می‌گردد. حضور شما ضروری است.",
    "والدین محترم، برای بررسی وضعیت تحصیلی فرزندتان، روز {تاریخ} به مدرسه تشریف بیاورید.",
    "احتراماً حضور شما در جلسه مشاوره روز {تاریخ} ساعت {ساعت} الزامی است.",
  ],
  tuition: [
    "با سلام والدین محترم، لطفاً جهت تسویه شهریه فرزندتان به حسابداری مدرسه مراجعه فرمایید.",
    "احتراماً به اطلاع می‌رساند شهریه ماه {ماه} فرزندتان پرداخت نشده است. لطفاً اقدام فرمایید.",
    "والدین گرامی، خواهشمند است جهت تسویه بدهی شهریه به مبلغ {مبلغ} تومان، با حسابداری تماس بگیرید.",
    "با سلام، یادآوری می‌شود که مهلت پرداخت شهریه تا تاریخ {تاریخ} می‌باشد. لطفاً اقدام فرمایید.",
    "احتراماً، شهریه ترم جاری فرزندتان معوق می‌باشد. خواهشمند است در اسرع وقت نسبت به پرداخت اقدام فرمایید.",
  ],
  other: [
    "با سلام والدین محترم، لطفاً در اسرع وقت با مدرسه تماس حاصل فرمایید.",
    "احتراماً خواهشمند است جهت هماهنگی به دفتر مدرسه مراجعه فرمایید.",
  ],
};

// SMS State
let currentSmsRecipient = null;
let currentSmsReason = null;
let currentSmsRecipientType = null; // 'father', 'mother', 'both'
let currentClassNumber = null;
let currentGradeFilter = "all";
let currentDebtFilter = "all"; // 'all', 'debt', 'no-debt'
let currentGroupFilter = "all"; // 'all', 'absence', 'delay', 'debt'

// SMS Balance (موجودی شارژ پیامک)
let smsBalance = 0;
const smsPrice = 150; // قیمت هر پیامک 150 تومان

// ==============================
// HELPER FUNCTIONS
// ==============================

function loadSmsBalance() {
  const saved = localStorage.getItem("smsBalance");
  if (saved) {
    smsBalance = parseInt(saved);
  } else {
    smsBalance = 50000; // موجودی اولیه 50 هزار تومان
    saveSmsBalance();
  }
  updateBalanceDisplay();
}

function saveSmsBalance() {
  localStorage.setItem("smsBalance", smsBalance.toString());
  updateBalanceDisplay();
}

function updateBalanceDisplay() {
  const balanceElement = document.getElementById("smsBalanceAmount");
  const balanceElement2 = document.getElementById("smsBalanceAmount2");

  if (balanceElement) {
    balanceElement.textContent = formatCurrency(smsBalance);
  }

  if (balanceElement2) {
    balanceElement2.textContent = formatCurrency(smsBalance);
  }

  // تغییر رنگ بر اساس موجودی
  const balanceBox = document.getElementById("smsBalanceBox");
  if (balanceBox) {
    if (smsBalance < 10000) {
      balanceBox.classList.add("low-balance");
      balanceBox.classList.remove("medium-balance");
    } else if (smsBalance < 50000) {
      balanceBox.classList.add("medium-balance");
      balanceBox.classList.remove("low-balance");
    } else {
      balanceBox.classList.remove("low-balance", "medium-balance");
    }
  }
}

// Charge Modal Functions
function openChargeModal() {
  document.getElementById("chargeModal").classList.add("active");

  // Reset selections
  document.querySelectorAll(".charge-option-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.getElementById("customChargeAmount").value = "";
  updateChargeButton();
}

function closeChargeModal() {
  document.getElementById("chargeModal").classList.remove("active");
}

function selectChargeOption(amount) {
  // Remove active from all buttons
  document.querySelectorAll(".charge-option-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Add active to clicked button
  event.target.closest(".charge-option-btn").classList.add("active");

  // Clear custom input
  document.getElementById("customChargeAmount").value = "";

  updateChargeButton();
}

function selectCustomCharge() {
  // Remove active from preset options
  document.querySelectorAll(".charge-option-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  updateChargeButton();
}

function updateChargeButton() {
  const customInput = document.getElementById("customChargeAmount");
  const activeOption = document.querySelector(".charge-option-btn.active");
  const chargeBtn = document.querySelector(".charge-btn-pay");

  let amount = 0;

  if (activeOption) {
    amount = parseInt(activeOption.getAttribute("data-amount"));
  } else if (customInput.value) {
    amount = parseInt(customInput.value);
  }

  if (amount > 0) {
    chargeBtn.disabled = false;
    chargeBtn.innerHTML = `
            <i class="fas fa-credit-card"></i>
            پرداخت ${formatCurrency(amount)} تومان
        `;
  } else {
    chargeBtn.disabled = true;
    chargeBtn.innerHTML = `
            <i class="fas fa-credit-card"></i>
            انتخاب مبلغ الزامی است
        `;
  }
}

function proceedToPayment() {
  const customInput = document.getElementById("customChargeAmount");
  const activeOption = document.querySelector(".charge-option-btn.active");

  let amount = 0;

  if (activeOption) {
    amount = parseInt(activeOption.getAttribute("data-amount"));
  } else if (customInput.value) {
    amount = parseInt(customInput.value);
  }

  if (amount < 10000) {
    showErrorMessage("حداقل مبلغ شارژ 10,000 تومان است!");
    return;
  }

  // Open confirmation modal
  openChargeConfirmModal(amount);
}

function openChargeConfirmModal(amount) {
  // First close charge modal
  closeChargeModal();

  const modal = document.getElementById("chargeConfirmModal");
  document.getElementById("chargeConfirmAmount").textContent =
    formatCurrency(amount);
  modal.classList.add("active");

  // Store amount for later use
  window.pendingChargeAmount = amount;
}

function closeChargeConfirmModal() {
  document.getElementById("chargeConfirmModal").classList.remove("active");
  window.pendingChargeAmount = null;
}

function confirmCharge() {
  const amount = window.pendingChargeAmount;
  if (!amount) return;

  closeChargeConfirmModal();

  // Simulate payment gateway
  showSuccessMessage("در حال انتقال به درگاه پرداخت...");

  setTimeout(() => {
    // Simulate successful payment - directly add to balance
    smsBalance += amount;
    saveSmsBalance();
    showSuccessMessage(`حساب شما ${formatCurrency(amount)} تومان شارژ شد!`);
  }, 1500);
}

function loadSmsTemplates() {
  const saved = localStorage.getItem("parentsSmsTemplates");
  if (saved) {
    smsTemplates = JSON.parse(saved);
  } else {
    smsTemplates = JSON.parse(JSON.stringify(defaultSmsTemplates));
  }
}

function saveSmsTemplatesStorage() {
  localStorage.setItem("parentsSmsTemplates", JSON.stringify(smsTemplates));
}

function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function renderClasses() {
  const grid = document.getElementById("classesGrid");
  grid.innerHTML = "";

  Object.values(classes).forEach((classData) => {
    // Apply grade filter
    if (
      currentGradeFilter !== "all" &&
      classData.grade !== currentGradeFilter
    ) {
      return;
    }

    // Count students with debt
    const studentsWithDebt = classData.students.filter(
      (s) => s.tuitionDebt > 0,
    ).length;
    const totalDebt = classData.students.reduce(
      (sum, s) => sum + s.tuitionDebt,
      0,
    );

    const card = document.createElement("div");
    card.className = "class-card";
    if (studentsWithDebt > 0) {
      card.classList.add("has-debt");
    }

    card.innerHTML = `
            <div class="class-header">
                <span class="class-number">کلاس ${classData.number}</span>
                <span class="class-grade">${classData.grade}</span>
            </div>
            <div class="class-info">
                <div class="info-row">
                    <span class="info-label">رشته:</span>
                    <span class="info-value">${classData.field}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">تعداد دانش‌آموزان:</span>
                    <span class="info-value">${classData.studentCount} نفر</span>
                </div>
                ${
                  studentsWithDebt > 0
                    ? `
                <div class="info-row debt-info">
                    <span class="info-label">بدهکاران:</span>
                    <span class="info-value debt-count">${studentsWithDebt} نفر</span>
                </div>
                <div class="info-row debt-info">
                    <span class="info-label">مجموع بدهی:</span>
                    <span class="info-value debt-amount">${formatCurrency(totalDebt)} تومان</span>
                </div>
                `
                    : ""
                }
            </div>
            <div class="class-actions">
                <button class="btn btn-view-parents" onclick="openClassParentsModal('${classData.number}')">
                    <i class="fas fa-eye"></i> مشاهده اولیا
                </button>
            </div>
        `;
    grid.appendChild(card);
  });

  if (grid.children.length === 0) {
    grid.innerHTML =
      '<div class="no-data">هیچ کلاسی با این فیلتر یافت نشد</div>';
  }
}

function openClassParentsModal(classNumber) {
  currentClassNumber = classNumber;
  currentDebtFilter = "all";
  const classData = classes[classNumber];

  document.getElementById("classModalTitle").textContent =
    `اولیای کلاس ${classNumber} - ${classData.grade} ${classData.field}`;

  // Reset debt filter buttons
  document.querySelectorAll(".debt-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document
    .querySelector('.debt-filter-btn[data-filter="all"]')
    .classList.add("active");

  renderParentsList();
  document.getElementById("classParentsModal").classList.add("active");
}

function closeClassParentsModal() {
  document.getElementById("classParentsModal").classList.remove("active");
  currentClassNumber = null;
  currentDebtFilter = "all";
  document.getElementById("modalSearchInput").value = "";
}

function filterByDebt(filter) {
  currentDebtFilter = filter;

  // Update active button
  document.querySelectorAll(".debt-filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  renderParentsList();
}

function renderParentsList() {
  if (!currentClassNumber) return;

  const classData = classes[currentClassNumber];
  const container = document.getElementById("parentsList");
  container.innerHTML = "";

  const searchTerm = document
    .getElementById("modalSearchInput")
    .value.toLowerCase()
    .trim();

  classData.students.forEach((student, index) => {
    // Apply search filter
    if (searchTerm && !isStudentMatch(student, searchTerm)) {
      return;
    }

    // Apply debt filter
    if (currentDebtFilter === "debt" && student.tuitionDebt === 0) {
      return;
    }
    if (currentDebtFilter === "no-debt" && student.tuitionDebt > 0) {
      return;
    }

    const item = document.createElement("div");
    item.className = "parent-item";
    if (student.tuitionDebt > 0) {
      item.classList.add("has-debt");
    }

    // Build warnings section
    let warningsHtml = "";
    const warnings = [];
    if (student.tuitionDebt > 0) {
      warnings.push(
        `<span class="warning-badge debt-badge"><i class="fas fa-money-bill-wave"></i> بدهی: ${formatCurrency(student.tuitionDebt)} تومان</span>`,
      );
    }
    if (student.absenceDays > 0) {
      warnings.push(
        `<span class="warning-badge absence-badge"><i class="fas fa-user-times"></i> غیبت: ${student.absenceDays} روز</span>`,
      );
    }
    if (student.delayCount > 0) {
      warnings.push(
        `<span class="warning-badge delay-badge"><i class="fas fa-clock"></i> تأخیر: ${student.delayCount} بار</span>`,
      );
    }

    if (warnings.length > 0) {
      warningsHtml = `<div class="warnings-row">${warnings.join("")}</div>`;
    }

    item.innerHTML = `
            <div class="parent-item-header">
                <div class="student-badge">
                    <i class="fas fa-user-graduate"></i>
                    ${student.studentFullName}
                </div>
                <div class="student-code">کد: ${student.code}</div>
            </div>
            ${warningsHtml}
            <div class="parent-item-body">
                <div class="parent-info-row">
                    <div class="parent-info-col">
                        <div class="parent-info-label">
                            <i class="fas fa-id-card"></i>
                            کد ملی دانش‌آموز:
                        </div>
                        <div class="parent-info-value">${student.nationalId}</div>
                    </div>
                </div>
                <div class="parent-info-row">
                    <div class="parent-info-col ${student.fatherStatus === "deceased" ? "deceased" : ""}">
                        <div class="parent-info-label">
                            <i class="fas fa-male"></i>
                            نام پدر:
                            ${student.fatherStatus === "deceased" ? '<span class="deceased-badge">فوت شده</span>' : ""}
                        </div>
                        <div class="parent-info-value">${student.fatherFullName}</div>
                    </div>
                    <div class="parent-info-col ${student.fatherStatus === "deceased" ? "deceased" : ""}">
                        <div class="parent-info-label">
                            <i class="fas fa-phone"></i>
                            شماره همراه پدر:
                        </div>
                        <div class="parent-info-value ltr-text">${student.fatherStatus === "alive" ? student.fatherPhone : "---"}</div>
                    </div>
                </div>
                <div class="parent-info-row">
                    <div class="parent-info-col ${student.motherStatus === "deceased" ? "deceased" : ""}">
                        <div class="parent-info-label">
                            <i class="fas fa-female"></i>
                            نام مادر:
                            ${student.motherStatus === "deceased" ? '<span class="deceased-badge">فوت شده</span>' : ""}
                        </div>
                        <div class="parent-info-value">${student.motherFullName}</div>
                    </div>
                    <div class="parent-info-col ${student.motherStatus === "deceased" ? "deceased" : ""}">
                        <div class="parent-info-label">
                            <i class="fas fa-phone"></i>
                            شماره همراه مادر:
                        </div>
                        <div class="parent-info-value ltr-text">${student.motherStatus === "alive" ? student.motherPhone : "---"}</div>
                    </div>
                </div>
                ${
                  student.guardianFullName
                    ? `
                <div class="parent-info-row">
                    <div class="parent-info-col guardian-info">
                        <div class="parent-info-label">
                            <i class="fas fa-user-shield"></i>
                            نام سرپرست (${student.guardianRelation}):
                        </div>
                        <div class="parent-info-value">${student.guardianFullName}</div>
                    </div>
                    <div class="parent-info-col guardian-info">
                        <div class="parent-info-label">
                            <i class="fas fa-phone"></i>
                            شماره سرپرست:
                        </div>
                        <div class="parent-info-value ltr-text">${student.guardianPhone}</div>
                    </div>
                </div>
                `
                    : ""
                }
            </div>
            <div class="parent-item-actions">
                <button class="btn-action btn-view-details" onclick="openViewParentModal('${student.code}')">
                    <i class="fas fa-info-circle"></i>
                    مشاهده جزئیات
                </button>
                <button class="btn-action btn-edit-parent" onclick="openEditParentModal('${student.code}')">
                    <i class="fas fa-edit"></i>
                    ویرایش
                </button>
                <button class="btn-action btn-sms-single" onclick="openSingleSmsModal('${student.code}')"
                    ${student.fatherStatus === "deceased" && student.motherStatus === "deceased" && !student.guardianPhone ? "disabled" : ""}>
                    <i class="fas fa-sms"></i>
                    ارسال پیامک
                </button>
            </div>
        `;
    container.appendChild(item);
  });

  if (container.children.length === 0) {
    container.innerHTML = '<div class="no-data">نتیجه‌ای یافت نشد</div>';
  }
}

function isStudentMatch(student, searchTerm) {
  return (
    student.studentFullName.toLowerCase().includes(searchTerm) ||
    student.fatherFullName.toLowerCase().includes(searchTerm) ||
    student.motherFullName.toLowerCase().includes(searchTerm) ||
    student.fatherPhone.includes(searchTerm) ||
    student.motherPhone.includes(searchTerm) ||
    student.code.includes(searchTerm) ||
    student.nationalId.includes(searchTerm)
  );
}

// ==============================
// SEARCH & FILTER
// ==============================

function searchInModal() {
  renderParentsList();
}

function globalSearch() {
  const searchTerm = document
    .getElementById("globalSearchInput")
    .value.toLowerCase()
    .trim();

  if (!searchTerm) {
    renderClasses();
    return;
  }

  const grid = document.getElementById("classesGrid");
  grid.innerHTML = "";

  Object.values(classes).forEach((classData) => {
    // اعمال فیلتر پایه
    if (
      currentGradeFilter !== "all" &&
      classData.grade !== currentGradeFilter
    ) {
      return;
    }

    const matchingStudents = classData.students.filter(
      (student) =>
        student.studentFullName.toLowerCase().includes(searchTerm) ||
        student.fatherFullName.toLowerCase().includes(searchTerm) ||
        student.motherFullName.toLowerCase().includes(searchTerm) ||
        student.fatherPhone.includes(searchTerm) ||
        student.motherPhone.includes(searchTerm) ||
        student.code.includes(searchTerm) ||
        student.nationalId.includes(searchTerm) ||
        (student.guardianFullName &&
          student.guardianFullName.toLowerCase().includes(searchTerm)) ||
        (student.guardianPhone && student.guardianPhone.includes(searchTerm)),
    );

    if (matchingStudents.length > 0) {
      const studentsWithDebt = matchingStudents.filter(
        (s) => s.tuitionDebt > 0,
      ).length;

      const card = document.createElement("div");
      card.className = "class-card search-result";
      card.innerHTML = `
                <div class="class-header">
                    <span class="class-number">کلاس ${classData.number}</span>
                    <span class="class-grade">${classData.grade}</span>
                </div>
                <div class="class-info">
                    <div class="info-row">
                        <span class="info-label">رشته:</span>
                        <span class="info-value">${classData.field}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">نتایج یافت شده:</span>
                        <span class="info-value highlight">${matchingStudents.length} نفر</span>
                    </div>
                    ${
                      studentsWithDebt > 0
                        ? `
                    <div class="info-row debt-info">
                        <span class="info-label">بدهکاران در نتایج:</span>
                        <span class="info-value debt-count">${studentsWithDebt} نفر</span>
                    </div>
                    `
                        : ""
                    }
                </div>
                <div class="class-actions">
                    <button class="btn btn-view-parents" onclick="openClassParentsModalFiltered('${classData.number}', '${searchTerm}')">
                        <i class="fas fa-eye"></i> مشاهده نتایج
                    </button>
                </div>
            `;
      grid.appendChild(card);
    }
  });

  if (grid.children.length === 0) {
    grid.innerHTML = '<div class="no-data">نتیجه‌ای یافت نشد</div>';
  }
}

function openClassParentsModalFiltered(classNumber, searchTerm) {
    openClassParentsModal(classNumber);
    // اعمال سرچ داخل مودال
    setTimeout(() => {
        const modalSearch = document.getElementById('modalSearchInput');
        if (modalSearch) {
            modalSearch.value = searchTerm;
            renderParentsList();
        }
    }, 100);
}

function filterByGrade(grade) {
  currentGradeFilter = grade;

  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  document.getElementById("globalSearchInput").value = "";
  renderClasses();
}

// ==============================
// SMS FUNCTIONALITY
// ==============================

function openSingleSmsModal(studentCode) {
  const classData = classes[currentClassNumber];
  const student = classData.students.find((s) => s.code === studentCode);

  if (!student) return;

  // Check if both parents are deceased and no guardian
  if (
    student.fatherStatus === "deceased" &&
    student.motherStatus === "deceased" &&
    !student.guardianPhone
  ) {
    alert(
      "هر دو والد این دانش‌آموز فوت کرده‌اند و سرپرستی تعریف نشده است. امکان ارسال پیامک وجود ندارد.",
    );
    return;
  }

  currentSmsRecipient = student;
  currentSmsReason = null;
  currentSmsRecipientType = null;

  loadSmsTemplates();

  document.getElementById("smsModalTitle").textContent = "ارسال پیامک به اولیا";

  const recipientInfo = document.getElementById("smsRecipientInfo");

  let phonesHTML = "";

  // Father info
  if (student.fatherStatus === "alive") {
    phonesHTML += `
        <div class="phone-item">
            <i class="fas fa-male"></i>
            <span>پدر: ${student.fatherFullName}</span>
            <span class="ltr-text">${student.fatherPhone}</span>
        </div>
        `;
  } else {
    phonesHTML += `
        <div class="phone-item deceased">
            <i class="fas fa-male"></i>
            <span>پدر: ${student.fatherFullName}</span>
            <span class="deceased-badge">فوت شده</span>
        </div>
        `;
  }

  // Mother info
  if (student.motherStatus === "alive") {
    phonesHTML += `
        <div class="phone-item">
            <i class="fas fa-female"></i>
            <span>مادر: ${student.motherFullName}</span>
            <span class="ltr-text">${student.motherPhone}</span>
        </div>
        `;
  } else {
    phonesHTML += `
        <div class="phone-item deceased">
            <i class="fas fa-female"></i>
            <span>مادر: ${student.motherFullName}</span>
            <span class="deceased-badge">فوت شده</span>
        </div>
        `;
  }

  // Guardian info
  if (student.guardianPhone) {
    phonesHTML += `
        <div class="phone-item guardian">
            <i class="fas fa-user-shield"></i>
            <span>سرپرست (${student.guardianRelation}): ${student.guardianFullName}</span>
            <span class="ltr-text">${student.guardianPhone}</span>
        </div>
        `;
  }

  recipientInfo.innerHTML = `
        <div class="sms-student-info">
            <div class="sms-student-avatar">${student.studentFirstName.charAt(0)}</div>
            <div class="sms-student-details">
                <div class="sms-student-name">${student.studentFullName}</div>
                <div class="sms-student-code">کلاس ${currentClassNumber} - کد: ${student.code}</div>
            </div>
        </div>
        <div class="parent-phones-info">
            ${phonesHTML}
        </div>
    `;

  document.getElementById("smsRecipientSelect").style.display = "block";

  // Setup recipient buttons based on parent status
  const recipientButtons = document.querySelector(".recipient-buttons");
  recipientButtons.innerHTML = "";

  if (student.fatherStatus === "alive") {
    recipientButtons.innerHTML += `
            <button class="recipient-btn" data-recipient="father" onclick="selectRecipient('father')">
                <i class="fas fa-male"></i>
                پدر
            </button>
        `;
  }

  if (student.motherStatus === "alive") {
    recipientButtons.innerHTML += `
            <button class="recipient-btn" data-recipient="mother" onclick="selectRecipient('mother')">
                <i class="fas fa-female"></i>
                مادر
            </button>
        `;
  }

  if (student.guardianPhone) {
    recipientButtons.innerHTML += `
            <button class="recipient-btn" data-recipient="guardian" onclick="selectRecipient('guardian')">
                <i class="fas fa-user-shield"></i>
                سرپرست
            </button>
        `;
  }

  if (student.fatherStatus === "alive" && student.motherStatus === "alive") {
    recipientButtons.innerHTML += `
            <button class="recipient-btn" data-recipient="both" onclick="selectRecipient('both')">
                <i class="fas fa-users"></i>
                هر دو
            </button>
        `;
  }

  if (
    student.fatherStatus === "alive" &&
    student.motherStatus === "alive" &&
    student.guardianPhone
  ) {
    recipientButtons.innerHTML += `
            <button class="recipient-btn" data-recipient="all" onclick="selectRecipient('all')">
                <i class="fas fa-users"></i>
                همه
            </button>
        `;
  }

  document.getElementById("smsMessage").value = "";
  updateCharCount();

  document.querySelectorAll(".sms-reason-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  renderQuickMessages();

  document.getElementById("smsModal").classList.add("active");
}

function openClassGroupSmsModal() {
  if (!currentClassNumber) return;

  const classData = classes[currentClassNumber];
  currentSmsRecipient = null;
  currentSmsReason = null;
  currentSmsRecipientType = null;
  currentGroupFilter = "all";

  loadSmsTemplates();

  document.getElementById("smsModalTitle").textContent =
    "ارسال پیامک گروهی به کلاس";

  const recipientInfo = document.getElementById("smsRecipientInfo");
  recipientInfo.innerHTML = `
        <div class="sms-student-info">
            <div class="sms-student-avatar"><i class="fas fa-users"></i></div>
            <div class="sms-student-details">
                <div class="sms-student-name">کلاس ${classData.number} - ${classData.grade} ${classData.field}</div>
                <div class="sms-recipients-count">${classData.students.length} دانش‌آموز در این کلاس</div>
            </div>
        </div>
    `;

  document.getElementById("smsRecipientSelect").style.display = "block";

  // Reset recipient buttons
  const recipientButtons = document.querySelector(".recipient-buttons");
  recipientButtons.innerHTML = `
        <button class="recipient-btn" data-recipient="father" onclick="selectRecipient('father')">
            <i class="fas fa-male"></i>
            پدر
        </button>
        <button class="recipient-btn" data-recipient="mother" onclick="selectRecipient('mother')">
            <i class="fas fa-female"></i>
            مادر
        </button>
        <button class="recipient-btn" data-recipient="both" onclick="selectRecipient('both')">
            <i class="fas fa-users"></i>
            هر دو
        </button>
    `;

  document.querySelectorAll(".recipient-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById("smsMessage").value = "";
  updateCharCount();

  document.querySelectorAll(".sms-reason-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  renderQuickMessages();

  document.getElementById("smsModal").classList.add("active");
}

function openGroupSmsModal() {
  currentSmsRecipient = null;
  currentSmsReason = null;
  currentSmsRecipientType = null;
  currentGroupFilter = "all";

  loadSmsTemplates();

  let totalStudents = 0;
  Object.values(classes).forEach((c) => {
    totalStudents += c.students.length;
  });

  document.getElementById("smsModalTitle").textContent =
    "ارسال پیامک گروهی به همه اولیا";

  const recipientInfo = document.getElementById("smsRecipientInfo");
  recipientInfo.innerHTML = `
        <div class="sms-student-info">
            <div class="sms-student-avatar"><i class="fas fa-school"></i></div>
            <div class="sms-student-details">
                <div class="sms-student-name">همه کلاس‌ها</div>
                <div class="sms-recipients-count">${totalStudents} دانش‌آموز در مدرسه</div>
            </div>
        </div>
        
        <div class="group-filter-section">
            <label class="form-label">
                <i class="fas fa-filter"></i>
                فیلتر گروهی:
            </label>
            <div class="group-filter-buttons">
                <button class="group-filter-btn active" data-filter="all" onclick="selectGroupFilter('all')">
                    <i class="fas fa-users"></i>
                    همه
                </button>
                <button class="group-filter-btn" data-filter="absence" onclick="selectGroupFilter('absence')">
                    <i class="fas fa-user-times"></i>
                    غیبت دارند
                </button>
                <button class="group-filter-btn" data-filter="delay" onclick="selectGroupFilter('delay')">
                    <i class="fas fa-clock"></i>
                    تأخیر دارند
                </button>
                <button class="group-filter-btn" data-filter="debt" onclick="selectGroupFilter('debt')">
                    <i class="fas fa-money-bill-wave"></i>
                    بدهی دارند
                </button>
            </div>
            <div id="groupFilterInfo" class="group-filter-info"></div>
        </div>
    `;

  updateGroupFilterInfo();

  document.getElementById("smsRecipientSelect").style.display = "block";

  // Reset recipient buttons
  const recipientButtons = document.querySelector(".recipient-buttons");
  recipientButtons.innerHTML = `
        <button class="recipient-btn" data-recipient="father" onclick="selectRecipient('father')">
            <i class="fas fa-male"></i>
            پدر
        </button>
        <button class="recipient-btn" data-recipient="mother" onclick="selectRecipient('mother')">
            <i class="fas fa-female"></i>
            مادر
        </button>
        <button class="recipient-btn" data-recipient="both" onclick="selectRecipient('both')">
            <i class="fas fa-users"></i>
            هر دو
        </button>
    `;

  document.querySelectorAll(".recipient-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.getElementById("smsMessage").value = "";
  updateCharCount();

  document.querySelectorAll(".sms-reason-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  renderQuickMessages();

  document.getElementById("smsModal").classList.add("active");
}

function selectGroupFilter(filter) {
  currentGroupFilter = filter;

  document.querySelectorAll(".group-filter-btn").forEach((btn) => {
    if (btn.getAttribute("data-filter") === filter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  updateGroupFilterInfo();
}

function updateGroupFilterInfo() {
  const infoDiv = document.getElementById("groupFilterInfo");
  if (!infoDiv) return;

  let filteredCount = 0;
  let allStudents = [];

  Object.values(classes).forEach((c) => {
    allStudents = allStudents.concat(c.students);
  });

  let filteredStudents = [];

  switch (currentGroupFilter) {
    case "all":
      filteredStudents = allStudents;
      break;
    case "absence":
      filteredStudents = allStudents.filter((s) => s.absenceDays > 0);
      break;
    case "delay":
      filteredStudents = allStudents.filter((s) => s.delayCount > 0);
      break;
    case "debt":
      filteredStudents = allStudents.filter((s) => s.tuitionDebt > 0);
      break;
  }

  filteredCount = filteredStudents.length;

  if (currentGroupFilter === "all") {
    infoDiv.innerHTML = `
            <div class="filter-info-text">
                <i class="fas fa-info-circle"></i>
                پیامک به همه ${filteredCount} دانش‌آموز ارسال می‌شود
            </div>
        `;
  } else {
    const filterNames = {
      absence: "غیبت دارند",
      delay: "تأخیر دارند",
      debt: "بدهی دارند",
    };

    infoDiv.innerHTML = `
            <div class="filter-info-text highlight">
                <i class="fas fa-filter"></i>
                فقط ${filteredCount} دانش‌آموز که ${filterNames[currentGroupFilter]} پیامک دریافت می‌کنند
            </div>
        `;
  }
}

function closeSmsModal() {
  document.getElementById("smsModal").classList.remove("active");
  currentSmsRecipient = null;
  currentSmsReason = null;
  currentSmsRecipientType = null;
  currentGroupFilter = "all";
}

function selectRecipient(type) {
  currentSmsRecipientType = type;

  document.querySelectorAll(".recipient-btn").forEach((btn) => {
    if (btn.getAttribute("data-recipient") === type) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function selectSmsReason(reason) {
  currentSmsReason = reason;

  document.querySelectorAll(".sms-reason-btn").forEach((btn) => {
    if (btn.getAttribute("data-reason") === reason) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderQuickMessages();
}

function renderQuickMessages() {
  const grid = document.getElementById("smsQuickGrid");
  grid.innerHTML = "";

  if (!currentSmsReason) {
    grid.innerHTML =
      '<div class="sms-no-quick-messages">لطفاً ابتدا دلیل ارسال پیامک را انتخاب کنید</div>';
    return;
  }

  const templates = smsTemplates[currentSmsReason] || [];

  if (templates.length === 0) {
    grid.innerHTML =
      '<div class="sms-no-quick-messages">هیچ پیام سریعی ذخیره نشده است</div>';
    return;
  }

  templates.forEach((template, index) => {
    const item = document.createElement("div");
    item.className = "sms-quick-item";
    item.innerHTML = `
            <i class="fas fa-comment sms-quick-icon"></i>
            <div class="sms-quick-text">${template}</div>
            <button class="sms-quick-delete" onclick="deleteQuickMessage(${index})" title="حذف">
                <i class="fas fa-trash"></i>
            </button>
        `;

    item.addEventListener("click", function (e) {
      if (!e.target.closest(".sms-quick-delete")) {
        document.getElementById("smsMessage").value = template;
        updateCharCount();
      }
    });

    grid.appendChild(item);
  });
}

function deleteQuickMessage(index) {
  if (!currentSmsReason) return;

  if (confirm("آیا می‌خواهید این پیام سریع را حذف کنید؟")) {
    smsTemplates[currentSmsReason].splice(index, 1);
    saveSmsTemplatesStorage();
    renderQuickMessages();
    showSuccessMessage("پیام سریع حذف شد");
  }
}

function updateCharCount() {
  const textarea = document.getElementById("smsMessage");
  const charCount = document.getElementById("smsCharCount");

  const count = textarea.value.length;
  charCount.textContent = count;

  if (count > 300) {
    charCount.style.color = "#e74c3c";
  } else {
    charCount.style.color = "#e67e22";
  }
}

function saveSmsTemplate() {
  const message = document.getElementById("smsMessage").value.trim();

  if (!message) {
    alert("لطفاً متن پیامک را وارد کنید!");
    return;
  }

  if (!currentSmsReason) {
    alert("لطفاً ابتدا دلیل ارسال پیامک را انتخاب کنید!");
    return;
  }

  if (message.length > 300) {
    alert("متن پیامک نباید بیش از 300 کاراکتر باشد!");
    return;
  }

  if (smsTemplates[currentSmsReason].includes(message)) {
    alert("این پیام قبلاً ذخیره شده است!");
    return;
  }

  smsTemplates[currentSmsReason].push(message);
  saveSmsTemplatesStorage();
  renderQuickMessages();
  showSuccessMessage("متن پیامک به پیام‌های سریع اضافه شد");
}

function getFilteredStudents() {
  let allStudents = [];

  if (currentClassNumber) {
    // For class group SMS
    allStudents = classes[currentClassNumber].students;
  } else {
    // For all school SMS
    Object.values(classes).forEach((c) => {
      allStudents = allStudents.concat(c.students);
    });
  }

  // Apply group filter
  switch (currentGroupFilter) {
    case "absence":
      return allStudents.filter((s) => s.absenceDays > 0);
    case "delay":
      return allStudents.filter((s) => s.delayCount > 0);
    case "debt":
      return allStudents.filter((s) => s.tuitionDebt > 0);
    default:
      return allStudents;
  }
}

function sendSms() {
  const message = document.getElementById("smsMessage").value.trim();

  if (!message) {
    showWarningModal(
      "متن پیامک خالی است!",
      "لطفاً متن پیامک خود را در کادر مربوطه وارد نمایید.",
    );
    return;
  }

  if (!currentSmsReason) {
    showWarningModal(
      "دلیل ارسال انتخاب نشده!",
      "لطفاً یکی از دلایل ارسال پیامک (بدهی شهریه، غیبت، تأخیر یا سایر) را انتخاب کنید.",
    );
    return;
  }

  if (message.length > 300) {
    showWarningModal(
      "متن پیامک طولانی است!",
      `متن پیامک شما ${message.length} کاراکتر است. حداکثر مجاز 300 کاراکتر می‌باشد.`,
    );
    return;
  }

  if (!currentSmsRecipientType) {
    showWarningModal(
      "گیرنده انتخاب نشده!",
      "لطفاً گیرنده پیامک را انتخاب کنید (پدر، مادر، سرپرست یا هر دو).",
    );
    return;
  }

  // Calculate number of recipients and cost
  let recipientCount = 0;
  let recipientText = "";

  if (currentSmsRecipient) {
    // پیامک تکی
    if (
      currentSmsRecipientType === "father" &&
      currentSmsRecipient.fatherStatus === "alive"
    ) {
      recipientCount = 1;
      recipientText = `پدر ${currentSmsRecipient.studentFullName}`;
    } else if (
      currentSmsRecipientType === "mother" &&
      currentSmsRecipient.motherStatus === "alive"
    ) {
      recipientCount = 1;
      recipientText = `مادر ${currentSmsRecipient.studentFullName}`;
    } else if (
      currentSmsRecipientType === "guardian" &&
      currentSmsRecipient.guardianPhone
    ) {
      recipientCount = 1;
      recipientText = `سرپرست (${currentSmsRecipient.guardianRelation}) ${currentSmsRecipient.studentFullName}`;
    } else if (currentSmsRecipientType === "both") {
      if (currentSmsRecipient.fatherStatus === "alive") recipientCount++;
      if (currentSmsRecipient.motherStatus === "alive") recipientCount++;
      recipientText = `${recipientCount} والد ${currentSmsRecipient.studentFullName}`;
    } else if (currentSmsRecipientType === "all") {
      if (currentSmsRecipient.fatherStatus === "alive") recipientCount++;
      if (currentSmsRecipient.motherStatus === "alive") recipientCount++;
      if (currentSmsRecipient.guardianPhone) recipientCount++;
      recipientText = `${recipientCount} گیرنده برای ${currentSmsRecipient.studentFullName}`;
    }
  } else {
    // پیامک گروهی
    const filteredStudents = getFilteredStudents();

    filteredStudents.forEach((student) => {
      if (
        currentSmsRecipientType === "father" &&
        student.fatherStatus === "alive"
      ) {
        recipientCount++;
      } else if (
        currentSmsRecipientType === "mother" &&
        student.motherStatus === "alive"
      ) {
        recipientCount++;
      } else if (currentSmsRecipientType === "both") {
        if (student.fatherStatus === "alive") recipientCount++;
        if (student.motherStatus === "alive") recipientCount++;
      }
    });

    const filterText =
      currentGroupFilter !== "all"
        ? ` (${currentGroupFilter === "absence" ? "غیبت دارند" : currentGroupFilter === "delay" ? "تأخیر دارند" : "بدهی دارند"})`
        : "";
    const scopeText = currentClassNumber
      ? `کلاس ${currentClassNumber}`
      : "همه اولیا";
    recipientText = `${recipientCount} گیرنده در ${scopeText}${filterText}`;
  }

  // Calculate cost
  const totalCost = recipientCount * smsPrice;

  // Check balance
  if (smsBalance < totalCost) {
    openLowBalanceModal(recipientCount, totalCost);
    return;
  }

  // Open confirmation modal
  openSmsConfirmModal(recipientCount, totalCost, recipientText);
}

function openLowBalanceModal(recipientCount, totalCost) {
  const modal = document.getElementById("lowBalanceModal");
  document.getElementById("lowBalanceNeeded").textContent =
    formatCurrency(totalCost);
  document.getElementById("lowBalanceCurrent").textContent =
    formatCurrency(smsBalance);
  modal.classList.add("active");
}

function closeLowBalanceModal() {
  document.getElementById("lowBalanceModal").classList.remove("active");
}

function goToChargeFromLowBalance() {
  closeLowBalanceModal();
  closeSmsModal();
  openChargeModal();
}

function openSmsConfirmModal(recipientCount, totalCost, recipientText) {
  const modal = document.getElementById("smsConfirmModal");
  document.getElementById("smsConfirmRecipients").textContent = recipientCount;
  document.getElementById("smsConfirmCost").textContent =
    formatCurrency(totalCost);
  document.getElementById("smsConfirmRecipientText").textContent =
    recipientText;
  modal.classList.add("active");

  // Store data for confirmation
  window.pendingSmsData = { recipientCount, totalCost, recipientText };
}

function closeSmsConfirmModal() {
  document.getElementById("smsConfirmModal").classList.remove("active");
  window.pendingSmsData = null;
}

function confirmSendSms() {
  const data = window.pendingSmsData;
  if (!data) return;

  closeSmsConfirmModal();

  // Deduct balance and send
  smsBalance -= data.totalCost;
  saveSmsBalance();

  showSuccessMessage(
    `پیامک با موفقیت به ${data.recipientText} ارسال شد.\nموجودی باقیمانده: ${formatCurrency(smsBalance)} تومان`,
  );
  closeSmsModal();
}

// ==============================
// EXCEL EXPORT
// ==============================

function exportParentsExcel() {
  // Open filter modal
  document.getElementById("excelFilterModal").classList.add("active");
}

function closeExcelFilterModal() {
  document.getElementById("excelFilterModal").classList.remove("active");
}

function generateExcelWithFilter(filter) {
  closeExcelFilterModal();

  const wb = XLSX.utils.book_new();

  Object.entries(classes).forEach(([classNum, classData]) => {
    // Filter students based on selection
    let filteredStudents = classData.students;
    let filterTitle = "";

    if (filter === "debt") {
      filteredStudents = classData.students.filter((s) => s.tuitionDebt > 0);
      filterTitle = " (فقط بدهکاران)";
    } else if (filter === "no-debt") {
      filteredStudents = classData.students.filter((s) => s.tuitionDebt === 0);
      filterTitle = " (غیر بدهکاران)";
    }

    if (filteredStudents.length === 0) return; // Skip empty classes

    const data = [
      [
        `اطلاعات اولیای کلاس ${classNum} - ${classData.grade} ${classData.field}${filterTitle}`,
      ],
      [],
      [
        "ردیف",
        "کد دانش‌آموز",
        "نام دانش‌آموز",
        "کد ملی دانش‌آموز",
        "بدهی شهریه",
        "غیبت",
        "تأخیر",
        "",
        "نام پدر",
        "نام خانوادگی پدر",
        "کد ملی پدر",
        "تاریخ تولد پدر",
        "تحصیلات پدر",
        "شغل پدر",
        "شماره تماس پدر",
        "وضعیت پدر",
        "",
        "نام مادر",
        "نام خانوادگی مادر",
        "کد ملی مادر",
        "تاریخ تولد مادر",
        "تحصیلات مادر",
        "شغل مادر",
        "شماره تماس مادر",
        "وضعیت مادر",
        "",
        "نام سرپرست",
        "نام خانوادگی سرپرست",
        "نسبت سرپرست",
        "کد ملی سرپرست",
        "تاریخ تولد سرپرست",
        "تحصیلات سرپرست",
        "شغل سرپرست",
        "شماره تماس سرپرست",
      ],
    ];

    filteredStudents.forEach((student, index) => {
      const row = [
        index + 1,
        student.code,
        student.studentFullName,
        student.nationalId,
        student.tuitionDebt > 0
          ? `${formatCurrency(student.tuitionDebt)} تومان`
          : "ندارد",
        student.absenceDays > 0 ? `${student.absenceDays} روز` : "ندارد",
        student.delayCount > 0 ? `${student.delayCount} بار` : "ندارد",
        "",
      ];

      // Father info
      if (student.fatherStatus === "alive") {
        row.push(
          student.fatherFirstName,
          student.fatherLastName,
          student.fatherNationalId,
          student.fatherBirthDate,
          student.fatherEducation,
          student.fatherJob,
          student.fatherPhone,
          "زنده",
        );
      } else {
        row.push(
          student.fatherFirstName,
          student.fatherLastName,
          "---",
          "---",
          "---",
          "---",
          "---",
          "فوت شده",
        );
      }

      row.push(""); // Separator

      // Mother info
      if (student.motherStatus === "alive") {
        row.push(
          student.motherFirstName,
          student.motherLastName,
          student.motherNationalId,
          student.motherBirthDate,
          student.motherEducation,
          student.motherJob,
          student.motherPhone,
          "زنده",
        );
      } else {
        row.push(
          student.motherFirstName,
          student.motherLastName,
          "---",
          "---",
          "---",
          "---",
          "---",
          "فوت شده",
        );
      }

      row.push(""); // Separator

      // Guardian info
      if (student.guardianFullName) {
        row.push(
          student.guardianFirstName,
          student.guardianLastName,
          student.guardianRelation,
          student.guardianNationalId,
          student.guardianBirthDate,
          student.guardianEducation,
          student.guardianJob,
          student.guardianPhone,
        );
      } else {
        row.push("---", "---", "---", "---", "---", "---", "---", "---");
      }

      data.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 6 }, // ردیف
      { wch: 12 }, // کد
      { wch: 18 }, // نام
      { wch: 12 }, // کد ملی
      { wch: 15 }, // بدهی
      { wch: 10 }, // غیبت
      { wch: 10 }, // تأخیر
      { wch: 2 }, // separator
      { wch: 12 }, // نام پدر
      { wch: 12 }, // نام خانوادگی پدر
      { wch: 12 }, // کد ملی پدر
      { wch: 12 }, // تاریخ تولد پدر
      { wch: 12 }, // تحصیلات پدر
      { wch: 15 }, // شغل پدر
      { wch: 13 }, // شماره پدر
      { wch: 12 }, // وضعیت پدر
      { wch: 2 }, // separator
      { wch: 12 }, // نام مادر
      { wch: 12 }, // نام خانوادگی مادر
      { wch: 12 }, // کد ملی مادر
      { wch: 12 }, // تاریخ تولد مادر
      { wch: 12 }, // تحصیلات مادر
      { wch: 15 }, // شغل مادر
      { wch: 13 }, // شماره مادر
      { wch: 12 }, // وضعیت مادر
      { wch: 2 }, // separator
      { wch: 12 }, // نام سرپرست
      { wch: 12 }, // نام خانوادگی سرپرست
      { wch: 12 }, // نسبت
      { wch: 12 }, // کد ملی سرپرست
      { wch: 12 }, // تاریخ تولد سرپرست
      { wch: 12 }, // تحصیلات سرپرست
      { wch: 15 }, // شغل سرپرست
      { wch: 13 }, // شماره سرپرست
    ];

    XLSX.utils.book_append_sheet(wb, ws, `کلاس ${classNum}`);
  });

  const filterName =
    filter === "all" ? "همه" : filter === "debt" ? "بدهکاران" : "غیربدهکاران";
  XLSX.writeFile(
    wb,
    `اطلاعات_اولیا_${filterName}_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
  showSuccessMessage(`فایل Excel اطلاعات ${filterName} با موفقیت دانلود شد!`);
}

// ==============================
// UTILITIES
// ==============================

function showSuccessMessage(text) {
  const successMsg = document.createElement("div");
  successMsg.style.cssText =
    "position: fixed; top: 20px; right: 20px; background: #27AE60; color: white; padding: 15px 30px; border-radius: 10px; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 5px 20px rgba(0,0,0,0.3); font-family: Vazirmatn, sans-serif;";
  successMsg.textContent = text;
  document.body.appendChild(successMsg);
  setTimeout(() => successMsg.remove(), 3000);
}

function showErrorMessage(text) {
  const errorMsg = document.createElement("div");
  errorMsg.style.cssText =
    "position: fixed; top: 20px; right: 20px; background: #e74c3c; color: white; padding: 15px 30px; border-radius: 10px; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 5px 20px rgba(0,0,0,0.3); font-family: Vazirmatn, sans-serif;";
  errorMsg.textContent = text;
  document.body.appendChild(errorMsg);
  setTimeout(() => errorMsg.remove(), 3000);
}

function showWarningModal(title, message) {
  document.getElementById("warningTitle").textContent = title;
  document.getElementById("warningMessage").textContent = message;
  document.getElementById("warningModal").classList.add("active");
}

function closeWarningModal() {
  document.getElementById("warningModal").classList.remove("active");
}

// ==============================
// VIEW & EDIT PARENT MODALS
// ==============================

function openViewParentModal(studentCode) {
  const classData = classes[currentClassNumber];
  const student = classData.students.find((s) => s.code === studentCode);
  if (!student) return;

  let content = `
        <h2 class="modal-title">اطلاعات کامل - ${student.studentFullName}</h2>
        
        <div class="parent-details-container">
            <div class="detail-section">
                <h3 class="section-title"><i class="fas fa-user-graduate"></i> اطلاعات دانش‌آموز</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">نام و نام خانوادگی:</span>
                        <span class="detail-value">${student.studentFullName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">کد دانش‌آموز:</span>
                        <span class="detail-value">${student.code}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">کد ملی:</span>
                        <span class="detail-value">${student.nationalId}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title ${student.fatherStatus === "deceased" ? "deceased" : ""}">
                    <i class="fas fa-male"></i> اطلاعات پدر
                    ${student.fatherStatus === "deceased" ? '<span class="deceased-badge">فوت شده</span>' : ""}
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">نام:</span>
                        <span class="detail-value">${student.fatherFirstName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">نام خانوادگی:</span>
                        <span class="detail-value">${student.fatherLastName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">کد ملی:</span>
                        <span class="detail-value">${student.fatherStatus === "alive" ? student.fatherNationalId : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تاریخ تولد:</span>
                        <span class="detail-value">${student.fatherStatus === "alive" ? student.fatherBirthDate : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تحصیلات:</span>
                        <span class="detail-value">${student.fatherStatus === "alive" ? student.fatherEducation : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شغل:</span>
                        <span class="detail-value">${student.fatherStatus === "alive" ? student.fatherJob : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شماره تماس:</span>
                        <span class="detail-value ltr-text">${student.fatherStatus === "alive" ? student.fatherPhone : "---"}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3 class="section-title ${student.motherStatus === "deceased" ? "deceased" : ""}">
                    <i class="fas fa-female"></i> اطلاعات مادر
                    ${student.motherStatus === "deceased" ? '<span class="deceased-badge">فوت شده</span>' : ""}
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">نام:</span>
                        <span class="detail-value">${student.motherFirstName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">نام خانوادگی:</span>
                        <span class="detail-value">${student.motherLastName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">کد ملی:</span>
                        <span class="detail-value">${student.motherStatus === "alive" ? student.motherNationalId : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تاریخ تولد:</span>
                        <span class="detail-value">${student.motherStatus === "alive" ? student.motherBirthDate : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تحصیلات:</span>
                        <span class="detail-value">${student.motherStatus === "alive" ? student.motherEducation : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شغل:</span>
                        <span class="detail-value">${student.motherStatus === "alive" ? student.motherJob : "---"}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شماره تماس:</span>
                        <span class="detail-value ltr-text">${student.motherStatus === "alive" ? student.motherPhone : "---"}</span>
                    </div>
                </div>
            </div>
            
            ${
              student.guardianFullName
                ? `
            <div class="detail-section guardian-section">
                <h3 class="section-title">
                    <i class="fas fa-user-shield"></i> اطلاعات سرپرست (${student.guardianRelation})
                </h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">نام:</span>
                        <span class="detail-value">${student.guardianFirstName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">نام خانوادگی:</span>
                        <span class="detail-value">${student.guardianLastName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">کد ملی:</span>
                        <span class="detail-value">${student.guardianNationalId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تاریخ تولد:</span>
                        <span class="detail-value">${student.guardianBirthDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">تحصیلات:</span>
                        <span class="detail-value">${student.guardianEducation}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شغل:</span>
                        <span class="detail-value">${student.guardianJob}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">شماره تماس:</span>
                        <span class="detail-value ltr-text">${student.guardianPhone}</span>
                    </div>
                </div>
            </div>
            `
                : ""
            }
        </div>
    `;

  document.getElementById("viewParentModalContent").innerHTML = content;
  document.getElementById("viewParentModal").classList.add("active");
}

function closeViewParentModal() {
  document.getElementById("viewParentModal").classList.remove("active");
}

function openEditParentModal(studentCode) {
  const classData = classes[currentClassNumber];
  const student = classData.students.find((s) => s.code === studentCode);
  if (!student) return;
  window.currentEditingStudent = student;

  const hasGuardian = student.guardianFullName ? true : false;
  const bothDeceased =
    student.fatherStatus === "deceased" && student.motherStatus === "deceased";

  let content = `
        <h2 class="modal-title">ویرایش اطلاعات - ${student.studentFullName}</h2>
        <form class="edit-form" id="editParentForm" onsubmit="saveParentEdit(event)">

            <!-- بخش بدهی و وضعیت -->
            <div class="form-section debt-edit-section">
                <h3 class="form-section-title"><i class="fas fa-money-bill-wave"></i> وضعیت مالی و حضور</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:15px;">
                    <div class="form-group">
                        <label>تعداد روز غیبت:</label>
                        <div class="debt-input-wrapper">
                            <button type="button" class="debt-adj-btn plus" onclick="adjustField('absenceInput',1)"><i class="fas fa-plus"></i></button>
                            <input type="number" name="absenceDays" id="absenceInput" value="${student.absenceDays}" min="0" class="debt-number-input">
                            <button type="button" class="debt-adj-btn" onclick="adjustField('absenceInput',-1)"><i class="fas fa-minus"></i></button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>تعداد تأخیر:</label>
                        <div class="debt-input-wrapper">
                            <button type="button" class="debt-adj-btn plus" onclick="adjustField('delayInput',1)"><i class="fas fa-plus"></i></button>
                            <input type="number" name="delayCount" id="delayInput" value="${student.delayCount}" min="0" class="debt-number-input">
                            <button type="button" class="debt-adj-btn" onclick="adjustField('delayInput',-1)"><i class="fas fa-minus"></i></button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>بدهی شهریه (تومان):</label>
                    <div class="debt-input-wrapper">
                        <button type="button" class="debt-adj-btn plus" onclick="adjustDebt(500000)"><i class="fas fa-plus"></i></button>
                        <input type="text" name="tuitionDebt" id="debtInput" 
                            value="${student.tuitionDebt.toLocaleString("en-US")}" 
                            class="debt-number-input"
                            oninput="formatDebtInput(this)">
                        <button type="button" class="debt-adj-btn" onclick="adjustDebt(-500000)"><i class="fas fa-minus"></i></button>
                    </div>
                    <button type="button" class="btn-clear-debt" onclick="clearDebt()">
                        <i class="fas fa-times-circle"></i> حذف کامل بدهی
                    </button>
                </div>
            </div>

            <!-- اطلاعات پدر -->
            <div class="form-section ${hasGuardian ? "opacity-50" : ""}">
                <h3 class="form-section-title">
                    <i class="fas fa-male"></i> اطلاعات پدر
                    ${hasGuardian ? '<span style="font-size:12px;color:#95a5a6;margin-right:10px">(غیرقابل ویرایش - سرپرست تعریف شده)</span>' : ""}
                </h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>نام:</label>
                        <input type="text" name="fatherFirstName" value="${student.fatherFirstName}" ${hasGuardian ? "disabled" : "required"}>
                    </div>
                    <div class="form-group">
                        <label>نام خانوادگی:</label>
                        <input type="text" name="fatherLastName" value="${student.fatherLastName}" ${hasGuardian ? "disabled" : "required"}>
                    </div>
                    <div class="form-group">
                        <label>کد ملی:</label>
                        <input type="text" name="fatherNationalId" value="${student.fatherNationalId}" maxlength="10" 
                            ${hasGuardian ? "disabled" : ""}>
                    </div>
                    <div class="form-group">
                        <label>تاریخ تولد:</label>
                        <input type="text" name="fatherBirthDate" id="fatherBirthDate" value="${student.fatherBirthDate}" 
                            placeholder="1350/01/01" readonly class="jalali-input"
                            ${hasGuardian ? "disabled" : ""}
                            onclick="this.disabled||openJalaliCalendar(this)">
                    </div>
                    <div class="form-group">
                        <label>تحصیلات:</label>
                        <select name="fatherEducation" ${hasGuardian ? "disabled" : ""}>
                            ${educationLevels.map((e) => `<option value="${e}" ${student.fatherEducation === e ? "selected" : ""}>${e}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شغل:</label>
                        <select name="fatherJob" ${hasGuardian ? "disabled" : ""}>
                            ${jobs.map((j) => `<option value="${j}" ${student.fatherJob === j ? "selected" : ""}>${j}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شماره تماس:</label>
                        <input type="text" name="fatherPhone" value="${student.fatherPhone}" maxlength="11"
                            ${hasGuardian ? "disabled" : ""}>
                    </div>
                    <div class="form-group">
                        <label>وضعیت:</label>
                        <select name="fatherStatus">
                            <option value="alive" ${student.fatherStatus === "alive" ? "selected" : ""}>زنده</option>
                            <option value="deceased" ${student.fatherStatus === "deceased" ? "selected" : ""}>فوت شده</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- اطلاعات مادر -->
            <div class="form-section ${hasGuardian ? "opacity-50" : ""}">
                <h3 class="form-section-title">
                    <i class="fas fa-female"></i> اطلاعات مادر
                    ${hasGuardian ? '<span style="font-size:12px;color:#95a5a6;margin-right:10px">(غیرقابل ویرایش - سرپرست تعریف شده)</span>' : ""}
                </h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>نام:</label>
                        <input type="text" name="motherFirstName" value="${student.motherFirstName}" ${hasGuardian ? "disabled" : "required"}>
                    </div>
                    <div class="form-group">
                        <label>نام خانوادگی:</label>
                        <input type="text" name="motherLastName" value="${student.motherLastName}" ${hasGuardian ? "disabled" : "required"}>
                    </div>
                    <div class="form-group">
                        <label>کد ملی:</label>
                        <input type="text" name="motherNationalId" value="${student.motherNationalId}" maxlength="10"
                            ${hasGuardian ? "disabled" : ""}>
                    </div>
                    <div class="form-group">
                        <label>تاریخ تولد:</label>
                        <input type="text" name="motherBirthDate" id="motherBirthDate" value="${student.motherBirthDate}" 
                            placeholder="1355/01/01" readonly class="jalali-input"
                            ${hasGuardian ? "disabled" : ""}
                            onclick="this.disabled||openJalaliCalendar(this)">
                    </div>
                    <div class="form-group">
                        <label>تحصیلات:</label>
                        <select name="motherEducation" ${hasGuardian ? "disabled" : ""}>
                            ${educationLevels.map((e) => `<option value="${e}" ${student.motherEducation === e ? "selected" : ""}>${e}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شغل:</label>
                        <select name="motherJob" ${hasGuardian ? "disabled" : ""}>
                            ${jobs.map((j) => `<option value="${j}" ${student.motherJob === j ? "selected" : ""}>${j}</option>`).join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شماره تماس:</label>
                        <input type="text" name="motherPhone" value="${student.motherPhone}" maxlength="11"
                            ${hasGuardian ? "disabled" : ""}>
                    </div>
                    <div class="form-group">
                        <label>وضعیت:</label>
                        <select name="motherStatus">
                            <option value="alive" ${student.motherStatus === "alive" ? "selected" : ""}>زنده</option>
                            <option value="deceased" ${student.motherStatus === "deceased" ? "selected" : ""}>فوت شده</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- اطلاعات سرپرست -->
            ${
              bothDeceased
                ? `
            <div class="form-section guardian-section">
                <h3 class="form-section-title" style="color:#3498db">
                    <i class="fas fa-user-shield"></i> اطلاعات سرپرست
                    ${!hasGuardian ? '<span style="font-size:12px;color:#e67e22;margin-right:10px">(سرپرست تعریف نشده - می‌توانید اضافه کنید)</span>' : ""}
                </h3>
                <div class="form-grid">
                    <div class="form-group">
                        <label>نام:</label>
                        <input type="text" name="guardianFirstName" value="${student.guardianFirstName || ""}" placeholder="نام سرپرست">
                    </div>
                    <div class="form-group">
                        <label>نام خانوادگی:</label>
                        <input type="text" name="guardianLastName" value="${student.guardianLastName || ""}" placeholder="نام خانوادگی">
                    </div>
                    <div class="form-group">
                        <label>نسبت:</label>
                        <select name="guardianRelation">
                            ${[
                              "عمو",
                              "دایی",
                              "عمه",
                              "خاله",
                              "پدربزرگ",
                              "مادربزرگ",
                              "برادر",
                              "خواهر",
                              "سایر",
                            ]
                              .map(
                                (r) =>
                                  `<option value="${r}" ${student.guardianRelation === r ? "selected" : ""}>${r}</option>`,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>کد ملی:</label>
                        <input type="text" name="guardianNationalId" value="${student.guardianNationalId || ""}" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label>تاریخ تولد:</label>
                        <input type="text" name="guardianBirthDate" id="guardianBirthDate" value="${student.guardianBirthDate || ""}" 
                            placeholder="1350/01/01" readonly class="jalali-input" 
                            onclick="openJalaliCalendar(this)">
                    </div>
                    <div class="form-group">
                        <label>تحصیلات:</label>
                        <select name="guardianEducation">
                            ${educationLevels
                              .map(
                                (e) =>
                                  `<option value="${e}" ${student.guardianEducation === e ? "selected" : ""}>${e}</option>`,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شغل:</label>
                        <select name="guardianJob">
                            ${jobs
                              .map(
                                (j) =>
                                  `<option value="${j}" ${student.guardianJob === j ? "selected" : ""}>${j}</option>`,
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>شماره تماس:</label>
                        <input type="text" name="guardianPhone" value="${student.guardianPhone || ""}" maxlength="11">
                    </div>
                </div>
            </div>
            `
                : ""
            }

            <div class="form-actions">
                <button type="button" class="btn-cancel" onclick="closeEditParentModal()">
                    <i class="fas fa-times"></i> انصراف
                </button>
                <button type="submit" class="btn-save">
                    <i class="fas fa-save"></i> ذخیره تغییرات
                </button>
            </div>
        </form>`;

  document.getElementById("editParentModalContent").innerHTML = content;
  document.getElementById("editParentModal").classList.add("active");
}

function adjustDebt(amount) {
  var inp = document.getElementById("debtInput");
  var raw = parseInt(inp.value.replace(/,/g, "")) || 0;
  var newVal = Math.max(0, raw + amount);
  inp.value = newVal.toLocaleString("en-US");
}

function adjustField(id, amount) {
  var inp = document.getElementById(id);
  var val = parseInt(inp.value) || 0;
  inp.value = Math.max(0, val + amount);
}

function clearDebt() {
  document.getElementById("debtInput").value = 0;
}
function formatDebtInput(input) {
  let raw = input.value.replace(/,/g, "").replace(/[^0-9]/g, "");
  if (raw === "") {
    input.value = "";
    return;
  }
  input.value = parseInt(raw).toLocaleString("en-US");
}
function closeEditParentModal() {
  document.getElementById("editParentModal").classList.remove("active");
  window.currentEditingStudent = null;
}

function saveParentEdit(event) {
  event.preventDefault();
  if (!window.currentEditingStudent) return;
  const formData = new FormData(event.target);
  const student = window.currentEditingStudent;

  student.fatherFirstName =
    formData.get("fatherFirstName") || student.fatherFirstName;
  student.fatherLastName =
    formData.get("fatherLastName") || student.fatherLastName;
  student.fatherFullName = `${student.fatherFirstName} ${student.fatherLastName}`;
  student.fatherNationalId =
    formData.get("fatherNationalId") || student.fatherNationalId;
  student.fatherBirthDate =
    formData.get("fatherBirthDate") || student.fatherBirthDate;
  student.fatherEducation =
    formData.get("fatherEducation") || student.fatherEducation;
  student.fatherJob = formData.get("fatherJob") || student.fatherJob;
  student.fatherPhone = formData.get("fatherPhone") || student.fatherPhone;
  student.fatherStatus = formData.get("fatherStatus");

  student.motherFirstName =
    formData.get("motherFirstName") || student.motherFirstName;
  student.motherLastName =
    formData.get("motherLastName") || student.motherLastName;
  student.motherFullName = `${student.motherFirstName} ${student.motherLastName}`;
  student.motherNationalId =
    formData.get("motherNationalId") || student.motherNationalId;
  student.motherBirthDate =
    formData.get("motherBirthDate") || student.motherBirthDate;
  student.motherEducation =
    formData.get("motherEducation") || student.motherEducation;
  student.motherJob = formData.get("motherJob") || student.motherJob;
  student.motherPhone = formData.get("motherPhone") || student.motherPhone;
  student.motherStatus = formData.get("motherStatus");

  student.tuitionDebt =
    parseInt((formData.get("tuitionDebt") || "0").replace(/,/g, "")) || 0;
  student.absenceDays = parseInt(formData.get("absenceDays")) || 0;
  student.delayCount = parseInt(formData.get("delayCount")) || 0;

  if (
    student.fatherStatus === "deceased" &&
    student.motherStatus === "deceased"
  ) {
    const gFirst = formData.get("guardianFirstName");
    const gLast = formData.get("guardianLastName");
    student.guardianFirstName = gFirst || null;
    student.guardianLastName = gLast || null;
    student.guardianFullName = gFirst ? `${gFirst} ${gLast}` : null;
    student.guardianRelation = formData.get("guardianRelation") || null;
    student.guardianNationalId = formData.get("guardianNationalId") || null;
    student.guardianBirthDate = formData.get("guardianBirthDate") || null;
    student.guardianEducation = formData.get("guardianEducation") || null;
    student.guardianJob = formData.get("guardianJob") || null;
    student.guardianPhone = formData.get("guardianPhone") || null;
  } else {
    student.guardianFirstName = null;
    student.guardianLastName = null;
    student.guardianFullName = null;
    student.guardianRelation = null;
    student.guardianNationalId = null;
    student.guardianBirthDate = null;
    student.guardianEducation = null;
    student.guardianJob = null;
    student.guardianPhone = null;
  }

  closeEditParentModal();
  renderParentsList();
  renderClasses();
  showSuccessMessage("اطلاعات با موفقیت به‌روز شد!");
}

// ==============================
// EVENT LISTENERS
// ==============================

document.addEventListener("DOMContentLoaded", function () {
  loadSmsTemplates();
  loadSmsBalance();
  renderClasses();

  const smsTextarea = document.getElementById("smsMessage");
  if (smsTextarea) {
    smsTextarea.addEventListener("input", updateCharCount);
  }

  const customChargeInput = document.getElementById("customChargeAmount");
  if (customChargeInput) {
    customChargeInput.addEventListener("input", updateChargeButton);
  }
});

// Close modals on background click
document
  .getElementById("classParentsModal")
  ?.addEventListener("click", function (e) {
    if (e.target === this) closeClassParentsModal();
  });

document.getElementById("smsModal")?.addEventListener("click", function (e) {
  if (e.target === this) closeSmsModal();
});

// Success Message Animation
const style = document.createElement("style");
style.textContent =
  "@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }";
document.head.appendChild(style);

// این کد رو در انتهای body هر صفحه بذارید
document.addEventListener("DOMContentLoaded", function () {
  // پیدا کردن لینک مدیریت معاونان
  const assistantLink = document.querySelector('a[href*="Parents"]');

  if (assistantLink) {
    // active کردن زیرمنو
    assistantLink.classList.add("active");

    // باز کردن منوی والد
    const parentMenu = assistantLink.closest(".menu-item.has-submenu");
    if (parentMenu) {
      parentMenu.classList.add("open", "active");
    }
  }
});

// ==============================
// JALALI CALENDAR (Pure JS - No CDN)
// ==============================

let _jCal = {
  year: 1400,
  month: 1,
  selY: null,
  selM: null,
  selD: null,
  input: null,
};
const _jMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

function _g2j(gy, gm, gd) {
  gy -= 1600;
  gm -= 1;
  gd -= 1;
  var g =
    365 * gy +
    Math.floor((gy + 3) / 4) -
    Math.floor((gy + 99) / 100) +
    Math.floor((gy + 399) / 400);
  var ms = [
    31,
    28 +
      ((gy + 1600) % 4 == 0 &&
      ((gy + 1600) % 100 != 0 || (gy + 1600) % 400 == 0)
        ? 1
        : 0),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  for (var i = 0; i < gm; i++) g += ms[i];
  g += gd;
  var j = g - 79;
  var np = Math.floor(j / 12053);
  j %= 12053;
  var jy = 979 + 33 * np + 4 * Math.floor(j / 1461);
  j %= 1461;
  if (j >= 366) {
    jy += Math.floor((j - 1) / 365);
    j = (j - 1) % 365;
  }
  var jms = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30];
  var jm = 0;
  for (jm = 0; jm < 11 && j >= jms[jm]; jm++) j -= jms[jm];
  return [jy, jm + 1, j + 1];
}

function _j2g(jy, jm, jd) {
  var y1 = jy - 979,
    m1 = jm - 1,
    d1 = jd - 1;
  var jdn =
    365 * y1 + Math.floor(y1 / 33) * 8 + Math.floor(((y1 % 33) + 3) / 4);
  var jms2 = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  for (var i = 0; i < m1; i++) jdn += jms2[i];
  jdn += d1;
  var gdn = jdn + 79;
  var gy = 1600 + 400 * Math.floor(gdn / 146097);
  gdn %= 146097;
  var leap = true;
  if (gdn >= 36525) {
    gdn--;
    gy += 100 * Math.floor(gdn / 36524);
    gdn %= 36524;
    if (gdn >= 365) gdn++;
    else leap = false;
  }
  gy += 4 * Math.floor(gdn / 1461);
  gdn %= 1461;
  if (gdn >= 366) {
    leap = false;
    gdn--;
    gy += Math.floor(gdn / 365);
    gdn %= 365;
  }
  var gms = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var gm = 0;
  for (gm = 0; gm < 11 && gdn >= gms[gm]; gm++) gdn -= gms[gm];
  return [gy, gm + 1, gdn + 1];
}

function _jLeap(jy) {
  return (
    [1, 5, 9, 13, 17, 22, 26, 30].indexOf(
      ((((jy - (jy > 0 ? 474 : 473)) % 2820) + 474 + 38) % 2820) % 128,
    ) >= 0
  );
}

function _jDaysInMonth(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return 30;
}

function _jDayOfWeek(jy, jm, jd) {
  var g = _j2g(jy, jm, jd);
  var d = new Date(g[0], g[1] - 1, g[2]);
  return (d.getDay() + 1) % 7; // ش=0 ... ج=6
}

function openJalaliCalendar(inputEl) {
  _jCal.input = inputEl;
  var val = inputEl.value.trim();
  var now = new Date();
  var today = _g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (val && /^\d{4}\/\d{2}\/\d{2}$/.test(val)) {
    var parts = val.split("/");
    _jCal.year = parseInt(parts[0]);
    _jCal.month = parseInt(parts[1]);
    _jCal.selY = parseInt(parts[0]);
    _jCal.selM = parseInt(parts[1]);
    _jCal.selD = parseInt(parts[2]);
  } else {
    _jCal.year = today[0];
    _jCal.month = today[1];
    _jCal.selY = null;
    _jCal.selM = null;
    _jCal.selD = null;
  }
  renderJalaliCalendar();
  document.getElementById("jalaliCalendarModal").classList.add("active");
}

function closeJalaliCalendar() {
  document.getElementById("jalaliCalendarModal").classList.remove("active");
  _jCal.input = null;
}

function jalaliGoToday() {
  var now = new Date();
  var t = _g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  _jCal.year = t[0];
  _jCal.month = t[1];
  _jCal.selY = t[0];
  _jCal.selM = t[1];
  _jCal.selD = t[2];
  renderJalaliCalendar();
  _jApplyDate();
}

function jalaliPrevMonth() {
  if (_jCal.month === 1) {
    _jCal.month = 12;
    _jCal.year--;
  } else _jCal.month--;
  renderJalaliCalendar();
}

function jalaliNextMonth() {
  if (_jCal.month === 12) {
    _jCal.month = 1;
    _jCal.year++;
  } else _jCal.month++;
  renderJalaliCalendar();
}

function jalaliChangeYear(d) {
  _jCal.year += d;
  renderJalaliCalendar();
}

function renderJalaliCalendar() {
  document.getElementById("jalaliCalTitle").textContent =
    _jMonths[_jCal.month - 1];
  document.getElementById("jalaliYearLabel").textContent = _jCal.year;
  var grid = document.getElementById("jalaliDaysGrid");
  grid.innerHTML = "";
  var firstDow = _jDayOfWeek(_jCal.year, _jCal.month, 1);
  var daysInMonth = _jDaysInMonth(_jCal.year, _jCal.month);
  var now = new Date();
  var today = _g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());
  for (var i = 0; i < firstDow; i++) {
    var empty = document.createElement("span");
    grid.appendChild(empty);
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.textContent = d;
    cell.className = "jalali-day-cell";
    var isToday =
      _jCal.year === today[0] && _jCal.month === today[1] && d === today[2];
    var isSel =
      _jCal.year === _jCal.selY &&
      _jCal.month === _jCal.selM &&
      d === _jCal.selD;
    if (isToday) cell.classList.add("jalali-today");
    if (isSel) cell.classList.add("jalali-selected");
    (function (day) {
      cell.onclick = function () {
        selectJalaliDay(day);
      };
    })(d);
    grid.appendChild(cell);
  }
}

function selectJalaliDay(d) {
  _jCal.selY = _jCal.year;
  _jCal.selM = _jCal.month;
  _jCal.selD = d;
  _jApplyDate();
  closeJalaliCalendar();
}

function _jApplyDate() {
  if (_jCal.input && _jCal.selY) {
    var m = String(_jCal.selM).padStart(2, "0");
    var day = String(_jCal.selD).padStart(2, "0");
    _jCal.input.value = _jCal.selY + "/" + m + "/" + day;
  }
}
