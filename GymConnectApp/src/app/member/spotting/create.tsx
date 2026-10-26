import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSharedSpottingRequests } from '../../../features/spotting/SpottingRequestsProvider';

const C = {
  midnight: '#14213D', marigold: '#FCA311', background: '#F4F6FA',
  white: '#FFFFFF', muted: '#6B7890', border: '#E1E6EE',
};

const EXERCISES = [
  'Bench Press', 'Incline Bench Press', 'Squat', 'Deadlift', 'Shoulder Press',
];
const EQUIPMENT = [
  'Bench 01 · Strength Floor', 'Bench 02 · Strength Floor',
  'Bench 03 · Strength Floor', 'Squat Rack 01', 'Squat Rack 02',
];

export default function CreateSpotRequestScreen() {
  const { createRequest, myActiveRequest } = useSharedSpottingRequests();
  const [exercise, setExercise] = useState('');
  const [location, setLocation] = useState('');
  const [weight, setWeight] = useState('');
  const [selector, setSelector] = useState<'exercise' | 'location' | null>(null);

  function submitRequest() {
    if (!exercise || !location) {
      Alert.alert('Missing information', 'Please select an exercise and equipment location.');
      return;
    }

    const parsedWeight = weight.trim()
      ? Number(weight.trim().replace(',', '.'))
      : undefined;

    if (parsedWeight !== undefined && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      Alert.alert('Invalid weight', 'Please enter a valid weight in kilograms.');
      return;
    }

    const created = createRequest(exercise, location, parsedWeight);
    if (!created) {
      Alert.alert('Active request', 'You already have an active spotting request.');
      return;
    }

    // Open the shared request tracker after successful creation.
    router.replace({ pathname: '/member/spotting', params: { tab: 'mine' } });
  }

  const options = selector === 'exercise' ? EXERCISES : EQUIPMENT;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>←  Spotting requests</Text>
        </Pressable>

        <Text style={styles.title}>Create spot request</Text>
        <Text style={styles.description}>
          Get help with your next set. Your request goes to other eligible members at your branch.
        </Text>

        <Text style={styles.label}>Exercise</Text>
        <Pressable
          style={styles.field}
          onPress={() => setSelector('exercise')}
          disabled={!!myActiveRequest}
          accessibilityRole="button"
        >
          <Text style={[styles.fieldText, !exercise && styles.placeholder]}>{exercise || 'Select an exercise'}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>

        <Text style={styles.label}>Weight (optional)</Text>
        <TextInput
          style={styles.field}
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 80 kg"
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          editable={!myActiveRequest}
        />

        <Text style={styles.label}>Equipment location</Text>
        <Pressable
          style={styles.field}
          onPress={() => setSelector('location')}
          disabled={!!myActiveRequest}
          accessibilityRole="button"
        >
          <Text style={[styles.fieldText, !location && styles.placeholder]}>{location || 'Select equipment'}</Text>
          <Text style={styles.chevron}>⌄</Text>
        </Pressable>

        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>⌖  Midtown Branch</Text>
          <Text style={styles.infoText}>Only eligible members at this branch can accept your request.</Text>
          <Text style={styles.infoTitle}>◷  Expires after 2 minutes</Text>
          <Text style={styles.infoText}>If nobody accepts, you can create another request.</Text>
        </View>

        <Pressable
          style={[styles.submit, !!myActiveRequest && styles.disabled]}
          onPress={submitRequest}
          disabled={!!myActiveRequest}
          accessibilityRole="button"
        >
          <Text style={styles.submitText}>
            {myActiveRequest ? 'Request already active' : 'Request a spotter'}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={selector !== null} animationType="fade" onRequestClose={() => setSelector(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selector === 'exercise' ? 'Select exercise' : 'Select equipment'}</Text>
            {options.map(option => (
              <Pressable
                key={option}
                style={styles.option}
                onPress={() => {
                  if (selector === 'exercise') setExercise(option);
                  else setLocation(option);
                  setSelector(null);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.close} onPress={() => setSelector(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  content: { padding: 22, paddingBottom: 50 },
  back: { alignSelf: 'flex-start', paddingVertical: 12, marginBottom: 15 },
  backText: { color: C.midnight, fontWeight: '700', fontSize: 14 },
  title: { color: C.midnight, fontSize: 29, fontWeight: '800', marginBottom: 12 },
  description: { color: C.muted, fontSize: 14, lineHeight: 21, marginBottom: 20 },
  label: { color: C.midnight, fontSize: 13, fontWeight: '700', marginTop: 13, marginBottom: 9 },
  field: { minHeight: 54, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 13, paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', color: C.midnight, fontSize: 15 },
  fieldText: { color: C.midnight, fontSize: 14, flexShrink: 1 },
  placeholder: { color: C.muted },
  chevron: { color: C.muted, fontSize: 23 },
  infoPanel: { backgroundColor: '#FFF2D9', borderRadius: 14, padding: 16, marginTop: 25, gap: 7 },
  infoTitle: { color: C.midnight, fontSize: 14, fontWeight: '800' },
  infoText: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 8 },
  submit: { backgroundColor: C.marigold, paddingVertical: 17, borderRadius: 14, marginTop: 22, alignItems: 'center' },
  submitText: { color: C.midnight, fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.45 },
  overlay: { flex: 1, backgroundColor: 'rgba(20,33,61,0.55)', justifyContent: 'center', padding: 22 },
  modal: { backgroundColor: C.white, borderRadius: 20, padding: 18, gap: 9 },
  modalTitle: { color: C.midnight, fontWeight: '800', fontSize: 18, marginBottom: 7 },
  option: { backgroundColor: C.background, padding: 14, borderRadius: 11 },
  optionText: { color: C.midnight, fontWeight: '600' },
  close: { alignItems: 'center', paddingVertical: 12 },
  closeText: { color: C.muted, fontWeight: '700' },
});