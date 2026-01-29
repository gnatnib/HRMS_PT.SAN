import { Head, useForm, Link, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

export default function EmployeeEdit({ auth, employee, departments = [], positions = [], contracts = [] }) {
    const [activeSection, setActiveSection] = useState('personal');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        // Personal Info
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        father_name: employee.father_name || '',
        mother_name: employee.mother_name || '',
        gender: employee.gender || 'male',
        birth_and_place: employee.birth_and_place || '',
        national_number: employee.national_number || '',
        mobile_number: employee.mobile_number || '',
        email: employee.email || '',
        address: employee.address || '',
        degree: employee.degree || '',
        // Employment Info
        employee_code: employee.employee_code || '',
        barcode: employee.barcode || '',
        contract_id: employee.contract_id || '',
        join_date: employee.join_date || '',
        is_active: employee.is_active ?? true,
        // Payroll Info
        basic_salary: employee.basic_salary || 0,
        ptkp_status: employee.ptkp_status || 'TK/0',
        tax_configuration: employee.tax_configuration || 'Gross',
        prorate_type: employee.prorate_type || 'Based on Working Day',
        salary_type: employee.salary_type || 'Monthly',
        salary_configuration: employee.salary_configuration || 'Taxable',
        overtime_status: employee.overtime_status || 'Eligible',
        employee_tax_status: employee.employee_tax_status || 'Pegawai Tetap',
        jht_configuration: employee.jht_configuration || 'Default',
        bpjs_kesehatan_config: employee.bpjs_kesehatan_config || 'By Company',
        jaminan_pensiun_config: employee.jaminan_pensiun_config || 'Default',
        // Bank Info
        bank_name: employee.bank_name || '',
        bank_account_number: employee.bank_account_number || '',
        bank_account_holder: employee.bank_account_holder || '',
        // Others
        max_leave_allowed: employee.max_leave_allowed || 12,
        profile_photo: null,
    });

    const sections = [
        { id: 'personal', name: 'Personal Data' },
        { id: 'employment', name: 'Employment Data' },
        { id: 'payroll', name: 'Payroll Info' },
        { id: 'bank', name: 'Bank Info' },
    ];

    const ptkpOptions = ['TK/0', 'TK/1', 'TK/2', 'TK/3', 'K/0', 'K/1', 'K/2', 'K/3'];
    const taxConfigs = ['Gross', 'Gross Up', 'Nett'];
    const salaryTypes = ['Monthly', 'Hourly', 'Daily'];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/employees/${employee.id}`, {
            forceFormData: true,
        });
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title={`Edit - ${employee.first_name}`} />

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
                    <nav className="flex gap-8">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={`pb-3 text-sm font-medium transition-colors ${activeSection === section.id
                                        ? 'text-red-600 border-b-2 border-red-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {section.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <form onSubmit={handleSubmit} className="widget-card space-y-6">
                    {/* Personal Data */}
                    {activeSection === 'personal' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField label="First Name" required error={errors.first_name}>
                                <input
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Last Name" error={errors.last_name}>
                                <input
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className="form-input"
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
                                />
                            </FormField>

                            <FormField label="National ID (KTP)" error={errors.national_number}>
                                <input
                                    type="text"
                                    value={data.national_number}
                                    onChange={(e) => setData('national_number', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Phone Number" error={errors.mobile_number}>
                                <input
                                    type="tel"
                                    value={data.mobile_number}
                                    onChange={(e) => setData('mobile_number', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Email" error={errors.email}>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Education Degree" error={errors.degree}>
                                <input
                                    type="text"
                                    value={data.degree}
                                    onChange={(e) => setData('degree', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Father's Name" error={errors.father_name}>
                                <input
                                    type="text"
                                    value={data.father_name}
                                    onChange={(e) => setData('father_name', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Mother's Name" error={errors.mother_name}>
                                <input
                                    type="text"
                                    value={data.mother_name}
                                    onChange={(e) => setData('mother_name', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Address" error={errors.address} className="md:col-span-2">
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="form-input"
                                    rows={3}
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
                        </div>
                    )}

                    {/* Employment Data */}
                    {activeSection === 'employment' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField label="Employee Code" error={errors.employee_code}>
                                <input
                                    type="text"
                                    value={data.employee_code}
                                    onChange={(e) => setData('employee_code', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Barcode" error={errors.barcode}>
                                <input
                                    type="text"
                                    value={data.barcode}
                                    onChange={(e) => setData('barcode', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Contract Type" error={errors.contract_id}>
                                <select
                                    value={data.contract_id}
                                    onChange={(e) => setData('contract_id', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="">Select Contract</option>
                                    {contracts.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Join Date" error={errors.join_date}>
                                <input
                                    type="date"
                                    value={data.join_date}
                                    onChange={(e) => setData('join_date', e.target.value)}
                                    className="form-input"
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

                            <FormField label="Max Leave Allowed" error={errors.max_leave_allowed}>
                                <input
                                    type="number"
                                    value={data.max_leave_allowed}
                                    onChange={(e) => setData('max_leave_allowed', e.target.value)}
                                    className="form-input"
                                    min="0"
                                    max="30"
                                />
                            </FormField>
                        </div>
                    )}

                    {/* Payroll Info */}
                    {activeSection === 'payroll' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField label="Basic Salary" error={errors.basic_salary}>
                                <input
                                    type="number"
                                    value={data.basic_salary}
                                    onChange={(e) => setData('basic_salary', e.target.value)}
                                    className="form-input"
                                    min="0"
                                />
                            </FormField>

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

                            <FormField label="Salary Type" error={errors.salary_type}>
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

                            <FormField label="BPJS Kesehatan" error={errors.bpjs_kesehatan_config}>
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
                    )}

                    {/* Bank Info */}
                    {activeSection === 'bank' && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField label="Bank Name" error={errors.bank_name}>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Account Number" error={errors.bank_account_number}>
                                <input
                                    type="text"
                                    value={data.bank_account_number}
                                    onChange={(e) => setData('bank_account_number', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Account Holder Name" error={errors.bank_account_holder}>
                                <input
                                    type="text"
                                    value={data.bank_account_holder}
                                    onChange={(e) => setData('bank_account_holder', e.target.value)}
                                    className="form-input"
                                />
                            </FormField>
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
                            {processing ? 'Saving...' : 'Update Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </MekariLayout>
    );
}

function FormField({ label, required, error, children, className = '' }) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
