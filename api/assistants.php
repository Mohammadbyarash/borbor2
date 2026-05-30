<?php
ob_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permission_guard.php';
setHeaders();
$guard     = new PermissionGuard('مدیریت معاونان');
$guard->autoCheck();
$pdo       = getDB();
$school_id = $guard->schoolId();
$method    = $_SERVER['REQUEST_METHOD'];

// ── GET: لیست معاونان ────────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("
            SELECT id, first_name, last_name, mobile, national_code, username, created_at
            FROM users
            WHERE role = 'assistant' AND school_id = ? AND is_archived = 0
            ORDER BY created_at DESC
        ");
        $stmt->execute([$school_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        ob_clean();
        echo json_encode(['success' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── POST: افزودن معاون جدید ──────────────────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $firstName    = trim($body['first_name']    ?? '');
    $lastName     = trim($body['last_name']     ?? '');
    $mobile       = trim($body['mobile']        ?? '');
    $nationalCode = trim($body['national_code'] ?? '');
    $username     = trim($body['username']      ?? $nationalCode);
    $password     = trim($body['password']      ?? $nationalCode);

    if (!$firstName || !$mobile || !$nationalCode) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'فیلدهای الزامی (نام، موبایل، کد ملی) پر نشده'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!preg_match('/^09\d{9}$/', $mobile)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'فرمت موبایل صحیح نیست (مثال: 09123456789)'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!preg_match('/^\d{10}$/', $nationalCode)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'کد ملی باید ۱۰ رقم باشد'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (strlen($password) < 6) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'رمز عبور باید حداقل ۶ کاراکتر باشد'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!$username) {
        $username = $nationalCode;
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE national_code = ? OR username = ? LIMIT 1");
    $check->execute([$nationalCode, $username]);
    if ($check->fetch()) {
        ob_clean();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'کد ملی یا نام کاربری قبلاً ثبت شده'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (school_id, role, first_name, last_name, mobile, national_code, username, password)
            VALUES (?, 'assistant', ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $school_id, $firstName, $lastName, $mobile,
            $nationalCode, $username,
            password_hash($password, PASSWORD_BCRYPT),
        ]);
        $newId = $pdo->lastInsertId();
        ob_clean();
        echo json_encode(['success' => true, 'message' => 'معاون با موفقیت اضافه شد', 'id' => $newId], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── PUT: ویرایش معاون ────────────────────────────────────────────────────────
if ($method === 'PUT') {
    $body = json_decode(file_get_contents('php://input'), true);

    $id           = (int)($body['id']            ?? 0);
    $firstName    = trim($body['first_name']    ?? '');
    $lastName     = trim($body['last_name']     ?? '');
    $mobile       = trim($body['mobile']        ?? '');
    $nationalCode = trim($body['national_code'] ?? '');

    if (!$id || !$firstName || !$mobile || !$nationalCode) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'فیلدهای الزامی پر نشده'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE users SET first_name=?, last_name=?, mobile=?, national_code=?
            WHERE id=? AND role='assistant' AND school_id=?
        ");
        $stmt->execute([$firstName, $lastName, $mobile, $nationalCode, $id, $school_id]);
        ob_clean();
        echo json_encode(['success' => true, 'message' => 'اطلاعات به‌روزرسانی شد'], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── DELETE (آرشیو) ───────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id   = (int)($body['id'] ?? 0);

    if (!$id) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'id الزامی است'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        // بررسی اینکه معاون متعلق به همین مدرسه باشه و آرشیو نشده باشه
        $chk = $pdo->prepare("SELECT id FROM users WHERE id=? AND school_id=? AND role='assistant' AND is_archived=0");
        $chk->execute([$id, $school_id]);
        if (!$chk->fetch()) {
            ob_clean();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'معاون یافت نشد یا قبلاً آرشیو شده'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // آرشیو کردن به جای حذف
        $stmt = $pdo->prepare("
            UPDATE users
            SET is_archived = 1, archived_at = NOW(), archived_reason = 'آرشیو توسط مدیر'
            WHERE id = ? AND school_id = ? AND role = 'assistant'
        ");
        $stmt->execute([$id, $school_id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'معاون با موفقیت آرشیو شد'], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

ob_clean();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);