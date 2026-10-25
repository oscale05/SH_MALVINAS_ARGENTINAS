<?php
declare(strict_types=1);

$baseUrl = 'http://127.0.0.1:8099';
$passed = 0;
$failed = 0;

function req(string $method, string $url, ?array $headers = null, $body = null): array {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($headers) curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, $res];
}

// Health
[$code, $res] = req('GET', "$baseUrl/health");
if ($code === 200) { echo "PASS health\n"; $passed++; } else { echo "FAIL health: $code\n"; $failed++; }

// Version
[$code, $res] = req('GET', "$baseUrl/version");
if ($code === 200) { echo "PASS version\n"; $passed++; } else { echo "FAIL version: $code\n"; $failed++; }

// Health full
[$code, $res] = req('GET', "$baseUrl/health/full");
if ($code === 200) { echo "PASS health/full\n"; $passed++; } else { echo "FAIL health/full: $code\n"; $failed++; }

// Login valid
[$code, $res] = req('POST', "$baseUrl/auth/login", ['Content-Type: application/json'], json_encode(['username' => 'operador', 'password' => 'operador123']));
if ($code === 200) { echo "PASS login valid\n"; $passed++; } else { echo "FAIL login valid: $code\n"; $failed++; }
$token = json_decode($res, true)['token'] ?? '';

// Login invalid
[$code, $res] = req('POST', "$baseUrl/auth/login", ['Content-Type: application/json'], json_encode(['username' => 'operador', 'password' => 'wrong']));
if ($code === 401) { echo "PASS login invalid\n"; $passed++; } else { echo "FAIL login invalid: $code\n"; $failed++; }

// Users (operador)
[$code, $res] = req('GET', "$baseUrl/users", ["Authorization: Bearer $token"]);
if ($code === 200) { echo "PASS users\n"; $passed++; } else { echo "FAIL users: $code\n"; $failed++; }

// Users (observador -> 403)
$obToken = json_decode(req('POST', "$baseUrl/auth/login", ['Content-Type: application/json'], json_encode(['username' => 'observador', 'password' => 'observador123']))[1], true)['token'] ?? '';
[$code, $res] = req('GET', "$baseUrl/users", ["Authorization: Bearer $obToken"]);
if ($code === 403) { echo "PASS users forbidden\n"; $passed++; } else { echo "FAIL users forbidden: $code\n"; $failed++; }

// Uploads list
[$code, $res] = req('GET', "$baseUrl/uploads");
if ($code === 200) { echo "PASS uploads list\n"; $passed++; } else { echo "FAIL uploads list: $code\n"; $failed++; }

// Dashboard endpoints
foreach (['macro', 'eje', 'secretaria', 'resumen', 'completo', 'summary'] as $ep) {
    [$code, $res] = req('GET', "$baseUrl/dashboard/$ep");
    if ($code === 200) { echo "PASS dashboard/$ep\n"; $passed++; } else { echo "FAIL dashboard/$ep: $code\n"; $failed++; }
}

// Concurrentes
[$code, $res] = req('GET', "$baseUrl/dashboard/concurrentes");
if ($code === 200) { echo "PASS dashboard/concurrentes\n"; $passed++; } else { echo "FAIL dashboard/concurrentes: $code\n"; $failed++; }

// Ampliaciones
[$code, $res] = req('GET', "$baseUrl/dashboard/ampliaciones");
if ($code === 200) { echo "PASS dashboard/ampliaciones\n"; $passed++; } else { echo "FAIL dashboard/ampliaciones: $code\n"; $failed++; }

// Conceptos list
[$code, $res] = req('GET', "$baseUrl/dashboard/conceptos");
if ($code === 200) { echo "PASS dashboard/conceptos\n"; $passed++; } else { echo "FAIL dashboard/conceptos: $code\n"; $failed++; }

// Concepto
[$code, $res] = req('GET', "$baseUrl/dashboard/concepto?codigo=1.1.4.01");
if ($code === 200) { echo "PASS concepto\n"; $passed++; } else { echo "FAIL concepto: $code\n"; $failed++; }

// Export CSV
[$code, $res] = req('GET', "$baseUrl/export/csv");
if ($code === 200) { echo "PASS export/csv\n"; $passed++; } else { echo "FAIL export/csv: $code\n"; $failed++; }

// Upload invalid format
$tmpFile = '/tmp/invalid_test.csv';
file_put_contents($tmpFile, "foo,bar\n1,2\n");
$ch = curl_init("$baseUrl/uploads");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
$cfile = new CURLFile($tmpFile, 'text/csv', 'invalid.csv');
curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => $cfile]);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($code === 422) { echo "PASS upload invalid\n"; $passed++; } else { echo "FAIL upload invalid: $code\n"; $failed++; }

echo "\nResults: $passed passed, $failed failed\n";
exit($failed > 0 ? 1 : 0);
