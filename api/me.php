 <?php
require_once __DIR__ . '/../includes/auth.php';

// Every page calls this on load to learn who is signed in (and redirects if not)
$u = require_role(['admin', 'staff', 'dean']);
$u['redirect'] = home_for($u['role']);
json_out(['success' => true, 'message' => '', 'data' => $u]); 