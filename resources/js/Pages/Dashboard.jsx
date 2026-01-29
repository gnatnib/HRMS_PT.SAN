import { Head } from '@inertiajs/react';
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
                            <button className="shortcut-btn">Request attendance</button>
                            <button className="shortcut-btn">Request reimbursement</button>
                            <button className="shortcut-btn">Request time off</button>
                            <button className="shortcut-btn flex items-center gap-1">
                                More request
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
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
                                <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Info
                                </a>
                                <a href="/employees/create" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Add Employee
                                </a>
                                <a href="#" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Employee Transfer
                                </a>
                                <a href="/documents" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Company Settings
                                </a>
                            </nav>
                        </div>

                        <div className="widget-card">
                            <h3 className="mb-3 text-sm font-semibold text-gray-900">Applications</h3>
                            <nav className="space-y-2">
                                <a href="/performance" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Performance Review
                                </a>
                                <a href="/recruitment" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Recruitment
                                </a>
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
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No announcements at this time.</p>
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
        </MekariLayout>
    );
}

// Employment Status Card Component
function EmploymentStatusCard({ data }) {
    const colors = ['#3B82F6', '#F59E0B', '#8B5CF6'];

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
