<?php
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

function json_out(array $payload, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode($payload);
    exit;
}

function home_for(string $role): string
{
    return [
        'admin' => 'accounts.html',
        'staff' => 'students.html',
        'dean'  => 'dashboard.html'
    ][$role] ?? 'login.html';
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}

function require_role(array $roles): array
{
    $u = current_user();

    if (!$u) {
        json_out([
            'success' => false,
            'message' => 'Please sign in.'
        ], 401);
    }

    if (!in_array($u['role'], $roles, true)) {
        json_out([
            'success' => false,
            'message' => 'You do not have access to this.'
        ], 403);
    }

    return $u;
}
