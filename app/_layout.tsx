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
import { UserStatus } from "./types/ApiResponse"

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
    const inTabsGroup = segments[0] === '(tabs)'
    const currentRoute = segments[segments.length - 1]

    // Telas permitidas para usuários com NO_DOCUMENTS
    const onboardingScreens = ['LoadingDocuments', 'Documents', 'LoadingDocumentSuccess', 'Payments', 'LoadingPaymentSuccess']
    const isOnboardingScreen = onboardingScreens.includes(currentRoute as string)

    console.log('🧭 _layout.tsx - Verificação de Navegação:')
    console.log('👤 Usuário:', user ? 'Autenticado' : 'Não autenticado')
    console.log('📊 Status:', user?.status)
    console.log('📍 Rota atual:', currentRoute)
    console.log('🔐 Em grupo auth?', inAuthGroup)
    console.log('📱 Em grupo tabs?', inTabsGroup)
    console.log('📝 É tela de onboarding?', isOnboardingScreen)

    if (!user && !inAuthGroup) {
      console.log('➡️ Redirecionando para Login (não autenticado)')
      // Não autenticado → vai para login
      router.replace('/Signin')
    } else if (user && user.status === UserStatus.NO_DOCUMENTS) {
      console.log('🎯 Usuário com NO_DOCUMENTS')
      // Usuário precisa completar cadastro
      if (!inAuthGroup || (inAuthGroup && currentRoute === 'Signin')) {
        console.log('➡️ Redirecionando para LoadingDocuments')
        // Se não está em auth ou está no login, redireciona para onboarding
        router.replace('/(auth)/LoadingDocuments')
      } else {
        console.log('✅ Já está em tela de onboarding, não redireciona')
      }
    } else if (user && user.status === UserStatus.ACTIVE) {
      console.log('✅ Usuário ACTIVE')
      // Usuário com status ACTIVE pode acessar home
      if (inAuthGroup && currentRoute === 'Signin') {
        console.log('➡️ Redirecionando para Home (usuário ACTIVE no login)')
        router.replace('/(tabs)/home')
      }
      // Se já está em tabs, não faz nada
    } else if (user && (user.status === UserStatus.INACTIVE || user.status === UserStatus.BLOCKED)) {
      console.log('🚫 Usuário INATIVO ou BLOQUEADO')
      // Usuário inativo ou bloqueado não pode acessar home
      if (inTabsGroup) {
        console.log('➡️ Redirecionando para Login (usuário sem permissão)')
        router.replace('/(auth)/Signin')
      }
    } else if (user && !inAuthGroup && !inTabsGroup) {
      console.log('➡️ Rota desconhecida, redirecionando baseado no status')
      // Usuário em rota desconhecida
      if (user.status === UserStatus.ACTIVE) {
        router.replace('/(tabs)/home')
      } else {
        router.replace('/(auth)/Signin')
      }
    } else {
      console.log('✅ Sem redirecionamento necessário')
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
