<?php
// ==========================================
//  تنظیمات مدیر سیستم
//  فایل: api/settings.php
// ==========================================

error_reporting(0);
ini_set('display_errors', 0);

require_once 'config.php';
require_once 'auth_check.php';

setHeaders();

$pdo    = getDB();
$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? ($_POST['action'] ?? '');

switch ($action) {
    case 'get_profile':     getProfile($pdo, $userId);     break;
    case 'save_profile':    saveProfile($pdo, $userId);    break;
    case 'change_password': changePassword($pdo, $userId); break;
    case 'upload_photo':    uploadPhoto($pdo, $userId);    break;
    case 'save_theme':      saveTheme($pdo, $userId);      break;
    case 'get_theme':       getTheme($pdo, $userId);       break;
    default:
        echo json_encode(['success' => false, 'message' => 'action نامعتبر است']);
}


// ══════════════════════════════════════════════════════════
//  ۱. دریافت اطلاعات پروفایل
// ══════════════════════════════════════════════════════════
function getProfile(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare("
        SELECT id, first_name, last_name, username, national_code,
               mobile, birth_date, photo, role, school_id
        FROM users
        WHERE id = ? AND is_archived = 0
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'کاربر یافت نشد']);
        return;
    }

    $user['photo_url'] = $user['photo'] ? getPhotoUrl($user['photo']) : null;
    echo json_encode(['success' => true, 'user' => $user]);
}


// ══════════════════════════════════════════════════════════
//  ۲. ذخیره اطلاعات پروفایل
// ══════════════════════════════════════════════════════════
function saveProfile(PDO $pdo, int $userId): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $firstName    = trim($input['first_name']    ?? '');
    $lastName     = trim($input['last_name']     ?? '');
    $nationalCode = trim($input['national_code'] ?? '');
    $mobile       = trim($input['mobile']        ?? '');
    $birthDate    = trim($input['birth_date']    ?? '');

    if ($firstName === '' || $lastName === '') {
        echo json_encode(['success' => false, 'message' => 'نام و نام خانوادگی الزامی است']);
        return;
    }
    if ($nationalCode !== '' && !preg_match('/^\d{10}$/', $nationalCode)) {
        echo json_encode(['success' => false, 'message' => 'کد ملی باید ۱۰ رقم باشد']);
        return;
    }
    if ($mobile !== '' && !preg_match('/^09\d{9}$/', $mobile)) {
        echo json_encode(['success' => false, 'message' => 'شماره موبایل معتبر نیست']);
        return;
    }

    $stmt = $pdo->prepare("
        UPDATE users
        SET first_name = ?, last_name = ?, national_code = ?, mobile = ?, birth_date = ?
        WHERE id = ?
    ");
    $stmt->execute([$firstName, $lastName, $nationalCode, $mobile, $birthDate, $userId]);

    $updated = $pdo->prepare("SELECT first_name, last_name, photo, role FROM users WHERE id = ?");
    $updated->execute([$userId]);
    $u = $updated->fetch();

    echo json_encode([
        'success'    => true,
        'message'    => 'اطلاعات پروفایل با موفقیت ذخیره شد',
        'first_name' => $u['first_name'],
        'last_name'  => $u['last_name'],
        'photo_url'  => $u['photo'] ? getPhotoUrl($u['photo']) : null,
        'role'       => $u['role'],
    ]);
}


// ══════════════════════════════════════════════════════════
//  ۳. تغییر نام کاربری و رمز عبور
// ══════════════════════════════════════════════════════════
function changePassword(PDO $pdo, int $userId): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $newUsername = trim($input['new_username']     ?? '');
    $currentPass = trim($input['current_password'] ?? '');
    $newPass     = trim($input['new_password']     ?? '');
    $confirmPass = trim($input['confirm_password'] ?? '');

    $stmt = $pdo->prepare("SELECT username, password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'کاربر یافت نشد']);
        return;
    }

    $passOk = password_verify($currentPass, $user['password'])
           || $currentPass === $user['password'];

    if (!$passOk) {
        echo json_encode(['success' => false, 'message' => 'رمز عبور فعلی اشتباه است']);
        return;
    }

    $fields = [];
    $params = [];

    if ($newUsername !== '' && $newUsername !== $user['username']) {
        if (strlen($newUsername) < 4) {
            echo json_encode(['success' => false, 'message' => 'نام کاربری باید حداقل ۴ کاراکتر باشد']);
            return;
        }
        $check = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $check->execute([$newUsername, $userId]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'این نام کاربری قبلاً استفاده شده است']);
            return;
        }
        $fields[] = 'username = ?';
        $params[] = $newUsername;
    }

    if ($newPass !== '') {
        if (strlen($newPass) < 6) {
            echo json_encode(['success' => false, 'message' => 'رمز جدید باید حداقل ۶ کاراکتر باشد']);
            return;
        }
        if ($newPass !== $confirmPass) {
            echo json_encode(['success' => false, 'message' => 'رمز جدید و تکرار آن یکسان نیستند']);
            return;
        }
        $fields[] = 'password = ?';
        $params[] = password_hash($newPass, PASSWORD_BCRYPT);
    }

    if (empty($fields)) {
        echo json_encode(['success' => false, 'message' => 'هیچ تغییری ثبت نشد']);
        return;
    }

    $params[] = $userId;
    $pdo->prepare('UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?')->execute($params);

    if ($newUsername !== '' && $newUsername !== $user['username']) {
        $_SESSION['username'] = $newUsername;
    }

    echo json_encode(['success' => true, 'message' => 'اطلاعات ورود با موفقیت تغییر کرد']);
}


