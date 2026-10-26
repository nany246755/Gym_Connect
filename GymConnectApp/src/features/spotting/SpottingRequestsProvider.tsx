import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import { useSpottingRequests } from './useSpottingRequests';

type SpottingRequestsContextValue = ReturnType<typeof useSpottingRequests>;

const SpottingRequestsContext =
  createContext<SpottingRequestsContextValue | null>(null);

export function SpottingRequestsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const spottingRequests = useSpottingRequests();

  return (
    <SpottingRequestsContext.Provider value={spottingRequests}>
      {children}
    </SpottingRequestsContext.Provider>
  );
}

export function useSharedSpottingRequests(): SpottingRequestsContextValue {
  const context = useContext(SpottingRequestsContext);

  if (!context) {
    throw new Error(
      'useSharedSpottingRequests must be used inside SpottingRequestsProvider'
    );
  }

  return context;
}