<?php
session_start();
session_destroy();
setcookie('borbor_auth', '', ['expires' => time()-3600, 'path' => '/', 'httponly' => false, 'samesite' => 'Strict']);
setcookie('borbor_auth_secure', '', ['expires' => time()-3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict']);
setcookie(session_name(), '', ['expires' => time()-3600, 'path' => '/']);
header('Location: /borbor/html/landing.html');
exit;