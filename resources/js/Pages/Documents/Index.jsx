import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function DocumentsIndex({ auth, documents = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const demoDocuments = documents.length > 0 ? documents : [
        { id: 1, employee: 'Ahmad Fauzi', type: 'contract', name: 'PKWTT - Ahmad Fauzi', date: '2024-01-15', expiry: null, status: 'active' },
        { id: 2, employee: 'Siti Rahayu', type: 'nda', name: 'NDA Agreement', date: '2024-01-10', expiry: '2025-01-10', status: 'active' },
        { id: 3, employee: 'Budi Santoso', type: 'warning', name: 'SP1 - Keterlambatan', date: '2024-01-05', expiry: null, status: 'active' },
        { id: 4, employee: 'Dewi Lestari', type: 'contract', name: 'PKWT - 12 Bulan', date: '2023-06-01', expiry: '2024-06-01', status: 'expiring' },
    ];

    const docTypes = {
        contract: { label: 'Kontrak Kerja', icon: '📄', color: 'bg-blue-100 text-blue-700' },
        nda: { label: 'NDA', icon: '🔒', color: 'bg-purple-100 text-purple-700' },
        warning: { label: 'Surat Peringatan', icon: '⚠️', color: 'bg-red-100 text-red-700' },
        certificate: { label: 'Sertifikat', icon: '🎓', color: 'bg-green-100 text-green-700' },
    };

    const templates = [
        { name: 'Surat Keterangan Kerja', icon: '📋' },
        { name: 'Kontrak PKWT', icon: '📝' },
        { name: 'Kontrak PKWTT', icon: '📝' },
        { name: 'Surat Peringatan 1', icon: '⚠️' },
        { name: 'Surat Peringatan 2', icon: '⚠️' },
        { name: 'Surat Peringatan 3', icon: '🚫' },
    ];

    return (
        <Layout user={auth?.user}>
            <Head title="Document Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
                        <p className="text-sm text-gray-500">Kelola dokumen karyawan dan template HR</p>
                    </div>
                    <button className="btn-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Dokumen
                    </button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard title="Total Dokumen" value="342" icon="📁" />
                    <StatCard title="Kontrak Aktif" value="156" icon="📄" color="blue" />
                    <StatCard title="Akan Expired" value="8" icon="⏰" color="amber" />
                    <StatCard title="Template" value="12" icon="📋" color="purple" />
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Documents List */}
                    <div className="lg:col-span-2">
                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Dokumen Terbaru</h3>
                                <div className="flex gap-2">
                                    {['all', 'contract', 'nda', 'warning'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedCategory === cat
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {cat === 'all' ? 'Semua' : docTypes[cat]?.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {demoDocuments
                                    .filter(d => selectedCategory === 'all' || d.type === selectedCategory)
                                    .map((doc) => (
                                        <div key={doc.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${docTypes[doc.type].color}`}>
                                                    {docTypes[doc.type].icon}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-sm text-gray-500">{doc.employee} • {doc.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {doc.status === 'expiring' && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                                                        Expire: {doc.expiry}
                                                    </span>
                                                )}
                                                <button className="text-primary-600 hover:text-primary-700 text-sm">Download</button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📋 Template Dokumen</h3>
                        <p className="text-sm text-gray-500 mb-4">Generate dokumen otomatis dengan data karyawan</p>
                        <div className="space-y-2">
                            {templates.map((template, idx) => (
                                <button
                                    key={idx}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                                >
                                    <span className="text-xl">{template.icon}</span>
                                    <span className="text-sm font-medium text-gray-700">{template.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function StatCard({ title, value, icon, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
        purple: 'bg-purple-100 text-purple-600',
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
