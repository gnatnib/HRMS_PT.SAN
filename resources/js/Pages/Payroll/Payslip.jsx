import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function PayslipView({ auth, payslip = null }) {
    const demoPayslip = payslip || {
        employee: {
            name: 'Ahmad Fauzi',
            nik: '1001',
            position: 'Software Engineer',
            department: 'IT',
            bank: 'BCA',
            accountNo: '1234567890',
        },
        period: 'Januari 2024',
        paymentDate: '25 Januari 2024',
        earnings: [
            { name: 'Gaji Pokok', amount: 8000000 },
            { name: 'Tunjangan Transportasi', amount: 500000 },
            { name: 'Tunjangan Makan', amount: 500000 },
            { name: 'Tunjangan Komunikasi', amount: 300000 },
            { name: 'Lembur (12 jam)', amount: 600000 },
        ],
        deductions: [
            { name: 'BPJS Kesehatan (1%)', amount: 80000 },
            { name: 'BPJS JHT (2%)', amount: 160000 },
            { name: 'BPJS JP (1%)', amount: 80000 },
            { name: 'PPh 21', amount: 485000 },
            { name: 'Cicilan Kasbon', amount: 500000 },
        ],
        totalEarnings: 9900000,
        totalDeductions: 1305000,
        netSalary: 8595000,
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Slip Gaji" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Slip Gaji</h1>
                        <p className="text-sm text-gray-500">Periode {demoPayslip.period}</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PDF
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                            </svg>
                            Print
                        </button>
                    </div>
                </div>

                {/* Payslip Card */}
                <div className="card border-2 border-primary-100">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
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
                    <div className="mt-6 bg-primary-50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-600">Take Home Pay</p>
                            <p className="text-3xl font-bold text-primary-900">{formatCurrency(demoPayslip.netSalary)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Tanggal Pembayaran</p>
                            <p className="font-medium text-gray-900">{demoPayslip.paymentDate}</p>
                        </div>
                    </div>
                </div>

                {/* Confidential Notice */}
                <p className="text-center text-xs text-gray-400">
                    🔒 Dokumen ini bersifat RAHASIA. Hanya untuk karyawan yang bersangkutan.
                </p>
            </div>
        </Layout>
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
