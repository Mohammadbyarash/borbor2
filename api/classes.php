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

$guard      = new PermissionGuard('برنامه کلاسی');
$guard->autoCheck();
$pdo        = getDB();
$school_id  = $guard->schoolId();

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
if ($user_id) {
    $_me = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
    $_me->execute([$user_id]);
    $_meRow    = $_me->fetch(PDO::FETCH_ASSOC);
    $user_role = $_meRow['role'] ?? 'manager';
    $is_teacher = ($user_role === 'teacher');
}

function getAdminInfo($pdo, $user_id) {
    $roleMap = ['owner'=>'مالک','manager'=>'مدیر','teacher'=>'معلم','assistant'=>'معاون','parent'=>'ولی','student'=>'دانش‌آموز'];
    $s = $pdo->prepare("SELECT first_name, last_name, role FROM users WHERE id = ? LIMIT 1");
    $s->execute([$user_id]);
    $user = $s->fetch(PDO::FETCH_ASSOC);
    if (!$user) return ['name'=>'','role'=>''];
    return [
        'name' => trim(($user['first_name']??'').' '.($user['last_name']??'')),
        'role' => $roleMap[$user['role']] ?? ($user['role']??''),
    ];
}

// ==================== GET ====================
if ($method === 'GET') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success'=>false,'message'=>'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $action = $_GET['action'] ?? 'classes';

        if ($action === 'classes') {
            $adminInfo = getAdminInfo($pdo, $user_id);

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
                    WHERE c.school_id = ? AND c.is_archived = 0

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
                    WHERE c.school_id = ? AND c.is_archived = 0

                    ORDER BY g.title ASC, c.code ASC
                ");
                $stmt->execute([$school_id]);
            }
            $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($classes as &$cls) {
                if ($is_teacher) {
                    $schedStmt = $pdo->prepare("
                        SELECT s.id, s.day_of_week, s.time_start, s.time_end,
                        l.name AS lesson_name, l.id AS lesson_id,
                        u.id AS teacher_id, un.id AS unit_id
                        FROM schedules s
                        JOIN units un ON s.class_lesson_id = un.id
                        JOIN lessons l ON un.lesson_id = l.id
                        JOIN users u ON un.teacher_id = u.id
                        WHERE un.class_id = ? AND un.teacher_id = ?
                        ORDER BY s.day_of_week ASC, s.time_start ASC
                    ");
                    $schedStmt->execute([$cls['id'], $user_id]);
                } else {
                    $schedStmt = $pdo->prepare("
                        SELECT s.id, s.day_of_week, s.time_start, s.time_end,
                               l.name AS lesson_name, l.id AS lesson_id,
                               u.first_name, u.last_name, u.id AS teacher_id,
                               un.id AS unit_id
                        FROM schedules s
                        JOIN units un ON s.class_lesson_id = un.id
                        JOIN lessons l ON un.lesson_id = l.id
                        JOIN users u ON un.teacher_id = u.id
                        WHERE un.class_id = ?
                        ORDER BY s.day_of_week ASC, s.time_start ASC
                    ");
                    $schedStmt->execute([$cls['id']]);
                }
                $schedules = $schedStmt->fetchAll(PDO::FETCH_ASSOC);

                $dayNames = [1=>'شنبه',2=>'یکشنبه',3=>'دوشنبه',4=>'سه شنبه',5=>'چهارشنبه',6=>'پنجشنبه'];
                $cls['schedule'] = [];
                foreach ($dayNames as $num => $name) { $cls['schedule'][$name] = []; }
                foreach ($schedules as $s) {
                    $dayName = $dayNames[$s['day_of_week']] ?? 'شنبه';
                    $cls['schedule'][$dayName][] = [
                        'id'          => $s['id'],
                        'unit_id'     => $s['unit_id'],
                        'time_start'  => substr($s['time_start'],0,5),
                        'time_end'    => substr($s['time_end'],0,5),
                        'lesson_name' => $s['lesson_name'],
                        'lesson_id'   => $s['lesson_id'],
                        'teacher_id'  => $s['teacher_id'],
                        'teacher'     => $is_teacher ? '' : trim(($s['first_name']??'').' '.($s['last_name']??'')),
                    ];
                }
            }
            unset($cls);

            ob_clean();
            echo json_encode(['success'=>true,'data'=>$classes,'admin'=>$adminInfo,'is_teacher'=>$is_teacher], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'lessons') {
            // ✅ اصلاح شد: حذف l.field که در جدول وجود نداره
            $stmt = $pdo->prepare("
                SELECT l.id, l.name, l.code, f.title AS field
                FROM lessons l
                LEFT JOIN fields f ON l.field_id = f.id
                WHERE l.school_id = ?
                ORDER BY l.name ASC
            ");
            $stmt->execute([$school_id]);
            ob_clean();
            echo json_encode(['success'=>true,'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'teachers') {
            $stmt = $pdo->prepare("
                SELECT id, CONCAT(first_name,' ',last_name) AS name
                FROM users
                WHERE school_id = ? AND role = 'teacher'
                ORDER BY first_name ASC
            ");
            $stmt->execute([$school_id]);
            ob_clean();
            echo json_encode(['success'=>true,'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'fields') {
            $stmt = $pdo->prepare("SELECT id, title FROM fields WHERE school_id = ? ORDER BY title ASC");
            $stmt->execute([$school_id]);
            ob_clean();
            echo json_encode(['success'=>true,'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'grades') {
            $stmt = $pdo->prepare("SELECT id, title FROM grades WHERE school_id = ? ORDER BY title ASC");
            $stmt->execute([$school_id]);
            ob_clean();
            echo json_encode(['success'=>true,'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== POST ====================
if ($method === 'POST') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success'=>false,'message'=>'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $body   = json_decode(file_get_contents('php://input'), true);
        $action = $body['action'] ?? '';

        if ($action === 'add_class') {
            if ($is_teacher) {
                ob_clean(); http_response_code(403);
                echo json_encode(['success'=>false,'message'=>'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $grade_id = (int)($body['grade_id'] ?? 0);
            $field_id = (int)($body['field_id'] ?? 0);
            $code     = trim($body['code'] ?? '');
            if (!$grade_id || !$field_id || !$code) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص است'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO classes (school_id, grade_id, field_id, code) VALUES (?, ?, ?, ?)");
            $stmt->execute([$school_id, $grade_id, $field_id, $code]);
            $newId = $pdo->lastInsertId();
            $stmt2 = $pdo->prepare("
                SELECT c.id, c.code, g.title AS grade, f.title AS field,
                       g.id AS grade_id, f.id AS field_id, 0 AS student_count
                FROM classes c
                LEFT JOIN grades g ON c.grade_id = g.id
                LEFT JOIN fields f ON c.field_id = f.id
                WHERE c.id = ?
            ");
            $stmt2->execute([$newId]);
            $newClass = $stmt2->fetch(PDO::FETCH_ASSOC);
            $newClass['schedule'] = ['شنبه'=>[],'یکشنبه'=>[],'دوشنبه'=>[],'سه شنبه'=>[],'چهارشنبه'=>[],'پنجشنبه'=>[]];
            ob_clean();
            echo json_encode(['success'=>true,'data'=>$newClass,'message'=>'کلاس با موفقیت اضافه شد'], JSON_UNESCAPED_UNICODE);
        }

        elseif ($action === 'add_schedule') {
            $class_id   = (int)($body['class_id']   ?? 0);
            $lesson_id  = (int)($body['lesson_id']  ?? 0);
            $teacher_id = (int)($body['teacher_id'] ?? 0);
            $day        = (int)($body['day']        ?? 0);
            $time_start = trim($body['time_start']  ?? '');
            $time_end   = trim($body['time_end']    ?? '');

            if (!$class_id || !$lesson_id || !$teacher_id || !$day || !$time_start || !$time_end) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص است'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $uCheck = $pdo->prepare("SELECT id FROM units WHERE class_id=? AND lesson_id=? AND teacher_id=? LIMIT 1");
            $uCheck->execute([$class_id, $lesson_id, $teacher_id]);
            $unit = $uCheck->fetch(PDO::FETCH_ASSOC);
            if ($unit) {
                $unit_id = $unit['id'];
            } else {
                $uStmt = $pdo->prepare("INSERT INTO units (class_id, lesson_id, teacher_id) VALUES (?, ?, ?)");
                $uStmt->execute([$class_id, $lesson_id, $teacher_id]);
                $unit_id = $pdo->lastInsertId();
            }

            $sStmt = $pdo->prepare("INSERT INTO schedules (class_lesson_id, day_of_week, time_start, time_end) VALUES (?, ?, ?, ?)");
            $sStmt->execute([$unit_id, $day, $time_start, $time_end]);
            ob_clean();
            echo json_encode(['success'=>true,'schedule_id'=>$pdo->lastInsertId(),'unit_id'=>$unit_id,'message'=>'درس اضافه شد'], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== PUT ====================
if ($method === 'PUT') {
    try {
        $body   = json_decode(file_get_contents('php://input'), true);
        $action = $body['action'] ?? '';

        if ($action === 'update_schedule') {
            $sched_id   = (int)($body['schedule_id'] ?? 0);
            $time_start = trim($body['time_start']   ?? '');
            $time_end   = trim($body['time_end']     ?? '');
            if (!$sched_id || !$time_start || !$time_end) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص است'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $pdo->prepare("UPDATE schedules SET time_start=?, time_end=? WHERE id=?")->execute([$time_start, $time_end, $sched_id]);
            ob_clean();
            echo json_encode(['success'=>true,'message'=>'زمان به‌روزرسانی شد'], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== DELETE ====================
if ($method === 'DELETE') {
    try {
        $body   = json_decode(file_get_contents('php://input'), true);
        $action = $body['action'] ?? '';
        
        
        
        

if ($action === 'delete_class') {
    if ($is_teacher) {
        ob_clean(); http_response_code(403);
        echo json_encode(['success'=>false,'message'=>'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $class_id = (int)($body['class_id'] ?? 0);
    if (!$class_id) {
        ob_clean(); http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'شناسه کلاس الزامی است'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $chk = $pdo->prepare("SELECT id FROM classes WHERE id=? AND school_id=?");
    $chk->execute([$class_id, $school_id]);
    if (!$chk->fetch()) {
        ob_clean(); http_response_code(403);
        echo json_encode(['success'=>false,'message'=>'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    // آرشیو کردن به جای حذف
    $pdo->prepare("
        UPDATE classes SET is_archived=1, archived_at=NOW(), archived_reason='آرشیو توسط مدیر'
        WHERE id=? AND school_id=?
    ")->execute([$class_id, $school_id]);
    ob_clean();
    echo json_encode(['success'=>true,'message'=>'کلاس با موفقیت آرشیو شد'], JSON_UNESCAPED_UNICODE);
}
        
        
        
        
        
        
        
        
        

        elseif ($action === 'delete_schedule') {
            $sched_id = (int)($body['schedule_id'] ?? 0);
            if (!$sched_id) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'شناسه برنامه الزامی است'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $pdo->prepare("DELETE FROM schedules WHERE id=?")->execute([$sched_id]);
            ob_clean();
            echo json_encode(['success'=>true,'message'=>'درس از برنامه حذف شد'], JSON_UNESCAPED_UNICODE);
        }

        else {
            ob_clean(); http_response_code(400);
            echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);
        }

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// متد نامعتبر
ob_clean(); http_response_code(405);
echo json_encode(['success'=>false,'message'=>'متد مجاز نیست'], JSON_UNESCAPED_UNICODE);