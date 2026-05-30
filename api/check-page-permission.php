<?php
// ============================================================
//  check-page-permission.php
//  حالت ①: GET ?page=Teacher_management   → چک صفحه
//  حالت ②: GET ?perm=افزودن+معلم&level=write → چک عملیات
// ============================================================
session_start();
require_once 'config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

$user = getAuthUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success'=>false,'allowed'=>false,'message'=>'احراز هویت نشده'], JSON_UNESCAPED_UNICODE);
    exit;
}

$role      = $user['role'];
$school_id = (int)$user['school_id'];
$is_owner  = ($role === 'owner');

// owner/manager همه دسترسی‌ها رو دارن
if (in_array($role, ['owner','manager'])) {
    echo json_encode(['success'=>true,'allowed'=>true,'level'=>'both','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
    exit;
}

$col = match($role) {
    'teacher'        => 'teacher_access',
    'vice_principal' => 'vice_principal_access',
    'assistant'      => 'vice_principal_access',
    'student'        => 'student_access',
    'parent'         => 'parent_access',
    default          => null
};

if (!$col) {
    echo json_encode(['success'=>true,'allowed'=>false,'level'=>'none','role'=>$role,'is_owner'=>false], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo  = getDB();
$page = trim($_GET['page'] ?? '');

// ── حالت ①: چک صفحه ─────────────────────────────────────────
if ($page !== '') {
    // داشبورد همیشه باز است
    if ($page === 'dashbord') {
        echo json_encode(['success'=>true,'allowed'=>true,'level'=>'read','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT {$col} AS level, is_owner_only
        FROM permissions
        WHERE school_id = ? AND page_key = ?
        ORDER BY id ASC
        LIMIT 1
    ");
    $stmt->execute([$school_id, $page]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        // تعریف نشده = باز
        echo json_encode(['success'=>true,'allowed'=>true,'level'=>'none','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $level = $row['level'];

    // صفحات owner_only: اگه level=read داره می‌تونه ببینه ولی نمی‌تونه ویرایش کنه
    // اگه اصلاً دسترسی نداره (none) → block کن
    if ($row['is_owner_only'] && !$is_owner) {
        // فقط read اجازه داره، write/both هم فقط read حساب میشه
        if (!in_array($level, ['read','write','both'])) {
            echo json_encode(['success'=>true,'allowed'=>false,'level'=>'none','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // می‌تونه ببینه ولی level رو read نشون بده (ویرایش نمی‌تونه)
        echo json_encode(['success'=>true,'allowed'=>true,'level'=>'read','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $allowed = in_array($level, ['read','write','both']);
    echo json_encode(['success'=>true,'allowed'=>$allowed,'level'=>$level,'role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── حالت ②: چک عملیات ───────────────────────────────────────
$permName = trim($_GET['perm']  ?? '');
$required = trim($_GET['level'] ?? 'read');

if ($permName === '') {
    http_response_code(400);
    echo json_encode(['success'=>false,'allowed'=>false,'message'=>'page یا perm الزامی است'], JSON_UNESCAPED_UNICODE);
    exit;
}

$stmt = $pdo->prepare("
    SELECT {$col} AS level
    FROM permissions
    WHERE school_id = ? AND name = ?
    ORDER BY id DESC
    LIMIT 1
");
$stmt->execute([$school_id, $permName]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(['success'=>true,'allowed'=>true,'level'=>'none','role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
    exit;
}

$level   = $row['level'];
$allowed = $required === 'write'
    ? in_array($level, ['write','both'])
    : in_array($level, ['read','write','both']);

echo json_encode(['success'=>true,'allowed'=>$allowed,'level'=>$level,'required'=>$required,'role'=>$role,'is_owner'=>$is_owner], JSON_UNESCAPED_UNICODE);
