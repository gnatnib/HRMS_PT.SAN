import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LeaveIndex({ auth, leaves = [], leaveTypes = [], balance = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: auth?.user?.employee?.id || 1,
        leave_id: '',
        from_date: '',
        to_date: '',
        note: '',
    });

    const demoLeaves = leaves.length > 0 ? leaves : [
        { id: 1, employee: 'Ahmad Fauzi', type: 'Cuti Tahunan', type_key: 'annual', from: '2024-01-25', to: '2024-01-26', days: 2, reason: 'Acara keluarga', status: 'pending' },
        { id: 2, employee: 'Siti Rahayu', type: 'Sakit', type_key: 'sick', from: '2024-01-18', to: '2024-01-19', days: 2, reason: 'Demam', status: 'approved' },
        { id: 3, employee: 'Budi Santoso', type: 'Cuti Tahunan', type_key: 'annual', from: '2024-01-15', to: '2024-01-15', days: 1, reason: 'Urusan pribadi', status: 'rejected' },
    ];

    const demoBalance = balance.annual ? balance : {
        annual: { total: 12, used: 5, remaining: 7 },
        sick: { total: 14, used: 2, remaining: 12 },
        unpaid: { total: 0, used: 0, remaining: 0 },
    };

    const demoLeaveTypes = leaveTypes.length > 0 ? leaveTypes : [
        { id: 1, name: 'Cuti Tahunan' },
        { id: 2, name: 'Sakit' },
        { id: 3, name: 'Cuti Tanpa Gaji' },
    ];

    const pieData = [
        { name: 'Cuti Tahunan', value: demoBalance.annual.remaining, color: '#3b82f6' },
        { name: 'Sakit', value: demoBalance.sick.remaining, color: '#10b981' },
        { name: 'Digunakan', value: demoBalance.annual.used + demoBalance.sick.used, color: '#f59e0b' },
    ];

    const monthlyData = [
        { month: 'Jan', annual: 3, sick: 2 },
        { month: 'Feb', annual: 2, sick: 1 },
        { month: 'Mar', annual: 4, sick: 0 },
        { month: 'Apr', annual: 1, sick: 1 },
    ];

    const filteredLeaves = filter === 'all'
        ? demoLeaves
        : demoLeaves.filter(l => l.status === filter);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/leave', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleApprove = (id) => {
        router.post(`/leave/${id}/approve`);
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan cuti ini?')) {
            router.post(`/leave/${id}/reject`);
        }
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Leave Management" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                        <p className="text-sm text-gray-500">Kelola pengajuan cuti dan saldo cuti karyawan</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajukan Cuti
                    </button>
                </div>

                {/* Balance Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    <BalanceCard
                        title="Cuti Tahunan"
                        remaining={demoBalance.annual.remaining}
                        total={demoBalance.annual.total}
                        used={demoBalance.annual.used}
                        color="blue"
                    />
                    <BalanceCard
                        title="Sakit"
                        remaining={demoBalance.sick.remaining}
                        total={demoBalance.sick.total}
                        used={demoBalance.sick.used}
                        color="green"
                    />
                    <BalanceCard
                        title="Tanpa Gaji"
                        remaining={demoBalance.unpaid.remaining || 0}
                        total={demoBalance.unpaid.total || 0}
                        used={demoBalance.unpaid.used || 0}
                        color="gray"
                    />
                </div>

                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📊 Saldo Cuti</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📅 Penggunaan per Bulan</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="annual" fill="#3b82f6" name="Cuti Tahunan" />
                                    <Bar dataKey="sick" fill="#10b981" name="Sakit" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
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

                {/* Leave Requests Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLeaves.map((leave) => (
                                <tr key={leave.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{leave.employee}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{leave.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{leave.from} - {leave.to}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{leave.days} hari</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{leave.reason}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[leave.status]}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleApprove(leave.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleReject(leave.id)}
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Ajukan Cuti</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Jenis Cuti</label>
                                <select
                                    className="input"
                                    value={data.leave_id}
                                    onChange={e => setData('leave_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Jenis Cuti --</option>
                                    {demoLeaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.leave_id && <p className="text-red-500 text-sm mt-1">{errors.leave_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.from_date}
                                        onChange={e => setData('from_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.to_date}
                                        onChange={e => setData('to_date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Alasan</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    placeholder="Jelaskan alasan cuti..."
                                />
                            </div>
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
        </Layout>
    );
}

function BalanceCard({ title, remaining, total, used, color }) {
    const colors = {
        blue: 'border-blue-200 bg-blue-50',
        green: 'border-green-200 bg-green-50',
        gray: 'border-gray-200 bg-gray-50',
    };
    const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

    return (
        <div className={`card border ${colors[color]}`}>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{remaining}<span className="text-lg text-gray-500">/{total}</span></p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">Terpakai: {used} hari</p>
        </div>
    );
}
