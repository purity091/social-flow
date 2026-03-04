import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

// ─── Offline Indicator ──────────────────────────────────────────
// ملاحظة: PWAInstallBanner و PWAUpdateToast تم حذفهم لأنهم يعتمدان
// على ServiceWorker الذي تم إزالته لضمان استقرار التطبيق

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [show, setShow] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline) {
            setShow(true);
            setWasOffline(true);
        } else if (wasOffline) {
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
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] transition-all duration-300`}>
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
