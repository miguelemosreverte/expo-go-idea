import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorFallbackProps {
  error: Error;
  onReset: () => void;
  onReport?: () => void;
}

export function ErrorFallback({ error, onReset, onReport }: ErrorFallbackProps) {
  const message =
    __DEV__ ? error.message : 'La aplicacion encontro un error inesperado.';

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-2 text-4xl">!</Text>
      <Text className="mb-4 text-center text-2xl font-bold text-gray-900">
        Algo salio mal
      </Text>
      <Text className="mb-8 text-center text-base text-gray-600">
        {message}
      </Text>
      <TouchableOpacity
        className="mb-3 w-full rounded-lg bg-[#4a90d9] px-6 py-3"
        onPress={onReset}
      >
        <Text className="text-center text-base font-semibold text-white">
          Reintentar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="w-full rounded-lg border border-gray-300 px-6 py-3"
        onPress={onReport ?? (() => {})}
      >
        <Text className="text-center text-base font-semibold text-gray-700">
          Reportar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
