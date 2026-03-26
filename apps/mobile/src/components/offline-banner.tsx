import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline || dismissed) return null;

  return (
    <View className="flex-row items-center justify-between bg-amber-500 px-4 py-2">
      <Text className="text-sm font-semibold text-white">Sin conexion</Text>
      <TouchableOpacity onPress={() => setDismissed(true)}>
        <Text className="text-sm font-bold text-white">X</Text>
      </TouchableOpacity>
    </View>
  );
}
