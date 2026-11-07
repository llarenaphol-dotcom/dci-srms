<?php
// GET only for now. Staff create / edit / delete get added here later (staff only).
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
require_role(['staff', 'dean']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$type = $_GET['type'] ?? '';
if (!in_array($type, ['drop', 'loa', 'scholarship'], true)) {
    json_out(['success' => false, 'message' => 'Invalid form type.'], 422);
}

$st = $pdo->prepare("SELECT f.form_id, s.student_no, CONCAT(s.last_name, ', ', s.first_name) AS name,
                            CONCAT(c.course_code, ' ', c.course_title) AS subject,
                            f.details, f.amount, f.date_filed, f.status
                     FROM forms f
                     JOIN students s ON s.student_id = f.student_id
                     LEFT JOIN courses c ON c.course_id = f.course_id
                     WHERE f.form_type = ? ORDER BY f.date_filed DESC, f.form_id DESC");
$st->execute([$type]);
$data = ['forms' => $st->fetchAll()];

if ($type === 'drop') { // every course, including those with 0 drops
    $data['subjects'] = $pdo->query(
        "SELECT CONCAT(c.course_code, ' ', c.course_title), COUNT(f.form_id)
         FROM courses c LEFT JOIN forms f ON f.course_id = c.course_id AND f.form_type = 'drop'
         GROUP BY c.course_id ORDER BY c.course_code")->fetchAll(PDO::FETCH_NUM);
}
json_out(['success' => true, 'message' => '', 'data' => $data]);