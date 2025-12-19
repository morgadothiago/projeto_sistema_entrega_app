import { toastConfig } from "@/toastConfig"
import { Stack, useRouter, useSegments } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import FundoLogo from "./assets/funndo.png"
import LoadingAnimation from "./assets/Loading.json"
import Logo from "./assets/logo.png"
import Loading from "./components/Loading"
// import ErrorBoundary from "./components/ErrorBoundary"
import * as NavigationBar from 'expo-navigation-bar'
import { Platform } from "react-native"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { NotificationProvider } from "./context/NotificationContext"

function InitialLayout() {
  const { user, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('transparent')
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [])

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!user && !inAuthGroup) {
      // Redireciona para login se não estiver autenticado
      router.replace('/Signin')
    } else if (user && inAuthGroup) {
      // Redireciona para home se já estiver autenticado
      router.replace('/(tabs)/home')
    }
  }, [user, segments, loading])

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
    // <ErrorBoundary>
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <InitialLayout />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
    // </ErrorBoundary>
  )
}

export const unstable_settings = {
  _ignore: [
    // Ignore all style files
    '**/*.styles.ts',
    '**/styles.ts',
    '**/style.ts',

    // Ignore type definitions
    '**/*.d.ts',
    '@types/**/*',

    // Ignore non-route directories
    'assets/**/*',
    'components/**/*',
    'context/**/*',
    'helpers/**/*',
    'hooks/**/*',
    'mocks/**/*',
    'schema/**/*',
    'service/**/*',
    'tabs/**/*',
    'theme/**/*',
    'types/**/*',
    'util/**/*',
    'utils/**/*',
  ],
}
