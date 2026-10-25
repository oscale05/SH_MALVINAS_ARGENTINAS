<?php
declare(strict_types=1);

require __DIR__ . '/src/Config.php';
require __DIR__ . '/src/Database.php';
App\Config::load(__DIR__ . '/.env');
$pdo = App\Database::connect();

// Secretarias
$secretarias = [
    'SECRETARIA DE ECONOMIA Y HACIENDA',
    'SECRETARIA DE GOBIERNO',
    'SECRETARIA DE OBRAS PUBLICAS',
    'SECRETARIA DE SALUD',
    'SECRETARIA DE EDUCACION',
];
$secIds = [];
foreach ($secretarias as $s) {
    $pdo->prepare('INSERT INTO secretarias (nombre) VALUES (?)')->execute([$s]);
    $secIds[$s] = (int)$pdo->lastInsertId();
}

// Subsecretarias
$subsecs = [
    'SECRETARIA DE ECONOMIA Y HACIENDA' => ['SUBSECRETARIA DE HACIENDA', 'SUBSECRETARIA DE INGRESOS PUBLICOS'],
    'SECRETARIA DE GOBIERNO' => ['SUBSECRETARIA DE GOBIERNO', 'SUBSECRETARIA DE LEGAL Y TECNICA'],
    'SECRETARIA DE OBRAS PUBLICAS' => ['SUBSECRETARIA DE OBRAS', 'SUBSECRETARIA DE SERVICIOS URBANOS'],
];
$subsecIds = [];
foreach ($subsecs as $sec => $subs) {
    foreach ($subs as $sub) {
        $pdo->prepare('INSERT INTO subsecretarias (secretaria_id, nombre) VALUES (?, ?)')->execute([$secIds[$sec], $sub]);
        $subsecIds[$sub] = (int)$pdo->lastInsertId();
    }
}

// Direcciones generales
$dirsGen = [
    'SUBSECRETARIA DE HACIENDA' => ['DIRECCION GENERAL DE HACIENDA', 'DIRECCION GENERAL DE CONTABILIDAD'],
    'SUBSECRETARIA DE INGRESOS PUBLICOS' => ['DIRECCION GENERAL DE RECAUDACION', 'DIRECCION GENERAL DE TRIBUTOS'],
];
$dgIds = [];
foreach ($dirsGen as $sub => $dgs) {
    foreach ($dgs as $dg) {
        $pdo->prepare('INSERT INTO direcciones_generales (subsecretaria_id, nombre) VALUES (?, ?)')->execute([$subsecIds[$sub], $dg]);
        $dgIds[$dg] = (int)$pdo->lastInsertId();
    }
}

// Direcciones
$dirs = [
    'DIRECCION GENERAL DE RECAUDACION' => ['DIRECCION DE COBRANZAS', 'DIRECCION DE FISCALIZACION'],
    'DIRECCION GENERAL DE TRIBUTOS' => ['DIRECCION DE TASAS', 'DIRECCION DE DERECHOS'],
];
$dirIds = [];
foreach ($dirs as $dg => $ds) {
    foreach ($ds as $d) {
        $pdo->prepare('INSERT INTO direcciones (direccion_general_id, nombre) VALUES (?, ?)')->execute([$dgIds[$dg], $d]);
        $dirIds[$d] = (int)$pdo->lastInsertId();
    }
}

// Concurrentes
$concurrentes = ['CONCURRENTES', 'NO CONCURRENTES'];
foreach ($concurrentes as $c) {
    $pdo->prepare('INSERT INTO concurrentes (nombre) VALUES (?)')->execute([$c]);
}

echo "Mock hierarchy data seeded successfully\n";
echo "Secretarias: " . count($secIds) . "\n";
echo "Subsecretarias: " . count($subsecIds) . "\n";
echo "Direcciones generales: " . count($dgIds) . "\n";
echo "Direcciones: " . count($dirIds) . "\n";
