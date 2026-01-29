import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PayrollIndex({ auth, periods = [], stats = {}, trendData = [], flash }) {
    const [showRunModal, setShowRunModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState(null);
    const [exportBank, setExportBank] = useState('BCA');

    const { data, setData, post, processing, errors } = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
    });

    const demoPeriods = periods.length > 0 ? periods : [
        { id: 1, name: 'Januari 2026', status: 'paid', employees: 156, totalGross: 1480000000, totalNet: 1250000000, totalBpjs: 145000000, totalPph21: 85000000, paymentDate: '2026-01-25' },
        { id: 2, name: 'Desember 2025', status: 'paid', employees: 154, totalGross: 1650000000, totalNet: 1400000000, totalBpjs: 160000000, totalPph21: 90000000, paymentDate: '2025-12-25' },
        { id: 3, name: 'November 2025', status: 'paid', employees: 152, totalGross: 1420000000, totalNet: 1200000000, totalBpjs: 138000000, totalPph21: 82000000, paymentDate: '2025-11-25' },
    ];

    const demoStats = {
        totalNet: stats.totalNet || 1250000000,
        totalBpjs: stats.totalBpjs || 145000000,
        totalPph21: stats.totalPph21 || 85000000,
        employees: stats.employees || 156,
    };

    const demoTrendData = trendData.length > 0 ? trendData : [
        { month: 'Sep', gross: 1350, net: 1150 },
        { month: 'Okt', gross: 1400, net: 1180 },
        { month: 'Nov', gross: 1420, net: 1200 },
        { month: 'Des', gross: 1650, net: 1400 },
        { month: 'Jan', gross: 1480, net: 1250 },
    ];

    const bpjsBreakdown = [
        { name: 'BPJS Kesehatan', percentage: '1%', company: '4%' },
        { name: 'BPJS Ketenagakerjaan - JKK', percentage: '0%', company: '0.24-1.74%' },
        { name: 'BPJS Ketenagakerjaan - JKM', percentage: '0%', company: '0.3%' },
        { name: 'BPJS Ketenagakerjaan - JHT', percentage: '2%', company: '3.7%' },
        { name: 'BPJS Ketenagakerjaan - JP', percentage: '1%', company: '2%' },
    ];

    // Pie chart data for deductions breakdown
    const deductionData = [
        { name: 'BPJS Kes', value: demoStats.totalBpjs * 0.25, color: '#10B981' },
        { name: 'BPJS JHT', value: demoStats.totalBpjs * 0.35, color: '#6366F1' },
        { name: 'BPJS JP', value: demoStats.totalBpjs * 0.15, color: '#F59E0B' },
        { name: 'JKK/JKM', value: demoStats.totalBpjs * 0.25, color: '#EF4444' },
    ];

    const formatCurrency = (amount) => {
        if (amount >= 1000000000) {
            return 'Rp ' + (amount / 1000000000).toFixed(2) + ' M';
        } else if (amount >= 1000000) {
            return 'Rp ' + (amount / 1000000).toFixed(0) + ' jt';
        }
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const handleRunPayroll = (e) => {
        e.preventDefault();
        post('/payroll/run', {
            onSuccess: () => setShowRunModal(false),
        });
    };

    const handleFinalize = (periodId) => {
        if (confirm('Finalisasi payroll ini? Setelah difinalisasi tidak dapat diubah.')) {
            router.post(`/payroll/${periodId}/finalize`);
        }
    };

    const handleExportCSV = (periodId) => {
        window.location.href = `/payroll/${periodId}/export`;
    };

    const handleOpenExportModal = (periodId) => {
        setSelectedPeriodId(periodId);
        setShowExportModal(true);
    };

    const handleExportBank = () => {
        window.location.href = `/payroll/${selectedPeriodId}/bank-transfer?bank=${exportBank}`;
        setShowExportModal(false);
    };

    const handleNavigateToThr = () => {
        router.get('/payroll/thr');
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Payroll Management" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                        <p className="text-sm text-gray-500">Penggajian karyawan dengan BPJS & PPh 21 TER 2024</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleNavigateToThr}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            THR
                        </button>
                        <button onClick={() => setShowRunModal(true)} className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Run Payroll
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard icon="💰" title="Total Net (Bulan Ini)" value={formatCurrency(demoStats.totalNet)} color="blue" trend="+5.2%" />
                    <StatCard icon="🏥" title="Total BPJS" value={formatCurrency(demoStats.totalBpjs)} color="green" />
                    <StatCard icon="📊" title="Total PPh 21" value={formatCurrency(demoStats.totalPph21)} color="amber" />
                    <StatCard icon="👥" title="Karyawan Aktif" value={demoStats.employees} />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Trend Chart */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📈 Trend Payroll (Juta Rupiah)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={demoTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `Rp ${value} jt`} />
                                    <Line type="monotone" dataKey="gross" stroke="#3b82f6" strokeWidth={2} name="Gross" />
                                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* BPJS Breakdown */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">🏥 BPJS Breakdown</h3>
                        <div className="space-y-3">
                            {bpjsBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-sm text-gray-700">{item.name}</span>
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-blue-600 font-medium">Karyawan: {item.percentage}</span>
                                        <span className="text-green-600 font-medium">Perusahaan: {item.company}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PPh 21 TER Info Card */}
                <div className="card bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-xl">
                            📋
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-900">PPh 21 TER 2024</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                Menggunakan Tarif Efektif Rata-rata (TER) untuk bulan Januari - November, dan Tarif Pasal 17 untuk perhitungan akhir tahun di bulan Desember.
                            </p>
                            <div className="flex gap-4 mt-3">
                                <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded">Kategori A: TK/0, TK/1, K/0</span>
                                <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded">Kategori B: TK/2, K/1, K/2</span>
                                <span className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded">Kategori C: K/3+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payroll History */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">📋 Riwayat Payroll</h3>
                        <button
                            onClick={() => router.get('/payroll/payslip')}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                        >
                            Lihat Slip Gaji Saya
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gross</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total BPJS</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Net</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demoPeriods.map((period) => (
                                <tr key={period.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{period.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{period.employees}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(period.totalGross)}</td>
                                    <td className="px-6 py-4 text-sm text-blue-600">{formatCurrency(period.totalBpjs)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(period.totalNet)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${period.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {period.status === 'paid' ? 'Dibayar' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {period.status === 'draft' && (
                                                <button
                                                    onClick={() => handleFinalize(period.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    Finalisasi
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleExportCSV(period.id)}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                            >
                                                Export CSV
                                            </button>
                                            <button
                                                onClick={() => handleOpenExportModal(period.id)}
                                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                            >
                                                Bank Transfer
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Run Payroll Modal */}
            {showRunModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Run Payroll</h2>
                        <form onSubmit={handleRunPayroll} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Bulan</label>
                                    <select
                                        className="input"
                                        value={data.period_month}
                                        onChange={e => setData('period_month', parseInt(e.target.value))}
                                    >
                                        {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Tahun</label>
                                    <select
                                        className="input"
                                        value={data.period_year}
                                        onChange={e => setData('period_year', parseInt(e.target.value))}
                                    >
                                        {[2024, 2025, 2026, 2027].map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    ℹ️ Payroll akan dihitung menggunakan <strong>PPh 21 TER 2024</strong> dan <strong>BPJS terbaru</strong> dengan max cap yang berlaku.
                                </p>
                            </div>
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-700">
                                    ⚠️ Proses payroll akan menghitung gaji untuk <strong>semua karyawan aktif</strong> pada periode ini.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowRunModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Run Payroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bank Transfer Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Export Bank Transfer</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Format Bank</label>
                                <select
                                    className="input"
                                    value={exportBank}
                                    onChange={e => setExportBank(e.target.value)}
                                >
                                    <option value="BCA">KlikBCA Bisnis</option>
                                    <option value="MANDIRI">Mandiri Cash Management</option>
                                    <option value="BRI">BRI CMS</option>
                                    <option value="BNI">BNI Direct</option>
                                </select>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    File CSV akan di-generate sesuai format yang dipilih dan dapat di-upload langsung ke internet banking.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExportModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleExportBank}
                                    className="btn-primary flex-1"
                                >
                                    Download CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}

function StatCard({ icon, title, value, color = 'gray', trend }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <div className="card flex items-center gap-4">
            <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </span>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{title}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
