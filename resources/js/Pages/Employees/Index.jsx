import { Head, useForm, router, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function EmployeesIndex({ auth, employees = {}, departments = [], centers = [], stats = {}, filters = {}, flash }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [branch, setBranch] = useState(filters.branch || '');
    const [showing, setShowing] = useState(10);

    const employeeList = employees.data || [];

    const demoStats = {
        total: stats.total || 0,
        active: stats.active || 0,
        inactive: stats.inactive || 0,
    };

    const handleSearch = () => {
        router.get('/employees', { search, status, branch }, { preserveState: true });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleDelete = (emp) => {
        if (confirm(`Hapus karyawan "${emp.first_name} ${emp.last_name}"?`)) {
            router.delete(`/employees/${emp.id}`);
        }
    };

    const handleExport = () => {
        window.location.href = '/employees-export';
    };

    // Quick action buttons configuration
    const quickActions = [
        { icon: '➕', label: 'ADD EMPLOYEE', href: '/employees/create' },
        { icon: '📋', label: 'BULK ADD\nEMPLOYEE', href: '#' },
        { icon: '📝', label: 'UPDATE EMPLOYEE\nDATA', href: '#' },
        { icon: '📥', label: 'IMPORT CUSTOM\nFIELD DATA', href: '#' },
        { icon: '🔄', label: 'EMPLOYEE\nTRANSFER HISTORY', href: '#' },
        { icon: '📊', label: 'IMPORT & EXPORT\nPRORATE', href: '#' },
    ];

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Employees" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Mekari-style Header Banner */}
                <div className="relative bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="relative p-8">
                        <h1 className="text-3xl font-light text-white mb-1">Employees</h1>
                        <p className="text-gray-300 text-sm">PT. SINERGI ASTA NUSANTARA</p>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="widget-card">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
                            >
                                <span className="text-2xl mb-2">{action.icon}</span>
                                <span className="text-xs text-center text-gray-600 group-hover:text-red-600 whitespace-pre-line">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    router.get('/employees', { search, status: e.target.value, branch }, { preserveState: true });
                                }}
                                className="form-input min-w-[150px]"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Select Branch</label>
                            <select
                                value={branch}
                                onChange={(e) => {
                                    setBranch(e.target.value);
                                    router.get('/employees', { search, status, branch: e.target.value }, { preserveState: true });
                                }}
                                className="form-input min-w-[180px]"
                            >
                                <option value="">All Branch</option>
                                {centers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleExport} className="btn-secondary flex items-center gap-2 text-sm">
                            <span>🔍</span> EXPORT EMPLOYEE LIST
                        </button>
                        <button className="btn-secondary flex items-center gap-2 text-sm">
                            <span>➕</span> EMPLOYEE TRANSFER
                        </button>
                        <button className="btn-secondary flex items-center gap-2 text-sm">
                            <span>🗑️</span> DELETE
                        </button>
                        <button className="btn-secondary flex items-center gap-2 text-sm">
                            <span>📊</span> COLUMN SEARCH
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Showing</span>
                            <select
                                value={showing}
                                onChange={(e) => setShowing(e.target.value)}
                                className="form-input w-16 text-sm"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 mr-2">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="form-input w-48"
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                </div>

                {/* Employee Table */}
                <div className="widget-card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th className="px-4 py-3 text-left">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Photo</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Full Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Employee ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Barcode</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Job Position</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Job Level</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {employeeList.length > 0 ? (
                                    employeeList.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" className="rounded" />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 text-xs">👤</span>
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                                        {emp.profile_photo_path ? (
                                                            <img
                                                                src={`/storage/${emp.profile_photo_path}`}
                                                                alt={emp.first_name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-400">
                                                                {emp.first_name?.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/employees/${emp.id}`}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    {emp.first_name} {emp.last_name || ''}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.employee_code || `EMP-${String(emp.id).padStart(4, '0')}`}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.barcode || `AII${emp.id}`}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.contract?.department?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.contract?.position?.name || emp.contract?.name || 'Staff'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.contract?.name || 'Staff'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/employees/${emp.id}`}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View"
                                                    >
                                                        👁️
                                                    </Link>
                                                    <Link
                                                        href={`/employees/${emp.id}/edit`}
                                                        className="text-yellow-600 hover:text-yellow-800"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(emp)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                            No employees found. <Link href="/employees/create" className="text-red-600 hover:underline">Add one now</Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees.links && (
                        <div className="flex items-center justify-between px-4 py-3 border-t">
                            <p className="text-sm text-gray-500">
                                Showing {employees.from || 0} to {employees.to || 0} of {employees.total || 0} entries
                            </p>
                            <div className="flex gap-1">
                                {employees.links?.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded ${link.active
                                                ? 'bg-red-600 text-white'
                                                : link.url
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="widget-card text-center">
                        <p className="text-3xl font-bold text-gray-900">{demoStats.total}</p>
                        <p className="text-sm text-gray-500">Total Employees</p>
                    </div>
                    <div className="widget-card text-center">
                        <p className="text-3xl font-bold text-green-600">{demoStats.active}</p>
                        <p className="text-sm text-gray-500">Active</p>
                    </div>
                    <div className="widget-card text-center">
                        <p className="text-3xl font-bold text-red-600">{demoStats.inactive}</p>
                        <p className="text-sm text-gray-500">Inactive</p>
                    </div>
                </div>
            </div>
        </MekariLayout>
    );
}
