<?php
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Auth.php';

App\Config::load(__DIR__ . '/../.env');

$token = App\Auth::login('administrador', 'administrador123');
if ($token === null) {
    fwrite(STDERR, "Login failed\n");
    exit(1);
}
$payload = App\Auth::verify($token);
if (!is_array($payload) || ($payload['role'] ?? '') !== 'administrador') {
    fwrite(STDERR, "Token verification failed\n");
    exit(1);
}
echo "Auth test passed\n";
