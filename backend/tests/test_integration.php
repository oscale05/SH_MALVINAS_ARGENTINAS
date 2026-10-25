<?php
declare(strict_types=1);

$baseUrl = 'http://127.0.0.1:8099';
$passed = 0;
$failed = 0;

function request(string $method, string $url, ?array $headers = null, $body = null): array {
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
[$code, $res] = request('GET', "$baseUrl/health");
if ($code !== 200) { echo "FAIL health: HTTP $code\n"; $failed++; } else { echo "PASS health\n"; $passed++; }

// Login
[$code, $res] = request('POST', "$baseUrl/auth/login", ['Content-Type: application/json'], json_encode(['username' => 'administrador', 'password' => 'administrador123']));
if ($code !== 200) { echo "FAIL login: HTTP $code\n"; $failed++; exit(1); }
$token = json_decode($res, true)['token'] ?? '';
echo "PASS login\n"; $passed++;

// Upload
$filePath = __DIR__ . '/fixtures/major_sample.xlsx';
$cfile = new CURLFile($filePath, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'major.xlsx');
$ch = curl_init("$baseUrl/uploads");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token"]);
curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => $cfile]);
$res = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
if ($code !== 200) { echo "FAIL upload: HTTP $code - $res\n"; $failed++; } else { echo "PASS upload\n"; $passed++; }

// Macro
[$code, $res] = request('GET', "$baseUrl/dashboard/macro");
if ($code !== 200) { echo "FAIL macro: HTTP $code\n"; $failed++; } else { echo "PASS macro\n"; $passed++; }

// Completo
[$code, $res] = request('GET', "$baseUrl/dashboard/completo");
if ($code !== 200) { echo "FAIL completo: HTTP $code\n"; $failed++; } else { echo "PASS completo\n"; $passed++; }

// Summary
[$code, $res] = request('GET', "$baseUrl/dashboard/summary");
if ($code !== 200) { echo "FAIL summary: HTTP $code\n"; $failed++; } else { echo "PASS summary\n"; $passed++; }

// Health full
[$code, $res] = request('GET', "$baseUrl/health/full");
if ($code !== 200) { echo "FAIL health/full: HTTP $code\n"; $failed++; } else { echo "PASS health/full\n"; $passed++; }

echo "\nResults: $passed passed, $failed failed\n";
exit($failed > 0 ? 1 : 0);
