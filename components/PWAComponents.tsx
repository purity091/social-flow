import React, { useState, useEffect } from 'react';
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';

// ─── PWA Install Banner ─────────────────────────────────────────

export const PWAInstallBanner: React.FC = () => {
    const { canInstall, isInstalled, install } = usePWAInstall();
    const [dismissed, setDismissed] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user dismissed before
        const wasDismissed = localStorage.getItem('pwa-install-dismissed');
        if (wasDismissed) {
            const dismissedAt = parseInt(wasDismissed);
            // Show again after 7 days
            if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
                setDismissed(true);
                return;
            }
        }

        // Show banner after a short delay
        if (canInstall && !isInstalled) {
            const timer = setTimeout(() => setShowBanner(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [canInstall, isInstalled]);

    const handleDismiss = () => {
        setShowBanner(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    const handleInstall = async () => {
        const accepted = await install();
        if (accepted) {
            setShowBanner(false);
        }
    };

    if (!showBanner || dismissed || isInstalled) return null;

    return (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[60] animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-4 shadow-2xl shadow-indigo-500/30 text-white relative overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-3 left-3 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-start gap-3 relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                        <Download size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm mb-0.5">ثبّت SocialFlow AI</h4>
                        <p className="text-white/80 text-xs leading-relaxed mb-3">
                            أضف التطبيق إلى شاشتك الرئيسية للوصول السريع والعمل بدون إنترنت
                        </p>
                        <button
                            onClick={handleInstall}
                            className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors active:scale-95 transform shadow-lg"
                        >
                            تثبيت التطبيق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Offline Indicator ──────────────────────────────────────────

export const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    const [show, setShow] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setShow(true);
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "back online" briefly
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

    if (!show) return null;

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 duration-300 ${isOnline ? 'animate-out fade-out slide-out-to-top-4' : ''
            }`}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-sm font-medium ${isOnline
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-800 text-white'
                }`}>
                {isOnline ? (
                    <>
                        <Wifi size={16} />
                        <span>تم استعادة الاتصال</span>
                    </>
                ) : (
                    <>
                        <WifiOff size={16} />
                        <span>أنت غير متصل بالإنترنت</span>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Update Available Toast ─────────────────────────────────────

export const PWAUpdateToast: React.FC = () => {
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const handleSWUpdate = () => {
            setShowUpdate(true);
        };

        // Listen for new service worker
        navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            handleSWUpdate();
                        }
                    });
                }
            });
        });
    }, []);

    if (!showUpdate) return null;

    return (
        <div className="fixed top-4 right-4 z-[70] animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-xs">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                    <RefreshCw size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">تحديث متوفر</p>
                    <p className="text-xs text-gray-500 mt-0.5">أعد تحميل للحصول على آخر التحسينات</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shrink-0"
                >
                    تحديث
                </button>
            </div>
        </div>
    );
};
