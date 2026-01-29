import { Link, usePage } from '@inertiajs/react';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function MekariLayout({ children, user }) {
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', active: url === '/dashboard' },
        { name: 'Employees', href: '/employees', active: url.startsWith('/employees') },
        {
            name: 'Time Management',
            href: '#',
            dropdown: true,
            active: url.startsWith('/attendance') || url.startsWith('/shifts') || url.startsWith('/overtime') || url.startsWith('/leave'),
            items: [
                { name: 'Clock In/Out', href: '/attendance/clock' },
                { name: 'Shifts', href: '/shifts' },
                { name: 'Overtime', href: '/overtime' },
                { name: 'Leave', href: '/leave' },
            ],
        },
        {
            name: 'Finance',
            href: '#',
            dropdown: true,
            active: url.startsWith('/finance') || url.startsWith('/reimbursement') || url.startsWith('/loans') || url.startsWith('/payroll'),
            items: [
                { name: 'Payroll', href: '/payroll' },
                { name: 'Reimbursement', href: '/finance/reimbursement' },
                { name: 'Cash Advance', href: '/finance/cash-advance' },
                { name: 'Loans', href: '/loans' },
            ],
        },
        {
            name: 'Recruitment',
            href: '#',
            dropdown: true,
            active: url.startsWith('/recruitment'),
            items: [
                { name: 'Candidates', href: '/recruitment' },
                { name: 'Onboarding', href: '/recruitment/onboarding' },
            ],
        },
        {
            name: 'Company',
            href: '#',
            dropdown: true,
            active: url.startsWith('/documents') || url.startsWith('/assets') || url.startsWith('/analytics') || url.startsWith('/performance') || url.startsWith('/company'),
            items: [
                { name: 'Documents', href: '/documents' },
                { name: 'Assets', href: '/assets' },
                { name: 'Announcements', href: '/company/announcements' },
                { name: 'Analytics', href: '/analytics' },
                { name: 'Performance', href: '/performance' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 mx-auto max-w-full">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8">
                                    <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                </div>
                                <span className="text-xl font-bold text-gray-900">HRMS</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex lg:items-center lg:gap-1">
                                {navigation.map((item) =>
                                    item.dropdown ? (
                                        <Menu as="div" key={item.name} className="relative">
                                            <Menu.Button className={`nav-link ${item.active ? 'nav-link-active' : ''}`}>
                                                {item.name}
                                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </Menu.Button>
                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <Menu.Items className="absolute left-0 w-48 mt-2 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="py-1">
                                                        {item.items.map((subItem) => (
                                                            <Menu.Item key={subItem.name}>
                                                                {({ active }) => (
                                                                    <Link
                                                                        href={subItem.href}
                                                                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                            }`}
                                                                    >
                                                                        {subItem.name}
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                        ))}
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    ) : (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`nav-link ${item.active ? 'nav-link-active' : ''}`}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Search employee"
                                    className="w-48 py-2 pl-10 pr-4 text-sm bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white"
                                />
                                <svg
                                    className="absolute w-5 h-5 text-gray-400 left-3 top-2.5"
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

                            {/* Notifications */}
                            <button className="relative p-2 text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User Menu */}
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                                    <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-purple-600 rounded-full">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="hidden text-sm font-medium text-gray-700 md:block">
                                        {user?.name || 'User'}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href="/profile"
                                                        className={`block px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                            }`}
                                                    >
                                                        My Profile
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        href="/logout"
                                                        method="post"
                                                        as="button"
                                                        className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                            }`}
                                                    >
                                                        Logout
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-gray-500 lg:hidden hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="py-4 border-t border-gray-200 lg:hidden">
                            <div className="space-y-1">
                                {navigation.map((item) =>
                                    item.dropdown ? (
                                        <div key={item.name}>
                                            <span className="block px-4 py-2 text-sm font-medium text-gray-700">
                                                {item.name}
                                            </span>
                                            <div className="pl-4">
                                                {item.items.map((subItem) => (
                                                    <Link
                                                        key={subItem.name}
                                                        href={subItem.href}
                                                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                                                    >
                                                        {subItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`block px-4 py-2 text-sm ${item.active
                                                ? 'text-red-600 font-medium bg-red-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="w-full px-6 py-6">{children}</main>

            {/* Footer */}
            <footer className="py-4 mt-8 text-center text-gray-500 border-t border-gray-200 bg-gray-50">
                <p className="text-sm">
                    © {new Date().getFullYear()} PT. Sinergi Asta Nusantara - Human Resource Management System
                </p>
            </footer>
        </div>
    );
}
