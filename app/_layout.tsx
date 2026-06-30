import { Stack } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { C } from '@/constants/colors';

const queryClient = new QueryClient();

const Wrapper = Platform.OS === 'web'
  ? ({ children }: { children: React.ReactNode }) => <View style={styles.root}>{children}</View>
  : ({ children }: { children: React.ReactNode }) => (
      <GestureHandlerRootView style={styles.root}>{children}</GestureHandlerRootView>
    );

export default function RootLayout() {
  return (
    <Wrapper>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
