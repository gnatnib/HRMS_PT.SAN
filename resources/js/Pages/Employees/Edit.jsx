import { Head, useForm, Link } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function EmployeeEdit({ 
    auth, 
    employee, 
    departments = [], 
    positions = [], 
    contracts = [],
    centers = []
}) {
    const [activeSection, setActiveSection] = useState('employment');
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        // Employment Data
        employee_code: employee.employee_code || '',
        barcode: employee.barcode || '',
        organization_id: employee.organization_id || '',
        position_id: employee.position_id || '',
        employment_status: employee.employment_status || 'Permanent',
        department_id: employee.department_id || '',
        join_date: employee.join_date || '',
        contract_id: employee.contract_id || '',

        // Personal Data
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        identity_type: employee.identity_type || 'KTP',
        identity_number: employee.identity_number || employee.national_number || '',
        mobile_number: employee.mobile_number || '',
        gender: employee.gender == 1 ? 'male' : 'female',
        birth_and_place: employee.birth_and_place || '',
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

    const sections = [
        { id: 'employment', name: 'Employment Data' },
        { id: 'personal', name: 'Personal Data' },
        { id: 'payroll', name: 'Payroll Info' },
        { id: 'bank', name: 'Bank Info' },
    ];

    const employmentStatuses = ['Permanent', 'Contract', 'Probation', 'Intern'];
    const ptkpOptions = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
    const taxConfigs = ['Gross', 'Gross Up', 'Nett'];
    const salaryTypes = ['Monthly', 'Hourly', 'Daily'];
    const prorateTypes = ['Based on Working Day', 'Based on Calendar Day', 'Custom on Working Day', 'Custom on Calendar Day'];
    const bpjsFamilyOptions = ['0', '1', '2', '3', '4', '5'];
    const currencyOptions = ['IDR', 'USD', 'SGD'];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate mandatory fields
        const requiredFields = [
            { field: 'first_name', label: 'First Name', section: 'personal' },
            { field: 'gender', label: 'Gender', section: 'personal' },
            { field: 'organization_id', label: 'Division', section: 'employment' },
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
        
        post(`/employees/${employee.id}`, {
            forceFormData: true,
        });
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title={`Edit - ${employee.first_name}`} />

            {/* Validation Modal */}
            {showValidationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Required Fields Missing</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Please fill in the following required fields:</p>
                        <ul className="space-y-2 mb-6">
                            {validationErrors.map((error, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveSection(error.section);
                                            setShowValidationModal(false);
                                        }}
                                        className="text-red-600 hover:text-red-700 hover:underline"
                                    >
                                        {error.label}
                                    </button>
                                    <span className="text-gray-400 text-xs">({error.section})</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() => setShowValidationModal(false)}
                            className="w-full btn-primary"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            {employee.profile_photo_path ? (
                                <img
                                    src={`/storage/${employee.profile_photo_path}`}
                                    alt={employee.first_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">
                                    {employee.first_name?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Edit {employee.first_name} {employee.last_name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {employee.employee_code || `EMP-${String(employee.id).padStart(4, '0')}`}
                            </p>
                        </div>
                    </div>
                    <Link href={`/employees/${employee.id}`} className="btn-secondary">
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
                                description="Enter organization and job information for the employee"
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

                                <FormField label="Division" required error={errors.organization_id}>
                                    <select
                                        value={data.organization_id}
                                        onChange={(e) => setData('organization_id', e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="">Select Organization</option>
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

                                <FormField label="Status" error={errors.is_active}>
                                    <select
                                        value={data.is_active ? 'active' : 'inactive'}
                                        onChange={(e) => setData('is_active', e.target.value === 'active')}
                                        className="form-input"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
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
                                        placeholder="Enter email address"
                                    />
                                </FormField>

                                <FormField label="Mobile Number" error={errors.mobile_number}>
                                    <input
                                        type="tel"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter mobile number"
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

                                <FormField label="Birth Place & Date" error={errors.birth_and_place}>
                                    <input
                                        type="text"
                                        value={data.birth_and_place}
                                        onChange={(e) => setData('birth_and_place', e.target.value)}
                                        className="form-input"
                                        placeholder="e.g. Jakarta, 01 January 1990"
                                    />
                                </FormField>

                                <FormField label="Identity Number (KTP)" error={errors.identity_number}>
                                    <input
                                        type="text"
                                        value={data.identity_number}
                                        onChange={(e) => setData('identity_number', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter identity number"
                                    />
                                </FormField>

                                <FormField label="Photo" error={errors.profile_photo}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('profile_photo', e.target.files[0])}
                                        className="form-input"
                                    />
                                    {employee.profile_photo_path && (
                                        <p className="mt-1 text-xs text-gray-500">Current: {employee.profile_photo_path}</p>
                                    )}
                                </FormField>

                                <FormField label="Address" error={errors.address} className="md:col-span-2">
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="form-input"
                                        rows={3}
                                        placeholder="Enter address"
                                    />
                                </FormField>
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
                                        placeholder="Enter BPJS number"
                                    />
                                </FormField>

                                <FormField label="BPJS Kesehatan" error={errors.bpjs_kesehatan}>
                                    <input
                                        type="text"
                                        value={data.bpjs_kesehatan}
                                        onChange={(e) => setData('bpjs_kesehatan', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter BPJS number"
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

                            {/* Payroll Components */}
                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Component</h3>
                                
                                {data.payroll_components.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                        {data.payroll_components.map((component, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {component.name}
                                                        {component.type === 'formula' && (
                                                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">Formula</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={component.amount}
                                                    onChange={(e) => {
                                                        const updated = [...data.payroll_components];
                                                        updated[index].amount = e.target.value;
                                                        setData('payroll_components', updated);
                                                    }}
                                                    className="form-input w-40"
                                                    min="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = data.payroll_components.filter((_, i) => i !== index);
                                                        setData('payroll_components', updated);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData('payroll_components', [
                                            ...data.payroll_components,
                                            { name: 'New Component', amount: 0, type: 'fixed' }
                                        ]);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    ADD NEW COMPONENT
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

                                <FormField label="Account Holder Name" error={errors.bank_account_holder}>
                                    <input
                                        type="text"
                                        value={data.bank_account_holder}
                                        onChange={(e) => setData('bank_account_holder', e.target.value)}
                                        className="form-input"
                                        placeholder="Enter account holder name"
                                    />
                                </FormField>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Link href={`/employees/${employee.id}`} className="btn-secondary">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary"
                        >
                            {processing ? 'Saving...' : 'Save Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </MekariLayout>
    );
}

function SectionHeader({ title, description }) {
    return (
        <div className="pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
    );
}

function FormField({ label, required, error, children, className = '' }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
