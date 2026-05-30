<?php
// api/update_status.php
// مهم: session_start باید قبل از هر header باشه
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

$user = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'متد نامعتبر']);
    exit;
}

$body   = json_decode(file_get_contents('php://input'), true);
$id     = (int)($body['id']     ?? 0);
$status = trim($body['status']  ?? '');

if (!$id || !in_array($status, ['pending', 'accepted', 'rejected'])) {
    echo json_encode(['success' => false, 'message' => 'داده‌های نامعتبر']);
    exit;
}

$pdo       = getDB();
$school_id = (int)$user['school_id'];

$stmt = $pdo->prepare("
    UPDATE registration
    SET status = ?
    WHERE id = ?
      AND (school_id = ? OR school_id IS NULL)
");
$stmt->execute([$status, $id, $school_id]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'message' => 'وضعیت به‌روز شد']);
} else {
    // رکورد وجود داره ولی status همونه (یا school_id مغایر)
    $check = $pdo->prepare("SELECT id FROM registration WHERE id = ?");
    $check->execute([$id]);
    echo $check->fetch()
        ? json_encode(['success' => true,  'message' => 'وضعیت به‌روز شد'])
        : json_encode(['success' => false, 'message' => 'رکورد یافت نشد']);
}