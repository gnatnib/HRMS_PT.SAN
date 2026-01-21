import { Head, useForm, router } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function RecruitmentIndex({ auth, candidates = {}, stats = {}, positions = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [draggedCandidate, setDraggedCandidate] = useState(null);
    const [draggedFromStage, setDraggedFromStage] = useState(null);

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

    const demoCandidates = Object.keys(candidates).length > 0 ? candidates : {
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
            router.post('/recruitment/move', {
                candidate_id: draggedCandidate.id,
                from_stage: draggedFromStage,
                to_stage: toStage,
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

    const urgencyColors = {
        high: 'text-red-600 bg-red-100',
        medium: 'text-amber-600 bg-amber-100',
        low: 'text-green-600 bg-green-100',
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Recruitment - ATS" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recruitment - ATS</h1>
                        <p className="text-sm text-gray-500">Applicant Tracking System - Drag & Drop Kanban</p>
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tambah Kandidat
                    </button>
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
                                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                                    >
                                        <p className="font-medium text-gray-900 text-sm">{candidate.name}</p>
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
        </Layout>
    );
}
