import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/Layout';
import { useState, useEffect, useRef } from 'react';

export default function LiveTracking({ auth, employees = [] }) {
    const mapRef = useRef(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Demo data for field employees
    const fieldEmployees = employees.length > 0 ? employees : [
        { id: 1, name: 'Ahmad Fauzi', role: 'Sales', lat: -6.2088, lng: 106.8456, status: 'active', lastUpdate: '2 min ago' },
        { id: 2, name: 'Budi Santoso', role: 'Technician', lat: -6.2200, lng: 106.8300, status: 'active', lastUpdate: '5 min ago' },
        { id: 3, name: 'Rudi Hartono', role: 'Sales', lat: -6.1900, lng: 106.8600, status: 'idle', lastUpdate: '15 min ago' },
        { id: 4, name: 'Dewi Lestari', role: 'Driver', lat: -6.2400, lng: 106.8200, status: 'offline', lastUpdate: '1 hour ago' },
    ];

    return (
        <Layout user={auth?.user}>
            <Head title="Live Tracking" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
                        <p className="text-sm text-gray-500">Monitor lokasi karyawan lapangan secara real-time</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-sm">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {fieldEmployees.filter(e => e.status === 'active').length} Online
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Map Container */}
                    <div className="lg:col-span-3 card p-0 overflow-hidden">
                        <div
                            ref={mapRef}
                            className="w-full h-[500px] bg-gray-100 flex items-center justify-center relative"
                        >
                            {/* Placeholder for Leaflet Map */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 mx-auto text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                        <p className="text-primary-600 font-medium">Peta Interaktif</p>
                                        <p className="text-sm text-primary-500 mt-1">Integrasi Leaflet/MapBox</p>
                                    </div>
                                </div>

                                {/* Demo markers */}
                                {fieldEmployees.map((emp, idx) => (
                                    <div
                                        key={emp.id}
                                        className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 ${emp.status === 'active' ? 'bg-green-500' :
                                                emp.status === 'idle' ? 'bg-amber-500' : 'bg-gray-400'
                                            }`}
                                        style={{
                                            top: `${20 + idx * 20}%`,
                                            left: `${20 + idx * 15}%`
                                        }}
                                        onClick={() => setSelectedEmployee(emp)}
                                    >
                                        <span className="text-white font-bold text-sm">{emp.name.charAt(0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Employee List */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-4">Karyawan Lapangan</h3>
                        <div className="space-y-3">
                            {fieldEmployees.map((emp) => (
                                <div
                                    key={emp.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEmployee?.id === emp.id
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    onClick={() => setSelectedEmployee(emp)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${emp.status === 'active' ? 'bg-green-500' :
                                                emp.status === 'idle' ? 'bg-amber-500' : 'bg-gray-400'
                                            }`}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{emp.name}</p>
                                            <p className="text-xs text-gray-500">{emp.role}</p>
                                        </div>
                                        <StatusDot status={emp.status} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Update: {emp.lastUpdate}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Employee Detail */}
                {selectedEmployee && (
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ${selectedEmployee.status === 'active' ? 'bg-green-500' :
                                        selectedEmployee.status === 'idle' ? 'bg-amber-500' : 'bg-gray-400'
                                    }`}>
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedEmployee.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedEmployee.role}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Koordinat GPS</p>
                                <p className="font-mono text-sm">{selectedEmployee.lat}, {selectedEmployee.lng}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}

function StatusDot({ status }) {
    const colors = {
        active: 'bg-green-500',
        idle: 'bg-amber-500',
        offline: 'bg-gray-400',
    };

    return (
        <span className={`w-2 h-2 rounded-full ${colors[status]} ${status === 'active' ? 'animate-pulse' : ''}`}></span>
    );
}