// ══════════════════════════════════════════════════════════
//  ۴. آپلود عکس پروفایل
// ══════════════════════════════════════════════════════════
function uploadPhoto(PDO $pdo, int $userId): void
{
    if (!isset($_FILES['photo'])) {
        echo json_encode(['success' => false, 'message' => 'فایلی ارسال نشده']);
        return;
    }

    $file    = $_FILES['photo'];
    $maxSize = 1 * 1024 * 1024;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'خطا در آپلود فایل']);
        return;
    }
    if ($file['size'] > $maxSize) {
        echo json_encode(['success' => false, 'message' => 'حجم فایل بیشتر از ۱ مگابایت است']);
        return;
    }

    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
    $allowed  = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mimeType, $allowed)) {
        echo json_encode(['success' => false, 'message' => 'فقط فرمت‌های JPG، PNG و WebP مجاز هستند']);
        return;
    }

    $uploadDir = __DIR__ . '/../uploads/profiles/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $old = $pdo->prepare("SELECT photo FROM users WHERE id = ?");
    $old->execute([$userId]);
    $oldPhoto = $old->fetchColumn();
    if ($oldPhoto && file_exists(__DIR__ . '/../' . $oldPhoto)) {
        @unlink(__DIR__ . '/../' . $oldPhoto);
    }

    $ext = match($mimeType) {
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
    };
    $filename = 'user_' . $userId . '_' . time() . '.' . $ext;
    $destPath = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        echo json_encode(['success' => false, 'message' => 'خطا در ذخیره فایل روی سرور']);
        return;
    }

    $relativePath = 'uploads/profiles/' . $filename;
    $pdo->prepare("UPDATE users SET photo = ? WHERE id = ?")->execute([$relativePath, $userId]);

    echo json_encode([
        'success'   => true,
        'message'   => 'عکس پروفایل با موفقیت ذخیره شد',
        'photo_url' => getPhotoUrl($relativePath),
    ]);
}


// ══════════════════════════════════════════════════════════
//  ۵. ذخیره تم
// ══════════════════════════════════════════════════════════
function saveTheme(PDO $pdo, int $userId): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) $input = $_POST;

    $stmt = $pdo->prepare("SELECT school_id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $schoolId = $stmt->fetchColumn();

    if (!$schoolId) {
        echo json_encode(['success' => false, 'message' => 'مدرسه‌ای برای این کاربر تعریف نشده']);
        return;
    }

    $themeName      = trim($input['name']             ?? 'سفارشی');
    $primaryColor   = trim($input['primary_color']    ?? '#4a90d9');
    $secondaryColor = trim($input['secondary_color']  ?? '#0f1629');
    $font           = trim($input['font']             ?? 'Vazirmatn');

    foreach ([$primaryColor, $secondaryColor] as $color) {
        if (!preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            echo json_encode(['success' => false, 'message' => 'فرمت رنگ نامعتبر است: ' . $color]);
            return;
        }
    }

    $pdo->prepare("UPDATE themes SET is_active = 0 WHERE school_id = ?")->execute([$schoolId]);

    $existing = $pdo->prepare("SELECT id FROM themes WHERE school_id = ? AND name = ?");
    $existing->execute([$schoolId, $themeName]);
    $existingId = $existing->fetchColumn();

    if ($existingId) {
        $pdo->prepare("
            UPDATE themes
            SET primary_color = ?, secondary_color = ?, font = ?, is_active = 1
            WHERE id = ?
        ")->execute([$primaryColor, $secondaryColor, $font, $existingId]);
    } else {
        // ✅ باگ کاما اضافه برطرف شد
        $pdo->prepare("
            INSERT INTO themes (school_id, name, primary_color, secondary_color, font, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        ")->execute([$schoolId, $themeName, $primaryColor, $secondaryColor, $font]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'تم با موفقیت ذخیره شد',
        'theme'   => [
            'name'            => $themeName,
            'primary_color'   => $primaryColor,
            'secondary_color' => $secondaryColor,
            'font'            => $font,
        ],
    ]);
}


// ══════════════════════════════════════════════════════════
//  ۶. دریافت تم فعال
// ══════════════════════════════════════════════════════════
function getTheme(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare("SELECT school_id FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $schoolId = $stmt->fetchColumn();

    if (!$schoolId) {
        echo json_encode(['success' => true, 'theme' => null]);
        return;
    }

    $theme = $pdo->prepare("
        SELECT name, primary_color, secondary_color, font
        FROM themes
        WHERE school_id = ? AND is_active = 1
        ORDER BY id DESC
        LIMIT 1
    ");
    $theme->execute([$schoolId]);
    $result = $theme->fetch();

    echo json_encode(['success' => true, 'theme' => $result ?: null]);
}


// ══════════════════════════════════════════════════════════
//  Helper
// ══════════════════════════════════════════════════════════
function getPhotoUrl(string $path): string
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host     = $_SERVER['HTTP_HOST'] ?? 'localhost';

    // مسیر فعلی اسکریپت رو پیدا میکنیم
    // api/settings.php → باید بره به ریشه پروژه
    $scriptDir   = dirname($_SERVER['SCRIPT_NAME']); // مثلاً /borbor/api
    $projectRoot = dirname($scriptDir);              // مثلاً /borbor

    // اطمینان از اینکه / آخرش داره
    $projectRoot = rtrim($projectRoot, '/') . '/';

    return $protocol . '://' . $host . $projectRoot . ltrim($path, '/');
}