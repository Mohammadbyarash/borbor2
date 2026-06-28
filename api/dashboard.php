<?php
// ==========================================
//  api/dashboard.php
// ==========================================
error_reporting(0);
ini_set('display_errors', 0);

require_once 'config.php';
require_once 'auth_check.php';

setHeaders();

$pdo    = getDB();
$userId = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_stats':    getStats($pdo, $userId);    break;
    case 'get_profile':  getProfile($pdo, $userId);  break;
    case 'get_theme':    getTheme($pdo, $userId);     break;
    default:
        echo json_encode(['success' => false, 'message' => 'action نامعتبر']);
}

// ══════════════════════════════════════════
//  آمار کلی داشبورد
// ══════════════════════════════════════════
function getStats(PDO $pdo, int $userId): void
{
    $schoolId = getSchoolId($pdo, $userId);

    // تعداد دانش‌آموزان فعال
    $students = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='student' AND is_archived=0");
    $students->execute([$schoolId]);
    $studentCount = (int)$students->fetchColumn();

    // تعداد معلمان فعال
    $teachers = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='teacher' AND is_archived=0");
    $teachers->execute([$schoolId]);
    $teacherCount = (int)$teachers->fetchColumn();

    // پیش ثبت‌نام‌های در انتظار
    $regs = $pdo->prepare("SELECT COUNT(*) FROM registration WHERE school_id=? AND status='pending' AND is_archived=0");
    $regs->execute([$schoolId]);
    $pendingRegs = (int)$regs->fetchColumn();

    // کل پیش ثبت‌نام‌ها
    $allRegs = $pdo->prepare("SELECT COUNT(*) FROM registration WHERE school_id=? AND is_archived=0");
    $allRegs->execute([$schoolId]);
    $totalRegs = (int)$allRegs->fetchColumn();

    // معاونان
    $assistants = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='assistant' AND is_archived=0");
    $assistants->execute([$schoolId]);
    $assistantCount = (int)$assistants->fetchColumn();

    // ثبت‌نام‌های تأیید شده
    $accepted = $pdo->prepare("SELECT COUNT(*) FROM registration WHERE school_id=? AND status='accepted' AND is_archived=0");
    $accepted->execute([$schoolId]);
    $acceptedCount = (int)$accepted->fetchColumn();

    // تعداد کلاس‌های فعال
    $classes = $pdo->prepare("SELECT COUNT(*) FROM classes WHERE school_id=? AND is_archived=0");
    $classes->execute([$schoolId]);
    $classCount = (int)$classes->fetchColumn();

    // آخرین پیش‌ثبت‌نام‌ها
    $regList = $pdo->prepare("
        SELECT first_name, last_name, grade, major, status, created_at
        FROM registration
        WHERE school_id=? AND is_archived=0
        ORDER BY created_at DESC
        LIMIT 6
    ");
    $regList->execute([$schoolId]);
    $recentRegs = $regList->fetchAll();

    // اطلاعات پروفایل مدیر
    $profile = $pdo->prepare("SELECT first_name, last_name, role, photo FROM users WHERE id=?");
    $profile->execute([$userId]);
    $user = $profile->fetch();

    echo json_encode([
        'success' => true,
        'stats' => [
            'students'    => $studentCount,
            'teachers'    => $teacherCount,
            'pending_regs'=> $pendingRegs,
            'total_regs'  => $totalRegs,
            'classes'     => $classCount,
            'assistants'  => $assistantCount,
            'accepted_regs'=> $acceptedCount,
        ],
        'recent_regs' => $recentRegs,
        'user' => [
            'first_name' => $user['first_name'] ?? '',
            'last_name'  => $user['last_name']  ?? '',
            'role'       => $user['role']        ?? '',
            'photo_url'  => $user['photo'] ? getPhotoUrl($user['photo']) : null,
        ],
    ]);
}

function getProfile(PDO $pdo, int $userId): void
{
    $stmt = $pdo->prepare("SELECT first_name, last_name, username, role, photo FROM users WHERE id=? AND is_archived=0");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) { echo json_encode(['success'=>false,'message'=>'کاربر یافت نشد']); return; }
    $user['photo_url'] = $user['photo'] ? getPhotoUrl($user['photo']) : null;
    echo json_encode(['success'=>true,'user'=>$user]);
}

function getTheme(PDO $pdo, int $userId): void
{
    $schoolId = getSchoolId($pdo, $userId);
    if (!$schoolId) { echo json_encode(['success'=>true,'theme'=>null]); return; }
    $stmt = $pdo->prepare("SELECT name, primary_color, secondary_color, font FROM themes WHERE school_id=? AND is_active=1 ORDER BY id DESC LIMIT 1");
    $stmt->execute([$schoolId]);
    $theme = $stmt->fetch();
    echo json_encode(['success'=>true,'theme'=>$theme ?: null]);
}

function getSchoolId(PDO $pdo, int $userId): ?int
{
    $stmt = $pdo->prepare("SELECT school_id FROM users WHERE id=?");
    $stmt->execute([$userId]);
    $id = $stmt->fetchColumn();
    return $id ? (int)$id : null;
}

function getPhotoUrl(string $path): string
{
    $protocol    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host        = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $apiDir      = dirname($_SERVER['SCRIPT_NAME']);
    $projectRoot = rtrim(dirname($apiDir), '/') . '/';
    return $protocol . '://' . $host . $projectRoot . ltrim($path, '/');
}