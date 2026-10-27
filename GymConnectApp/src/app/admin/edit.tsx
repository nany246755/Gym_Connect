import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/bottom-sheet';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icons } from '@/constants/icons';
import { MaxContentWidth, NoWebOutline, Spacing } from '@/constants/theme';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useTheme } from '@/hooks/use-theme';
import { MUSCLE_LABEL, STATUS_LABEL } from '@/logic/equipment';
import { useEquipmentForm } from '@/logic/use-equipment-form';
import { EQUIPMENT_STATUSES, MUSCLE_GROUPS } from '@/types/equipment';

// Screen 9 — Admin Equipment Management: add / edit equipment (FR-10). `?id=` edits, no id adds.
export default function EquipmentFormScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id, branchId } = useLocalSearchParams<{ id?: string; branchId?: string }>();
  const [sheet, setSheet] = useState<'branch' | 'zone' | null>(null);
  const [focused, setFocused] = useState<'name' | 'station' | null>(null);
  const keyboardVisible = useKeyboardVisible();
  const {
    data,
    loading,
    error,
    setName,
    setStation,
    setZone,
    toggleBranch,
    toggleAllBranches,
    setMuscleGroup,
    setStatus,
    pickPhoto,
    removePhoto,
    save,
  } = useEquipmentForm(id, branchId);

  // Back to the inventory, even when this page was opened directly (no screen to go back to).
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/admin'));

  const item = data.item;
  if (loading || !item) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        {loading ? <ActivityIndicator color={theme.accent} /> : <ThemedText themeColor="textSecondary">{error}</ThemedText>}
      </ThemedView>
    );
  }

  const chosen = data.branches.filter((b) => data.branchIds.includes(b.id));
  const allBranches = chosen.length === data.branches.length && chosen.length > 1;
  // "New Cairo", "New Cairo, Maadi", or "All branches".
  const branchName = allBranches ? 'All branches' : chosen.map((b) => b.name).join(', ');
  const { errors } = data;
  // Errors win; otherwise a focused field gets a darker border (instead of the browser's outline).
  const inputStyle = (field: 'name' | 'station', invalid?: string) => [
    styles.input,
    NoWebOutline,
    {
      color: theme.text,
      backgroundColor: theme.backgroundElement,
      borderColor: invalid ? theme.danger : focused === field ? theme.textSecondary : theme.border,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.hero, { backgroundColor: theme.hero, paddingTop: insets.top + Spacing.three }]}>
            <View style={[styles.inner, styles.row]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={leave}
                hitSlop={Spacing.three}
                style={styles.back}>
                <SymbolView name={Icons.back} size={22} tintColor={theme.heroText} />
              </Pressable>
              <View style={styles.flex}>
                <ThemedText type="smallBold" style={[styles.caps, { color: theme.accent }]}>
                  GYM CONNECT / ADMIN
                </ThemedText>
                <ThemedText type="subtitle" style={[styles.title, { color: theme.heroText }]}>
                  {data.isNew ? 'Add equipment' : 'Edit equipment'}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.heroSubtext }}>
                  {item.name.trim() || 'New equipment'} · {branchName}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.inner, styles.body]}>
            <Card>
              <View style={[styles.photo, { backgroundColor: theme.accentSoft }]}>
                {data.image ? (
                  <Image
                    source={data.image}
                    style={styles.photoImage}
                    contentFit="cover"
                    accessibilityLabel={`Photo of ${item.name.trim() || 'the equipment'}`}
                  />
                ) : (
                  <SymbolView name={Icons.equipment} size={40} tintColor={theme.accent} />
                )}
              </View>
              <View style={styles.row}>
                <Button
                  variant="secondary"
                  icon={Icons.camera}
                  title={data.image ? 'Change photo' : 'Add photo'}
                  onPress={pickPhoto}
                  style={styles.flex}
                />
                {data.hasOwnPhoto && (
                  <Button variant="secondary" icon={Icons.remove} title="Remove" onPress={removePhoto} />
                )}
              </View>
            </Card>

            <Card>
              <Field label="Equipment name" error={errors.name}>
                <TextInput
                  value={item.name}
                  onChangeText={setName}
                  placeholder="Bench Press"
                  placeholderTextColor={theme.textSecondary}
                  accessibilityLabel="Equipment name"
                  autoCapitalize="words"
                  maxLength={40}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  style={inputStyle('name', errors.name)}
                />
              </Field>
              <Field label="Branch">
                <Select value={branchName} label="Branch" onPress={() => setSheet('branch')} />
              </Field>
              <View style={styles.row}>
                <View style={styles.zoneColumn}>
                  <Field label="Zone">
                    <Select value={`${item.zone} zone`} label="Zone" onPress={() => setSheet('zone')} />
                  </Field>
                </View>
                <View style={styles.flex}>
                  <Field label="Station" error={errors.station}>
                    <TextInput
                      value={item.station}
                      onChangeText={setStation}
                      placeholder="Rack 02"
                      placeholderTextColor={theme.textSecondary}
                      accessibilityLabel="Station"
                      maxLength={20}
                      onFocus={() => setFocused('station')}
                      onBlur={() => setFocused(null)}
                      style={inputStyle('station', errors.station)}
                    />
                  </Field>
                </View>
              </View>
            </Card>

            <Card>
              <View style={styles.row}>
                <ThemedText type="smallBold" style={styles.flex}>
                  Muscle group
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Pick one
                </ThemedText>
              </View>
              <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Muscle group">
                {MUSCLE_GROUPS.map((m) => (
                  <Chip
                    key={m}
                    tone="primary"
                    check
                    label={MUSCLE_LABEL[m]}
                    selected={item.muscleGroup === m}
                    onPress={() => setMuscleGroup(m)}
                    style={styles.third}
                  />
                ))}
              </View>
            </Card>

            <Card>
              <ThemedText type="smallBold">Status</ThemedText>
              <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel="Status">
                {EQUIPMENT_STATUSES.map((s) => (
                  <Chip
                    key={s}
                    tone="primary"
                    check
                    label={STATUS_LABEL[s]}
                    selected={item.status === s}
                    onPress={() => setStatus(s)}
                    style={styles.half}
                  />
                ))}
              </View>
              {!data.isNew && (
                <ThemedText type="small" themeColor="textSecondary">
                  Changing the status overrides what members reported.
                </ThemedText>
              )}
            </Card>

            {/* Optional floor placement: existing equipment fields above are unchanged. */}
            <Card>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold">Floor position</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Optional · Position this equipment on the member gym floor
                  </ThemedText>
                </View>
                <Switch
                  accessibilityLabel="Enable equipment floor position"
                  value={item.floorPlacement !== undefined}
                  onValueChange={setFloorPlacementEnabled}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor={theme.backgroundElement}
                  ios_backgroundColor={theme.border}
                />
              </View>

              {item.floorPlacement && (
                <View style={styles.floorSettings}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Choose the starting cell and tile size on a four-column floor (up to 24 rows).
                  </ThemedText>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <PositionStepper
                        label="Row"
                        value={item.floorPlacement.row}
                        min={1}
                        max={24 - (item.floorPlacement.rowSpan ?? 1) + 1}
                        onChange={(value) => setFloorPlacementField('row', value)}
                      />
                    </View>
                    <View style={styles.flex}>
                      <PositionStepper
                        label="Column"
                        value={item.floorPlacement.column}
                        min={1}
                        max={4 - (item.floorPlacement.columnSpan ?? 1) + 1}
                        onChange={(value) => setFloorPlacementField('column', value)}
                      />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <View style={styles.flex}>
                      <PositionStepper
                        label="Height · rows"
                        value={item.floorPlacement.rowSpan ?? 1}
                        min={1}
                        max={6}
                        onChange={(value) => setFloorPlacementField('rowSpan', value)}
                      />
                    </View>
                    <View style={styles.flex}>
                      <PositionStepper
                        label="Width · columns"
                        value={item.floorPlacement.columnSpan ?? 1}
                        min={1}
                        max={4}
                        onChange={(value) => setFloorPlacementField('columnSpan', value)}
                      />
                    </View>
                  </View>
                  <View style={[styles.placementSummary, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText type="smallBold">
                      Row {item.floorPlacement.row}, Column {item.floorPlacement.column}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.floorPlacement.rowSpan ?? 1} row(s) × {item.floorPlacement.columnSpan ?? 1} column(s)
                    </ThemedText>
                  </View>
                  {data.isNew && data.branchIds.length > 1 && (
                    <ThemedText type="small" themeColor="textSecondary">
                      This placement applies to each selected branch. Saving checks for overlaps in every branch.
                    </ThemedText>
                  )}
                </View>
              )}
            </Card>

            {error && (
              <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
                {error}
              </ThemedText>
            )}
          </View>
        </ScrollView>

        {/* Hidden while typing so the form gets the space; it comes back when the keyboard closes. */}
        {!keyboardVisible && (
          <View
            style={[
              styles.saveBar,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border, paddingBottom: insets.bottom + Spacing.three },
            ]}>
            <Button variant="secondary" title="Cancel" onPress={leave} style={styles.flex} />
            <Button
              icon={Icons.check}
              title={
                data.saving
                  ? 'Saving…'
                  : !data.isNew
                    ? 'Save'
                    : chosen.length > 1
                      ? `Add to ${chosen.length} branches`
                      : 'Add'
              }
              disabled={data.saving}
              onPress={async () => {
                if (await save()) leave();
              }}
              style={styles.saveButton}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <BottomSheet
        visible={sheet === 'branch'}
        title={data.isNew ? 'Add to branches · pick one or more' : 'Branch'}
        onClose={() => setSheet(null)}>
        {data.isNew && (
          <Chip
            tone="primary"
            multiple
            label="All branches"
            selected={allBranches}
            onPress={toggleAllBranches}
            style={styles.sheetOption}
          />
        )}
        {data.branches.map((b) => (
          <Chip
            key={b.id}
            tone="primary"
            multiple={data.isNew}
            check
            label={b.name}
            selected={data.branchIds.includes(b.id)}
            onPress={() => {
              toggleBranch(b.id);
              if (!data.isNew) setSheet(null); // editing picks one; adding stays open for more
            }}
            style={styles.sheetOption}
          />
        ))}
        {data.isNew && <Button title="Done" onPress={() => setSheet(null)} />}
      </BottomSheet>

      <BottomSheet visible={sheet === 'zone'} title={chosen.length > 1 ? 'Zones all chosen branches have' : `Zones at ${branchName}`} onClose={() => setSheet(null)}>
        {data.zones.map((z) => (
          <Chip
            key={z}
            tone="primary"
            check
            label={`${z} zone`}
            selected={z === item.zone}
            onPress={() => {
              setZone(z);
              setSheet(null);
            }}
            style={styles.sheetOption}
          />
        ))}
      </BottomSheet>
    </ThemedView>
  );
}

