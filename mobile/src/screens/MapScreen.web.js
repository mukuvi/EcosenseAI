import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../components/ui';

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
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 8 },
  body: { fontSize: 13, lineHeight: 20, color: colors.muted, textAlign: 'center' },
});
