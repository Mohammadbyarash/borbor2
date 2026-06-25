<?php
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

$user      = requireAuth();
$pdo       = getDB();
$school_id = (int)$user['school_id'];

if (!empty($_GET['stats_only'])) {
    echo json_encode(['success' => true, 'stats' => getStats($pdo, $school_id)]);
    exit;
}

$search = trim($_GET['search'] ?? '');
$grade  = trim($_GET['grade']  ?? '');
$status = trim($_GET['status'] ?? '');

$gradeMap = [
    'دهم'     => 'tenth',
    'یازدهم'  => 'eleventh',
    'دوازدهم' => 'twelfth',
];

$conditions = ['(r.school_id = :school_id OR r.school_id IS NULL)', 'r.is_archived = 0'];
$params     = [':school_id' => $school_id];

if ($search !== '') {
    $conditions[] = "(r.first_name LIKE :search
                   OR r.last_name  LIKE :search
                   OR r.national_code LIKE :search
                   OR r.mobile1 LIKE :search
                   OR r.tracking_code LIKE :search)";
    $params[':search'] = "%{$search}%";
}
if ($grade !== '') {
    $conditions[]     = "r.grade = :grade";
    $params[':grade'] = $gradeMap[$grade] ?? $grade;
}
if ($status !== '' && in_array($status, ['pending', 'accepted', 'rejected'])) {
    $conditions[]      = "r.status = :status";
    $params[':status'] = $status;
}

$where = implode(' AND ', $conditions);
$stmt  = $pdo->prepare("SELECT * FROM registration r WHERE {$where} ORDER BY r.created_at DESC");
$stmt->execute($params);
$rows = $stmt->fetchAll();

$gradeDisplay = [
    'tenth'    => 'دهم',
    'eleventh' => 'یازدهم',
    'twelfth'  => 'دوازدهم',
];
$majorDisplay = [
    'electronics' => 'الکترونیک',
    'software'    => 'شبکه و نرم‌افزار',
    'computers'   => 'کامپیوتر',
];
$eduDisplay = [
    'bisavad'               => 'بی‌سواد',
    'nahzat'                => 'نهضت سواد آموزی',
    'ebtida'                => 'ابتدایی',
    'sikol'                 => 'سیکل',
    'diplom'                => 'دیپلم',
    'fawq_diplom'           => 'فوق دیپلم',
    'karshenas'             => 'کارشناسی (لیسانس)',
    'karshenas_napeyvaeste' => 'کارشناسی ناپیوسته',
    'karshenas_arshad'      => 'کارشناسی ارشد',
    'doktori'               => 'دکتری',
    'fawq_doktori'          => 'فوق دکتری',
];

$uploadBase = '../uploads/registrations/';

$registrations = array_map(fn($r) => [
    'registrationId'    => $r['id'],
    'trackingCode'      => $r['tracking_code']   ?? '',
    'studentName'       => $r['first_name']       ?? '',
    'studentFamily'     => $r['last_name']         ?? '',
    'studentNationalId' => $r['national_code']     ?? '',
    'studentBirthDate'  => $r['birth_date']        ?? '',
    'studentGradeRaw'   => $r['grade']             ?? '',
    'studentGrade'      => $gradeDisplay[$r['grade']] ?? $r['grade'],
    'studentMajor'      => $majorDisplay[$r['major']]  ?? $r['major'],
    'studentPhone'      => $r['student_phone']     ?? '',
    'fatherName'        => $r['father_name']       ?? '',
    'fatherFamily'      => $r['father_last_name']  ?? '',
    'fatherBirthDate'   => $r['father_birth_date'] ?? '',
    'fatherEducation'   => $eduDisplay[$r['father_education']] ?? $r['father_education'],
    'fatherJob'         => $r['father_job']        ?? '',
    'fatherPhone'       => $r['mobile1']           ?? '',
    'motherName'        => $r['mother_name']       ?? '',
    'motherFamily'      => $r['mother_last_name']  ?? '',
    'motherBirthDate'   => $r['mother_birth_date'] ?? '',
    'motherEducation'   => $eduDisplay[$r['mother_education']] ?? $r['mother_education'],
    'motherJob'         => $r['mother_job']        ?? '',
    'motherPhone'       => $r['mobile3']           ?? '',
    'secondPhone'       => $r['mobile2']           ?? '',
    'status'            => $r['status']            ?? 'pending',
    'archived'          => (bool)($r['is_archived'] ?? false),  // ← اضافه شد
    'createdAt'         => $r['created_at']        ?? '',
    'photo'      => $r['photo_file']    ? $uploadBase . $r['photo_file']   : null,
    'reportCard' => $r['karname_file']  ? $uploadBase . $r['karname_file'] : null,
    'guidanceDoc'=> $r['hedayat_file']  ? $uploadBase . $r['hedayat_file'] : null,
], $rows);

echo json_encode([
    'success'       => true,
    'registrations' => $registrations,
    'stats'         => getStats($pdo, $school_id),
], JSON_UNESCAPED_UNICODE);

function getStats(PDO $pdo, int $school_id): array {
    $stmt = $pdo->prepare("
        SELECT
            COUNT(*)                     AS total,
            SUM(status = 'pending')      AS pending,
            SUM(status = 'accepted')     AS accepted,
            SUM(status = 'rejected')     AS rejected
        FROM registration
        WHERE school_id = :sid OR school_id IS NULL
    ");
    $stmt->execute([':sid' => $school_id]);
    $row = $stmt->fetch();
    return [
        'total'    => (int)($row['total']    ?? 0),
        'pending'  => (int)($row['pending']  ?? 0),
        'accepted' => (int)($row['accepted'] ?? 0),
        'rejected' => (int)($row['rejected'] ?? 0),
    ];
}