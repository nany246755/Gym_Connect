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

interface Props {
  children: ReactNode;
}

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

export function GymConnectProviders({ children }: Props) {
  return (
    <PartnersProvider>
      <MessagingConnectionBridge>
        <SpottingRequestsProvider>
          {children}
        </SpottingRequestsProvider>
      </MessagingConnectionBridge>
    </PartnersProvider>
  );
}