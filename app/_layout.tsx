import { toastConfig } from "@/toastConfig"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React from "react"
import Toast from "react-native-toast-message"
import { AuthProvider } from "./context/AuthContext"
import { SafeAreaProvider } from "react-native-safe-area-context"

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

export const unstable_settings = {
  _ignore: [
    '**/*.styles.ts',
    '**/*.d.ts',
    'assets/**/*',
    'components/**/*',
    'context/**/*',
    'mocks/**/*',
    'schema/**/*',
    'service/**/*',
    'tabs/**/*',
    'theme/**/*',
    'types/**/*',
    'util/**/*',
    'components/Header/styles.ts',
    'components/Input/styles.ts',
    'components/Loading/styles.ts',
    'components/MultiStep.tsx',
    'components/Select/index.tsx',
    'components/Select/styles.ts',
  ],
}
