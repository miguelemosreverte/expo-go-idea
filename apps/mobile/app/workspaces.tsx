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
import { useWorkspaceStore } from '@/stores/workspace-store';
import { api } from '@/api/client';
import type { Workspace } from '@gaucho/shared';

export default function WorkspacesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    workspaces,
    activeWorkspace,
    loading,
    setWorkspaces,
    setActiveWorkspace,
    setLoading,
  } = useWorkspaceStore();

  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWorkspaces();
      setWorkspaces(data);
    } catch {
      Alert.alert(t('common.error'), t('workspaces.loadError'));
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setLoading, t]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleSwitch = async (workspace: Workspace) => {
    try {
      await api.switchWorkspace(workspace.id);
      setActiveWorkspace(workspace);
      router.back();
    } catch {
      Alert.alert(t('common.error'), t('workspaces.switchError'));
    }
  };

  const renderItem = ({ item }: { item: Workspace }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4"
      onPress={() => handleSwitch(item)}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {item.name}
        </Text>
        <Text className="mt-1 text-sm text-gray-400">{item.path}</Text>
      </View>
      {(item.isActive || activeWorkspace?.id === item.id) && (
        <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center bg-[#1a1a2e] px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-base text-white">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t('workspaces.title')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <FlatList
          data={workspaces}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            workspaces.length === 0 ? { flex: 1 } : undefined
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-base text-gray-400">
                {t('workspaces.empty')}
              </Text>
            </View>
          }
          onRefresh={loadWorkspaces}
          refreshing={loading}
        />
      )}
    </View>
  );
}
