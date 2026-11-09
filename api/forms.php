<?php
// GET: staff and dean. POST / PUT / DELETE: staff only.
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
$me = require_role(['staff', 'dean']);
$method = $_SERVER['REQUEST_METHOD'];
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$fail = fn($m, $code = 422) => json_out(['success' => false, 'message' => $m], $code);

$type = $method === 'GET' ? ($_GET['type'] ?? '') : ($in['type'] ?? '');
if ($method !== 'DELETE' && !in_array($type, ['drop', 'loa', 'scholarship'], true)) $fail('Invalid form type.');

if ($method === 'GET') {
    $st = $pdo->prepare("SELECT f.form_id, s.student_no, CONCAT(s.last_name, ', ', s.first_name) AS name,
                                f.course_id, CONCAT(c.course_code, ' ', c.course_title) AS subject,
                                f.scholarship_id, sc.name AS scholarship, sc.amount,
                                f.academic_year, f.semester, f.details, f.date_filed, f.status
                         FROM forms f
                         JOIN students s ON s.student_id = f.student_id
                         LEFT JOIN courses c ON c.course_id = f.course_id
                         LEFT JOIN scholarships sc ON sc.scholarship_id = f.scholarship_id
                         WHERE f.form_type = ? ORDER BY f.date_filed DESC, f.form_id DESC");
    $st->execute([$type]);
    $data = ['forms' => $st->fetchAll()];

    if ($type === 'drop') { // every course with its drop count (also fills the Subject dropdown)
        $data['subjects'] = $pdo->query(
            "SELECT c.course_id AS id, CONCAT(c.course_code, ' ', c.course_title) AS name, COUNT(f.form_id) AS n
             FROM courses c LEFT JOIN forms f ON f.course_id = c.course_id AND f.form_type = 'drop'
             GROUP BY c.course_id ORDER BY c.course_code")->fetchAll();
    }
    if ($type === 'scholarship') { // fills the Scholarship dropdown
        $data['scholarships'] = $pdo->query('SELECT scholarship_id AS id, name, amount FROM scholarships ORDER BY name')->fetchAll();
    }
    json_out(['success' => true, 'message' => '', 'data' => $data]);
}

if ($me['role'] !== 'staff') $fail('Only staff can change forms.', 403);

if ($method === 'DELETE') {
    $pdo->prepare('DELETE FROM forms WHERE form_id = ?')->execute([(int) ($_GET['id'] ?? 0)]);
    json_out(['success' => true, 'message' => 'Form deleted.']);
}

// Add or edit a form
if ($method === 'POST' || $method === 'PUT') {
    $details  = $type === 'scholarship' ? null : trim($in['details'] ?? '');
    $date     = $in['date_filed'] ?? '';
    $status   = $in['status'] ?? '';
    $course   = $type === 'drop' ? (int) ($in['course_id'] ?? 0) : null;
    $schol    = $type === 'scholarship' ? (int) ($in['scholarship_id'] ?? 0) : null;
    $newSchol = $type === 'scholarship' && ($in['scholarship_id'] ?? '') === 'new'; // staff typed a new one in the dialog
    $newName  = trim($in['new_name'] ?? '');
    $newAmt   = (float) ($in['new_amount'] ?? 0);
    $year     = $type === 'loa' ? trim($in['academic_year'] ?? '') : null;
    $semester = $type === 'loa' ? ($in['semester'] ?? '') : null;

    $st = $pdo->prepare('SELECT student_id FROM students WHERE student_no = ?');
    $st->execute([trim($in['student_no'] ?? '')]);
    $student = $st->fetchColumn();

    if (!$student)                                                $fail('No student has that student no.');
    if ($type === 'drop' && !$course)                             $fail('Choose a subject.');
    if ($newSchol && ($newName === '' || mb_strlen($newName) > 100)) $fail('Enter the new scholarship name.');
    if ($newSchol && $newAmt <= 0)                                $fail('Enter an amount greater than 0.');
    if ($type === 'scholarship' && !$schol && !$newSchol)         $fail('Choose a scholarship.');
    if ($type === 'loa' && (!preg_match('/^(\d{4})-(\d{4})$/', $year, $y) || $y[2] != $y[1] + 1)) $fail('Enter the academic year as 2026-2027.');
    if ($type === 'loa' && !in_array($semester, ['1st Semester', '2nd Semester'], true)) $fail('Choose a semester.');
    if ($details !== null && ($details === '' || mb_strlen($details) > 255)) $fail('Fill in the reason.');
    $d = date_create_from_format('Y-m-d', $date);
    if (!$d || $d->format('Y-m-d') !== $date)                    $fail('Choose a valid date.');
    if (!in_array($status, ['Pending', 'Approved', 'Rejected'], true)) $fail('Choose a status.');

    if ($newSchol) { // created only after everything else is valid, so a failed form leaves no stray scholarship
        try {
            $pdo->prepare('INSERT INTO scholarships (name, amount) VALUES (?, ?)')->execute([$newName, $newAmt]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] === 1062) $fail('That scholarship already exists. Choose it from the list.');
            throw $e;
        }
        $schol = (int) $pdo->lastInsertId();
    }

    if ($method === 'POST') {
        $pdo->prepare('INSERT INTO forms (student_id, form_type, course_id, scholarship_id, academic_year, semester, details, date_filed, status)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
            ->execute([$student, $type, $course, $schol, $year, $semester, $details, $date, $status]);
        json_out(['success' => true, 'message' => 'Form added.'], 201);
    }
    $pdo->prepare('UPDATE forms SET student_id = ?, course_id = ?, scholarship_id = ?, academic_year = ?, semester = ?, details = ?,
                   date_filed = ?, status = ? WHERE form_id = ? AND form_type = ?')
        ->execute([$student, $course, $schol, $year, $semester, $details, $date, $status, (int) ($in['form_id'] ?? 0), $type]);
    json_out(['success' => true, 'message' => 'Form updated.']);
}

$fail('Method not allowed.', 405);
