<?php
// ==========================================
//  api/auth_check.php
// ==========================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// اگه session داره → OK
if (!empty($_SESSION['user_id'])) {
    return;
}

// اگه session نداره، کوکی borbor_auth رو چک کن
if (!empty($_COOKIE['borbor_auth'])) {
    // پیدا کردن PDO — اگه config لود نشده لودش کن
    if (!function_exists('getDB')) {
        $configPath = __DIR__ . '/config.php';
        if (file_exists($configPath)) require_once $configPath;
    }

    try {
        $pdo = getDB();
        $token = $_COOKIE['borbor_auth'];

        // پیدا کردن user با این token
        // فرض: توی جدول users یه فیلد auth_token داری
        // یا توی یه جدول sessions ذخیره شده
        $stmt = $pdo->prepare("
            SELECT id, school_id, role 
            FROM users 
            WHERE auth_token = ? 
              AND is_archived = 0
            LIMIT 1
        ");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if ($user) {
            // session رو بساز
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['school_id'] = $user['school_id'];
            $_SESSION['role']      = $user['role'];
            return; // OK
        }
    } catch (Exception $e) {
        // ادامه به خطا
    }
}

// همچنین بررسی کوکی borbor_user_id
if (!empty($_COOKIE['borbor_user_id'])) {
    if (!function_exists('getDB')) {
        $configPath = __DIR__ . '/config.php';
        if (file_exists($configPath)) require_once $configPath;
    }

    try {
        $pdo = getDB();
        $userId = (int)$_COOKIE['borbor_user_id'];

        $stmt = $pdo->prepare("
            SELECT id, school_id, role 
            FROM users 
            WHERE id = ? 
              AND is_archived = 0
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user) {
            $_SESSION['user_id']   = $user['id'];
            $_SESSION['school_id'] = $user['school_id'];
            $_SESSION['role']      = $user['role'];
            return; // OK
        }
    } catch (Exception $e) {
        // ادامه به خطا
    }
}

// نه session نه کوکی معتبر → 401
http_response_code(401);
echo json_encode([
    'success'  => false,
    'message'  => 'لطفاً وارد شوید',
    'redirect' => '../html/landing.html'
]);
exit;