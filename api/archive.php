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

$guard     = new PermissionGuard('ارشیو');
$guard->autoCheck();
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
$action = $_GET['action'] ?? '';

// ==================== GET ====================
if ($method === 'GET') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success'=>false,'message'=>'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ---------- stats ----------
        if ($action === 'stats') {
            $t = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='teacher' AND is_archived=1");
            $t->execute([$school_id]);
            $a = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='assistant' AND is_archived=1");
            $a->execute([$school_id]);
            $s = $pdo->prepare("SELECT COUNT(*) FROM users WHERE school_id=? AND role='student' AND is_archived=1");
            $s->execute([$school_id]);
            $c = $pdo->prepare("SELECT COUNT(*) FROM classes WHERE school_id=? AND is_archived=1");
            $c->execute([$school_id]);
            $reg = $pdo->prepare("SELECT COUNT(*) FROM registration WHERE (school_id=? OR school_id IS NULL) AND is_archived=1");
            $reg->execute([$school_id]);

            ob_clean();
            echo json_encode([
                'success'       => true,
                'teachers'      => (int)$t->fetchColumn(),
                'assistants'    => (int)$a->fetchColumn(),
                'students'      => (int)$s->fetchColumn(),
                'classes'       => (int)$c->fetchColumn(),
                'registrations' => (int)$reg->fetchColumn(),
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ---------- list ----------
        if ($action === 'list') {
            $type    = $_GET['type']   ?? 'all';
            $search  = trim($_GET['search'] ?? '');
            $page    = max(1, (int)($_GET['page'] ?? 1));
            $perPage = 9;
            $offset  = ($page - 1) * $perPage;
            $items   = [];

            // ---- معلمان ----
            if ($type === 'all' || $type === 'teacher') {
                $sql    = "SELECT id, first_name, last_name, national_code, mobile, photo, archived_at, archived_reason
                           FROM users WHERE school_id=? AND role='teacher' AND is_archived=1";
                $params = [$school_id];
                if ($search !== '') {
                    $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR national_code LIKE ?)";
                    $like = "%$search%";
                    array_push($params, $like, $like, $like);
                }
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $sub = $pdo->prepare("
                        SELECT DISTINCT l.name FROM units u
                        JOIN lessons l ON l.id = u.lesson_id
                        JOIN classes c ON c.id = u.class_id
                        WHERE u.teacher_id=? AND c.school_id=?
                    ");
                    $sub->execute([$row['id'], $school_id]);
                    $gr = $pdo->prepare("
                        SELECT DISTINCT g.title FROM units u
                        JOIN classes c ON c.id = u.class_id
                        JOIN grades  g ON g.id = c.grade_id
                        WHERE u.teacher_id=? AND c.school_id=?
                    ");
                    $gr->execute([$row['id'], $school_id]);
                    $items[] = [
                        'id'          => $row['id'],
                        'type'        => 'teacher',
                        'name'        => trim($row['first_name'].' '.$row['last_name']),
                        'national_id' => $row['national_code'],
                        'mobile'      => $row['mobile'],
                        'photo'       => $row['photo'],
                        'subjects'    => $sub->fetchAll(PDO::FETCH_COLUMN),
                        'grades'      => array_map('strval', $gr->fetchAll(PDO::FETCH_COLUMN)),
                        'archived_at' => $row['archived_at'],
                        'reason'      => $row['archived_reason'] ?? 'نامشخص',
                    ];
                }
            }

            // ---- معاونان ----
            if ($type === 'all' || $type === 'assistant') {
                $sql    = "SELECT id, first_name, last_name, national_code, mobile, photo, archived_at, archived_reason
                           FROM users WHERE school_id=? AND role='assistant' AND is_archived=1";
                $params = [$school_id];
                if ($search !== '') {
                    $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR national_code LIKE ?)";
                    $like = "%$search%";
                    array_push($params, $like, $like, $like);
                }
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $items[] = [
                        'id'          => $row['id'],
                        'type'        => 'assistant',
                        'name'        => trim($row['first_name'].' '.$row['last_name']),
                        'national_id' => $row['national_code'],
                        'mobile'      => $row['mobile'],
                        'photo'       => $row['photo'],
                        'archived_at' => $row['archived_at'],
                        'reason'      => $row['archived_reason'] ?? 'نامشخص',
                    ];
                }
            }

            // ---- دانش‌آموزان ----
            if ($type === 'all' || $type === 'student') {
                $sql    = "SELECT u.id, u.first_name, u.last_name, u.national_code, u.mobile, u.photo,
                                  u.archived_at, u.archived_reason,
                                  g.title AS grade_title, f.title AS field_title
                           FROM users u
                           LEFT JOIN student_classes sc ON sc.student_id = u.id
                           LEFT JOIN classes c ON c.id  = sc.class_id
                           LEFT JOIN grades  g ON g.id  = c.grade_id
                           LEFT JOIN fields  f ON f.id  = c.field_id
                           WHERE u.school_id=? AND u.role='student' AND u.is_archived=1";
                $params = [$school_id];
                if ($search !== '') {
                    $sql .= " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.national_code LIKE ?)";
                    $like = "%$search%";
                    array_push($params, $like, $like, $like);
                }
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $items[] = [
                        'id'          => $row['id'],
                        'type'        => 'student',
                        'name'        => trim($row['first_name'].' '.$row['last_name']),
                        'national_id' => $row['national_code'],
                        'mobile'      => $row['mobile'],
                        'photo'       => $row['photo'],
                        'grade'       => $row['grade_title'] ? strval($row['grade_title']) : '-',
                        'field'       => $row['field_title'] ?? '-',
                        'archived_at' => $row['archived_at'],
                        'reason'      => $row['archived_reason'] ?? 'نامشخص',
                    ];
                }
            }

            // ---- کلاس‌ها ----
            if ($type === 'all' || $type === 'class') {
                $sql    = "SELECT c.id, c.code, c.archived_at, c.archived_reason,
                                  g.title AS grade_title, f.title AS field_title,
                                  COUNT(sc.student_id) AS student_count
                           FROM classes c
                           LEFT JOIN grades g ON g.id = c.grade_id
                           LEFT JOIN fields f ON f.id = c.field_id
                           LEFT JOIN student_classes sc ON sc.class_id = c.id
                           WHERE c.school_id=? AND c.is_archived=1";
                $params = [$school_id];
                if ($search !== '') {
                    $sql .= " AND (c.code LIKE ? OR g.title LIKE ?)";
                    $like = "%$search%";
                    array_push($params, $like, $like);
                }
                $sql .= " GROUP BY c.id, c.code, c.archived_at, c.archived_reason, g.title, f.title";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $stu = $pdo->prepare("
                        SELECT u.id, u.first_name, u.last_name, u.national_code, u.mobile, u.photo
                        FROM student_classes sc
                        JOIN users u ON u.id = sc.student_id
                        WHERE sc.class_id=?
                    ");
                    $stu->execute([$row['id']]);
                    $students = array_map(fn($s) => [
                        'id'          => $s['id'],
                        'name'        => trim($s['first_name'].' '.$s['last_name']),
                        'national_id' => $s['national_code'],
                        'mobile'      => $s['mobile'],
                        'photo'       => $s['photo'],
                    ], $stu->fetchAll(PDO::FETCH_ASSOC));
                    $items[] = [
                        'id'            => $row['id'],
                        'type'          => 'class',
                        'name'          => 'کلاس '.($row['code'] ?? $row['id']),
                        'code'          => $row['code'] ?? '',
                        'grade'         => $row['grade_title'] ? strval($row['grade_title']) : '-',
                        'field'         => $row['field_title'] ?? '-',
                        'student_count' => (int)$row['student_count'],
                        'students'      => $students,
                        'archived_at'   => $row['archived_at'],
                        'reason'        => $row['archived_reason'] ?? 'نامشخص',
                    ];
                }
            }

            // ---- پیش‌ثبت‌نام‌ها ----
            if ($type === 'all' || $type === 'registration') {
                $sql    = "SELECT * FROM registration WHERE (school_id=? OR school_id IS NULL) AND is_archived=1";
                $params = [$school_id];
                if ($search !== '') {
                    $sql .= " AND (first_name LIKE ? OR last_name LIKE ? OR national_code LIKE ?)";
                    $like = "%$search%";
                    array_push($params, $like, $like, $like);
                }
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $gradeDisplay = ['tenth'=>'دهم','eleventh'=>'یازدهم','twelfth'=>'دوازدهم'];
                foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
                    $items[] = [
                        'id'          => $row['id'],
                        'type'        => 'registration',
                        'name'        => trim($row['first_name'].' '.$row['last_name']),
                        'national_id' => $row['national_code'],
                        'mobile'      => $row['mobile1'],
                        'grade'       => $gradeDisplay[$row['grade']] ?? $row['grade'],
                        'status'      => $row['status'],
                        'archived_at' => $row['archived_at'],
                        'reason'      => $row['archived_reason'] ?? 'نامشخص',
                    ];
                }
            }

            $total = count($items);
            $paged = array_slice($items, $offset, $perPage);

            ob_clean();
            echo json_encode([
                'success'     => true,
                'items'       => array_values($paged),
                'total'       => $total,
                'page'        => $page,
                'per_page'    => $perPage,
                'total_pages' => max(1, (int)ceil($total / $perPage)),
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        ob_clean(); http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);

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
        $body   = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $body['action'] ?? $action;

        // ---- آرشیو کردن ----
        if ($action === 'archive') {
            $type   = $body['type']   ?? '';
            $id     = (int)($body['id'] ?? 0);
            $reason = trim($body['reason'] ?? 'آرشیو توسط مدیر');

            if (!$id || !$type) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (in_array($type, ['teacher','assistant','student'])) {
                $stmt = $pdo->prepare("
                    UPDATE users SET is_archived=1, archived_at=NOW(), archived_reason=?
                    WHERE id=? AND school_id=? AND role=? AND is_archived=0
                ");
                $stmt->execute([$reason, $id, $school_id, $type]);
            } elseif ($type === 'class') {
                $stmt = $pdo->prepare("
                    UPDATE classes SET is_archived=1, archived_at=NOW(), archived_reason=?
                    WHERE id=? AND school_id=? AND is_archived=0
                ");
                $stmt->execute([$reason, $id, $school_id]);
            } else {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'نوع نامعتبر'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($stmt->rowCount() === 0) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success'=>false,'message'=>'مورد پیدا نشد یا قبلاً آرشیو شده'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            ob_clean();
            echo json_encode(['success'=>true,'message'=>'با موفقیت آرشیو شد'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ---- بازگردانی ----
        if ($action === 'restore') {
            $type = $body['type'] ?? '';
            $id   = (int)($body['id'] ?? 0);

            if (!$id || !$type) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if (in_array($type, ['teacher','assistant','student'])) {
                $stmt = $pdo->prepare("
                    UPDATE users SET is_archived=0, archived_at=NULL, archived_reason=NULL
                    WHERE id=? AND school_id=? AND is_archived=1
                ");
                $stmt->execute([$id, $school_id]);
            } elseif ($type === 'class') {
                $stmt = $pdo->prepare("
                    UPDATE classes SET is_archived=0, archived_at=NULL, archived_reason=NULL
                    WHERE id=? AND school_id=? AND is_archived=1
                ");
                $stmt->execute([$id, $school_id]);
            } elseif ($type === 'registration') {
                $stmt = $pdo->prepare("
                    UPDATE registration SET is_archived=0, archived_at=NULL, archived_reason=NULL
                    WHERE id=? AND (school_id=? OR school_id IS NULL) AND is_archived=1
                ");
                $stmt->execute([$id, $school_id]);
            } else {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'نوع نامعتبر'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($stmt->rowCount() === 0) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success'=>false,'message'=>'مورد پیدا نشد'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            ob_clean();
            echo json_encode(['success'=>true,'message'=>'با موفقیت بازگردانی شد'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // ---- حذف دائمی ----
        if ($action === 'delete') {
            $type = $body['type'] ?? '';
            $id   = (int)($body['id'] ?? 0);

            if (!$id || !$type) {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'اطلاعات ناقص'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($type === 'teacher') {
                $pdo->prepare("DELETE FROM units WHERE teacher_id=?")->execute([$id]);
                $stmt = $pdo->prepare("DELETE FROM users WHERE id=? AND school_id=? AND is_archived=1");
                $stmt->execute([$id, $school_id]);

            } elseif ($type === 'assistant') {
                $stmt = $pdo->prepare("DELETE FROM users WHERE id=? AND school_id=? AND is_archived=1");
                $stmt->execute([$id, $school_id]);

            } elseif ($type === 'student') {
                $pdo->prepare("DELETE FROM student_classes WHERE student_id=?")->execute([$id]);
                $pdo->prepare("DELETE FROM scores WHERE student_id=?")->execute([$id]);
                $pdo->prepare("DELETE FROM attendance WHERE student_id=?")->execute([$id]);
                $stmt = $pdo->prepare("DELETE FROM users WHERE id=? AND school_id=? AND is_archived=1");
                $stmt->execute([$id, $school_id]);

            } elseif ($type === 'class') {
                $pdo->prepare("
                    DELETE a FROM attendance a
                    JOIN schedules s ON a.schedule_id = s.id
                    JOIN units u ON s.class_lesson_id = u.id
                    WHERE u.class_id = ?
                ")->execute([$id]);
                $pdo->prepare("
                    DELETE s FROM schedules s
                    JOIN units u ON s.class_lesson_id = u.id
                    WHERE u.class_id = ?
                ")->execute([$id]);
                $pdo->prepare("DELETE FROM units WHERE class_id=?")->execute([$id]);
                $pdo->prepare("DELETE FROM student_classes WHERE class_id=?")->execute([$id]);
                $pdo->prepare("DELETE FROM exam_events WHERE class_id=?")->execute([$id]);
                $stmt = $pdo->prepare("DELETE FROM classes WHERE id=? AND school_id=? AND is_archived=1");
                $stmt->execute([$id, $school_id]);

            } elseif ($type === 'registration') {
                $stmt = $pdo->prepare("
                    DELETE FROM registration
                    WHERE id=? AND (school_id=? OR school_id IS NULL) AND is_archived=1
                ");
                $stmt->execute([$id, $school_id]);

            } else {
                ob_clean(); http_response_code(400);
                echo json_encode(['success'=>false,'message'=>'نوع نامعتبر'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($stmt->rowCount() === 0) {
                ob_clean(); http_response_code(404);
                echo json_encode(['success'=>false,'message'=>'مورد پیدا نشد یا آرشیو نشده'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            ob_clean();
            echo json_encode(['success'=>true,'message'=>'با موفقیت حذف دائمی شد'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        ob_clean(); http_response_code(400);
        echo json_encode(['success'=>false,'message'=>'action نامعتبر'], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success'=>false,'message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

ob_clean(); http_response_code(405);
echo json_encode(['success'=>false,'message'=>'متد مجاز نیست'], JSON_UNESCAPED_UNICODE);