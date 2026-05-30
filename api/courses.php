<?php
ob_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/permission_guard.php';
setHeaders();

$guard     = new PermissionGuard('مدیریت دروس');
$guard->autoCheck();
$pdo       = getDB();
$school_id = $guard->schoolId();
$method    = $_SERVER['REQUEST_METHOD'];

// ==================== helpers ====================
function getAdminInfo($pdo) {
    $roleMap = [
        'owner'     => 'مالک',
        'manager'   => 'مدیر',
        'teacher'   => 'معلم',
        'assistant' => 'معاون',
        'parent'    => 'ولی',
        'student'   => 'دانش‌آموز',
    ];
    $uid = $_SESSION['user_id'] ?? $_SESSION['user']['id'] ?? $_SESSION['id'] ?? $_SESSION['userId'] ?? null;
    $user = null;
    if ($uid) {
        $s = $pdo->prepare("SELECT first_name, last_name, role FROM users WHERE id = ? LIMIT 1");
        $s->execute([$uid]);
        $user = $s->fetch(PDO::FETCH_ASSOC);
    }
    if (!$user && !empty($_SESSION['username'])) {
        $s = $pdo->prepare("SELECT first_name, last_name, role FROM users WHERE username = ? LIMIT 1");
        $s->execute([$_SESSION['username']]);
        $user = $s->fetch(PDO::FETCH_ASSOC);
    }
    if (!$user) {
        if ($school_id) {
            $s = $pdo->prepare("SELECT first_name, last_name, role FROM users WHERE school_id = ? AND role IN ('owner','manager') ORDER BY id ASC LIMIT 1");
            $s->execute([$school_id]);
            $user = $s->fetch(PDO::FETCH_ASSOC);
        }
    }
    if (!$user) return ['name' => '', 'role' => ''];
    return [
        'name' => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
        'role' => $roleMap[$user['role']] ?? ($user['role'] ?? ''),
    ];
}

function deleteFileFromServer($filePath) {
    if (!$filePath) return;
    if (strpos($filePath, 'data:') === 0) return;
    if (strpos($filePath, 'uploads/') === false) return;
    $cleanPath = ltrim(str_replace('../', '', $filePath), '/');
    $realPath  = __DIR__ . '/../' . $cleanPath;
    if (file_exists($realPath)) @unlink($realPath);
}

