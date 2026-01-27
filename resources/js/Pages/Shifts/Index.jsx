import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function ShiftsIndex({ auth, shifts = [], employees = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
        start_time: '08:00',
        end_time: '17:00',
        break_duration: 60,
        late_tolerance: 15,
        early_leave_tolerance: 15,
        is_overnight: false,
        notes: '',
    });

    const demoShifts = shifts.length > 0 ? shifts : [
        { id: 1, code: 'SHIFT-A', name: 'Shift Pagi', start_time: '08:00', end_time: '17:00', break_duration: 60, late_tolerance: 15, employees_count: 45 },
        { id: 2, code: 'SHIFT-B', name: 'Shift Siang', start_time: '14:00', end_time: '22:00', break_duration: 60, late_tolerance: 15, employees_count: 38 },
        { id: 3, code: 'SHIFT-C', name: 'Shift Malam', start_time: '22:00', end_time: '06:00', break_duration: 60, late_tolerance: 15, employees_count: 12 },
        { id: 4, code: 'FLEX', name: 'Shift Fleksibel', start_time: '09:00', end_time: '18:00', break_duration: 60, late_tolerance: 30, employees_count: 25 },
    ];

    const openCreate = () => {
        setEditingShift(null);
        reset();
        setShowModal(true);
    };

    const openEdit = (shift) => {
        setEditingShift(shift);
        setData({
            name: shift.name,
            code: shift.code,
            start_time: shift.start_time?.substring(0, 5) || shift.start_time,
            end_time: shift.end_time?.substring(0, 5) || shift.end_time,
            break_duration: shift.break_duration,
            late_tolerance: shift.late_tolerance,
            early_leave_tolerance: shift.early_leave_tolerance || 15,
            is_overnight: shift.is_overnight || false,
            notes: shift.notes || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingShift) {
            put(`/shifts/${editingShift.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/shifts', {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (shift) => {
        if (confirm(`Hapus shift "${shift.name}"?`)) {
            router.delete(`/shifts/${shift.id}`);
        }
    };

    const rosterData = [
        { name: 'Ahmad Fauzi', mon: 'Pagi', tue: 'Pagi', wed: 'Pagi', thu: 'Pagi', fri: 'Pagi', sat: 'Libur', sun: 'Libur' },
        { name: 'Siti Rahayu', mon: 'Siang', tue: 'Siang', wed: 'Siang', thu: 'Siang', fri: 'Siang', sat: 'Libur', sun: 'Libur' },
        { name: 'Budi Santoso', mon: 'Malam', tue: 'Malam', wed: 'Malam', thu: 'Malam', fri: 'Malam', sat: 'Libur', sun: 'Libur' },
    ];

    const shiftColors = {
        Pagi: 'bg-blue-100 text-blue-700',
        Siang: 'bg-amber-100 text-amber-700',
        Malam: 'bg-purple-100 text-purple-700',
        Libur: 'bg-gray-100 text-gray-400',
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Shift Management" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                        ✗ {flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
                        <p className="text-sm text-gray-500">Kelola jadwal shift dan rostering karyawan</p>
                    </div>
                    <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Shift
                    </button>
                </div>

                {/* Shift Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                    {demoShifts.map((shift) => (
                        <div key={shift.id} className="card relative">
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 text-xs font-mono bg-primary-100 text-primary-700 rounded">
                                    {shift.code}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-3">{shift.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Jam Kerja</span>
                                    <span className="font-medium">{shift.start_time?.substring(0, 5) || shift.start_time} - {shift.end_time?.substring(0, 5) || shift.end_time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Istirahat</span>
                                    <span className="font-medium">{shift.break_duration} menit</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Toleransi</span>
                                    <span className="font-medium">{shift.late_tolerance} menit</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm text-gray-500">{shift.employees_count || 0} karyawan</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEdit(shift)}
                                        className="text-primary-600 hover:text-primary-700 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(shift)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Roster Calendar */}
                <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-4">📅 Roster Mingguan</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Karyawan</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Sen</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Sel</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Rab</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Kam</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Jum</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Sab</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Min</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rosterData.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                        <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                                            <td key={day} className="px-4 py-3 text-center">
                                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${shiftColors[row[day]]}`}>
                                                    {row[day]}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingShift ? 'Edit Shift' : 'Tambah Shift Baru'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Nama Shift</label>
                                <input
                                    type="text"
                                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Shift Pagi"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="label">Kode</label>
                                <input
                                    type="text"
                                    className={`input ${errors.code ? 'border-red-500' : ''}`}
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g. SHIFT-A"
                                />
                                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Istirahat (menit)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={data.break_duration}
                                        onChange={e => setData('break_duration', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="label">Toleransi Terlambat (menit)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={data.late_tolerance}
                                        onChange={e => setData('late_tolerance', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Toleransi Pulang Cepat (menit)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={data.early_leave_tolerance}
                                        onChange={e => setData('early_leave_tolerance', parseInt(e.target.value))}
                                    />
                                </div>
                                <div></div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        checked={data.is_overnight}
                                        onChange={e => setData('is_overnight', e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700">Shift melewati tengah malam (overnight)</span>
                                </label>
                            </div>
                            <div>
                                <label className="label">Catatan (opsional)</label>
                                <textarea
                                    className="input"
                                    rows="3"
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Catatan tambahan untuk shift ini..."
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
        </Layout>
    );
}
