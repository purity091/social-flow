import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const { signIn, signUp, isConfigured } = useAuth();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (isLoginMode) {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message === 'Invalid login credentials'
                    ? 'بيانات الدخول غير صحيحة'
                    : error.message
                );
            }
        } else {
            const { error } = await signUp(email, password);
            if (error) {
                setError(error.message);
            } else {
                setMessage('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتفعيل الحساب.');
                setIsLoginMode(true);
            }
        }

        setLoading(false);
    };

    if (!isConfigured) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 font-['IBM_Plex_Sans_Arabic']">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center border border-white/20">
                    <div className="text-6xl mb-6">⚠️</div>
                    <h1 className="text-2xl font-bold text-white mb-4">Supabase غير مُعد</h1>
                    <p className="text-white/70 mb-6">
                        لاستخدام نظام المصادقة وقاعدة البيانات، يرجى إعداد Supabase:
                    </p>
                    <div className="bg-black/30 rounded-xl p-4 text-left text-sm text-white/80 font-mono">
                        <p className="mb-2"># أنشئ ملف .env.local</p>
                        <p className="text-emerald-400">VITE_SUPABASE_URL=https://xxx.supabase.co</p>
                        <p className="text-emerald-400">VITE_SUPABASE_ANON_KEY=your-key</p>
                    </div>
                    <p className="text-white/50 text-xs mt-6">
                        التطبيق يعمل حالياً في الوضع المحلي (بدون حفظ دائم)
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 font-['IBM_Plex_Sans_Arabic']">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                        <span className="text-5xl">📱</span>
                        <span>SocialFlow</span>
                    </h1>
                    <p className="text-white/60">نظام إدارة المحتوى الذكي</p>
                </div>

                {/* Form Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">كلمة المرور</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    جاري المعالجة...
                                </span>
                            ) : (
                                isLoginMode ? 'دخول' : 'إنشاء حساب'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        {/* 
                        <button
                            onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setMessage(''); }}
                            className="text-white/70 hover:text-white text-sm transition-colors"
                        >
                            {isLoginMode ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
                        </button>
                        */}
                        <p className="text-white/40 text-xs">
                            التسجيل متوقف حالياً. يرجى التواصل مع الإدارة للحصول على حساب.
                        </p>
                    </div>
                </div>

                <p className="text-center text-white/40 text-xs mt-6">
                    © 2024 SocialFlow. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
