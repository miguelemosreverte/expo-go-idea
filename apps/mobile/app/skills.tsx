import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SectionList,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/api/client';
import type { Skill, Plugin } from '@gaucho/shared';

type SectionItem =
  | { kind: 'skill'; data: Skill }
  | { kind: 'plugin'; data: Plugin };

export default function SkillsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null);
  const [editConfig, setEditConfig] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [skillsData, pluginsData] = await Promise.all([
        api.getSkills(),
        api.getPlugins(),
      ]);
      setSkills(skillsData);
      setPlugins(pluginsData);
    } catch {
      Alert.alert(t('common.error'), t('skills.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleSkill = async (name: string, value: boolean) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === name ? { ...s, enabled: value } : s)),
    );
    try {
      await api.toggleSkill(name);
    } catch {
      setSkills((prev) =>
        prev.map((s) => (s.name === name ? { ...s, enabled: !value } : s)),
      );
      Alert.alert(t('common.error'), t('skills.toggleError'));
    }
  };

  const handleTogglePlugin = async (name: string, value: boolean) => {
    setPlugins((prev) =>
      prev.map((p) => (p.name === name ? { ...p, enabled: value } : p)),
    );
    try {
      await api.togglePlugin(name);
    } catch {
      setPlugins((prev) =>
        prev.map((p) => (p.name === name ? { ...p, enabled: !value } : p)),
      );
      Alert.alert(t('common.error'), t('skills.toggleError'));
    }
  };

  const openPluginConfig = (plugin: Plugin) => {
    const stringConfig: Record<string, string> = {};
    for (const [k, v] of Object.entries(plugin.config)) {
      stringConfig[k] = String(v ?? '');
    }
    setEditConfig(stringConfig);
    setEditingPlugin(plugin);
  };

  const savePluginConfig = async () => {
    if (!editingPlugin) return;
    try {
      await api.updatePluginConfig(editingPlugin.name, editConfig);
      setPlugins((prev) =>
        prev.map((p) =>
          p.name === editingPlugin.name ? { ...p, config: editConfig } : p,
        ),
      );
      setEditingPlugin(null);
    } catch {
      Alert.alert(t('common.error'), t('skills.configError'));
    }
  };

  const sections = [
    {
      title: t('skills.skillsSection'),
      data: skills.map((s): SectionItem => ({ kind: 'skill' as const, data: s })),
    },
    {
      title: t('skills.pluginsSection'),
      data: plugins.map((p): SectionItem => ({ kind: 'plugin' as const, data: p })),
    },
  ];

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.kind === 'skill') {
      const skill = item.data;
      return (
        <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4">
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-900">
              {skill.name}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {skill.description}
            </Text>
          </View>
          <Switch
            value={skill.enabled}
            onValueChange={(v) => handleToggleSkill(skill.name, v)}
            trackColor={{ false: '#d1d5db', true: '#4a90d9' }}
          />
        </View>
      );
    }

    const plugin = item.data;
    return (
      <TouchableOpacity
        className="flex-row items-center border-b border-gray-100 bg-white px-4 py-4"
        onPress={() => openPluginConfig(plugin)}
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">
            {plugin.name}
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            v{plugin.version}
          </Text>
        </View>
        <Switch
          value={plugin.enabled}
          onValueChange={(v) => handleTogglePlugin(plugin.name, v)}
          trackColor={{ false: '#d1d5db', true: '#4a90d9' }}
        />
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
          {t('skills.title')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) =>
            item.kind === 'skill' ? `s-${item.data.name}` : `p-${item.data.name}`
          }
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <View className="bg-gray-50 px-4 py-2">
              <Text className="text-sm font-semibold uppercase text-gray-500">
                {section.title}
              </Text>
            </View>
          )}
          onRefresh={loadData}
          refreshing={loading}
        />
      )}

      {/* Plugin config modal */}
      <Modal
        visible={editingPlugin !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingPlugin(null)}
      >
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
          <View className="flex-row items-center justify-between bg-[#1a1a2e] px-4 py-4">
            <TouchableOpacity onPress={() => setEditingPlugin(null)}>
              <Text className="text-base text-white">{t('common.cancel')}</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">
              {editingPlugin?.name}
            </Text>
            <TouchableOpacity onPress={savePluginConfig}>
              <Text className="text-base font-medium text-[#4a90d9]">
                {t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="px-4 py-4">
            {Object.entries(editConfig).map(([key, value]) => (
              <View key={key} className="mb-4">
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  {key}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900"
                  value={value}
                  onChangeText={(text) =>
                    setEditConfig((prev) => ({ ...prev, [key]: text }))
                  }
                  placeholder={key}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            ))}
            {Object.keys(editConfig).length === 0 && (
              <Text className="text-center text-base text-gray-400">
                {t('skills.noConfig')}
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
