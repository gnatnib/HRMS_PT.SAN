import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function UsersIndex({ auth, users = [], roles = [], availableEmployees = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        username: '',
        password: '',
        password_confirmation: '',
        role: 'admin',
        employee_id: '',
        is_active: true,
    });

    const bulkForm = useForm({
        employee_ids: [],
        role: 'admin',
        default_password: '',
    });

    const openCreate = () => {
        reset();
        setEditingUser(null);
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            username: user.username || '',
            password: '',
            password_confirmation: '',
            role: user.role || 'admin',
            employee_id: user.employee_id || '',
            is_active: user.is_active ?? true,
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(`/users/${editingUser.id}`, {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else {
            post('/users', {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    };

    const handleDelete = (user) => {
        if (confirm(`Hapus user "${user.name}"? Aksi ini tidak dapat dibatalkan.`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const handleToggleActive = (user) => {
        router.put(`/users/${user.id}`, {
            name: user.name,
            email: user.email,
            username: user.username || '',
            role: user.role,
            employee_id: user.employee_id || '',
            is_active: !user.is_active,
        }, { preserveScroll: true });
    };

    const handleBulkSubmit = (e) => {
        e.preventDefault();
        bulkForm.post('/users-bulk-from-employees', {
            onSuccess: () => {
                setShowBulkModal(false);
                bulkForm.reset();
            },
        });
    };

    const toggleBulkEmployee = (empId) => {
        const current = bulkForm.data.employee_ids;
        if (current.includes(empId)) {
            bulkForm.setData('employee_ids', current.filter(id => id !== empId));
        } else {
            bulkForm.setData('employee_ids', [...current, empId]);
        }
    };

    const getRoleBadge = (role) => {
        const styles = {
            direktur_utama: 'bg-purple-100 text-purple-700',
            superadmin: 'bg-blue-100 text-blue-700',
            admin: 'bg-green-100 text-green-700',
        };
        const labels = {
            direktur_utama: 'Direktur Utama',
            superadmin: 'Superadmin',
            admin: 'Admin',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
                {labels[role] || role}
            </span>
        );
    };

    const filteredUsers = users.filter(u =>
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MekariLayout user={auth?.user}>
            <Head title="User Management" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Kelola akun pengguna HRMS ({users.length} user)</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {availableEmployees.length > 0 && (
                            <button
                                onClick={() => setShowBulkModal(true)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Bulk Create dari Employee
                            </button>
                        )}
                        <button
                            onClick={openCreate}
                            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah User
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cari nama, email, atau username..."
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>

                {/* Users Table */}
                <div className="widget-card overflow-hidden">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left">Username</th>
                                <th className="px-4 py-3 text-left">Role</th>
                                <th className="px-4 py-3 text-left">Linked Employee</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-left">Last Activity</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3 text-gray-600">{user.username || '-'}</td>
                                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">
                                        {user.employee_name ? (
                                            <span className="inline-flex items-center gap-1 text-blue-600">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                {user.employee_name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleToggleActive(user)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                            title={user.is_active ? 'Aktif - klik untuk nonaktifkan' : 'Nonaktif - klik untuk aktifkan'}
                                        >
                                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {user.last_activity || user.last_login || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(user)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-gray-400">
                                        {searchQuery ? 'Tidak ada user yang cocok' : 'Belum ada user'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingUser ? 'Edit User' : 'Tambah User Baru'}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="form-input w-full"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="form-input w-full"
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    className="form-input w-full"
                                />
                                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="form-input w-full"
                                >
                                    <option value="direktur_utama">Direktur Utama</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="admin">Admin</option>
                                </select>
                                {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link ke Employee</label>
                                <select
                                    value={data.employee_id}
                                    onChange={(e) => setData('employee_id', e.target.value)}
                                    className="form-input w-full"
                                >
                                    <option value="">-- Tidak terhubung --</option>
                                    {availableEmployees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                    {editingUser?.employee_id && editingUser?.employee_name && (
                                        <option value={editingUser.employee_id}>{editingUser.employee_name} (current)</option>
                                    )}
                                </select>
                                {errors.employee_id && <p className="text-sm text-red-600 mt-1">{errors.employee_id}</p>}
                            </div>

                            {editingUser && (
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-700">Status Aktif</label>
                                    <button
                                        type="button"
                                        onClick={() => setData('is_active', !data.is_active)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${data.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${data.is_active ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                    </button>
                                    <span className={`text-xs font-medium ${data.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                                        {data.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingUser && <span className="text-gray-400">(kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="form-input w-full"
                                    required={!editingUser}
                                />
                                <p className="text-xs text-gray-400 mt-1">Min. 8 karakter, huruf besar & kecil, dan angka</p>
                                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="form-input w-full"
                                    required={!editingUser}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : (editingUser ? 'Update' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Create Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Bulk Create User dari Employee</h3>
                            <p className="text-sm text-gray-500 mt-1">Pilih employee yang belum memiliki akun user</p>
                        </div>

                        <form onSubmit={handleBulkSubmit} className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role untuk semua user</label>
                                <select
                                    value={bulkForm.data.role}
                                    onChange={(e) => bulkForm.setData('role', e.target.value)}
                                    className="form-input w-full"
                                >
                                    <option value="direktur_utama">Direktur Utama</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Default Password</label>
                                <input
                                    type="password"
                                    value={bulkForm.data.default_password}
                                    onChange={(e) => bulkForm.setData('default_password', e.target.value)}
                                    className="form-input w-full"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Min. 8 karakter, huruf besar & kecil, dan angka</p>
                                {bulkForm.errors.default_password && <p className="text-sm text-red-600 mt-1">{bulkForm.errors.default_password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Employee ({bulkForm.data.employee_ids.length} dipilih)
                                </label>
                                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                    {availableEmployees.map((emp) => (
                                        <label key={emp.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={bulkForm.data.employee_ids.includes(emp.id)}
                                                onChange={() => toggleBulkEmployee(emp.id)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{emp.name}</span>
                                        </label>
                                    ))}
                                    {availableEmployees.length === 0 && (
                                        <p className="px-3 py-4 text-center text-gray-400 text-sm">Semua employee sudah memiliki akun user</p>
                                    )}
                                </div>
                                {bulkForm.errors.employee_ids && <p className="text-sm text-red-600 mt-1">{bulkForm.errors.employee_ids}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => { setShowBulkModal(false); bulkForm.reset(); }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={bulkForm.processing || bulkForm.data.employee_ids.length === 0}
                                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                                >
                                    {bulkForm.processing ? 'Membuat...' : `Buat ${bulkForm.data.employee_ids.length} User`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
