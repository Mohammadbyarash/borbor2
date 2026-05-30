<?php
// ==========================================
//  صفحه موقت ساخت یوزر
//  بعد از راه‌اندازی پنل ادمین این فایل رو حذف کن!
// ==========================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'pourshab_School');  // ← نام دیتابیس
define('DB_USER', 'pourshab_School');             // ← یوزر MySQL
define('DB_PASS', 'GOiLUYL7LjJ-');                 // ← پسورد MySQL
define('PAGE_SECRET', 'borbor1404');   // ← رمز دسترسی

session_start();
$authed  = !empty($_SESSION['page_authed']);
$message = '';
$msgType = '';

function getDB() {
    try {
        return new PDO(
            'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
    } catch (PDOException $e) { return null; }
}

// ── رمز دسترسی ───────────────────────────
if (!$authed && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['secret'])) {
    if ($_POST['secret'] === PAGE_SECRET) { $_SESSION['page_authed'] = true; $authed = true; }
    else { $message = 'رمز دسترسی اشتباه است'; $msgType = 'error'; }
}

// ── Drop bad foreign key ─────────────────────
if ($authed && isset($_POST['action']) && $_POST['action'] === 'fix_fk') {
    $db = getDB();
    if (!$db) { $message = 'خطا در اتصال'; $msgType = 'error'; }
    else {
        try {
            $db->exec("ALTER TABLE `schools` DROP FOREIGN KEY `schools_ibfk_1`");
            $message = '✅ Foreign key حذف شد! حالا می‌تونی مدرسه بسازی.';
            $msgType = 'success';
        } catch (PDOException $e) {
            $message = 'خطا: ' . $e->getMessage();
            $msgType = 'error';
        }
    }
}

