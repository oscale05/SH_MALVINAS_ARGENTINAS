<?php
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Services/SummaryService.php';

App\Config::load(__DIR__ . '/../.env');
$pdo = App\Database::connect();
$data = App\Services\SummaryService::summary($pdo);
if (!isset($data['uploads'], $data['users'], $data['ingresos'])) {
    fwrite(STDERR, "Summary invalid response\n");
    exit(1);
}
echo "Summary test passed\n";
