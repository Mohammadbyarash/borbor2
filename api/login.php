<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'فقط POST مجاز است']);
    exit;
}

require_once __DIR__ . '/config.php';
$pdo = getDB();

// ── دریافت ورودی ─────────────────────────
$body       = json_decode(file_get_contents('php://input'), true);
$username   = trim($body['username']  ?? '');
$password   = $body['password']       ?? '';
$rememberMe = !empty($body['rememberMe']);

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'نام کاربری و رمز عبور الزامی است']);
    exit;
}

// ── جستجوی یوزر ──────────────────────────
try {
    $stmt = $pdo->prepare(
        'SELECT id, first_name, last_name, username, national_code, password, role, school_id
         FROM users WHERE username = ? OR national_code = ? LIMIT 1'
    );
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'خطای query: ' . $e->getMessage()]);
    exit;
}

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'نام کاربری یا رمز عبور اشتباه است']);
    exit;
}

// ── بررسی رمز ────────────────────────────
$match = false;
if (password_verify($password, $user['password'])) {
    $match = true;
} elseif ($user['password'] === $password) {
    $match = true;
    try {
        $pdo->prepare('UPDATE users SET password=? WHERE id=?')
            ->execute([password_hash($password, PASSWORD_BCRYPT), $user['id']]);
    } catch (PDOException $e) {}
}

if (!$match) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'نام کاربری یا رمز عبور اشتباه است']);
    exit;
}

// ── ساخت token ───────────────────────────
$token     = bin2hex(random_bytes(32));
$expireSec = $rememberMe ? 86400 * 30 : 86400; // 30 روز یا 1 روز
$expiresAt = date('Y-m-d H:i:s', time() + $expireSec);

// ذخیره token در دیتابیس
try {
    // پاک کردن tokenهای قدیمی این کاربر
    $pdo->prepare('DELETE FROM user_tokens WHERE user_id = ? OR expires_at < NOW()')
        ->execute([$user['id']]);

    $pdo->prepare('INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
        ->execute([$user['id'], $token, $expiresAt]);
} catch (PDOException $e) {
    // اگر جدول user_tokens نبود، فقط session استفاده می‌شه
}

// ── session ───────────────────────────────
$_SESSION['borbor_auth']    = true;
$_SESSION['borbor_token']   = $token;
$_SESSION['borbor_user_id'] = $user['id'];
$_SESSION['borbor_role']    = $user['role'];

// ── کوکی ─────────────────────────────────
setcookie('borbor_auth', $token, [
    'expires'  => $rememberMe ? time() + $expireSec : 0,
    'path'     => '/',
    'httponly' => false,
    'samesite' => 'Lax',
]);
setcookie('borbor_user_id', $user['id'], [
    'expires'  => $rememberMe ? time() + $expireSec : 0,
    'path'     => '/',
    'httponly' => false,
    'samesite' => 'Lax',
]);

// ── پاسخ ─────────────────────────────────
echo json_encode([
    'success' => true,
    'token'   => $token,
    'user'    => [
        'id'         => $user['id'],
        'first_name' => $user['first_name'],
        'last_name'  => $user['last_name'],
        'role'       => $user['role'],
        'school_id'  => $user['school_id'],
    ],
    'message' => 'ورود موفقیت‌آمیز بود',
], JSON_UNESCAPED_UNICODE);