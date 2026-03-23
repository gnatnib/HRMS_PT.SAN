import { Head, router, Link, usePage } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';

export default function EmployeesTrashed({ employees = {}, flash }) {
    const { auth } = usePage().props;
    const employeeList = employees.data || [];

    const handleRestore = (emp) => {
        if (confirm(`Pulihkan karyawan "${emp.first_name} ${emp.last_name || ''}"?`)) {
            router.post(`/employees/${emp.id}/restore`);
        }
    };

    return (
        <MekariLayout>
            <Head title="Karyawan Terhapus" />

            <div className="space-y-5 px-6 py-6 max-w-7xl mx-auto">
                {flash?.success && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Karyawan Terhapus</h1>
                        <p className="text-sm text-gray-500 mt-1">Daftar karyawan yang telah dihapus (soft delete). Karyawan dapat dipulihkan kembali.</p>
                    </div>
                    <Link
                        href="/employees"
                        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Kembali ke Employees
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="px-4 py-3 text-left text-xs font-medium">ID Karyawan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Nama Lengkap</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Jabatan</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Divisi</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Cabang</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Status Terakhir</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Tanggal Hapus</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employeeList.length > 0 ? (
                                    employeeList.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.employee_code || '-'}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {emp.first_name} {emp.last_name || ''}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.position?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.center?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{emp.department?.name || '-'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    {
                                                        'Aktif': 'bg-green-100 text-green-700',
                                                        'Terminated': 'bg-red-100 text-red-700',
                                                        'Izin': 'bg-amber-100 text-amber-700',
                                                        'Cuti': 'bg-yellow-100 text-yellow-700',
                                                        'Dinas Luar': 'bg-teal-100 text-teal-700',
                                                        'Masa Percobaan': 'bg-blue-100 text-blue-700',
                                                    }[emp.employment_status] || 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {emp.employment_status || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {emp.deleted_at ? new Date(emp.deleted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleRestore(emp)}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Pulihkan
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-500 text-sm">Tidak ada karyawan yang terhapus</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees.links && employees.links.length > 3 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Menampilkan {employees.from || 0} sampai {employees.to || 0} dari {employees.total || 0}
                            </p>
                            <div className="flex gap-1">
                                {employees.links?.map((link, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => link.url && router.get(link.url)}
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
            </div>
        </MekariLayout>
    );
}
