import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePermissionStore } from '@/stores/permission-store';
import { api } from '@/api/client';

export default function PermissionModal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { pending, removePending } = usePermissionStore();
  const [loading, setLoading] = useState(false);

  const current = pending[0];

  if (!current) {
    router.back();
    return null;
  }

  const handleRespond = async (response: 'allow_once' | 'deny') => {
    setLoading(true);
    try {
      await api.respondPermission(current.id, response);
      removePending(current.id);
      if (pending.length <= 1) {
        router.back();
      }
    } catch {
      Alert.alert(t('common.error'), t('permission.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="bg-[#1a1a2e] px-4 py-4">
        <Text className="text-lg font-bold text-white">
          {t('permission.title')}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Text className="mb-2 text-sm font-medium uppercase text-gray-500">
          {t('permission.tool')}
        </Text>
        <Text className="mb-4 text-lg font-semibold text-gray-900">
          {current.tool}
        </Text>

        <Text className="mb-2 text-sm font-medium uppercase text-gray-500">
          {t('permission.args')}
        </Text>
        <View className="rounded-lg bg-gray-100 p-3">
          <Text className="font-mono text-sm text-gray-700">
            {JSON.stringify(current.args, null, 2)}
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-4 pb-4">
        <TouchableOpacity
          className="flex-1 items-center rounded-lg border border-red-400 py-3"
          onPress={() => handleRespond('deny')}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#f87171" />
          ) : (
            <Text className="font-semibold text-red-500">
              {t('permission.deny')}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-[#4a90d9] py-3"
          onPress={() => handleRespond('allow_once')}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="font-semibold text-white">
              {t('permission.allow')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
