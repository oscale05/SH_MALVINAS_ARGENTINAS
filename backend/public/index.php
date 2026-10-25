<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/../src/Router.php';
require __DIR__ . '/../src/Config.php';
require __DIR__ . '/../src/Database.php';
require __DIR__ . '/../src/Auth.php';
require __DIR__ . '/../src/Services/HealthService.php';
require __DIR__ . '/../src/Services/SummaryService.php';
require __DIR__ . '/../src/Services/CompleteService.php';

App\Config::load(__DIR__ . '/../.env');

$router = new App\Router();
$router->get('/', fn () => (function () {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'service' => 'hacienda-backend'], JSON_THROW_ON_ERROR);
})());
$router->get('/health', fn () => (function () {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'env' => App\Config::get('APP_ENV', 'local')], JSON_THROW_ON_ERROR);
})());
$router->get('/health/db', fn () => (function () {
    header('Content-Type: application/json');
    try {
        App\Database::connect();
        echo json_encode(['status' => 'ok', 'database' => 'connected'], JSON_THROW_ON_ERROR);
    } catch (\Throwable $e) {
        http_response_code(503);
        echo json_encode(['status' => 'error', 'database' => 'disconnected'], JSON_THROW_ON_ERROR);
    }
})());
$router->post('/auth/login', fn () => (function () {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input') ?: '', true);
    $token = App\Auth::login((string) ($input['username'] ?? ''), (string) ($input['password'] ?? ''));
    if ($token === null) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials'], JSON_THROW_ON_ERROR);
        return;
    }
    echo json_encode(['token' => $token], JSON_THROW_ON_ERROR);
})());
$router->post('/uploads', fn () => (function () {
    header('Content-Type: application/json');
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $payload = App\Auth::verify($token);
    if (!is_array($payload) || ($payload['role'] ?? '') !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'Sin permiso'], JSON_THROW_ON_ERROR);
        return;
    }
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Archivo inválido'], JSON_THROW_ON_ERROR);
        return;
    }
    require __DIR__ . '/../src/Parsers/DataSourceParser.php';
    require __DIR__ . '/../src/Parsers/CsvParser.php';
    require __DIR__ . '/../src/Parsers/XlsxParser.php';

    $name = basename((string) $_FILES['file']['name']);
    $target = __DIR__ . '/../storage/uploads/' . uniqid() . '_' . $name;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], $target)) {
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo guardar'], JSON_THROW_ON_ERROR);
        return;
    }

    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    $parser = $ext === 'xlsx' ? new App\Parsers\XlsxParser() : new App\Parsers\CsvParser();
    $rows = $parser->parse($target);
    if ($rows === [] || !isset($rows[0]['Agrupamiento'], $rows[0]['Imputación'], $rows[0]['Total'])) {
        http_response_code(422);
        echo json_encode(['error' => 'Formato inválido: faltan columnas requeridas'], JSON_THROW_ON_ERROR);
        return;
    }
    file_put_contents(__DIR__ . '/../storage/last_upload.json', json_encode($rows, JSON_THROW_ON_ERROR));

    $pdo = App\Database::connect();
    $userStmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $userStmt->execute([(string)($payload['sub'] ?? 'administrador')]);
    $userId = (int) $userStmt->fetchColumn() ?: 1;
    $stmt = $pdo->prepare('INSERT INTO uploads (filename, uploaded_by, status) VALUES (?, ?, ?)');
    $stmt->execute([basename($target), $userId, 'processed']);
    $uploadId = (int) $pdo->lastInsertId();

    foreach ($rows as $row) {
        $originName = trim((string) ($row['ORIGEN'] ?? ''));
        if ($originName === '') {
            $originName = 'FONDOS AFECTADOS';
        }
        $originId = null;
        if ($originName !== '') {
            $find = $pdo->prepare('SELECT id FROM origenes WHERE nombre = ?');
            $find->execute([$originName]);
            $originId = $find->fetchColumn();
            if ($originId === false) {
                $create = $pdo->prepare('INSERT INTO origenes (nombre) VALUES (?)');
                $create->execute([$originName]);
                $originId = (int) $pdo->lastInsertId();
            } else {
                $originId = (int) $originId;
            }
        }
        $ejeName = trim((string) ($row['EJE'] ?? ''));
        $ejeId = null;
        if ($ejeName !== '') {
            $find = $pdo->prepare('SELECT id FROM ejes WHERE nombre = ?');
            $find->execute([$ejeName]);
            $ejeId = $find->fetchColumn();
            if ($ejeId === false) {
                $create = $pdo->prepare('INSERT INTO ejes (nombre) VALUES (?)');
                $create->execute([$ejeName]);
                $ejeId = (int) $pdo->lastInsertId();
            } else {
                $ejeId = (int) $ejeId;
            }
        }
        $secretariaName = trim((string) ($row['SECRETARIAS'] ?? ''));
        $secretariaId = null;
        if ($secretariaName !== '') {
            $find = $pdo->prepare('SELECT id FROM secretarias WHERE nombre = ?');
            $find->execute([$secretariaName]);
            $secretariaId = $find->fetchColumn();
            if ($secretariaId === false) {
                $create = $pdo->prepare('INSERT INTO secretarias (nombre) VALUES (?)');
                $create->execute([$secretariaName]);
                $secretariaId = (int) $pdo->lastInsertId();
            } else {
                $secretariaId = (int) $secretariaId;
            }
        }
        $subsecretariaName = trim((string) ($row['SUBSECRETARIAS'] ?? ''));
        $subsecretariaId = null;
        if ($subsecretariaName !== '') {
            $find = $pdo->prepare('SELECT id FROM subsecretarias WHERE nombre = ?');
            $find->execute([$subsecretariaName]);
            $subsecretariaId = $find->fetchColumn();
            if ($subsecretariaId === false) {
                $create = $pdo->prepare('INSERT INTO subsecretarias (secretaria_id, nombre) VALUES (?, ?)');
                $create->execute([$secretariaId, $subsecretariaName]);
                $subsecretariaId = (int) $pdo->lastInsertId();
            } else {
                $subsecretariaId = (int) $subsecretariaId;
            }
        }
        $direccionName = trim((string) ($row['DIRECCION'] ?? ''));
        $direccionId = null;
        $direccionGeneralId = null;
        $concurrenteName = trim((string) ($row['CONCURRENTES'] ?? ''));
        $concurrenteId = null;
        if ($concurrenteName !== '') {
            $find = $pdo->prepare('SELECT id FROM concurrentes WHERE nombre = ?');
            $find->execute([$concurrenteName]);
            $concurrenteId = $find->fetchColumn();
            if ($concurrenteId === false) {
                $create = $pdo->prepare('INSERT INTO concurrentes (nombre) VALUES (?)');
                $create->execute([$concurrenteName]);
                $concurrenteId = (int) $pdo->lastInsertId();
            } else {
                $concurrenteId = (int) $concurrenteId;
            }
        }
        if ($direccionName !== '') {
            $find = $pdo->prepare('SELECT id, direccion_general_id FROM direcciones WHERE nombre = ?');
            $find->execute([$direccionName]);
            $existing = $find->fetch();
            if ($existing) {
                $direccionId = (int) $existing['id'];
                $direccionGeneralId = $existing['direccion_general_id'] !== null ? (int) $existing['direccion_general_id'] : null;
            } else {
                $dgName = trim((string) ($row['DIRECCIONES GENERALES'] ?? ''));
                if ($dgName !== '') {
                    $findDg = $pdo->prepare('SELECT id FROM direcciones_generales WHERE nombre = ?');
                    $findDg->execute([$dgName]);
                    $dgId = $findDg->fetchColumn();
                    if ($dgId === false) {
                        $createDg = $pdo->prepare('INSERT INTO direcciones_generales (subsecretaria_id, nombre) VALUES (?, ?)');
                        $createDg->execute([$subsecretariaId, $dgName]);
                        $dgId = (int) $pdo->lastInsertId();
                    } else {
                        $dgId = (int) $dgId;
                    }
                    $direccionGeneralId = $dgId;
                }
                $create = $pdo->prepare('INSERT INTO direcciones (direccion_general_id, nombre) VALUES (?, ?)');
                $create->execute([$direccionGeneralId, $direccionName]);
                $direccionId = (int) $pdo->lastInsertId();
            }
        }
        $insert = $pdo->prepare('INSERT INTO ingresos (upload_id, codigo, imputacion, presupuesto, recaudado_fecha_1, recaudado_fecha_2, total, porcentaje_rc, origen_id, eje_id, secretaria_id, subsecretaria_id, direccion_general_id, direccion_id, concurrente_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $insert->execute([
            $uploadId,
            (string) ($row['Agrupamiento'] ?? ''),
            (string) ($row['Imputación'] ?? ''),
            (float) ($row['Calculado'] ?? 0),
            (float) ($row['Recaud. al 31/8'] ?? 0),
            (float) ($row['Recaud. al 30/9'] ?? 0),
            (float) ($row['Total'] ?? 0),
            isset($row['% R/C']) ? (float) $row['% R/C'] : null,
            $originId,
            $ejeId,
            $secretariaId,
            $subsecretariaId,
            $direccionGeneralId,
            $direccionId,
            $concurrenteId,
        ]);
    }

    echo json_encode(['status' => 'ok', 'path' => basename($target), 'rows' => count($rows), 'upload_id' => $uploadId], JSON_THROW_ON_ERROR);
})());

