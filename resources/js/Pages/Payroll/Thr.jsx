import { Head, router, useForm } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ThrIndex({ auth, thrData = null, flash }) {
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedEmployees, setSelectedEmployees] = useState([]);

    const { data, setData, post, processing } = useForm({
        calculation_date: new Date().toISOString().split('T')[0],
        employee_ids: null, // null = semua karyawan
    });

    // Demo data jika tidak ada data dari backend
    const demoThrData = thrData || {
        calculation_date: '2026-01-29',
        results: [
            { employee_id: 1, employee_name: 'Ahmad Fauzi', department: 'IT', position: 'Software Engineer', months_of_service: 24, base_salary: 12000000, percentage: 100, amount: 12000000, eligible: true, reason: 'THR penuh (masa kerja >= 12 bulan)' },
            { employee_id: 2, employee_name: 'Siti Rahayu', department: 'Finance', position: 'Accountant', months_of_service: 18, base_salary: 10000000, percentage: 100, amount: 10000000, eligible: true, reason: 'THR penuh (masa kerja >= 12 bulan)' },
            { employee_id: 3, employee_name: 'Budi Santoso', department: 'HR', position: 'HR Staff', months_of_service: 8, base_salary: 8000000, percentage: 66.67, amount: 5333333, eligible: true, reason: 'THR pro-rata (masa kerja 8 bulan)' },
            { employee_id: 4, employee_name: 'Dewi Anggraini', department: 'Marketing', position: 'Marketing Executive', months_of_service: 3, base_salary: 9000000, percentage: 25, amount: 2250000, eligible: true, reason: 'THR pro-rata (masa kerja 3 bulan)' },
            { employee_id: 5, employee_name: 'Eko Prasetyo', department: 'IT', position: 'Junior Developer', months_of_service: 0, base_salary: 7000000, percentage: 0, amount: 0, eligible: false, reason: 'Masa kerja kurang dari 1 bulan' },
        ],
        summary: {
            total_employees: 5,
            eligible_employees: 4,
            total_thr_amount: 29583333,
            full_thr_count: 2,
            prorata_thr_count: 2,
            not_eligible_count: 1,
        },
    };

    // Chart data
    const chartData = [
        { name: 'THR Penuh', value: demoThrData.summary.full_thr_count, color: '#10B981' },
        { name: 'THR Pro-rata', value: demoThrData.summary.prorata_thr_count, color: '#F59E0B' },
        { name: 'Tidak Berhak', value: demoThrData.summary.not_eligible_count, color: '#EF4444' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        post('/payroll/thr/generate', {
            onSuccess: () => setShowGenerateModal(false),
        });
    };

    const handleExport = () => {
        window.location.href = '/payroll/thr/export';
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Tunjangan Hari Raya (THR)" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
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
                            <h1 className="text-2xl font-bold text-gray-900">Tunjangan Hari Raya (THR)</h1>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Perhitungan THR sesuai PP No. 36 Tahun 2021</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Hitung THR
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard
                        icon="💰"
                        title="Total THR"
                        value={formatCurrency(demoThrData.summary.total_thr_amount)}
                        color="blue"
                    />
                    <StatCard
                        icon="✅"
                        title="Karyawan Berhak"
                        value={demoThrData.summary.eligible_employees}
                        color="green"
                    />
                    <StatCard
                        icon="📊"
                        title="THR Penuh"
                        value={demoThrData.summary.full_thr_count}
                        color="amber"
                    />
                    <StatCard
                        icon="📉"
                        title="THR Pro-rata"
                        value={demoThrData.summary.prorata_thr_count}
                        color="purple"
                    />
                </div>

                {/* Charts and Info */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Distribution Pie Chart */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📊 Distribusi THR</h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* THR Rules Info */}
                    <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-4">📋 Ketentuan THR</h3>
                        <div className="space-y-4">
                            <div className="p-3 bg-white/60 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                                    <span className="font-medium text-green-800">Masa Kerja ≥ 12 Bulan</span>
                                </div>
                                <p className="text-sm text-green-700 ml-8">THR = 1 × (Gaji Pokok + Tunjangan Tetap)</p>
                            </div>
                            <div className="p-3 bg-white/60 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">~</span>
                                    <span className="font-medium text-green-800">Masa Kerja 1-11 Bulan</span>
                                </div>
                                <p className="text-sm text-green-700 ml-8">THR = (Masa Kerja ÷ 12) × Gaji</p>
                            </div>
                            <div className="p-3 bg-white/60 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">×</span>
                                    <span className="font-medium text-green-800">Masa Kerja &lt; 1 Bulan</span>
                                </div>
                                <p className="text-sm text-green-700 ml-8">Tidak berhak THR</p>
                            </div>
                        </div>
                        <p className="text-xs text-green-600 mt-4">
                            Ref: PP No. 36 Tahun 2021 tentang Pengupahan
                        </p>
                    </div>
                </div>

                {/* THR Details Table */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">📋 Detail Perhitungan THR</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Karyawan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masa Kerja</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gaji Dasar</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Persentase</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal THR</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {demoThrData.results.map((employee) => (
                                    <tr key={employee.employee_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{employee.employee_name}</p>
                                                <p className="text-xs text-gray-500">{employee.position}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{employee.department}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="font-medium">{employee.months_of_service}</span> bulan
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(employee.base_salary)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${employee.percentage === 100 ? 'text-green-600' :
                                                    employee.percentage > 0 ? 'text-amber-600' : 'text-red-600'
                                                }`}>
                                                {employee.percentage.toFixed(0)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                            {formatCurrency(employee.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.eligible
                                                    ? employee.percentage === 100
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {employee.eligible
                                                    ? employee.percentage === 100 ? 'Penuh' : 'Pro-rata'
                                                    : 'Tidak Berhak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-right font-semibold text-gray-700">
                                        Total THR:
                                    </td>
                                    <td colSpan="2" className="px-6 py-4 font-bold text-lg text-primary-600">
                                        {formatCurrency(demoThrData.summary.total_thr_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Generate THR Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Hitung THR</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="label">Tanggal Perhitungan</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.calculation_date}
                                    onChange={e => setData('calculation_date', e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Masa kerja akan dihitung sampai tanggal ini
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    ℹ️ THR akan dihitung untuk <strong>semua karyawan aktif</strong> sesuai ketentuan PP No. 36 Tahun 2021.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Hitung THR'}
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
        purple: 'bg-purple-100 text-purple-600',
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
