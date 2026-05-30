<?php
// api/check_status.php

// api/check_status.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
setHeaders();

// ===== Rate Limiting =====
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$cacheDir = __DIR__ . '/cache/';
if (!is_dir($cacheDir)) mkdir($cacheDir, 0755, true);
$rateFile = $cacheDir . 'rl_' . md5($ip) . '.json';
$now      = time();
$rd       = file_exists($rateFile) ? (json_decode(file_get_contents($rateFile), true) ?? []) : [];
$rd       = array_values(array_filter($rd, fn($t) => ($now - $t) < 60));
if (count($rd) >= 30) {
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'درخواست زیاد. لطفاً کمی صبر کنید.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$rd[] = $now;
file_put_contents($rateFile, json_encode($rd));

// ===== tracking_code =====
$raw = $_GET['tracking_code']
    ?? (json_decode(file_get_contents('php://input'), true)['tracking_code'] ?? '');
$tracking_code = strtoupper(trim($raw));

if (strlen($tracking_code) < 4) {
    echo json_encode(['success' => false, 'message' => 'کد پیگیری معتبر نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo  = getDB();
// ستون‌های دقیق از DB:
// id, school_id, first_name, last_name, national_code, grade, major,
// birth_date, student_phone, father_name, father_last_name, father_education,
// father_birth_date, father_job, mother_name, mother_last_name, mother_education,
// mother_birth_date, mother_job, mobile1, mobile2, mobile3,
// karname_file, photo_file, hedayat_file, created_at, tracking_code, status
$stmt = $pdo->prepare("SELECT * FROM registration WHERE tracking_code = ? LIMIT 1");
$stmt->execute([$tracking_code]);
$r = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$r) {
    echo json_encode(['success' => false, 'message' => 'کد پیگیری یافت نشد'], JSON_UNESCAPED_UNICODE);
    exit;
}

// نگاشت‌ها
$gradeD = ['tenth' => 'دهم', 'eleventh' => 'یازدهم', 'twelfth' => 'دوازدهم'];
$majorD = ['electronics' => 'الکترونیک', 'software' => 'شبکه و نرم‌افزار', 'computers' => 'کامپیوتر'];
$eduD   = [
    'bisavad' => 'بی‌سواد', 'nahzat' => 'نهضت سواد آموزی', 'ebtida' => 'ابتدایی',
    'sikol' => 'سیکل', 'diplom' => 'دیپلم', 'fawq_diplom' => 'فوق دیپلم',
    'karshenas' => 'کارشناسی (لیسانس)', 'karshenas_napeyvaeste' => 'کارشناسی ناپیوسته',
    'karshenas_arshad' => 'کارشناسی ارشد', 'doktori' => 'دکتری', 'fawq_doktori' => 'فوق دکتری',
];

// مسیر فایل از سمت HTML
$base = '../uploads/registrations/';

echo json_encode([
    'success' => true,
    'status'  => $r['status'],
    'data'    => [
        'id'                  => $r['id'],
        'trackingCode'        => $r['tracking_code'],
        'status'              => $r['status'],
        'firstName'           => $r['first_name'],
        'lastName'            => $r['last_name'],
        'nationalCode'        => $r['national_code'],
        'birthDate'           => $r['birth_date'],
        'grade'               => $gradeD[$r['grade']] ?? $r['grade'],
        'gradeRaw'            => $r['grade'],
        'major'               => $majorD[$r['major']] ?? $r['major'],
        'majorRaw'            => $r['major'],
        'studentPhone'        => $r['student_phone']    ?? '',
        'fatherName'          => $r['father_name'],
        'fatherLastName'      => $r['father_last_name'] ?? '',
        'fatherEducation'     => $eduD[$r['father_education']] ?? $r['father_education'],
        'fatherEducationRaw'  => $r['father_education'],
        'fatherBirthDate'     => $r['father_birth_date'] ?? '',
        'fatherJob'           => $r['father_job']        ?? '',
        'fatherPhone'         => $r['mobile1'],
        'motherName'          => $r['mother_name'],
        'motherLastName'      => $r['mother_last_name']  ?? '',
        'motherEducation'     => $eduD[$r['mother_education']] ?? $r['mother_education'],
        'motherEducationRaw'  => $r['mother_education'],
        'motherBirthDate'     => $r['mother_birth_date'] ?? '',
        'motherJob'           => $r['mother_job']        ?? '',
        'motherPhone'         => $r['mobile3'],
        'secondPhone'         => $r['mobile2']           ?? '',
        'createdAt'           => $r['created_at'],
        'photo'               => $r['photo_file']    ? $base . $r['photo_file']    : null,
        'reportCard'          => $r['karname_file']  ? $base . $r['karname_file']  : null,
        'guidanceDoc'         => $r['hedayat_file']  ? $base . $r['hedayat_file']  : null,
    ],
], JSON_UNESCAPED_UNICODE);