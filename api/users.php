<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth.php';

$me = require_role(['admin']);   // only admins can manage accounts
$roles = ['admin', 'staff', 'dean'];
$method = $_SERVER['REQUEST_METHOD'];
$in = json_decode(file_get_contents('php://input'), true) ?? [];

function fail(string $message, int $code = 422): void {
    json_out(['success' => false, 'message' => $message], $code);
}
function ok(string $message, $data = null, int $code = 200): void {
    json_out(['success' => true, 'message' => $message, 'data' => $data], $code);
}

// List accounts
if ($method === 'GET') {
    ok('', $pdo->query('SELECT user_id, username, full_name, role FROM users ORDER BY full_name')->fetchAll());
}

// Add account
if ($method === 'POST') {
    $username = strtolower(trim($in['username'] ?? ''));
    $name     = trim($in['full_name'] ?? '');
    $role     = $in['role'] ?? '';
    $password = $in['password'] ?? '';

    if (!preg_match('/^[a-z0-9._-]{3,50}$/', $username)) fail('Username must be 3 to 50 letters, numbers, dots, dashes or underscores.');
    if ($name === '' || mb_strlen($name) > 100)          fail('Enter the full name.');
    if (!in_array($role, $roles, true))                  fail('Choose a role.');
    if (strlen($password) < 8)                           fail('Password must be at least 8 characters.');

    try {
        $pdo->prepare('INSERT INTO users (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)')
            ->execute([$username, password_hash($password, PASSWORD_DEFAULT), $name, $role]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('That username is already taken.');
        throw $e;
    }
    ok('Account added.', null, 201);
}

// Change role OR reset password
if ($method === 'PUT') {
    $id = (int) ($in['user_id'] ?? 0);

    if (isset($in['role'])) {
        if (!in_array($in['role'], $roles, true)) fail('Choose a valid role.');
        if ($id === $me['user_id'])               fail('You cannot change your own role.');
        $pdo->prepare('UPDATE users SET role = ? WHERE user_id = ?')->execute([$in['role'], $id]);
        ok('Role updated.');
    }
    if (isset($in['password'])) {
        if (strlen($in['password']) < 8) fail('Password must be at least 8 characters.');
        $pdo->prepare('UPDATE users SET password_hash = ? WHERE user_id = ?')
            ->execute([password_hash($in['password'], PASSWORD_DEFAULT), $id]);
        ok('Password reset.');
    }
    fail('Nothing to update.');
}

// Remove account
if ($method === 'DELETE') {
    $id = (int) ($_GET['id'] ?? 0);
    if ($id === $me['user_id']) fail('You cannot remove your own account.');
    $pdo->prepare('DELETE FROM users WHERE user_id = ?')->execute([$id]);
    ok('Account removed.');
}

fail('Method not allowed.', 405);