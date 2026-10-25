<?php
declare(strict_types=1);

require __DIR__ . '/../src/Parsers/DataSourceParser.php';
require __DIR__ . '/../src/Parsers/XlsxParser.php';

$parser = new App\Parsers\XlsxParser();
$rows = $parser->parse('/Users/slm/Proyectos/Comerciales/Sistema Hacienda/MAJOR 30092026(OCTUBRE).xlsx');

if (count($rows) !== 148) {
    fwrite(STDERR, "Expected 148 rows, got " . count($rows) . "\n");
    exit(1);
}
if (!isset($rows[0]['Agrupamiento'], $rows[0]['Imputación'])) {
    fwrite(STDERR, "Missing expected columns\n");
    exit(1);
}
echo "XlsxParser test passed: " . count($rows) . " rows\n";
