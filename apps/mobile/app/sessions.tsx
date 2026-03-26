import { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessionStore } from '@/stores/session-store';
import { api } from '@/api/client';
import type { Session } from '@gaucho/shared';

export default function SessionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    sessions,
    loadingSessions,
    setSessions,
    setLoadingSessions,
  } = useSessionStore();

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch {
      Alert.alert(t('common.error'), t('sessions.loadError'));
    } finally {
      setLoadingSessions(false);
    }
  }, [setSessions, setLoadingSessions, t]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreate = async () => {
    try {
      const session = await api.createSession();
      setSessions([session, ...sessions]);
      router.push(`/session/${session.id}`);
    } catch {
      Alert.alert(t('common.error'), t('sessions.createError'));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Session }) => (
    <TouchableOpacity
      className="border-b border-gray-100 bg-white px-4 py-4"
      onPress={() => router.push(`/session/${item.id}`)}
      activeOpacity={0.7}
    >
      <Text className="text-base font-medium text-gray-900">
        {item.title || t('sessions.untitled')}
      </Text>
      <Text className="mt-1 text-sm text-gray-400">
        {formatDate(item.createdAt)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between bg-[#1a1a2e] px-4 py-4">
        <Text className="text-xl font-bold text-white">
          {t('sessions.title')}
        </Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => router.push('/browser')}>
            <Text className="text-lg text-white">{'\uD83C\uDF10'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/skills')}>
            <Text className="text-lg text-white">{'\u2699'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text className="text-lg text-white">{'\u2630'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loadingSessions ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={sessions.length === 0 ? { flex: 1 } : undefined}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-base text-gray-400">
                {t('sessions.empty')}
              </Text>
            </View>
          }
          onRefresh={loadSessions}
          refreshing={loadingSessions}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-[#4a90d9] shadow-lg"
        onPress={handleCreate}
        activeOpacity={0.8}
      >
        <Text className="text-2xl font-bold text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
}
