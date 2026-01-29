import { Head, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState, useEffect } from 'react';

export default function OnboardingIndex({ auth, newHires: initialNewHires = [], offboardings: initialOffboardings = [] }) {
    const [newHires, setNewHires] = useState(initialNewHires);
    const [offboardings, setOffboardings] = useState(initialOffboardings);
    const [processing, setProcessing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('onboarding'); // 'onboarding' or 'offboarding'
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        department: '',
        date: '',
    });
    const [errors, setErrors] = useState({});

    // Sync local state with props when they change
    useEffect(() => {
        setNewHires(initialNewHires);
    }, [initialNewHires]);

    useEffect(() => {
        setOffboardings(initialOffboardings);
    }, [initialOffboardings]);

    // Calculate completion rate dynamically
    const calculateCompletionRate = () => {
        const allChecklists = [
            ...newHires.flatMap(h => h.checklist || []),
            ...offboardings.flatMap(o => o.checklist || [])
        ];
        if (allChecklists.length === 0) return 0;
        const completed = allChecklists.filter(item => item.done).length;
        return Math.round((completed / allChecklists.length) * 100);
    };

    const handleChecklistChange = (employeeId, itemIndex, done, type) => {
        setProcessing(true);
        
        router.post('/recruitment/checklist', {
            employee_id: employeeId,
            item_index: itemIndex,
            done: done,
            type: type,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Update local state
                if (type === 'onboarding') {
                    setNewHires(prev => prev.map(hire => {
                        if (hire.id === employeeId) {
                            const newChecklist = hire.checklist.map((item, idx) => 
                                idx === itemIndex ? { ...item, done } : item
                            );
                            const doneCount = newChecklist.filter(i => i.done).length;
                            const progress = Math.round((doneCount / newChecklist.length) * 100);
                            return { ...hire, checklist: newChecklist, progress };
                        }
                        return hire;
                    }));
                } else {
                    setOffboardings(prev => prev.map(emp => {
                        if (emp.id === employeeId) {
                            const newChecklist = emp.checklist.map((item, idx) => 
                                idx === itemIndex ? { ...item, done } : item
                            );
                            const doneCount = newChecklist.filter(i => i.done).length;
                            const progress = Math.round((doneCount / newChecklist.length) * 100);
                            return { ...emp, checklist: newChecklist, progress };
                        }
                        return emp;
                    }));
                }
                setProcessing(false);
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };

    const openModal = (type) => {
        setModalType(type);
        setFormData({
            name: '',
            position: '',
            department: '',
            date: '',
        });
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({
            name: '',
            position: '',
            department: '',
            date: '',
        });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/recruitment/onboarding/store', {
            ...formData,
            type: modalType,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                setProcessing(false);
                // Full page visit to get fresh data
                router.visit('/recruitment/onboarding', { preserveScroll: true });
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Onboarding / Offboarding" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Onboarding & Offboarding</h1>
                        <p className="text-sm text-gray-500">Kelola checklist karyawan baru dan yang akan resign</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => openModal('onboarding')}
                            className="btn-primary"
                        >
                            + New Onboarding
                        </button>
                        <button 
                            onClick={() => openModal('offboarding')}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            + New Offboarding
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">👋</span>
                        <div>
                            <p className="text-sm text-gray-500">Onboarding</p>
                            <p className="text-2xl font-bold text-gray-900">{newHires.length}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-2xl">📤</span>
                        <div>
                            <p className="text-sm text-gray-500">Offboarding</p>
                            <p className="text-2xl font-bold text-gray-900">{offboardings.length}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">📋</span>
                        <div>
                            <p className="text-sm text-gray-500">Completion Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{calculateCompletionRate()}%</p>
                        </div>
                    </div>
                </div>

                {/* Onboarding Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-green-500">●</span> Onboarding Karyawan Baru
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {newHires.length === 0 ? (
                            <div className="card col-span-2 text-center text-gray-500 py-8">
                                Tidak ada karyawan baru dalam proses onboarding
                            </div>
                        ) : (
                            newHires.map((hire) => (
                                <div key={hire.id} className="card">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {hire.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{hire.name}</h3>
                                                <p className="text-sm text-gray-500">{hire.position} • {hire.department}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-400">Start: {hire.startDate}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="font-medium text-gray-900">{hire.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all"
                                                style={{ width: `${hire.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    <div className="space-y-2">
                                        {(hire.checklist || []).map((item, idx) => (
                                            <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.done}
                                                    onChange={(e) => handleChecklistChange(hire.id, idx, e.target.checked, 'onboarding')}
                                                    disabled={processing}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    {item.item}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Offboarding Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-amber-500">●</span> Offboarding
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {offboardings.length === 0 ? (
                            <div className="card col-span-2 text-center text-gray-500 py-8">
                                Tidak ada karyawan dalam proses offboarding
                            </div>
                        ) : (
                            offboardings.map((emp) => (
                                <div key={emp.id} className="card border-l-4 border-amber-400">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                                {emp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                                                <p className="text-sm text-gray-500">{emp.position} • {emp.department}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-red-500">Last: {emp.lastDate}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Exit Clearance</span>
                                            <span className="font-medium text-gray-900">{emp.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all"
                                                style={{ width: `${emp.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Checklist */}
                                    <div className="space-y-2">
                                        {(emp.checklist || []).map((item, idx) => (
                                            <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.done}
                                                    onChange={(e) => handleChecklistChange(emp.id, idx, e.target.checked, 'offboarding')}
                                                    disabled={processing}
                                                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                    {item.item}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for New Onboarding/Offboarding */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className={`px-6 py-4 ${modalType === 'onboarding' ? 'bg-green-600' : 'bg-amber-600'}`}>
                            <h3 className="text-lg font-semibold text-white">
                                {modalType === 'onboarding' ? '+ New Onboarding' : '+ New Offboarding'}
                            </h3>
                            <p className="text-sm text-white/80">
                                {modalType === 'onboarding' 
                                    ? 'Tambah karyawan baru untuk onboarding' 
                                    : 'Tambah karyawan untuk proses offboarding'}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Contoh: John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Posisi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Contoh: Software Engineer"
                                />
                                {errors.position && <p className="text-red-500 text-sm mt-1">{errors.position}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Pilih Department</option>
                                    <option value="IT">IT</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Sales">Sales</option>
                                </select>
                                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {modalType === 'onboarding' ? 'Tanggal Mulai' : 'Tanggal Terakhir'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                                        modalType === 'onboarding' 
                                            ? 'bg-green-600 hover:bg-green-700' 
                                            : 'bg-amber-600 hover:bg-amber-700'
                                    } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
