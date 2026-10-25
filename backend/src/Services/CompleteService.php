<?php
declare(strict_types=1);

namespace App\Services;

final class CompleteService
{
    public static function summary(\PDO $pdo): array
    {
        $stmt = $pdo->query('SELECT COUNT(*) AS rows_count, COALESCE(SUM(total),0) AS total FROM ingresos');
        $summary = $stmt->fetch();
        $agg = static function (\PDO $pdo, string $table, string $fk, string $label): array {
            $stmt = $pdo->query("SELECT COALESCE(t.nombre, 'SIN " . $label . "') AS k, SUM(i.total) AS v FROM ingresos i LEFT JOIN " . $table . " t ON t.id = i." . $fk . " GROUP BY k");
            $out = [];
            foreach ($stmt->fetchAll() as $r) {
                $out[$r['k']] = (float) $r['v'];
            }
            return $out;
        };
        return [
            'rows' => (int) $summary['rows_count'],
            'total' => (float) $summary['total'],
            'origenes' => $agg($pdo, 'origenes', 'origen_id', 'ORIGEN'),
            'ejes' => $agg($pdo, 'ejes', 'eje_id', 'EJE'),
            'secretarias' => $agg($pdo, 'secretarias', 'secretaria_id', 'SECRETARIA'),
            'subsecretarias' => $agg($pdo, 'subsecretarias', 'subsecretaria_id', 'SUBSECRETARIA'),
            'direcciones' => $agg($pdo, 'direcciones', 'direccion_id', 'DIRECCION'),
            'concurrentes' => $agg($pdo, 'concurrentes', 'concurrente_id', 'CONCURRENTES'),
        ];
    }
}
