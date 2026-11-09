<?php
// Subjects (courses). Staff only.
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
require_role(['staff']);
$method = $_SERVER['REQUEST_METHOD'];
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$fail = fn($m, $code = 422) => json_out(['success' => false, 'message' => $m], $code);

if ($method === 'GET') { // n = forms using it, so staff can see why a delete is refused
    $rows = $pdo->query('SELECT c.course_id, c.course_code, c.course_title, c.units, COUNT(f.form_id) AS n
                         FROM courses c LEFT JOIN forms f ON f.course_id = c.course_id
                         GROUP BY c.course_id ORDER BY c.course_code')->fetchAll();
    json_out(['success' => true, 'message' => '', 'data' => $rows]);
}

try {
    if ($method === 'DELETE') {
        $pdo->prepare('DELETE FROM courses WHERE course_id = ?')->execute([(int) ($_GET['id'] ?? 0)]);
        json_out(['success' => true, 'message' => 'Subject deleted.']);
    }

    if ($method === 'POST' || $method === 'PUT') {
        $code  = trim($in['course_code'] ?? '');
        $title = trim($in['course_title'] ?? '');
        $units = (int) ($in['units'] ?? 0);
        if ($code === '' || mb_strlen($code) > 50)    $fail('Enter the subject code.');
        if ($title === '' || mb_strlen($title) > 100) $fail('Enter the subject title.');
        if ($units < 1 || $units > 10)                $fail('Enter units from 1 to 10.');

        if ($method === 'POST') {
            $pdo->prepare('INSERT INTO courses (course_code, course_title, units) VALUES (?, ?, ?)')->execute([$code, $title, $units]);
            json_out(['success' => true, 'message' => 'Subject added.'], 201);
        }
        $pdo->prepare('UPDATE courses SET course_code = ?, course_title = ?, units = ? WHERE course_id = ?')
            ->execute([$code, $title, $units, (int) ($in['course_id'] ?? 0)]);
        json_out(['success' => true, 'message' => 'Subject updated.']);
    }
} catch (PDOException $e) {
    if ($e->errorInfo[1] === 1062) $fail('That subject code already exists.');
    if ($e->errorInfo[1] === 1451) $fail('This subject is still used by forms. Remove those first.');
    throw $e;
}

$fail('Method not allowed.', 405);
