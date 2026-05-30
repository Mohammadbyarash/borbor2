<?php
session_start();
require_once 'config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

$user = getAuthUser();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success'=>false,'allowed'=>[]], JSON_UNESCAPED_UNICODE);
    exit;
}

// owner و manager همه صفحات رو می‌بینن
if (in_array($user['role'], ['owner','manager'])) {
    echo json_encode(['success'=>true,'all'=>true], JSON_UNESCAPED_UNICODE);
    exit;
}

$col = match($user['role']) {
    'teacher'        => 'teacher_access',
    'vice_principal' => 'vice_principal_access',
    'assistant'      => 'vice_principal_access',
    'student'        => 'student_access',
    'parent'         => 'parent_access',
    default          => null
};

if (!$col) {
    echo json_encode(['success'=>true,'all'=>false,'allowed'=>[]], JSON_UNESCAPED_UNICODE);
    exit;
}

$pdo = getDB();

// صفحاتی که این کاربر دسترسی داره (فقط از طریق page_key، is_owner_only = 0)
$stmt = $pdo->prepare("
    SELECT page_key
    FROM permissions
    WHERE school_id    = ?
      AND page_key     IS NOT NULL
      AND page_key     != ''
      AND is_owner_only = 0
      AND {$col}       IN ('read','write','both')
");
$stmt->execute([$user['school_id']]);
$allowed = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(['success'=>true,'all'=>false,'allowed'=>$allowed], JSON_UNESCAPED_UNICODE);
