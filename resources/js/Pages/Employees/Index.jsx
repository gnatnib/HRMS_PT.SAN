import { Head, router, Link, usePage } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, useEffect } from 'react';

export default function EmployeesIndex({ employees = {}, departments = [], centers = [], stats = {}, filters = {}, flash }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [branch, setBranch] = useState(filters.branch || '');
    const [division, setDivision] = useState(filters.division || '');
    const [perPage, setPerPage] = useState(filters.per_page || 20);
    const [selectedIds, setSelectedIds] = useState([]);

    const employeeList = employees.data || [];

    const employeeStats = {
        total: stats.total || 0,
        active: stats.active || 0,
        terminated: stats.terminated || 0,
        permission: stats.permission || 0,
        probation: stats.probation || 0,
        on_leave: stats.on_leave || 0,
        business_trip: stats.business_trip || 0,
    };

    const hasActiveFilters = status || branch || division;

    // Checkbox logic
    const allSelected = employeeList.length > 0 && employeeList.every(emp => selectedIds.includes(emp.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(employeeList.map(emp => emp.id));
        }
    };
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    // Name color based on status
    const getEmployeeNameColor = (emp) => {
        if (emp.employment_status === 'Terminated') return 'text-red-600 hover:text-red-800';
        if (emp.employment_status === 'Masa Percobaan') return 'text-blue-600 hover:text-blue-800';
        if (emp.employment_status === 'Dinas Luar') return 'text-teal-600 hover:text-teal-800';
        if (emp.employment_status === 'Izin') return 'text-amber-600 hover:text-amber-800';
        if (emp.employment_status === 'Cuti') return 'text-yellow-600 hover:text-yellow-800';
        return 'text-green-600 hover:text-green-800';
    };

    const applyFilters = (overrides = {}) => {
        const params = {
            search: overrides.search ?? search,
            status: overrides.status ?? status,
            branch: overrides.branch ?? branch,
            division: overrides.division ?? division,
            per_page: overrides.per_page ?? perPage,
        };
        // Remove empty params
        Object.keys(params).forEach(key => { if (!params[key]) delete params[key]; });
        router.get('/employees', params, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search });
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleDelete = (emp) => {
        if (confirm(`Hapus karyawan "${emp.first_name} ${emp.last_name}"?`)) {
            router.delete(`/employees/${emp.id}`);
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Hapus ${selectedIds.length} karyawan yang dipilih? Aksi ini tidak dapat dibatalkan.`)) {
            router.post('/employees-bulk-delete', { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        if (branch) params.set('branch', branch);
        if (division) params.set('division', division);
        const queryString = params.toString();
        window.location.href = '/employees-export' + (queryString ? '?' + queryString : '');
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setBranch('');
        setDivision('');
        router.get('/employees', {}, { preserveState: true });
    };

    return (
        <MekariLayout>
            <Head title="Employees" />

            <div className="space-y-5 px-6 py-6 max-w-7xl mx-auto">
                {flash?.success && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Header Banner */}
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
                        <div className="absolute right-20 -bottom-10 w-24 h-24 bg-white/5 rounded-full" />
                    </div>
                    <div className="relative px-8 py-6">
                        <h1 className="text-2xl font-semibold text-white mb-1">Employees</h1>
                        <p className="text-slate-400 text-sm">PT. SINERGI ASTA NUSANTARA</p>
                    </div>
                </div>

                {/* Stats Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Statistik Employee</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{employeeStats.total} Total</span>
                    </div>
                    {(() => {
                        const total = employeeStats.total || 1;
                        const segments = [
                            { label: 'Aktif', count: employeeStats.active, color: 'bg-green-500', textColor: 'text-green-600', dotColor: 'bg-green-500' },
                            { label: 'Terminated', count: employeeStats.terminated, color: 'bg-red-500', textColor: 'text-red-600', dotColor: 'bg-red-500' },
                            { label: 'Izin', count: employeeStats.permission, color: 'bg-amber-500', textColor: 'text-amber-600', dotColor: 'bg-amber-500' },
                            { label: 'Cuti', count: employeeStats.on_leave, color: 'bg-yellow-400', textColor: 'text-yellow-600', dotColor: 'bg-yellow-400' },
                            { label: 'Masa Percobaan', count: employeeStats.probation, color: 'bg-blue-500', textColor: 'text-blue-600', dotColor: 'bg-blue-500' },
                            { label: 'Dinas Luar', count: employeeStats.business_trip, color: 'bg-teal-500', textColor: 'text-teal-600', dotColor: 'bg-teal-500' },
                        ];
                        return (
                            <>
                                {/* Stacked horizontal bar */}
                                <div className="flex h-4 rounded-full overflow-hidden bg-gray-100 mb-4">
                                    {segments.map((seg) => (
                                        seg.count > 0 && (
                                            <div
                                                key={seg.label}
                                                className={`${seg.color} transition-all duration-500 ease-out relative group`}
                                                style={{ width: `${(seg.count / total) * 100}%`, minWidth: seg.count > 0 ? '8px' : '0' }}
                                                title={`${seg.label}: ${seg.count}`}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    {seg.label}: {seg.count}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                                {/* Legend */}
                                <div className="flex flex-wrap gap-x-5 gap-y-2">
                                    {segments.map((seg) => (
                                        <div key={seg.label} className="flex items-center gap-1.5">
                                            <span className={`w-2.5 h-2.5 rounded-full ${seg.dotColor}`} />
                                            <span className="text-xs text-gray-600">{seg.label}</span>
                                            <span className={`text-xs font-bold ${seg.textColor}`}>{seg.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    <Link
                        href="/employees/create"
                        className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">ADD EMPLOYEE</span>
                    </Link>
                    <Link
                        href="/employees-bulk-add"
                        className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2 group-hover:bg-purple-100 transition-colors">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">BULK ADD EMPLOYEE</span>
                    </Link>
                    <button
                        onClick={handleExport}
                        className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-2 group-hover:bg-green-100 transition-colors">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">
                            EXPORT CSV {hasActiveFilters ? '(FILTER)' : 'ALL'}
                        </span>
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">Filter</span>
                            {hasActiveFilters && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Aktif</span>
                            )}
                        </div>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                                Hapus semua
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Status</label>
                            <select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="terminated">Terminated</option>
                                <option value="permission">Izin</option>
                                <option value="probation">Masa Percobaan</option>
                                <option value="on_leave">Cuti</option>
                                <option value="business_trip">Dinas Luar</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Cabang</label>
                            <select
                                value={branch}
                                onChange={(e) => { setBranch(e.target.value); applyFilters({ branch: e.target.value }); }}
                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Semua Cabang</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Divisi</label>
                            <select
                                value={division}
                                onChange={(e) => { setDivision(e.target.value); applyFilters({ division: e.target.value }); }}
                                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">Semua Divisi</option>
                                {centers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Cari</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 pr-8 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Nama, ID, atau email..."
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-red-700">{selectedIds.length} karyawan dipilih</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-1.5 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus Terpilih
                            </button>
                        </div>
                    </div>
                )}

                {/* Employee Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="px-4 py-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Foto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Nama Lengkap</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">ID Karyawan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Divisi</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Jabatan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Cabang</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employeeList.length > 0 ? (
                                    employeeList.map((emp) => (
                                        <tr key={emp.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(emp.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(emp.id)}
                                                    onChange={() => toggleSelect(emp.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {emp.profile_photo_path ? (
                                                        <img
                                                            src={`/storage/${emp.profile_photo_path}`}
                                                            alt={emp.first_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = `<span class="text-sm font-medium text-gray-400">${emp.first_name?.charAt(0) || '?'}</span>`;
                                                            }}
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-medium text-gray-400">
                                                            {emp.first_name?.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/employees/${emp.id}`}
                                                    className={`${getEmployeeNameColor(emp)} font-medium text-sm`}
                                                >
                                                    {emp.first_name} {emp.last_name || ''}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.employee_code || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.center?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.position?.name
                                                    ? `${emp.position.name}${emp.center?.name ? ` (${emp.center.name})` : ''}`
                                                    : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {emp.department?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link
                                                        href={`/employees/${emp.id}`}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Lihat"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <Link
                                                        href={`/employees/${emp.id}?editing=1`}
                                                        className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(emp)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-gray-500 text-sm mb-1">Belum ada data karyawan</p>
                                                 <Link href="/employees/create" className="text-blue-600 text-sm hover:underline">Tambah employee →</Link>
                                             </div>
                                         </td>
                                     </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination + Per-page selector */}
                    {employees.links && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-500">
                                    Menampilkan {employees.from || 0} sampai {employees.to || 0} dari {employees.total || 0}
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <label className="text-xs text-gray-500">Per halaman:</label>
                                    <select
                                        value={perPage}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setPerPage(val);
                                            applyFilters({ per_page: val });
                                        }}
                                        className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-gray-50 focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {employees.links?.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url, { search, status, branch, division, per_page: perPage })}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${link.active
                                            ? 'bg-slate-900 text-white'
                                            : link.url
                                                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                {hasActiveFilters && (
                    <p className="text-xs text-gray-400 text-center">
                        Statistik di atas menyesuaikan filter yang aktif
                    </p>
                )}
            </div>
        </MekariLayout>
    );
}
