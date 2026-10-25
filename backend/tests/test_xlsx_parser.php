<?php
declare(strict_types=1);

require __DIR__ . '/../src/Parsers/DataSourceParser.php';
require __DIR__ . '/../src/Parsers/XlsxParser.php';

$parser = new App\Parsers\XlsxParser();
$rows = $parser->parse(__DIR__ . '/fixtures/major_sample.xlsx');

if (count($rows) !== 2) {
    fwrite(STDERR, "Expected 2 rows, got " . count($rows) . "\n");
    exit(1);
}
if (!isset($rows[0]['Agrupamiento'], $rows[0]['Imputación'])) {
    fwrite(STDERR, "Missing expected columns\n");
    exit(1);
}
echo "XlsxParser test passed: " . count($rows) . " rows\n";
