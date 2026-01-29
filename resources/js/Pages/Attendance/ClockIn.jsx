import { Head, useForm, router } from '@inertiajs/react';
import MekariLayout from '@/Layouts/MekariLayout';
import { useState, useEffect } from 'react';

export default function ClockIn({ auth, employee = null, todayAttendance = null, flash }) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [time, setTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, post, processing } = useForm({
        employee_id: employee?.id || auth?.user?.employee?.id || 1,
        latitude: null,
        longitude: null,
        clock_in_method: 'gps',
        clock_in_photo: null,
    });

    useEffect(() => {
        const intervalId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const getLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setLocation(loc);
                setData(prev => ({
                    ...prev,
                    latitude: loc.lat,
                    longitude: loc.lng,
                }));
                setError(null);
                setIsLoading(false);
            },
            (err) => {
                setError(`Error (${err.code}): ${err.message}`);
                setLocation(null);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleClockIn = () => {
        if (!location) {
            setError('Silakan ambil lokasi terlebih dahulu');
            return;
        }

        post('/attendance/clock-in', {
            preserveScroll: true,
        });
    };

    const handleClockOut = () => {
        router.post('/attendance/clock-out', {
            employee_id: data.employee_id,
            latitude: location?.lat,
            longitude: location?.lng,
        }, {
            preserveScroll: true,
        });
    };

    const formatTime = (date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    const hasCheckedIn = todayAttendance?.check_in;
    const hasCheckedOut = todayAttendance?.check_out;

    return (
        <MekariLayout user={auth?.user}>
            <Head title="Clock In / Out" />

            <div className="max-w-xl mx-auto text-center py-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                        ✓ {flash.success}
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Presence</h1>
                <p className="text-lg text-gray-600 mb-8">Absensi Cerdas Berbasis Lokasi GPS</p>

                <div className="bg-white shadow-xl rounded-2xl p-8 border border-primary-100">
                    <p className="text-sm text-gray-500 mb-1">Tanggal Hari Ini</p>
                    <p className="text-xl font-semibold text-gray-900 mb-6">{formatDate(time)}</p>

                    <div className="mb-8">
                        <p className="text-sm text-gray-500 mb-2">Waktu Saat Ini</p>
                        <p className="text-6xl font-mono font-bold text-primary-600">{formatTime(time)}</p>
                    </div>

                    {/* Today's Attendance Status */}
                    {todayAttendance && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-center gap-8 text-sm">
                                <div>
                                    <p className="text-gray-500">Clock In</p>
                                    <p className="font-semibold text-green-600">{todayAttendance.check_in || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Clock Out</p>
                                    <p className="font-semibold text-red-600">{todayAttendance.check_out || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Get Location Button */}
                    <button
                        onClick={getLocation}
                        disabled={isLoading}
                        className="w-full mb-4 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Mengambil lokasi...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {location ? 'Update Lokasi' : 'Ambil Lokasi GPS'}
                            </>
                        )}
                    </button>

                    {/* Location Display */}
                    {location && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                            <p className="text-sm text-green-600 mb-1 font-medium">✓ Lokasi Berhasil Diambil</p>
                            <p className="font-mono text-xs text-gray-600">
                                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                            </p>
                        </div>
                    )}

                    {error && (
                        <p className="mb-4 text-red-500 text-sm">{error}</p>
                    )}

                    {/* Clock In/Out Buttons */}
                    <div className="flex gap-4">
                        {!hasCheckedIn ? (
                            <button
                                onClick={handleClockIn}
                                disabled={!location || processing}
                                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${location && !processing
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                {processing ? 'Processing...' : 'Clock In'}
                            </button>
                        ) : !hasCheckedOut ? (
                            <button
                                onClick={handleClockOut}
                                disabled={processing}
                                className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                {processing ? 'Processing...' : 'Clock Out'}
                            </button>
                        ) : (
                            <div className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-gray-100 text-gray-500 text-center">
                                ✓ Absensi Hari Ini Selesai
                            </div>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 text-sm text-gray-500">
                    <p>Pastikan GPS aktif dan izinkan akses lokasi</p>
                </div>
            </div>
        </MekariLayout>
    );
}
