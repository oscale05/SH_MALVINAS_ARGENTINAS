<?php
declare(strict_types=1);

namespace App\Services;

final class SummaryService
{
    public static function summary(\PDO $pdo): array
    {
        $uploads = (int) $pdo->query('SELECT COUNT(*) FROM uploads')->fetchColumn();
        $users = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $ingresos = (int) $pdo->query('SELECT COUNT(*) FROM ingresos')->fetchColumn();
        return ['uploads' => $uploads, 'users' => $users, 'ingresos' => $ingresos];
    }
}
