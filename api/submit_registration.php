<?php
// api/submit_registration.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
setHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'متد نامعتبر']);
    exit;
}

// ===== Rate Limiting (10 ثبت‌نام در دقیقه از هر IP) =====
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$cacheDir = __DIR__ . '/cache/';
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
$rateFile = $cacheDir . 'rls_' . md5($ip) . '.json';
$now      = time();
$rateData = file_exists($rateFile) ? (json_decode(file_get_contents($rateFile), true) ?? []) : [];
$rateData = array_filter($rateData, fn($t) => ($now - $t) < 60);
if (count($rateData) >= 10) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'تعداد درخواست زیاد. لطفاً چند لحظه صبر کنید.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$rateData[] = $now;
file_put_contents($rateFile, json_encode(array_values($rateData)));

$pdo = getDB();

// ===== بررسی باز بودن ثبت‌نام =====
$school_id = null;
if (!empty($_POST['school_id']))  $school_id = (int)$_POST['school_id'];
elseif (!empty($_GET['school_id'])) $school_id = (int)$_GET['school_id'];
else {
    $row = $pdo->query("SELECT id FROM schools ORDER BY id LIMIT 1")->fetch();
    if ($row) $school_id = (int)$row['id'];
}

try {
    $settingStmt = $pdo->prepare("SELECT setting_value FROM school_settings WHERE school_id=? AND setting_key='registration_open' LIMIT 1");
    $settingStmt->execute([$school_id]);
    $setting = $settingStmt->fetch();
    if ($setting && $setting['setting_value'] === '0') {
        echo json_encode(['success' => false, 'message' => 'پیش‌ثبت‌نام در حال حاضر بسته است.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
} catch (\PDOException $e) { /* جدول نداره = باز */ }

// ===== اعتبارسنجی فیلدهای اجباری =====
$required = [
    'first_name', 'last_name', 'national_code', 'grade', 'major', 'birth_date',
    'father_name', 'father_education', 'father_job', 'mobile1',
    'mother_name', 'mother_education', 'mother_job', 'mobile3',
];
foreach ($required as $field) {
    if (empty(trim($_POST[$field] ?? ''))) {
        echo json_encode(['success' => false, 'message' => "فیلد {$field} الزامی است"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// ===== اعتبارسنجی کد ملی =====
$national_code = trim($_POST['national_code']);
if (!preg_match('/^\d{10}$/', $national_code)) {
    echo json_encode(['success' => false, 'message' => 'کد ملی باید ۱۰ رقم باشد'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== اعتبارسنجی تاریخ شمسی =====
function validateJalaliDate(string $date): bool {
    // فرمت‌های قابل قبول: 1404/12/04 یا 1404-12-04
    $date = str_replace('-', '/', $date);
    if (!preg_match('/^(\d{4})\/(\d{2})\/(\d{2})$/', $date, $m)) return false;

    $year  = (int)$m[1];
    $month = (int)$m[2];
    $day   = (int)$m[3];

    if ($month < 1 || $month > 12)  return false;
    if ($day   < 1 || $day   > 31)  return false;
    if ($month > 6 && $day > 30)    return false;
    if ($month === 12 && $day > 29)  return false; // اسفند

    // سال منطقی: دانش‌آموز باید بین ۱۲ تا ۲۰ ساله باشه
    // سال شمسی جاری تقریبی
    $currentJalaliYear = (int)date('Y') - 621;
    if ($year < 1300 || $year > $currentJalaliYear) return false;

    return true;
}

function validateParentDate(string $date): bool {
    if (empty($date)) return true; // اختیاری
    $date = str_replace('-', '/', $date);
    if (!preg_match('/^(\d{4})\/(\d{2})\/(\d{2})$/', $date, $m)) return false;
    $year  = (int)$m[1];
    $month = (int)$m[2];
    $day   = (int)$m[3];
    if ($month < 1 || $month > 12) return false;
    if ($day   < 1 || $day   > 31) return false;
    $currentJalaliYear = (int)date('Y') - 621;
    // والدین باید بین ۳۰ تا ۸۰ سال داشته باشن
    if ($year < 1320 || $year > $currentJalaliYear - 18) return false;
    return true;
}

$studentBirth = trim($_POST['birth_date']);
if (!validateJalaliDate($studentBirth)) {
    echo json_encode(['success' => false, 'message' => 'تاریخ تولد دانش‌آموز معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

$fatherBirth = trim($_POST['father_birth_date'] ?? '');
if ($fatherBirth && !validateParentDate($fatherBirth)) {
    echo json_encode(['success' => false, 'message' => 'تاریخ تولد پدر معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

$motherBirth = trim($_POST['mother_birth_date'] ?? '');
if ($motherBirth && !validateParentDate($motherBirth)) {
    echo json_encode(['success' => false, 'message' => 'تاریخ تولد مادر معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== اعتبارسنجی شماره موبایل =====
function validateMobile(string $m): bool {
    return preg_match('/^09\d{9}$/', $m) === 1;
}
if (!validateMobile($_POST['mobile1'])) {
    echo json_encode(['success' => false, 'message' => 'شماره موبایل پدر معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}
if (!validateMobile($_POST['mobile3'])) {
    echo json_encode(['success' => false, 'message' => 'شماره موبایل مادر معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== جلوگیری از ثبت مجدد =====
$check = $pdo->prepare("SELECT id FROM registration WHERE national_code = ? AND status != 'rejected'");
$check->execute([$national_code]);
if ($check->fetch()) {
    echo json_encode(['success' => false, 'message' => 'این کد ملی قبلاً ثبت‌نام کرده است'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== آپلود فایل‌ها =====
$uploadDir = __DIR__ . '/../uploads/registrations/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

function uploadFile(string $fieldName, string $prefix, string $uploadDir): ?string {
    if (empty($_FILES[$fieldName]['name'])) return null;
    $file    = $_FILES[$fieldName];
    $ext     = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($ext, $allowed))        return null;
    if ($file['size'] > 5 * 1024 * 1024) return null;
    if ($file['error'] !== UPLOAD_ERR_OK) return null;
    $filename = $prefix . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) return $filename;
    return null;
}

$karname_file = uploadFile('karname_file', 'karname', $uploadDir);
$photo_file   = uploadFile('photo_file',   'photo',   $uploadDir);
$hedayat_file = uploadFile('hedayat_file', 'hedayat', $uploadDir);

// ===== کد پیگیری یکتا =====
do {
    $tracking_code = strtoupper(bin2hex(random_bytes(4)));
    $dup = $pdo->prepare("SELECT id FROM registration WHERE tracking_code = ?");
    $dup->execute([$tracking_code]);
} while ($dup->fetch());

// ===== درج در دیتابیس =====
try {
    $stmt = $pdo->prepare("
        INSERT INTO registration (
            school_id, first_name, last_name, national_code,
            grade, major, birth_date, student_phone,
            father_name, father_last_name, father_education, father_birth_date, father_job,
            mother_name, mother_last_name, mother_education, mother_birth_date, mother_job,
            mobile1, mobile2, mobile3,
            karname_file, photo_file, hedayat_file,
            tracking_code, status
        ) VALUES (?,?,?,?, ?,?,?,?, ?,?,?,?,?, ?,?,?,?,?, ?,?,?, ?,?,?, ?,'pending')
    ");
    $stmt->execute([
        $school_id,
        trim($_POST['first_name']),       trim($_POST['last_name']),
        $national_code,                   trim($_POST['grade']),
        trim($_POST['major']),            trim($_POST['birth_date']),
        trim($_POST['student_phone'] ?? ''),
        trim($_POST['father_name']),      trim($_POST['father_last_name'] ?? ''),
        trim($_POST['father_education']), trim($_POST['father_birth_date'] ?? ''),
        trim($_POST['father_job']),       trim($_POST['mother_name']),
        trim($_POST['mother_last_name'] ?? ''), trim($_POST['mother_education']),
        trim($_POST['mother_birth_date'] ?? ''), trim($_POST['mother_job']),
        trim($_POST['mobile1']),          trim($_POST['mobile2'] ?? ''),
        trim($_POST['mobile3']),
        $karname_file, $photo_file, $hedayat_file,
        $tracking_code,
    ]);

    echo json_encode([
        'success'       => true,
        'message'       => 'ثبت‌نام با موفقیت انجام شد',
        'tracking_code' => $tracking_code,
        'id'            => (int)$pdo->lastInsertId(),
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'خطا در ذخیره‌سازی'], JSON_UNESCAPED_UNICODE);
}