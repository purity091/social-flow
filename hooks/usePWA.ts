import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Image Cache Manager ─────────────────────────────────────────
const IMAGE_CACHE_NAME = 'app-images-v1';
const IMAGE_CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Cache an image URL in the browser's Cache API
 */
export async function cacheImage(url: string): Promise<void> {
    if (!('caches' in window) || !url) return;
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const cached = await cache.match(url);
        if (!cached) {
            await cache.add(url);
        }
    } catch {
        // Silently fail - caching is a progressive enhancement
    }
}

/**
 * Get a cached image URL, returns the original URL if not cached
 */
export async function getCachedImage(url: string): Promise<string> {
    if (!('caches' in window) || !url) return url;
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const response = await cache.match(url);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    } catch {
        // Fall through to original URL
    }
    return url;
}

/**
 * Clean expired images from cache
 */
export async function cleanImageCache(): Promise<void> {
    if (!('caches' in window)) return;
    try {
        const cache = await caches.open(IMAGE_CACHE_NAME);
        const keys = await cache.keys();
        const now = Date.now();

        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const cacheDate = new Date(dateHeader).getTime();
                    if (now - cacheDate > IMAGE_CACHE_MAX_AGE) {
                        await cache.delete(request);
                    }
                }
            }
        }
    } catch {
        // Silently fail
    }
}

// ─── Hooks ───────────────────────────────────────────────────────

/**
 * Hook for lazy-loading images with cache support
 */
export function useCachedImage(src: string | undefined) {
    const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!src) {
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setError(false);

        (async () => {
            try {
                // Try to get from cache first
                const cachedSrc = await getCachedImage(src);
                if (!cancelled) {
                    setImageSrc(cachedSrc);
                    setIsLoading(false);
                }

                // If it wasn't cached, cache it now for next time
                if (cachedSrc === src) {
                    await cacheImage(src);
                }
            } catch {
                if (!cancelled) {
                    setImageSrc(src);
                    setIsLoading(false);
                    setError(true);
                }
            }
        })();

        return () => { cancelled = true; };
    }, [src]);

    return { imageSrc, isLoading, error };
}

/**
 * Intersection Observer hook for lazy loading
 */
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

// ─── PWA Install Prompt ──────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setCanInstall(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!deferredPrompt) return false;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsInstalled(true);
            setCanInstall(false);
        }

        setDeferredPrompt(null);
        return outcome === 'accepted';
    }, [deferredPrompt]);

    return { canInstall, isInstalled, install };
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

// ─── Prefetch ────────────────────────────────────────────────────

/**
 * Prefetch multiple image URLs in the background
 */
export function prefetchImages(urls: string[]) {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback for non-blocking prefetch
    const prefetch = () => {
        urls.forEach(url => {
            if (!url) return;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.as = 'image';
            link.href = url;
            document.head.appendChild(link);

            // Also cache in Cache API
            cacheImage(url);
        });
    };

    if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetch);
    } else {
        setTimeout(prefetch, 200);
    }
}
