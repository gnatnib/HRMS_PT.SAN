import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Layout({ children, user }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`sidebar transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="flex items-center gap-3 p-4 border-b border-primary-800">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">HRIS</h1>
                        <p className="text-xs text-primary-300">PT Sinar Asta Nusantara</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto sidebar-scroll">
                    <NavSection title="Utama">
                        <NavItem href="/dashboard" label="Dashboard" icon={DashboardIcon} active={url === '/dashboard'} />
                    </NavSection>

                    <NavSection title="Kehadiran">
                        <NavItem href="/attendance/clock" label="Clock In/Out" icon={ClockIcon} active={url.startsWith('/attendance/clock')} />
                        <NavItem href="/attendance/live-tracking" label="Live Tracking" icon={ListIcon} active={url.startsWith('/attendance/live')} />
                        <NavItem href="/shifts" label="Shift & Jadwal" icon={CalendarIcon} active={url === '/shifts'} />
                        <NavItem href="/overtime" label="Lembur" icon={OvertimeIcon} active={url === '/overtime'} />
                        <NavItem href="/leave" label="Cuti" icon={VacationIcon} active={url === '/leave'} />
                    </NavSection>

                    <NavSection title="Payroll">
                        <NavItem href="/payroll" label="Penggajian" icon={PayslipIcon} active={url.startsWith('/payroll')} />
                        <NavItem href="/reimbursement" label="Reimburse" icon={ReimburseIcon} active={url === '/reimbursement'} />
                        <NavItem href="/loans" label="Kasbon" icon={LoanIcon} active={url === '/loans'} />
                    </NavSection>

                    <NavSection title="SDM">
                        <NavItem href="/employees" label="Karyawan" icon={EmployeesIcon} active={url === '/employees'} />
                        <NavItem href="/documents" label="Dokumen" icon={OrgIcon} active={url === '/documents'} />
                        <NavItem href="/assets" label="Aset" icon={ListIcon} active={url === '/assets'} />
                        <NavItem href="/tasks" label="Tasks" icon={CalendarIcon} active={url === '/tasks'} />
                    </NavSection>

                    <NavSection title="Rekrutmen">
                        <NavItem href="/recruitment" label="ATS Kanban" icon={RecruitIcon} active={url === '/recruitment'} />
                        <NavItem href="/recruitment/onboarding" label="Onboarding" icon={EmployeesIcon} active={url.startsWith('/recruitment/onboarding')} />
                    </NavSection>

                    <NavSection title="Laporan">
                        <NavItem href="/analytics" label="HR Analytics" icon={AnalyticsIcon} active={url === '/analytics'} />
                        <NavItem href="/performance" label="Performance" icon={OvertimeIcon} active={url === '/performance'} />
                    </NavSection>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-primary-800">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-600">
                            <span className="font-medium text-white">
                                {user?.name?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs truncate text-primary-300">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Logout
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavSection({ title, children }) {
    return (
        <div className="pt-4 first:pt-0">
            <p className="px-3 mb-2 text-xs font-semibold tracking-wider uppercase text-primary-400">
                {title}
            </p>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}

function NavItem({ href, label, icon: Icon, active = false }) {
    return (
        <Link
            href={href}
            className={active ? 'sidebar-item-active' : 'sidebar-item'}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </Link>
    );
}

// Icons
function DashboardIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function ClockIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function ListIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    );
}

function CalendarIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function OvertimeIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function VacationIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
    );
}

function PayslipIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
    );
}

function ReimburseIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function LoanIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function EmployeesIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );
}

function OrgIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );
}

function RecruitIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
}

function AnalyticsIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}
