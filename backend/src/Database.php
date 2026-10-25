<?php
declare(strict_types=1);

namespace App;

final class Database
{
    private static ?\PDO $pdo = null;

    public static function connect(): \PDO
    {
        if (self::$pdo instanceof \PDO) {
            return self::$pdo;
        }
        $host = Config::get('DB_HOST', '127.0.0.1');
        $port = Config::get('DB_PORT', '3306');
        $name = Config::get('DB_DATABASE', 'hacienda');
        $user = Config::get('DB_USERNAME', 'root');
        $pass = Config::get('DB_PASSWORD', '');
        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
        self::$pdo = new \PDO($dsn, $user, $pass, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
        return self::$pdo;
    }
}
