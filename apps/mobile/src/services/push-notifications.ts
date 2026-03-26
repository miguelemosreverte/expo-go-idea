import { api } from '@/api/client';

export interface PushPayload {
  type: 'permission_request' | 'session_update';
  title: string;
  body: string;
  data?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Notifications: any = null;

async function loadNotificationsModule(): Promise<boolean> {
  try {
    // Dynamic require - expo-notifications may not be installed yet
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications') as unknown;
    return Notifications != null;
  } catch {
    console.warn('expo-notifications not available');
    return false;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  const available = await loadNotificationsModule();
  if (!available || !Notifications) return null;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data as string;

  // Subscribe with gateway
  await api.subscribeToPush(token);

  return token;
}

export function addPushListener(
  handler: (payload: PushPayload) => void,
): (() => void) | null {
  if (!Notifications) return null;

  const subscription = Notifications.addNotificationReceivedListener(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (notification: any) => {
      const data = notification.request.content.data as PushPayload;
      handler(data);
    },
  );

  return () => subscription.remove();
}
