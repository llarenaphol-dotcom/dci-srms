<?php
// GET only for now. Staff POST/PUT/DELETE get added here later (staff only).
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
require_role(['staff', 'dean']);

header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed', 'data' => null]);
    exit;
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

echo json_encode(['success' => true, 'message' => '', 'data' => [
    'students'  => $st->fetchAll(PDO::FETCH_ASSOC),
    // options for the filter bar
    'programs'  => $pdo->query("SELECT program_id AS id, program_code AS code FROM programs ORDER BY program_code")->fetchAll(PDO::FETCH_ASSOC),
    'standings' => $pdo->query("SELECT DISTINCT standing FROM students ORDER BY standing")->fetchAll(PDO::FETCH_COLUMN),
    'statuses'  => $pdo->query("SELECT DISTINCT status FROM students ORDER BY status")->fetchAll(PDO::FETCH_COLUMN),
]]);