import { Head, useForm, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function EmployeeCreate({ auth, departments = [], positions = [], contracts = [], centers = [] }) {
    const [activeSection, setActiveSection] = useState('employment');
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        // Employment Data
        employee_code: '',
        barcode: '',
        center_id: '',  // Division/Division
        position_id: '',
        employment_status: 'Permanent',
        department_id: '',
        join_date: '',
        contract_id: '',

        // Personal Data
        first_name: '',
        last_name: '',
        email: '',
        identity_type: 'KTP',
        identity_number: '',
        identity_expired_date: '',
        identity_permanent: false,
        mobile_number: '',
        postal_code: '',
        gender: 'male',
        birth_place: '',
        birth_date: '',
        address: '',

        // Family Info
        family_data: [],
        emergency_contacts: [],

        // Education Info
        education_history: [],
        training_courses: [],
        work_experience: [],

        // Payroll Info
        basic_salary: 0,
        ptkp_status: 'TK/0',
        tax_configuration: 'Gross',
        prorate_type: 'Based on Working Day',
        count_national_holiday: false,
        salary_type: 'Monthly',
        salary_configuration: 'Taxable',
        taxable_date: '',
        overtime_status: 'Eligible',
        employee_tax_status: 'Pegawai Tetap',
        jht_configuration: 'Default',
        bpjs_kesehatan_config: 'By Company',
        jaminan_pensiun_config: 'Default',
        npp_bpjs_ketenagakerjaan: 'Default',
        bpjs_ketenagakerjaan: '',
        bpjs_kesehatan: '',
        bpjs_kesehatan_family: '0',
        npwp: '',
        currency: 'IDR',
        beginning_netto: 0,
        pph21_paid: 0,
        bpjs_ketenagakerjaan_date: '',
        bpjs_kesehatan_date: '',
        jaminan_pensiun_date: '',
        payroll_components: [],

        // Bank Info
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',

        // Others
        max_leave_allowed: 12,
        profile_photo: null,
    });

    const sections = [
        { id: 'employment', name: 'Employment Data' },
        { id: 'personal', name: 'Personal Data' },
        { id: 'family', name: 'Family Info' },
        { id: 'education', name: 'Education Info' },
        { id: 'payroll', name: 'Payroll Info' },
        { id: 'bank', name: 'Bank Info' },
    ];

    const employmentStatuses = ['Permanent', 'Contract', 'Probation', 'Intern'];
    const identityTypes = ['KTP', 'SIM', 'Passport'];
    const educationGrades = ['SMA/SMK', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3'];
    const ptkpOptions = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
    const taxConfigs = ['Gross', 'Gross Up', 'Nett'];
    const salaryTypes = ['Monthly', 'Hourly', 'Daily'];
    const prorateTypes = ['Based on Working Day', 'Based on Calendar Day', 'Custom on Working Day', 'Custom on Calendar Day'];
    const bpjsFamilyOptions = ['0', '1', '2', '3', '4', '5'];
    const currencyOptions = ['IDR', 'USD', 'SGD'];
    const relationshipOptions = ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Other'];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate mandatory fields
        const requiredFields = [
            { field: 'first_name', label: 'First Name', section: 'personal' },
            { field: 'gender', label: 'Gender', section: 'personal' },
            { field: 'center_id', label: 'Division', section: 'employment' },
            { field: 'position_id', label: 'Job Position', section: 'employment' },
            { field: 'contract_id', label: 'Job Level', section: 'employment' },
            { field: 'employment_status', label: 'Employment Status', section: 'employment' },
            { field: 'join_date', label: 'Join Date', section: 'employment' },
        ];

        const missingFields = requiredFields.filter(({ field }) => !data[field] || data[field] === '');

        if (missingFields.length > 0) {
            setValidationErrors(missingFields);
            setShowValidationModal(true);
            return;
        }

        post('/employees', {
            forceFormData: true,
        });
    };

    // Family data management
    const addFamilyMember = () => {
        setData('family_data', [...data.family_data, {
            full_name: '',
            relationship: 'Father',
            birth_date: '',
            id_number: '',
            gender: 'male',
            job: ''
        }]);
    };

    const removeFamilyMember = (index) => {
        setData('family_data', data.family_data.filter((_, i) => i !== index));
    };

    const updateFamilyMember = (index, field, value) => {
        const updated = [...data.family_data];
        updated[index][field] = value;
        setData('family_data', updated);
    };

    // Emergency contacts management
    const addEmergencyContact = () => {
        setData('emergency_contacts', [...data.emergency_contacts, {
            name: '',
            relationship: 'Father',
            phone: ''
        }]);
    };

    const removeEmergencyContact = (index) => {
        setData('emergency_contacts', data.emergency_contacts.filter((_, i) => i !== index));
    };

    const updateEmergencyContact = (index, field, value) => {
        const updated = [...data.emergency_contacts];
        updated[index][field] = value;
        setData('emergency_contacts', updated);
    };

    // Education history management
    const addEducation = () => {
        setData('education_history', [...data.education_history, {
            grade: 'D4/S1',
            institution: '',
            major: '',
            start_year: '',
            end_year: '',
            gpa: ''
        }]);
    };

    const removeEducation = (index) => {
        setData('education_history', data.education_history.filter((_, i) => i !== index));
    };

    const updateEducation = (index, field, value) => {
        const updated = [...data.education_history];
        updated[index][field] = value;
        setData('education_history', updated);
    };

    // Work experience management
    const addWorkExperience = () => {
        setData('work_experience', [...data.work_experience, {
            company: '',
            position: '',
            from: '',
            to: '',
        }]);
    };

    const removeWorkExperience = (index) => {
        setData('work_experience', data.work_experience.filter((_, i) => i !== index));
    };

    const updateWorkExperience = (index, field, value) => {
        const updated = [...data.work_experience];
        updated[index][field] = value;
        setData('work_experience', updated);
    };

    // Training & Courses management
    const addTrainingCourse = () => {
        setData('training_courses', [...data.training_courses, {
            name: '',
            held_by: '',
            start_date: '',
            end_date: '',
            duration: '',
            fee: '',
            certificate: false
        }]);
    };

    const removeTrainingCourse = (index) => {
        setData('training_courses', data.training_courses.filter((_, i) => i !== index));
    };

    const updateTrainingCourse = (index, field, value) => {
        const updated = [...data.training_courses];
        updated[index][field] = value;
        setData('training_courses', updated);
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Add Employee" />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
                        <p className="text-sm text-gray-500">Fill in employee information below</p>
                    </div>
                    <Link href="/employees" className="btn-secondary">
                        Cancel
                    </Link>
                </div>

                {/* Section Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex gap-1 overflow-x-auto">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeSection === section.id
                                    ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    {/* Employment Data */}
                    {activeSection === 'employment' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Employment Data"
                                description="Enter division and job information for the employee"
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="Company ID">
                                    <input
                                        type="text"
                                        value="PT. Sinergi Asta Nusantara"
                                        readOnly
                                        className="form-input bg-gray-100 cursor-not-allowed"
                                    />
                                </FormField>

                                <FormField label="Division" required error={errors.center_id}>
                                    <select
                                        value={data.center_id}
                                        onChange={(e) => setData('center_id', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Division</option>
                                        {centers.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Job Position" required error={errors.position_id}>
                                    <select
                                        value={data.position_id}
                                        onChange={(e) => setData('position_id', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Position</option>
                                        {positions.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Job Level" required error={errors.contract_id}>
                                    <select
                                        value={data.contract_id}
                                        onChange={(e) => setData('contract_id', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Job Level</option>
                                        {contracts.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Employment Status" required error={errors.employment_status}>
                                    <select
                                        value={data.employment_status}
                                        onChange={(e) => setData('employment_status', e.target.value)}
                                        className="form-input"
                                    >
                                        {employmentStatuses.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Branch" error={errors.department_id}>
                                    <select
                                        value={data.department_id}
                                        onChange={(e) => setData('department_id', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Branch</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Join Date" required error={errors.join_date}>
                                    <input
                                        type="date"
                                        value={data.join_date}
                                        onChange={(e) => setData('join_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="Max Leave Allowed" error={errors.max_leave_allowed}>
                                    <input
                                        type="number"
                                        value={data.max_leave_allowed}
                                        onChange={(e) => setData('max_leave_allowed', parseInt(e.target.value) || 0)}
                                        className="form-input"
                                        min="0"
                                        max="30"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {/* Personal Data */}
                    {activeSection === 'personal' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Personal Data"
                                description="Enter personal and identity information"
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="First Name" required error={errors.first_name}>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter first name"
                                    />
                                </FormField>

                                <FormField label="Last Name" error={errors.last_name}>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter last name"
                                    />
                                </FormField>

                                <FormField label="Email" error={errors.email}>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="form-input"
                                        placeholder="employee@company.com"
                                    />
                                </FormField>

                                <FormField label="Phone Number" error={errors.mobile_number}>
                                    <input
                                        type="tel"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                        className="form-input"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </FormField>

                                <FormField label="Gender" required error={errors.gender}>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </FormField>

                                <FormField label="Identity Type" error={errors.identity_type}>
                                    <select
                                        value={data.identity_type}
                                        onChange={(e) => setData('identity_type', e.target.value)}
                                        className="form-input"
                                    >
                                        {identityTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Identity Number" error={errors.identity_number}>
                                    <input
                                        type="text"
                                        value={data.identity_number}
                                        onChange={(e) => setData('identity_number', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter identity number"
                                    />
                                </FormField>

                                <FormField label="Identity Expired Date" error={errors.identity_expired_date}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="date"
                                            value={data.identity_expired_date}
                                            onChange={(e) => setData('identity_expired_date', e.target.value)}
                                            className="form-input flex-1"
                                            disabled={data.identity_permanent}
                                        />
                                        <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={data.identity_permanent}
                                                onChange={(e) => {
                                                    setData('identity_permanent', e.target.checked);
                                                    if (e.target.checked) setData('identity_expired_date', '');
                                                }}
                                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            />
                                            Permanent
                                        </label>
                                    </div>
                                </FormField>

                                <FormField label="Birth Place" error={errors.birth_place}>
                                    <input
                                        type="text"
                                        value={data.birth_place}
                                        onChange={(e) => setData('birth_place', e.target.value)}
                                        className="form-input"
                                        placeholder="Jakarta"
                                    />
                                </FormField>

                                <FormField label="Birth Date" error={errors.birth_date}>
                                    <input
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="Postal Code" error={errors.postal_code}>
                                    <input
                                        type="text"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        className="form-input"
                                        placeholder="12345"
                                    />
                                </FormField>

                                <FormField label="Photo" error={errors.profile_photo}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('profile_photo', e.target.files[0])}
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="Address" error={errors.address} className="md:col-span-2">
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="form-input"
                                        rows={3}
                                        placeholder="Enter full address"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {/* Family Info */}
                    {activeSection === 'family' && (
                        <div className="space-y-8">
                            {/* Family Data */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Family Data"
                                        description="Add family members information"
                                    />
                                    <button
                                        type="button"
                                        onClick={addFamilyMember}
                                        className="btn-secondary text-sm"
                                    >
                                        + Add Family Member
                                    </button>
                                </div>

                                {data.family_data.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birth Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Number</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {data.family_data.map((member, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={member.full_name}
                                                                onChange={(e) => updateFamilyMember(index, 'full_name', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Full name"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={member.relationship}
                                                                onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            >
                                                                {relationshipOptions.map((rel) => (
                                                                    <option key={rel} value={rel}>{rel}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="date"
                                                                value={member.birth_date}
                                                                onChange={(e) => updateFamilyMember(index, 'birth_date', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={member.id_number}
                                                                onChange={(e) => updateFamilyMember(index, 'id_number', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="ID number"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={member.gender}
                                                                onChange={(e) => updateFamilyMember(index, 'gender', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            >
                                                                <option value="male">Male</option>
                                                                <option value="female">Female</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={member.job}
                                                                onChange={(e) => updateFamilyMember(index, 'job', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Job"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFamilyMember(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No family members added yet</p>
                                        <button
                                            type="button"
                                            onClick={addFamilyMember}
                                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            + Add Family Member
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Emergency Contacts */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Emergency Contacts"
                                        description="Add emergency contact information"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEmergencyContact}
                                        className="btn-secondary text-sm"
                                    >
                                        + Add Contact
                                    </button>
                                </div>

                                {data.emergency_contacts.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {data.emergency_contacts.map((contact, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={contact.name}
                                                                onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Contact name"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={contact.relationship}
                                                                onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            >
                                                                {relationshipOptions.map((rel) => (
                                                                    <option key={rel} value={rel}>{rel}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="tel"
                                                                value={contact.phone}
                                                                onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="08xxxxxxxxxx"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEmergencyContact(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No emergency contacts added yet</p>
                                        <button
                                            type="button"
                                            onClick={addEmergencyContact}
                                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            + Add Emergency Contact
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Education Info */}
                    {activeSection === 'education' && (
                        <div className="space-y-8">
                            {/* Education History */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Education History"
                                        description="Add formal education background"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEducation}
                                        className="btn-secondary text-sm"
                                    >
                                        + Add Education
                                    </button>
                                </div>

                                {data.education_history.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Major</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Year</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Year</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {data.education_history.map((edu, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <select
                                                                value={edu.grade}
                                                                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            >
                                                                {educationGrades.map((grade) => (
                                                                    <option key={grade} value={grade}>{grade}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={edu.institution}
                                                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Institution name"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={edu.major}
                                                                onChange={(e) => updateEducation(index, 'major', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Major"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={edu.start_year}
                                                                onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                                                                className="form-input text-sm py-1 w-24"
                                                                placeholder="2020"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={edu.end_year}
                                                                onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                                                                className="form-input text-sm py-1 w-24"
                                                                placeholder="2024"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={edu.gpa}
                                                                onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                                                className="form-input text-sm py-1 w-20"
                                                                placeholder="3.50"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No education history added yet</p>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            + Add Education
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Training & Courses */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Training & Courses"
                                        description="Add training and certification courses"
                                    />
                                    <button
                                        type="button"
                                        onClick={addTrainingCourse}
                                        className="btn-secondary text-sm"
                                    >
                                        + Add Training
                                    </button>
                                </div>

                                {data.training_courses.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Held By</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {data.training_courses.map((course, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={course.name}
                                                                onChange={(e) => updateTrainingCourse(index, 'name', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Training name"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={course.held_by}
                                                                onChange={(e) => updateTrainingCourse(index, 'held_by', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Organizer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="date"
                                                                value={course.start_date}
                                                                onChange={(e) => updateTrainingCourse(index, 'start_date', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="date"
                                                                value={course.end_date}
                                                                onChange={(e) => updateTrainingCourse(index, 'end_date', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={course.duration}
                                                                onChange={(e) => updateTrainingCourse(index, 'duration', e.target.value)}
                                                                className="form-input text-sm py-1 w-20"
                                                                placeholder="Days"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="number"
                                                                value={course.fee}
                                                                onChange={(e) => updateTrainingCourse(index, 'fee', e.target.value)}
                                                                className="form-input text-sm py-1 w-28"
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={course.certificate}
                                                                onChange={(e) => updateTrainingCourse(index, 'certificate', e.target.checked)}
                                                                className="form-checkbox h-4 w-4"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTrainingCourse(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No training or courses added yet</p>
                                        <button
                                            type="button"
                                            onClick={addTrainingCourse}
                                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            + Add Training
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Work Experience */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <SectionHeader
                                        title="Working Experience"
                                        description="Add previous work experience"
                                    />
                                    <button
                                        type="button"
                                        onClick={addWorkExperience}
                                        className="btn-secondary text-sm"
                                    >
                                        + Add Experience
                                    </button>
                                </div>

                                {data.work_experience.length > 0 ? (
                                    <div className="overflow-x-auto border rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                                                    <th className="px-4 py-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {data.work_experience.map((exp, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={exp.company}
                                                                onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Company name"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                value={exp.position}
                                                                onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                                placeholder="Position"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="date"
                                                                value={exp.from}
                                                                onChange={(e) => updateWorkExperience(index, 'from', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="date"
                                                                value={exp.to}
                                                                onChange={(e) => updateWorkExperience(index, 'to', e.target.value)}
                                                                className="form-input text-sm py-1"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeWorkExperience(index)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                                        <p className="text-gray-500">No work experience added yet</p>
                                        <button
                                            type="button"
                                            onClick={addWorkExperience}
                                            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                        >
                                            + Add Work Experience
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payroll Info */}
                    {activeSection === 'payroll' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Payroll Information"
                                description="Enter salary and tax configuration"
                            />

                            {/* Basic Salary */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Basic Salary</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-2xl font-bold text-gray-900">
                                                Rp {Number(data.basic_salary || 0).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    <FormField label="" error={errors.basic_salary}>
                                        <input
                                            type="number"
                                            value={data.basic_salary}
                                            onChange={(e) => setData('basic_salary', e.target.value)}
                                            className="form-input w-48"
                                            min="0"
                                            placeholder="Enter amount"
                                        />
                                    </FormField>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="PTKP Status" error={errors.ptkp_status}>
                                    <select
                                        value={data.ptkp_status}
                                        onChange={(e) => setData('ptkp_status', e.target.value)}
                                        className="form-input"
                                    >
                                        {ptkpOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Tax Configuration" error={errors.tax_configuration}>
                                    <select
                                        value={data.tax_configuration}
                                        onChange={(e) => setData('tax_configuration', e.target.value)}
                                        className="form-input"
                                    >
                                        {taxConfigs.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            {/* Prorate Type - Full Width */}
                            <FormField label="Prorate Type" error={errors.prorate_type}>
                                <select
                                    value={data.prorate_type}
                                    onChange={(e) => setData('prorate_type', e.target.value)}
                                    className="form-input"
                                >
                                    {prorateTypes.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </FormField>

                            {/* Count National Holiday Checkbox */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="count_national_holiday"
                                    checked={data.count_national_holiday}
                                    onChange={(e) => setData('count_national_holiday', e.target.checked)}
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <label htmlFor="count_national_holiday" className="text-sm text-gray-700">
                                    Count national holiday as a working day
                                </label>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField label="Type Salary" error={errors.salary_type}>
                                    <select
                                        value={data.salary_type}
                                        onChange={(e) => setData('salary_type', e.target.value)}
                                        className="form-input"
                                    >
                                        {salaryTypes.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </FormField>

                                <FormField label="Salary Configuration" error={errors.salary_configuration}>
                                    <select
                                        value={data.salary_configuration}
                                        onChange={(e) => setData('salary_configuration', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Taxable">Taxable</option>
                                        <option value="Non Taxable">Non Taxable</option>
                                    </select>
                                </FormField>

                                <FormField label="Taxable Date" error={errors.taxable_date}>
                                    <input
                                        type="date"
                                        value={data.taxable_date}
                                        onChange={(e) => setData('taxable_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="Overtime Status" error={errors.overtime_status}>
                                    <select
                                        value={data.overtime_status}
                                        onChange={(e) => setData('overtime_status', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Eligible">Eligible</option>
                                        <option value="Not Eligible">Not Eligible</option>
                                    </select>
                                </FormField>

                                <FormField label="Employee Tax Status" error={errors.employee_tax_status}>
                                    <select
                                        value={data.employee_tax_status}
                                        onChange={(e) => setData('employee_tax_status', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Pegawai Tetap">Pegawai Tetap</option>
                                        <option value="Pegawai Tidak Tetap">Pegawai Tidak Tetap</option>
                                        <option value="Bukan Pegawai">Bukan Pegawai</option>
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="JHT Configuration" error={errors.jht_configuration}>
                                    <select
                                        value={data.jht_configuration}
                                        onChange={(e) => setData('jht_configuration', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Default">Default</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </FormField>

                                <FormField label="BPJS Kesehatan Configuration" error={errors.bpjs_kesehatan_config}>
                                    <select
                                        value={data.bpjs_kesehatan_config}
                                        onChange={(e) => setData('bpjs_kesehatan_config', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="By Company">By Company</option>
                                        <option value="By Employee">By Employee</option>
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="Jaminan Pensiun Configuration" error={errors.jaminan_pensiun_config}>
                                    <select
                                        value={data.jaminan_pensiun_config}
                                        onChange={(e) => setData('jaminan_pensiun_config', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Default">Default</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </FormField>

                                <FormField label="NPP BPJS Ketenagakerjaan" error={errors.npp_bpjs_ketenagakerjaan}>
                                    <select
                                        value={data.npp_bpjs_ketenagakerjaan}
                                        onChange={(e) => setData('npp_bpjs_ketenagakerjaan', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Default">Default</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField label="BPJS Ketenagakerjaan" error={errors.bpjs_ketenagakerjaan}>
                                    <input
                                        type="text"
                                        value={data.bpjs_ketenagakerjaan}
                                        onChange={(e) => setData('bpjs_ketenagakerjaan', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter BPJS Ketenagakerjaan number"
                                    />
                                </FormField>

                                <FormField label="BPJS Kesehatan" error={errors.bpjs_kesehatan}>
                                    <input
                                        type="text"
                                        value={data.bpjs_kesehatan}
                                        onChange={(e) => setData('bpjs_kesehatan', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter BPJS Kesehatan number"
                                    />
                                </FormField>

                                <FormField label="BPJS Kesehatan Family" error={errors.bpjs_kesehatan_family}>
                                    <select
                                        value={data.bpjs_kesehatan_family}
                                        onChange={(e) => setData('bpjs_kesehatan_family', e.target.value)}
                                        className="form-input"
                                    >
                                        {bpjsFamilyOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="NPWP" error={errors.npwp}>
                                    <input
                                        type="text"
                                        value={data.npwp}
                                        onChange={(e) => setData('npwp', e.target.value)}
                                        className="form-input"
                                        placeholder="00.000.000.0-000.000"
                                    />
                                </FormField>

                                <FormField label="Currency" error={errors.currency}>
                                    <select
                                        value={data.currency}
                                        onChange={(e) => setData('currency', e.target.value)}
                                        className="form-input"
                                    >
                                        {currencyOptions.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="Beginning Netto" error={errors.beginning_netto}>
                                    <input
                                        type="number"
                                        value={data.beginning_netto}
                                        onChange={(e) => setData('beginning_netto', e.target.value)}
                                        className="form-input"
                                        min="0"
                                    />
                                </FormField>

                                <FormField label="PPH21 Paid" error={errors.pph21_paid}>
                                    <input
                                        type="number"
                                        value={data.pph21_paid}
                                        onChange={(e) => setData('pph21_paid', e.target.value)}
                                        className="form-input"
                                        min="0"
                                    />
                                </FormField>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <FormField label="BPJS Ketenagakerjaan Date" error={errors.bpjs_ketenagakerjaan_date}>
                                    <input
                                        type="date"
                                        value={data.bpjs_ketenagakerjaan_date}
                                        onChange={(e) => setData('bpjs_ketenagakerjaan_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="BPJS Kesehatan Date" error={errors.bpjs_kesehatan_date}>
                                    <input
                                        type="date"
                                        value={data.bpjs_kesehatan_date}
                                        onChange={(e) => setData('bpjs_kesehatan_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="Jaminan Pensiun Date" error={errors.jaminan_pensiun_date}>
                                    <input
                                        type="date"
                                        value={data.jaminan_pensiun_date}
                                        onChange={(e) => setData('jaminan_pensiun_date', e.target.value)}
                                        className="form-input"
                                    />
                                </FormField>
                            </div>

                            {/* Payroll Components Section */}
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Component</h3>

                                {data.payroll_components.length > 0 && (
                                    <div className="space-y-4 mb-4">
                                        {data.payroll_components.map((component, index) => (
                                            <div key={index} className="border-b border-gray-200 pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={component.name}
                                                                onChange={(e) => {
                                                                    const updated = [...data.payroll_components];
                                                                    updated[index].name = e.target.value;
                                                                    setData('payroll_components', updated);
                                                                }}
                                                                className="text-sm font-medium text-gray-700 border-none bg-transparent p-0 focus:ring-0 focus:outline-none"
                                                                placeholder="Component Name"
                                                            />
                                                            {component.type === 'formula' && (
                                                                <span className="px-2 py-0.5 text-xs bg-red-700 text-white rounded">Formula</span>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="number"
                                                            value={component.amount}
                                                            onChange={(e) => {
                                                                const updated = [...data.payroll_components];
                                                                updated[index].amount = e.target.value;
                                                                setData('payroll_components', updated);
                                                            }}
                                                            className="form-input w-full text-gray-600"
                                                            min="0"
                                                            placeholder="0"
                                                        />
                                                        {component.type === 'formula' && component.formula && (
                                                            <p className="text-xs text-gray-500 mt-1">Formula: {component.formula}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = data.payroll_components.filter((_, i) => i !== index);
                                                            setData('payroll_components', updated);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 rounded ml-4"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('payroll_components', [
                                            ...data.payroll_components,
                                            { name: '', amount: 0, type: 'formula', formula: 'basic_salary * 0.1' }
                                        ]);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase"
                                >
                                    Add New Component
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bank Info */}
                    {activeSection === 'bank' && (
                        <div className="space-y-6">
                            <SectionHeader
                                title="Bank Information"
                                description="Enter bank account details for salary transfer"
                            />
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField label="Bank Name" error={errors.bank_name}>
                                    <select
                                        value={data.bank_name}
                                        onChange={(e) => setData('bank_name', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="BCA">BCA</option>
                                        <option value="Mandiri">Mandiri</option>
                                        <option value="BNI">BNI</option>
                                        <option value="BRI">BRI</option>
                                        <option value="CIMB Niaga">CIMB Niaga</option>
                                        <option value="Danamon">Danamon</option>
                                        <option value="Permata">Permata</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormField>

                                <FormField label="Account Number" error={errors.bank_account_number}>
                                    <input
                                        type="text"
                                        value={data.bank_account_number}
                                        onChange={(e) => setData('bank_account_number', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter account number"
                                    />
                                </FormField>

                                <FormField label="Account Holder Name" error={errors.bank_account_holder} className="md:col-span-2">
                                    <input
                                        type="text"
                                        value={data.bank_account_holder}
                                        onChange={(e) => setData('bank_account_holder', e.target.value)}
                                        className="form-input"
                                        placeholder="Name as per bank account"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Link href="/employees" className="btn-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing ? 'Adding...' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="px-6 py-4 bg-red-600">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Missing Required Fields
                            </h3>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                Please fill in the following mandatory fields before adding the employee:
                            </p>
                            <ul className="space-y-2">
                                {validationErrors.map(({ field, label, section }) => (
                                    <li
                                        key={field}
                                        className="flex items-center gap-2 text-red-600 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors"
                                        onClick={() => {
                                            setActiveSection(section);
                                            setShowValidationModal(false);
                                        }}
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">{label}</span>
                                        <span className="text-gray-400 text-sm">({section === 'personal' ? 'Personal Data' : 'Employment Data'})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowValidationModal(false)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Okay, Got It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MekariLayout>
    );
}

function SectionHeader({ title, description }) {
    return (
        <div className="pb-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
    );
}

function FormField({ label, required, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
