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

    // Form for editing employee data - includes ALL fields
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        // Employment Data
        employee_code: employee.employee_code || '',
        barcode: employee.barcode || '',
        organization_id: employee.organization_id || employee.timeline?.department?.id || '',
        position_id: employee.position_id || employee.timeline?.position?.id || '',
        employment_status: employee.employment_status || 'Permanent',
        department_id: employee.department_id || '',
        join_date: employee.join_date || '',
        contract_id: employee.contract_id || '',
        center_id: employee.timeline?.center?.id || '',

        // Personal Data
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        mobile_number: employee.mobile_number || '',
        gender: employee.gender == 1 ? 'male' : 'female',
        identity_type: employee.identity_type || 'KTP',
        identity_number: employee.identity_number || employee.national_number || '',
        identity_expired_date: employee.identity_expired_date || '',
        is_permanent_identity: employee.is_permanent_identity || false,
        birth_place: employee.birth_place || '',
        birth_date: employee.birth_date || '',
        postal_code: employee.postal_code || '',
        address: employee.address || '',
        is_active: employee.is_active ?? true,

        // Payroll Info
        basic_salary: employee.basic_salary || 0,
        ptkp_status: employee.ptkp_status || 'TK/0',
        tax_configuration: employee.tax_configuration || 'Gross',
        prorate_type: employee.prorate_type || 'Based on Working Day',
        count_national_holiday: employee.count_national_holiday || false,
        salary_type: employee.salary_type || 'Monthly',
        salary_configuration: employee.salary_configuration || 'Taxable',
        taxable_date: employee.taxable_date || '',
        overtime_status: employee.overtime_status || 'Eligible',
        employee_tax_status: employee.employee_tax_status || 'Pegawai Tetap',
        jht_configuration: employee.jht_configuration || 'Default',
        bpjs_kesehatan_config: employee.bpjs_kesehatan_config || 'By Company',
        jaminan_pensiun_config: employee.jaminan_pensiun_config || 'Default',
        npp_bpjs_ketenagakerjaan: employee.npp_bpjs_ketenagakerjaan || 'Default',
        bpjs_ketenagakerjaan: employee.bpjs_ketenagakerjaan || '',
        bpjs_kesehatan: employee.bpjs_kesehatan || '',
        bpjs_kesehatan_family: employee.bpjs_kesehatan_family || '0',
        npwp: employee.npwp || '',
        currency: employee.currency || 'IDR',
        beginning_netto: employee.beginning_netto || 0,
        pph21_paid: employee.pph21_paid || 0,
        bpjs_ketenagakerjaan_date: employee.bpjs_ketenagakerjaan_date || '',
        bpjs_kesehatan_date: employee.bpjs_kesehatan_date || '',
        jaminan_pensiun_date: employee.jaminan_pensiun_date || '',
        payroll_components: employee.payroll_components || [],

        // Bank Info
        bank_name: employee.bank_name || '',
        bank_account_number: employee.bank_account_number || '',
        bank_account_holder: employee.bank_account_holder || '',

        // Others
        max_leave_allowed: employee.max_leave_allowed || 12,
        profile_photo: null,
    });

    // Options arrays
    const employmentStatuses = ['Permanent', 'Contract', 'Probation', 'Intern'];
    const ptkpOptions = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
    const taxConfigs = ['Gross', 'Gross Up', 'Nett'];
    const salaryTypes = ['Monthly', 'Hourly', 'Daily'];
    const prorateTypes = ['Based on Working Day', 'Based on Calendar Day', 'Custom on Working Day', 'Custom on Calendar Day'];
    const bpjsFamilyOptions = ['0', '1', '2', '3', '4', '5'];
    const currencyOptions = ['IDR', 'USD', 'SGD'];

    // Relationship options
    const relationshipOptions = ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Brother', 'Sister', 'Other'];
    const educationLevels = ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1/D4', 'S2', 'S3'];

    // Editable state for Family, Emergency, Education when editing (must be declared before handleSave uses them)
    const [editableFamilyMembers, setEditableFamilyMembers] = useState(employee.family_members || []);
    const [editableEmergencyContacts, setEditableEmergencyContacts] = useState(employee.emergency_contacts || []);
    const [editableEducation, setEditableEducation] = useState(employee.education || []);

    // Handle save
    const handleSave = () => {
        // Merge form data with editable arrays and submit directly using router.post
        const submitData = {
            ...data,
            family_members: editableFamilyMembers,
            emergency_contacts: editableEmergencyContacts,
            education: editableEducation,
            training_courses: editableTrainingCourses,
            work_experience: editableWorkExperience,
        };

        router.post(`/employees/${employee.id}`, submitData, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    };

    // Family Members CRUD
    const addFamilyMember = () => {
        setEditableFamilyMembers([...editableFamilyMembers, {
            full_name: '',
            relationship: 'Father',
            birth_date: '',
            id_number: '',
            gender: 'male',
            job: ''
        }]);
    };
    const updateFamilyMember = (index, field, value) => {
        const updated = [...editableFamilyMembers];
        updated[index][field] = value;
        setEditableFamilyMembers(updated);
    };
    const removeFamilyMember = (index) => {
        setEditableFamilyMembers(editableFamilyMembers.filter((_, i) => i !== index));
    };

    // Emergency Contacts CRUD
    const addEmergencyContact = () => {
        setEditableEmergencyContacts([...editableEmergencyContacts, {
            name: '',
            relationship: 'Father',
            phone: ''
        }]);
    };
    const updateEmergencyContact = (index, field, value) => {
        const updated = [...editableEmergencyContacts];
        updated[index][field] = value;
        setEditableEmergencyContacts(updated);
    };
    const removeEmergencyContact = (index) => {
        setEditableEmergencyContacts(editableEmergencyContacts.filter((_, i) => i !== index));
    };

    // Education CRUD
    const addEducation = () => {
        setEditableEducation([...editableEducation, {
            grade: 'D4/S1',
            institution: '',
            major: '',
            start_year: '',
            end_year: '',
            gpa: ''
        }]);
    };
    const updateEducation = (index, field, value) => {
        const updated = [...editableEducation];
        updated[index][field] = value;
        setEditableEducation(updated);
    };
    const removeEducation = (index) => {
        setEditableEducation(editableEducation.filter((_, i) => i !== index));
    };

    // Training & Courses state and CRUD
    const [editableTrainingCourses, setEditableTrainingCourses] = useState(employee.training_courses || []);
    const addTrainingCourse = () => {
        setEditableTrainingCourses([...editableTrainingCourses, {
            name: '',
            held_by: '',
            start_date: '',
            end_date: '',
            duration: '',
            fee: '',
            certificate: false
        }]);
    };
    const updateTrainingCourse = (index, field, value) => {
        const updated = [...editableTrainingCourses];
        updated[index][field] = value;
        setEditableTrainingCourses(updated);
    };
    const removeTrainingCourse = (index) => {
        setEditableTrainingCourses(editableTrainingCourses.filter((_, i) => i !== index));
    };

    // Working Experience state and CRUD
    const [editableWorkExperience, setEditableWorkExperience] = useState(employee.work_experience || []);
    const addWorkExperience = () => {
        setEditableWorkExperience([...editableWorkExperience, {
            company: '',
            position: '',
            from: '',
            to: ''
        }]);
    };
    const updateWorkExperience = (index, field, value) => {
        const updated = [...editableWorkExperience];
        updated[index][field] = value;
        setEditableWorkExperience(updated);
    };
    const removeWorkExperience = (index) => {
        setEditableWorkExperience(editableWorkExperience.filter((_, i) => i !== index));
    };

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

                {/* Division - Dropdown */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        Division<span className="text-red-500">*</span>
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
                        value={data.employment_status}
                        onChange={(e) => setData('employment_status', e.target.value)}
                        className="form-input w-full"
                        disabled={!isEditing}
                    >
                        <option value="">Select Status</option>
                        {employmentStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
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
        </div>
    );

    const renderPersonalData = () => (
        <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">First Name<span className="text-red-500">*</span></label>
                    {isEditing ? (
                        <input type="text" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter first name" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.first_name || '-'}</p>
                    )}
                </div>

                {/* Last Name */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                    {isEditing ? (
                        <input type="text" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter last name" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.last_name || '-'}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    {isEditing ? (
                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="employee@company.com" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.email || '-'}</p>
                    )}
                </div>

                {/* Phone Number */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
                    {isEditing ? (
                        <input type="tel" value={data.mobile_number} onChange={(e) => setData('mobile_number', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="08xxxxxxxxxx" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.mobile_number || '-'}</p>
                    )}
                </div>

                {/* Gender */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender<span className="text-red-500">*</span></label>
                    {isEditing ? (
                        <select value={data.gender} onChange={(e) => setData('gender', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.gender == 1 ? 'Male' : 'Female'}</p>
                    )}
                </div>

                {/* Identity Type */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Identity Type</label>
                    {isEditing ? (
                        <select value={data.identity_type} onChange={(e) => setData('identity_type', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2">
                            {identityTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.identity_type || 'KTP'}</p>
                    )}
                </div>

                {/* Identity Number */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Identity Number</label>
                    {isEditing ? (
                        <input type="text" value={data.identity_number} onChange={(e) => setData('identity_number', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter identity number" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.identity_number || employee.national_number || '-'}</p>
                    )}
                </div>

                {/* Identity Expired Date */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Identity Expired Date</label>
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <>
                                <input
                                    type="date"
                                    value={data.identity_expired_date}
                                    onChange={(e) => setData('identity_expired_date', e.target.value)}
                                    className="form-input flex-1 border border-gray-300 rounded-lg px-3 py-2"
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

                {/* Birth Place */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Birth Place</label>
                    {isEditing ? (
                        <input type="text" value={data.birth_place} onChange={(e) => setData('birth_place', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Jakarta" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.birth_place || '-'}</p>
                    )}
                </div>

                {/* Birth Date */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Birth Date</label>
                    {isEditing ? (
                        <input type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.birth_date || '-'}</p>
                    )}
                </div>

                {/* Postal Code */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Postal Code</label>
                    {isEditing ? (
                        <input type="text" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="12345" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.postal_code || '-'}</p>
                    )}
                </div>

                {/* Photo */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Photo</label>
                    {isEditing ? (
                        <input type="file" accept="image/*" onChange={(e) => setData('profile_photo', e.target.files[0])} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.profile_photo_path ? 'Photo uploaded' : 'No photo'}</p>
                    )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                    {isEditing ? (
                        <textarea value={data.address} onChange={(e) => setData('address', e.target.value)} className="form-input w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Enter full address" />
                    ) : (
                        <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.address || '-'}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFamilyInfo = () => {
        const displayMembers = isEditing ? editableFamilyMembers : familyMembers;
        const displayContacts = isEditing ? editableEmergencyContacts : emergencyContacts;

        return (
            <div className="space-y-8">
                {/* Family Members Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
                        {isEditing && (
                            <button 
                                type="button"
                                onClick={addFamilyMember}
                                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                + ADD NEW
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-red-700 text-white">
                                    <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Full Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Relationship</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Birth Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">ID Number</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Gender</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Job</th>
                                    {isEditing && <th className="px-4 py-3 text-left text-xs font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayMembers.length > 0 ? (
                                    displayMembers.map((member, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={member.full_name} onChange={(e) => updateFamilyMember(idx, 'full_name', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Full name" />
                                                ) : member.full_name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <select value={member.relationship} onChange={(e) => updateFamilyMember(idx, 'relationship', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2">
                                                        {relationshipOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                ) : member.relationship || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="date" value={member.birth_date} onChange={(e) => updateFamilyMember(idx, 'birth_date', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" />
                                                ) : formatDate(member.birth_date) || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={member.id_number} onChange={(e) => updateFamilyMember(idx, 'id_number', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="ID number" />
                                                ) : member.id_number || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <select value={member.gender} onChange={(e) => updateFamilyMember(idx, 'gender', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2">
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>
                                                ) : member.gender || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={member.job} onChange={(e) => updateFamilyMember(idx, 'job', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Job" />
                                                ) : member.job || '-'}
                                            </td>
                                            {isEditing && (
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => removeFamilyMember(idx)} className="text-red-600 hover:text-red-800">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isEditing ? "8" : "7"} className="px-4 py-8 text-center text-gray-500">
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
                        {isEditing && (
                            <button type="button" onClick={addEmergencyContact} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                + ADD NEW
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-red-700 text-white">
                                    <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Relationship</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Phone Number</th>
                                    {isEditing && <th className="px-4 py-3 text-left text-xs font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayContacts.length > 0 ? (
                                    displayContacts.map((contact, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={contact.name} onChange={(e) => updateEmergencyContact(idx, 'name', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Contact name" />
                                                ) : contact.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <select value={contact.relationship} onChange={(e) => updateEmergencyContact(idx, 'relationship', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2">
                                                        {relationshipOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                ) : contact.relationship || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="tel" value={contact.phone} onChange={(e) => updateEmergencyContact(idx, 'phone', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="08xxxxxxxxxx" />
                                                ) : contact.phone || '-'}
                                            </td>
                                            {isEditing && (
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => removeEmergencyContact(idx)} className="text-red-600 hover:text-red-800">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isEditing ? "5" : "4"} className="px-4 py-8 text-center text-gray-500">
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
    };

    const renderEducationInfo = () => {
        const displayEducation = isEditing ? editableEducation : (employee.education || []);

        return (
            <div className="space-y-8">
                {/* Formal Education Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Education</h3>
                        {isEditing && (
                            <button type="button" onClick={addEducation} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                + ADD NEW
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-red-700 text-white">
                                    <th className="px-4 py-3 text-left text-xs font-medium">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Grade</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Institution</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Major</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">Start Year</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">End Year</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium">GPA</th>
                                    {isEditing && <th className="px-4 py-3 text-left text-xs font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayEducation.length > 0 ? (
                                    displayEducation.map((edu, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <select value={edu.grade} onChange={(e) => updateEducation(idx, 'grade', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2">
                                                        {educationLevels.map(l => <option key={l} value={l}>{l}</option>)}
                                                    </select>
                                                ) : edu.grade || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Institution name" />
                                                ) : edu.institution || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={edu.major} onChange={(e) => updateEducation(idx, 'major', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Major" />
                                                ) : edu.major || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={edu.start_year} onChange={(e) => updateEducation(idx, 'start_year', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" placeholder="2020" />
                                                ) : edu.start_year || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={edu.end_year} onChange={(e) => updateEducation(idx, 'end_year', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" placeholder="2024" />
                                                ) : edu.end_year || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={edu.gpa} onChange={(e) => updateEducation(idx, 'gpa', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" placeholder="3.50" />
                                                ) : edu.gpa || '-'}
                                            </td>
                                            {isEditing && (
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => removeEducation(idx)} className="text-red-600 hover:text-red-800">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isEditing ? "8" : "7"} className="px-4 py-8 text-center text-gray-500">
                                            No education records registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Training/Course Table */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Training & Courses</h3>
                        {isEditing && (
                            <button type="button" onClick={addTrainingCourse} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                + ADD NEW
                            </button>
                        )}
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
                                    {isEditing && <th className="px-4 py-3 text-left text-xs font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(isEditing ? editableTrainingCourses : trainingCourses).length > 0 ? (
                                    (isEditing ? editableTrainingCourses : trainingCourses).map((course, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={course.name} onChange={(e) => updateTrainingCourse(idx, 'name', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Training name" />
                                                ) : course.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={course.held_by} onChange={(e) => updateTrainingCourse(idx, 'held_by', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Organizer" />
                                                ) : course.held_by || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="date" value={course.start_date} onChange={(e) => updateTrainingCourse(idx, 'start_date', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" />
                                                ) : course.start_date || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="date" value={course.end_date} onChange={(e) => updateTrainingCourse(idx, 'end_date', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" />
                                                ) : course.end_date || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="number" value={course.duration} onChange={(e) => updateTrainingCourse(idx, 'duration', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-20" placeholder="Days" />
                                                ) : course.duration || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="number" value={course.fee} onChange={(e) => updateTrainingCourse(idx, 'fee', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-28" placeholder="0" />
                                                ) : formatCurrency(course.fee) || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="checkbox" checked={course.certificate} onChange={(e) => updateTrainingCourse(idx, 'certificate', e.target.checked)} className="form-checkbox h-4 w-4" />
                                                ) : course.certificate ? 'Yes' : 'No'}
                                            </td>
                                            {isEditing && (
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => removeTrainingCourse(idx)} className="text-red-600 hover:text-red-800">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isEditing ? "9" : "8"} className="px-4 py-8 text-center text-gray-500">
                                            No training or courses registered yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Working Experience Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-light text-gray-900">Working Experience</h3>
                        {isEditing && (
                            <button type="button" onClick={addWorkExperience} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                                + ADD NEW
                            </button>
                        )}
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
                                    {isEditing && <th className="px-4 py-3 text-left text-xs font-medium">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {(isEditing ? editableWorkExperience : workExperiences).length > 0 ? (
                                    (isEditing ? editableWorkExperience : workExperiences).map((exp, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">{idx + 1}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={exp.company} onChange={(e) => updateWorkExperience(idx, 'company', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Company name" />
                                                ) : exp.company || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="text" value={exp.position} onChange={(e) => updateWorkExperience(idx, 'position', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2 w-full" placeholder="Position" />
                                                ) : exp.position || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="date" value={exp.from} onChange={(e) => updateWorkExperience(idx, 'from', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" />
                                                ) : exp.from || exp.from_date || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {isEditing ? (
                                                    <input type="date" value={exp.to} onChange={(e) => updateWorkExperience(idx, 'to', e.target.value)} className="form-input text-sm py-1 border border-gray-300 rounded px-2" />
                                                ) : exp.to || exp.to_date || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{exp.length_of_service || '-'}</td>
                                            {isEditing && (
                                                <td className="px-4 py-3 text-sm">
                                                    <button type="button" onClick={() => removeWorkExperience(idx)} className="text-red-600 hover:text-red-800">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={isEditing ? "7" : "6"} className="px-4 py-8 text-center text-gray-500">
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
    };

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
                {isEditing ? (
                    <input
                        type="number"
                        value={data.basic_salary}
                        onChange={(e) => setData('basic_salary', e.target.value)}
                        className="form-input text-2xl font-bold w-full"
                        min="0"
                    />
                ) : (
                    <span className="text-3xl font-bold text-gray-900">
                        Rp {formatCurrency(employee.basic_salary)}
                    </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* PTKP Status */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">PTKP Status</label>
                    {isEditing ? (
                        <select value={data.ptkp_status} onChange={(e) => setData('ptkp_status', e.target.value)} className="form-input w-full">
                            {ptkpOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.ptkp_status || 'TK/0'}</p>}
                </div>
                {/* Tax Configuration */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Tax Configuration</label>
                    {isEditing ? (
                        <select value={data.tax_configuration} onChange={(e) => setData('tax_configuration', e.target.value)} className="form-input w-full">
                            {taxConfigs.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.tax_configuration || 'Gross'}</p>}
                </div>
                {/* Prorate Type */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Prorate Type</label>
                    {isEditing ? (
                        <select value={data.prorate_type} onChange={(e) => setData('prorate_type', e.target.value)} className="form-input w-full">
                            {prorateTypes.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.prorate_type || 'Based on Working Day'}</p>}
                </div>
                {/* Salary Type */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Salary Type</label>
                    {isEditing ? (
                        <select value={data.salary_type} onChange={(e) => setData('salary_type', e.target.value)} className="form-input w-full">
                            {salaryTypes.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : <p className="text-sm text-gray-900 border-b border-gray-200 pb-2">{employee.salary_type || 'Monthly'}</p>}
                </div>

                {/* Checkbox */}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isEditing ? data.count_national_holiday : employee.count_national_holiday}
                            onChange={(e) => setData('count_national_holiday', e.target.checked)}
                            disabled={!isEditing}
                            className="rounded border-gray-300"
                        />
                        Count national holiday as a working day
                    </label>
                </div>

                <InfoField label="Overtime Status" value={employee.overtime_status || 'Eligible'} />
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
                    {isEditing ? (
                        <>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Bank Name</label>
                                <select value={data.bank_name} onChange={(e) => setData('bank_name', e.target.value)} className="form-input w-full">
                                    <option value="">Select Bank</option>
                                    <option value="BCA">BCA</option>
                                    <option value="Mandiri">Mandiri</option>
                                    <option value="BNI">BNI</option>
                                    <option value="BRI">BRI</option>
                                    <option value="CIMB Niaga">CIMB Niaga</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Account Number</label>
                                <input type="text" value={data.bank_account_number} onChange={(e) => setData('bank_account_number', e.target.value)} className="form-input w-full" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Account Holder</label>
                                <input type="text" value={data.bank_account_holder} onChange={(e) => setData('bank_account_holder', e.target.value)} className="form-input w-full" />
                            </div>
                        </>
                    ) : (
                        <>
                            <InfoField label="Bank Name" value={employee.bank_name || '-'} />
                            <InfoField label="Account Number" value={employee.bank_account_number || '-'} />
                            <InfoField label="Account Holder" value={employee.bank_account_holder || '-'} />
                        </>
                    )}
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

                {/* Employee Header with Photo and Edit Button */}
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
                    {/* Edit/Save Buttons */}
                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={processing}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Employee'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Employee
                            </button>
                        )}
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
