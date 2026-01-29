import { Head, useForm, router, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function EmployeesIndex({ auth, employees = {}, departments = [], stats = {}, filters = {}, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedDept, setSelectedDept] = useState(filters.department || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        mobile_number: '',
        national_number: '',
        gender: 'male',
        address: '',
        contract_id: '',
        max_leave_allowed: 12,
    });

    const demoEmployees = employees.data || [
        { id: 1, first_name: 'Ahmad', last_name: 'Fauzi', mobile_number: '081234567890', contract: { department: { name: 'IT' }, position: { name: 'Software Engineer' } }, is_active: true },
        { id: 2, first_name: 'Siti', last_name: 'Rahayu', mobile_number: '081234567891', contract: { department: { name: 'HR' }, position: { name: 'HR Manager' } }, is_active: true },
        { id: 3, first_name: 'Budi', last_name: 'Santoso', mobile_number: '081234567892', contract: { department: { name: 'Sales' }, position: { name: 'Sales Lead' } }, is_active: false },
    ];

    const demoDepartments = departments.length > 0 ? departments : [
        { id: 1, name: 'IT' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'Sales' },
        { id: 4, name: 'Finance' },
    ];

    const demoStats = {
        total: stats.total || 156,
        active: stats.active || 148,
        inactive: stats.inactive || 8,
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/employees', { search, department: selectedDept }, { preserveState: true });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/employees', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleDelete = (emp) => {
        if (confirm(`Hapus karyawan "${emp.first_name} ${emp.last_name}"?`)) {
            router.delete(`/employees/${emp.id}`);
        }
    };

    const handleExport = () => {
        window.location.href = '/employees-export';
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Employees" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Karyawan</h1>
                        <p className="text-sm text-gray-500">Database karyawan perusahaan</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </button>
                        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Karyawan
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <StatCard icon="👥" title="Total Karyawan" value={demoStats.total} />
                    <StatCard icon="✅" title="Aktif" value={demoStats.active} color="green" />
                    <StatCard icon="⏸️" title="Tidak Aktif" value={demoStats.inactive} color="red" />
                </div>

                {/* Search & Filter */}
                <form onSubmit={handleSearch} className="card">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                className="input"
                                placeholder="Cari nama atau nomor HP..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-48">
                            <select
                                className="input"
                                value={selectedDept}
                                onChange={e => setSelectedDept(e.target.value)}
                            >
                                <option value="">Semua Departemen</option>
                                {demoDepartments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary">
                            Cari
                        </button>
                    </div>
                </form>

                {/* Employee Table */}
                <div className="card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. HP</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demoEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                                {emp.first_name?.[0]}{emp.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.first_name} {emp.last_name}</p>
                                                <p className="text-xs text-gray-500">ID: {emp.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.contract?.department?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.contract?.position?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.mobile_number || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {emp.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <Link
                                                href={`/employees/${emp.id}`}
                                                className="text-primary-600 hover:text-primary-700 text-sm"
                                            >
                                                Detail
                                            </Link>
                                            <Link
                                                href={`/employees/${emp.id}/edit`}
                                                className="text-amber-600 hover:text-amber-700 text-sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(emp)}
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Karyawan Baru</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Nama Depan</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                    />
                                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                                </div>
                                <div>
                                    <label className="label">Nama Belakang</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">No. HP</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.mobile_number}
                                        onChange={e => setData('mobile_number', e.target.value)}
                                        placeholder="08xx..."
                                    />
                                </div>
                                <div>
                                    <label className="label">NIK</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.national_number}
                                        onChange={e => setData('national_number', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Jenis Kelamin</label>
                                <select
                                    className="input"
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                >
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Alamat</label>
                                <textarea
                                    className="input min-h-[60px]"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">Jatah Cuti Tahunan</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={data.max_leave_allowed}
                                    onChange={e => setData('max_leave_allowed', parseInt(e.target.value))}
                                    min="0"
                                    max="30"
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
                                    {processing ? 'Menyimpan...' : 'Simpan'}
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
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
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
