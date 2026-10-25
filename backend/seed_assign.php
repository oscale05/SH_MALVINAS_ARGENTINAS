<?php
declare(strict_types=1);

require __DIR__ . '/src/Config.php';
require __DIR__ . '/src/Database.php';
App\Config::load(__DIR__ . '/.env');
$pdo = App\Database::connect();

// Get all catalog IDs
$secIds = $pdo->query('SELECT id FROM secretarias')->fetchAll(PDO::FETCH_COLUMN);
$subsecIds = $pdo->query('SELECT id FROM subsecretarias')->fetchAll(PDO::FETCH_COLUMN);
$dgIds = $pdo->query('SELECT id FROM direcciones_generales')->fetchAll(PDO::FETCH_COLUMN);
$dirIds = $pdo->query('SELECT id FROM direcciones')->fetchAll(PDO::FETCH_COLUMN);
$concurrenteIds = $pdo->query('SELECT id FROM concurrentes')->fetchAll(PDO::FETCH_COLUMN);
$origenIds = $pdo->query('SELECT id FROM origenes')->fetchAll(PDO::FETCH_COLUMN);
$ejeIds = $pdo->query('SELECT id FROM ejes')->fetchAll(PDO::FETCH_COLUMN);

// Assign random hierarchy to ingresos
$stmt = $pdo->query('SELECT id FROM ingresos');
$ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
$update = $pdo->prepare('UPDATE ingresos SET secretaria_id=?, subsecretaria_id=?, direccion_general_id=?, direccion_id=?, concurrente_id=?, origen_id=?, eje_id=? WHERE id=?');

foreach ($ids as $id) {
    $update->execute([
        $secIds[array_rand($secIds)],
        $subsecIds[array_rand($subsecIds)],
        $dgIds[array_rand($dgIds)],
        $dirIds[array_rand($dirIds)],
        $concurrenteIds[array_rand($concurrenteIds)],
        $origenIds[array_rand($origenIds)],
        $ejeIds[array_rand($ejeIds)],
        $id,
    ]);
}

echo "Assigned hierarchy to " . count($ids) . " ingresos\n";

// Add some ampliaciones
$uploads = $pdo->query('SELECT id FROM uploads LIMIT 1')->fetchColumn();
if ($uploads) {
    $pdo->prepare("INSERT INTO ampliaciones (upload_id, codigo, concepto, tipo, valor) VALUES (?, ?, ?, ?, ?)")
        ->execute([$uploads, '1.1.4.01', 'Ampliación coparticipación provincial', 'AMPLIACION', 5000000000]);
    $pdo->prepare("INSERT INTO ampliaciones (upload_id, codigo, concepto, tipo, valor) VALUES (?, ?, ?, ?, ?)")
        ->execute([$uploads, '1.2.1.05.01', 'Nueva partida seguridad e higiene', 'PARTIDA_NUEVA', 2000000000]);
    echo "Added 2 ampliaciones\n";
}
