import { Head, Link, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function EmployeeShow({ auth, employee, flash }) {
    const [activeTab, setActiveTab] = useState('general');
    const [activeSubTab, setActiveSubTab] = useState('employment');

    // Tabs configuration
    const mainTabs = [
        { id: 'general', name: 'GENERAL INFO', icon: '✏️' },
        { id: 'payroll', name: 'PAYROLL', icon: '💰' },
        {
            id: 'timemanagement',
            name: 'TIME MANAGEMENT',
            icon: '⏰',
            dropdown: true,
            items: [
                { id: 'timeoff', name: 'Time Off' },
                { id: 'attendance', name: 'Attendance' },
                { id: 'overtime', name: 'Overtime' },
            ]
        },
        {
            id: 'finance',
            name: 'FINANCE',
            icon: '💳',
            dropdown: true,
            items: [
                { id: 'reimbursement', name: 'Reimbursement' },
                { id: 'cashadvance', name: 'Cash Advance' },
                { id: 'loan', name: 'Loan' },
            ]
        },
        { id: 'history', name: 'HISTORY', icon: '📋' },
        {
            id: 'more',
            name: 'MORE',
            icon: '📁',
            dropdown: true,
            items: [
                { id: 'files', name: 'My Files' },
                { id: 'assets', name: 'Assets' },
            ]
        },
    ];

    const generalSubTabs = [
        { id: 'employment', name: 'EMPLOYMENT DATA' },
        { id: 'personal', name: 'PERSONAL DATA' },
        { id: 'family', name: 'FAMILY INFO' },
        { id: 'education', name: 'EDUCATION INFO' },
        { id: 'custom', name: 'CUSTOM FIELD INFO' },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'decimal',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const handleDelete = () => {
        if (confirm(`Hapus karyawan "${employee.first_name} ${employee.last_name}"?`)) {
            router.delete(`/employees/${employee.id}`);
        }
    };

    const renderMainTabContent = () => {
        switch (activeTab) {
            case 'general':
                return renderGeneralInfo();
            case 'payroll':
                return renderPayrollInfo();
            case 'timeoff':
            case 'attendance':
            case 'overtime':
                return renderTimeManagement();
            case 'reimbursement':
            case 'cashadvance':
            case 'loan':
                return renderFinance();
            case 'history':
                return renderHistory();
            case 'files':
            case 'assets':
                return renderMore();
            default:
                return renderGeneralInfo();
        }
    };

    const renderGeneralInfo = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">
                    Add, edit, or delete information about an employee
                </h2>
                <p className="text-sm text-gray-500">
                    From personal data to employment information. Both you and your employee can access the page, but only you can make the final edit.
                </p>
            </div>

            {/* Sub tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    {generalSubTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`pb-3 text-sm font-medium transition-colors ${activeSubTab === tab.id
                                    ? 'text-red-600 border-b-2 border-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Employment Data */}
            {activeSubTab === 'employment' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoField label="Company Id" value="PT. Sinergi Asta Nusantara" />
                    <InfoField label="Organization Name" value={employee.timeline?.department?.name || 'Customer Success'} />
                    <InfoField label="Job Position" value={employee.timeline?.position?.name || 'Staff'} />
                    <InfoField label="Job Level" value={employee.contract?.name || 'Staff'} />
                    <InfoField label="Employment Status" value={employee.contract?.name || 'Permanent'} />
                    <InfoField label="Branch" value={employee.timeline?.center?.name || 'Head Office'} />
                    <InfoField label="Join Date" value={formatDate(employee.join_date)} />
                    <InfoField label="Length of Service" value={calculateLengthOfService(employee.join_date)} />
                </div>
            )}

            {/* Personal Data */}
            {activeSubTab === 'personal' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoField label="Full Name" value={`${employee.first_name} ${employee.last_name || ''}`} />
                    <InfoField label="Gender" value={employee.gender === 'male' ? 'Laki-laki' : 'Perempuan'} />
                    <InfoField label="Birth Place & Date" value={employee.birth_and_place || '-'} />
                    <InfoField label="Phone Number" value={employee.mobile_number || '-'} />
                    <InfoField label="Email" value={employee.email || '-'} />
                    <InfoField label="National ID (KTP)" value={employee.national_number || '-'} />
                    <InfoField label="Address" value={employee.address || '-'} className="md:col-span-2" />
                </div>
            )}

            {/* Family Info */}
            {activeSubTab === 'family' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoField label="Father's Name" value={employee.father_name || '-'} />
                    <InfoField label="Mother's Name" value={employee.mother_name || '-'} />
                    <div className="md:col-span-2 text-center text-gray-500 py-8">
                        No family members registered yet.
                    </div>
                </div>
            )}

            {/* Education Info */}
            {activeSubTab === 'education' && (
                <div className="space-y-4">
                    <InfoField label="Degree" value={employee.degree || '-'} />
                    <div className="text-center text-gray-500 py-8">
                        No education history registered yet.
                    </div>
                </div>
            )}

            {/* Custom Field Info */}
            {activeSubTab === 'custom' && (
                <div className="text-center text-gray-500 py-8">
                    No custom fields configured.
                </div>
            )}
        </div>
    );

    const renderPayrollInfo = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">
                    {employee.first_name}'s Payroll Info
                </h2>
            </div>

            {/* Basic Salary */}
            <div className="mb-6">
                <p className="text-sm text-gray-500">Basic Salary</p>
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(employee.basic_salary)}
                    </span>
                    <Link
                        href={`/employees/${employee.id}/edit`}
                        className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                        TRANSACTION ADJUSTMENT
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="PTKP Status" value={employee.ptkp_status || 'TK/0'} />
                <InfoField label="Tax Configuration" value={employee.tax_configuration || 'Gross'} />
                <InfoField label="Prorate Type" value={employee.prorate_type || 'Based on Working Day'} />
                <div></div>

                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={employee.count_holiday_as_working_day}
                            disabled
                            className="rounded border-gray-300"
                        />
                        Count national holiday as a working day
                    </label>
                </div>

                <InfoField label="Type Salary" value={employee.salary_type || 'Monthly'} />
                <InfoField label="Salary Configuration" value={employee.salary_configuration || 'Taxable'} />
                <InfoField label="Overtime status" value={employee.overtime_status || 'Eligible'} />
                <InfoField label="Employee Tax Status" value={employee.employee_tax_status || 'Pegawai Tetap'} />
                <InfoField label="JHT Configuration" value={employee.jht_configuration || 'Default'} />
                <InfoField label="BPJS Kesehatan Configuration" value={employee.bpjs_kesehatan_config || 'By Company'} />
                <InfoField label="Jaminan Pensiun Configuration" value={employee.jaminan_pensiun_config || 'Default'} />
                <InfoField label="NPP BPJS Ketenagakerjaan" value={employee.npp_bpjs_ketenagakerjaan || 'Default'} />
            </div>

            {/* Bank Info */}
            <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Information</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <InfoField label="Bank Name" value={employee.bank_name || '-'} />
                    <InfoField label="Account Number" value={employee.bank_account_number || '-'} />
                    <InfoField label="Account Holder" value={employee.bank_account_holder || '-'} />
                </div>
            </div>
        </div>
    );

    const renderTimeManagement = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-light text-gray-900 mb-2">
                    {employee.first_name}'s time off information
                </h2>
                <p className="text-sm text-gray-500">
                    This is a summary of your employee time off balance.
                </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-3">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    REQUEST TIME OFF
                </button>
                <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    REQUEST DELEGATION
                </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="flex gap-8 py-4">
                <div className="text-center">
                    <p className="text-xs text-red-600 font-semibold">ANNUAL LEAVE ≡</p>
                    <p className="text-4xl font-bold text-gray-900">{employee.balance_leave_allowed || 10}<sub className="text-sm font-normal">days</sub></p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-red-600 font-semibold">SAKIT DENGAN SURAT DOKTER ≡</p>
                    <p className="text-4xl font-bold text-gray-900">12<sub className="text-sm font-normal">days</sub></p>
                </div>
            </div>

            {/* Sub tabs for time management */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    <button className="pb-3 text-sm font-medium text-red-600 border-b-2 border-red-600">
                        TIME OFF REQUEST
                    </button>
                    <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                        DELEGATION
                    </button>
                    <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                        TIME OFF TAKEN
                    </button>
                </nav>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium">Created Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Policy Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Start Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">End Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Taken</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.leaves?.length > 0 ? (
                            employee.leaves.map((leave, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-3 text-sm">{formatDate(leave.pivot?.from_date)}</td>
                                    <td className="px-4 py-3 text-sm">AL</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(leave.pivot?.from_date)}</td>
                                    <td className="px-4 py-3 text-sm">{formatDate(leave.pivot?.to_date)}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                                            {leave.pivot?.is_authorized ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">1</td>
                                    <td className="px-4 py-3 text-sm">
                                        <button className="text-gray-500 hover:text-red-600">Cancel</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No time off requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderFinance = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">
                {employee.first_name}'s Finance Information
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="widget-card text-center">
                    <p className="text-sm text-gray-500 mb-2">Reimbursement</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-400">pending requests</p>
                </div>
                <div className="widget-card text-center">
                    <p className="text-sm text-gray-500 mb-2">Cash Advance</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-400">active</p>
                </div>
                <div className="widget-card text-center">
                    <p className="text-sm text-gray-500 mb-2">Loans</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-400">active</p>
                </div>
            </div>

            <div className="text-center text-gray-500 py-8">
                No financial records found for this employee.
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">
                {employee.first_name}'s Employment History
            </h2>

            <div className="text-center text-gray-500 py-8">
                No history records found.
            </div>
        </div>
    );

    const renderMore = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-light text-gray-900">
                {employee.first_name}'s Files & Assets
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="widget-card">
                    <h3 className="font-medium text-gray-900 mb-4">My Files</h3>
                    <p className="text-sm text-gray-500">No files uploaded.</p>
                </div>
                <div className="widget-card">
                    <h3 className="font-medium text-gray-900 mb-4">Assets Assigned</h3>
                    <p className="text-sm text-gray-500">No assets assigned to this employee.</p>
                </div>
            </div>
        </div>
    );

    const calculateLengthOfService = (joinDate) => {
        if (!joinDate) return '-';
        const start = new Date(joinDate);
        const now = new Date();
        const years = now.getFullYear() - start.getFullYear();
        const months = now.getMonth() - start.getMonth();
        const days = now.getDate() - start.getDate();

        let y = years, m = months, d = days;
        if (d < 0) { m--; d += 30; }
        if (m < 0) { y--; m += 12; }

        return `${y} Year ${m} Month ${d} Day`;
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title={`${employee.first_name} ${employee.last_name || ''}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Main Tabs - Mekari Style */}
                <div className="bg-white border-b border-gray-200">
                    <nav className="flex gap-1">
                        {mainTabs.map((tab) => (
                            tab.dropdown ? (
                                <Menu as="div" key={tab.id} className="relative">
                                    <Menu.Button
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${tab.items.some(i => i.id === activeTab)
                                                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        {tab.name}
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        <Menu.Items className="absolute left-0 z-10 w-48 mt-1 origin-top-left bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1">
                                                {tab.items.map((item) => (
                                                    <Menu.Item key={item.id}>
                                                        {({ active }) => (
                                                            <button
                                                                onClick={() => setActiveTab(item.id)}
                                                                className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                                    }`}
                                                            >
                                                                {item.name}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </div>
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            ) : (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.name}
                                </button>
                            )
                        ))}
                    </nav>
                </div>

                {/* Employee Header */}
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {employee.profile_photo_path ? (
                            <img
                                src={`/storage/${employee.profile_photo_path}`}
                                alt={employee.first_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-3xl font-bold text-gray-400">
                                {employee.first_name?.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {employee.first_name} {employee.last_name || ''}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {employee.employee_code || `EMP-${String(employee.id).padStart(4, '0')}`} • {employee.contract?.name || 'Staff'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={`/employees/${employee.id}/edit`}
                            className="btn-primary"
                        >
                            Edit Employee
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="widget-card">
                    {renderMainTabContent()}
                </div>
            </div>
        </MekariLayout>
    );
}

// Info Field Component
function InfoField({ label, value, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{value}</p>
        </div>
    );
}
