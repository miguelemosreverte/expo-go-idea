import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { BrowserStatus, BrowserAction } from '@gaucho/shared';

export default function BrowserScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<BrowserStatus | null>(null);
  const [actions, setActions] = useState<BrowserAction[]>([]);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingScreenshot, setRefreshingScreenshot] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [browserStatus, screenshot] = await Promise.all([
        api.getBrowserStatus(),
        api.getBrowserScreenshot(),
      ]);
      setStatus(browserStatus);
      setScreenshotUri(screenshot.uri);
      if (browserStatus.connected) {
        const pending = await api.getPendingBrowserActions();
        setActions(pending);
      }
    } catch {
      Alert.alert(t('common.error'), t('browser.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefreshScreenshot = async () => {
    setRefreshingScreenshot(true);
    try {
      const screenshot = await api.getBrowserScreenshot();
      setScreenshotUri(screenshot.uri);
    } catch {
      Alert.alert(t('common.error'), t('browser.screenshotError'));
    } finally {
      setRefreshingScreenshot(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveBrowserAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    } catch {
      Alert.alert(t('common.error'), t('browser.actionError'));
    }
  };

  const handleDeny = async (id: string) => {
    try {
      await api.denyBrowserAction(id);
      setActions((prev) => prev.filter((a) => a.id !== id));
    } catch {
      Alert.alert(t('common.error'), t('browser.actionError'));
    }
  };

  const renderAction = ({ item }: { item: BrowserAction }) => (
    <View className="mb-2 rounded-lg border border-gray-200 bg-white p-3">
      <Text className="text-sm font-medium text-gray-900">
        {item.type}
      </Text>
      <Text className="mt-1 text-xs text-gray-500">
        {JSON.stringify(item.args)}
      </Text>
      <View className="mt-2 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-[#4a90d9] py-2"
          onPress={() => handleApprove(item.id)}
        >
          <Text className="text-sm font-medium text-white">
            {t('browser.approve')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-red-500 py-2"
          onPress={() => handleDeny(item.id)}
        >
          <Text className="text-sm font-medium text-white">
            {t('browser.deny')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center bg-[#1a1a2e] px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-base text-white">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t('browser.title')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4">
          {/* Status */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="flex-row items-center">
              <View
                className={`mr-2 h-3 w-3 rounded-full ${status?.connected ? 'bg-[#22c55e]' : 'bg-red-500'}`}
              />
              <Text className="text-base font-medium text-gray-900">
                {status?.connected
                  ? t('browser.connected')
                  : t('browser.disconnected')}
              </Text>
            </View>
            {status?.tabCount != null && (
              <Text className="mt-1 text-sm text-gray-500">
                {t('browser.tabs', { count: status.tabCount })}
              </Text>
            )}
          </View>

          {/* URL bar */}
          {status?.currentUrl && (
            <View className="mb-4 rounded-lg bg-white px-4 py-3">
              <Text className="text-xs text-gray-400">{t('browser.url')}</Text>
              <Text className="mt-1 text-sm text-gray-700" numberOfLines={1}>
                {status.currentUrl}
              </Text>
            </View>
          )}

          {/* Screenshot */}
          <View className="mb-4 rounded-lg bg-white p-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-900">
                {t('browser.screenshot')}
              </Text>
              <TouchableOpacity
                className="rounded-lg bg-[#4a90d9] px-4 py-2"
                onPress={handleRefreshScreenshot}
                disabled={refreshingScreenshot}
              >
                {refreshingScreenshot ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-sm font-medium text-white">
                    {t('browser.refresh')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            {screenshotUri ? (
              <Image
                source={{ uri: screenshotUri }}
                className="h-48 w-full rounded-lg"
                resizeMode="contain"
              />
            ) : (
              <View className="h-48 items-center justify-center rounded-lg bg-gray-100">
                <Text className="text-sm text-gray-400">
                  {t('browser.noScreenshot')}
                </Text>
              </View>
            )}
          </View>

          {/* Pending actions */}
          {actions.length > 0 && (
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-900">
                {t('browser.pendingActions')}
              </Text>
              <FlatList
                data={actions}
                keyExtractor={(item) => item.id}
                renderItem={renderAction}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
