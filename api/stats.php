<?php
// Dean dashboard numbers. Counts only; the browser draws the charts.
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/db.php';
require_role(['dean']);

$one  = fn($sql) => (int)$pdo->query($sql)->fetchColumn();
$rows = fn($sql) => $pdo->query($sql)->fetchAll(PDO::FETCH_NUM); // [[label, count], ...]

json_out(['success' => true, 'message' => '', 'data' => [
    'total'      => $one("SELECT COUNT(*) FROM students"),
    'first_year' => $one("SELECT COUNT(*) FROM students WHERE year_level = 1"),
    'irregular'  => $one("SELECT COUNT(*) FROM students WHERE standing = 'Irregular'"),
    'pending'    => $one("SELECT COUNT(*) FROM forms WHERE status = 'Pending'"),
    'year'       => $rows("SELECT year_level, standing, COUNT(*) FROM students GROUP BY year_level, standing"), // [year, standing, n]
    'status'     => $rows("SELECT status, COUNT(*) FROM students GROUP BY status"),
    'program'    => $rows("SELECT p.program_code, COUNT(s.student_id) FROM programs p LEFT JOIN students s ON s.program_id = p.program_id GROUP BY p.program_id, p.program_code"),
    'forms'      => $rows("SELECT form_type, COUNT(*) FROM forms GROUP BY form_type"),
]]);