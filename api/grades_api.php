<?php
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

$guard     = new PermissionGuard('نمرات');
$guard->autoCheck();

setHeaders();
$pdo       = getDB();
$school_id = $guard->schoolId();

if (method_exists($guard, 'userId')) {
    $user_id = $guard->userId();
} elseif (method_exists($guard, 'getUserId')) {
    $user_id = $guard->getUserId();
} else {
    $user_id = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? $_SESSION['id'] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

$user_role  = 'manager';
$is_teacher = false;
$meRow      = [];
if ($user_id) {
    $me = $pdo->prepare("SELECT role, first_name, last_name FROM users WHERE id = ? LIMIT 1");
    $me->execute([$user_id]);
    $meRow      = $me->fetch(PDO::FETCH_ASSOC) ?: [];
    $user_role  = $meRow['role'] ?? 'manager';
    $is_teacher = ($user_role === 'teacher');
}

// ─── تابع تبدیل تاریخ جلالی به میلادی ───
function jalaliToGregorian($jy, $jm, $jd) {
    $jy += 1595;
    $days = -355779 + (365 * $jy) + (floor($jy / 33) * 8)
          + floor((($jy % 33) + 3) / 4) + $jd;
    if ($jm <= 6) {
        $days += ($jm - 1) * 31;
    } else {
        $days += (($jm - 7) * 30) + 186;
    }
    $gy   = 400 * floor($days / 146097);
    $days %= 146097;
    if ($days > 36524) {
        $gy   += 100 * floor(--$days / 36524);
        $days %= 36524;
        if ($days >= 365) $days++;
    }
    $gy   += 4 * floor($days / 1461);
    $days %= 1461;
    if ($days > 364) {
        $gy   += floor(($days - 1) / 365);
        $days  = ($days - 1) % 365;
    }
    $gd = $days + 1;
    $gDaysInMonths = [29, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if ($gy % 4 === 0 && ($gy % 100 !== 0 || $gy % 400 === 0)) $gDaysInMonths[1] = 29;
    $gm = 0;
    foreach ($gDaysInMonths as $i => $dim) {
        if ($gd <= $dim) { $gm = $i + 1; break; }
        $gd -= $dim;
    }
    return sprintf('%04d-%02d-%02d', $gy, $gm, $gd);
}

function convertDate($date) {
    if (!$date) return null;
    $parts = preg_split('/[\/\-]/', trim($date));
    if (count($parts) === 3) {
        $y = (int)$parts[0];
        $m = (int)$parts[1];
        $d = (int)$parts[2];
        // اگر سال جلالی بود (بین 1300 تا 1500)
        if ($y >= 1300 && $y <= 1500) {
            return jalaliToGregorian($y, $m, $d);
        }
        // میلادی — همانطور برگردون
        return sprintf('%04d-%02d-%02d', $y, $m, $d);
    }
    return null;
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

        // ─── لیست کلاس‌ها ───
        if ($action === 'classes') {
            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT DISTINCT c.id, c.code,
                           g.title AS grade, f.title AS field,
                           g.id AS grade_id, f.id AS field_id,
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
                           g.id AS grade_id, f.id AS field_id,
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
                       u.national_code
                FROM student_classes sc
                JOIN users u ON sc.student_id = u.id
                WHERE sc.class_id = ? AND u.school_id = ?
                ORDER BY u.last_name ASC, u.first_name ASC
            ");
            $stmt->execute([$class_id, $school_id]);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── دروس یک کلاس ───
        elseif ($action === 'lessons') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT l.id AS lesson_id, l.name, l.code,
                           u.id AS unit_id, u.teacher_id
                    FROM units u
                    JOIN lessons l ON l.id = u.lesson_id
                    WHERE u.class_id = ? AND u.teacher_id = ?
                    ORDER BY l.name ASC
                ");
                $stmt->execute([$class_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT l.id AS lesson_id, l.name, l.code,
                           u.id AS unit_id, u.teacher_id,
                           CONCAT(t.first_name,' ',t.last_name) AS teacher_name
                    FROM units u
                    JOIN lessons l ON l.id = u.lesson_id
                    JOIN users t ON t.id = u.teacher_id
                    WHERE u.class_id = ?
                    ORDER BY l.name ASC
                ");
                $stmt->execute([$class_id]);
            }

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── نمرات یک کلاس ───
        elseif ($action === 'scores') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT s.id, s.student_id, s.units_id,
                           u.lesson_id, s.term, s.grade_type,
                           s.score, s.date
                    FROM scores s
                    JOIN units u ON u.id = s.units_id
                    WHERE u.class_id = ? AND u.teacher_id = ?
                      AND s.student_id IS NOT NULL
                    ORDER BY s.student_id, u.lesson_id, s.term, s.grade_type
                ");
                $stmt->execute([$class_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT s.id, s.student_id, s.units_id,
                           u.lesson_id, s.term, s.grade_type,
                           s.score, s.date
                    FROM scores s
                    JOIN units u ON u.id = s.units_id
                    WHERE u.class_id = ? AND s.student_id IS NOT NULL
                    ORDER BY s.student_id, u.lesson_id, s.term, s.grade_type
                ");
                $stmt->execute([$class_id]);
            }

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── آمار دانش‌آموزان یک کلاس ───
        elseif ($action === 'class_stats') {
            $class_id = (int)($_GET['class_id'] ?? 0);
            if (!$class_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'class_id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT u.id AS student_id,
                       CONCAT(u.first_name,' ',u.last_name) AS full_name,
                       u.national_code,
                       AVG(s.score)  AS avg_score,
                       COUNT(s.id)   AS score_count
                FROM student_classes sc
                JOIN users u ON sc.student_id = u.id
                LEFT JOIN scores s ON s.student_id = u.id
                    AND s.units_id IN (SELECT id FROM units WHERE class_id = ?)
                    AND s.student_id IS NOT NULL
                WHERE sc.class_id = ? AND u.school_id = ?
                GROUP BY u.id, u.first_name, u.last_name, u.national_code
                ORDER BY u.last_name ASC
            ");
            $stmt->execute([$class_id, $class_id, $school_id]);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── آمار کلی مدرسه ───
        elseif ($action === 'school_stats') {
            $stmt = $pdo->prepare("
                SELECT
                    (SELECT COUNT(*) FROM users   WHERE school_id = ? AND role = 'student') AS total_students,
                    (SELECT COUNT(*) FROM classes WHERE school_id = ?)                       AS total_classes,
                    (SELECT AVG(s.score) FROM scores s
                        JOIN units u ON u.id = s.units_id
                        JOIN classes c ON c.id = u.class_id
                        WHERE c.school_id = ? AND s.student_id IS NOT NULL)                  AS school_avg
            ");
            $stmt->execute([$school_id, $school_id, $school_id]);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── توزیع نمرات ───
        elseif ($action === 'score_distribution') {
            $class_id    = (int)($_GET['class_id'] ?? 0);
            $classFilter = $class_id ? "AND u.class_id = " . (int)$class_id : "";

            $stmt = $pdo->prepare("
                SELECT
                    SUM(CASE WHEN s.score >= 18                   THEN 1 ELSE 0 END) AS excellent,
                    SUM(CASE WHEN s.score >= 15 AND s.score < 18  THEN 1 ELSE 0 END) AS good,
                    SUM(CASE WHEN s.score >= 12 AND s.score < 15  THEN 1 ELSE 0 END) AS average,
                    SUM(CASE WHEN s.score  < 12 AND s.score  > 0  THEN 1 ELSE 0 END) AS weak
                FROM scores s
                JOIN units u ON u.id = s.units_id
                JOIN classes c ON c.id = u.class_id
                WHERE c.school_id = ? AND s.student_id IS NOT NULL
                $classFilter
            ");
            $stmt->execute([$school_id]);

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        // ─── رویدادهای امتحانی ───
        elseif ($action === 'exam_events') {
            $tblCheck = $pdo->query("SHOW TABLES LIKE 'exam_events'")->fetch();
            if (!$tblCheck) {
                ob_clean();
                echo json_encode(['success' => true, 'data' => []], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($is_teacher) {
                $stmt = $pdo->prepare("
                    SELECT e.id, e.class_id, e.lesson_id, e.type,
                           e.date, e.time, e.description, e.status,
                           c.code AS class_code, l.name AS subject_name
                    FROM exam_events e
                    JOIN classes c ON c.id = e.class_id
                    JOIN lessons l ON l.id = e.lesson_id
                    WHERE e.school_id = ? AND e.created_by = ?
                    ORDER BY e.date ASC, e.time ASC
                ");
                $stmt->execute([$school_id, $user_id]);
            } else {
                $stmt = $pdo->prepare("
                    SELECT e.id, e.class_id, e.lesson_id, e.type,
                           e.date, e.time, e.description, e.status,
                           c.code AS class_code, l.name AS subject_name
                    FROM exam_events e
                    JOIN classes c ON c.id = e.class_id
                    JOIN lessons l ON l.id = e.lesson_id
                    WHERE e.school_id = ?
                    ORDER BY e.date ASC, e.time ASC
                ");
                $stmt->execute([$school_id]);
            }

            ob_clean();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
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

        // ─── ثبت دسته‌ای نمرات ───
if ($action === 'save_scores') {
    $class_id  = (int)($body['class_id']  ?? 0);
    $unit_id   = (int)($body['unit_id']   ?? 0);
    $term      = (int)($body['term']       ?? 1);
    $gradeType = trim($body['grade_type']  ?? 'continuous');
    $date      = trim($body['date']        ?? '');
    $records   = $body['records']          ?? [];

    if (!$class_id || !$unit_id) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'class_id و unit_id الزامی هستند'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (empty($records)) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'هیچ نمره‌ای ارسال نشده'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $allowedTypes = ['continuous', 'midterm', 'final'];
    $maxScore     = 20;
    $validSteps   = [0, 0.25, 0.5, 0.75];

    if (!in_array($gradeType, $allowedTypes)) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'نوع نمره نامعتبر است'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $chkUnit = $pdo->prepare("
        SELECT u.id FROM units u
        JOIN classes c ON c.id = u.class_id
        WHERE u.id = ? AND u.class_id = ? AND c.school_id = ?
        LIMIT 1
    ");
    $chkUnit->execute([$unit_id, $class_id, $school_id]);
    if (!$chkUnit->fetch()) {
        ob_clean(); http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'درس متعلق به این کلاس نیست'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($is_teacher) {
        $chkT = $pdo->prepare("SELECT id FROM units WHERE id = ? AND teacher_id = ? LIMIT 1");
        $chkT->execute([$unit_id, $user_id]);
        if (!$chkT->fetch()) {
            ob_clean(); http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'شما معلم این درس نیستید'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $dateGregorian = convertDate($date);

    try {
        $pdo->exec("ALTER TABLE scores ADD UNIQUE KEY uq_score (units_id, student_id, term, grade_type)");
    } catch (Exception $e) {}

    $pdo->beginTransaction();
    $saved = 0; $skipped = 0;

    try {
        foreach ($records as $rec) {
            $studentId = (int)($rec['student_id'] ?? 0);
            $score     = $rec['score'];

            if (!$studentId || $score === '' || $score === null) { $skipped++; continue; }

            $score = (float)$score;
            
            if ($score < 0 || $score > $maxScore) { $skipped++; continue; }
            
            $remainder = fmod($score, 0.25);
            if (abs($remainder) > 0.001 && abs($remainder - 0.25) > 0.001) {
                $skipped++;
                continue;
            }
            
            $score = round($score / 0.25) * 0.25;
            $score = min($maxScore, max(0, $score));

            $chkSt = $pdo->prepare("
                SELECT id FROM student_classes
                WHERE student_id = ? AND class_id = ? LIMIT 1
            ");
            $chkSt->execute([$studentId, $class_id]);
            if (!$chkSt->fetch()) { $skipped++; continue; }

            $pdo->prepare("
                INSERT INTO scores (units_id, student_id, term, grade_type, score, date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    score      = VALUES(score),
                    date       = VALUES(date),
                    created_by = VALUES(created_by)
            ")->execute([$unit_id, $studentId, $term, $gradeType, $score, $dateGregorian, $user_id]);

            $saved++;
        }

        $pdo->commit();
        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => "نمرات با موفقیت ثبت شد. ($saved ثبت، $skipped رد شد)",
            'saved'   => $saved,
            'skipped' => $skipped,
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

        // ─── ذخیره/ویرایش رویداد امتحانی ───
        elseif ($action === 'save_exam_event') {
            $tblCheck = $pdo->query("SHOW TABLES LIKE 'exam_events'")->fetch();
            if (!$tblCheck) {
                ob_clean(); http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'جدول exam_events وجود ندارد'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $id          = (int)($body['id']          ?? 0);
            $class_id    = (int)($body['class_id']    ?? 0);
            $lesson_id   = (int)($body['lesson_id']   ?? 0);
            $type        = trim($body['type']         ?? 'midterm');
            $date        = trim($body['date']         ?? '');
            $time        = trim($body['time']         ?? '');
            $description = trim($body['description']  ?? '');
            $status      = trim($body['status']       ?? 'pending');

            if (!$class_id || !$lesson_id || !$date || !$time) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'فیلدهای الزامی وارد نشده‌اند'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $allowedTypes    = ['midterm', 'final', 'quiz', 'project'];
            $allowedStatuses = ['pending', 'completed', 'cancelled'];
            if (!in_array($type, $allowedTypes) || !in_array($status, $allowedStatuses)) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'نوع یا وضعیت نامعتبر است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $chkCls = $pdo->prepare("SELECT id FROM classes WHERE id = ? AND school_id = ? LIMIT 1");
            $chkCls->execute([$class_id, $school_id]);
            if (!$chkCls->fetch()) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'کلاس متعلق به این مدرسه نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // تبدیل تاریخ
            $dateGregorian = convertDate($date);

            if ($id) {
                $chk = $pdo->prepare("SELECT id, created_by FROM exam_events WHERE id = ? AND school_id = ?");
                $chk->execute([$id, $school_id]);
                $ev = $chk->fetch(PDO::FETCH_ASSOC);
                if (!$ev) {
                    ob_clean(); http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'رویداد یافت نشد'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                if ($is_teacher && $ev['created_by'] != $user_id) {
                    ob_clean(); http_response_code(403);
                    echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $pdo->prepare("
                    UPDATE exam_events
                    SET class_id=?, lesson_id=?, type=?, date=?, time=?, description=?, status=?
                    WHERE id=?
                ")->execute([$class_id, $lesson_id, $type, $dateGregorian, $time, $description, $status, $id]);

                ob_clean();
                echo json_encode(['success' => true, 'message' => 'رویداد ویرایش شد', 'id' => $id], JSON_UNESCAPED_UNICODE);
            } else {
                $ins = $pdo->prepare("
                    INSERT INTO exam_events (school_id, class_id, lesson_id, type, date, time, description, status, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $ins->execute([$school_id, $class_id, $lesson_id, $type, $dateGregorian, $time, $description, $status, $user_id]);

                ob_clean();
                echo json_encode(['success' => true, 'message' => 'رویداد ثبت شد', 'id' => (int)$pdo->lastInsertId()], JSON_UNESCAPED_UNICODE);
            }
        }

        // ─── تغییر وضعیت رویداد ───
        elseif ($action === 'toggle_exam_status') {
            $id = (int)($body['id'] ?? 0);
            if (!$id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $chk = $pdo->prepare("SELECT id, status, created_by FROM exam_events WHERE id = ? AND school_id = ?");
            $chk->execute([$id, $school_id]);
            $ev = $chk->fetch(PDO::FETCH_ASSOC);
            if (!$ev) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'رویداد یافت نشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $newStatus = $ev['status'] === 'pending' ? 'completed' : 'pending';
            $pdo->prepare("UPDATE exam_events SET status = ? WHERE id = ?")->execute([$newStatus, $id]);

            ob_clean();
            echo json_encode(['success' => true, 'message' => 'وضعیت تغییر کرد', 'new_status' => $newStatus], JSON_UNESCAPED_UNICODE);
        }

        // ─── حذف رویداد ───
        elseif ($action === 'delete_exam_event') {
            $id = (int)($body['id'] ?? 0);
            if (!$id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'id الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $chk = $pdo->prepare("SELECT id, created_by FROM exam_events WHERE id = ? AND school_id = ?");
            $chk->execute([$id, $school_id]);
            $ev = $chk->fetch(PDO::FETCH_ASSOC);
            if (!$ev) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'رویداد یافت نشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            if ($is_teacher && $ev['created_by'] != $user_id) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pdo->prepare("DELETE FROM exam_events WHERE id = ?")->execute([$id]);
            ob_clean();
            echo json_encode(['success' => true, 'message' => 'رویداد حذف شد'], JSON_UNESCAPED_UNICODE);
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

ob_clean(); http_response_code(405);
echo json_encode(['success' => false, 'message' => 'متد مجاز نیست'], JSON_UNESCAPED_UNICODE);