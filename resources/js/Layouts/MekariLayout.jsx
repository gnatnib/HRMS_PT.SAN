import { Link, usePage } from '@inertiajs/react';
import { useState, Fragment, useEffect, useRef } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function MekariLayout({ children, user: userProp }) {
    const { url, props } = usePage();
    const user = userProp || props.auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const isAdmin = user?.role === 'direktur_utama' || user?.role === 'superadmin';

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', active: url === '/dashboard' },
        { name: 'Employees', href: '/employees', active: url.startsWith('/employees') },
        { name: 'Recruitment', href: '/recruitment', active: url.startsWith('/recruitment') },
        // User Management - only for Direktur Utama and Superadmin
        ...(isAdmin ? [{
            name: 'User Management',
            href: '/users',
            active: url.startsWith('/users'),
        }] : []),
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const trimmed = searchQuery.trim();

        if (trimmed.length < 1) {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/employees-search-suggestions?q=${encodeURIComponent(trimmed)}`, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                const result = await response.json();
                setSearchResults(Array.isArray(result) ? result : []);
                setSearchOpen(true);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setSearchResults([]);
                }
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [searchQuery]);

    const getStatusTone = (status) => {
        switch (status) {
            case 'Aktif':
                return 'text-green-600';
            case 'Terminated':
                return 'text-red-600';
            case 'Izin':
                return 'text-amber-600';
            case 'Cuti':
                return 'text-yellow-600';
            case 'Dinas Luar':
                return 'text-teal-600';
            case 'Masa Percobaan':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

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
                                <span className="text-xl font-bold text-gray-900">SAN HRMS</span>
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
                            <div ref={searchRef} className="relative hidden md:block">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
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

                                {searchOpen && (
                                    <div className="absolute right-0 mt-2 w-[26rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                                        <div className="border-b border-gray-100 px-4 py-3">
                                            <p className="text-xs uppercase tracking-wide text-gray-400">Employee Search</p>
                                            <p className="mt-1 text-sm text-gray-500">Results update automatically as you type.</p>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto">
                                            {searchResults.length > 0 ? searchResults.map((employee) => (
                                                <Link
                                                    key={employee.id}
                                                    href={employee.url}
                                                    className="block border-b border-gray-100 px-4 py-3 transition hover:bg-gray-50 last:border-b-0"
                                                    onClick={() => {
                                                        setSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <p className={`truncate text-sm font-semibold ${getStatusTone(employee.employment_status)}`}>{employee.name}</p>
                                                            <p className="mt-1 text-xs text-gray-500">{employee.position || '-'} • {employee.division || '-'} • {employee.branch || '-'}</p>
                                                        </div>
                                                        <span className={`shrink-0 text-xs font-medium ${getStatusTone(employee.employment_status)}`}>{employee.employment_status}</span>
                                                    </div>
                                                    {employee.employee_code && <p className="mt-1 text-[11px] text-gray-400">{employee.employee_code}</p>}
                                                </Link>
                                            )) : (
                                                <div className="px-4 py-6 text-center text-sm text-gray-500">
                                                    No employee matched your search.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

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
