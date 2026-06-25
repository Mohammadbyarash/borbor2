<?php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

$user      = requireAuth();
$pdo       = getDB();
$school_id = (int)$user['school_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'متد نامعتبر'], JSON_UNESCAPED_UNICODE);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$days = max(1, (int)($body['days'] ?? 30));

try {
    // آرشیو همه پیش‌ثبت‌نام‌هایی که از days روز پیش ثبت شدن و هنوز آرشیو نشدن
    $stmt = $pdo->prepare("
        UPDATE registration
        SET is_archived    = 1,
            archived_at    = NOW(),
            archived_reason = CONCAT('آرشیو خودکار پس از ', ?, ' روز')
        WHERE (school_id = ? OR school_id IS NULL)
          AND is_archived = 0
          AND created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
    ");
    $stmt->execute([$days, $school_id, $days]);
    $count = $stmt->rowCount();

    echo json_encode([
        'success'        => true,
        'archived_count' => $count,
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}