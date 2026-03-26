import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useServerStore } from '@/stores/server-store';
import type { ServerConnection } from '@gaucho/shared';

export default function ServersScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { servers, addServer, removeServer, setActiveServer } =
    useServerStore();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !url.trim()) return;
    const server: ServerConnection = {
      id: Date.now().toString(),
      name: name.trim(),
      url: url.trim().replace(/\/$/, ''),
      status: 'disconnected',
      lastSeen: null,
    };
    addServer(server);
    setName('');
    setUrl('');
    setShowForm(false);
  };

  const handleConnect = (server: ServerConnection) => {
    setActiveServer(server);
    router.push('/login');
  };

  const handleRemove = (server: ServerConnection) => {
    Alert.alert(t('servers.removeTitle'), t('servers.removeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeServer(server.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: ServerConnection }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4"
      onPress={() => handleConnect(item)}
      onLongPress={() => handleRemove(item)}
      activeOpacity={0.7}
    >
      <View
        className="mr-3 h-3 w-3 rounded-full"
        style={{
          backgroundColor:
            item.status === 'connected' ? '#22c55e' : '#ef4444',
        }}
      />
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {item.name}
        </Text>
        <Text className="mt-1 text-sm text-gray-400">{item.url}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="bg-[#1a1a2e] px-4 py-4">
        <Text className="text-xl font-bold text-white">
          {t('servers.title')}
        </Text>
      </View>

      <FlatList
        data={servers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          servers.length === 0 ? { flex: 1 } : undefined
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-base text-gray-400">
              {t('servers.empty')}
            </Text>
          </View>
        }
      />

      <View className="flex-row gap-3 px-4 pb-8">
        <TouchableOpacity
          className="flex-1 items-center rounded-lg border border-[#4a90d9] py-3"
          onPress={() => router.push('/scan-qr')}
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold text-[#4a90d9]">
            {t('servers.scanQR')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 items-center rounded-lg bg-[#4a90d9] py-3"
          onPress={() => setShowForm(true)}
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold text-white">
            {t('servers.add')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className="rounded-t-2xl bg-white px-6 pb-10 pt-6 shadow-lg">
            <Text className="mb-4 text-lg font-bold text-gray-900">
              {t('servers.add')}
            </Text>

            <TextInput
              className="mb-3 rounded-lg border border-gray-300 px-4 py-3 text-base"
              placeholder={t('servers.namePlaceholder')}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              className="mb-4 rounded-lg border border-gray-300 px-4 py-3 text-base"
              placeholder={t('servers.urlPlaceholder')}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center rounded-lg border border-gray-300 py-3"
                onPress={() => setShowForm(false)}
              >
                <Text className="text-base font-semibold text-gray-600">
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center rounded-lg bg-[#4a90d9] py-3"
                onPress={handleAdd}
              >
                <Text className="text-base font-semibold text-white">
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
