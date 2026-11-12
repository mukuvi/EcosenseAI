import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, "Times New Roman", serif' }),
  sans: Platform.select({ ios: 'System', android: 'sans-serif', web: 'Inter, system-ui, sans-serif' }),
};

const statusStyles = {
  pending: { color: colors.warning, backgroundColor: '#FEF3E2', borderColor: '#F5D9B4' },
  verified: { color: colors.primary600, backgroundColor: colors.primary50, borderColor: colors.line },
  assigned: { color: colors.info, backgroundColor: '#EEF4FF', borderColor: '#CFE0FF' },
  in_progress: { color: colors.primary600, backgroundColor: colors.primary100, borderColor: '#D5DAD3' },
  resolved: { color: colors.success, backgroundColor: '#E7F6EF', borderColor: '#BFE5D2' },
  rejected: { color: colors.danger, backgroundColor: '#FDECEA', borderColor: '#F5C6C0' },
};

export function Screen({ children, scroll = false, contentStyle, style }) {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, style]}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Header({ title, subtitle, right }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }) {
  const isDisabled = disabled || loading;
  const variants = {
    primary: { backgroundColor: colors.ink, borderColor: colors.ink },
    accent: { backgroundColor: colors.accent, borderColor: colors.accent },
    outline: { backgroundColor: 'transparent', borderColor: colors.line },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variants[variant],
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, variant === 'accent' && { color: colors.accentInk }]}>
        {loading ? 'Please wait' : label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ status }) {
  const entry = statusStyles[status] || { color: colors.muted, backgroundColor: colors.primary50, borderColor: colors.line };
  return (
    <View style={[styles.badge, { backgroundColor: entry.backgroundColor, borderColor: entry.borderColor }]}>
      <Text style={[styles.badgeLabel, { color: entry.color }]}>
        {(status || 'unknown').replace('_', ' ')}
      </Text>
    </View>
  );
}

export function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

export function Field({ style, ...props }) {
  return <TextInput placeholderTextColor={colors.muted} style={[styles.field, style]} {...props} />;
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 16,
  },
  button: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
    textTransform: 'capitalize',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: 8,
  },
  field: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
});
