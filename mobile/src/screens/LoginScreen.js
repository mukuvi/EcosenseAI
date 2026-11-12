import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import useAuthStore from '../store/authStore';
import { colors } from '../theme/colors';
import { getApiErrorMessage } from '../services/apiError';
import { Button, Field, Label, Screen, fonts } from '../components/ui';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing details', 'Enter your email and password.');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Sign in failed', getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.brand}>
          <View style={styles.mark}>
            <FeatherMark />
          </View>
          <Text style={styles.wordmark}>EcoSense AI</Text>
        </View>

        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>
          Report a site, follow its status and collect points when the cleanup is verified.
        </Text>

        <View style={styles.form}>
          <Label>Email</Label>
          <Field
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />

          <Label style={{ marginTop: 16 }}>Password</Label>
          <Field
            placeholder="Your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button
            label={loading ? 'Signing in' : 'Sign in'}
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: 24 }}
          />
        </View>

        <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkRow}>
          <Text style={styles.link}>New here? </Text>
          <Text style={styles.linkStrong}>Create an account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function FeatherMark() {
  return (
    <View style={styles.leafWrap}>
      <View style={styles.leaf} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    maxWidth: 460,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafWrap: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaf: {
    width: 12,
    height: 12,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 2,
    backgroundColor: colors.accent,
    transform: [{ rotate: '-12deg' }],
  },
  wordmark: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    maxWidth: 340,
  },
  form: {
    marginTop: 32,
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
