<?php
declare(strict_types=1);

namespace App\Parsers;

final class CsvParser implements DataSourceParser
{
    public function parse(string $filePath): array
    {
        $rows = [];
        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            return $rows;
        }
        $headers = fgetcsv($handle, 0, ',', '"', '\\') ?: [];
        while (($data = fgetcsv($handle, 0, ',', '"', '\\')) !== false) {
            $row = [];
            foreach ($headers as $i => $header) {
                $row[(string) $header] = $data[$i] ?? null;
            }
            $rows[] = $row;
        }
        fclose($handle);
        return $rows;
    }
}
