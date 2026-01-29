import { Head, Link, router, useForm } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

export default function EmployeeShow({
    auth,
    employee,
    departments = [],
    positions = [],
    contracts = [],
    centers = [],
    flash
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [activeSubTab, setActiveSubTab] = useState('employment');
    const [isEditing, setIsEditing] = useState(false);

    // Form for editing employment data
    const { data, setData, put, processing, errors } = useForm({
        organization_id: employee.timeline?.department?.id || '',
        position_id: employee.timeline?.position?.id || '',
        contract_id: employee.contract_id || '',
        center_id: employee.timeline?.center?.id || '',
        join_date: employee.join_date || '',
        // Personal data
        employee_code: employee.employee_code || '',
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        identity_type: employee.identity_type || 'KTP',
        identity_number: employee.national_number || '',
        identity_expired_date: employee.identity_expired_date || '',
        is_permanent_identity: employee.is_permanent_identity || false,
        postal_code: employee.postal_code || '',
    });

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

    const identityTypes = ['KTP', 'SIM', 'Passport', 'KITAS', 'KITAP'];

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

    const calculateLengthOfService = (joinDate) => {
        if (!joinDate) return '-';
        const start = new Date(joinDate);
        const now = new Date();
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();

        if (days < 0) { months--; days += 30; }
        if (months < 0) { years--; months += 12; }

        return `${years} Year ${months} Month ${days} Day`;
    };

    const handleDelete = () => {
        if (confirm(`Hapus karyawan "${employee.first_name} ${employee.last_name}"?`)) {
            router.delete(`/employees/${employee.id}`);
        }
    };

    // Sample data for family members (would come from database)
    const familyMembers = employee.family_members || [];
    const emergencyContacts = employee.emergency_contacts || [];
    const trainingCourses = employee.training_courses || [];
    const workExperiences = employee.work_experiences || [];

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
            {activeSubTab === 'employment' && renderEmploymentData()}

            {/* Personal Data */}
            {activeSubTab === 'personal' && renderPersonalData()}

            {/* Family Info */}
            {activeSubTab === 'family' && renderFamilyInfo()}

            {/* Education Info */}
            {activeSubTab === 'education' && renderEducationInfo()}

            {/* Custom Field Info */}
            {activeSubTab === 'custom' && (
                <div className="text-center text-gray-500 py-8">
                    No custom fields configured.
                </div>
            )}
        </div>
    );

    const renderEmploymentData = () => (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Company ID - Read Only */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Company Id</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2 bg-gray-50 px-3 py-2 rounded">
                        PT. Sinergi Asta Nusantara
                    </p>
                </div>

                {/* Organization Name - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Organization Name<span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.organization_id}
                        onChange={(e) => setData('organization_id', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Organization</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                {/* Job Position - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Job Position<span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.position_id}
                        onChange={(e) => setData('position_id', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Position</option>
                        {positions.map((pos) => (
                            <option key={pos.id} value={pos.id}>{pos.name}</option>
                        ))}
                    </select>
                </div>

                {/* Job Level - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Job Level<span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.contract_id}
                        onChange={(e) => setData('contract_id', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Level</option>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Employment Status - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Employment Status<span className="text-red-500">*</span>
                    </label>
                    <select
                        value={data.contract_id}
                        onChange={(e) => setData('contract_id', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Status</option>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Branch - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Branch</label>
                    <select
                        value={data.center_id}
                        onChange={(e) => setData('center_id', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Branch</option>
                        {centers.map((center) => (
                            <option key={center.id} value={center.id}>{center.name}</option>
                        ))}
                    </select>
                </div>

                {/* Join Date */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Join Date<span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                        <input
                            type="date"
                            value={data.join_date}
                            onChange={(e) => setData('join_date', e.target.value)}
                            className="form-input w-full"
                        />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                            {formatDate(employee.join_date)}
                        </p>
                    )}
                </div>

                {/* Length of Service - Calculated */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Length of Service</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2 bg-gray-50 px-3 py-2 rounded">
                        {calculateLengthOfService(employee.join_date)}
                    </p>
                </div>
            </div>

            {/* Edit/Save Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                {isEditing ? (
                    <>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                // Handle save
                                setIsEditing(false);
                            }}
                            className="btn-primary"
                        >
                            Save Changes
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary"
                    >
                        Edit Employment Data
                    </button>
                )}
            </div>
        </div>
    );

    const renderPersonalData = () => (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Employee ID */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Employee ID<span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.employee_code || `EMP-${String(employee.id).padStart(4, '0')}`}
                    </p>
                </div>

                {/* First Name */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.first_name || '-'}
                    </p>
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.last_name || '-'}
                    </p>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.email || '-'}
                    </p>
                </div>

                {/* Identity Type */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Identity Type</label>
                    {isEditing ? (
                        <select
                            value={data.identity_type}
                            onChange={(e) => setData('identity_type', e.target.value)}
                            className="form-input w-full"
                        >
                            {identityTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                            {employee.identity_type || 'KTP'}
                        </p>
                    )}
                </div>

                {/* No Identity */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">No Identity</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.national_number || '-'}
                    </p>
                </div>

                {/* Expired Date Identity */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Expired Date Identity</label>
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <>
                                <input
                                    type="date"
                                    value={data.identity_expired_date}
                                    onChange={(e) => setData('identity_expired_date', e.target.value)}
                                    className="form-input flex-1"
                                    disabled={data.is_permanent_identity}
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={data.is_permanent_identity}
                                        onChange={(e) => setData('is_permanent_identity', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    Permanent
                                </label>
                            </>
                        ) : (
                            <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                                {employee.is_permanent_identity ? 'Permanent' : (employee.identity_expired_date || '-')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Postal Code */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                    <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">
                        {employee.postal_code || '-'}
                    </p>
                </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-end pt-4">
                <Link href={`/employees/${employee.id}/edit`} className="btn-primary">
                    Edit Personal Data
                </Link>
            </div>
        </div>
    );

    const renderFamilyInfo = () => (
        <div className="space-y-8">
            {/* Family Members Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            ADD NEW
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            IMPORT
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            EXPORT
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-red-700 text-white">
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Full Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Relationship</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Birth Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">No KTP</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Marital Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Gender</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Job</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {familyMembers.length > 0 ? (
                                familyMembers.map((member, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm">{member.full_name}</td>
                                        <td className="px-4 py-3 text-sm">{member.relationship}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(member.birth_date)}</td>
                                        <td className="px-4 py-3 text-sm">{member.ktp_number || '-'}</td>
                                        <td className="px-4 py-3 text-sm">{member.marital_status}</td>
                                        <td className="px-4 py-3 text-sm">{member.gender}</td>
                                        <td className="px-4 py-3 text-sm">{member.job || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No family members registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Emergency Contacts Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            ADD NEW
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-red-700 text-white">
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Relationship</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Phone Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {emergencyContacts.length > 0 ? (
                                emergencyContacts.map((contact, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm">{contact.name}</td>
                                        <td className="px-4 py-3 text-sm">{contact.relationship}</td>
                                        <td className="px-4 py-3 text-sm">{contact.phone_number}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        No emergency contacts registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderEducationInfo = () => (
        <div className="space-y-8">
            {/* Training/Course Table */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            ADD NEW
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            IMPORT
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            EXPORT
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Showing</span>
                            <select className="form-input w-16 text-sm">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Search</span>
                            <input
                                type="text"
                                className="form-input w-32 text-sm"
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-red-700 text-white">
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Held By</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Start Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">End Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Duration (day)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Fee</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Certificate</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {trainingCourses.length > 0 ? (
                                trainingCourses.map((course, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm">{course.name}</td>
                                        <td className="px-4 py-3 text-sm">{course.held_by}</td>
                                        <td className="px-4 py-3 text-sm">{course.start_date}</td>
                                        <td className="px-4 py-3 text-sm">{course.end_date}</td>
                                        <td className="px-4 py-3 text-sm">{course.duration}</td>
                                        <td className="px-4 py-3 text-sm">{formatCurrency(course.fee)}</td>
                                        <td className="px-4 py-3 text-sm">{course.certificate ? 'Yes' : 'No'}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                        No training or courses registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                        Showing 0 to 0 of 0 entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">&lt;</button>
                        <span className="px-3 py-1 text-sm">1</span>
                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">&gt;</button>
                        <button className="px-4 py-1 text-sm bg-gray-600 text-white rounded">GO</button>
                    </div>
                </div>
            </div>

            {/* Working Experience Section */}
            <div>
                <h3 className="text-xl font-light text-gray-900 mb-4">Working experience</h3>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            ADD NEW
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            IMPORT
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50">
                            EXPORT
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Showing</span>
                            <select className="form-input w-16 text-sm">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Search</span>
                            <input
                                type="text"
                                className="form-input w-32 text-sm"
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-red-700 text-white">
                                <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Position</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">From</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">To</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Length of Service</th>
                                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {workExperiences.length > 0 ? (
                                workExperiences.map((exp, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                        <td className="px-4 py-3 text-sm">{exp.company}</td>
                                        <td className="px-4 py-3 text-sm">{exp.position}</td>
                                        <td className="px-4 py-3 text-sm">{exp.from_date}</td>
                                        <td className="px-4 py-3 text-sm">{exp.to_date}</td>
                                        <td className="px-4 py-3 text-sm">{exp.length_of_service}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button className="text-blue-600 hover:text-blue-800">Edit</button>
                                                <button className="text-red-600 hover:text-red-800">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        No working experience registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
                        Rp {formatCurrency(employee.basic_salary)}
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
                    {employee.first_name}'s Time Off Information
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
                    <p className="text-4xl font-bold text-gray-900">{employee.max_leave_allowed || 12}<sub className="text-sm font-normal">days</sub></p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-red-600 font-semibold">SAKIT DENGAN SURAT DOKTER ≡</p>
                    <p className="text-4xl font-bold text-gray-900">12<sub className="text-sm font-normal">days</sub></p>
                </div>
            </div>

            <div className="text-center text-gray-500 py-8">
                No time off records found.
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

    return (
        <MekariLayout user={auth?.user}>
            <Head title={`${employee.first_name} ${employee.last_name || ''}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Employee Header with Photo */}
                <div className="flex items-center gap-6 pb-6">
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
                        <h1 className="text-2xl font-bold text-red-600">
                            {employee.first_name} {employee.last_name || ''}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {employee.timeline?.position?.name || employee.contract?.name || 'Staff'}
                        </p>
                    </div>
                </div>

                {/* Main Tabs - Mekari Style */}
                <div className="bg-white border-b border-gray-200">
                    <nav className="flex gap-1">
                        {mainTabs.map((tab) => (
                            tab.dropdown ? (
                                <Menu as="div" key={tab.id} className="relative">
                                    <Menu.Button
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${tab.items.some(i => i.id === activeTab)
                                                ? 'text-red-600 border-red-600 bg-red-50'
                                                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
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
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                                            ? 'text-red-600 border-red-600 bg-red-50'
                                            : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.name}
                                </button>
                            )
                        ))}
                    </nav>
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
