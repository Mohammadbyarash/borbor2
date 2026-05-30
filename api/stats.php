<?php
require_once __DIR__ . '/config.php';
setHeaders();

if (session_status() === PHP_SESSION_NONE) session_start();

$pdo = getDB();
$currentUser = ['name' => 'ناشناس', 'role_label' => 'کاربر', 'role' => ''];

try {
    // user_id از session یا کوکی
    $userId = $_SESSION['borbor_user_id']
           ?? $_COOKIE['borbor_user_id']
           ?? null;

    if ($userId) {
        $stmt = $pdo->prepare('SELECT first_name, last_name, role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([(int)$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $roleMap = [
                'owner'     => 'مالک',
                'manager'   => 'مدیر',
                'assistant' => 'معاون',
                'teacher'   => 'معلم',
                'student'   => 'دانش‌آموز',
                'parent'    => 'ولی',
            ];
            $fullName = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
            $currentUser = [
                'name'       => $fullName ?: 'ناشناس',
                'role_label' => $roleMap[$user['role']] ?? $user['role'],
                'role'       => $user['role'],
            ];
        }
    }

    $students      = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='student'")->fetchColumn();
    $teachers      = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE role='teacher'")->fetchColumn();
    $classes       = (int)$pdo->query("SELECT COUNT(*) FROM classes")->fetchColumn();
    $registrations = (int)$pdo->query("SELECT COUNT(*) FROM registration")->fetchColumn();

    try {
        $totalAtt   = (int)$pdo->query("SELECT COUNT(*) FROM attendance")->fetchColumn();
        $presentAtt = (int)$pdo->query("SELECT COUNT(*) FROM attendance WHERE status='present'")->fetchColumn();
        $attendance = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100) . '%' : '0%';
    } catch (PDOException $e) { $attendance = '0%'; }

    try {
        $messages = (int)$pdo->query("SELECT COUNT(*) FROM logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetchColumn();
    } catch (PDOException $e) { $messages = 0; }

    $chartLabels = [];
    $chartData   = [];
    try {
        $rows = $pdo->query("
            SELECT gr.title AS grade_title, ROUND(AVG(sc.score), 1) AS avg_score
            FROM scores sc
            JOIN units   u  ON sc.units_id = u.id
            JOIN classes cl ON u.class_id  = cl.id
            JOIN grades  gr ON cl.grade_id = gr.id
            WHERE sc.score IS NOT NULL
            GROUP BY gr.id, gr.title
            ORDER BY gr.title
        ")->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $chartLabels[] = 'پایه ' . $row['grade_title'];
            $chartData[]   = (float)$row['avg_score'];
        }
    } catch (PDOException $e) {}

    echo json_encode([
        'success'     => true,
        'currentUser' => $currentUser,
        'stats'       => [
            'registrations' => $registrations,
            'teachers'      => $teachers,
            'students'      => $students,
            'classes'       => $classes,
            'attendance'    => $attendance,
            'messages'      => $messages,
        ],
        'chart' => ['labels' => $chartLabels, 'data' => $chartData],
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}