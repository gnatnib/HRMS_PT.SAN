import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

/**
 * Halaman Cash Advance sesuai dengan UI reference Mekari.
 * Menampilkan daftar pengajuan uang muka dengan status dan actions.
 */
export default function CashAdvanceIndex({ auth, cashAdvances = {}, policies = [], stats = {}, filters = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [selectedCa, setSelectedCa] = useState(null);
    const [filterPolicy, setFilterPolicy] = useState(filters.policy_id || '');
    const [filterStatus, setFilterStatus] = useState(filters.status || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        policy_id: '',
        date_of_use: '',
        amount: '',
        purpose: '',
    });

    const settleForm = useForm({
        settlement_amount: '',
        settlement_notes: '',
    });

    // Demo data jika tidak ada data dari server
    const demoCashAdvances = cashAdvances.data?.length > 0 ? cashAdvances.data : [
        {
            id: 1,
            request_id: 'CA202605050001',
            request_date: '2026-05-03',
            date_of_use: '2026-05-05',
            employee: { employee_id: '000-003', name: 'Sheila Hartono' },
            policy: { name: 'Perjalanan Dinas' },
            purpose: 'Dinas Bandung',
            amount: 500000,
            status: 'need_settlement'
        },
    ];

    const demoPolicies = policies.length > 0 ? policies : [
        { id: 1, name: 'Perjalanan Dinas' },
        { id: 2, name: 'Training' },
        { id: 3, name: 'Client Meeting' },
    ];

    const demoStats = {
        total_pending: stats.total_pending || 2500000,
        total_need_settlement: stats.total_need_settlement || 500000,
        count_pending: stats.count_pending || 3,
        count_need_settlement: stats.count_need_settlement || 1,
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
        need_settlement: { label: 'Need settlement', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
        settled: { label: 'Settled', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    };

    const handleFilter = () => {
        router.get('/finance/cash-advance', {
            policy_id: filterPolicy || undefined,
            status: filterStatus || undefined,
            search: searchTerm || undefined,
        }, { preserveState: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/finance/cash-advance', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleApprove = (id) => {
        router.post(`/finance/cash-advance/${id}/approve`);
    };

    const handleReject = (id) => {
        if (confirm('Tolak pengajuan cash advance ini?')) {
            router.post(`/finance/cash-advance/${id}/reject`, {
                rejection_reason: 'Ditolak oleh admin',
            });
        }
    };

    const handleSettle = (ca) => {
        setSelectedCa(ca);
        settleForm.setData({
            settlement_amount: ca.amount,
            settlement_notes: '',
        });
        setShowSettleModal(true);
    };

    const submitSettlement = (e) => {
        e.preventDefault();
        settleForm.post(`/finance/cash-advance/${selectedCa.id}/settle`, {
            onSuccess: () => {
                setShowSettleModal(false);
                setSelectedCa(null);
            },
        });
    };

    const handleExport = () => {
        window.location.href = '/finance/cash-advance/export';
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Cash Advance" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Finance</p>
                        <h1 className="text-2xl font-bold text-gray-900">Cash Advance</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.get('/finance/cash-advance/settings')}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Settings
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Request cash advance
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <select
                        value={filterPolicy}
                        onChange={(e) => setFilterPolicy(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-40"
                    >
                        <option value="">All policy</option>
                        {demoPolicies.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-40"
                    >
                        <option value="">All status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="need_settlement">Need settlement</option>
                        <option value="settled">Settled</option>
                    </select>
                    <button
                        onClick={handleFilter}
                        className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Apply
                    </button>
                    <div className="flex-1"></div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                        placeholder="Search"
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg w-48"
                    />
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Request ID <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Request date <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Date of use <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Employee ID <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Employee <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Policy <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Purpose <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                                    Amount <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                    Status <span className="text-gray-400">↕</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demoCashAdvances.map((ca) => {
                                const status = statusConfig[ca.status] || statusConfig.pending;
                                return (
                                    <tr key={ca.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <a href="#" className="text-sm text-blue-600 hover:underline">
                                                {ca.request_id}
                                            </a>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(ca.request_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(ca.date_of_use).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ca.employee?.employee_id}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">{ca.employee?.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ca.policy?.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{ca.purpose}</td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            {formatCurrency(ca.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                                                <span className="text-sm text-gray-700">{status.label}</span>
                                            </div>
                                            {ca.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleApprove(ca.id)}
                                                        className="text-xs text-green-600 hover:underline"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(ca.id)}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {ca.status === 'need_settlement' && (
                                                <button
                                                    onClick={() => handleSettle(ca)}
                                                    className="text-xs text-blue-600 hover:underline mt-2"
                                                >
                                                    Settle
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Show</span>
                        <select className="px-2 py-1 text-sm border border-gray-300 rounded">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                        <span className="text-sm text-gray-500">entries</span>
                    </div>
                    <p className="text-sm text-gray-500">
                        Showing 1 to {demoCashAdvances.length} of {demoCashAdvances.length} entries
                    </p>
                    <div className="flex items-center gap-1">
                        <button className="px-2 py-1 text-sm text-gray-400">|&lt;</button>
                        <button className="px-2 py-1 text-sm text-gray-400">&lt;</button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
                        <button className="px-2 py-1 text-sm text-gray-400">&gt;</button>
                        <button className="px-2 py-1 text-sm text-gray-400">&gt;|</button>
                    </div>
                </div>
            </div>

            {/* Modal Request Cash Advance */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Request Cash Advance</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Policy</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    value={data.policy_id}
                                    onChange={e => setData('policy_id', e.target.value)}
                                >
                                    <option value="">-- Select Policy --</option>
                                    {demoPolicies.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.policy_id && <p className="text-red-500 text-sm mt-1">{errors.policy_id}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Use</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={data.date_of_use}
                                        onChange={e => setData('date_of_use', e.target.value)}
                                    />
                                    {errors.date_of_use && <p className="text-red-500 text-sm mt-1">{errors.date_of_use}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        placeholder="500000"
                                    />
                                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[80px]"
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                    placeholder="e.g. Dinas Bandung - Meeting dengan client"
                                />
                                {errors.purpose && <p className="text-red-500 text-sm mt-1">{errors.purpose}</p>}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        reset();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    disabled={processing}
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Settlement */}
            {showSettleModal && selectedCa && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Settlement</h2>
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Request ID: <span className="font-medium text-gray-900">{selectedCa.request_id}</span></p>
                            <p className="text-sm text-gray-500">Original Amount: <span className="font-medium text-gray-900">{formatCurrency(selectedCa.amount)}</span></p>
                        </div>
                        <form onSubmit={submitSettlement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Amount (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    value={settleForm.data.settlement_amount}
                                    onChange={e => settleForm.setData('settlement_amount', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    value={settleForm.data.settlement_notes}
                                    onChange={e => settleForm.setData('settlement_notes', e.target.value)}
                                    placeholder="Settlement notes (optional)"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowSettleModal(false);
                                        setSelectedCa(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    disabled={settleForm.processing}
                                >
                                    {settleForm.processing ? 'Processing...' : 'Confirm Settlement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