function Card({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>{children}</View>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
      {error && (
        <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

// Looks like an input; opens a picker.
function Select({ value, label, onPress }: { value: string; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}, change`}
      onPress={onPress}
      style={[styles.input, styles.select, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText style={styles.flex} numberOfLines={1}>
        {value}
      </ThemedText>
      <SymbolView name={Icons.chevronDown} size={16} tintColor={theme.textSecondary} />
    </Pressable>
  );
}

// Floor-position controls used only by the Admin Add/Edit screen.
function PositionStepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.stepperGroup}>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
      <View style={[styles.stepper, { borderColor: theme.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={value <= min}
          onPress={() => onChange(value - 1)}
          style={[styles.stepperButton, { opacity: value <= min ? 0.3 : 1 }]}>
          <ThemedText type="smallBold" style={styles.stepperSymbol}>−</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={styles.stepperValue}>{value}</ThemedText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={value >= max}
          onPress={() => onChange(value + 1)}
          style={[styles.stepperButton, { opacity: value >= max ? 0.3 : 1 }]}>
          <ThemedText type="smallBold" style={styles.stepperSymbol}>+</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  inner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three },
  caps: { letterSpacing: 1 },
  scroll: { paddingBottom: Spacing.five },
  hero: {
    paddingBottom: Spacing.four,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  title: { fontSize: 26, lineHeight: 34 },
  body: { gap: Spacing.three, marginTop: Spacing.three },
  card: { borderWidth: 1, borderRadius: Spacing.three, padding: Spacing.three, gap: Spacing.three },
  field: { gap: Spacing.one },
  photo: {
    height: 180,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  select: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  zoneColumn: { flex: 1.5 },
  third: { flexGrow: 1, flexBasis: '30%' },
  half: { flexGrow: 1, flexBasis: '45%' },
  saveBar: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  saveButton: { flex: 2 },
  sheetOption: { justifyContent: 'flex-start' },
  // Only the new floor-position section uses these styles.
  floorSettings: { gap: Spacing.three },
  placementSummary: { borderRadius: Spacing.two, padding: Spacing.three, gap: Spacing.one },
  stepperGroup: { gap: Spacing.one },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  stepperButton: { width: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  stepperSymbol: { fontSize: 20 },
  stepperValue: { flex: 1, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
