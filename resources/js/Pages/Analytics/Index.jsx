import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function AnalyticsDashboard({ auth }) {
    // Headcount Growth
    const headcountData = [
        { month: 'Jul', count: 142 },
        { month: 'Aug', count: 145 },
        { month: 'Sep', count: 148 },
        { month: 'Oct', count: 150 },
        { month: 'Nov', count: 153 },
        { month: 'Dec', count: 154 },
        { month: 'Jan', count: 156 },
    ];

    // Turnover Rate
    const turnoverData = [
        { month: 'Jul', rate: 2.1 },
        { month: 'Aug', rate: 1.8 },
        { month: 'Sep', rate: 2.5 },
        { month: 'Oct', rate: 1.5 },
        { month: 'Nov', rate: 2.0 },
        { month: 'Dec', rate: 1.2 },
        { month: 'Jan', rate: 1.8 },
    ];

    // Absenteeism by Department
    const absenteeismData = [
        { department: 'IT', rate: 2.5 },
        { department: 'HR', rate: 1.8 },
        { department: 'Sales', rate: 4.2 },
        { department: 'Finance', rate: 1.5 },
        { department: 'Ops', rate: 3.8 },
    ];

    // Department Distribution
    const departmentData = [
        { name: 'IT', value: 45, color: '#3b82f6' },
        { name: 'Sales', value: 38, color: '#10b981' },
        { name: 'Operations', value: 32, color: '#f59e0b' },
        { name: 'HR', value: 15, color: '#8b5cf6' },
        { name: 'Finance', value: 18, color: '#ef4444' },
        { name: 'Marketing', value: 8, color: '#06b6d4' },
    ];

    // Payroll Cost
    const payrollCostData = [
        { month: 'Jul', cost: 980 },
        { month: 'Aug', cost: 995 },
        { month: 'Sep', cost: 1020 },
        { month: 'Oct', cost: 1050 },
        { month: 'Nov', cost: 1080 },
        { month: 'Dec', cost: 1150 }, // with THR
        { month: 'Jan', cost: 1100 },
    ];

    // Gender Distribution
    const genderData = [
        { name: 'Laki-laki', value: 98, color: '#3b82f6' },
        { name: 'Perempuan', value: 58, color: '#ec4899' },
    ];

    return (
        <Layout user={auth?.user}>
            <Head title="HR Analytics" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">HR Analytics Dashboard</h1>
                        <p className="text-sm text-gray-500">Insight dan analisis SDM PT Sinar Asta Nusantara</p>
                    </div>
                    <select className="input w-auto">
                        <option>Tahun 2024</option>
                        <option>Tahun 2023</option>
                    </select>
                </div>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Karyawan"
                        value="156"
                        change="+2.6%"
                        changeType="positive"
                        icon="👥"
                    />
                    <MetricCard
                        title="Turnover Rate"
                        value="1.8%"
                        change="-0.4%"
                        changeType="positive"
                        icon="📉"
                    />
                    <MetricCard
                        title="Avg. Tenure"
                        value="3.2 tahun"
                        change="+0.3"
                        changeType="positive"
                        icon="⏱️"
                    />
                    <MetricCard
                        title="Cost per Employee"
                        value="Rp 7.1jt"
                        change="+5%"
                        changeType="negative"
                        icon="💰"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Headcount Growth */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📈 Headcount Growth</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={headcountData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#colorCount)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Turnover Rate */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">📉 Turnover Rate (%)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={turnoverData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 5]} />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Absenteeism */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">🏥 Absenteeism Rate by Dept (%)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={absenteeismData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 5]} />
                                    <YAxis dataKey="department" type="category" width={60} />
                                    <Tooltip formatter={(value) => `${value}%`} />
                                    <Bar dataKey="rate" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Department Distribution */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">🏢 Distribusi Departemen</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                        labelLine={false}
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gender Distribution */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">👥 Distribusi Gender</h3>
                        <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Payroll Cost Analysis */}
                <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-4">💰 Payroll Cost Analysis (Juta Rupiah)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={payrollCostData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => `Rp ${value}jt`} />
                                <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">* Desember termasuk THR</p>
                </div>
            </div>
        </Layout>
    );
}

function MetricCard({ title, value, change, changeType, icon }) {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className={`text-sm font-medium ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {change}
                </span>
            </div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
    );
}
