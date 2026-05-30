<?php
require_once __DIR__ . '/config.php';
if (session_status() === PHP_SESSION_NONE) session_start();
setHeaders();

$uploadBaseDir = __DIR__ . '/../uploads/';
$uploadBaseUrl = '../uploads/';

if (!is_dir($uploadBaseDir)) {
    mkdir($uploadBaseDir, 0755, true);
}

$file = $_FILES['file'] ?? null;
if (!$file || $file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'فایلی انتخاب نشده یا خطا در آپلود'], JSON_UNESCAPED_UNICODE);
    exit;
}

$allowedImages = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
$allowedPDF    = ['application/pdf'];
$allowedAll    = array_merge($allowedImages, $allowedPDF);

$mimeType = mime_content_type($file['tmp_name']);
if (!in_array($mimeType, $allowedAll)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'فرمت فایل مجاز نیست'], JSON_UNESCAPED_UNICODE);
    exit;
}

// حداکثر سایز
$maxSize = in_array($mimeType, $allowedPDF) ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'حجم فایل بیش از حد مجاز است'], JSON_UNESCAPED_UNICODE);
    exit;
}

$ext      = in_array($mimeType, $allowedPDF) ? 'pdf' : pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('file_', true) . '.' . strtolower($ext);
$destPath = $uploadBaseDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'خطا در ذخیره فایل روی سرور'], JSON_UNESCAPED_UNICODE);
    exit;
}

$fileUrl = $uploadBaseUrl . $filename;

echo json_encode([
    'success' => true,
    'path'    => $fileUrl,
    'message' => 'فایل با موفقیت آپلود شد'
], JSON_UNESCAPED_UNICODE);