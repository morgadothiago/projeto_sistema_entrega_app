import { toastConfig } from "@/toastConfig"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import FundoLogo from "./assets/funndo.png"
import LoadingAnimation from "./assets/Loading.json"
import Logo from "./assets/logo.png"
import Loading from "./components/Loading"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"
import * as Notifications from "expo-notifications"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

function InitialLayout() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Loading
        animation={LoadingAnimation}
        background={FundoLogo}
        logo={Logo}
        logoSize={{ width: 100, height: 100 }}
        animationSize={{ width: 50, height: 50 }}
      />
    )
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
        <NotificationProvider>
          <InitialLayout />
        </NotificationProvider>
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
