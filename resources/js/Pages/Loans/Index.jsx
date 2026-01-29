import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function LoansIndex({ auth, loans = [], stats = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: auth?.user?.employee?.id || 1,
        principal_amount: '',
        total_installments: 12,
        purpose: '',
    });

    const demoLoans = loans.length > 0 ? loans : [
        { id: 1, employee: 'Ahmad Fauzi', department: 'IT', principal: 5000000, monthly: 416667, remaining: 3333333, installments: '4/12', status: 'active' },
        { id: 2, employee: 'Siti Rahayu', department: 'HR', principal: 3000000, monthly: 500000, remaining: 0, installments: '6/6', status: 'completed' },
        { id: 3, employee: 'Budi Santoso', department: 'Sales', principal: 10000000, monthly: 833333, remaining: 10000000, installments: '0/12', status: 'pending' },
    ];

    const demoStats = {
        active: stats.active || 8500000,
        pending: stats.pending || 10000000,
        monthly_deduction: stats.monthly_deduction || 1250000,
        count_active: stats.count_active || 3,
        count_pending: stats.count_pending || 1,
    };

    const filteredLoans = filter === 'all'
        ? demoLoans
        : demoLoans.filter(l => l.status === filter);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/loans', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleApprove = (id) => {
        router.post(`/loans/${id}/approve`);
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan kasbon ini?')) {
            router.post(`/loans/${id}/reject`);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        active: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const getProgress = (loan) => {
        const parts = loan.installments.split('/');
        const paid = parseInt(parts[0]);
        const total = parseInt(parts[1]);
        return total > 0 ? (paid / total) * 100 : 0;
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Loan / Kasbon" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Kasbon / Pinjaman</h1>
                        <p className="text-sm text-gray-500">Pengajuan kasbon dengan auto-deduct dari gaji</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajukan Kasbon
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <StatCard
                        icon="💰"
                        title="Outstanding"
                        value={formatCurrency(demoStats.active)}
                        subtitle={`${demoStats.count_active} pinjaman aktif`}
                        color="blue"
                    />
                    <StatCard
                        icon="⏳"
                        title="Pending Approval"
                        value={formatCurrency(demoStats.pending)}
                        subtitle={`${demoStats.count_pending} pengajuan`}
                        color="amber"
                    />
                    <StatCard
                        icon="📉"
                        title="Potongan/Bulan"
                        value={formatCurrency(demoStats.monthly_deduction)}
                        subtitle="Total auto-deduct"
                        color="green"
                    />
                </div>

                {/* Info */}
                <div className="card bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Kasbon</h4>
                    <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Maksimal pinjaman: <strong>10x gaji pokok</strong> atau Rp 50.000.000</li>
                        <li>Cicilan maksimal: <strong>24 bulan</strong></li>
                        <li>Potongan otomatis dari gaji setiap bulan</li>
                        <li>Tidak ada bunga (0%)</li>
                    </ul>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['all', 'pending', 'active', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm rounded-lg transition-colors ${filter === f
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Loans Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Pinjaman</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cicilan/Bulan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLoans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{loan.employee}</p>
                                            <p className="text-sm text-gray-500">{loan.department}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(loan.principal)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(loan.monthly)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full"
                                                    style={{ width: `${getProgress(loan)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500">{loan.installments}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(loan.remaining)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[loan.status]}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {loan.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleApprove(loan.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleReject(loan.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Ajukan Kasbon</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Jumlah Pinjaman (Rp)</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={data.principal_amount}
                                    onChange={e => setData('principal_amount', e.target.value)}
                                    placeholder="5000000"
                                    min="100000"
                                    max="50000000"
                                />
                                {errors.principal_amount && <p className="text-red-500 text-sm mt-1">{errors.principal_amount}</p>}
                            </div>
                            <div>
                                <label className="label">Tenor (Bulan)</label>
                                <select
                                    className="input"
                                    value={data.total_installments}
                                    onChange={e => setData('total_installments', parseInt(e.target.value))}
                                >
                                    {[3, 6, 9, 12, 18, 24].map((m) => (
                                        <option key={m} value={m}>{m} bulan</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Keperluan</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                    placeholder="Jelaskan keperluan pinjaman..."
                                />
                                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
                            </div>
                            {data.principal_amount && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Estimasi Cicilan/Bulan:</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {formatCurrency(Math.ceil(data.principal_amount / data.total_installments))}
                                    </p>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary flex-1"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Ajukan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}

function StatCard({ icon, title, value, subtitle, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        green: 'bg-green-100 text-green-600',
    };

    return (
        <div className="card flex items-center gap-4">
            <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </span>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    );
}
