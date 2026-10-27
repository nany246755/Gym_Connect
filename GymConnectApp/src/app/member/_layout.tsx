import { Stack } from 'expo-router';

import { MemberTabLayout } from '@/components/member-tab-bar';

// Member area: a Stack of screens with one shared bottom nav bar over the tab screens.
export default function MemberLayout() {
  return (
    <MemberTabLayout>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Tab screens fade into each other instead of sliding in. */}
        <Stack.Screen name="dashboard" options={{ animation: 'fade', animationDuration: 250 }} />
        <Stack.Screen name="spotting/index" options={{ animation: 'fade', animationDuration: 250 }} />
        <Stack.Screen name="partners" options={{ animation: 'fade', animationDuration: 250 }} />
        <Stack.Screen name="profile" options={{ animation: 'fade', animationDuration: 250 }} />
      </Stack>
    </MemberTabLayout>
  );
}
