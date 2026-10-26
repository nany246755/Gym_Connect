// Gym Connect
// FR07 + FR08 Integration
// Shared Workout Partners Provider

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import { usePartners } from './usePartners';

// ==========================================
// CONTEXT TYPE
// ==========================================

// Reuse the existing hook's return type.
//
// This means we do not need to duplicate
// all the functions and data types.

type PartnersContextType =
  ReturnType<typeof usePartners>;

// ==========================================
// CREATE CONTEXT
// ==========================================

const PartnersContext =
  createContext<PartnersContextType | null>(null);

// ==========================================
// PROVIDER
// ==========================================

interface PartnersProviderProps {
  children: ReactNode;
}

export function PartnersProvider({
  children,
}: PartnersProviderProps) {

  // Run the existing partner logic once
  // for the shared provider.

  const partners = usePartners();

  return (
    <PartnersContext.Provider value={partners}>
      {children}
    </PartnersContext.Provider>
  );
}

// ==========================================
// SHARED HOOK
// ==========================================

export function useSharedPartners() {
  const context = useContext(PartnersContext);

  if (!context) {
    throw new Error(
      'useSharedPartners must be used inside PartnersProvider'
    );
  }

  return context;
}