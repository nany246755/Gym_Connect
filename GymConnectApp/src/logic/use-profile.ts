import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

import { applyAppearance } from '@/logic/appearance';
import { toggleInOrder, validateProfile } from '@/logic/profile';
import { loadAppearance, saveAppearance } from '@/services/appearance-storage';
import { getBranches, getProfile, saveProfile } from '@/services/profile-service';
import type { Branch } from '@/types/branch';
import type { AppearanceMode } from '@/types/settings';
import {
  TRAINING_STYLES,
  WEEK_DAYS,
  type FitnessLevel,
  type TrainingStyle,
  type User,
  type WeekDay,
} from '@/types/user';

// ViewModel for the Member Profile screen (FR-9). Edits go into a draft until "Save profile".
export function useProfile() {
  const [saved, setSaved] = useState<User | null>(null);
  const [draft, setDraft] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [appearance, setAppearanceState] = useState<AppearanceMode>('Default');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProfile(), getBranches(), loadAppearance()])
      .then(([user, branchList, mode]) => {
        setSaved(user);
        setDraft(user);
        setBranches(branchList);
        setAppearanceState(mode);
      })
      .catch(() => setError('Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  // "Profile saved" shows briefly, then the bottom bar hides.
  useEffect(() => {
    if (!justSaved) return;
    const id = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(id);
  }, [justSaved]);

  const edit = (change: (u: User) => Partial<User>) => {
    setDraft((u) => (u ? { ...u, ...change(u) } : u));
    setJustSaved(false);
  };

  const errors = draft ? validateProfile(draft) : {};

  return {
    data: {
      user: draft,
      branches,
      appearance,
      dirty: JSON.stringify(draft) !== JSON.stringify(saved),
      saving,
      justSaved,
      // Most errors wait for a save attempt; a too-early end time shows right away.
      errors: showErrors ? errors : { scheduleTime: errors.scheduleTime },
    },
    loading,
    error,
    setFitnessLevel: (fitnessLevel: FitnessLevel) => edit(() => ({ fitnessLevel })),
    toggleTrainingStyle: (style: TrainingStyle) =>
      edit((u) => ({ trainingStyles: toggleInOrder(TRAINING_STYLES, u.trainingStyles, style) })),
    toggleDay: (day: WeekDay) => edit((u) => ({ scheduleDays: toggleInOrder(WEEK_DAYS, u.scheduleDays, day) })),
    setScheduleFrom: (scheduleFrom: string) => edit(() => ({ scheduleFrom })),
    setScheduleTo: (scheduleTo: string) => edit(() => ({ scheduleTo })),
    setHomeBranch: (homeBranchId: string) => edit(() => ({ homeBranchId })),
    setVisibleInSearch: (visibleInSearch: boolean) => edit(() => ({ visibleInSearch })),
    // shortcut: keeps the picker's local file URI; upload it to Firebase Storage once that exists.
    pickAvatar: async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) edit(() => ({ avatarUrl: result.assets[0].uri }));
    },
    setAppearance: (mode: AppearanceMode) => {
      setAppearanceState(mode);
      applyAppearance(mode);
      saveAppearance(mode).catch(() => setError('Could not save your appearance setting.'));
    },
    save: async () => {
      setShowErrors(true);
      if (!draft || Object.keys(errors).length > 0) return;
      const clean = { ...draft, fullName: draft.fullName.trim() };
      setSaving(true);
      setError(null);
      try {
        await saveProfile(clean);
        setSaved(clean);
        setDraft(clean);
        setShowErrors(false);
        setJustSaved(true);
      } catch {
        setError('Could not save your profile. Try again.');
      } finally {
        setSaving(false);
      }
    },
    discard: () => {
      setDraft(saved);
      setShowErrors(false);
    },
  };
}