// ==================== GET ====================
if ($method === 'GET') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $adminInfo = getAdminInfo($pdo);

        // دروس — فقط از field_id و جدول fields
        $stmt = $pdo->prepare("
            SELECT l.id, l.name, l.code, l.unit, l.field_id,
                   f.title AS field,
                   l.author, l.publisher, l.year, l.evaluation,
                   l.cover_image, l.pdf_file, l.topics, l.description
            FROM lessons l
            LEFT JOIN fields f ON l.field_id = f.id
            WHERE l.school_id = ?
            ORDER BY l.id DESC
        ");
        $stmt->execute([$school_id]);
        $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // رشته‌ها از جدول fields
        $fStmt = $pdo->prepare("SELECT id, title FROM fields WHERE school_id = ? ORDER BY title ASC");
        $fStmt->execute([$school_id]);
        $fields = $fStmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode([
            'success' => true,
            'data'    => $lessons,
            'fields'  => $fields,
            'admin'   => $adminInfo,
        ], JSON_UNESCAPED_UNICODE);

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
        $body        = json_decode(file_get_contents('php://input'), true);
        $name        = trim($body['name']        ?? '');
        $code        = trim($body['code']        ?? '');
        $unit        = (int)($body['unit']       ?? 0);
        $field_id    = (int)($body['field_id']   ?? 0) ?: null;
        $author      = trim($body['author']      ?? '');
        $publisher   = trim($body['publisher']   ?? '');
        $year        = trim($body['year']        ?? '');
        $evaluation  = trim($body['evaluation']  ?? 'امتحان ترم');
        $cover_image = trim($body['cover_image'] ?? '');
        $pdf_file    = trim($body['pdf_file']    ?? '');
        $topics      = trim($body['topics']      ?? '');
        $description = trim($body['description'] ?? '');

        if (!$name || !$unit) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'نام درس و تعداد واحد الزامی است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("
            INSERT INTO lessons
                (school_id, name, code, unit, field_id, author, publisher, year, evaluation, cover_image, pdf_file, topics, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $school_id, $name, $code ?: null, $unit, $field_id,
            $author ?: null, $publisher ?: null, $year ?: null,
            $evaluation, $cover_image ?: null, $pdf_file ?: null,
            $topics ?: null, $description ?: null
        ]);
        $newId = $pdo->lastInsertId();

        $stmt2 = $pdo->prepare("
            SELECT l.id, l.name, l.code, l.unit, l.field_id,
                   f.title AS field,
                   l.author, l.publisher, l.year, l.evaluation,
                   l.cover_image, l.pdf_file, l.topics, l.description
            FROM lessons l
            LEFT JOIN fields f ON l.field_id = f.id
            WHERE l.id = ?
        ");
        $stmt2->execute([$newId]);
        $lesson = $stmt2->fetch(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode(['success' => true, 'data' => $lesson, 'message' => 'درس با موفقیت اضافه شد'], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== PUT ====================
if ($method === 'PUT') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $body        = json_decode(file_get_contents('php://input'), true);
        $id          = (int)($body['id']          ?? 0);
        $name        = trim($body['name']          ?? '');
        $code        = trim($body['code']          ?? '');
        $unit        = (int)($body['unit']         ?? 0);
        $field_id    = (int)($body['field_id']     ?? 0) ?: null;
        $author      = trim($body['author']        ?? '');
        $publisher   = trim($body['publisher']     ?? '');
        $year        = trim($body['year']          ?? '');
        $evaluation  = trim($body['evaluation']    ?? 'امتحان ترم');
        $cover_image = trim($body['cover_image']   ?? '');
        $pdf_file    = trim($body['pdf_file']      ?? '');
        $topics      = trim($body['topics']        ?? '');
        $description = trim($body['description']   ?? '');

        if (!$id || !$name || !$unit) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'اطلاعات ناقص است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $check = $pdo->prepare("SELECT id, cover_image, pdf_file FROM lessons WHERE id = ? AND school_id = ?");
        $check->execute([$id, $school_id]);
        $old = $check->fetch(PDO::FETCH_ASSOC);
        if (!$old) {
            ob_clean(); http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if ($cover_image && $cover_image !== $old['cover_image']) deleteFileFromServer($old['cover_image']);
        if ($pdf_file    && $pdf_file    !== $old['pdf_file'])    deleteFileFromServer($old['pdf_file']);

        $stmt = $pdo->prepare("
            UPDATE lessons
            SET name=?, code=?, unit=?, field_id=?, author=?, publisher=?,
                year=?, evaluation=?, cover_image=?, pdf_file=?, topics=?, description=?
            WHERE id = ? AND school_id = ?
        ");
        $stmt->execute([
            $name, $code ?: null, $unit, $field_id,
            $author ?: null, $publisher ?: null, $year ?: null,
            $evaluation, $cover_image ?: null, $pdf_file ?: null,
            $topics ?: null, $description ?: null,
            $id, $school_id
        ]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'درس با موفقیت به‌روزرسانی شد'], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// ==================== DELETE ====================
if ($method === 'DELETE') {
    try {
        if (!$school_id) {
            ob_clean(); http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'احراز هویت لازم است'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $body = json_decode(file_get_contents('php://input'), true);
        $id   = (int)($body['id'] ?? 0);
        if (!$id) {
            ob_clean(); http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'شناسه درس الزامی است'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $check = $pdo->prepare("SELECT id, cover_image, pdf_file FROM lessons WHERE id = ? AND school_id = ?");
        $check->execute([$id, $school_id]);
        $lesson = $check->fetch(PDO::FETCH_ASSOC);
        if (!$lesson) {
            ob_clean(); http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'دسترسی مجاز نیست'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        deleteFileFromServer($lesson['cover_image']);
        deleteFileFromServer($lesson['pdf_file']);

        $pdo->prepare("DELETE FROM lessons WHERE id = ? AND school_id = ?")->execute([$id, $school_id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'درس با موفقیت حذف شد'], JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        ob_clean(); http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

ob_clean();
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);