import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setGeneralError('');

        try {
            await login(form.username, form.password);
            navigate('/', { replace: true });
        } catch (err) {
            const res = err.response;

            // 422 → validation error dari Laravel
            if (res?.status === 422 && res.data?.errors) {
                setErrors(res.data.errors);
            }
            // 403 → akun nonaktif
            else if (res?.status === 403) {
                setGeneralError(res.data?.message || 'Akun Anda tidak aktif.');
            }
            // 401 / lainnya
            else {
                setGeneralError(
                    res?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 selection:bg-orange-200 selection:text-orange-900">
            <div className="w-full max-w-md">
                {/* Card Putih Bersih */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Logo Pengganti Gembok */}
                        <div className="mx-auto w-16 h-16 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center mb-4 shadow-sm">
                            <img
                                src="/logo.png"
                                alt="Logo RSUD"
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/40?text=RSUD";
                                }}
                            />
                        </div>

                        {/* Kalimat Header yang Dirapikan */}
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                            Sistem Informasi Kepegawaian (SDM)
                        </h1>
                        <p className="text-orange-600 font-semibold text-xs mt-1 uppercase tracking-wider">
                            RSUD dr. R. Soedarsono Kota Pasuruan
                        </p>
                        <p className="text-slate-400 text-xs mt-2">
                            Silakan masuk menggunakan akun internal Anda
                        </p>
                    </div>

                    {/* Error umum */}
                    {generalError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {generalError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                value={form.username}
                                onChange={handleChange}
                                disabled={submitting}
                                className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder-slate-400 
                  focus:outline-none focus:ring-2 transition disabled:bg-slate-100
                  ${errors.username
                                        ? 'border-red-400 focus:ring-red-300'
                                        : 'border-slate-300 focus:ring-orange-500 focus:border-transparent'
                                    }`}
                                placeholder="Masukkan username"
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-600">{errors.username[0]}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-1.5"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={handleChange}
                                    disabled={submitting}
                                    className={`w-full px-4 py-2.5 pr-12 border rounded-lg text-slate-900 placeholder-slate-400 
                    focus:outline-none focus:ring-2 transition disabled:bg-slate-100
                    ${errors.password
                                            ? 'border-red-400 focus:ring-red-300'
                                            : 'border-slate-300 focus:ring-orange-500 focus:border-transparent'
                                        }`}
                                    placeholder="Masukkan password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-lg transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-6 font-medium">
                    © {new Date().getFullYear()} RSUD dr. R. Soedarsono — Kota Pasuruan
                </p>
            </div>
        </div>
    );
}