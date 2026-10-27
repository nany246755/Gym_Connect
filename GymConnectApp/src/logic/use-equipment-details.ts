import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Keyboard, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { findEquipmentAlternatives, type EquipmentAlternative } from '@/logic/equipment-alternatives';
import { getEquipment, listEquipment } from '@/services/equipment-service';
import { submitEquipmentReport, type ReportableEquipmentStatus } from '@/services/equipment-report-service';
import type { Equipment, EquipmentStatus } from '@/types/equipment';

function isReportableStatus(status: EquipmentStatus): status is ReportableEquipmentStatus {
  return status === 'Available' || status === 'Occupied' || status === 'AvailableSoon';
}

export function useEquipmentDetails(id: string) {
  // Correct ScrollView instance type.
  const scrollRef =
    useRef<ComponentRef<typeof ScrollView>>(null);

  const noteFocusedRef = useRef(false);

  // Used to discard results from outdated requests.
  const alternativeRequestRef = useRef(0);

  const [equipment, setEquipment] =
    useState<Equipment | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState<ReportableEquipmentStatus | null>(null);

  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState<string | null>(null);

  const [reportSaved, setReportSaved] =
    useState(false);

  // NEW: Alternatives state.
  const [alternatives, setAlternatives] =
    useState<EquipmentAlternative[]>([]);

  const [
    alternativesVisible,
    setAlternativesVisible,
  ] = useState(false);

  const [
    alternativesLoading,
    setAlternativesLoading,
  ] = useState(false);

  const [
    alternativesError,
    setAlternativesError,
  ] = useState<string | null>(null);

  // Existing keyboard fix for the optional note.
  useEffect(() => {
    const keyboardSubscription = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (noteFocusedRef.current) {
          scrollRef.current?.scrollToEnd({
            animated: true,
          });
        }
      }
    );

    return () => {
      keyboardSubscription.remove();
    };
  }, []);

  // Load the selected equipment.
  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
      setEquipment(null);
      setSelectedStatus(null);

      setNote('');
      setSubmitError(null);
      setReportSaved(false);

      // NEW: Reset alternatives for a different machine.
      alternativeRequestRef.current += 1;

      setAlternatives([]);
      setAlternativesVisible(false);
      setAlternativesLoading(false);
      setAlternativesError(null);

      if (!id) {
        setError('No equipment was selected.');
        setLoading(false);

        return;
      }

      return getEquipment(id)
        .then((item) => {
          if (!active) return;

          if (!item) {
            setError('Equipment not found.');
            return;
          }

          setEquipment(item);

          setSelectedStatus(
            isReportableStatus(item.status)
              ? item.status
              : null
          );
        })
        .catch(() => {
          if (!active) return;

          setError(
            'Could not load equipment details.'
          );
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });

    });
    return () => {
      active = false;
      alternativeRequestRef.current += 1;
    };
  }, [id]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/member/equipment');
    }
  };

  // Existing status selection.
  const chooseStatus = (
    status: ReportableEquipmentStatus
  ) => {
    setSelectedStatus(status);
    setSubmitError(null);
    setReportSaved(false);
  };

  const changeNote = (value: string) => {
    setNote(value);
    setSubmitError(null);
    setReportSaved(false);
  };

  // Submit a separate member status report.
  const submitReport = async () => {
    if (
      !equipment ||
      !selectedStatus ||
      submitting ||
      reportSaved
    ) {
      return;
    }

    Keyboard.dismiss();

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitEquipmentReport({
        equipmentId: equipment.id,
        reportedStatus: selectedStatus,
        note,
      });

      setReportSaved(true);
    } catch (cause) {
      setSubmitError(
        cause instanceof Error
          ? cause.message
          : 'Could not save your report. Try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: Load alternatives using actual branch equipment.
  const findAlternatives = async () => {
    if (!equipment || alternativesLoading) {
      return;
    }

    Keyboard.dismiss();

    const requestId =
      ++alternativeRequestRef.current;

    setAlternativesVisible(true);
    setAlternativesLoading(true);
    setAlternativesError(null);
    setAlternatives([]);

    try {
      // Always read the current saved branch inventory.
      const branchEquipment = await listEquipment(
        equipment.branchId
      );

      // Ensure this search still belongs to the
      // currently displayed equipment.
      if (
        requestId !== alternativeRequestRef.current
      ) {
        return;
      }

      const latestEquipment = branchEquipment.find(
        (item) => item.id === equipment.id
      );

      if (!latestEquipment) {
        throw new Error(
          'This equipment is no longer available in the branch inventory.'
        );
      }

      // Refresh the displayed official status if
      // Admin changed it before this search.
      setEquipment(latestEquipment);

      // Reuse the matching logic from Step 6A.
      const matches = findEquipmentAlternatives(
        latestEquipment,
        branchEquipment,
        5
      );

      setAlternatives(matches);
    } catch (cause) {
      if (
        requestId !== alternativeRequestRef.current
      ) {
        return;
      }

      setAlternativesError(
        cause instanceof Error
          ? cause.message
          : 'Could not find alternatives. Please try again.'
      );
    } finally {
      if (
        requestId === alternativeRequestRef.current
      ) {
        setAlternativesLoading(false);
      }
    }
  };

  // NEW: Open a matching alternative's details.
  const openAlternative = (alternativeId: string) => {
    router.push({
      pathname: '/member/equipment/[id]',
      params: {
        id: alternativeId,
      },
    });
  };


  return {
    scrollRef,
    noteFocusedRef,
    equipment,
    loading,
    error,
    selectedStatus,
    note,
    submitting,
    submitError,
    reportSaved,
    alternatives,
    alternativesVisible,
    alternativesLoading,
    alternativesError,
    goBack,
    chooseStatus,
    changeNote,
    submitReport,
    findAlternatives,
    openAlternative
  };
}
