import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

/**
 * Halaman Settings Reimbursement sesuai dengan UI reference Mekari.
 * Menampilkan daftar jenis reimbursement dengan limit dan validity period.
 */
export default function ReimbursementSettings({ auth, types = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [showPerPage, setShowPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        is_unlimited: false,
        limit_amount: '',
        expired_type: 'date',
        expired_at: '',
        expired_months: '',
        effective_date: new Date().toISOString().split('T')[0],
        requires_receipt: true,
    });

    // Demo data jika tidak ada data dari server
    const demoTypes = types.length > 0 ? types : [
        { id: 1, name: 'Klaim Transportasi', limit: '1000000', expired: '01 January', effective_date: '2019-01-01', is_active: true },
        { id: 2, name: 'Medical Reimbursement', limit: '10000000', expired: '12 month(s)', effective_date: '2020-01-01', is_active: true },
        { id: 3, name: 'Entertainment', limit: 'UNLIMITED', expired: 'UNLIMITED', effective_date: '2020-01-01', is_active: true },
    ];

    // Filter berdasarkan search
    const filteredTypes = demoTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        if (amount === 'UNLIMITED' || !amount) return 'UNLIMITED';
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingType) {
            put(`/finance/reimbursement/types/${editingType.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    setEditingType(null);
                    reset();
                },
            });
        } else {
            post('/finance/reimbursement/types', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setData({
            name: type.name,
            code: type.code || '',
            is_unlimited: type.is_unlimited || false,
            limit_amount: type.limit_amount || '',
            expired_type: type.expired_type || 'date',
            expired_at: type.expired_at || '',
            expired_months: type.expired_months || '',
            effective_date: type.effective_date,
            requires_receipt: type.requires_receipt ?? true,
        });
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (confirm('Hapus jenis reimbursement ini?')) {
            router.delete(`/finance/reimbursement/types/${id}`);
        }
    };

    const handleExport = () => {
        window.location.href = '/finance/reimbursement/export';
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Reimbursement" />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-light text-white mb-1">Reimbursement</h1>
                    <p className="text-gray-300 text-sm font-medium">PT. SAN CREATIVE</p>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                </div>
            </div>

            {flash?.success && (
                <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg mb-6">
                    ✓ {flash.success}
                </div>
            )}

            {/* Action Buttons Section */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Left Side - Assign/Update/Request */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        ASSIGN/UPDATE/REQUEST REIMBURSEMENT
                    </h3>
                    <div className="flex gap-2 mb-6">
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            ASSIGN OR UPDATE
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            REQUEST
                        </button>
                    </div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        CREATE OR VIEW SETTING REIMBURSEMENT
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditingType(null);
                                reset();
                                setShowModal(true);
                            }}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            NEW
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            VIEW SETTING
                        </button>
                    </div>
                </div>

                {/* Right Side - Excel Import/Export */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        UPDATE REIMBURSEMENT BALANCE VIA EXCEL
                    </h3>
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                        >
                            EXPORT
                        </button>
                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                            IMPORT
                        </button>
                    </div>

                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                        REIMBURSEMENT SIMULATION
                    </button>
                </div>
            </div>

            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Showing</span>
                    <select
                        value={showPerPage}
                        onChange={(e) => setShowPerPage(Number(e.target.value))}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Search</span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg w-48"
                    />
                </div>
            </div>

            {/* Reimbursement Types Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-600 uppercase">No</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-600 uppercase">Reimbursement Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-orange-500 uppercase">Reimbursement Limit</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-600 uppercase">Expired In</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-600 uppercase">Effective Date</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-blue-600 uppercase">
                                <svg className="w-4 h-4 mx-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredTypes.slice(0, showPerPage).map((type, index) => (
                            <tr key={type.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{type.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(type.limit)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{type.expired}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{type.effective_date}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="p-1 text-red-500 hover:text-red-600"
                                            title="View"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => handleDelete(type.id)}
                                            className="p-1 text-red-500 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button className="p-1 text-red-500 hover:text-red-600" title="Detail">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button className="p-1 text-red-500 hover:text-red-600" title="Download">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                    Showing 1 to {Math.min(showPerPage, filteredTypes.length)} of {filteredTypes.length} entries
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm text-gray-400">&lt;</button>
                    <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg">1</button>
                    <button className="px-3 py-1 text-sm text-gray-400">&gt;</button>
                </div>
                <button className="px-4 py-1.5 text-sm bg-gray-500 text-white rounded-lg">
                    GO
                </button>
            </div>

            {/* Modal New/Edit Reimbursement Type */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingType ? 'Edit Reimbursement Type' : 'New Reimbursement Type'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g. Medical Reimbursement"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase())}
                                        placeholder="e.g. MED"
                                        disabled={!!editingType}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary-600 rounded"
                                        checked={data.is_unlimited}
                                        onChange={e => setData('is_unlimited', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700">Unlimited Limit</span>
                                </label>
                            </div>

                            {!data.is_unlimited && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reimbursement Limit (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={data.limit_amount}
                                        onChange={e => setData('limit_amount', e.target.value)}
                                        placeholder="e.g. 10000000"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expired Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        value={data.expired_type}
                                        onChange={e => setData('expired_type', e.target.value)}
                                    >
                                        <option value="date">Specific Date</option>
                                        <option value="months">Validity Period (Months)</option>
                                    </select>
                                </div>
                                {data.expired_type === 'date' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expired Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            value={data.expired_at}
                                            onChange={e => setData('expired_at', e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Months)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            value={data.expired_months}
                                            onChange={e => setData('expired_months', e.target.value)}
                                            placeholder="e.g. 12"
                                            min="1"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    value={data.effective_date}
                                    onChange={e => setData('effective_date', e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingType(null);
                                        reset();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
