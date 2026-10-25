<?php
declare(strict_types=1);

namespace App\Parsers;

final class XlsxParser implements DataSourceParser
{
    public function parse(string $filePath): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        $sharedStrings = [];
        $sharedXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedXml !== false) {
            $xml = simplexml_load_string($sharedXml);
            if ($xml !== false) {
                foreach ($xml->si as $si) {
                    $text = '';
                    if (isset($si->t)) {
                        $text = (string) $si->t;
                    } else {
                        foreach ($si->r as $r) {
                            $text .= (string) $r->t;
                        }
                    }
                    $sharedStrings[] = $text;
                }
            }
        }

        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        $sheetTarget = 'xl/worksheets/sheet1.xml';
        if ($workbookXml !== false && $relsXml !== false) {
            $workbook = simplexml_load_string($workbookXml);
            $rels = simplexml_load_string($relsXml);
            $rid = null;
            if ($workbook !== false) {
                foreach ($workbook->sheets->sheet as $sheet) {
                    if ((string) $sheet['name'] === 'BBDD') {
                        $rid = (string) $sheet['id'];
                        break;
                    }
                }
            }
            if ($rid !== null && $rels !== false) {
                foreach ($rels->Relationship as $rel) {
                    if ((string) $rel['Id'] === $rid) {
                        $target = (string) $rel['Target'];
                        $sheetTarget = str_starts_with($target, '/') ? ltrim($target, '/') : 'xl/' . ltrim($target, '/');
                        break;
                    }
                }
            }
        }

        $sheetXml = $zip->getFromName($sheetTarget);
        $zip->close();
        if ($sheetXml === false) {
            return [];
        }

        $sheet = simplexml_load_string($sheetXml);
        if ($sheet === false) {
            return [];
        }

        $rows = [];
        foreach ($sheet->sheetData->row as $row) {
            $cells = [];
            foreach ($row->c as $c) {
                $ref = (string) $c['r'];
                $col = preg_replace('/\d+/', '', $ref);
                $type = (string) $c['t'];
                $value = '';
                if ($type === 's') {
                    $idx = (int) $c->v;
                    $value = $sharedStrings[$idx] ?? '';
                } elseif ($type === 'inlineStr') {
                    $value = (string) $c->is->t;
                } else {
                    $value = (string) $c->v;
                }
                $cells[$col] = $value;
            }
            $rows[] = $cells;
        }

        if ($rows === []) {
            return [];
        }

        $headers = array_shift($rows);
        $normalizedHeaders = [];
        foreach ($headers as $col => $header) {
            $normalizedHeaders[$col] = trim((string) $header);
        }

        $result = [];
        foreach ($rows as $cells) {
            $row = [];
            foreach ($normalizedHeaders as $col => $header) {
                if ($header === '') {
                    continue;
                }
                $row[$header] = $cells[$col] ?? null;
            }
            $result[] = $row;
        }
        return $result;
    }
}
