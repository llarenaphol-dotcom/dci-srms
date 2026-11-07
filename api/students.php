<?php
// GET: staff and dean. POST / PUT / DELETE: staff only.
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
$me = require_role(['staff', 'dean']);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
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
    $sql = "SELECT s.student_id, s.student_no, s.first_name, s.last_name, CONCAT(s.last_name, ', ', s.first_name) AS name,
                   s.email, s.program_id, p.program_code AS program, s.year_level, s.standing, s.status
            FROM students s JOIN programs p ON p.program_id = s.program_id"
         . ($where ? " WHERE " . implode(" AND ", $where) : "")
         . " ORDER BY s.last_name, s.first_name";
    $st = $pdo->prepare($sql);
    $st->execute($args);

    json_out(['success' => true, 'message' => '', 'data' => [
        'students' => $st->fetchAll(),
        // options for the program filter (standing/status options are fixed, see students.html)
        'programs' => $pdo->query("SELECT program_id AS id, program_code AS code FROM programs ORDER BY program_code")->fetchAll(),
    ]]);
}

if ($me['role'] !== 'staff') {
    json_out(['success' => false, 'message' => 'Only staff can change student records.'], 403);
}
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$fail = fn($m) => json_out(['success' => false, 'message' => $m], 422);

// Delete student (their forms and enrollments are deleted with them, see ON DELETE CASCADE)
if ($method === 'DELETE') {
    $pdo->prepare('DELETE FROM students WHERE student_id = ?')->execute([(int) ($_GET['id'] ?? 0)]);
    json_out(['success' => true, 'message' => 'Student deleted.']);
}

// Add or edit student
if ($method === 'POST' || $method === 'PUT') {
    $no    = trim($in['student_no'] ?? '');
    $first = trim($in['first_name'] ?? '');
    $last  = trim($in['last_name'] ?? '');
    $email = trim($in['email'] ?? '');
    $year  = (int) ($in['year_level'] ?? 0);
    $prog  = (int) ($in['program_id'] ?? 0);
    $stand = $in['standing'] ?? '';
    $stat  = $in['status'] ?? '';

    if (!preg_match('/^\d{4}-\d{4}$/', $no))                         $fail('Student no. must look like 2024-0001.');
    if ($first === '' || mb_strlen($first) > 50)                     $fail('Enter the first name.');
    if ($last === '' || mb_strlen($last) > 50)                       $fail('Enter the last name.');
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $fail('Enter a valid email or leave it blank.');
    if ($year < 1 || $year > 4)                                      $fail('Choose a year level.');
    if (!in_array($stand, ['Regular', 'Irregular'], true))           $fail('Choose a standing.');
    if (!in_array($stat, ['Active', 'Transferred', 'Dropped'], true)) $fail('Choose a status.');

    $row = [$no, $first, $last, $email ?: null, $year, $prog, $stand, $stat];
    try {
        if ($method === 'POST') {
            $pdo->prepare('INSERT INTO students (student_no, first_name, last_name, email, year_level, program_id, standing, status)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)')->execute($row);
            json_out(['success' => true, 'message' => 'Student added.'], 201);
        }
        $row[] = (int) ($in['student_id'] ?? 0);
        $pdo->prepare('UPDATE students SET student_no = ?, first_name = ?, last_name = ?, email = ?, year_level = ?,
                       program_id = ?, standing = ?, status = ? WHERE student_id = ?')->execute($row);
        json_out(['success' => true, 'message' => 'Student updated.']);
    } catch (PDOException $e) {
        if ($e->errorInfo[1] === 1062) $fail('That student no. already exists.');
        if ($e->errorInfo[1] === 1452) $fail('Choose a program.');
        throw $e;
    }
}

json_out(['success' => false, 'message' => 'Method not allowed.'], 405);
