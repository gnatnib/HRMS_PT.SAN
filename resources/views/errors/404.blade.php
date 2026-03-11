<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — Halaman Tidak Ditemukan</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            color: #1e293b;
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 480px;
        }
        .code {
            font-size: 7rem;
            font-weight: 700;
            color: #e2e8f0;
            line-height: 1;
            margin-bottom: 1rem;
        }
        .title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        .desc {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.625rem 1.25rem;
            font-size: 0.8125rem;
            font-weight: 500;
            font-family: inherit;
            text-decoration: none;
            border-radius: 0.5rem;
            cursor: pointer;
            border: none;
            transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-primary {
            background: #1e293b;
            color: #fff;
        }
        .btn-primary:hover {
            background: #334155;
        }
        .btn-ghost {
            background: #fff;
            color: #475569;
            border: 1px solid #e2e8f0;
        }
        .btn-ghost:hover {
            background: #f1f5f9;
        }
        .footer {
            margin-top: 3rem;
            font-size: 0.6875rem;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="code">404</div>
        <h1 class="title">Halaman Tidak Ditemukan</h1>
        <p class="desc">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <div class="actions">
            <a href="/dashboard" class="btn btn-primary">Kembali ke Dashboard</a>
            <button onclick="history.back()" class="btn btn-ghost">Kembali</button>
        </div>
        <p class="footer">SAN HRMS — PT. Sinergi Asta Nusantara</p>
    </div>
</body>
</html>
