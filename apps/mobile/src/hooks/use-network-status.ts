import { useEffect, useRef, useState } from 'react';
import { useServerStore } from '@/stores/server-store';

export function useNetworkStatus(intervalMs = 10_000) {
  const [isOnline, setIsOnline] = useState(true);
  const activeServer = useServerStore((s) => s.activeServer);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeServer) return;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5_000);
        await fetch(`${activeServer.url}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    void check();
    timerRef.current = setInterval(() => void check(), intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeServer, intervalMs]);

  return isOnline;
}
