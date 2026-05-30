<?php
// api/edit_registration.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
setHeaders();

// ===== Rate Limiting =====
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$cacheDir = __DIR__ . '/cache/';
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
$rateFile = $cacheDir . 'rle_' . md5($ip) . '.json';
$now      = time();
$rd       = file_exists($rateFile) ? (json_decode(file_get_contents($rateFile), true) ?? []) : [];
$rd       = array_values(array_filter($rd, fn($t) => ($now - $t) < 60));
if (count($rd) >= 5) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'تعداد درخواست زیاد. لطفاً کمی صبر کنید.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$rd[] = $now;
file_put_contents($rateFile, json_encode($rd));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'متد نامعتبر'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo           = getDB();
$tracking_code = strtoupper(trim($_POST['tracking_code'] ?? ''));

if (!$tracking_code) {
    echo json_encode(['success' => false, 'message' => 'کد پیگیری الزامی است'], JSON_UNESCAPED_UNICODE);
    exit;
}

$reg = $pdo->prepare("SELECT id, status FROM registration WHERE tracking_code = ? LIMIT 1");
$reg->execute([$tracking_code]);
$row = $reg->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'کد پیگیری یافت نشد'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($row['status'] !== 'pending') {
    echo json_encode(['success' => false, 'message' => 'امکان ویرایش وجود ندارد — وضعیت درخواست قطعی شده است.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$reg_id = (int)$row['id'];

// ===== آپلود فایل‌های جدید (اختیاری) =====
$uploadDir = __DIR__ . '/../uploads/registrations/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

function uploadFileEdit(string $field, string $prefix, string $dir): ?string {
    if (empty($_FILES[$field]['name']) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return null;
    $file = $_FILES[$field];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','pdf'])) return null;
    if ($file['size'] > 5 * 1024 * 1024) return null;
    $name = $prefix . '_' . bin2hex(random_bytes(8)) . '.' . $ext;
    return move_uploaded_file($file['tmp_name'], $dir . $name) ? $name : null;
}

$newKarname = uploadFileEdit('karname_file', 'karname', $uploadDir);
$newPhoto   = uploadFileEdit('photo_file',   'photo',   $uploadDir);
$newHedayat = uploadFileEdit('hedayat_file', 'hedayat', $uploadDir);

// ===== فیلدهای متنی قابل ویرایش — نام‌ها دقیقاً طبق DB =====
$allowedFields = [
    'first_name', 'last_name', 'national_code', 'birth_date', 'student_phone',
    'father_name', 'father_last_name', 'father_education', 'father_birth_date', 'father_job',
    'mother_name', 'mother_last_name', 'mother_education', 'mother_birth_date', 'mother_job',
    'mobile1', 'mobile2', 'mobile3',
];

$sets   = [];
$params = [];

foreach ($allowedFields as $f) {
    if (array_key_exists($f, $_POST)) {
        $sets[]   = "`{$f}` = ?";
        $params[] = trim($_POST[$f]);
    }
}

if ($newKarname) { $sets[] = '`karname_file` = ?'; $params[] = $newKarname; }
if ($newPhoto)   { $sets[] = '`photo_file` = ?';   $params[] = $newPhoto; }
if ($newHedayat) { $sets[] = '`hedayat_file` = ?'; $params[] = $newHedayat; }

if (empty($sets)) {
    echo json_encode(['success' => false, 'message' => 'هیچ تغییری ارسال نشد'], JSON_UNESCAPED_UNICODE);
    exit;
}

$params[] = $reg_id;
try {
    $pdo->prepare("UPDATE registration SET " . implode(', ', $sets) . " WHERE id = ?")
        ->execute($params);
    echo json_encode(['success' => true, 'message' => 'اطلاعات با موفقیت ویرایش شد'], JSON_UNESCAPED_UNICODE);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'خطا در ذخیره‌سازی'], JSON_UNESCAPED_UNICODE);
}