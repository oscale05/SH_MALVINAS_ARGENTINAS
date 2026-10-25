<?php
declare(strict_types=1);

namespace App\Services;

final class HealthService
{
    public static function check(): array
    {
        $checks = [];
        try {
            \App\Database::connect();
            $checks['database'] = 'ok';
        } catch (\Throwable $e) {
            $checks['database'] = 'error';
        }
        $checks['storage'] = is_dir(__DIR__ . '/../../storage/uploads') ? 'ok' : 'error';
        $checks['last_upload'] = is_file(__DIR__ . '/../../storage/last_upload.json') ? 'ok' : 'missing';
        $status = in_array('error', $checks, true) ? 'degraded' : 'ok';
        return ['status' => $status, 'checks' => $checks];
    }
}
