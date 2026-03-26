import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth-store';
import { useServerStore } from '@/stores/server-store';
import { api } from '@/api/client';
import i18n from '@/i18n';
import type { GatewayHealth } from '@gaucho/shared';

const APP_VERSION = '0.1.0';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((s) => s.logout);
  const activeServer = useServerStore((s) => s.activeServer);
  const setActiveServer = useServerStore((s) => s.setActiveServer);
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const currentLang = i18n.language;

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleDisconnect = () => {
    Alert.alert(t('settings.disconnectTitle'), t('settings.disconnectMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.disconnect'),
        style: 'destructive',
        onPress: () => {
          logout();
          setActiveServer(null);
          router.replace('/servers');
        },
      },
    ]);
  };

  const healthColor =
    health?.status === 'ok'
      ? 'bg-[#22c55e]'
      : health?.status === 'degraded'
        ? 'bg-yellow-500'
        : 'bg-red-500';

  const healthLabel =
    health?.status === 'ok'
      ? t('settings.healthOk')
      : health?.status === 'degraded'
        ? t('settings.healthDegraded')
        : t('settings.healthError');

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center bg-[#1a1a2e] px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-base text-white">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Language */}
        <View className="mb-4 rounded-lg bg-white p-4">
          <Text className="mb-3 text-sm font-semibold uppercase text-gray-500">
            {t('settings.language')}
          </Text>
          <TouchableOpacity
            className={`mb-2 rounded-lg border px-4 py-3 ${currentLang === 'es-AR' ? 'border-[#4a90d9] bg-blue-50' : 'border-gray-200'}`}
            onPress={() => handleLanguageChange('es-AR')}
          >
            <Text
              className={`text-base ${currentLang === 'es-AR' ? 'font-medium text-[#4a90d9]' : 'text-gray-700'}`}
            >
              Español (Argentina)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-lg border px-4 py-3 ${currentLang === 'en' ? 'border-[#4a90d9] bg-blue-50' : 'border-gray-200'}`}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              className={`text-base ${currentLang === 'en' ? 'font-medium text-[#4a90d9]' : 'text-gray-700'}`}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server info */}
        <View className="mb-4 rounded-lg bg-white p-4">
          <Text className="mb-2 text-sm font-semibold uppercase text-gray-500">
            {t('settings.serverInfo')}
          </Text>
          <Text className="text-base font-medium text-gray-900">
            {activeServer?.name ?? '-'}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            {activeServer?.url ?? '-'}
          </Text>
        </View>

        {/* Gateway health */}
        <View className="mb-4 rounded-lg bg-white p-4">
          <Text className="mb-2 text-sm font-semibold uppercase text-gray-500">
            {t('settings.gatewayHealth')}
          </Text>
          {loadingHealth ? (
            <ActivityIndicator size="small" color="#4a90d9" />
          ) : (
            <View className="flex-row items-center">
              <View className={`mr-2 h-3 w-3 rounded-full ${healthColor}`} />
              <Text className="text-base text-gray-900">{healthLabel}</Text>
            </View>
          )}
        </View>

        {/* App version */}
        <View className="mb-4 rounded-lg bg-white p-4">
          <Text className="mb-1 text-sm font-semibold uppercase text-gray-500">
            {t('settings.version')}
          </Text>
          <Text className="text-base text-gray-700">v{APP_VERSION}</Text>
        </View>

        {/* Disconnect */}
        <TouchableOpacity
          className="mb-8 items-center rounded-lg bg-red-500 py-4"
          onPress={handleDisconnect}
          activeOpacity={0.8}
        >
          <Text className="text-base font-medium text-white">
            {t('settings.disconnect')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
