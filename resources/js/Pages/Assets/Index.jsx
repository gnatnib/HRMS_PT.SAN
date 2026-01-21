import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function AssetsIndex({ auth, assets = [], employees = [], stats = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'Laptop',
        serial_number: '',
        employee_id: '',
        department: '',
        description: '',
    });

    const demoAssets = assets.length > 0 ? assets : [
        { id: 1, name: 'MacBook Pro 14"', type: 'Laptop', serial: 'MBP-2024-001', assignee: 'Ahmad Fauzi', department: 'IT', status: 'in_use', handover: '2024-01-15' },
        { id: 2, name: 'Dell Monitor 27"', type: 'Monitor', serial: 'DELL-2024-015', assignee: 'Siti Rahayu', department: 'HR', status: 'in_use', handover: '2024-01-10' },
        { id: 3, name: 'Toyota Avanza', type: 'Kendaraan', serial: 'B 1234 XYZ', assignee: null, department: 'Operations', status: 'available', handover: null },
        { id: 4, name: 'iPhone 15 Pro', type: 'Handphone', serial: 'IP15-2024-003', assignee: 'Budi Santoso', department: 'Sales', status: 'in_use', handover: '2024-01-05' },
        { id: 5, name: 'Printer HP LaserJet', type: 'Printer', serial: 'HP-LJ-001', assignee: null, department: 'Shared', status: 'maintenance', handover: null },
    ];

    const demoStats = {
        total: stats.total || 245,
        in_use: stats.in_use || 198,
        available: stats.available || 35,
        maintenance: stats.maintenance || 12,
    };

    const demoEmployees = employees.length > 0 ? employees : [
        { id: 1, first_name: 'Ahmad', last_name: 'Fauzi' },
        { id: 2, first_name: 'Siti', last_name: 'Rahayu' },
        { id: 3, first_name: 'Budi', last_name: 'Santoso' },
    ];

    const assetTypes = {
        Laptop: { icon: '💻', color: 'bg-blue-100 text-blue-700' },
        Monitor: { icon: '🖥️', color: 'bg-purple-100 text-purple-700' },
        Kendaraan: { icon: '🚗', color: 'bg-green-100 text-green-700' },
        Handphone: { icon: '📱', color: 'bg-amber-100 text-amber-700' },
        Printer: { icon: '🖨️', color: 'bg-gray-100 text-gray-700' },
    };

    const statusStyles = {
        in_use: 'bg-green-100 text-green-700',
        available: 'bg-blue-100 text-blue-700',
        maintenance: 'bg-amber-100 text-amber-700',
    };

    const openCreate = () => {
        setEditingAsset(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (asset) => {
        setEditingAsset(asset);
        setData({
            name: asset.name,
            type: asset.type,
            serial_number: asset.serial,
            employee_id: '',
            department: asset.department,
            description: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAsset) {
            put(`/assets/${editingAsset.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/assets', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (asset) => {
        if (confirm(`Hapus aset "${asset.name}"?`)) {
            router.delete(`/assets/${asset.id}`);
        }
    };

    const handleUnassign = (asset) => {
        if (confirm(`Kembalikan aset "${asset.name}" ke pool?`)) {
            router.post(`/assets/${asset.id}/unassign`);
        }
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Asset Management" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
                        <p className="text-sm text-gray-500">Tracking aset perusahaan dan serah terima</p>
                    </div>
                    <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Aset
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard icon="📦" title="Total Aset" value={demoStats.total} />
                    <StatCard icon="✅" title="Digunakan" value={demoStats.in_use} color="green" />
                    <StatCard icon="📋" title="Available" value={demoStats.available} color="blue" />
                    <StatCard icon="🔧" title="Maintenance" value={demoStats.maintenance} color="amber" />
                </div>

                {/* Asset Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aset</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Serah</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demoAssets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${assetTypes[asset.type]?.color || 'bg-gray-100'}`}>
                                                {assetTypes[asset.type]?.icon || '📦'}
                                            </span>
                                            <div>
                                                <p className="font-medium text-gray-900">{asset.name}</p>
                                                <p className="text-sm text-gray-500">{asset.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{asset.serial}</td>
                                    <td className="px-6 py-4">
                                        {asset.assignee ? (
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{asset.assignee}</p>
                                                <p className="text-xs text-gray-500">{asset.department}</p>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {asset.handover || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[asset.status]}`}>
                                            {asset.status === 'in_use' ? 'Digunakan' : asset.status === 'available' ? 'Available' : 'Maintenance'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => openEdit(asset)}
                                                className="text-primary-600 hover:text-primary-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            {asset.assignee && (
                                                <button
                                                    onClick={() => handleUnassign(asset)}
                                                    className="text-amber-600 hover:text-amber-700 text-sm"
                                                >
                                                    Return
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(asset)}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </div>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Nama Aset</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. MacBook Pro 14"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tipe</label>
                                    <select
                                        className="input"
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        <option>Laptop</option>
                                        <option>Monitor</option>
                                        <option>Handphone</option>
                                        <option>Kendaraan</option>
                                        <option>Printer</option>
                                        <option>Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Serial Number</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.serial_number}
                                        onChange={e => setData('serial_number', e.target.value)}
                                        placeholder="S/N"
                                    />
                                    {errors.serial_number && <p className="text-red-500 text-sm mt-1">{errors.serial_number}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="label">Assign ke Karyawan (opsional)</label>
                                <select
                                    className="input"
                                    value={data.employee_id}
                                    onChange={e => setData('employee_id', e.target.value)}
                                >
                                    <option value="">-- Pilih Karyawan --</option>
                                    {demoEmployees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name}
                                        </option>
                                    ))}
                                </select>
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
                                    {processing ? 'Menyimpan...' : 'Simpan'}
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
        gray: 'bg-gray-100',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
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
