import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login — SAN HRMS" />
            <div className="min-h-screen flex">
                {/* Left Panel — Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
                    {/* Subtle geometric background */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950"></div>
                        <div className="absolute top-20 -left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl"></div>
                        {/* Grid pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative z-10 px-16 max-w-lg">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white tracking-tight">SAN HRMS</h1>
                                <p className="text-xs text-slate-400">Human Resource Management System</p>
                            </div>
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl font-light text-white leading-snug mb-4">
                            Kelola data karyawan<br />
                            <span className="font-semibold">lebih mudah dan terstruktur.</span>
                        </h2>

                        <p className="text-slate-400 text-sm leading-relaxed mb-10">
                            Platform manajemen karyawan terpusat untuk PT. Sinergi Asta Nusantara. 
                            Akses data, kelola profil, dan pantau perkembangan tim Anda.
                        </p>

                        {/* Feature highlights */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-300">Database karyawan terpusat dan terstruktur</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-300">Import & export data karyawan dengan mudah</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-300">Proses rekrutmen dan onboarding terintegrasi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
                    <div className="w-full max-w-sm">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="text-lg font-semibold text-slate-900">SAN HRMS</span>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 mb-1">
                                Masuk ke akun Anda
                            </h2>
                            <p className="text-sm text-slate-500 mb-8">
                                Gunakan kredensial yang telah diberikan oleh administrator.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="login" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Email atau Username
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                                    placeholder="nama@perusahaan.com"
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.login && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.login}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
                                    />
                                    <span className="ml-2 text-sm text-slate-600">Ingat saya</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>

                        <p className="text-center text-xs text-slate-400 mt-8">
                            © {new Date().getFullYear()} PT. Sinergi Asta Nusantara
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
