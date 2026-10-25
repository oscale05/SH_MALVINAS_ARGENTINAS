<?php
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Services/CompleteService.php';

App\Config::load(__DIR__ . '/../.env');
$pdo = App\Database::connect();
$data = App\Services\CompleteService::summary($pdo);
if (!isset($data['rows'], $data['total'], $data['origenes'])) {
    fwrite(STDERR, "Completo invalid response\n");
    exit(1);
}
echo "Completo test passed\n";
