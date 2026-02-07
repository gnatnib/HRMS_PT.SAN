import { Head, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';
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
    auth,
    greeting,
    currentDate,
    stats,
    contractProbation,
    tasks,
    announcements,
    whosOff,
    leaveBalance,
}) {
    const [activeTab, setActiveTab] = useState('announcement');
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Dashboard" />

            <div className="px-6 py-6 mx-auto max-w-7xl">
                {/* Greeting Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {greeting}, {auth?.user?.name || 'User'}!
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">It's {currentDate}</p>

                        {/* Shortcut Buttons */}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <p className="mr-2 text-sm font-medium text-gray-700">Shortcut</p>
                            <Link href="/attendance/clock" className="shortcut-btn">Request attendance</Link>
                            <Link href="/reimbursement" className="shortcut-btn">Request reimbursement</Link>
                            <Link href="/leave" className="shortcut-btn">Request time off</Link>
                            <Link href="/overtime" className="shortcut-btn">Request overtime</Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Row */}
                <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                    <EmploymentStatusCard data={stats?.employmentStatus} />
                    <LengthOfServiceCard data={stats?.lengthOfService} />
                    <JobLevelCard data={stats?.jobLevel} />
                    <GenderDiversityCard data={stats?.genderDiversity} />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Quick Links */}
                    <div className="space-y-4">
                        <div className="widget-card">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Links</h3>
                            <nav className="space-y-2">
                                <Link href="/employees" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Info
                                </Link>
                                <Link href="/employees/create" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Add Employee
                                </Link>
                                <Link href="/employees" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Employee List
                                </Link>
                                <Link href="/documents" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Documents
                                </Link>
                                <Link href="/assets" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    Assets
                                </Link>
                            </nav>
                        </div>

                        <div className="widget-card">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900">Applications</h3>
                            <nav className="space-y-2">
                                <Link href="/performance" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Performance Review
                                </Link>
                                <Link href="/recruitment" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Recruitment
                                </Link>
                                <Link href="/analytics" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    Analytics
                                </Link>
                                <Link href="/tasks" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    Tasks
                                </Link>
                            </nav>
                        </div>
                    </div>

                    {/* Center Column - Main Content */}
                    <div className="lg:col-span-1">
                        {/* Tabbed Content */}
                        <div className="widget-card">
                            <div className="tab-list">
                                <button
                                    className={`tab-item ${activeTab === 'announcement' ? 'tab-item-active' : ''}`}
                                    onClick={() => setActiveTab('announcement')}
                                >
                                    Announcement
                                </button>
                                <button
                                    className={`tab-item ${activeTab === 'contract' ? 'tab-item-active' : ''}`}
                                    onClick={() => setActiveTab('contract')}
                                >
                                    Contract & Probation
                                </button>
                                <button
                                    className={`tab-item ${activeTab === 'tasks' ? 'tab-item-active' : ''}`}
                                    onClick={() => setActiveTab('tasks')}
                                >
                                    Tasks
                                </button>
                            </div>

                            <div className="mt-4">
                                {activeTab === 'announcement' && (
                                    <div>
                                        {announcements && announcements.length > 0 ? (
                                            <div className="space-y-3">
                                                {announcements.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => setSelectedAnnouncement(item)}
                                                        className="group relative p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 hover:border-purple-200 hover:-translate-y-0.5"
                                                    >
                                                        {/* Decorative accent */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-l-xl"></div>

                                                        <div className="flex items-start gap-3 pl-2">
                                                            {/* Icon */}
                                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                                </svg>
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">
                                                                        {item.title}
                                                                    </h4>
                                                                    <span className="flex-shrink-0 text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                                                        {item.date}
                                                                    </span>
                                                                </div>
                                                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                                                    {item.content}
                                                                </p>
                                                                <div className="mt-2 flex items-center text-xs text-purple-600 font-medium group-hover:text-purple-700">
                                                                    <span>Baca selengkapnya</span>
                                                                    <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* View All Link */}
                                                <div className="pt-2 text-center">
                                                    <a href="/company/announcements" className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                                                        Lihat semua pengumuman
                                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 font-medium">Belum ada pengumuman</p>
                                                <p className="text-sm text-gray-400 mt-1">Pengumuman baru akan tampil di sini</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'contract' && (
                                    <ContractProbationTable data={contractProbation} />
                                )}

                                {activeTab === 'tasks' && <TasksList data={tasks} />}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Widgets */}
                    <div className="space-y-4">
                        <div className="widget-card">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">Annual Leave Balance</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{leaveBalance} Days</p>
                            <a href="/leave" className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800">
                                Request annual leave →
                            </a>
                        </div>

                        <div className="widget-card">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-900">Sakit Dengan Surat Dokter Balance</h3>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">12 Days</p>
                            <a href="#" className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800">
                                Request sakit dengan surat dokter →
                            </a>
                        </div>

                        <div className="widget-card">
                            <a href="#" className="inline-block mb-3 text-sm text-blue-600 hover:text-blue-800">
                                View all
                            </a>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-900">Who's Off</h3>
                                <span className="text-xs text-gray-500">This Week ▼</span>
                            </div>
                            <div className="space-y-3">
                                {whosOff?.map((person, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 text-sm font-medium text-white bg-gray-400 rounded-full">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                            <p className="text-xs text-blue-600">{person.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setSelectedAnnouncement(null)}
                >
                    <div
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header with gradient */}
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

                        {/* Content */}
                        <div className="px-6 py-6">
                            <div className="flex items-center gap-2 mb-4">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-500">Dipublikasikan: {selectedAnnouncement.date}</span>
                            </div>
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {selectedAnnouncement.content}
                            </div>
                        </div>

                        {/* Footer */}
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
    // Fallback colors if not provided in data
    const fallbackColors = ['#22C55E', '#EF4444', '#3B82F6', '#EAB308'];

    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Employment Status</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            {/* Progress Bar */}
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

            <button className="mt-3 text-sm text-gray-500 hover:text-gray-700">Filter ▼</button>
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

            <button className="mt-3 text-sm text-gray-500 hover:text-gray-700">Filter ▼</button>
        </div>
    );
}

// Job Level Card Component
function JobLevelCard({ data }) {
    const colors = ['#3B82F6', '#60A5FA', '#93C5FD', '#EF4444'];

    return (
        <div className="stats-card">
            <div className="stats-card-title">
                <span>Job Level</span>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>

            {/* Progress Bar */}
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

            <button className="mt-3 text-sm text-gray-500 hover:text-gray-700">Filter ▼</button>
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

            <button className="mt-3 text-sm text-gray-500 hover:text-gray-700">Filter ▼</button>
        </div>
    );
}

// Contract & Probation Table Component
function ContractProbationTable({ data }) {
    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg">
                    <option>Filter</option>
                </select>
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full py-2 pl-8 pr-4 text-sm border border-gray-300 rounded-lg"
                    />
                    <svg
                        className="absolute w-4 h-4 text-gray-400 left-2.5 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Employee ⇅</th>
                        <th>Status ⇅</th>
                        <th>End Date ⇅</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <input type="checkbox" className="rounded border-gray-300" />
                            </td>
                            <td className="font-medium">{item.employee}</td>
                            <td>{item.status}</td>
                            <td>{item.endDate}</td>
                            <td>
                                <button className="text-gray-400 hover:text-gray-600">⋯</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <span>Showing</span>
                    <select className="px-2 py-1 border border-gray-300 rounded">
                        <option>10</option>
                    </select>
                    <span>entries</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">|&lt;</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">&lt;</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">&gt;</button>
                    <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">&gt;|</button>
                </div>
            </div>
        </div>
    );
}

// Tasks List Component
function TasksList({ data }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    ADD NEW
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    ACTION ▼
                </button>
            </div>

            <div className="space-y-4">
                {data?.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 pb-4 border-b border-gray-100">
                        <input type="checkbox" className="mt-1 rounded border-gray-300" />
                        <div className="flex-1">
                            <a href="#" className="font-medium text-red-600 hover:text-red-800">
                                {task.title}
                            </a>
                            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Assigner Status : {task.assignerStatus}
                            </p>
                            <p className="text-sm text-gray-500">
                                Assigned Status : {task.assignedStatus}
                            </p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="text-red-600">Assigned : {task.assignedTo}</p>
                            <p className="text-red-600">{task.assignedDate}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
