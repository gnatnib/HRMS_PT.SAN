import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PayrollIndex({ auth, periods = [], stats = {}, trendData = [], flash }) {
    const [showRunModal, setShowRunModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
    });

    const demoPeriods = periods.length > 0 ? periods : [
        { id: 1, name: 'Januari 2024', status: 'paid', employees: 156, totalGross: 1480000000, totalNet: 1250000000, paymentDate: '2024-01-25' },
        { id: 2, name: 'Desember 2023', status: 'paid', employees: 154, totalGross: 1650000000, totalNet: 1400000000, paymentDate: '2023-12-25' },
        { id: 3, name: 'November 2023', status: 'paid', employees: 152, totalGross: 1420000000, totalNet: 1200000000, paymentDate: '2023-11-25' },
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

    const handleExport = (periodId) => {
        window.location.href = `/payroll/${periodId}/export`;
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Payroll Management" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                        <p className="text-sm text-gray-500">Penggajian karyawan dengan BPJS & PPh 21</p>
                    </div>
                    <div className="flex gap-2">
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
                    <StatCard icon="💰" title="Total Net (Bulan Ini)" value={formatCurrency(demoStats.totalNet)} color="blue" />
                    <StatCard icon="🏥" title="Total BPJS" value={formatCurrency(demoStats.totalBpjs)} color="green" />
                    <StatCard icon="📊" title="Total PPh 21" value={formatCurrency(demoStats.totalPph21)} color="amber" />
                    <StatCard icon="👥" title="Karyawan" value={demoStats.employees} />
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
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-700">{item.name}</span>
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-blue-600">Karyawan: {item.percentage}</span>
                                        <span className="text-green-600">Perusahaan: {item.company}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payroll History */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">📋 Riwayat Payroll</h3>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Gross</th>
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
                                                onClick={() => handleExport(period.id)}
                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                            >
                                                Export CSV
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
                                        {[2024, 2025, 2026].map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
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
        </MekariLayout>
    );
}

function StatCard({ icon, title, value, color = 'gray' }) {
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
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
