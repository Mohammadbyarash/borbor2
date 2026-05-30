<?php
// api/debug_session.php
// بعد از استفاده حتماً حذف کن!
require_once __DIR__ . '/config.php';
setHeaders();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$pdo = getDB();

// بررسی session
$sessionInfo = [
    'session_keys'  => array_keys($_SESSION),
    'session_data'  => array_map(fn($v) => is_string($v) ? $v : gettype($v), $_SESSION),
    'user_id_check' => $_SESSION['user_id'] ?? $_SESSION['id'] ?? 'NOT FOUND',
];

// تست کوئری registration
try {
    $count = $pdo->query("SELECT COUNT(*) FROM registration")->fetchColumn();
    $sample = $pdo->query("SELECT id, first_name, last_name, school_id, status FROM registration LIMIT 3")->fetchAll();
    $dbInfo = ['registration_count' => $count, 'sample' => $sample];
} catch (Exception $e) {
    $dbInfo = ['error' => $e->getMessage()];
}

echo json_encode([
    'session' => $sessionInfo,
    'db'      => $dbInfo,
    'php'     => PHP_VERSION,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);