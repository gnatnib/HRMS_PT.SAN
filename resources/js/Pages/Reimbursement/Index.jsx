import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReimbursementIndex({ auth, requests = [], categories = [], stats = {}, categoryData = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: auth?.user?.employee?.id || 1,
        expense_category_id: '',
        title: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        receipt: null,
    });

    const demoCategories = categories.length > 0 ? categories : [
        { id: 1, name: 'Transport' },
        { id: 2, name: 'Makan' },
        { id: 3, name: 'Akomodasi' },
        { id: 4, name: 'Lainnya' },
    ];

    const demoRequests = requests.length > 0 ? requests : [
        { id: 1, employee: 'Ahmad Fauzi', category: 'Transport', title: 'Grab ke client', amount: 150000, date: '2024-01-18', status: 'pending', receipts: 1 },
        { id: 2, employee: 'Siti Rahayu', category: 'Makan', title: 'Lunch meeting', amount: 350000, date: '2024-01-17', status: 'approved', receipts: 2 },
        { id: 3, employee: 'Budi Santoso', category: 'Akomodasi', title: 'Hotel Surabaya', amount: 850000, date: '2024-01-15', status: 'rejected', receipts: 1 },
    ];

    const demoStats = {
        pending: stats.pending || 2500000,
        approved: stats.approved || 8500000,
        count_pending: stats.count_pending || 5,
        count_approved: stats.count_approved || 23,
    };

    const demoCategoryData = categoryData.length > 0 ? categoryData : [
        { name: 'Transport', value: 3500000, color: '#3b82f6' },
        { name: 'Makan', value: 2800000, color: '#10b981' },
        { name: 'Akomodasi', value: 1500000, color: '#f59e0b' },
        { name: 'Lainnya', value: 700000, color: '#8b5cf6' },
    ];

    const filteredRequests = filter === 'all'
        ? demoRequests
        : demoRequests.filter(r => r.status === filter);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/reimbursement', {
            forceFormData: true, // For file upload
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleApprove = (id) => {
        router.post(`/reimbursement/${id}/approve`);
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan reimburse ini?')) {
            router.post(`/reimbursement/${id}/reject`);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Reimbursement" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reimbursement</h1>
                        <p className="text-sm text-gray-500">Pengajuan dan approval reimburse karyawan</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajukan Reimburse
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard icon="⏳" title="Pending" value={formatCurrency(demoStats.pending)} subtitle={`${demoStats.count_pending} pengajuan`} color="amber" />
                    <StatCard icon="✅" title="Approved (Bulan Ini)" value={formatCurrency(demoStats.approved)} subtitle={`${demoStats.count_approved} pengajuan`} color="green" />
                </div>

                {/* Category Chart */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="card md:col-span-1">
                        <h3 className="font-semibold text-gray-900 mb-4">📊 Per Kategori</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={demoCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        dataKey="value"
                                        label={({ name }) => name}
                                    >
                                        {demoCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Cards */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        {demoCategories.map((cat, idx) => (
                            <div key={cat.id} className="card flex items-center gap-3">
                                <span className="text-2xl">{['🚗', '🍔', '🏨', '📦'][idx] || '📦'}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{cat.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatCurrency(demoCategoryData[idx]?.value || 0)}
                                    </p>
                                </div>
                            </div>
                        ))}
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

                {/* Requests Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{req.employee}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.category}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.title}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(req.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[req.status]}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.id)}
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Ajukan Reimbursement</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Kategori</label>
                                <select
                                    className="input"
                                    value={data.expense_category_id}
                                    onChange={e => setData('expense_category_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {demoCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Keterangan</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Grab ke client meeting"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Jumlah (Rp)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="150000"
                                    />
                                </div>
                                <div>
                                    <label className="label">Tanggal</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Upload Bukti/Struk</label>
                                <input
                                    type="file"
                                    className="input"
                                    accept="image/*,.pdf"
                                    onChange={e => setData('receipt', e.target.files[0])}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF. Max 5MB</p>
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

function StatCard({ icon, title, value, subtitle, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
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
