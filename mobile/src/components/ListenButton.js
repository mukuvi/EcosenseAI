import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import useAuthStore from '../store/authStore';
import api, { API_BASE_URL } from '../services/api';
import { colors } from '../theme/colors';

export default function ListenButton({ reportId }) {
  const token = useAuthStore((s) => s.token);
  const soundRef = useRef(null);
  const objectUrlRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      let source;
      if (Platform.OS === 'web') {
        const { data } = await api.get(`/reports/${reportId}/audio`, { responseType: 'blob' });
        objectUrlRef.current = URL.createObjectURL(data);
        source = { uri: objectUrlRef.current };
      } else {
        source = {
          uri: `${API_BASE_URL}/reports/${reportId}/audio`,
          headers: { Authorization: `Bearer ${token}` },
        };
      }
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
        }
      });
    } catch {
      Alert.alert('Voice unavailable', 'This update cannot be played right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={play} disabled={loading} style={styles.button}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary600} />
      ) : (
        <Text style={styles.label}>Listen</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.primary600,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  label: { color: colors.primary600, fontSize: 12, fontWeight: '600' },
});
