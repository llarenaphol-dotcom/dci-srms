<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$in = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';

if ($username === '' || $password === '') {
    json_out(['success' => false, 'message' => 'Enter your username and password.'], 422);
}

$stmt = $pdo->prepare('SELECT user_id, username, password_hash, full_name, role FROM users WHERE username = ?');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_out(['success' => false, 'message' => 'Wrong username or password. Check both and try again.'], 401);
}

session_regenerate_id(true);
$_SESSION['user'] = [
    'user_id'   => (int) $user['user_id'],
    'username'  => $user['username'],
    'full_name' => $user['full_name'],
    'role'      => $user['role'],
];

json_out(['success' => true, 'message' => '', 'data' => [
    'full_name' => $user['full_name'],
    'role'      => $user['role'],
    'redirect'  => home_for($user['role']),
]]);