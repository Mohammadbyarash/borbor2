<?php
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';
header('Content-Type: application/json; charset=utf-8');

$user = getAuthUser();
$pdo  = getDB();

$out = [];
$out['user_role']   = $user['role'] ?? null;
$out['school_id']   = $user['school_id'] ?? null;

// roleColumn چی میشه؟
$roleColumn = match($user['role'] ?? '') {
    'teacher'                    => 'teacher_access',
    'vice_principal', 'assistant'=> 'vice_principal_access',
    'student'                    => 'student_access',
    'parent'                     => 'parent_access',
    default                      => null
};
$out['roleColumn'] = $roleColumn;

// has page_key?
$cols = $pdo->query("SHOW COLUMNS FROM permissions")->fetchAll(PDO::FETCH_COLUMN);
$out['has_page_key'] = in_array('page_key', $cols);

// query مستقیم
if ($roleColumn) {
    $stmt = $pdo->prepare("
        SELECT page_key, {$roleColumn} AS access_level
        FROM permissions
        WHERE school_id = ?
          AND page_key IS NOT NULL
          AND page_key != ''
    ");
    $stmt->execute([$user['school_id']]);
    $out['page_rows'] = $stmt->fetchAll();

    // فیلتر allowed
    $out['allowed'] = array_values(array_map(
        fn($r) => $r['page_key'],
        array_filter($out['page_rows'], fn($r) => in_array($r['access_level'], ['read','write','both']))
    ));
}

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);