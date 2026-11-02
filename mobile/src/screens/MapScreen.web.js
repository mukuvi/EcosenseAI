import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hotspot map</Text>
      <Text style={styles.body}>
        The interactive map is available in the Android and iOS builds.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 32,
  },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 8 },
  body: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
