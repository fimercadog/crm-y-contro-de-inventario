<?php

namespace App\Support;

use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Shared CSV/PDF export used by every module's index-style listing so
 * exports always respect whatever filters produced $rows (section 38 of
 * the product spec: never export just the visible page).
 *
 * @param  array<string, string>  $columns  column key => header label
 * @param  iterable<array<string, mixed>>  $rows
 */
class TableExporter
{
    public static function csv(string $filename, array $columns, iterable $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($columns, $rows) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, array_values($columns));

            foreach ($rows as $row) {
                fputcsv($handle, array_map(
                    fn (string $key) => $row[$key] ?? '',
                    array_keys($columns)
                ));
            }

            fclose($handle);
        }, "{$filename}.csv", ['Content-Type' => 'text/csv']);
    }

    public static function pdf(string $filename, string $title, array $columns, iterable $rows)
    {
        $pdf = Pdf::loadView('exports.table', [
            'title' => $title,
            'columns' => $columns,
            'rows' => $rows,
        ])->setPaper('a4', 'landscape');

        return $pdf->download("{$filename}.pdf");
    }
}
