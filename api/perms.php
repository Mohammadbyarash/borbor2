<?php
session_start();
require_once 'config.php';
require_once __DIR__ . '/auth_helper.php';
setHeaders();

function isOwner(?array $u): bool { return $u && $u['role'] === 'owner'; }

function sendError(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success'=>false,'message'=>$msg], JSON_UNESCAPED_UNICODE);
    exit;
}
function sendOk(array $data = []): void {
    echo json_encode(array_merge(['success'=>true], $data), JSON_UNESCAPED_UNICODE);
    exit;
}

// ── اطمینان از وجود جدول ────────────────────────────────────
function ensureSchema(): void {
    $pdo = getDB();
    $exists = $pdo->query("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='permissions'")->fetchColumn();
    if (!$exists) {
        $pdo->exec("CREATE TABLE permissions (
            id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            school_id             BIGINT UNSIGNED NOT NULL,
            name                  VARCHAR(150)    NOT NULL,
            page_key              VARCHAR(100)    NULL,
            category              VARCHAR(100)    NOT NULL DEFAULT '',
            description           TEXT,
            teacher_access        ENUM('none','read','write','both') DEFAULT 'none',
            vice_principal_access ENUM('none','read','write','both') DEFAULT 'none',
            student_access        ENUM('none','read','write','both') DEFAULT 'none',
            parent_access         ENUM('none','read','write','both') DEFAULT 'none',
            is_locked             TINYINT(1) DEFAULT 0,
            locked_by             BIGINT UNSIGNED NULL,
            is_owner_only         TINYINT(1) DEFAULT 0,
            created_by            BIGINT UNSIGNED NULL,
            created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(school_id),
            INDEX(page_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        return;
    }
    // اضافه کردن ستون‌های جدید اگه نباشن
    $cols = $pdo->query("SHOW COLUMNS FROM permissions")->fetchAll(PDO::FETCH_COLUMN);
    $add = [
        'page_key'             => "ALTER TABLE permissions ADD COLUMN page_key VARCHAR(100) NULL",
        'is_locked'            => "ALTER TABLE permissions ADD COLUMN is_locked TINYINT(1) DEFAULT 0",
        'locked_by'            => "ALTER TABLE permissions ADD COLUMN locked_by BIGINT UNSIGNED NULL",
        'is_owner_only'        => "ALTER TABLE permissions ADD COLUMN is_owner_only TINYINT(1) DEFAULT 0",
        'created_by'           => "ALTER TABLE permissions ADD COLUMN created_by BIGINT UNSIGNED NULL",
        'teacher_access'       => "ALTER TABLE permissions ADD COLUMN teacher_access ENUM('none','read','write','both') DEFAULT 'none'",
        'vice_principal_access'=> "ALTER TABLE permissions ADD COLUMN vice_principal_access ENUM('none','read','write','both') DEFAULT 'none'",
        'student_access'       => "ALTER TABLE permissions ADD COLUMN student_access ENUM('none','read','write','both') DEFAULT 'none'",
        'parent_access'        => "ALTER TABLE permissions ADD COLUMN parent_access ENUM('none','read','write','both') DEFAULT 'none'",
    ];
    foreach ($add as $col => $sql) {
        if (!in_array($col, $cols)) $pdo->exec($sql);
    }
    foreach (['func','warning','example'] as $drop) {
        if (in_array($drop, $cols)) {
            try { $pdo->exec("ALTER TABLE permissions DROP COLUMN {$drop}"); } catch(PDOException) {}
        }
    }
    // اضافه کردن index های لازم
    try { $pdo->exec("ALTER TABLE permissions ADD INDEX idx_page_key (page_key)"); } catch(PDOException) {}
}

// ── پاکسازی تکراری‌ها (هر بار فراخوانی می‌شه، سریعه) ────────
function cleanupDuplicates(PDO $pdo, int $sid): void {
    // حذف تکراری‌های page_key (نگه داشتن قدیمی‌ترین id)
    try {
        $pdo->prepare("
            DELETE p1 FROM permissions p1
            INNER JOIN permissions p2
                ON  p1.school_id = p2.school_id
                AND p1.page_key  = p2.page_key
                AND p1.page_key  IS NOT NULL
                AND p1.page_key  != ''
                AND p1.id > p2.id
            WHERE p1.school_id = ?
        ")->execute([$sid]);
    } catch (PDOException) {}

    // حذف تکراری‌های name (بدون page_key، نگه داشتن آخرین id که دسترسی‌های درست داره)
    try {
        $pdo->prepare("
            DELETE p1 FROM permissions p1
            INNER JOIN permissions p2
                ON  p1.school_id = p2.school_id
                AND p1.name      = p2.name
                AND (p1.page_key IS NULL OR p1.page_key = '')
                AND (p2.page_key IS NULL OR p2.page_key = '')
                AND p1.id < p2.id
            WHERE p1.school_id = ?
        ")->execute([$sid]);
    } catch (PDOException) {}
}

// ── seed اولیه (فقط page_key هایی که وجود ندارن) ────────────
function seedDefaultPermissions(int $sid, int $uid): void {
    $pdo = getDB();

    // صفحات اصلی با page_key - فقط اگه page_key وجود نداشته باشه insert می‌کنه
    $pages = [
        ['dashbord',            'دسترسی به صفحه داشبورد',            'صفحات', 'مشاهده صفحه داشبورد و آمار کلی',     'read', 'read',  'none', 'none', 0],
        ['Assistant_management','دسترسی به صفحه مدیریت معاونان',     'صفحات', 'مشاهده صفحه مدیریت معاونان',          'none', 'both',  'none', 'none', 0],
        ['Teacher_management',  'دسترسی به صفحه مدیریت معلمین',      'صفحات', 'مشاهده صفحه مدیریت معلمین',           'none', 'read',  'none', 'none', 0],
        ['student',             'دسترسی به صفحه مدیریت دانش‌آموزان', 'صفحات', 'مشاهده صفحه مدیریت دانش‌آموزان',     'none', 'read',  'none', 'none', 0],
        ['Parents',             'دسترسی به صفحه مدیریت اولیاء',      'صفحات', 'مشاهده صفحه مدیریت اولیاء',           'none', 'read',  'none', 'none', 0],
        ['Courses',             'دسترسی به صفحه مدیریت دروس',        'صفحات', 'مشاهده صفحه مدیریت دروس',             'read', 'read',  'read', 'none', 0],
        ['Class-schedule',      'دسترسی به صفحه برنامه کلاسی',       'صفحات', 'مشاهده صفحه برنامه کلاسی',            'read', 'read',  'read', 'read', 0],
        ['Attendance',          'دسترسی به صفحه حضور و غیاب',        'صفحات', 'مشاهده صفحه حضور و غیاب',             'read', 'read',  'read', 'read', 0],
        ['grades',              'دسترسی به صفحه نمرات',              'صفحات', 'مشاهده صفحه نمرات',                    'read', 'read',  'read', 'read', 0],
        ['Pre-registration',    'دسترسی به صفحه پیش‌ثبت‌نام',        'صفحات', 'مشاهده صفحه پیش‌ثبت‌نام',             'none', 'read',  'none', 'none', 0],
        ['reports',             'دسترسی به صفحه گزارش‌ها',           'صفحات', 'مشاهده صفحه گزارش‌ها',                'read', 'read',  'none', 'none', 0],
        ['notife',              'دسترسی به صفحه اطلاعیه‌ها',         'صفحات', 'مشاهده صفحه اطلاعیه‌ها',              'read', 'read',  'read', 'read', 0],
        ['archive',             'دسترسی به صفحه آرشیو',              'صفحات', 'مشاهده صفحه آرشیو',                    'none', 'read',  'none', 'none', 0],
        ['settings',            'دسترسی به صفحه تنظیمات',            'صفحات', 'مشاهده صفحه تنظیمات',                  'none', 'read',  'none', 'none', 0],
        ['teacher-profile',     'دسترسی به صفحه پروفایل معلم',       'صفحات', 'مشاهده پروفایل کامل معلم',             'read', 'read',  'none', 'none', 0],
        ['permissions',         'دسترسی به صفحه مدیریت دسترسی‌ها',  'صفحات', 'مشاهده صفحه مدیریت دسترسی‌ها',        'none', 'none',  'none', 'none', 1],
        ['users',               'دسترسی به صفحه کاربران',            'صفحات', 'مشاهده صفحه همه کاربران سیستم',        'none', 'none',  'none', 'none', 1],
    ];

    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM permissions WHERE school_id=? AND page_key=?");
    $stmtIns   = $pdo->prepare("INSERT INTO permissions
        (school_id,page_key,name,category,description,teacher_access,vice_principal_access,student_access,parent_access,is_owner_only,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    foreach ($pages as $r) {
        $stmtCheck->execute([$sid, $r[0]]);
        if ($stmtCheck->fetchColumn() == 0) {
            $stmtIns->execute([$sid,$r[0],$r[1],$r[2],$r[3],$r[4],$r[5],$r[6],$r[7],$r[8],$uid]);
        }
    }
}

// ── MAIN ─────────────────────────────────────────────────────
set_exception_handler(function($e) {
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
});

$user = getAuthUser();
if (!$user) sendError('احراز هویت نشده‌اید', 401);

ensureSchema();

$pdo       = getDB();
$school_id = (int)$user['school_id'];
$method    = $_SERVER['REQUEST_METHOD'];
$input     = [];
if (in_array($method, ['POST','PUT','DELETE'])) {
    $raw   = file_get_contents('php://input');
    $input = ($raw && $raw !== '') ? (json_decode($raw, true) ?? []) : [];
}

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    // پاکسازی تکراری‌ها قبل از هر چیز
    cleanupDuplicates($pdo, $school_id);
    // seed صفحات اصلی اگه نباشن
    seedDefaultPermissions($school_id, $user['id']);

    $ownerFilter = isOwner($user) ? '' : 'AND p.is_owner_only = 0';
    $stmt = $pdo->prepare("
        SELECT p.*,
               CONCAT(u.first_name,' ',u.last_name)  AS created_by_name,
               CONCAT(lu.first_name,' ',lu.last_name) AS locked_by_name
        FROM permissions p
        LEFT JOIN users u  ON u.id  = p.created_by
        LEFT JOIN users lu ON lu.id = p.locked_by
        WHERE p.school_id = ? $ownerFilter
        ORDER BY p.category ASC, p.name ASC, p.id ASC
    ");
    $stmt->execute([$school_id]);

    $perms = array_map(fn($r) => [
        'id'              => (int)$r['id'],
        'name'            => $r['name'],
        'category'        => $r['category'],
        'description'     => $r['description'] ?? '',
        'page_key'        => $r['page_key'] ?? null,
        'is_locked'       => (bool)$r['is_locked'],
        'is_owner_only'   => (bool)$r['is_owner_only'],
        'locked_by_name'  => $r['locked_by_name'],
        'created_by_name' => $r['created_by_name'],
        'roles' => [
            'teacher'        => $r['teacher_access']        ?? 'none',
            'vice_principal' => $r['vice_principal_access'] ?? 'none',
            'student'        => $r['student_access']        ?? 'none',
            'parent'         => $r['parent_access']         ?? 'none',
        ]
    ], $stmt->fetchAll());

    // سطح دسترسی کاربر جاری به صفحه permissions
    // از page_key='permissions' می‌خونیم (نه name که ممکنه متفاوت باشه)
    $userLevel = 'none';
    if (isOwner($user) || $user['role'] === 'manager') {
        $userLevel = 'both';
    } else {
        $col = match($user['role']) {
            'teacher'        => 'teacher_access',
            'vice_principal' => 'vice_principal_access',
            'assistant'      => 'vice_principal_access',
            'student'        => 'student_access',
            'parent'         => 'parent_access',
            default          => null
        };
        if ($col) {
            // از page_key بخون - سطح دسترسی به صفحه permissions
            $lvl = $pdo->prepare("SELECT {$col} AS a, is_owner_only FROM permissions WHERE school_id=? AND page_key='permissions' ORDER BY id ASC LIMIT 1");
            $lvl->execute([$school_id]);
            $lvlRow = $lvl->fetch(PDO::FETCH_ASSOC);
            if ($lvlRow) {
                $rawLevel = $lvlRow['a'];
                // اگه صفحه owner_only هست، حداکثر read میشه (نه write/both)
                if ($lvlRow['is_owner_only']) {
                    $userLevel = in_array($rawLevel, ['read','write','both']) ? 'read' : 'none';
                } else {
                    $userLevel = $rawLevel;
                }
            } else {
                $userLevel = 'none';
            }
        }
    }

    sendOk([
        'data'       => $perms,
        'is_owner'   => isOwner($user),
        'user_level' => $userLevel,
        'admin'      => ['name' => $user['first_name'].' '.$user['last_name'], 'role' => $user['role']]
    ]);
}

// ── POST ─────────────────────────────────────────────────────
if ($method === 'POST') {
    $action = $input['action'] ?? 'create';

    if ($action === 'toggle_lock') {
        if (!isOwner($user)) sendError('فقط مدیر ارشد می‌تواند قفل را تغییر دهد', 403);
        $id   = (int)($input['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT is_locked FROM permissions WHERE id=? AND school_id=?");
        $stmt->execute([$id, $school_id]);
        $perm = $stmt->fetch();
        if (!$perm) sendError('یافت نشد', 404);
        $new = $perm['is_locked'] ? 0 : 1;
        $pdo->prepare("UPDATE permissions SET is_locked=?, locked_by=? WHERE id=? AND school_id=?")
            ->execute([$new, $new ? $user['id'] : null, $id, $school_id]);
        sendOk(['is_locked' => (bool)$new, 'message' => $new ? 'دسترسی قفل شد' : 'قفل برداشته شد']);
    }

    if ($action === 'toggle_owner_only') {
        if (!isOwner($user)) sendError('فقط مدیر ارشد می‌تواند این تنظیم را تغییر دهد', 403);
        $id   = (int)($input['id'] ?? 0);
        $stmt = $pdo->prepare("SELECT is_owner_only FROM permissions WHERE id=? AND school_id=?");
        $stmt->execute([$id, $school_id]);
        $perm = $stmt->fetch();
        if (!$perm) sendError('یافت نشد', 404);
        $new = $perm['is_owner_only'] ? 0 : 1;
        $pdo->prepare("UPDATE permissions SET is_owner_only=? WHERE id=? AND school_id=?")
            ->execute([$new, $id, $school_id]);
        sendOk(['is_owner_only' => (bool)$new, 'message' => $new ? 'قفل مدیر ارشد فعال شد' : 'قفل برداشته شد']);
    }

    // ── ایجاد پرمیشن جدید ──
    if (!isOwner($user) && $user['role'] !== 'manager')
        sendError('فقط مدیر ارشد می‌تواند دسترسی جدید بسازد', 403);

    $name = trim($input['name'] ?? '');
    $cat  = trim($input['category'] ?? '');
    $desc = trim($input['description'] ?? '');
    if (!$name || !$cat || !$desc) sendError('نام، دسته‌بندی و توضیحات الزامی است');

    // بررسی تکراری نبودن name
    $dup = $pdo->prepare("SELECT COUNT(*) FROM permissions WHERE school_id=? AND name=?");
    $dup->execute([$school_id, $name]);
    if ($dup->fetchColumn() > 0) sendError('دسترسی با این نام قبلاً وجود دارد');

    $validAccess = ['none','read','write','both'];
    $ta  = in_array($input['teacher_access']        ?? '', $validAccess) ? $input['teacher_access']        : 'none';
    $vpa = in_array($input['vice_principal_access'] ?? '', $validAccess) ? $input['vice_principal_access'] : 'none';
    $sa  = in_array($input['student_access']        ?? '', $validAccess) ? $input['student_access']        : 'none';
    $pa  = in_array($input['parent_access']         ?? '', $validAccess) ? $input['parent_access']         : 'none';
    $ownerOnly = (isOwner($user) && !empty($input['is_owner_only'])) ? 1 : 0;
    $pageKey   = trim($input['page_key'] ?? '') ?: null;

    $pdo->prepare("INSERT INTO permissions
        (school_id,page_key,name,category,description,teacher_access,vice_principal_access,student_access,parent_access,is_owner_only,created_by)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)")
        ->execute([$school_id,$pageKey,$name,$cat,$desc,$ta,$vpa,$sa,$pa,$ownerOnly,$user['id']]);
    sendOk(['message' => 'دسترسی ایجاد شد', 'id' => (int)$pdo->lastInsertId()]);
}

// ── PUT ──────────────────────────────────────────────────────
if ($method === 'PUT') {
    $id   = (int)($input['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT is_locked, is_owner_only FROM permissions WHERE id=? AND school_id=?");
    $stmt->execute([$id, $school_id]);
    $perm = $stmt->fetch();
    if (!$perm) sendError('یافت نشد', 404);

    if ($perm['is_owner_only'] && !isOwner($user)) sendError('فقط مدیر ارشد می‌تواند این دسترسی را ویرایش کند', 403);
    if ($perm['is_locked']     && !isOwner($user)) sendError('این دسترسی قفل شده است', 403);

    if (!isOwner($user) && $user['role'] !== 'manager') {
        requirePermission($user, 'ویرایش دسترسی‌ها', 'write');
    }

    $validAccess = ['none','read','write','both'];
    $ta  = in_array($input['teacher_access']        ?? '', $validAccess) ? $input['teacher_access']        : 'none';
    $vpa = in_array($input['vice_principal_access'] ?? '', $validAccess) ? $input['vice_principal_access'] : 'none';
    $sa  = in_array($input['student_access']        ?? '', $validAccess) ? $input['student_access']        : 'none';
    $pa  = in_array($input['parent_access']         ?? '', $validAccess) ? $input['parent_access']         : 'none';

    $pdo->prepare("UPDATE permissions SET teacher_access=?, vice_principal_access=?, student_access=?, parent_access=? WHERE id=? AND school_id=?")
        ->execute([$ta, $vpa, $sa, $pa, $id, $school_id]);
    sendOk(['message' => 'دسترسی به‌روز شد']);
}

// ── DELETE ───────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id   = (int)($input['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT is_locked, is_owner_only FROM permissions WHERE id=? AND school_id=?");
    $stmt->execute([$id, $school_id]);
    $perm = $stmt->fetch();
    if (!$perm) sendError('یافت نشد', 404);

    if ($perm['is_owner_only'] && !isOwner($user)) sendError('فقط مدیر ارشد می‌تواند این دسترسی را حذف کند', 403);
    if ($perm['is_locked']     && !isOwner($user)) sendError('دسترسی قفل شده و قابل حذف نیست', 403);

    if (!isOwner($user) && $user['role'] !== 'manager')
        sendError('فقط مدیر ارشد می‌تواند دسترسی حذف کند', 403);

    $pdo->prepare("DELETE FROM permissions WHERE id=? AND school_id=?")->execute([$id, $school_id]);
    sendOk(['message' => 'دسترسی حذف شد']);
}
