import { Head, useForm, router, usePage } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function OvertimeIndex({ auth, requests = [], stats = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const { props } = usePage();

    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: auth?.user?.employee?.id || '',
        date: new Date().toISOString().split('T')[0],
        start_time: '17:00',
        end_time: '20:00',
        reason: '',
        is_holiday: false,
    });

    const demoRequests = requests.length > 0 ? requests : [
        { id: 1, employee: 'Ahmad Fauzi', department: 'IT', date: '2024-01-18', hours: 3, multiplier: 2.0, amount: 300000, reason: 'Deploy production', status: 'pending' },
        { id: 2, employee: 'Siti Rahayu', department: 'HR', date: '2024-01-17', hours: 2, multiplier: 1.5, amount: 150000, reason: 'Closing payroll', status: 'approved' },
        { id: 3, employee: 'Budi Santoso', department: 'Sales', date: '2024-01-16', hours: 4, multiplier: 2.0, amount: 400000, reason: 'Client meeting', status: 'rejected' },
    ];

    const demoStats = {
        total: stats.total || 45,
        pending: stats.pending || 5,
        approved: stats.approved || 38,
        total_hours: stats.total_hours || 152,
    };

    const filteredRequests = filter === 'all'
        ? demoRequests
        : demoRequests.filter(r => r.status === filter);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/overtime', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleApprove = (id) => {
        router.post(`/overtime/${id}/approve`);
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan lembur ini?')) {
            router.post(`/overtime/${id}/reject`);
        }
    };

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Overtime Management" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lembur</h1>
                        <p className="text-sm text-gray-500">Pengajuan dan persetujuan lembur karyawan</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Ajukan Lembur
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard icon="📊" title="Total Bulan Ini" value={demoStats.total} />
                    <StatCard icon="⏳" title="Menunggu" value={demoStats.pending} color="amber" />
                    <StatCard icon="✅" title="Disetujui" value={demoStats.approved} color="green" />
                    <StatCard icon="⏱️" title="Total Jam" value={`${demoStats.total_hours} jam`} color="blue" />
                </div>

                {/* Depnaker Rules Info */}
                <div className="card bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Aturan Lembur (Depnaker)</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                        <div>
                            <p className="font-medium">Hari Kerja:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li>1 jam pertama: 1.5x upah/jam</li>
                                <li>Jam berikutnya: 2x upah/jam</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium">Hari Libur / Weekend:</p>
                            <ul className="list-disc list-inside ml-2">
                                <li>8 jam pertama: 2x upah/jam</li>
                                <li>1 jam selanjutnya: 3x upah/jam</li>
                                <li>Jam berikutnya: 4x upah/jam</li>
                            </ul>
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

                {/* Requests Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Multiplier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{req.employee}</p>
                                            <p className="text-sm text-gray-500">{req.department}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.date}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.hours} jam</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{req.multiplier}x</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(req.amount)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{req.reason}</td>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Ajukan Lembur</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Tanggal</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.date}
                                    onChange={e => setData('date', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Jam Mulai</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={data.start_time}
                                        onChange={e => setData('start_time', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">Jam Selesai</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={data.end_time}
                                        onChange={e => setData('end_time', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_holiday"
                                    checked={data.is_holiday}
                                    onChange={e => setData('is_holiday', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600"
                                />
                                <label htmlFor="is_holiday" className="text-sm text-gray-700">
                                    Hari Libur / Weekend (multiplier lebih tinggi)
                                </label>
                            </div>
                            <div>
                                <label className="label">Alasan Lembur</label>
                                <textarea
                                    className="input min-h-[80px]"
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    placeholder="Jelaskan alasan lembur..."
                                />
                                {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
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

function StatCard({ icon, title, value, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        amber: 'bg-amber-100 text-amber-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
    };

    return (
        <div className="card flex items-center gap-4">
            <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </span>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
