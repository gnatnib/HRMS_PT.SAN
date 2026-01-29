<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slip Gaji - {{ $employee['name'] }} - {{ $period['name'] }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .company-address {
            font-size: 10px;
            color: #666;
        }

        .payslip-title {
            text-align: center;
            margin: 20px 0;
        }

        .payslip-title h1 {
            font-size: 16px;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .payslip-title .period {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }

        .employee-info {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 5px;
        }

        .info-row {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            width: 30%;
            font-weight: bold;
            padding: 3px 0;
            color: #374151;
        }

        .info-value {
            display: table-cell;
            padding: 3px 0;
        }

        .salary-section {
            margin-bottom: 20px;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }

        .salary-table {
            width: 100%;
            border-collapse: collapse;
        }

        .salary-table th,
        .salary-table td {
            padding: 8px 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }

        .salary-table th {
            background: #f3f4f6;
            font-weight: bold;
            color: #374151;
        }

        .salary-table .amount {
            text-align: right;
            font-family: 'Courier New', monospace;
        }

        .earnings-row td {
            color: #059669;
        }

        .deductions-row td {
            color: #dc2626;
        }

        .subtotal-row {
            background: #f9fafb;
            font-weight: bold;
        }

        .total-row {
            background: #1e40af;
            color: #fff;
            font-weight: bold;
            font-size: 13px;
        }

        .total-row td {
            border-bottom: none;
        }

        .net-salary {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: #fff;
            border-radius: 8px;
        }

        .net-salary .label {
            font-size: 12px;
            margin-bottom: 5px;
            opacity: 0.9;
        }

        .net-salary .amount {
            font-size: 24px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 9px;
            color: #9ca3af;
            text-align: center;
        }

        .footer .confidential {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 5px;
        }

        .two-column {
            display: table;
            width: 100%;
        }

        .column {
            display: table-cell;
            width: 48%;
            vertical-align: top;
        }

        .column:first-child {
            padding-right: 2%;
        }

        .column:last-child {
            padding-left: 2%;
        }

        .bpjs-info {
            font-size: 9px;
            color: #666;
            margin-top: 15px;
            padding: 10px;
            background: #fef3c7;
            border-radius: 5px;
        }

        .bpjs-info strong {
            color: #92400e;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header Perusahaan -->
        <div class="header">
            <div class="company-name">{{ $company['name'] }}</div>
            <div class="company-address">{{ $company['address'] }}</div>
        </div>

        <!-- Judul Slip Gaji -->
        <div class="payslip-title">
            <h1>Slip Gaji</h1>
            <div class="period">Periode: {{ $period['name'] }}</div>
        </div>

        <!-- Informasi Karyawan -->
        <div class="employee-info">
            <div class="info-row">
                <div class="info-label">NIK</div>
                <div class="info-value">: {{ $employee['id'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Nama</div>
                <div class="info-value">: {{ $employee['name'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Jabatan</div>
                <div class="info-value">: {{ $employee['position'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Departemen</div>
                <div class="info-value">: {{ $employee['department'] }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tanggal Pembayaran</div>
                <div class="info-value">: {{ $period['payment_date'] }}</div>
            </div>
        </div>

        <!-- Dua Kolom: Pendapatan & Potongan -->
        <div class="two-column">
            <!-- Kolom Pendapatan -->
            <div class="column">
                <div class="salary-section">
                    <div class="section-title">PENDAPATAN</div>
                    <table class="salary-table">
                        <tbody>
                            @foreach($earnings as $item)
                                <tr class="earnings-row">
                                    <td>{{ $item['name'] }}</td>
                                    <td class="amount">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                            <tr class="subtotal-row">
                                <td><strong>Total Pendapatan</strong></td>
                                <td class="amount"><strong>Rp
                                        {{ number_format($payslip->total_earnings, 0, ',', '.') }}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Kolom Potongan -->
            <div class="column">
                <div class="salary-section">
                    <div class="section-title">POTONGAN</div>
                    <table class="salary-table">
                        <tbody>
                            @foreach($deductions as $item)
                                <tr class="deductions-row">
                                    <td>{{ $item['name'] }}</td>
                                    <td class="amount">Rp {{ number_format($item['amount'], 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                            <tr class="subtotal-row">
                                <td><strong>Total Potongan</strong></td>
                                <td class="amount"><strong>Rp
                                        {{ number_format($payslip->total_deductions, 0, ',', '.') }}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Gaji Bersih -->
        <div class="net-salary">
            <div class="label">GAJI BERSIH YANG DITERIMA</div>
            <div class="amount">Rp {{ number_format($payslip->net_salary, 0, ',', '.') }}</div>
        </div>

        <!-- Informasi BPJS Perusahaan -->
        <div class="bpjs-info">
            <strong>Kontribusi BPJS oleh Perusahaan:</strong><br>
            JHT (3.7%): Rp {{ number_format($payslip->bpjs_tk_jht_company ?? 0, 0, ',', '.') }} |
            JKK: Rp {{ number_format($payslip->bpjs_tk_jkk ?? 0, 0, ',', '.') }} |
            JKM: Rp {{ number_format($payslip->bpjs_tk_jkm ?? 0, 0, ',', '.') }} |
            JP (2%): Rp {{ number_format($payslip->bpjs_tk_jp_company ?? 0, 0, ',', '.') }} |
            Kesehatan (4%): Rp {{ number_format($payslip->bpjs_kes_company ?? 0, 0, ',', '.') }}
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="confidential">⚠️ DOKUMEN RAHASIA - HANYA UNTUK PENERIMA</div>
            Slip gaji ini diterbitkan secara elektronik dan sah tanpa tanda tangan.<br>
            Dicetak pada: {{ $generated_at }}
        </div>
    </div>
</body>

</html>