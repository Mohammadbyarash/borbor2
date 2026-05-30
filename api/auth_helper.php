<?php
//  api/check_status.php ببین این کد برای این فایل مربوط هست به student یا نه نبود ولش کن اهمیت نده 


if (session_status() === PHP_SESSION_NONE) session_start();

function getAuthUser(): ?array {
    $uid = $_SESSION['borbor_user_id'] ?? $_SESSION['user_id'] ?? $_COOKIE['borbor_user_id'] ?? null;
    if (!$uid) return null;
    $stmt = getDB()->prepare("SELECT id, school_id, role, first_name, last_name FROM users WHERE id=? LIMIT 1");
    $stmt->execute([(int)$uid]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) return null;
    $_SESSION['borbor_user_id']   = $user['id'];
    $_SESSION['user_id']          = $user['id'];
    $_SESSION['borbor_role']      = $user['role'];
    $_SESSION['borbor_school_id'] = $user['school_id'];
    return $user;
}

function requireAuth(): array {
    $user = getAuthUser();
    if (!$user) {
        if (ob_get_level()) ob_clean();
        http_response_code(401);
        echo json_encode(['success'=>false,'message'=>'احراز هویت نشده‌اید'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $user;
}

function getSchoolIdFromAuth(): ?int {
    $user = getAuthUser();
    return $user ? (int)$user['school_id'] : null;
}

// ─────────────────────────────────────────────
//  none  → هیچ دسترسی
//  read  → فقط مشاهده
//  write → فقط ثبت/ویرایش/حذف
//  both  → مشاهده + ثبت/ویرایش/حذف
// ─────────────────────────────────────────────
function userHasPermission(array $user, string $permName, string $level = 'write'): bool {
    if (in_array($user['role'], ['owner', 'manager'])) return true;

    $col = match($user['role']) {
        'teacher'        => 'teacher_access',
        'vice_principal',
        'assistant'      => 'vice_principal_access',
        'student'        => 'student_access',
        'parent'         => 'parent_access',
        default          => null
    };
    if (!$col) return false;

    try {
        $pdo = getDB();
        $sid = (int)$user['school_id'];

        // ── جستجو با name مستقیم ──
        $stmt = $pdo->prepare("SELECT {$col} AS a FROM permissions WHERE school_id=? AND name=? ORDER BY id ASC LIMIT 1");
        $stmt->execute([$sid, $permName]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // ── اگه با name پیدا نشد، با page_key امتحان کن ──
        // (برای APIهایی که page_key رو به عنوان permName پاس می‌دن)
        if (!$row) {
            $stmt = $pdo->prepare("SELECT {$col} AS a FROM permissions WHERE school_id=? AND page_key=? ORDER BY id ASC LIMIT 1");
            $stmt->execute([$sid, $permName]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        // ── نگاشت اسامی کوتاه API به name های DB ──
        // APIها با اسامی کوتاه مثل 'مدیریت دروس' صدا می‌زنن
        // ولی DB اسم 'دسترسی به صفحه مدیریت دروس' داره
        if (!$row) {
            $nameMap = [
                'مدیریت معاونان'      => 'دسترسی به صفحه مدیریت معاونان',
                'مدیریت معلمان'       => 'دسترسی به صفحه مدیریت معلمین',
                'مدیریت دانش‌آموزان'  => 'دسترسی به صفحه مدیریت دانش‌آموزان',
                'مدیریت اولیاء'       => 'دسترسی به صفحه مدیریت اولیاء',
                'مدیریت دروس'         => 'دسترسی به صفحه مدیریت دروس',
                'برنامه کلاسی'        => 'دسترسی به صفحه برنامه کلاسی',
                'حضور و غیاب'         => 'دسترسی به صفحه حضور و غیاب',
                'نمرات'               => 'دسترسی به صفحه نمرات',
                'پیش‌ثبت‌نام'         => 'دسترسی به صفحه پیش‌ثبت‌نام',
                'گزارشات'             => 'دسترسی به صفحه گزارش‌ها',
                'اطلاعیه‌ها'          => 'دسترسی به صفحه اطلاعیه‌ها',
                'آرشیو'               => 'دسترسی به صفحه آرشیو',
                'تنظیمات'             => 'دسترسی به صفحه تنظیمات',
                'مدیریت دسترسی‌ها'   => 'دسترسی به صفحه مدیریت دسترسی‌ها',
                'مدیریت کاربران'      => 'دسترسی به صفحه کاربران',
                'داشبورد'             => 'دسترسی به صفحه داشبورد',
            ];
            $mapped = $nameMap[$permName] ?? null;
            if ($mapped) {
                $stmt = $pdo->prepare("SELECT {$col} AS a FROM permissions WHERE school_id=? AND name=? ORDER BY id ASC LIMIT 1");
                $stmt->execute([$sid, $mapped]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
            }
        }

    } catch (Throwable) { return false; }

    if (!$row) return true; // تعریف نشده = باز (fail-open برای عملیات‌های غیر صفحه)

    return match($level) {
        'read'  => in_array($row['a'], ['read', 'both']),
        'write' => in_array($row['a'], ['write', 'both']),
        default => false,
    };
}

function requirePermission(array $user, string $permName, string $level = 'write'): void {
    if (!userHasPermission($user, $permName, $level)) {
        if (ob_get_level()) ob_clean();
        http_response_code(403);
        echo json_encode(['success'=>false,'message'=>'دسترسی ندارید'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}