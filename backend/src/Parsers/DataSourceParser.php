<?php
declare(strict_types=1);

namespace App\Parsers;

interface DataSourceParser
{
    /** @return array<int,array<string,mixed>> */
    public function parse(string $filePath): array;
}
