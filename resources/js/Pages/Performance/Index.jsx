import { Head } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function PerformanceIndex({ auth }) {
    const [selectedPeriod, setSelectedPeriod] = useState('Q1 2024');

    const employees = [
        { id: 1, name: 'Ahmad Fauzi', department: 'IT', position: 'Senior Engineer', score: 4.5, status: 'excellent' },
        { id: 2, name: 'Siti Rahayu', department: 'HR', position: 'HR Manager', score: 4.2, status: 'good' },
        { id: 3, name: 'Budi Santoso', department: 'Sales', position: 'Sales Lead', score: 3.8, status: 'good' },
        { id: 4, name: 'Dewi Lestari', department: 'Finance', position: 'Accountant', score: 4.0, status: 'good' },
        { id: 5, name: 'Rudi Hartono', department: 'Operations', position: 'Supervisor', score: 3.2, status: 'needs_improvement' },
    ];

    const radarData = [
        { skill: 'Technical', score: 85, fullMark: 100 },
        { skill: 'Communication', score: 78, fullMark: 100 },
        { skill: 'Leadership', score: 72, fullMark: 100 },
        { skill: 'Teamwork', score: 90, fullMark: 100 },
        { skill: 'Problem Solving', score: 82, fullMark: 100 },
        { skill: 'Time Management', score: 75, fullMark: 100 },
    ];

    const departmentScores = [
        { dept: 'IT', score: 4.3 },
        { dept: 'HR', score: 4.0 },
        { dept: 'Sales', score: 3.7 },
        { dept: 'Finance', score: 4.1 },
        { dept: 'Ops', score: 3.5 },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'bg-green-100 text-green-700';
            case 'good': return 'bg-blue-100 text-blue-700';
            case 'needs_improvement': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'excellent': return 'Excellent';
            case 'good': return 'Good';
            case 'needs_improvement': return 'Needs Improvement';
            default: return status;
        }
    };

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Performance Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Performance Management</h1>
                        <p className="text-sm text-gray-500">KPI & OKR tracking dan review karyawan</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="input w-auto"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option>Q1 2024</option>
                            <option>Q4 2023</option>
                            <option>Q3 2023</option>
                        </select>
                        <button className="btn-primary">+ Buat Review</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-4">
                    <StatCard icon="⭐" title="Avg. Score" value="3.94" subtitle="dari 5.0" />
                    <StatCard icon="🏆" title="Excellent" value="28" subtitle="karyawan" color="green" />
                    <StatCard icon="📈" title="Good" value="98" subtitle="karyawan" color="blue" />
                    <StatCard icon="📋" title="Review Pending" value="30" subtitle="belum dinilai" color="amber" />
                </div>

                {/* Charts */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">🎯 Skill Assessment (Company Avg)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Scores */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📊 Score per Departemen</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={departmentScores} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 5]} />
                                    <YAxis dataKey="dept" type="category" width={60} />
                                    <Tooltip />
                                    <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Employee List */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Review Terbaru</h3>
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">Lihat Semua</button>
                    </div>
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Departemen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                                                {emp.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.name}</p>
                                                <p className="text-sm text-gray-500">{emp.position}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full"
                                                    style={{ width: `${(emp.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="font-medium text-gray-900">{emp.score}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(emp.status)}`}>
                                            {getStatusLabel(emp.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-primary-600 hover:text-primary-700 text-sm">Detail</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MekariLayout>
    );
}

function StatCard({ icon, title, value, subtitle, color = 'gray' }) {
    const colors = {
        gray: 'bg-gray-100 text-gray-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <div className="card flex items-center gap-4">
            <span className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </span>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{subtitle}</p>
            </div>
        </div>
    );
}