$router->get('/uploads', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $stmt = $pdo->query('SELECT id, filename, uploaded_by, uploaded_at, status FROM uploads ORDER BY id DESC');
    echo json_encode(['uploads' => $stmt->fetchAll()], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/macro', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $uploadId = (int) ($_GET['upload_id'] ?? 0);
    $where = $uploadId > 0 ? ' WHERE upload_id = ' . $uploadId : '';
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count, COALESCE(SUM(total),0) AS total FROM ingresos' . $where);
    $summary = $stmt->fetch();
    $stmt = $pdo->query("SELECT COALESCE(o.nombre, 'SIN ORIGEN') AS origin, SUM(i.total) AS total FROM ingresos i LEFT JOIN origenes o ON o.id = i.origen_id" . $where . " GROUP BY origin");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['origin']] = (float) $row['total'];
    }
    echo json_encode(['rows' => (int) $summary['rows_count'], 'total' => (float) $summary['total'], 'totals_by_origin' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/eje', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $uploadId = (int) ($_GET['upload_id'] ?? 0);
    $where = $uploadId > 0 ? ' WHERE upload_id = ' . $uploadId : '';
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count FROM ingresos' . $where);
    $rows = (int) $stmt->fetchColumn();
    $where = $uploadId > 0 ? ' WHERE i.upload_id = ' . $uploadId : '';
    $stmt = $pdo->query("SELECT COALESCE(e.nombre, 'SIN EJE') AS eje, SUM(i.total) AS total FROM ingresos i LEFT JOIN ejes e ON e.id = i.eje_id" . $where . " GROUP BY eje");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['eje']] = (float) $row['total'];
    }
    echo json_encode(['rows' => $rows, 'totals_by_eje' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/secretaria', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $ejeId = (int) ($_GET['eje_id'] ?? 0);
    $where = $ejeId > 0 ? ' WHERE i.eje_id = ' . $ejeId : '';
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count FROM ingresos' . $where);
    $rows = (int) $stmt->fetchColumn();
    $stmt = $pdo->query("SELECT COALESCE(s.nombre, 'SIN SECRETARIA') AS secretaria, SUM(i.total) AS total FROM ingresos i LEFT JOIN secretarias s ON s.id = i.secretaria_id" . $where . " GROUP BY secretaria");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['secretaria']] = (float) $row['total'];
    }
    echo json_encode(['rows' => $rows, 'totals_by_secretaria' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/resumen', fn () => (function () {
    header('Content-Type: application/json');
    $path = __DIR__ . '/../storage/last_upload.json';
    if (!is_file($path)) {
        http_response_code(404);
        echo json_encode(['error' => 'Sin datos'], JSON_THROW_ON_ERROR);
        return;
    }
    $rows = json_decode(file_get_contents($path), true) ?: [];
    $total = 0.0;
    foreach ($rows as $row) {
        $total += (float) ($row['Total'] ?? 0);
    }
    echo json_encode(['rows' => count($rows), 'total' => $total], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/subsecretaria', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $secretariaId = (int) ($_GET['secretaria_id'] ?? 0);
    $where = $secretariaId > 0 ? ' WHERE i.secretaria_id = ' . $secretariaId : '';
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count FROM ingresos' . $where);
    $rows = (int) $stmt->fetchColumn();
    $stmt = $pdo->query("SELECT COALESCE(s.nombre, 'SIN SUBSECRETARIA') AS subsecretaria, SUM(i.total) AS total FROM ingresos i LEFT JOIN subsecretarias s ON s.id = i.subsecretaria_id" . $where . " GROUP BY subsecretaria");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['subsecretaria']] = (float) $row['total'];
    }
    echo json_encode(['rows' => $rows, 'totals_by_subsecretaria' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/direccion', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $subsecretariaId = (int) ($_GET['subsecretaria_id'] ?? 0);
    $where = $subsecretariaId > 0 ? ' WHERE i.subsecretaria_id = ' . $subsecretariaId : '';
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count FROM ingresos' . $where);
    $rows = (int) $stmt->fetchColumn();
    $stmt = $pdo->query("SELECT COALESCE(d.nombre, 'SIN DIRECCION') AS direccion, SUM(i.total) AS total FROM ingresos i LEFT JOIN direcciones d ON d.id = i.direccion_id" . $where . " GROUP BY direccion");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['direccion']] = (float) $row['total'];
    }
    echo json_encode(['rows' => $rows, 'totals_by_direccion' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/concepto', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $code = $_GET['codigo'] ?? '';
    $stmt = $pdo->prepare('SELECT * FROM ingresos WHERE codigo = ? LIMIT 1');
    $stmt->execute([$code]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'No encontrado'], JSON_THROW_ON_ERROR);
        return;
    }
    echo json_encode($row, JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/completo', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    echo json_encode(App\Services\CompleteService::summary($pdo), JSON_THROW_ON_ERROR);
})());

