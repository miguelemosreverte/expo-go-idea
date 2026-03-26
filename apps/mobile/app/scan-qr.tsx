import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useServerStore } from '@/stores/server-store';
import type { ServerConnection } from '@gaucho/shared';

export default function ScanQRScreen() {
  const { t } = useTranslation();
  const { addServer, setActiveServer } = useServerStore();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const payload = JSON.parse(data) as { url: string; name: string };
      if (!payload.url) throw new Error('Invalid QR');

      const server: ServerConnection = {
        id: Date.now().toString(),
        name: payload.name || 'GauchoCowork',
        url: payload.url.replace(/\/$/, ''),
        status: 'disconnected',
        lastSeen: null,
      };

      addServer(server);
      setActiveServer(server);
      router.replace('/login');
    } catch {
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.text}>{t('scanQR.instruction')}</Text>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 160,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 32 },
  backButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
