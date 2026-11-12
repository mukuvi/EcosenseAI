import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../services/apiError';
import { Button, Chip, Field, Label, Screen, fonts } from '../components/ui';

const ROLES = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'organization', label: 'Organization' },
  { value: 'field_agent', label: 'Field agent' },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);

  const update = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.full_name) {
      return Alert.alert('Missing details', 'Name, email and password are required.');
    }
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return Alert.alert('Weak password', 'Use at least 8 characters, with a letter and a number.');
    }

    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name, form.phone || undefined, role);
    } catch (err) {
      Alert.alert('Registration failed', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Choose the role that matches your work. You can start reporting right away.</Text>

        <View style={styles.roles}>
          {ROLES.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={role === option.value}
              onPress={() => setRole(option.value)}
            />
          ))}
        </View>

        <View style={styles.form}>
          <Label>Full name</Label>
          <Field placeholder="Jane Wanjiku" value={form.full_name} onChangeText={update('full_name')} autoComplete="name" />

          <Label style={{ marginTop: 16 }}>Email</Label>
          <Field
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={update('email')}
          />

          <Label style={{ marginTop: 16 }}>Phone (optional)</Label>
          <Field
            placeholder="+254712345678"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={update('phone')}
          />

          <Label style={{ marginTop: 16 }}>Password</Label>
          <Field
            placeholder="At least 8 characters, with a number"
            secureTextEntry
            value={form.password}
            onChangeText={update('password')}
          />

          <Button
            label={loading ? 'Creating account' : 'Create account'}
            loading={loading}
            onPress={handleRegister}
            style={{ marginTop: 24 }}
          />
        </View>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkRow}>
          <Text style={styles.link}>Already have an account? </Text>
          <Text style={styles.linkStrong}>Sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 24,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 38,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
  },
  form: {
    marginTop: 24,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  link: {
    fontSize: 13,
    color: colors.muted,
  },
  linkStrong: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
});
