import { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { router } from 'expo-router';
import { useBranch } from '@/context/BranchContext';
import { getBranches } from '@/services/branch-service';
import { isBranchOpen } from '@/logic/branchAvailability';
import type { Branch, BranchWithStatus } from '@/types/branch';

export function useBranchSelection() {
  const [branches, setBranches] = useState<Branch[]>([]);
  useEffect(() => {
    let active = true;
    getBranches().then(list => {
      if (active) setBranches(list);
    });
    return () => {
      active = false;
    };
  }, []);
  const {
    activeCheckIn,
    preferredBranchId,
    startDemoCheckIn,
    endDemoCheckIn,
  } = useBranch();

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // All branches start collapsed
  const [selectedBranchId, setSelectedBranchId] =
    useState<string | null>(null);

  // Branch availability
  const [now, setNow] = useState(() => new Date());

  // Check Out confirmation popup
  const [
    isCheckOutModalVisible,
    setIsCheckOutModalVisible,
  ] = useState(false);

  const [isCheckingOut, setIsCheckingOut] =
    useState(false);

  // Refresh branch availability
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          setNow(new Date());
        }
      }
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  // Calculate Open/Closed status automatically
  const branchesWithStatus: BranchWithStatus[] =
    branches.map((branch) => ({
      ...branch,
      // Preferred branch comes from the saved Profile selection.
      isPreferred: branch.id === preferredBranchId,
      isOpen: isBranchOpen(
        branch.openingTime,
        branch.closingTime,
        now
      ),
    }));

  // Identify the active branch
  const activeBranch = activeCheckIn
    ? branchesWithStatus.find(
      (branch) => branch.id === activeCheckIn.branchId
    )
    : null;

  // Search branches
  const normalizedSearch = searchQuery
    .trim()
    .toLowerCase();

  const filteredBranches = branchesWithStatus.filter(
    (branch) =>
      branch.name
        .toLowerCase()
        .includes(normalizedSearch) ||
      branch.location
        .toLowerCase()
        .includes(normalizedSearch)
  );

  // Expand or collapse branch cards
  const handleBranchPress = (branchId: string) => {
    setSelectedBranchId((currentId) =>
      currentId === branchId ? null : branchId
    );
  };

  // Check In
  const handleDemoCheckIn = async (branchId: string) => {
    const branch = branchesWithStatus.find(
      (item) => item.id === branchId
    );

    if (!branch || !branch.isOpen) {
      Alert.alert('Branch unavailable', 'This branch is currently closed.');
      return;
    }

    if (activeCheckIn !== null) {
      return;
    }

    const success = await startDemoCheckIn(branchId);

    if (success) {
      // Back to the dashboard, which now shows this branch as checked in.
      router.replace('/member/dashboard');
    } else {
      Alert.alert(
        'Check-in unavailable',
        'Your attendance could not be saved. Please try again.'
      );
    }
  };

  // Open Check Out confirmation
  const handleRequestCheckOut = () => {
    if (!activeCheckIn || isCheckingOut) {
      return;
    }

    setIsCheckingOut(false);
    setIsCheckOutModalVisible(true);
  };

  // Cancel Check Out
  const handleCancelCheckOut = () => {
    if (isCheckingOut) {
      return;
    }

    setIsCheckOutModalVisible(false);
  };

  // Confirm Check Out
  const handleConfirmCheckOut = async () => {
    if (!activeCheckIn || isCheckingOut) {
      return;
    }

    // Show loading state
    setIsCheckingOut(true);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1000);
    });

    const success = await endDemoCheckIn();

    setIsCheckingOut(false);

    if (!success) {
      Alert.alert(
        'Check-out unavailable',
        'Your check-out could not be saved. Please try again.'
      );
      return;
    }

    setIsCheckOutModalVisible(false);
    // Back to the dashboard, which now shows "not checked in".
    router.replace('/member/dashboard');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    activeCheckIn,
    searchQuery,
    selectedBranchId,
    isCheckOutModalVisible,
    isCheckingOut,
    branchesWithStatus,
    activeBranch,
    filteredBranches,
    handleBranchPress,
    handleDemoCheckIn,
    handleRequestCheckOut,
    handleCancelCheckOut,
    handleConfirmCheckOut,
    clearSearch,
    setSearchQuery
  };
}
