import type { ComponentRef, ReactNode, Ref } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BottomSheetProps = {
  visible: boolean;
  title?: string; // omit when the content has its own heading
  onClose: () => void;
  children: ReactNode;
  scrollRef?: Ref<ComponentRef<typeof ScrollView>>; // lets the caller scroll the list, e.g. to the selected item
};

// Slide-up panel for picking from a list; tapping outside or the back button closes it.
export function BottomSheet({ visible, title, onClose, children, scrollRef }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, {
            backgroundColor: theme.backdrop
          }]}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.backgroundElement,
              paddingBottom: insets.bottom + Spacing.three
            },
          ]}>
          <View style={[styles.handle, {
            backgroundColor: theme.border
          }]} />
          {title && (
            <ThemedText type="smallBold" style={styles.title}>
              {title}
            </ThemedText>
          )}
          <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheet: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    maxHeight: '75%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingTop: Spacing.two,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three
  },
  title: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two
  },
});
