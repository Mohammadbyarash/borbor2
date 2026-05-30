<?php
/**
 * migrate-page-keys.php
 * یه بار اجرا کن تا ستون page_key به جدول permissions اضافه بشه
 * و ردیف‌های قدیمی هم آپدیت بشن.
 * بعد از اجرای موفق این فایل رو حذف کن!
 */
session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';

header('Content-Type: text/html; charset=utf-8');

$user = getAuthUser();
if (!$user || !in_array($user['role'], ['owner', 'manager'])) {
    die('<p style="color:red">❌ فقط owner یا manager می‌تواند این migration را اجرا کند.</p>');
}

$pdo = getDB();
$log = [];

// ─── ۱. اضافه کردن ستون page_key اگه نیست ─────────────────────────
$cols = $pdo->query("SHOW COLUMNS FROM permissions")->fetchAll(PDO::FETCH_COLUMN);
if (!in_array('page_key', $cols)) {
    $pdo->exec("ALTER TABLE permissions ADD COLUMN page_key VARCHAR(100) NULL");
    try { $pdo->exec("ALTER TABLE permissions ADD INDEX idx_page_key (page_key)"); } catch(PDOException) {}
    $log[] = '✅ ستون page_key اضافه شد';
} else {
    $log[] = 'ℹ️ ستون page_key از قبل وجود دارد';
}

// ─── ۲. آپدیت ردیف‌های قدیمی بر اساس اسم فارسی ────────────────────
$nameToKey = [
    'دسترسی به صفحه داشبورد'             => 'dashbord',
    'دسترسی به صفحه مدیریت معاونان'      => 'Assistant_management',
    'دسترسی به صفحه مدیریت معلمین'       => 'Teacher_management',
    'دسترسی به صفحه مدیریت دانش‌آموزان'  => 'student',
    'دسترسی به صفحه مدیریت اولیاء'       => 'Parents',
    'دسترسی به صفحه مدیریت دروس'         => 'Courses',
    'دسترسی به صفحه برنامه کلاسی'        => 'Class-schedule',
    'دسترسی به صفحه حضور و غیاب'         => 'Attendance',
    'دسترسی به صفحه نمرات'               => 'grades',
    'دسترسی به صفحه پیش‌ثبت‌نام'         => 'Pre-registration',
    'دسترسی به صفحه گزارش‌ها'            => 'reports',
    'دسترسی به صفحه اطلاعیه‌ها'          => 'notife',
    'دسترسی به صفحه آرشیو'              => 'archive',
    'دسترسی به صفحه تنظیمات'            => 'settings',
    'دسترسی به صفحه پروفایل معلم'        => 'teacher-profile',
    'دسترسی به صفحه مدیریت دسترسی‌ها'   => 'permissions',
    'دسترسی به صفحه کاربران'             => 'users',
];

$stmt = $pdo->prepare("UPDATE permissions SET page_key = ? WHERE name = ? AND (page_key IS NULL OR page_key = '')");
$updated = 0;
foreach ($nameToKey as $name => $key) {
    $stmt->execute([$key, $name]);
    $updated += $stmt->rowCount();
}
$log[] = "✅ $updated ردیف آپدیت شد (page_key تنظیم شد)";

// ─── ۳. نمایش نتیجه ─────────────────────────────────────────────────
$rows = $pdo->query("SELECT id, name, page_key FROM permissions ORDER BY category, id LIMIT 30")->fetchAll();
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="UTF-8"><title>Migration</title>
<style>
body{font-family:Tahoma;background:#0f172a;color:#e2e8f0;padding:24px;direction:rtl}
h2{color:#38bdf8} .ok{color:#4ade80} .info{color:#94a3b8}
table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
th{background:#334155;padding:8px 12px;text-align:right}
td{padding:8px 12px;border-bottom:1px solid #334155}
.has-key{color:#4ade80} .no-key{color:#f87171}
</style>
</head>
<body>
<h2>Migration: page_key</h2>
<?php foreach($log as $l): ?><p><?= $l ?></p><?php endforeach; ?>
<table>
<tr><th>ID</th><th>نام</th><th>page_key</th></tr>
<?php foreach($rows as $r): ?>
<tr>
  <td><?= $r['id'] ?></td>
  <td><?= htmlspecialchars($r['name']) ?></td>
  <td class="<?= $r['page_key'] ? 'has-key' : 'no-key' ?>"><?= $r['page_key'] ?: '— ندارد' ?></td>
</tr>
<?php endforeach; ?>
</table>
<p style="color:#f59e0b;margin-top:24px">⚠️ بعد از تأیید نتیجه، این فایل را حذف کن!</p>
</body></html>
