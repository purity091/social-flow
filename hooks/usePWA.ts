import { useState, useEffect, useRef } from 'react';

// ─── Intersection Observer ────────────────────────────────────────
// Used for lazy-loading elements when they enter the viewport

export function useIntersectionObserver(
    options?: IntersectionObserverInit
) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.unobserve(element);
                }
            },
            { rootMargin: '100px', ...options }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, isIntersecting };
}

// ─── Online Status ───────────────────────────────────────────────

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

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

    return isOnline;
}
