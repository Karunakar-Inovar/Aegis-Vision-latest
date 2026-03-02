/**
 * Root Layout - Minimal version
 * 
 * Start simple, then add back features once working.
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
