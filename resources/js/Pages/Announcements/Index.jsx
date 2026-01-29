import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function AnnouncementsIndex({ announcements, auth }) {
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        content: '',
        is_active: true,
    });

    const openCreateModal = () => {
        reset();
        setEditingAnnouncement(null);
        setShowModal(true);
    };

    const openEditModal = (announcement) => {
        setEditingAnnouncement(announcement);
        setData({
            title: announcement.title,
            content: announcement.content,
            is_active: announcement.is_active,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingAnnouncement(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAnnouncement) {
            put(`/company/announcements/${editingAnnouncement.id}`, {
                onSuccess: () => closeModal(),
            });
        } else {
            post('/company/announcements', {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
            router.delete(`/company/announcements/${id}`);
        }
    };

    const handleToggle = (id) => {
        router.post(`/company/announcements/${id}/toggle`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Announcements" />

            <div className="px-6 py-6 mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
                        <p className="mt-1 text-sm text-gray-500">Kelola pengumuman perusahaan</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                        + Tambah Pengumuman
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-hidden bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Judul
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Konten
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                    Tanggal
                                </th>
                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {announcements?.data?.length > 0 ? (
                                announcements.data.map((announcement) => (
                                    <tr key={announcement.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {announcement.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 line-clamp-2">
                                                {announcement.content}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleToggle(announcement.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${announcement.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {announcement.is_active ? 'Aktif' : 'Nonaktif'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(announcement.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                            <button
                                                onClick={() => openEditModal(announcement)}
                                                className="mr-3 text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Belum ada pengumuman. Klik "Tambah Pengumuman" untuk membuat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {announcements?.last_page > 1 && (
                        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                            <div className="text-sm text-gray-500">
                                Menampilkan {announcements.from} - {announcements.to} dari {announcements.total}
                            </div>
                            <div className="flex gap-2">
                                {announcements.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded ${link.active
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingAnnouncement ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Judul <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Masukkan judul pengumuman"
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Konten <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Masukkan isi pengumuman"
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                    />
                                    <label htmlFor="is_active" className="text-sm text-gray-700">
                                        Aktifkan pengumuman ini
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}
