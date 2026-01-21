import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState } from 'react';

export default function OnboardingIndex({ auth }) {
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const newHires = [
        {
            id: 1,
            name: 'Robert Wilson',
            position: 'DevOps Engineer',
            department: 'IT',
            startDate: '2024-01-22',
            progress: 60,
            checklist: [
                { item: 'Create email account', done: true },
                { item: 'Setup workstation', done: true },
                { item: 'ID Card photo', done: true },
                { item: 'BPJS registration', done: false },
                { item: 'Welcome kit', done: false },
                { item: 'Team introduction', done: false },
            ]
        },
        {
            id: 2,
            name: 'Emily Brown',
            position: 'Marketing Lead',
            department: 'Marketing',
            startDate: '2024-01-29',
            progress: 30,
            checklist: [
                { item: 'Create email account', done: true },
                { item: 'Setup workstation', done: false },
                { item: 'ID Card photo', done: false },
                { item: 'BPJS registration', done: false },
                { item: 'Welcome kit', done: false },
                { item: 'Team introduction', done: false },
            ]
        },
    ];

    const offboardings = [
        {
            id: 1,
            name: 'Michael Chen',
            position: 'Data Analyst',
            department: 'IT',
            lastDate: '2024-02-15',
            progress: 40,
            checklist: [
                { item: 'Knowledge transfer', done: true },
                { item: 'Return laptop', done: false },
                { item: 'Return ID card', done: false },
                { item: 'Exit interview', done: false },
                { item: 'Final payslip', done: false },
            ]
        },
    ];

    return (
        <Layout user={auth?.user}>
            <Head title="Onboarding / Offboarding" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Onboarding & Offboarding</h1>
                        <p className="text-sm text-gray-500">Kelola checklist karyawan baru dan yang akan resign</p>
                    </div>
                    <button className="btn-primary">+ New Onboarding</button>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">👋</span>
                        <div>
                            <p className="text-sm text-gray-500">Onboarding</p>
                            <p className="text-2xl font-bold text-gray-900">{newHires.length}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-2xl">📤</span>
                        <div>
                            <p className="text-sm text-gray-500">Offboarding</p>
                            <p className="text-2xl font-bold text-gray-900">{offboardings.length}</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <span className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-2xl">📋</span>
                        <div>
                            <p className="text-sm text-gray-500">Completion Rate</p>
                            <p className="text-2xl font-bold text-gray-900">78%</p>
                        </div>
                    </div>
                </div>

                {/* Onboarding Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-green-500">●</span> Onboarding Karyawan Baru
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {newHires.map((hire) => (
                            <div key={hire.id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {hire.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{hire.name}</h3>
                                            <p className="text-sm text-gray-500">{hire.position} • {hire.department}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-400">Start: {hire.startDate}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Progress</span>
                                        <span className="font-medium text-gray-900">{hire.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full transition-all"
                                            style={{ width: `${hire.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-2">
                                    {hire.checklist.map((item, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.done}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                readOnly
                                            />
                                            <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {item.item}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Offboarding Section */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-amber-500">●</span> Offboarding
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {offboardings.map((emp) => (
                            <div key={emp.id} className="card border-l-4 border-amber-400">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                                            <p className="text-sm text-gray-500">{emp.position} • {emp.department}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-red-500">Last: {emp.lastDate}</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Exit Clearance</span>
                                        <span className="font-medium text-gray-900">{emp.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 rounded-full transition-all"
                                            style={{ width: `${emp.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-2">
                                    {emp.checklist.map((item, idx) => (
                                        <label key={idx} className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.done}
                                                className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                                readOnly
                                            />
                                            <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {item.item}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
