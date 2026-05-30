<?php
ob_start();
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['success'=>false,'message'=>"PHP Error: $errstr in $errfile:$errline"]);
    exit;
});
set_exception_handler(function($e) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['success'=>false,'message'=>'Exception: '.$e->getMessage()]);
    exit;
});
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permission_guard.php';
setHeaders();

$guard     = new PermissionGuard('مدیریت دانش‌آموزان');
$guard->autoCheck();
$pdo       = getDB();
$school_id = $guard->schoolId();

// userId با fallback
if (method_exists($guard, 'userId')) {
    $user_id = $guard->userId();
} elseif (method_exists($guard, 'getUserId')) {
    $user_id = $guard->getUserId();
} else {
    $user_id = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? $_SESSION['id'] ?? null;
}

$method    = $_SERVER['REQUEST_METHOD'];

// نقش کاربر لاگین‌شده
$user_role  = 'manager';
$is_teacher = false;
if ($user_id) {
    $_me = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
    $_me->execute([$user_id]);
    $_meRow    = $_me->fetch(PDO::FETCH_ASSOC);
    $user_role = $_meRow['role'] ?? 'manager';
    $is_teacher = ($user_role === 'teacher');
}

// ── GET ──────────────────────────────────────────────────────
if ($method === 'GET') {
    try {
        $action = $_GET['action'] ?? 'classes';

        // ── لیست کلاس‌ها با تعداد دانش‌آموز ──
        if ($action === 'classes') {
            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT DISTINCT c.id, c.code,
                           g.title AS grade,
                           f.title AS field,
                           g.id AS grade_id,
                           f.id AS field_id,
                           (SELECT COUNT(*) FROM student_classes sc
                            JOIN users su ON su.id = sc.student_id
                            WHERE sc.class_id = c.id AND su.is_archived = 0) AS student_count
                    FROM classes c
                    LEFT JOIN grades g ON c.grade_id = g.id
                    LEFT JOIN fields f ON c.field_id = f.id
                    JOIN units u ON u.class_id = c.id AND u.teacher_id = ?
                    WHERE c.school_id = ?
                    ORDER BY g.title ASC, c.code ASC
                ");
                $stmt->execute([$user_id, $school_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT c.id, c.code,
                           g.title AS grade,
                           f.title AS field,
                           g.id AS grade_id,
                           f.id AS field_id,
                           (SELECT COUNT(*) FROM student_classes sc
                            JOIN users su ON su.id = sc.student_id
                            WHERE sc.class_id = c.id AND su.is_archived = 0) AS student_count
                    FROM classes c
                    LEFT JOIN grades g ON c.grade_id = g.id
                    LEFT JOIN fields f ON c.field_id = f.id
                    WHERE c.school_id = ?
                    ORDER BY g.title ASC, c.code ASC
                ");
                $stmt->execute([$school_id]);
            }
            $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $classes], JSON_UNESCAPED_UNICODE);
        }

        // ── دانش‌آموزان یک کلاس (فقط آرشیو نشده‌ها) ──
        elseif ($action === 'students') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $chk = $pdo->prepare("SELECT id FROM classes WHERE id=? AND school_id=?");
            $chk->execute([$class_id, $school_id]);
            if (!$chk->fetch()) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT u.id, u.first_name, u.last_name, u.national_code, u.mobile,
                       u.username, u.birth_date, u.photo
                FROM users u
                JOIN student_classes sc ON sc.student_id = u.id
                WHERE u.role = 'student'
                  AND u.school_id = ?
                  AND sc.class_id = ?
                  AND u.is_archived = 0
                ORDER BY u.last_name ASC, u.first_name ASC
            ");
            $stmt->execute([$school_id, $class_id]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $students = array_map(function($r) {
                return [
                    'id'           => (int)$r['id'],
                    'first_name'   => $r['first_name']   ?? '',
                    'last_name'    => $r['last_name']    ?? '',
                    'full_name'    => trim(($r['first_name'] ?? '') . ' ' . ($r['last_name'] ?? '')),
                    'national_code'=> $r['national_code'] ?? '',
                    'mobile'       => $r['mobile']        ?? '',
                    'username'     => $r['username']      ?? '',
                    'birth_date'   => $r['birth_date']    ?? '',
                    'photo'        => $r['photo']         ?? '',
                    'code'         => $r['national_code'] ?? $r['id'],
                ];
            }, $rows);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $students], JSON_UNESCAPED_UNICODE);
        }

        // ── جزئیات یک دانش‌آموز ──
        elseif ($action === 'student_detail') {
            $student_id = (int)($_GET['student_id'] ?? 0);
            if (!$student_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'student_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT u.id, u.first_name, u.last_name, u.national_code, u.mobile,
                       u.username, u.birth_date, u.photo
                FROM users u
                WHERE u.id = ? AND u.school_id = ? AND u.role = 'student' AND u.is_archived = 0
                LIMIT 1
            ");
            $stmt->execute([$student_id, $school_id]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$student) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'دانش‌آموز یافت نشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            ob_clean();
            echo json_encode(['success' => true, 'data' => $student], JSON_UNESCAPED_UNICODE);
        }

        // ── آمار کلی ──
        elseif ($action === 'stats') {
            $total = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='student' AND is_archived=0");
            $total->execute([$school_id]);
            $classes = $pdo->prepare("SELECT COUNT(*) FROM classes WHERE school_id=?");
            $classes->execute([$school_id]);

            $me = $pdo->prepare("SELECT id, first_name, last_name, role FROM users WHERE id=? LIMIT 1");
            $me->execute([$guard->userId()]);
            $user = $me->fetch(PDO::FETCH_ASSOC);
            $roleLabels = [
                'owner'     => 'مالک',
                'manager'   => 'مدیر',
                'teacher'   => 'معلم',
                'assistant' => 'معاون',
                'parent'    => 'ولی',
                'student'   => 'دانش‌آموز',
            ];
            $currentUser = $user ? [
                'name'       => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                'role'       => $user['role'] ?? '',
                'role_label' => $roleLabels[$user['role']] ?? $user['role'],
            ] : null;

            ob_clean();
            echo json_encode([
                'success'        => true,
                'total_students' => (int)$total->fetchColumn(),
                'total_classes'  => (int)$classes->fetchColumn(),
                'currentUser'    => $currentUser,
            ], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── POST: افزودن دانش‌آموز ────────────────────────────────────
if ($method === 'POST') {
    try {
        $body      = json_decode(file_get_contents('php://input'), true);
        $action    = $body['action'] ?? 'add_student';

        if ($action === 'add_student') {
            $class_id     = (int)($body['class_id']     ?? 0);
            $firstName    = trim($body['first_name']    ?? '');
            $lastName     = trim($body['last_name']     ?? '');
            $nationalCode = trim($body['national_code'] ?? '');
            $mobile       = trim($body['mobile']        ?? '');
            $birthDate    = trim($body['birth_date']    ?? '');
            $username     = trim($body['username']      ?? $nationalCode);
            $password     = trim($body['password']      ?? $nationalCode);
            $photoData    = $body['photo']              ?? '';

            if (!$firstName || !$lastName || !$nationalCode || !$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'فیلدهای الزامی پر نشده (نام، نام خانوادگی، کد ملی، کلاس)'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (!preg_match('/^\d{10}$/', $nationalCode)) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'کد ملی باید ۱۰ رقم باشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($mobile && !preg_match('/^09\d{9}$/', $mobile)) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'شماره موبایل معتبر نیست (مثال: 09123456789)'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM users WHERE (national_code=? OR username=?) AND school_id=? LIMIT 1");
            $check->execute([$nationalCode, $username, $school_id]);
            if ($check->fetch()) {
                ob_clean(); http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'کد ملی یا نام کاربری قبلاً ثبت شده'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $clsChk = $pdo->prepare("SELECT id FROM classes WHERE id=? AND school_id=?");
            $clsChk->execute([$class_id, $school_id]);
            if (!$clsChk->fetch()) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'کلاس یافت نشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // ذخیره عکس
            $photoPath = null;
            if ($photoData && strpos($photoData, 'data:image') === 0) {
                $uploadDir = dirname(__DIR__) . '/uploads/students/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

                $parts = explode(',', $photoData, 2);
                $imageData = base64_decode($parts[1] ?? '');
                if ($imageData) {
                    $mime = '';
                    if (preg_match('/data:image\/(\w+);/', $photoData, $m)) $mime = $m[1];
                    $ext = in_array($mime, ['jpeg','jpg','png','webp']) ? $mime : 'jpg';
                    if ($ext === 'jpeg') $ext = 'jpg';

                    $filename = 'student_' . $nationalCode . '_' . time() . '.' . $ext;
                    if (file_put_contents($uploadDir . $filename, $imageData) !== false) {
                        $photoPath = 'uploads/students/' . $filename;
                    }
                }
            }

            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
                INSERT INTO users (school_id, role, first_name, last_name, mobile, national_code,
                                   username, password, birth_date, photo)
                VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $school_id, $firstName, $lastName, $mobile,
                $nationalCode, $username,
                password_hash($password ?: $nationalCode, PASSWORD_BCRYPT),
                $birthDate ?: null,
                $photoPath,
            ]);
            $newId = (int)$pdo->lastInsertId();

            $sc = $pdo->prepare("INSERT INTO student_classes (student_id, class_id) VALUES (?, ?)");
            $sc->execute([$newId, $class_id]);

            $pdo->commit();

            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => 'دانش‌آموز با موفقیت اضافه شد',
                'id'      => $newId,
                'photo'   => $photoPath,
            ], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'add_to_class') {
            $student_id = (int)($body['student_id'] ?? 0);
            $class_id   = (int)($body['class_id']   ?? 0);
            if (!$student_id || !$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'student_id و class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $dup = $pdo->prepare("SELECT id FROM student_classes WHERE student_id=? AND class_id=?");
            $dup->execute([$student_id, $class_id]);
            if ($dup->fetch()) {
                ob_clean(); http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'دانش‌آموز قبلاً در این کلاس است'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $pdo->prepare("INSERT INTO student_classes (student_id, class_id) VALUES (?,?)")->execute([$student_id, $class_id]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'دانش‌آموز به کلاس اضافه شد'], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── PUT: ویرایش دانش‌آموز ────────────────────────────────────
if ($method === 'PUT') {
    try {
        $body       = json_decode(file_get_contents('php://input'), true);
        $student_id = (int)($body['id'] ?? 0);

        if (!$student_id) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'id الزامی است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $chk = $pdo->prepare("SELECT id, photo FROM users WHERE id=? AND school_id=? AND role='student' AND is_archived=0");
        $chk->execute([$student_id, $school_id]);
        $existing = $chk->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            ob_clean(); http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $firstName    = trim($body['first_name']    ?? '');
        $lastName     = trim($body['last_name']     ?? '');
        $nationalCode = trim($body['national_code'] ?? '');
        $mobile       = trim($body['mobile']        ?? '');
        $birthDate    = trim($body['birth_date']    ?? '');
        $photoData    = $body['photo']              ?? '';

        if ($nationalCode && !preg_match('/^\d{10}$/', $nationalCode)) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'کد ملی باید ۱۰ رقم باشد'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if ($mobile && !preg_match('/^09\d{9}$/', $mobile)) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'شماره موبایل معتبر نیست'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ذخیره عکس جدید
        $photoPath = $existing['photo'];
        if ($photoData && strpos($photoData, 'data:image') === 0) {
            $uploadDir = dirname(__DIR__) . '/uploads/students/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

            $parts = explode(',', $photoData, 2);
            $imageData = base64_decode($parts[1] ?? '');
            if ($imageData) {
                $mime = '';
                if (preg_match('/data:image\/(\w+);/', $photoData, $m)) $mime = $m[1];
                $ext = in_array($mime, ['jpeg','jpg','png','webp']) ? $mime : 'jpg';
                if ($ext === 'jpeg') $ext = 'jpg';

                $filename = 'student_' . ($nationalCode ?: $student_id) . '_' . time() . '.' . $ext;
                if (file_put_contents($uploadDir . $filename, $imageData) !== false) {
                    $photoPath = 'uploads/students/' . $filename;
                    if ($existing['photo'] && file_exists(dirname(__DIR__) . '/' . $existing['photo'])) {
                        @unlink(dirname(__DIR__) . '/' . $existing['photo']);
                    }
                }
            }
        }

        $stmt = $pdo->prepare("
            UPDATE users SET first_name=?, last_name=?, national_code=?, mobile=?, birth_date=?, photo=?
            WHERE id=? AND school_id=?
        ");
        $stmt->execute([
            $firstName, $lastName, $nationalCode, $mobile,
            $birthDate ?: null, $photoPath,
            $student_id, $school_id
        ]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'اطلاعات دانش‌آموز به‌روزرسانی شد', 'photo' => $photoPath], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ── DELETE ──────────────────────────────────────────────────
if ($method === 'DELETE') {
    try {
        $body       = json_decode(file_get_contents('php://input'), true);
        $action     = $body['action'] ?? 'remove_from_class';
        $student_id = (int)($body['student_id'] ?? 0);
        $class_id   = (int)($body['class_id']   ?? 0);

        if (!$student_id) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'student_id الزامی است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $chk = $pdo->prepare("SELECT id FROM users WHERE id=? AND school_id=? AND role='student'");
        $chk->execute([$student_id, $school_id]);
        if (!$chk->fetch()) {
            ob_clean(); http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ── حذف از کلاس (بدون تغییر) ──
        if ($action === 'remove_from_class' && $class_id) {
            $pdo->prepare("DELETE FROM student_classes WHERE student_id=? AND class_id=?")->execute([$student_id, $class_id]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'دانش‌آموز از کلاس حذف شد'], JSON_UNESCAPED_UNICODE);

        // ── آرشیو دانش‌آموز (به جای حذف دائمی) ──
        } elseif ($action === 'delete_student') {
            // بررسی که قبلاً آرشیو نشده باشه
            $chkArc = $pdo->prepare("SELECT id FROM users WHERE id=? AND school_id=? AND role='student' AND is_archived=0");
            $chkArc->execute([$student_id, $school_id]);
            if (!$chkArc->fetch()) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'دانش‌آموز یافت نشد یا قبلاً آرشیو شده'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE users
                SET is_archived = 1, archived_at = NOW(), archived_reason = 'آرشیو توسط مدیر'
                WHERE id = ? AND school_id = ? AND role = 'student'
            ");
            $stmt->execute([$student_id, $school_id]);

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'دانش‌آموز با موفقیت آرشیو شد'], JSON_UNESCAPED_UNICODE);

        } else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

ob_clean();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);