import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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
            <Head title="Login" />
            <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-white">HRIS</h1>
                        </div>
                        <p className="text-primary-200">PT Sinar Asta Nusantara</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                            Selamat Datang
                        </h2>
                        <p className="text-gray-500 text-center mb-8">
                            Masuk ke akun Anda untuk melanjutkan
                        </p>

                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="login" className="label">
                                    Email atau Username
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    value={data.login}
                                    onChange={(e) => setData('login', e.target.value)}
                                    className="input"
                                    placeholder="Masukkan email atau username"
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.login && (
                                    <p className="mt-1 text-sm text-red-600">{errors.login}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="label">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                                </label>

                                {canResetPassword && (
                                    <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                                        Lupa password?
                                    </a>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full btn-primary py-3 text-lg"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-primary-300 text-sm mt-6">
                        © 2024 PT Sinar Asta Nusantara. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
