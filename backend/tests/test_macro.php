<?php
declare(strict_types=1);

require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Services/HealthService.php';

App\Config::load(__DIR__ . '/../.env');
$pdo = App\Database::connect();
$stmt = $pdo->query('SELECT COUNT(*) FROM ingresos');
$count = (int) $stmt->fetchColumn();
if ($count < 1) {
    fwrite(STDERR, "No ingresos found\n");
    exit(1);
}
echo "Macro data test passed: $count ingresos\n";
