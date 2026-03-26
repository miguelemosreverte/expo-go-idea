import { useCallback, useEffect, useState } from 'react';
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
import { useTemplateStore } from '@/stores/template-store';
import { api } from '@/api/client';
import { DEFAULT_TEMPLATES, isBuiltinTemplate } from '@/data/default-templates';
import type { Template } from '@gaucho/shared';

function extractPlaceholders(prompt: string): string[] {
  const matches = prompt.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
}

export default function TemplatesScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { templates, loading, setTemplates, removeTemplate, setLoading } =
    useTemplateStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const remote = await api.getTemplates();
      const merged = api.syncTemplates(DEFAULT_TEMPLATES, remote);
      setTemplates(merged);
    } catch {
      // Fallback to built-in templates if gateway is unreachable
      setTemplates(DEFAULT_TEMPLATES);
    } finally {
      setLoading(false);
    }
  }, [setTemplates, setLoading]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleUse = (template: Template) => {
    const placeholders = extractPlaceholders(template.prompt);
    if (placeholders.length === 0) {
      router.push({
        pathname: '/sessions',
        params: { initialPrompt: template.prompt },
      });
      return;
    }
    setSelectedTemplate(template);
    // For now, use prompt as-is with placeholder markers
    Alert.alert(
      template.name,
      `${template.description}\n\n${t('templates.placeholders')}: ${placeholders.join(', ')}`,
      [
        { text: t('common.cancel'), style: 'cancel', onPress: () => setSelectedTemplate(null) },
        {
          text: t('templates.use'),
          onPress: () => {
            setSelectedTemplate(null);
            router.push({
              pathname: '/sessions',
              params: { initialPrompt: template.prompt },
            });
          },
        },
      ],
    );
  };

  const handleDelete = (template: Template) => {
    if (isBuiltinTemplate(template.id)) return;
    Alert.alert(t('templates.deleteTitle'), t('templates.deleteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => removeTemplate(template.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Template }) => {
    const builtin = isBuiltinTemplate(item.id);
    return (
      <TouchableOpacity
        className="border-b border-gray-100 bg-white px-4 py-4"
        onPress={() => handleUse(item)}
        onLongPress={() => !builtin && handleDelete(item)}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-gray-900">
            {item.name}
          </Text>
          <View
            className={`rounded-full px-2 py-0.5 ${builtin ? 'bg-blue-100' : 'bg-green-100'}`}
          >
            <Text
              className={`text-xs ${builtin ? 'text-blue-700' : 'text-green-700'}`}
            >
              {builtin ? t('templates.local') : t('templates.synced')}
            </Text>
          </View>
        </View>
        <Text className="mt-1 text-sm text-gray-400">{item.description}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center bg-[#1a1a2e] px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-base text-white">{'\u2190'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">
          {t('templates.title')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            templates.length === 0 ? { flex: 1 } : undefined
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-base text-gray-400">
                {t('templates.empty')}
              </Text>
            </View>
          }
          onRefresh={loadTemplates}
          refreshing={loading}
        />
      )}
    </View>
  );
}
