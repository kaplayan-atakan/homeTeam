import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginThunk, registerThunk, requestResetThunk } from '../../store';

export function LoginScreen() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onLogin = () => {
    dispatch(loginThunk({ email, password }));
  };

  const onRegister = () => {
    if (!email || !password) return;
    dispatch(registerThunk({ name: email.split('@')[0] ?? 'User', email, password }));
  };

  const onReset = () => {
    if (!email) return;
    dispatch(requestResetThunk({ email }));
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Giriş Yap</Text>
      <TextInput label="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
  <TextInput label="Şifre" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
  {!!error && <Text style={styles.error}>{error}</Text>}
  <Button mode="contained" onPress={onLogin} loading={loading} disabled={!email || !password}>Giriş</Button>
  <View style={styles.spacer} />
  <Button mode="outlined" onPress={onRegister} disabled={!email || !password}>Kayıt Ol</Button>
  <View style={styles.spacer} />
  <Button mode="text" onPress={onReset} disabled={!email}>Şifre Sıfırla</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { marginBottom: 16, textAlign: 'center' },
  input: { marginBottom: 12 },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
  spacer: { height: 8 },
});
