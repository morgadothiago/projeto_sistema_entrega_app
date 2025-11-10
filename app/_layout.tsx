import { toastConfig } from "@/toastConfig"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React from "react"
import Toast from "react-native-toast-message"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Loading from "./components/Loading"

function InitialLayout() {
  const { loading } = useAuth()

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <Toast config={toastConfig} />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <InitialLayout />
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
