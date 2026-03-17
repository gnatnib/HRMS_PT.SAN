import { Head, Link, useForm, usePage } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

export default function Dashboard({
    greeting,
    currentDate,
    stats,
    announcements,
    recentEmployees,
    newHiresThisMonth,
    whosOff,
}) {
    const { auth, flash } = usePage().props;
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const announcementForm = useForm({
        title: '',
        content: '',
    });

    // Live Clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    const viewerRole = auth?.user?.role ? auth.user.role.replace(/_/g, ' ') : 'user';

    const submitAnnouncement = (e) => {
        e.preventDefault();
        announcementForm.post('/announcements', {
            preserveScroll: true,
            onSuccess: () => {
                announcementForm.reset();
                setShowAnnouncementForm(false);
            },
        });
    };

    const getEmploymentCount = (label) => stats?.employmentStatus?.data?.find((item) => item.name === label)?.count || 0;

    const getWhoOffTone = (status) => {
        switch (status) {
            case 'Izin':
                return 'text-amber-600';
            case 'Cuti':
                return 'text-yellow-600';
            case 'Dinas Luar':
                return 'text-teal-600';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <MekariLayout>
            <Head title="Dashboard" />

            <div className="px-6 py-6 mx-auto max-w-7xl">
                {/* Greeting Header with Live Clock */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {greeting}, {auth?.user?.name || 'User'}!
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">{currentDate}</p>

                        {/* Shortcut Buttons */}
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            <span className="text-sm font-medium text-gray-500">Pintasan</span>
                            <Link href="/employees/create" className="shortcut-btn">Add Employee</Link>
                            <Link href="/employees" className="shortcut-btn">Employee List</Link>
                            <Link href="/employees-export" className="shortcut-btn">Export Data</Link>
                            <Link href="/recruitment" className="shortcut-btn">Recruitment</Link>
                        </div>
                    </div>

                    {/* Live Clock */}
                    <div className="hidden md:flex flex-col items-end">
                        <div className="text-3xl font-light text-gray-900 tabular-nums tracking-tight">
                            {formattedTime}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {flash.success}
                    </div>
                )}

                {/* Stats Cards Row */}
                <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <EmploymentStatusCard data={stats?.employmentStatus} />
                    <LengthOfServiceCard data={stats?.lengthOfService} />
                    <JobLevelCard data={stats?.jobLevel} />
                    <GenderDiversityCard data={stats?.genderDiversity} />
                </div>

                {/* Main Content — 2 column layout */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Left Column (3/5 width) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Quick Links + Employee Overview in a row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Quick Links */}
                            <div className="widget-card">
                                <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Links</h3>
                                <nav className="space-y-2">
                                    <Link href="/employees/create" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        Add Employee
                                    </Link>
                                    <Link href="/employees" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Employee List
                                    </Link>
                                    <Link href="/employees-export" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Export Employee Data
                                    </Link>
                                    <Link href="/recruitment" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Recruitment
                                    </Link>
                                </nav>
                            </div>

                            {/* Employee Overview */}
                            <div className="widget-card">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Employee Overview</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-slate-900">{stats?.employmentStatus?.total || 0}</p>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-green-600">{newHiresThisMonth || 0}</p>
                                        <p className="text-xs text-green-700">Baru Bulan Ini</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-blue-600">
                                            {getEmploymentCount('Aktif')}
                                        </p>
                                        <p className="text-xs text-blue-700">Aktif</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-red-600">
                                            {getEmploymentCount('Terminated')}
                                        </p>
                                        <p className="text-xs text-red-700">Terminated</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-yellow-600">
                                            {getEmploymentCount('Izin')}
                                        </p>
                                        <p className="text-xs text-yellow-700">Izin</p>
                                    </div>
                                    <div className="bg-teal-50 rounded-lg p-3 text-center">
                                        <p className="text-xl font-bold text-teal-600">
                                            {getEmploymentCount('Dinas Luar')}
                                        </p>
                                        <p className="text-xs text-teal-700">Dinas Luar</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Announcement */}
                        <div className="widget-card">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Pengumuman</h3>
                                    <p className="mt-1 text-xs text-gray-500">Pengumuman ini tampil untuk seluruh user yang login.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAnnouncementForm(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
                                >
                                    <span>+</span>
                                    Tambah Pengumuman
                                </button>
                            </div>
                            {announcements && announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {announcements.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedAnnouncement(item)}
                                            className="group relative p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 hover:border-purple-200 hover:-translate-y-0.5"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-l-xl"></div>
                                                <div className="flex items-start gap-3 pl-2">
                                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">{item.title}</h4>
                                                    <p className="mt-1 text-[11px] text-gray-500">{item.created_by_name} - {item.created_by_role}</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{item.date} • {item.time} WIB</p>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-gray-100">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Belum ada pengumuman</p>
                                    <p className="text-xs text-gray-400 mt-1">Pengumuman baru akan muncul di sini</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (2/5 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Recently Added */}
                        <div className="widget-card">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">Baru Ditambahkan</h3>
                                <Link href="/employees" className="text-xs text-blue-600 hover:text-blue-800">Lihat semua →</Link>
                            </div>
                            <div className="space-y-2">
                                {recentEmployees?.length > 0 ? recentEmployees.map((emp) => (
                                    <Link key={emp.id} href={`/employees/${emp.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                                        <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-slate-400 rounded-full flex-shrink-0">
                                            {emp.first_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{emp.first_name} {emp.last_name || ''}</p>
                                            <p className="text-xs text-gray-500 truncate">{emp.position?.name || emp.employee_code || '-'}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                            {
                                                'Aktif': 'bg-green-100 text-green-700',
                                                'Terminated': 'bg-red-100 text-red-700',
                                                'Izin': 'bg-amber-100 text-amber-700',
                                                'Cuti': 'bg-yellow-100 text-yellow-700',
                                                'Dinas Luar': 'bg-teal-100 text-teal-700',
                                                'Masa Percobaan': 'bg-blue-100 text-blue-700',
                                            }[emp.employment_status] || (emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                                        }`}>
                                            {emp.employment_status || (emp.is_active ? 'Aktif' : 'Terminated')}
                                        </span>
                                    </Link>
                                )) : (
                                    <p className="text-sm text-gray-400 text-center py-4">Belum ada data employee</p>
                                )}
                            </div>
                        </div>

                        {/* Who's Off */}
                        <div className="widget-card">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">Who's Off</h3>
                                <span className="text-xs text-gray-400">Current</span>
                            </div>
                            <div className="space-y-2">
                                {whosOff?.length > 0 ? whosOff.map((person, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 -mx-2 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-400 rounded-full flex-shrink-0">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                                            <p className={`text-xs font-medium ${getWhoOffTone(person.type)}`}>{person.type}</p>
                                            {person.reason && <p className="text-[11px] text-gray-500">{person.reason}</p>}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-400 text-center py-4">Semua employee hadir hari ini 🎉</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAnnouncementForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowAnnouncementForm(false)}
                >
                    <div
                        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-5 text-white">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Announcement Center</p>
                            <h2 className="mt-1 text-xl font-semibold">Create a new announcement</h2>
                            <p className="mt-1 text-sm text-slate-200">Announcements published here are immediately visible to all logged-in roles.</p>
                        </div>

                        <form onSubmit={submitAnnouncement} className="space-y-5 px-6 py-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Announcement Title</label>
                                <input
                                    type="text"
                                    value={announcementForm.data.title}
                                    onChange={(e) => announcementForm.setData('title', e.target.value)}
                                    className="form-input"
                                    placeholder="Example: Payroll data update reminder"
                                />
                                {announcementForm.errors.title && (
                                    <p className="mt-2 text-sm text-red-600">{announcementForm.errors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Announcement Content</label>
                                <textarea
                                    value={announcementForm.data.content}
                                    onChange={(e) => announcementForm.setData('content', e.target.value)}
                                    className="form-input min-h-40"
                                    placeholder="Write the key information you want to share with all users..."
                                />
                                {announcementForm.errors.content && (
                                    <p className="mt-2 text-sm text-red-600">{announcementForm.errors.content}</p>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                Created by <span className="font-semibold text-slate-900">{auth?.user?.name}</span> ({viewerRole})
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAnnouncementForm(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={announcementForm.processing}
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {announcementForm.processing ? 'Publishing...' : 'Publish Announcement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-purple-200 text-sm font-medium">Pengumuman</span>
                                    <h2 className="text-xl font-bold text-white">{selectedAnnouncement.title}</h2>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="mb-4 grid gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Dibuat oleh</p>
                                    <p className="mt-1 font-medium text-gray-900">{selectedAnnouncement.created_by_name}</p>
                                    <p className="text-xs text-gray-500">{selectedAnnouncement.created_by_role}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Waktu publikasi</p>
                                    <p className="mt-1 font-medium text-gray-900">{selectedAnnouncement.published_at} WIB</p>
                                </div>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedAnnouncement(null)}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}

// Employment Status Card Component
function EmploymentStatusCard({ data }) {
    const fallbackColors = ['#22C55E', '#EF4444', '#3B82F6', '#EAB308', '#14B8A6'];

    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Status Karyawan</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="flex h-3 mb-3 overflow-hidden rounded-full">
                {data?.data?.map((item, index) => (
                    <div
                        key={index}
                        className="progress-bar-fill"
                        style={{
                            width: `${item.percentage}%`,
                            backgroundColor: item.color || fallbackColors[index % fallbackColors.length],
                        }}
                    />
                ))}
            </div>

            <div className="flex justify-between mb-3 text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
            </div>

            <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium text-gray-900">{data?.total}</span>
                </div>
                {data?.data?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-1 text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: item.color || fallbackColors[index % fallbackColors.length] }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-gray-900">{item.count}</span>
                            <span className="text-gray-500">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Length of Service Card Component
function LengthOfServiceCard({ data }) {
    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Length of Service</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                        />
                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// Job Level Card Component
function JobLevelCard({ data }) {
    const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#EF4444', '#8B5CF6'];

    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Job Level</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="flex h-3 mb-3 overflow-hidden rounded-full">
                {data?.data?.map((item, index) => (
                    <div
                        key={index}
                        className="progress-bar-fill"
                        style={{
                            width: `${item.percentage}%`,
                            backgroundColor: colors[index % colors.length],
                        }}
                    />
                ))}
            </div>

            <div className="flex justify-between mb-3 text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
            </div>

            <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium text-gray-900">{data?.total}</span>
                </div>
                {data?.data?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-1 text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="text-gray-900">{item.count}</span>
                            <span className="text-gray-500">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Gender Diversity Card Component
function GenderDiversityCard({ data }) {
    const COLORS = ['#3B82F6', '#EC4899'];

    const pieData = data?.data?.map((item) => ({
        name: item.name,
        value: item.count,
    })) || [];

    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Gender Diversity</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            <div className="flex items-center justify-between">
                <div className="relative w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={40}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{data?.total}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    {data?.data?.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-gray-600">{item.name}</span>
                            <span className="font-medium text-gray-900">{item.count}</span>
                            <span className="text-gray-500">{item.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
