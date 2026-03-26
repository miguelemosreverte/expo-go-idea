import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessionStore } from '@/stores/session-store';
import { useSSE } from '@/hooks/use-sse';
import { ExecutionTimeline } from '@/components/execution-timeline';
import { api } from '@/api/client';
import type { Message } from '@gaucho/shared';

export default function SessionScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Message>>(null);
  const [input, setInput] = useState('');

  const { connected } = useSSE();

  const {
    currentSession,
    messages,
    executionSteps,
    loadingMessages,
    sendingMessage,
    assistantTyping,
    setCurrentSession,
    setMessages,
    setExecutionSteps,
    addMessage,
    setLoadingMessages,
    setSendingMessage,
    setAssistantTyping,
  } = useSessionStore();

  const loadSession = useCallback(async () => {
    if (!id) return;
    setLoadingMessages(true);
    try {
      const [session, msgs] = await Promise.all([
        api.getSession(id),
        api.getMessages(id),
      ]);
      setCurrentSession(session);
      setMessages(msgs);
    } catch {
      Alert.alert(t('common.error'), t('session.loadError'));
    } finally {
      setLoadingMessages(false);
    }
  }, [id, setCurrentSession, setMessages, setLoadingMessages, t]);

  useEffect(() => {
    loadSession();
    return () => {
      setCurrentSession(null);
      setMessages([]);
      setExecutionSteps([]);
      setAssistantTyping(false);
    };
  }, [loadSession, setCurrentSession, setMessages, setExecutionSteps, setAssistantTyping]);

  // Detect assistant typing based on execution steps
  useEffect(() => {
    const hasRunning = executionSteps.some((s) => s.status === 'running');
    setAssistantTyping(hasRunning);
  }, [executionSteps, setAssistantTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !id || sendingMessage) return;
    setInput('');
    setSendingMessage(true);
    try {
      const message = await api.sendMessage(id, text);
      addMessage(message);
    } catch {
      Alert.alert(t('common.error'), t('session.sendError'));
    } finally {
      setSendingMessage(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View
        className={`mx-4 my-1 max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'self-end bg-[#4a90d9]'
            : 'self-start bg-gray-100'
        }`}
      >
        <Text
          className={`text-base ${isUser ? 'text-white' : 'text-gray-900'}`}
        >
          {item.content}
        </Text>
      </View>
    );
  };

  const ListFooter = () => (
    <>
      {executionSteps.length > 0 && (
        <ExecutionTimeline steps={executionSteps} />
      )}
      {assistantTyping && (
        <View className="mx-4 my-2 self-start rounded-2xl bg-gray-100 px-4 py-3">
          <Text className="text-sm text-gray-500">Typing...</Text>
        </View>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center bg-[#1a1a2e] px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-lg text-white">{'<'}</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-white" numberOfLines={1}>
          {currentSession?.title || t('session.defaultTitle')}
        </Text>
        {connected && (
          <View className="h-2 w-2 rounded-full bg-green-400" />
        )}
      </View>

      {loadingMessages ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4a90d9" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 8 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={ListFooter}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-base text-gray-400">
                {t('session.empty')}
              </Text>
            </View>
          }
        />
      )}

      <View
        className="flex-row items-end border-t border-gray-200 bg-white px-4 py-2"
        style={{ paddingBottom: Math.max(insets.bottom, 8) }}
      >
        <TextInput
          className="mr-2 max-h-24 flex-1 rounded-full border border-gray-300 px-4 py-2 text-base"
          placeholder={t('session.inputPlaceholder')}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!sendingMessage}
        />
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-[#4a90d9]"
          onPress={handleSend}
          disabled={sendingMessage || !input.trim()}
          activeOpacity={0.7}
        >
          {sendingMessage ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-lg font-bold text-white">{'>'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
