<?php
/**
 * Attendance API - سیستم حضور و غیاب
 * با پشتیبانی کامل از نقش معلم و مدیر
 */
ob_start();
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => "PHP Error: $errstr in $errfile:$errline"]);
    exit;
});
set_exception_handler(function($e) {
    ob_clean();
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Exception: ' . $e->getMessage()]);
    exit;
});

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permission_guard.php';

// ⚠️ guard و session_start باید قبل از setHeaders باشن
// چون setHeaders یک header ارسال می‌کنه و بعدش session_start کار نمی‌کنه
$guard     = new PermissionGuard('حضور و غیاب');
$guard->autoCheck();

setHeaders();
$pdo       = getDB();
$school_id = $guard->schoolId();

// دریافت user_id
if (method_exists($guard, 'userId')) {
    $user_id = $guard->userId();
} elseif (method_exists($guard, 'getUserId')) {
    $user_id = $guard->getUserId();
} else {
    $user_id = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? $_SESSION['id'] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

// تعیین نقش کاربر
$user_role  = 'manager';
$is_teacher = false;
if ($user_id) {
    $me = $pdo->prepare("SELECT role, first_name, last_name FROM users WHERE id = ? LIMIT 1");
    $me->execute([$user_id]);
    $meRow     = $me->fetch(PDO::FETCH_ASSOC);
    $user_role = $meRow['role'] ?? 'manager';
    $is_teacher = ($user_role === 'teacher');
}

// ==================== GET ====================
if ($method === 'GET') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $action = $_GET['action'] ?? 'classes';

        // ─── دریافت لیست کلاس‌ها ───
        if ($action === 'classes') {
            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT DISTINCT c.id, c.code,
                           g.title AS grade, f.title AS field,
                           f.id AS field_id, g.id AS grade_id,
                           (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id) AS student_count
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
                           g.title AS grade, f.title AS field,
                           f.id AS field_id, g.id AS grade_id,
                           (SELECT COUNT(*) FROM student_classes sc WHERE sc.class_id = c.id) AS student_count
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
            echo json_encode([
                'success'    => true,
                'data'       => $classes,
                'is_teacher' => $is_teacher,
                'user_id'    => $user_id,
                'user_name'  => trim(($meRow['first_name'] ?? '') . ' ' . ($meRow['last_name'] ?? '')),
                'user_role'  => $user_role,
            ], JSON_UNESCAPED_UNICODE);
        }

        // ─── زنگ‌های یک کلاس ───
        elseif ($action === 'schedules') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT s.id AS schedule_id, s.day_of_week, s.time_start, s.time_end,
                           l.name AS lesson_name, l.id AS lesson_id,
                           u.id AS unit_id, u.teacher_id,
                           CONCAT(usr.first_name, ' ', usr.last_name) AS teacher_name
                    FROM schedules s
                    JOIN units u ON s.class_lesson_id = u.id
                    JOIN lessons l ON u.lesson_id = l.id
                    JOIN users usr ON u.teacher_id = usr.id
                    WHERE u.class_id = ? AND u.teacher_id = ?
                    ORDER BY s.day_of_week ASC, s.time_start ASC
                ");
                $stmt->execute([$class_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT s.id AS schedule_id, s.day_of_week, s.time_start, s.time_end,
                           l.name AS lesson_name, l.id AS lesson_id,
                           u.id AS unit_id, u.teacher_id,
                           CONCAT(usr.first_name, ' ', usr.last_name) AS teacher_name
                    FROM schedules s
                    JOIN units u ON s.class_lesson_id = u.id
                    JOIN lessons l ON u.lesson_id = l.id
                    JOIN users usr ON u.teacher_id = usr.id
                    WHERE u.class_id = ?
                    ORDER BY s.day_of_week ASC, s.time_start ASC
                ");
                $stmt->execute([$class_id]);
            }
            $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $schedules], JSON_UNESCAPED_UNICODE);
        }

        // ─── دانش‌آموزان یک کلاس ───
        elseif ($action === 'students') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $chk = $pdo->prepare("SELECT id FROM units WHERE class_id = ? AND teacher_id = ? LIMIT 1");
                $chk->execute([$class_id, $user_id]);
                if (!$chk->fetch()) {
                    ob_clean(); http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'دسترسی به این کلاس مجاز نیست'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            $stmt = $pdo->prepare("
                SELECT u.id, u.first_name, u.last_name,
                       CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                       u.national_code, sc.id AS student_class_id
                FROM student_classes sc
                JOIN users u ON sc.student_id = u.id
                WHERE sc.class_id = ? AND u.school_id = ?
                ORDER BY u.last_name ASC, u.first_name ASC
            ");
            $stmt->execute([$class_id, $school_id]);
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $students], JSON_UNESCAPED_UNICODE);
        }

        // ─── حضور ثبت‌شده ───
        elseif ($action === 'attendance') {
            $class_id    = (int)($_GET['class_id']    ?? 0);
            $date        = trim($_GET['date']          ?? '');
            $schedule_id = (int)($_GET['schedule_id'] ?? 0);

            if (!$class_id || !$date || !$schedule_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'پارامترهای ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $chk = $pdo->prepare("
                    SELECT u.id FROM units u 
                    JOIN schedules s ON s.class_lesson_id = u.id
                    WHERE s.id = ? AND u.teacher_id = ? LIMIT 1
                ");
                $chk->execute([$schedule_id, $user_id]);
                if (!$chk->fetch()) {
                    ob_clean(); http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            $stmt = $pdo->prepare("
                SELECT a.student_id, a.status, a.id AS attendance_id
                FROM attendance a
                WHERE a.schedule_id = ? AND a.date = ?
            ");
            $stmt->execute([$schedule_id, $date]);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $result = [];
            foreach ($records as $r) {
                $result[$r['student_id']] = [
                    'status'        => $r['status'],
                    'attendance_id' => $r['attendance_id'],
                ];
            }

            ob_clean();
            echo json_encode(['success' => true, 'data' => $result], JSON_UNESCAPED_UNICODE);
        }

        // ─── آمار کلی یک کلاس ───
        elseif ($action === 'class_stats') {
            $class_id  = (int)($_GET['class_id']  ?? 0);
            $from_date = trim($_GET['from_date'] ?? '');
            $to_date   = trim($_GET['to_date']   ?? '');

            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 🔧 FIX: dateFilter روی LEFT JOIN اصلی اعمال می‌شه نه subquery
            $dateFilter = '';
            $dateParams = [];
            if ($from_date) { $dateFilter .= " AND a.date >= ?"; $dateParams[] = $from_date; }
            if ($to_date)   { $dateFilter .= " AND a.date <= ?"; $dateParams[] = $to_date; }

            $stmt = $pdo->prepare("
                SELECT u.id AS student_id,
                       CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                       u.national_code,
                       SUM(CASE WHEN a.status = 'present'   THEN 1 ELSE 0 END) AS present_count,
                       SUM(CASE WHEN a.status = 'absent'    THEN 1 ELSE 0 END) AS absent_count,
                       SUM(CASE WHEN a.status = 'late'      THEN 1 ELSE 0 END) AS late_count,
                       SUM(CASE WHEN a.status = 'leave'     THEN 1 ELSE 0 END) AS leave_count,
                       SUM(CASE WHEN a.status = 'expulsion' THEN 1 ELSE 0 END) AS expulsion_count,
                       COUNT(a.id) AS total_sessions
                FROM student_classes sc
                JOIN users u ON sc.student_id = u.id
                LEFT JOIN attendance a ON a.student_id = u.id
                    AND a.schedule_id IN (
                        SELECT s.id FROM schedules s
                        JOIN units un ON s.class_lesson_id = un.id
                        WHERE un.class_id = ?
                    )
                    $dateFilter
                WHERE sc.class_id = ? AND u.school_id = ?
                GROUP BY u.id, u.first_name, u.last_name, u.national_code
                ORDER BY u.last_name ASC
            ");

            // ترتیب: class_id (subquery) + dateParams + class_id + school_id
            $allParams = array_merge([$class_id], $dateParams, [$class_id, $school_id]);
            $stmt->execute($allParams);
            $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stats], JSON_UNESCAPED_UNICODE);
        }

        // ─── آمار نمودار ماهانه ───
        elseif ($action === 'monthly_chart') {
            $class_id   = (int)($_GET['class_id']   ?? 0);
            $year_month = trim($_GET['year_month']  ?? '');

            if (!$class_id || !$year_month) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'پارامترهای ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
                       SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
                       SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absent_count,
                       SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) AS late_count,
                       SUM(CASE WHEN a.status = 'leave'   THEN 1 ELSE 0 END) AS leave_count
                FROM attendance a
                JOIN schedules s ON a.schedule_id = s.id
                JOIN units u ON s.class_lesson_id = u.id
                WHERE u.class_id = ?
                  AND DATE_FORMAT(a.date, '%Y-%m') = ?
                GROUP BY a.date
                ORDER BY a.date ASC
            ");
            $stmt->execute([$class_id, $year_month]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        }

        // ─── دانش‌آموزان پرغیبت ───
        // 🔧 FIX: ساخت صحیح آرایه params — array_splice حذف شد
        elseif ($action === 'absent_report') {
            $threshold = (int)($_GET['threshold'] ?? 3);
            $from_date = trim($_GET['from_date'] ?? '');
            $to_date   = trim($_GET['to_date']   ?? '');

            $dateFilter = '';
            $params     = [$school_id];
            if ($from_date) { $dateFilter .= " AND a.date >= ?"; $params[] = $from_date; }
            if ($to_date)   { $dateFilter .= " AND a.date <= ?"; $params[] = $to_date; }
            $params[] = $threshold; // همیشه آخر — برای HAVING

            $stmt = $pdo->prepare("
                SELECT u.id AS student_id,
                       CONCAT(u.first_name, ' ', u.last_name) AS full_name,
                       u.national_code,
                       c.code AS class_code,
                       g.title AS grade, f.title AS field,
                       COUNT(a.id) AS absent_count
                FROM attendance a
                JOIN users u ON a.student_id = u.id
                JOIN schedules s ON a.schedule_id = s.id
                JOIN units un ON s.class_lesson_id = un.id
                JOIN classes c ON un.class_id = c.id
                LEFT JOIN grades g ON c.grade_id = g.id
                LEFT JOIN fields f ON c.field_id = f.id
                WHERE u.school_id = ?
                  AND a.status = 'absent'
                  $dateFilter
                GROUP BY u.id, u.first_name, u.last_name, u.national_code, c.code, g.title, f.title
                HAVING absent_count >= ?
                ORDER BY absent_count DESC
                LIMIT 100
            ");
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        }

        // ─── تاریخچه حضور یک دانش‌آموز ───
        elseif ($action === 'student_history') {
            $student_id = (int)($_GET['student_id'] ?? 0);
            $class_id   = (int)($_GET['class_id']   ?? 0);

            if (!$student_id || !$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'پارامترهای ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT a.id, a.date, a.status,
                       s.day_of_week, s.time_start, s.time_end,
                       l.name AS lesson_name, s.id AS schedule_id
                FROM attendance a
                JOIN schedules s ON a.schedule_id = s.id
                JOIN units u ON s.class_lesson_id = u.id
                JOIN lessons l ON u.lesson_id = l.id
                WHERE a.student_id = ? AND u.class_id = ?
                ORDER BY a.date DESC, s.time_start ASC
            ");
            $stmt->execute([$student_id, $class_id]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $history], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'action نامعتبر: ' . $action], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== POST ====================
if ($method === 'POST') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $body   = json_decode(file_get_contents('php://input'), true);
        $action = $body['action'] ?? '';

        // ─── ثبت/ویرایش حضور (batch) ───
        if ($action === 'save_attendance') {
            $class_id    = (int)($body['class_id']    ?? 0);
            $schedule_id = (int)($body['schedule_id'] ?? 0);
            $date        = trim($body['date']          ?? '');
            $records     = $body['records']            ?? [];

            if (!$class_id || !$schedule_id || !$date || empty($records)) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'اطلاعات ناقص است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $schedCheck = $pdo->prepare("
                SELECT s.id FROM schedules s
                JOIN units u ON s.class_lesson_id = u.id
                WHERE s.id = ? AND u.class_id = ?
                LIMIT 1
            ");
            $schedCheck->execute([$schedule_id, $class_id]);
            if (!$schedCheck->fetch()) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'زنگ درسی متعلق به این کلاس نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $teachCheck = $pdo->prepare("
                    SELECT u.id FROM units u
                    JOIN schedules s ON s.class_lesson_id = u.id
                    WHERE s.id = ? AND u.teacher_id = ? LIMIT 1
                ");
                $teachCheck->execute([$schedule_id, $user_id]);
                if (!$teachCheck->fetch()) {
                    ob_clean(); http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'شما معلم این زنگ نیستید'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            $validStatuses = ['present', 'absent', 'late', 'leave', 'expulsion'];
            $pdo->beginTransaction();

            try {
                foreach ($records as $rec) {
                    $student_id = (int)($rec['student_id'] ?? 0);
                    $status     = trim($rec['status']      ?? '');

                    if (!$student_id || !in_array($status, $validStatuses)) continue;

                    $exist = $pdo->prepare("
                        SELECT id FROM attendance
                        WHERE schedule_id = ? AND student_id = ? AND date = ?
                        LIMIT 1
                    ");
                    $exist->execute([$schedule_id, $student_id, $date]);
                    $existRow = $exist->fetch(PDO::FETCH_ASSOC);

                    if ($existRow) {
                        $pdo->prepare("UPDATE attendance SET status = ? WHERE id = ?")
                            ->execute([$status, $existRow['id']]);
                    } else {
                        $pdo->prepare("INSERT INTO attendance (schedule_id, student_id, date, status) VALUES (?, ?, ?, ?)")
                            ->execute([$schedule_id, $student_id, $date, $status]);
                    }
                }

                $pdo->commit();
                ob_clean();
                echo json_encode(['success' => true, 'message' => 'حضور و غیاب با موفقیت ثبت شد'], JSON_UNESCAPED_UNICODE);

            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        }

        // ─── ویرایش یک رکورد ───
        elseif ($action === 'update_single') {
            $attendance_id = (int)($body['attendance_id'] ?? 0);
            $status        = trim($body['status']          ?? '');
            $validStatuses = ['present', 'absent', 'late', 'leave', 'expulsion'];

            if (!$attendance_id || !in_array($status, $validStatuses)) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'اطلاعات نامعتبر'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $chk = $pdo->prepare("
                    SELECT a.id FROM attendance a
                    JOIN schedules s ON a.schedule_id = s.id
                    JOIN units u ON s.class_lesson_id = u.id
                    WHERE a.id = ? AND u.teacher_id = ? LIMIT 1
                ");
                $chk->execute([$attendance_id, $user_id]);
                if (!$chk->fetch()) {
                    ob_clean(); http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
            }

            $pdo->prepare("UPDATE attendance SET status = ? WHERE id = ?")->execute([$status, $attendance_id]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'وضعیت بروزرسانی شد'], JSON_UNESCAPED_UNICODE);
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

// ==================== DELETE ====================
if ($method === 'DELETE') {
    try {
        $body          = json_decode(file_get_contents('php://input'), true);
        $attendance_id = (int)($body['attendance_id'] ?? 0);

        if (!$attendance_id) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'attendance_id الزامی است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($is_teacher) {
            $chk = $pdo->prepare("
                SELECT a.id FROM attendance a
                JOIN schedules s ON a.schedule_id = s.id
                JOIN units u ON s.class_lesson_id = u.id
                WHERE a.id = ? AND u.teacher_id = ? LIMIT 1
            ");
            $chk->execute([$attendance_id, $user_id]);
            if (!$chk->fetch()) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        $pdo->prepare("DELETE FROM attendance WHERE id = ?")->execute([$attendance_id]);
        ob_clean();
        echo json_encode(['success' => true, 'message' => 'رکورد حذف شد'], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// متد نامعتبر
ob_clean(); http_response_code(405);
echo json_encode(['success' => false, 'message' => 'متد مجاز نیست'], JSON_UNESCAPED_UNICODE);