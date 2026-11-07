<?php
// GET only for now. Staff POST/PUT/DELETE get added here later (staff only).
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
require_role(['staff', 'dean']);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$where = [];
$args  = [];
$q = trim($_GET['q'] ?? '');
if ($q !== '') {
    $where[] = "(s.student_no LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)";
    array_push($args, "%$q%", "%$q%", "%$q%");
}
// column => query-string key (column names are fixed here, never from the user)
foreach (['year_level' => 'year', 'standing' => 'standing', 'status' => 'status', 'program_id' => 'program'] as $col => $key) {
    if (($_GET[$key] ?? '') !== '') {
        $where[] = "s.$col = ?";
        $args[]  = $_GET[$key];
    }
}

// shortcut: no pagination, fine for a few hundred students, add LIMIT/OFFSET if it grows
$sql = "SELECT s.student_id, s.student_no, CONCAT(s.last_name, ', ', s.first_name) AS name, s.email,
               p.program_code AS program, s.year_level, s.standing, s.status
        FROM students s JOIN programs p ON p.program_id = s.program_id"
     . ($where ? " WHERE " . implode(" AND ", $where) : "")
     . " ORDER BY s.last_name, s.first_name";
$st = $pdo->prepare($sql);
$st->execute($args);

json_out(['success' => true, 'message' => '', 'data' => [
    'students'  => $st->fetchAll(),
    // options for the program filter (standing/status options are fixed, see students.html)
    'programs'  => $pdo->query("SELECT program_id AS id, program_code AS code FROM programs ORDER BY program_code")->fetchAll(),
]]);