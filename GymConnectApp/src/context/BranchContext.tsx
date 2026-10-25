
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// Represents one active attendance session.
export type ActiveCheckIn = {
  branchId: string;
  checkedInAt: string;
};

// Temporary Context interface for UI development.
type BranchContextType = {
  activeCheckIn: ActiveCheckIn | null;
  startDemoCheckIn: (branchId: string) => boolean;
  endDemoCheckIn: () => void;
};

const BranchContext = createContext<
  BranchContextType | undefined
>(undefined);

type BranchProviderProps = {
  children: ReactNode;
};

export function BranchProvider({
  children,
}: BranchProviderProps) {
  const [activeCheckIn, setActiveCheckIn] =
    useState<ActiveCheckIn | null>(null);

  // Temporary local check-in for UI testing only.
  const startDemoCheckIn = (branchId: string): boolean => {
    if (activeCheckIn !== null) {
      return false;
    }

    setActiveCheckIn({
      branchId,
      checkedInAt: new Date().toISOString(),
    });

    return true;
  };

  // Temporary local check-out for UI testing only.
  const endDemoCheckIn = () => {
    setActiveCheckIn(null);
  };

  return (
    <BranchContext.Provider
      value={{
        activeCheckIn,
        startDemoCheckIn,
        endDemoCheckIn,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

// Allows components to access the shared Context.
export function useBranch() {
  const context = useContext(BranchContext);

  if (context === undefined) {
    throw new Error(
      'useBranch must be used inside BranchProvider'
    );
  }

  return context;
}
