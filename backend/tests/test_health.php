<?php
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Services/HealthService.php';

App\Config::load(__DIR__ . '/../.env');
$result = App\Services\HealthService::check();
if (($result['status'] ?? '') !== 'ok') {
    fwrite(STDERR, "Health full invalid response\n");
    exit(1);
}
echo "Health full test passed\n";
