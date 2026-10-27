
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// Local gym background image
const gymPhoto = require(
  '../../assets/images/welcome2 (1).png'
);

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={gymPhoto}
      resizeMode="cover"
      style={styles.background}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar barStyle="light-content" />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>

        <View style={styles.bottomSection}>

          {/* Gym Connect branding */}
          <View style={styles.brandRow}>
            <Text style={styles.brandAccent}>
              GYM{' '}
            </Text>

            <Text style={styles.brandWhite}>
              CONNECT
            </Text>
          </View>

          {/* Welcome heading */}
          <Text style={styles.headline}>
            Better Workouts.{'\n'}Together.
          </Text>

          <Text style={styles.description}>
            Find equipment, get a spot, meet training
            partners and make the most of your time
            at the gym.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#14213D"
            />
          </Pressable>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#101827',
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 12, 25, 0.72)',
  },

  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
  },

  bottomSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },

  // Gym Connect centered above heading
  brandRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 65,
  },

  brandAccent: {
    color: '#F6AE2D',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },

  brandWhite: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },

  headline: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 43,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    color: '#E3E6EC',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 54,
    maxWidth: 320,
  },

  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: 28,
    backgroundColor: '#F6AE2D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  buttonText: {
    color: '#14213D',
    fontSize: 17,
    fontWeight: '800',
  },
});