$router->get('/uploads/rows', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $uploadId = (int) ($_GET['upload_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT COUNT(*) AS rows_count FROM ingresos WHERE upload_id = ?');
    $stmt->execute([$uploadId]);
    $count = (int) $stmt->fetchColumn();
    echo json_encode(['upload_id' => $uploadId, 'rows' => $count], JSON_THROW_ON_ERROR);
})());

$router->get('/health/full', fn () => (function () {
    header('Content-Type: application/json');
    $result = App\Services\HealthService::check();
    $status = $result['status'] === 'ok' ? 200 : 503;
    http_response_code($status);
    echo json_encode($result, JSON_THROW_ON_ERROR);
})());

$router->get('/export/csv', fn () => (function () {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ingresos.csv"');
    $pdo = App\Database::connect();
    $uploadId = (int) ($_GET['upload_id'] ?? 0);
    $where = $uploadId > 0 ? ' WHERE upload_id = ' . $uploadId : '';
    $stmt = $pdo->query('SELECT codigo, imputacion, presupuesto, total FROM ingresos' . $where);
    $out = fopen('php://output', 'w');
    fputcsv($out, ['codigo', 'imputacion', 'presupuesto', 'total'], ',', '"', '\\');
    foreach ($stmt->fetchAll() as $row) {
        fputcsv($out, $row, ',', '"', '\\');
    }
    fclose($out);
})());

