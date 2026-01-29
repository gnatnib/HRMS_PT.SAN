import { Head, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';

/**
 * Halaman Loan Detail sesuai dengan UI reference Mekari.
 * Menampilkan detail pinjaman dengan jadwal cicilan.
 */
export default function LoanDetail({ auth, loan = {}, schedule = [], loanTypes = [], flash }) {
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    // Demo data jika tidak ada data dari server
    const demoLoan = loan.id ? loan : {
        id: 1,
        employee_id: '000-003',
        employee_name: 'Sheila Hartono',
        loan_name: 'Koperasi Karyawan',
        principal_amount: 5000000,
        total_installments: 6,
        interest_type: 'Flat',
        interest_rate: 0,
        monthly_installment: 833333,
        remaining_amount: 5000000,
        paid_installments: 0,
        effective_date: '2026-01-01',
        status: 'active',
    };

    const demoSchedule = schedule.length > 0 ? schedule : [
        { installment: 1, payment_date: '2026-01-31', basic_payment: 833333, interest: 0, total: 833333, remaining: 4166667, is_paid: false },
        { installment: 2, payment_date: '2026-02-28', basic_payment: 833333, interest: 0, total: 833333, remaining: 3333334, is_paid: false },
        { installment: 3, payment_date: '2026-03-31', basic_payment: 833333, interest: 0, total: 833333, remaining: 2500001, is_paid: false },
        { installment: 4, payment_date: '2026-04-30', basic_payment: 833334, interest: 0, total: 833334, remaining: 1666667, is_paid: false },
        { installment: 5, payment_date: '2026-05-31', basic_payment: 833334, interest: 0, total: 833334, remaining: 833333, is_paid: false },
        { installment: 6, payment_date: '2026-06-30', basic_payment: 833333, interest: 0, total: 833333, remaining: 0, is_paid: false },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID').format(amount);
    };

    const handleExportSchedule = () => {
        window.location.href = `/finance/loans/${demoLoan.id}/export-schedule`;
    };

    const toggleRowSelection = (idx) => {
        if (selectedRows.includes(idx)) {
            setSelectedRows(selectedRows.filter(i => i !== idx));
        } else {
            setSelectedRows([...selectedRows, idx]);
        }
    };

    const toggleAllRows = () => {
        if (selectedRows.length === demoSchedule.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(demoSchedule.map((_, i) => i));
        }
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title={`Loan - ${demoLoan.employee_name}`} />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={() => router.visit('/loans')}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Kembali ke daftar Loans
                </button>

                {/* Header Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Employee Info */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {demoLoan.employee_name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{demoLoan.employee_id}</p>
                                    <p className="font-semibold text-gray-900">{demoLoan.employee_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loan Name */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Loan type</label>
                            <p className="text-sm font-medium text-gray-900">{demoLoan.loan_name}</p>
                        </div>

                        {/* Principal */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Loan amount</label>
                            <p className="text-sm font-medium text-gray-900">Rp {formatCurrency(demoLoan.principal_amount)}</p>
                        </div>

                        {/* Monthly */}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Monthly deduct</label>
                            <p className="text-sm font-medium text-gray-900">Rp {formatCurrency(demoLoan.monthly_installment)}</p>
                        </div>
                    </div>

                    {/* Additional Info Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-100">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Installments</label>
                            <p className="text-sm font-medium text-gray-900">{demoLoan.paid_installments}/{demoLoan.total_installments}x</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Interest type</label>
                            <p className="text-sm font-medium text-gray-900">{demoLoan.interest_type} ({demoLoan.interest_rate}%)</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Remaining</label>
                            <p className="text-sm font-medium text-gray-900">Rp {formatCurrency(demoLoan.remaining_amount)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Effective date</label>
                            <p className="text-sm font-medium text-gray-900">{demoLoan.effective_date}</p>
                        </div>
                    </div>
                </div>

                {/* Schedule Table Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Installment Schedule</h2>
                    <div className="flex items-center gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        >
                            <option value="">All status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                        <button
                            onClick={handleExportSchedule}
                            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export
                        </button>
                    </div>
                </div>

                {/* Installment Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === demoSchedule.length}
                                        onChange={toggleAllRows}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Installment
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Payment date
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Basic payment
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Interest
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Remaining loan
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {demoSchedule
                                .filter(row => {
                                    if (filterStatus === 'paid') return row.is_paid;
                                    if (filterStatus === 'unpaid') return !row.is_paid;
                                    return true;
                                })
                                .map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(idx)}
                                                onChange={() => toggleRowSelection(idx)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                                {row.installment}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(row.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            Rp {formatCurrency(row.basic_payment)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                                            Rp {formatCurrency(row.interest)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                            Rp {formatCurrency(row.total)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right text-gray-600">
                                            Rp {formatCurrency(row.remaining)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {row.is_paid ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                                    Unpaid
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-200">
                            <tr>
                                <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900">Total</td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                    Rp {formatCurrency(demoSchedule.reduce((sum, r) => sum + r.basic_payment, 0))}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                                    Rp {formatCurrency(demoSchedule.reduce((sum, r) => sum + r.interest, 0))}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                                    Rp {formatCurrency(demoSchedule.reduce((sum, r) => sum + r.total, 0))}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="text-sm text-gray-500">
                    <p>* Installment schedule is recalculated when loan is approved</p>
                    <p>* Payment will be auto-deducted from monthly salary</p>
                </div>
            </div>
        </MekariLayout>
    );
}
