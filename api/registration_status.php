<?php
// api/registration_status.php
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
setHeaders();

$pdo    = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ===== ایجاد جدول school_settings — یکبار و مطمئن =====
$pdo->exec("
    CREATE TABLE IF NOT EXISTS `school_settings` (
        `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `school_id`     BIGINT UNSIGNED NOT NULL,
        `setting_key`   VARCHAR(100) NOT NULL,
        `setting_value` TEXT,
        `updated_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY `uq_school_key` (`school_id`, `setting_key`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
");

// ===== school_id =====
function resolveSchoolId(PDO $pdo, ?int $req): int {
    if ($req && $req > 0) return $req;
    $r = $pdo->query("SELECT id FROM schools ORDER BY id LIMIT 1")->fetch();
    return $r ? (int)$r['id'] : 1;
}

// ===== GET — عمومی، بدون لاگین =====
if ($method === 'GET') {
    $school_id = resolveSchoolId($pdo, isset($_GET['school_id']) ? (int)$_GET['school_id'] : null);

    // وضعیت ثبت‌نام
    $s   = $pdo->prepare("SELECT setting_value FROM school_settings WHERE school_id=? AND setting_key='registration_open' LIMIT 1");
    $s->execute([$school_id]);
    $row = $s->fetch();
    // اگه رکورد نداشت = باز
    $isOpen = (!$row || $row['setting_value'] === '1');

    // رشته‌ها از جدول fields — ستون‌ها: id, school_id, title
    $fields = [];
    try {
        $fs = $pdo->prepare("SELECT id, title FROM fields WHERE school_id=? ORDER BY id");
        $fs->execute([$school_id]);
        $fields = $fs->fetchAll(PDO::FETCH_ASSOC);
    } catch (\PDOException $e) { $fields = []; }

    // پایه‌ها از جدول grades — ستون‌ها: id, school_id, title (عدد: 10,11,12)
    $grades = [];
    $gMap   = [10 => 'دهم', 11 => 'یازدهم', 12 => 'دوازدهم'];
    try {
        $gs = $pdo->prepare("SELECT id, title FROM grades WHERE school_id=? ORDER BY title");
        $gs->execute([$school_id]);
        foreach ($gs->fetchAll(PDO::FETCH_ASSOC) as $g) {
            $num      = (int)$g['title'];
            $grades[] = [
                'id'    => $g['id'],
                'value' => 'tenth',      // مقدار ارسالی به سرور — طبق DB
                'label' => $gMap[$num] ?? 'پایه ' . $num,
                'raw'   => $num,
            ];
            // درست‌تر: هر پایه value مخصوص خودش
            // این بلاک رو جایگزین می‌کنیم:
        }
        // بازسازی با value درست
        $grades = [];
        $valMap = [10 => 'tenth', 11 => 'eleventh', 12 => 'twelfth'];
        $gs2 = $pdo->prepare("SELECT id, title FROM grades WHERE school_id=? ORDER BY title");
        $gs2->execute([$school_id]);
        foreach ($gs2->fetchAll(PDO::FETCH_ASSOC) as $g) {
            $num = (int)$g['title'];
            $grades[] = [
                'id'    => $g['id'],
                'value' => $valMap[$num] ?? 'grade_' . $num,
                'label' => $gMap[$num]   ?? 'پایه ' . $num,
            ];
        }
    } catch (\PDOException $e) { $grades = []; }

    echo json_encode([
        'success'   => true,
        'is_open'   => $isOpen,
        'school_id' => $school_id,
        'fields'    => $fields,
        'grades'    => $grades,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ===== POST — فقط ادمین =====
if ($method === 'POST') {
    require_once __DIR__ . '/auth_helper.php';
    $user = requireAuth();

    $body   = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = trim($body['action'] ?? '');

    if (!in_array($action, ['open', 'close'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $school_id = (int)$user['school_id'];
    $value     = ($action === 'open') ? '1' : '0';

    $stmt = $pdo->prepare("
        INSERT INTO school_settings (school_id, setting_key, setting_value)
        VALUES (?, 'registration_open', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    $stmt->execute([$school_id, $value]);

    $msg = ($action === 'open') ? 'پیش‌ثبت‌نام باز شد ✓' : 'پیش‌ثبت‌نام بسته شد 🔒';
    echo json_encode([
        'success' => true,
        'message' => $msg,
        'is_open' => ($action === 'open'),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'متد نامعتبر'], JSON_UNESCAPED_UNICODE);