<?php
/**
 * holiday_proxy.php
 * دریافت تعطیلات جلالی از holidayapi.ir
 * با DNS اختصاصی برای دور زدن فیلتر
 */
if (session_status() === PHP_SESSION_NONE) session_start();

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$year = (int)($_GET['year'] ?? 0);
if (!$year || $year < 1300 || $year > 1500) {
    echo json_encode(['success' => false, 'message' => 'سال نامعتبر']);
    exit;
}

// ── کش در فایل (یه بار fetch، بقیه از کش) ──────────────────────────────────
$cacheDir  = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/holidays_' . $year . '.json';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// اگه کش وجود داشت و کمتر از ۳۰ روز پیش ساخته شده، برگردون
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 86400 * 30) {
    echo file_get_contents($cacheFile);
    exit;
}

// ── fetch با curl و DNS اختصاصی ─────────────────────────────────────────────
$url = "https://holidayapi.ir/jalali/{$year}";

// DNS سرورها برای دور زدن فیلتر
$dnsServers = ['5.200.200.200', '8.8.8.8'];

$result = null;
foreach ($dnsServers as $dns) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERAGENT      => 'Mozilla/5.0',
        // DNS اختصاصی برای این request
        CURLOPT_DNS_SERVERS    => $dns,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if (!$error && $httpCode === 200 && $response) {
        $decoded = json_decode($response, true);
        if (is_array($decoded)) {
            $result = $decoded;
            break; // موفق بود، از loop خارج شو
        }
    }
}

// ── ساخت response ────────────────────────────────────────────────────────────
if ($result !== null) {
    $out = json_encode(['success' => true, 'data' => $result], JSON_UNESCAPED_UNICODE);
    // ذخیره در کش
    @file_put_contents($cacheFile, $out);
    echo $out;
} else {
    // اگه هر دو DNS شکست خوردن، کش قدیمی رو برگردون
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        echo json_encode(['success' => false, 'data' => [], 'message' => 'دسترسی به holidayapi.ir ممکن نیست'], JSON_UNESCAPED_UNICODE);
    }
}