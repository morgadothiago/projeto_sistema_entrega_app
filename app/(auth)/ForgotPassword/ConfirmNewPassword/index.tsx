import { Header } from "@/app/components/Header"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"

import fundoLogo from "@/app/assets/funndo.png"
import { confirmNewPasswordSchema } from "@/app/schema/confirmNewPasswordSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import LottieView from "lottie-react-native"
import { useForm } from "react-hook-form"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import styles from "./style"

import LoadingAnimation from "@/app/assets/Loading.json"
import Input from "@/app/components/Input"
import { colors } from "@/app/theme"

interface ConfirmNewPasswordData {
  password: string
  confirmPassword: string
}

export default function ConfirmNewPassword() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Animação de fade in
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmNewPasswordData>({
    resolver: yupResolver(confirmNewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = handleSubmit(async (data: ConfirmNewPasswordData) => {
    setLoading(true)
    Keyboard.dismiss()

    try {
      // TODO: Implementar chamada real à API aqui
      console.log("📝 Nova senha:", data.password)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Toast.show({
        type: "success",
        text1: "Senha alterada!",
        text2: "Sua senha foi redefinida com sucesso.",
        visibilityTime: 4000,
      })

      // Aguarda um pouco e volta para o login
      setTimeout(() => {
        router.replace("/(auth)/Signin")
      }, 2000)
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao alterar senha",
        text2:
          error.response?.data?.message ||
          "Não foi possível alterar a senha. Tente novamente.",
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
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <Header
                title="Nova Senha"
                tabs={false}
                onBackPress={() => router.back()}
              />

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Animated.View style={{ opacity: fadeAnim }}>
                  {/* Seção: Nova Senha */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>🔒</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Defina sua nova senha</Text>
                    </View>

                    <Text style={styles.descriptionText}>
                      Digite uma nova senha segura para sua conta. A senha deve ter no mínimo 6 caracteres.
                    </Text>

                    <Input
                      control={control}
                      name="password"
                      placeholder="Nova Senha"
                      icon="lock"
                      isPassword
                      containerStyle={styles.inputContainer}
                    />

                    <Input
                      control={control}
                      name="confirmPassword"
                      placeholder="Confirmar Nova Senha"
                      icon="lock"
                      isPassword
                      containerStyle={styles.inputContainer}
                    />
                  </View>
                </Animated.View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                <Pressable
                  onPress={onSubmit}
                  style={[styles.button, loading && styles.buttonDisabled]}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Alterando..." : "Confirmar Nova Senha"}
                  </Text>
                </Pressable>
              </View>
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
              <Text style={styles.loadingText}>Alterando senha...</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}
