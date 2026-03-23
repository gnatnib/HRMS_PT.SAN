import { Head, useForm, router, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function RecruitmentIndex({ auth, candidates = {}, stats = {}, positions = [], departments = [], positionsList = [], centers = [], flash }) {
    const [showModal, setShowModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [draggedCandidate, setDraggedCandidate] = useState(null);
    const [draggedFromStage, setDraggedFromStage] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localCandidates, setLocalCandidates] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [interviewNotes, setInterviewNotes] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', email: '', phone: '', position: '', source: 'LinkedIn', notes: '', job_opening_id: '',
    });

    const jobForm = useForm({
        title: '', department: '', description: '', requirements: '', urgency: 'medium', vacancy_count: 1, location: '', employment_type: 'Full-time',
    });

    const convertForm = useForm({
        candidate_id: '', position_id: '', department_id: '', center_id: '', join_date: new Date().toISOString().split('T')[0], basic_salary: '',
    });

    const rejectForm = useForm({ candidate_id: '', rejection_reason: '' });

    const noteForm = useForm({
        candidate_id: '', stage: '', interviewer: '', interview_date: '', notes: '', rating: 3, result: 'pending',
    });

    const stages = ['applied', 'screening', 'interview', 'offering', 'hired', 'rejected'];
    const stageLabels = { applied: 'Applied', screening: 'Screening', interview: 'Interview', offering: 'Offering', hired: 'Hired', rejected: 'Rejected' };
    const stageColors = {
        applied: 'bg-gray-100 border-gray-300',
        screening: 'bg-blue-50 border-blue-300',
        interview: 'bg-purple-50 border-purple-300',
        offering: 'bg-amber-50 border-amber-300',
        hired: 'bg-green-50 border-green-300',
        rejected: 'bg-red-50 border-red-300',
    };

    const demoCandidates = localCandidates || candidates;
    const urgencyColors = { high: 'text-red-600 bg-red-100', medium: 'text-amber-600 bg-amber-100', low: 'text-green-600 bg-green-100' };

    const handleDragStart = (e, candidate, stage) => { setDraggedCandidate(candidate); setDraggedFromStage(stage); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

    const handleDrop = (e, toStage) => {
        e.preventDefault();
        if (draggedCandidate && draggedFromStage !== toStage) {
            const updated = {};
            stages.forEach((s) => { updated[s] = [...(demoCandidates[s] || [])]; });
            updated[draggedFromStage] = updated[draggedFromStage].filter((c) => c.id !== draggedCandidate.id);
            updated[toStage] = [...updated[toStage], draggedCandidate];
            setLocalCandidates(updated);

            router.post('/recruitment/move', {
                candidate_id: draggedCandidate.id, from_stage: draggedFromStage, to_stage: toStage,
            }, {
                preserveScroll: true, preserveState: true, showProgress: false,
                onSuccess: () => setLocalCandidates(null),
                onError: () => setLocalCandidates(null),
            });
        }
        setDraggedCandidate(null);
        setDraggedFromStage(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/recruitment/candidates', { onSuccess: () => { setShowModal(false); reset(); } });
    };

    const handleJobSubmit = (e) => {
        e.preventDefault();
        jobForm.post('/recruitment/job-openings', { onSuccess: () => { setShowJobModal(false); jobForm.reset(); } });
    };

    const handleDeleteClick = (candidate, stage) => setDeleteTarget({ candidate, stage });

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        router.post('/recruitment/delete', { candidate_id: deleteTarget.candidate.id, stage: deleteTarget.stage }, {
            onSuccess: () => { setDeleteTarget(null); setIsDeleting(false); },
            onError: () => setIsDeleting(false),
        });
    };

    const openConvert = (candidate) => {
        setSelectedCandidate(candidate);
        convertForm.setData({ ...convertForm.data, candidate_id: candidate.id });
        setShowConvertModal(true);
    };

    const handleConvert = (e) => {
        e.preventDefault();
        convertForm.post('/recruitment/convert', { onSuccess: () => { setShowConvertModal(false); convertForm.reset(); } });
    };

    const openReject = (candidate, stage) => {
        setSelectedCandidate(candidate);
        rejectForm.setData({ candidate_id: candidate.id, rejection_reason: '' });
        setShowRejectModal(true);
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post('/recruitment/reject', { onSuccess: () => { setShowRejectModal(false); rejectForm.reset(); } });
    };

    const openNotes = async (candidate, stage) => {
        setSelectedCandidate(candidate);
        noteForm.setData({ ...noteForm.data, candidate_id: candidate.id, stage });
        try {
            const res = await fetch(`/recruitment/interview-notes/${candidate.id}`, { headers: { Accept: 'application/json' } });
            const data = await res.json();
            setInterviewNotes(Array.isArray(data) ? data : []);
        } catch { setInterviewNotes([]); }
        setShowNotesModal(true);
    };

    const handleNoteSubmit = (e) => {
        e.preventDefault();
        noteForm.post('/recruitment/interview-notes', {
            preserveScroll: true,
            onSuccess: async () => {
                noteForm.reset('interviewer', 'interview_date', 'notes', 'rating', 'result');
                noteForm.setData('candidate_id', selectedCandidate.id);
                try {
                    const res = await fetch(`/recruitment/interview-notes/${selectedCandidate.id}`, { headers: { Accept: 'application/json' } });
                    const d = await res.json();
                    setInterviewNotes(Array.isArray(d) ? d : []);
                } catch {}
            },
        });
    };

    const handleDeleteJob = (jobId) => {
        if (confirm('Hapus lowongan ini?')) router.delete(`/recruitment/job-openings/${jobId}`);
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Recruitment - ATS" />
            <div className="space-y-6">
                {flash?.success && (<div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">{flash.success}</div>)}

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Recruitment - ATS</h1>
                        <p className="text-sm text-gray-500">Applicant Tracking System - Drag & Drop Kanban</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a href="/recruitment/export" className="btn-secondary flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                        </a>
                        <button onClick={() => setShowJobModal(true)} className="btn-secondary flex items-center gap-2">+ Lowongan</button>
                        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">+ Kandidat</button>
                    </div>
                </div>

                {/* Open Positions */}
                {positions.length > 0 && (
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">Posisi Terbuka</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {positions.map((pos) => (
                                <div key={pos.id} className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{pos.title}</p>
                                            <p className="text-sm text-gray-500">{pos.department} {pos.applicants > 0 ? `- ${pos.applicants} pelamar` : ''}</p>
                                            {pos.location && <p className="text-xs text-gray-400 mt-1">{pos.location} - {pos.employment_type}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColors[pos.urgency]}`}>{pos.urgency}</span>
                                            <button onClick={() => handleDeleteJob(pos.id)} className="text-gray-400 hover:text-red-500 text-xs">×</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {stages.map((stage) => (
                        <div key={stage} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <p className="text-xl font-bold text-gray-900">{stats[stage] || 0}</p>
                            <p className="text-xs text-gray-500">{stageLabels[stage]}</p>
                        </div>
                    ))}
                </div>

                {/* Kanban Board */}
                <div className="grid grid-cols-6 gap-3 min-h-[50vh]">
                    {stages.map((stage) => (
                        <div key={stage} className={`rounded-lg border-2 p-3 ${stageColors[stage]} ${draggedFromStage && draggedFromStage !== stage ? 'ring-2 ring-primary-300' : ''}`}
                            onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-700 text-sm">{stageLabels[stage]}</h4>
                                <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full">{demoCandidates[stage]?.length || 0}</span>
                            </div>
                            <div className="space-y-2">
                                {(demoCandidates[stage] || []).map((candidate) => (
                                    <div key={candidate.id} draggable={stage !== 'rejected'} onDragStart={(e) => handleDragStart(e, candidate, stage)}
                                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative">
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(candidate, stage); }}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 rounded p-1" title="Hapus">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <p className="font-medium text-gray-900 text-xs pr-6">{candidate.name}</p>
                                        <p className="text-[11px] text-gray-500 mt-1">{candidate.position}</p>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[10px] text-gray-400">{candidate.source}</span>
                                            <span className="text-[10px] text-gray-400">{candidate.date}</span>
                                        </div>
                                        {candidate.resume_path && <span className="text-[10px] text-blue-500 mt-1 block">CV uploaded</span>}
                                        {stage === 'rejected' && candidate.rejection_reason && (
                                            <p className="text-[10px] text-red-500 mt-1 truncate">Alasan: {candidate.rejection_reason}</p>
                                        )}
                                        {candidate.converted_employee_id && (
                                            <Link href={`/employees/${candidate.converted_employee_id}`} className="text-[10px] text-green-600 mt-1 block hover:underline">Lihat Employee →</Link>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openNotes(candidate, stage)} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200" title="Catatan Interview">Notes</button>
                                            {stage !== 'rejected' && stage !== 'hired' && (
                                                <button onClick={() => openReject(candidate, stage)} className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded hover:bg-red-100">Reject</button>
                                            )}
                                            {(stage === 'offering' || stage === 'hired') && !candidate.converted_employee_id && (
                                                <button onClick={() => openConvert(candidate)} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded hover:bg-green-100">Convert</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Candidate Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Kandidat</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="label">Nama Lengkap</label><input type="text" className="input" value={data.name} onChange={e => setData('name', e.target.value)} />{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Email</label><input type="email" className="input" value={data.email} onChange={e => setData('email', e.target.value)} /></div>
                                <div><label className="label">No. HP</label><input type="text" className="input" value={data.phone} onChange={e => setData('phone', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Posisi</label>
                                    <select className="input" value={data.position} onChange={e => setData('position', e.target.value)}>
                                        <option value="">-- Pilih --</option>
                                        {positions.map((pos) => (<option key={pos.id} value={pos.title}>{pos.title}</option>))}
                                        <option value="Other">Lainnya</option>
                                    </select>
                                </div>
                                <div><label className="label">Sumber</label>
                                    <select className="input" value={data.source} onChange={e => setData('source', e.target.value)}>
                                        {['LinkedIn', 'Jobstreet', 'Indeed', 'Website', 'Referral', 'Job Fair'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label className="label">Catatan</label><textarea className="input" rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)} /></div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Batal</button>
                                <button type="submit" className="btn-primary flex-1" disabled={processing}>{processing ? 'Menyimpan...' : 'Tambahkan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Job Opening Modal */}
            {showJobModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Tambah Lowongan</h2>
                        <form onSubmit={handleJobSubmit} className="space-y-4">
                            <div><label className="label">Judul Posisi</label><input type="text" className="input" value={jobForm.data.title} onChange={e => jobForm.setData('title', e.target.value)} required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Departemen</label><input type="text" className="input" value={jobForm.data.department} onChange={e => jobForm.setData('department', e.target.value)} /></div>
                                <div><label className="label">Urgency</label>
                                    <select className="input" value={jobForm.data.urgency} onChange={e => jobForm.setData('urgency', e.target.value)}>
                                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Lokasi</label><input type="text" className="input" value={jobForm.data.location} onChange={e => jobForm.setData('location', e.target.value)} /></div>
                                <div><label className="label">Tipe</label>
                                    <select className="input" value={jobForm.data.employment_type} onChange={e => jobForm.setData('employment_type', e.target.value)}>
                                        {['Full-time', 'Part-time', 'Contract', 'Internship'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div><label className="label">Deskripsi</label><textarea className="input" rows="2" value={jobForm.data.description} onChange={e => jobForm.setData('description', e.target.value)} /></div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowJobModal(false)} className="btn-secondary flex-1">Batal</button>
                                <button type="submit" className="btn-primary flex-1" disabled={jobForm.processing}>{jobForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Convert to Employee Modal */}
            {showConvertModal && selectedCandidate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConvertModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Convert ke Employee</h2>
                        <p className="text-sm text-gray-500 mb-4">Kandidat: <strong>{selectedCandidate.name}</strong> - {selectedCandidate.position}</p>
                        <form onSubmit={handleConvert} className="space-y-4">
                            <div><label className="label">Posisi</label>
                                <select className="input" value={convertForm.data.position_id} onChange={e => convertForm.setData('position_id', e.target.value)}>
                                    <option value="">-- Pilih --</option>
                                    {positionsList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Departemen</label>
                                    <select className="input" value={convertForm.data.department_id} onChange={e => convertForm.setData('department_id', e.target.value)}>
                                        <option value="">-- Pilih --</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="label">Divisi</label>
                                    <select className="input" value={convertForm.data.center_id} onChange={e => convertForm.setData('center_id', e.target.value)}>
                                        <option value="">-- Pilih --</option>
                                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Tanggal Bergabung</label><input type="date" className="input" value={convertForm.data.join_date} onChange={e => convertForm.setData('join_date', e.target.value)} /></div>
                                <div><label className="label">Gaji Pokok</label><input type="number" className="input" value={convertForm.data.basic_salary} onChange={e => convertForm.setData('basic_salary', e.target.value)} /></div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowConvertModal(false)} className="btn-secondary flex-1">Batal</button>
                                <button type="submit" className="btn-primary flex-1" disabled={convertForm.processing}>{convertForm.processing ? 'Memproses...' : 'Convert ke Employee'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedCandidate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRejectModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Tolak Kandidat</h2>
                        <p className="text-sm text-gray-500 mb-4">{selectedCandidate.name} - {selectedCandidate.position}</p>
                        <form onSubmit={handleReject} className="space-y-4">
                            <div><label className="label">Alasan Penolakan</label><textarea className="input" rows="3" value={rejectForm.data.rejection_reason} onChange={e => rejectForm.setData('rejection_reason', e.target.value)} placeholder="Masukkan alasan penolakan (opsional)" /></div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowRejectModal(false)} className="btn-secondary flex-1">Batal</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700" disabled={rejectForm.processing}>{rejectForm.processing ? 'Memproses...' : 'Tolak Kandidat'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Interview Notes Modal */}
            {showNotesModal && selectedCandidate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotesModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Catatan Interview</h2>
                        <p className="text-sm text-gray-500 mb-4">{selectedCandidate.name} - {selectedCandidate.position}</p>

                        {/* Existing notes */}
                        {interviewNotes.length > 0 && (
                            <div className="space-y-3 mb-6">
                                {interviewNotes.map((note) => (
                                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-900">{note.stage} - {note.interviewer || 'N/A'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${note.result === 'pass' ? 'bg-green-100 text-green-700' : note.result === 'fail' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{note.result}</span>
                                        </div>
                                        {note.rating && <div className="text-xs text-amber-500 mb-1">{'★'.repeat(note.rating)}{'☆'.repeat(5 - note.rating)}</div>}
                                        <p className="text-sm text-gray-600">{note.notes}</p>
                                        <p className="text-xs text-gray-400 mt-1">{note.interview_date ? new Date(note.interview_date).toLocaleDateString('id-ID') : ''} - {note.created_by}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new note */}
                        <form onSubmit={handleNoteSubmit} className="space-y-3 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900">Tambah Catatan</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label">Interviewer</label><input type="text" className="input" value={noteForm.data.interviewer} onChange={e => noteForm.setData('interviewer', e.target.value)} /></div>
                                <div><label className="label">Tanggal</label><input type="date" className="input" value={noteForm.data.interview_date} onChange={e => noteForm.setData('interview_date', e.target.value)} /></div>
                            </div>
                            <div><label className="label">Catatan</label><textarea className="input" rows="2" value={noteForm.data.notes} onChange={e => noteForm.setData('notes', e.target.value)} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="label">Rating (1-5)</label><input type="number" min="1" max="5" className="input" value={noteForm.data.rating} onChange={e => noteForm.setData('rating', parseInt(e.target.value))} /></div>
                                <div><label className="label">Hasil</label>
                                    <select className="input" value={noteForm.data.result} onChange={e => noteForm.setData('result', e.target.value)}>
                                        <option value="pending">Pending</option><option value="pass">Pass</option><option value="fail">Fail</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowNotesModal(false)} className="btn-secondary flex-1">Tutup</button>
                                <button type="submit" className="btn-primary flex-1" disabled={noteForm.processing}>{noteForm.processing ? 'Menyimpan...' : 'Simpan Catatan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 text-center">
                            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white">Hapus Kandidat</h3>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-gray-600 text-center mb-4">Hapus <strong>{deleteTarget.candidate.name}</strong>?</p>
                            <p className="text-xs text-red-500 text-center">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                        <div className="px-6 pb-5 flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                            <button onClick={handleDeleteConfirm} disabled={isDeleting} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
