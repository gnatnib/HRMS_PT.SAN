import { Head, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function PayslipView({ auth, payslip = null }) {
    const [showBpjsDetails, setShowBpjsDetails] = useState(false);

    const demoPayslip = payslip || {
        id: 1,
        employee: {
            name: 'Ahmad Fauzi',
            nik: '1001',
            position: 'Software Engineer',
            department: 'IT',
            bank: 'BCA',
            accountNo: '1234567890',
        },
        period: 'Januari 2026',
        paymentDate: '25 Januari 2026',
        earnings: [
            { name: 'Gaji Pokok', amount: 12000000 },
            { name: 'Tunjangan Harian (22 hari)', amount: 1100000 },
            { name: 'Tunjangan Komunikasi', amount: 300000 },
            { name: 'Lembur (8 jam)', amount: 450000 },
        ],
        deductions: [
            { name: 'BPJS Kesehatan (1%)', amount: 120000 },
            { name: 'BPJS JHT (2%)', amount: 240000 },
            { name: 'BPJS JP (1%)', amount: 100423 },
            { name: 'PPh 21 (TER-A)', amount: 276000 },
            { name: 'Cicilan Kasbon', amount: 500000 },
        ],
        bpjsCompany: {
            jht: 444000,
            jkk: 28800,
            jkm: 36000,
            jp: 200846,
            kesehatan: 480000,
        },
        totalEarnings: 13850000,
        totalDeductions: 1236423,
        netSalary: 12613577,
        pph21Category: 'A',
        attendanceDays: 22,
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    const handleDownloadPdf = () => {
        window.location.href = `/payroll/slip/${demoPayslip.id}/download`;
    };

    const handlePreviewPdf = () => {
        window.open(`/payroll/slip/${demoPayslip.id}/preview`, '_blank');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Slip Gaji" />

            <div className="max-w-3xl mx-auto space-y-6 print:max-w-none">
                <div className="flex items-center justify-between print:hidden">
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.get('/payroll')}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Slip Gaji</h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Periode {demoPayslip.period}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePreviewPdf} className="btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </button>
                        <button onClick={handleDownloadPdf} className="btn-primary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </button>
                        <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* Payslip Card */}
                <div className="card border-2 border-primary-100 print:border-gray-200">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center print:bg-gray-600">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">PT Sinar Asta Nusantara</h2>
                                    <p className="text-sm text-gray-500">Slip Gaji Karyawan</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Periode</p>
                                <p className="font-semibold text-gray-900">{demoPayslip.period}</p>
                            </div>
                        </div>
                    </div>

                    {/* Employee Info */}
                    <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="space-y-2">
                            <InfoRow label="Nama" value={demoPayslip.employee.name} />
                            <InfoRow label="NIK" value={demoPayslip.employee.nik} />
                            <InfoRow label="Jabatan" value={demoPayslip.employee.position} />
                        </div>
                        <div className="space-y-2">
                            <InfoRow label="Departemen" value={demoPayslip.employee.department} />
                            <InfoRow label="Bank" value={demoPayslip.employee.bank} />
                            <InfoRow label="No. Rekening" value={demoPayslip.employee.accountNo} />
                        </div>
                    </div>

                    {/* PPh 21 Category Badge */}
                    <div className="mb-4 flex items-center gap-2">
                        <span className="text-sm text-gray-600">Kategori PPh 21:</span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
                            TER Kategori {demoPayslip.pph21Category}
                        </span>
                        <span className="text-xs text-gray-500">
                            ({demoPayslip.attendanceDays} hari kerja)
                        </span>
                    </div>

                    {/* Earnings & Deductions */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Earnings */}
                        <div>
                            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Pendapatan
                            </h3>
                            <div className="space-y-2">
                                {demoPayslip.earnings.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name}</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                    <span className="text-green-700">Total Pendapatan</span>
                                    <span className="text-green-700">{formatCurrency(demoPayslip.totalEarnings)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                Potongan
                            </h3>
                            <div className="space-y-2">
                                {demoPayslip.deductions.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.name}</span>
                                        <span className="font-medium text-gray-900">-{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                                    <span className="text-red-700">Total Potongan</span>
                                    <span className="text-red-700">-{formatCurrency(demoPayslip.totalDeductions)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="mt-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 flex items-center justify-between text-white print:from-gray-600 print:to-gray-700">
                        <div>
                            <p className="text-sm opacity-90">Take Home Pay</p>
                            <p className="text-3xl font-bold">{formatCurrency(demoPayslip.netSalary)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm opacity-90">Tanggal Pembayaran</p>
                            <p className="font-medium">{demoPayslip.paymentDate}</p>
                        </div>
                    </div>

                    {/* BPJS Company Contribution Toggle */}
                    <div className="mt-6 print:hidden">
                        <button
                            onClick={() => setShowBpjsDetails(!showBpjsDetails)}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                            {showBpjsDetails ? 'Sembunyikan' : 'Lihat'} kontribusi BPJS perusahaan
                            <svg className={`w-4 h-4 transition-transform ${showBpjsDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showBpjsDetails && (
                            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Kontribusi BPJS oleh Perusahaan</h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                                    <div>
                                        <p className="text-blue-600">JHT (3.7%)</p>
                                        <p className="font-semibold text-blue-900">{formatCurrency(demoPayslip.bpjsCompany.jht)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600">JKK (0.24%)</p>
                                        <p className="font-semibold text-blue-900">{formatCurrency(demoPayslip.bpjsCompany.jkk)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600">JKM (0.3%)</p>
                                        <p className="font-semibold text-blue-900">{formatCurrency(demoPayslip.bpjsCompany.jkm)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600">JP (2%)</p>
                                        <p className="font-semibold text-blue-900">{formatCurrency(demoPayslip.bpjsCompany.jp)}</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-600">Kesehatan (4%)</p>
                                        <p className="font-semibold text-blue-900">{formatCurrency(demoPayslip.bpjsCompany.kesehatan)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-500 mt-2">
                                    Total kontribusi perusahaan: {formatCurrency(
                                        demoPayslip.bpjsCompany.jht +
                                        demoPayslip.bpjsCompany.jkk +
                                        demoPayslip.bpjsCompany.jkm +
                                        demoPayslip.bpjsCompany.jp +
                                        demoPayslip.bpjsCompany.kesehatan
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confidential Notice */}
                <p className="text-center text-xs text-gray-400 print:text-gray-600">
                    🔒 Dokumen ini bersifat RAHASIA. Hanya untuk karyawan yang bersangkutan.
                </p>

                {/* Password Info */}
                <div className="card bg-amber-50 border border-amber-200 print:hidden">
                    <div className="flex items-start gap-3">
                        <span className="text-xl">🔐</span>
                        <div>
                            <p className="font-medium text-amber-900">Password PDF</p>
                            <p className="text-sm text-amber-700">
                                File PDF slip gaji dilindungi password. Gunakan tanggal lahir Anda dengan format <strong>DDMMYYYY</strong>.
                            </p>
                            <p className="text-xs text-amber-600 mt-1">
                                Contoh: Jika lahir 15 Agustus 1990, password = 15081990
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MekariLayout>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}
