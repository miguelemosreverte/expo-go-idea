import '../global.css';
import '../src/i18n';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useServerStore } from '@/stores/server-store';
import { ErrorBoundary } from '@/components/error-boundary';
import { OfflineBanner } from '@/components/offline-banner';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const activeServer = useServerStore((s) => s.activeServer);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void useAuthStore.getState().restore();
    void useServerStore.getState().restore();
  }, []);

  useEffect(() => {
    const onServersPage = segments[0] === 'servers';
    const onLoginPage = segments[0] === 'login';
    const onScanQRPage = segments[0] === 'scan-qr';

    if (!activeServer && !onServersPage && !onScanQRPage) {
      router.replace('/servers');
    } else if (activeServer && !isAuthenticated && !onLoginPage && !onServersPage) {
      router.replace('/login');
    } else if (activeServer && isAuthenticated && (onLoginPage || onServersPage)) {
      router.replace('/sessions');
    }
  }, [isAuthenticated, activeServer, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="servers" />
          <Stack.Screen name="scan-qr" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="index" />
          <Stack.Screen name="sessions" />
          <Stack.Screen name="workspaces" />
          <Stack.Screen name="browser" />
          <Stack.Screen name="skills" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="templates" />
          <Stack.Screen name="session/[id]" />
          <Stack.Screen
            name="permission-modal"
            options={{ presentation: 'modal' }}
          />
        </Stack>
      </AuthGuard>
    </ErrorBoundary>
  );
}
