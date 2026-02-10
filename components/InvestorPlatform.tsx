import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Shield, TrendingUp, Users, Target, Globe } from 'lucide-react';

const InvestorPlatform: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const url = "https://al-investorbrand.vercel.app/news/social-content";
    const password = "admin123@@";

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Globe className="text-emerald-400" size={32} />
                            منصة المستثمر (Investor Brand)
                        </h1>
                        <p className="text-slate-300 max-w-2xl text-lg">
                            الوجهة الأولى لصناع المحتوى المالي والاستثماري. أدوات احترافية، تحليلات دقيقة، ومجتمع نخبوي.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[300px]">
                        <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">بيانات الدخول السريع</div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center group">
                                <span className="text-slate-300 text-sm">الرابط:</span>
                                <a href={url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-sm font-bold transition-colors">
                                    فتح المنصة <ExternalLink size={14} />
                                </a>
                            </div>
                            <div className="flex justify-between items-center bg-black/30 p-2 rounded-lg">
                                <span className="text-slate-300 text-sm ml-2">كلمة المرور:</span>
                                <div className="flex items-center gap-2">
                                    <code className="bg-black/50 px-2 py-1 rounded text-emerald-400 font-mono text-sm tracking-wider">{password}</code>
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                                        title="نسخ كلمة المرور"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                        <Target size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">الأهداف الاستراتيجية</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        تمكين المستثمرين من الوصول إلى أحدث تحليلات السوق والمحتوى الاجتماعي المؤثر. تهدف المنصة إلى سد الفجوة بين البيانات المالية المعقدة وصناع القرار.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                        <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">الموثوقية والأمان</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        بيئة آمنة للمعلومات المالية الحساسة. دخول حصري للأعضاء المصرح لهم فقط لضمان جودة ونزاهة المحتوى المتداول.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">النمو والتوسع</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        أدوات متقدمة لتوسيع نطاق التأثير الرقمي للمستثمرين وبناء علامة تجارية شخصية قوية في عالم المال والأعمال.
                    </p>
                </div>
            </div>

            {/* Content Preview / Iframe Area */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <Globe size={18} />
                        معاينة مباشرة
                    </h3>
                    <a href={url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                        فتح في نافذة جديدة <ExternalLink size={12} />
                    </a>
                </div>
                <div className="flex-1 bg-gray-100 relative">
                    <iframe
                        src={url}
                        className="w-full h-full border-0"
                        title="Investor Platform Preview"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition-opacity">
                        <p className="bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                            ملاحظة: بعض المواقع قد تمنع العرض داخل الإطار (Iframe)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorPlatform;
