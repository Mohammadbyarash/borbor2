<?php
ob_start();
require_once __DIR__ . '/config.php';
setHeaders();

if (session_status() === PHP_SESSION_NONE) session_start();

$method = $_SERVER['REQUEST_METHOD'];

// ── POST: ثبت پیش‌ثبت‌نام ──────────────────────────────────────────────────
if ($method === 'POST') {
    $pdo = getDB();

    // دریافت فیلدهای متنی از فرم multipart
    $firstName       = trim($_POST['first_name']        ?? '');
    $lastName        = trim($_POST['last_name']         ?? '');
    $nationalCode    = trim($_POST['national_code']     ?? '');
    $grade           = trim($_POST['grade']             ?? '');
    $major           = trim($_POST['major']             ?? '');
    $birthDate       = trim($_POST['birth_date']        ?? '');
    $fatherName      = trim($_POST['father_name']       ?? '');
    $fatherEducation = trim($_POST['father_education']  ?? '');
    $fatherJob       = trim($_POST['father_job']        ?? '');
    $motherName      = trim($_POST['mother_name']       ?? '');
    $motherEducation = trim($_POST['mother_education']  ?? '');
    $motherJob       = trim($_POST['mother_job']        ?? '');
    $mobile1         = trim($_POST['mobile1']           ?? ''); // شماره پدر
    $mobile2         = trim($_POST['mobile2']           ?? ''); // شماره اختیاری دوم
    $mobile3         = trim($_POST['mobile3']           ?? ''); // شماره مادر

    // اعتبارسنجی فیلدهای اجباری
    if (!$firstName || !$lastName || !$nationalCode || !$grade || !$major ||
        !$birthDate || !$fatherName || !$fatherEducation || !$fatherJob ||
        !$motherName || !$motherEducation || !$motherJob || !$mobile1 || !$mobile3) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'فیلدهای الزامی پر نشده'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // اعتبارسنجی کد ملی
    if (!preg_match('/^\d{10}$/', $nationalCode)) {
        ob_clean();
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'کد ملی معتبر نیست'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // بررسی ثبت قبلی کد ملی
    $check = $pdo->prepare("SELECT id FROM registration WHERE national_code = ? LIMIT 1");
    $check->execute([$nationalCode]);
    if ($check->fetch()) {
        ob_clean();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'این کد ملی قبلاً ثبت شده است'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // ── آپلود فایل‌ها ──────────────────────────────────────────────────────
    $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $allowedImages = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    $allowedPDF    = ['application/pdf'];
    $allowedAll    = array_merge($allowedImages, $allowedPDF);
    $maxSize       = 5 * 1024 * 1024; // 5MB

    function uploadFile($fileKey, $uploadDir, $allowedAll, $maxSize) {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => "خطا در آپلود فایل: $fileKey"];
        }
        $file = $_FILES[$fileKey];
        $mime = mime_content_type($file['tmp_name']);
        if (!in_array($mime, $allowedAll)) {
            return ['success' => false, 'message' => 'فرمت فایل مجاز نیست'];
        }
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'حجم فایل بیش از حد مجاز است'];
        }
        $ext      = in_array($mime, ['application/pdf']) ? 'pdf' : strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = uniqid('reg_', true) . '.' . $ext;
        $dest     = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            return ['success' => false, 'message' => 'خطا در ذخیره فایل'];
        }
        return ['success' => true, 'path' => '../uploads/' . $filename];
    }

    // کارنامه (اجباری)
    $karname = uploadFile('karname_file', $uploadDir, $allowedAll, $maxSize);
    if (!$karname['success']) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success' => false, 'message' => $karname['message']], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // عکس (اجباری)
    $photo = uploadFile('photo_file', $uploadDir, $allowedAll, $maxSize);
    if (!$photo['success']) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success' => false, 'message' => $photo['message']], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // هدایت تحصیلی (اختیاری — فقط پایه دهم)
    $hedayatPath = null;
    if (isset($_FILES['hedayat_file']) && $_FILES['hedayat_file']['error'] === UPLOAD_ERR_OK) {
        $hedayat = uploadFile('hedayat_file', $uploadDir, $allowedAll, $maxSize);
        if (!$hedayat['success']) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => $hedayat['message']], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $hedayatPath = $hedayat['path'];
    }

    // ── تولید کد رهگیری ──────────────────────────────────────────────────
    $trackingCode = strtoupper(substr(md5($nationalCode . time()), 0, 8));

    // ── درج در دیتابیس ────────────────────────────────────────────────────
    try {
        $stmt = $pdo->prepare("
            INSERT INTO registration
                (first_name, last_name, national_code, grade, major, birth_date,
                 father_name, father_education, father_job,
                 mother_name, mother_education, mother_job,
                 mobile1, mobile2, mobile3,
                 karname_file, photo_file, hedayat_file,
                 tracking_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $firstName, $lastName, $nationalCode, $grade, $major, $birthDate,
            $fatherName, $fatherEducation, $fatherJob,
            $motherName, $motherEducation, $motherJob,
            $mobile1, $mobile2 ?: null, $mobile3,
            $karname['path'], $photo['path'], $hedayatPath,
            $trackingCode
        ]);

        ob_clean();
        echo json_encode([
            'success'       => true,
            'message'       => 'پیش‌ثبت‌نام با موفقیت ثبت شد',
            'tracking_code' => $trackingCode,
        ], JSON_UNESCAPED_UNICODE);

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