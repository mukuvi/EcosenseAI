import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.full_name) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.full_name, form.phone, role);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the EcoSense community</Text>

        <Text style={styles.roleLabel}>Choose portal</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleChip, role === 'citizen' && styles.roleChipActive]}
            onPress={() => setRole('citizen')}
            disabled={loading}
          >
            <Text style={[styles.roleChipText, role === 'citizen' && styles.roleChipTextActive]}>Citizen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleChip, role === 'organization' && styles.roleChipActive]}
            onPress={() => setRole('organization')}
            disabled={loading}
          >
            <Text style={[styles.roleChipText, role === 'organization' && styles.roleChipTextActive]}>Organization</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleChip, role === 'field_agent' && styles.roleChipActive]}
            onPress={() => setRole('field_agent')}
            disabled={loading}
          >
            <Text style={[styles.roleChipText, role === 'field_agent' && styles.roleChipTextActive]}>Field Agent</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Full Name *" value={form.full_name} onChangeText={(v) => setForm({ ...form, full_name: v })} />
        <TextInput style={styles.input} placeholder="Email *" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} />
        <TextInput style={styles.input} placeholder="Phone (e.g. +254711...)" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} />
        <TextInput style={styles.input} placeholder="Password *" secureTextEntry value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Register'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: colors.primary600 },
  subtitle: { fontSize: 14, textAlign: 'center', color: colors.textMuted, marginBottom: 32 },
  roleLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleChipActive: { backgroundColor: colors.primary600, borderColor: colors.primary600 },
  roleChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  roleChipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary600, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  linkBold: { color: colors.primary600, fontWeight: '600' },
});
