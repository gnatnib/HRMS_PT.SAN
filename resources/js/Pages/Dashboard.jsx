import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';

export default function Dashboard({ auth }) {
    return (
        <Layout user={auth?.user}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Selamat datang di HRIS PT Sinar Asta Nusantara
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Karyawan"
                        value="156"
                        change="+12"
                        changeType="positive"
                        icon="👥"
                    />
                    <StatCard
                        title="Hadir Hari Ini"
                        value="142"
                        change="91%"
                        changeType="neutral"
                        icon="✅"
                    />
                    <StatCard
                        title="Cuti Pending"
                        value="8"
                        change="3 mendesak"
                        changeType="warning"
                        icon="📅"
                    />
                    <StatCard
                        title="Reimburse Pending"
                        value="Rp 12.5jt"
                        change="5 pengajuan"
                        changeType="neutral"
                        icon="💳"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Live Attendance */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Absensi Hari Ini</h2>
                            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                Live
                            </span>
                        </div>
                        <div className="space-y-3">
                            <AttendanceRow name="Ahmad Fauzi" time="08:02" status="on-time" department="IT" />
                            <AttendanceRow name="Siti Rahayu" time="08:15" status="on-time" department="HR" />
                            <AttendanceRow name="Budi Santoso" time="08:45" status="late" department="Sales" />
                            <AttendanceRow name="Dewi Lestari" time="09:01" status="late" department="Finance" />
                        </div>
                        <button className="w-full mt-4 btn-secondary">
                            Lihat Semua Absensi
                        </button>
                    </div>

                    {/* Leave Requests */}
                    <div className="card">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pengajuan Cuti Terbaru</h2>
                        <div className="space-y-3">
                            <LeaveRequestRow
                                name="Maria Garcia"
                                type="Cuti Tahunan"
                                dates="20-22 Jan 2024"
                                status="pending"
                            />
                            <LeaveRequestRow
                                name="Rudi Hartono"
                                type="Sakit"
                                dates="19 Jan 2024"
                                status="approved"
                            />
                            <LeaveRequestRow
                                name="Lisa Anggraini"
                                type="Cuti Tahunan"
                                dates="25-30 Jan 2024"
                                status="pending"
                            />
                        </div>
                        <button className="w-full mt-4 btn-secondary">
                            Kelola Pengajuan Cuti
                        </button>
                    </div>
                </div>

                {/* Turnover Chart Placeholder */}
                <div className="card">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Employee Turnover Rate</h2>
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                            📊 Chart akan ditampilkan di sini (Recharts integration)
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

function StatCard({ title, value, change, changeType, icon }) {
    const changeColors = {
        positive: 'text-green-600',
        negative: 'text-red-600',
        warning: 'text-amber-600',
        neutral: 'text-gray-600',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span className={`text-sm font-medium ${changeColors[changeType]}`}>
                    {change}
                </span>
            </div>
            <div className="mt-3">
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

function AttendanceRow({ name, time, status, department }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full bg-primary-100 text-primary-700">
                    {name.charAt(0)}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{department}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{time}</p>
                <span className={`text-xs ${status === 'on-time' ? 'text-green-600' : 'text-amber-600'}`}>
                    {status === 'on-time' ? 'Tepat Waktu' : 'Terlambat'}
                </span>
            </div>
        </div>
    );
}

function LeaveRequestRow({ name, type, dates, status }) {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        pending: 'Menunggu',
        approved: 'Disetujui',
        rejected: 'Ditolak',
    };

    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{type} • {dates}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
                {statusLabels[status]}
            </span>
        </div>
    );
}
