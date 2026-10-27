
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// Gym Connect logo with transparent background
const gymConnectLogo = require(
  '../../assets/images/nobackgeound logo.png'
);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Temporary navigation-only demo.
  // Firebase Authentication will replace this in Phase 2.
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter your email and password.'
      );
      return;
    }

    // This does NOT authenticate a real account.
    router.replace('/member/Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/welcome')}
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>

          <View style={styles.brandSection}>

            {/* Gym Connect transparent logo */}
            <Image
              source={gymConnectLogo}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brand}>
              GYM CONNECT
            </Text>

            <Text style={styles.title}>
              Welcome Back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your workout journey.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Email Address
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#8791A2"
              />

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#8791A2"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#8791A2"
              />

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8791A2"
                secureTextEntry={!showPassword}
                autoComplete="off"
              />

              <Pressable
                onPress={() =>
                  setShowPassword((current) => !current)
                }
                accessibilityLabel={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={22}
                  color="#8791A2"
                />
              </Pressable>
            </View>

            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
              accessibilityRole="button"
            >
              <Text style={styles.loginButtonText}>
                Sign In (Demo)
              </Text>
            </Pressable>

            <Text style={styles.demoNote}>
              Demo login only. Real account authentication
              will be connected in the next phase.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#14213D',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingBottom: 32,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginTop: 12,
  },

  brandSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 50,
  },

  // Transparent logo without circular background
  logo: {
    width: 160,
    height: 110,
    marginBottom: 20,
  },

  brand: {
    color: '#F6AE2D',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 26,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },

  subtitle: {
    color: '#CBD3E0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  form: {
    width: '100%',
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  inputContainer: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },

  input: {
    flex: 1,
    color: '#14213D',
    fontSize: 15,
    paddingVertical: 12,
  },

  loginButton: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: '#F6AE2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },

  loginButtonText: {
    color: '#14213D',
    fontWeight: '800',
    fontSize: 16,
  },

  demoNote: {
    color: '#CBD3E0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 20,
  },
});
