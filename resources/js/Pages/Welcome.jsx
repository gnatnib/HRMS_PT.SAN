import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
                <div className="flex flex-col items-center justify-center min-h-screen px-4">
                    {/* Logo */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-white">HRIS</h1>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-white md:text-5xl">
                            PT Sinar Asta Nusantara
                        </h2>
                        <p className="mt-4 text-lg text-primary-200">
                            Human Resource Information System
                        </p>
                        <p className="mt-2 text-primary-300">
                            Kelola karyawan, absensi, payroll, dan operasi HR Anda dalam satu platform terintegrasi.
                        </p>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-4 mt-10 sm:flex-row">
                        <Link
                            href="/login"
                            className="px-8 py-3 font-semibold text-center text-white transition-all rounded-lg bg-white/10 backdrop-blur hover:bg-white/20"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-8 py-3 font-semibold text-center transition-all rounded-lg bg-white text-primary-900 hover:bg-primary-50"
                        >
                            Ke Dashboard
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid max-w-4xl gap-6 mx-auto mt-16 md:grid-cols-3">
                        <FeatureCard
                            icon="👥"
                            title="Manajemen Karyawan"
                            description="Database karyawan terpusat dengan dokumen dan riwayat lengkap"
                        />
                        <FeatureCard
                            icon="⏰"
                            title="Absensi & GPS"
                            description="Clock in/out dengan validasi lokasi GPS real-time"
                        />
                        <FeatureCard
                            icon="💰"
                            title="Payroll Otomatis"
                            description="Perhitungan gaji, BPJS, dan PPh 21 sesuai regulasi"
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-16 text-sm text-primary-400">
                        © 2024 PT Sinar Asta Nusantara. Powered by Modern Laravel + React.
                    </div>
                </div>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="p-6 transition-all rounded-xl bg-white/5 backdrop-blur hover:bg-white/10">
            <div className="text-3xl">{icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-primary-300">{description}</p>
        </div>
    );
}