$router->get('/users', fn () => (function () {
    header('Content-Type: application/json');
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $payload = App\Auth::verify($token);
    if (!is_array($payload) || ($payload['role'] ?? '') !== 'administrador') {
        http_response_code(403);
        echo json_encode(['error' => 'Sin permiso'], JSON_THROW_ON_ERROR);
        return;
    }
    $pdo = App\Database::connect();
    $stmt = $pdo->query('SELECT id, username, role, created_at FROM users ORDER BY id');
    echo json_encode(['users' => $stmt->fetchAll()], JSON_THROW_ON_ERROR);
})());

$router->get('/version', fn () => (function () {
    header('Content-Type: application/json');
    echo json_encode(['name' => 'hacienda-backend', 'version' => '0.1.0', 'php' => PHP_VERSION], JSON_THROW_ON_ERROR);
})());

$router->post('/auth/change-password', fn () => (function () {
    header('Content-Type: application/json');
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $auth);
    $payload = App\Auth::verify($token);
    if (!is_array($payload)) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado'], JSON_THROW_ON_ERROR);
        return;
    }
    $input = json_decode(file_get_contents('php://input') ?: '', true);
    $newPassword = (string) ($input['password'] ?? '');
    if (strlen($newPassword) < 6) {
        http_response_code(422);
        echo json_encode(['error' => 'Clave muy corta'], JSON_THROW_ON_ERROR);
        return;
    }
    $pdo = App\Database::connect();
    $hash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE username = ?');
    $stmt->execute([$hash, (string) $payload['sub']]);
    echo json_encode(['status' => 'ok'], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/summary', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    echo json_encode(App\Services\SummaryService::summary($pdo), JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/concurrentes', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $stmt = $pdo->query('SELECT COUNT(*) AS rows_count FROM ingresos');
    $rows = (int) $stmt->fetchColumn();
    $stmt = $pdo->query("SELECT COALESCE(c.nombre, 'SIN CONCURRENTES') AS concurrentes, SUM(i.total) AS total FROM ingresos i LEFT JOIN concurrentes c ON c.id = i.concurrente_id GROUP BY concurrentes");
    $totals = [];
    foreach ($stmt->fetchAll() as $row) {
        $totals[$row['concurrentes']] = (float) $row['total'];
    }
    echo json_encode(['rows' => $rows, 'totals_by_concurrentes' => $totals], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/ampliaciones', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $stmt = $pdo->query('SELECT * FROM ampliaciones ORDER BY id DESC');
    echo json_encode(['ampliaciones' => $stmt->fetchAll()], JSON_THROW_ON_ERROR);
})());

$router->get('/dashboard/conceptos', fn () => (function () {
    header('Content-Type: application/json');
    $pdo = App\Database::connect();
    $stmt = $pdo->query('SELECT DISTINCT codigo, imputacion, COALESCE((SELECT nombre FROM origenes WHERE id = ingresos.origen_id), \'SIN ORIGEN\') AS origen FROM ingresos ORDER BY codigo');
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['items' => $items], JSON_THROW_ON_ERROR);
})());

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$router->dispatch($method, $path);
error_log(date('c') . " {$method} {$path}\n", 3, __DIR__ . '/../storage/app.log');
