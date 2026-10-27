import {
  useMemo,
  type ReactNode,
} from 'react';

import {
  PartnersProvider,
  useSharedPartners,
} from '../features/partners/PartnersProvider';

import {
  MessagingProvider,
} from '../features/messaging/MessagingContext';

import {
  SpottingRequestsProvider,
} from '../features/spotting/SpottingRequestsProvider';

import {
  BranchProvider,
} from './BranchContext';

import {
  RestTimerProvider,
} from './RestTimerContext';

interface Props {
  children: ReactNode;
}

// ==========================================
// MESSAGING CONNECTION BRIDGE
// ==========================================

function MessagingConnectionBridge({ children }: Props) {
  const { connectedPartners } = useSharedPartners();

  const connectedPairs = useMemo(
    () =>
      connectedPartners.map(
        connection =>
          [
            connection.senderId,
            connection.receiverId,
          ] as const
      ),
    [connectedPartners]
  );

  return (
    <MessagingProvider connectedPairs={connectedPairs}>
      {children}
    </MessagingProvider>
  );
}

// ==========================================
// APP PROVIDERS
// ==========================================

export function GymConnectProviders({ children }: Props) {
  return (
    <RestTimerProvider>
      <BranchProvider>
        <PartnersProvider>
          <MessagingConnectionBridge>
            <SpottingRequestsProvider>
              {children}
            </SpottingRequestsProvider>
          </MessagingConnectionBridge>
        </PartnersProvider>
      </BranchProvider>
    </RestTimerProvider>
  );
}