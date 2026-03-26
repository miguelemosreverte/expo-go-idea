import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/api/client';

export default function LoginScreen() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    try {
      const token = await api.login(password);
      login(token);
      router.replace('/sessions');
    } catch {
      Alert.alert(t('common.error'), t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 items-center justify-center px-8">
        <Text className="mb-2 text-3xl font-bold text-gray-900">
          {t('app.name')}
        </Text>
        <Text className="mb-10 text-base text-gray-500">
          {t('login.subtitle')}
        </Text>

        <TextInput
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
          placeholder={t('login.password')}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          autoFocus
        />

        <TouchableOpacity
          className="w-full items-center rounded-lg bg-[#4a90d9] py-3"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              {t('login.connect')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