// ── Fix charset ───────────────────────────
if ($authed && isset($_POST['action']) && $_POST['action'] === 'fix_charset') {
    $db = getDB();
    if (!$db) { $message = 'خطا در اتصال به دیتابیس'; $msgType = 'error'; }
    else {
        try {
            $tables = ['users', 'schools', 'students', 'teachers'];
            $fixed  = [];
            // fix database default
            $db->exec("ALTER DATABASE `".DB_NAME."` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            // fix each table
            foreach ($tables as $t) {
                try {
                    $db->exec("ALTER TABLE `{$t}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                    $fixed[] = $t;
                } catch (PDOException $e) { /* table may not exist */ }
            }
            // fix all tables automatically
            $allTables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
            foreach ($allTables as $t) {
                if (!in_array($t, $fixed)) {
                    try {
                        $db->exec("ALTER TABLE `{$t}` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        $fixed[] = $t;
                    } catch (PDOException $e) {}
                }
            }
            $message = '✅ charset همه جداول به utf8mb4 تغییر کرد: ' . implode('، ', $fixed);
            $msgType = 'success';
        } catch (PDOException $e) {
            $message = 'خطا: ' . $e->getMessage();
            $msgType = 'error';
        }
    }
}

// ── ساخت مدرسه ───────────────────────────
if ($authed && ($_POST['action'] ?? '') === 'create_school') {
    $schoolName = trim($_POST['school_name'] ?? '');
    $schoolCode = trim($_POST['school_code'] ?? '');
    if (!$schoolName) { $message = 'نام مدرسه الزامی است'; $msgType = 'error'; }
    else {
        $db = getDB();
        if (!$db) { $message = 'خطا در اتصال به دیتابیس'; $msgType = 'error'; }
        else {
            try {
                $db->exec("SET NAMES utf8mb4");
                $db->prepare('INSERT INTO schools (name, code) VALUES (?, ?)')->execute([$schoolName, $schoolCode ?: null]);
                $message = '✅ مدرسه «' . htmlspecialchars($schoolName) . '» ساخته شد!';
                $msgType = 'success';
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), '1366') !== false || strpos($e->getMessage(), 'Incorrect string') !== false) {
                    try {
                        $db->exec("ALTER TABLE `schools` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                        $db->exec("SET NAMES utf8mb4");
                        $db->prepare('INSERT INTO schools (name, code) VALUES (?, ?)')->execute([$schoolName, $schoolCode ?: null]);
                        $message = '✅ مدرسه «' . htmlspecialchars($schoolName) . '» ساخته شد! (charset هم fix شد)';
                        $msgType = 'success';
                    } catch (PDOException $e2) {
                        $message = 'خطای دیتابیس: ' . $e2->getMessage();
                        $msgType = 'error';
                    }
                } else {
                    $message = 'خطای دیتابیس: ' . $e->getMessage();
                    $msgType = 'error';
                }
            }
        }
    }
}

// ── ساخت یوزر ────────────────────────────
if ($authed && ($_POST['action'] ?? '') === 'create_user') {
    $firstName = trim($_POST['first_name'] ?? '');
    $lastName  = trim($_POST['last_name']  ?? '');
    $username  = trim($_POST['username']   ?? '');
    $password  = $_POST['password']        ?? '';
    $role      = $_POST['role']            ?? 'manager';
    $schoolId  = (int)($_POST['school_id'] ?? 0);

    if (!$firstName || !$lastName || !$username || !$password) {
        $message = 'همه فیلدها الزامی هستند'; $msgType = 'error';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $message = 'نام کاربری فقط حروف انگلیسی، عدد و _ مجاز است'; $msgType = 'error';
    } elseif (strlen($password) < 4) {
        $message = 'رمز عبور حداقل ۴ کاراکتر باشد'; $msgType = 'error';
    } elseif ($schoolId < 1) {
        $message = 'لطفاً یک مدرسه انتخاب کن'; $msgType = 'error';
    } else {
        $db = getDB();
        if (!$db) { $message = 'خطا در اتصال'; $msgType = 'error'; }
        else {
            $chk = $db->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
            $chk->execute([$username]);
            if ($chk->fetch()) {
                $message = "نام کاربری «{$username}» قبلاً وجود دارد"; $msgType = 'error';
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                try {
                    $db->exec("SET NAMES utf8mb4");
                    // اگه charset هنوز latin1ه، اول fix کن
                    $db->exec("ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                } catch (PDOException $ex) {}
                $db->prepare(
                    'INSERT INTO users (school_id, role, first_name, last_name, username, password) VALUES (?,?,?,?,?,?)'
                )->execute([$schoolId, $role, $firstName, $lastName, $username, $hash]);
                $message = "✅ یوزر «{$username}» با موفقیت ساخته شد!";
                $msgType = 'success';
            }
        }
    }
}

// ── دیتا نمایش ───────────────────────────
$schools = $users = [];
if ($authed) {
    $db = getDB();
    if ($db) {
        try { $schools = $db->query('SELECT id, name FROM schools ORDER BY id')->fetchAll(); } catch(PDOException $e){}
        try { $users   = $db->query('SELECT id, first_name, last_name, username, role, school_id, created_at FROM users ORDER BY id DESC LIMIT 30')->fetchAll(); } catch(PDOException $e){}
    }
}
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ساخت یوزر — موقت</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Vazirmatn', sans-serif; background: #0f1729; color: #e2e8f0; min-height: 100vh; padding: 30px 20px; }
  .wrap { max-width: 780px; margin: 0 auto; }
  h1   { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .sub { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 24px; }
  .card { background: #1a2444; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 28px; margin-bottom: 20px; }
  .card h2 { font-size: 16px; font-weight: 600; margin-bottom: 18px; color: rgba(255,255,255,0.8); }
  .warn { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 20px; }
  .info { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); color: #93c5fd; border-radius: 10px; padding: 10px 14px; font-size: 13px; margin-bottom: 20px; }
  .msg { border-radius: 10px; padding: 11px 15px; font-size: 14px; margin-bottom: 18px; font-weight: 500; }
  .msg.success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }
  .msg.error   { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.25);  color: #fca5a5; }
  label { display: block; font-size: 13px; color: rgba(255,255,255,0.55); margin-bottom: 6px; }
  input, select { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; padding: 10px 13px; color: white; font-family: 'Vazirmatn', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 15px; }
  input:focus, select:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
  select option { background: #1a2444; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 11px 22px; border-radius: 9px; border: none; font-family: 'Vazirmatn', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
  .btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-blue   { background: #3b82f6; color: white; }
  .btn-green  { background: #22c55e; color: white; }
  .btn-orange { background: #f97316; color: white; }
  .btn-full   { width: 100%; justify-content: center; }
  /* gate */
  .gate { max-width: 360px; margin: 80px auto; text-align: center; }
  .gate .lock { font-size: 52px; margin-bottom: 14px; }
  /* table */
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { color: rgba(255,255,255,0.35); font-weight: 500; text-align: right; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); }
  tr:last-child td { border: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  code { background: rgba(255,255,255,0.07); padding: 2px 8px; border-radius: 5px; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: rgba(59,130,246,0.18); color: #93c5fd; }
  .empty { color: rgba(255,255,255,0.25); font-size: 13px; padding: 16px 0; text-align: center; }
  details summary { cursor: pointer; color: rgba(255,255,255,0.4); font-size: 13px; padding: 8px 0; list-style: none; }
  details summary::-webkit-details-marker { display: none; }
</style>
</head>
<body>

<?php if (!$authed): ?>
<div class="gate">
  <div class="lock">🔐</div>
  <h1>دسترسی محدود</h1>
  <p class="sub" style="margin-bottom:20px;">رمز دسترسی را وارد کن</p>
  <?php if ($message): ?><div class="msg <?= $msgType ?>"><?= htmlspecialchars($message) ?></div><?php endif; ?>
  <form method="POST">
    <input type="password" name="secret" placeholder="رمز دسترسی..." autofocus style="text-align:center;letter-spacing:2px;">
    <button type="submit" class="btn btn-blue btn-full">ورود</button>
  </form>
</div>

<?php else: ?>
<div class="wrap">
  <h1>🛠 ساخت یوزر — موقت</h1>
  <p class="sub">بعد از آماده شدن پنل ادمین این فایل رو حذف کن</p>
  <div class="warn">⚠️ این صفحه موقته! آدرسش رو به کسی ندی.</div>

  <?php if ($message): ?><div class="msg <?= $msgType ?>"><?= $message ?></div><?php endif; ?>

  <!-- Fix Tools -->
  <div class="card">
    <h2>🔧 ابزارهای رفع مشکل</h2>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:16px;">اگه خطا داری، به ترتیب این دکمه‌ها رو بزن:</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <form method="POST" style="flex:1;min-width:200px;">
        <input type="hidden" name="action" value="fix_fk">
        <button type="submit" class="btn btn-orange btn-full">
          🔗 مرحله ۱: حذف Foreign Key اشتباه
        </button>
      </form>
      <form method="POST" style="flex:1;min-width:200px;">
        <input type="hidden" name="action" value="fix_charset">
        <button type="submit" class="btn btn-orange btn-full" style="background:#8b5cf6;">
          🔤 مرحله ۲: رفع مشکل فارسی (Charset)
        </button>
      </form>
    </div>
  </div>

  <?php if (empty($schools)): ?>
  <!-- اول مدرسه بساز -->
  <div class="card">
    <h2>🏫 اول باید یه مدرسه بسازی</h2>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin-bottom:18px;">جدول <code>schools</code> خالیه — بدون مدرسه نمیشه یوزر ساخت</p>
    <form method="POST">
      <input type="hidden" name="action" value="create_school">
      <div class="grid2">
        <div><label>نام مدرسه *</label><input type="text" name="school_name" placeholder="دبیرستان بوربور" required></div>
        <div><label>کد مدرسه (اختیاری)</label><input type="text" name="school_code" placeholder="SCH001"></div>
      </div>
      <button type="submit" class="btn btn-green">🏫 ساخت مدرسه</button>
    </form>
  </div>

  <?php else: ?>
  <!-- فرم ساخت یوزر -->
  <div class="card">
    <h2>👤 ساخت یوزر جدید</h2>
    <form method="POST">
      <input type="hidden" name="action" value="create_user">
      <div class="grid2">
        <div><label>نام *</label><input type="text" name="first_name" placeholder="علی" required></div>
        <div><label>نام خانوادگی *</label><input type="text" name="last_name" placeholder="احمدی" required></div>
        <div><label>نام کاربری * (انگلیسی)</label><input type="text" name="username" placeholder="ali_ahmadi" required></div>
        <div><label>رمز عبور *</label><input type="text" name="password" placeholder="حداقل ۴ کاراکتر" required></div>
        <div>
          <label>نقش</label>
          <select name="role">
            <option value="manager">مدیر</option>
            <option value="owner">مالک</option>
            <option value="teacher">معلم</option>
            <option value="assistant">معاون</option>
            <option value="parent">ولی</option>
            <option value="student">دانش‌آموز</option>
          </select>
        </div>
        <div>
          <label>مدرسه *</label>
          <select name="school_id" required>
            <?php foreach ($schools as $s): ?>
              <option value="<?= $s['id'] ?>"><?= htmlspecialchars($s['name']) ?> (ID: <?= $s['id'] ?>)</option>
            <?php endforeach; ?>
          </select>
        </div>
      </div>
      <button type="submit" class="btn btn-blue btn-full">✅ ساخت یوزر</button>
    </form>
  </div>

  <details style="margin-bottom:20px;">
    <summary>+ اضافه کردن مدرسه جدید</summary>
    <div class="card" style="margin-top:12px;">
      <form method="POST">
        <input type="hidden" name="action" value="create_school">
        <div class="grid2">
          <div><label>نام مدرسه *</label><input type="text" name="school_name" required></div>
          <div><label>کد مدرسه</label><input type="text" name="school_code"></div>
        </div>
        <button type="submit" class="btn btn-green">🏫 ساخت مدرسه</button>
      </form>
    </div>
  </details>
  <?php endif; ?>

  <!-- لیست یوزرها -->
  <div class="card">
    <h2>📋 یوزرهای موجود (آخرین ۳۰ تا)</h2>
    <?php if (empty($users)): ?>
      <div class="empty">هنوز یوزری نیست</div>
    <?php else: ?>
    <table>
      <thead><tr><th>ID</th><th>نام</th><th>یوزرنیم</th><th>نقش</th><th>School</th><th>تاریخ</th></tr></thead>
      <tbody>
        <?php foreach ($users as $u): ?>
        <tr>
          <td><?= $u['id'] ?></td>
          <td><?= htmlspecialchars($u['first_name'] . ' ' . $u['last_name']) ?></td>
          <td><code><?= htmlspecialchars($u['username'] ?? '—') ?></code></td>
          <td><span class="badge"><?= htmlspecialchars($u['role']) ?></span></td>
          <td><?= $u['school_id'] ?? '—' ?></td>
          <td style="font-size:11px;color:rgba(255,255,255,0.3);"><?= substr($u['created_at'] ?? '', 0, 10) ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>

</div>
<?php endif; ?>
</body>
</html>