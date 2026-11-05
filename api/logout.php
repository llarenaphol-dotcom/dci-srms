<?php
require_once __DIR__ . '/../includes/auth.php';

$_SESSION = [];
session_destroy();
json_out(['success' => true, 'message' => 'Signed out.']);