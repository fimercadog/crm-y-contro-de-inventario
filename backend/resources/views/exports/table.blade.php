<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        .meta { color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f3f3f3; }
        tr:nth-child(even) { background: #fafafa; }
    </style>
</head>
<body>
    <h1>{{ $title }}</h1>
    <p class="meta">Generado el {{ now()->format('Y-m-d H:i') }}</p>
    <table>
        <thead>
            <tr>
                @foreach ($columns as $label)
                    <th>{{ $label }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach (array_keys($columns) as $key)
                        <td>{{ $row[$key] ?? '' }}</td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($columns) }}">Sin resultados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
