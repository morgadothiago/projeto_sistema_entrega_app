import { Header } from "@/app/components/Header"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"

import fundoLogo from "@/app/assets/funndo.png"
import { forgotPasswordSchema } from "@/app/schema/forgotPasswordSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import LottieView from "lottie-react-native"
import { useForm } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import styles from "./style"

import LoadingAnimation from "@/app/assets/Loading.json"

interface ForgotPasswordData {
  email: string
}

export default function SendEmailForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Animação para o ícone
  const scaleAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 10,
      friction: 2,
      useNativeDriver: true,
    }).start()
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema),
  })

  const onSubmit = handleSubmit(async (data: ForgotPasswordData) => {
    setLoading(true)
    Keyboard.dismiss()

    try {
      // Simula chamada à API
      // TODO: Implementar chamada real à API aqui
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setEmailSent(true)
      Toast.show({
        type: "success",
        text1: "Email enviado!",
        text2: "Verifique sua caixa de entrada para redefinir sua senha.",
        visibilityTime: 4000,
      })

      // Aguarda um pouco e volta para o login
      setTimeout(() => {
        router.back()
      }, 3000)
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao enviar email",
        text2:
          error.response?.data?.message ||
          "Não foi possível enviar o email. Tente novamente.",
        visibilityTime: 4000,
      })
    } finally {
      setLoading(false)
    }
  })

  return (
    <ImageBackground
      source={fundoLogo}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <Header
                title="Recuperar senha"
                tabs={false}
                onBackPress={() => router.back()}
              />
              <Text>New Password</Text>
            </View>
          </TouchableWithoutFeedback>

          {loading && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={LoadingAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Enviando email...</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
