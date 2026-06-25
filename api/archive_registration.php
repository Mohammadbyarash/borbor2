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

$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = trim($body['action'] ?? '');
$id     = (int)($body['id']   ?? 0);

if (!$id || !in_array($action, ['archive', 'unarchive'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'داده‌های نامعتبر'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($action === 'archive') {
        $stmt = $pdo->prepare("
            UPDATE registration
            SET is_archived=1, archived_at=NOW(), archived_reason='آرشیو توسط مدیر'
            WHERE id=? AND (school_id=? OR school_id IS NULL) AND is_archived=0
        ");
    } else {
        $stmt = $pdo->prepare("
            UPDATE registration
            SET is_archived=0, archived_at=NULL, archived_reason=NULL
            WHERE id=? AND (school_id=? OR school_id IS NULL) AND is_archived=1
        ");
    }
    $stmt->execute([$id, $school_id]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'رکورد پیدا نشد یا وضعیت تغییر نکرد'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}