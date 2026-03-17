import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function RecruitmentIndex({ auth, candidates = {}, stats = {}, positions = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // { candidate, stage }
    const [draggedCandidate, setDraggedCandidate] = useState(null);
    const [draggedFromStage, setDraggedFromStage] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localCandidates, setLocalCandidates] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        position: '',
        source: 'LinkedIn',
    });

    const stages = ['applied', 'screening', 'interview', 'offering', 'hired'];
    const stageLabels = {
        applied: 'Applied',
        screening: 'Screening',
        interview: 'Interview',
        offering: 'Offering',
        hired: 'Hired',
    };
    const stageColors = {
        applied: 'bg-gray-100 border-gray-300',
        screening: 'bg-blue-50 border-blue-300',
        interview: 'bg-purple-50 border-purple-300',
        offering: 'bg-amber-50 border-amber-300',
        hired: 'bg-green-50 border-green-300',
    };

    const baseCandidates = Object.keys(candidates).length > 0 ? candidates : {
        applied: [
            { id: 1, name: 'John Doe', position: 'Software Engineer', source: 'LinkedIn', date: '2024-01-18' },
            { id: 2, name: 'Jane Smith', position: 'UI/UX Designer', source: 'Jobstreet', date: '2024-01-17' },
        ],
        screening: [
            { id: 3, name: 'Michael Chen', position: 'Data Analyst', source: 'Referral', date: '2024-01-15' },
        ],
        interview: [
            { id: 4, name: 'Sarah Johnson', position: 'HR Manager', source: 'LinkedIn', date: '2024-01-10' },
            { id: 5, name: 'David Lee', position: 'Software Engineer', source: 'Website', date: '2024-01-08' },
        ],
        offering: [
            { id: 6, name: 'Emily Brown', position: 'Marketing Lead', source: 'Referral', date: '2024-01-05' },
        ],
        hired: [
            { id: 7, name: 'Robert Wilson', position: 'DevOps Engineer', source: 'LinkedIn', date: '2023-12-20' },
        ],
    };

    // Use localCandidates for optimistic UI, fall back to server data
    const demoCandidates = localCandidates || baseCandidates;

    const demoPositions = positions.length > 0 ? positions : [
        { id: 1, title: 'Software Engineer', department: 'IT', applicants: 8, urgency: 'high' },
        { id: 2, title: 'UI/UX Designer', department: 'Product', applicants: 5, urgency: 'medium' },
        { id: 3, title: 'Marketing Lead', department: 'Marketing', applicants: 3, urgency: 'low' },
    ];

    const handleDragStart = (e, candidate, stage) => {
        setDraggedCandidate(candidate);
        setDraggedFromStage(stage);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, toStage) => {
        e.preventDefault();
        if (draggedCandidate && draggedFromStage !== toStage) {
            // Optimistic update: move candidate in local state immediately
            const updated = {};
            stages.forEach((s) => {
                updated[s] = [...(demoCandidates[s] || [])];
            });
            updated[draggedFromStage] = updated[draggedFromStage].filter(
                (c) => c.id !== draggedCandidate.id
            );
            updated[toStage] = [...updated[toStage], draggedCandidate];
            setLocalCandidates(updated);

            // Send to server silently (no loading bar)
            router.post('/recruitment/move', {
                candidate_id: draggedCandidate.id,
                from_stage: draggedFromStage,
                to_stage: toStage,
            }, {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                onSuccess: () => {
                    // Reset local state, let server data take over
                    setLocalCandidates(null);
                },
                onError: () => {
                    // Revert on error
                    setLocalCandidates(null);
                },
            });
        }
        setDraggedCandidate(null);
        setDraggedFromStage(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/recruitment/candidates', {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const handleDeleteClick = (candidate, stage) => {
        setDeleteTarget({ candidate, stage });
    };

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.post('/recruitment/delete', {
            candidate_id: deleteTarget.candidate.id,
            stage: deleteTarget.stage,
        }, {
            onSuccess: () => {
                setDeleteTarget(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const urgencyColors = {
        high: 'text-red-600 bg-red-100',
        medium: 'text-amber-600 bg-amber-100',
        low: 'text-green-600 bg-green-100',
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Recruitment - ATS" />

            <div className="space-y-6">


                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recruitment - ATS</h1>
                        <p className="text-sm text-gray-500">Applicant Tracking System - Drag & Drop Kanban</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/recruitment/export"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </a>
                        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Kandidat
                        </button>
                    </div>
                </div>

                {/* Open Positions */}
                <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-4">📋 Posisi Terbuka</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {demoPositions.map((pos) => (
                            <div key={pos.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{pos.title}</p>
                                    <p className="text-sm text-gray-500">{pos.department} • {pos.applicants} applicants</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[pos.urgency]}`}>
                                    {pos.urgency}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
                    {stages.map((stage) => (
                        <div
                            key={stage}
                            className={`rounded-lg border-2 p-4 ${stageColors[stage]} ${draggedFromStage && draggedFromStage !== stage ? 'ring-2 ring-primary-300' : ''
                                }`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-700">{stageLabels[stage]}</h4>
                                <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                    {demoCandidates[stage]?.length || 0}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {(demoCandidates[stage] || []).map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, candidate, stage)}
                                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(candidate, stage);
                                            }}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1"
                                            title="Hapus kandidat"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <p className="font-medium text-gray-900 text-sm pr-6">{candidate.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{candidate.position}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">{candidate.source}</span>
                                            <span className="text-xs text-gray-400">{candidate.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Kandidat</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        className="input"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="label">No. HP</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Posisi</label>
                                <select
                                    className="input"
                                    value={data.position}
                                    onChange={e => setData('position', e.target.value)}
                                >
                                    <option value="">-- Pilih Posisi --</option>
                                    {demoPositions.map((pos) => (
                                        <option key={pos.id} value={pos.title}>{pos.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Sumber</label>
                                <select
                                    className="input"
                                    value={data.source}
                                    onChange={e => setData('source', e.target.value)}
                                >
                                    <option>LinkedIn</option>
                                    <option>Jobstreet</option>
                                    <option>Indeed</option>
                                    <option>Website</option>
                                    <option>Referral</option>
                                    <option>Job Fair</option>
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
                                    {processing ? 'Menyimpan...' : 'Tambahkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        style={{ animation: 'fadeInScale 0.2s ease-out' }}
                    >
                        {/* Red Header */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-center">
                            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Hapus Kandidat</h3>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p className="text-gray-600 text-center mb-4">
                                Apakah Anda yakin ingin menghapus kandidat ini?
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <span className="text-red-600 font-bold text-sm">
                                            {deleteTarget.candidate.name?.charAt(0)?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{deleteTarget.candidate.name}</p>
                                        <p className="text-sm text-gray-500">{deleteTarget.candidate.position}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                    <span>📍 {stageLabels[deleteTarget.stage]}</span>
                                    <span>📅 {deleteTarget.candidate.date}</span>
                                    <span>🔗 {deleteTarget.candidate.source}</span>
                                </div>
                            </div>
                            <p className="text-xs text-red-500 text-center mt-3">
                                ⚠️ Tindakan ini tidak dapat dibatalkan
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="px-6 pb-5 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menghapus...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Ya, Hapus
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </MekariLayout>
    );
}
