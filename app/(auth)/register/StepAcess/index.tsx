import fundoBg from "@/app/assets/funndo.png"
import { Button } from "@/app/components/Button"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import { MultiStep } from "@/app/components/MultiStep"
import { useMultiStep } from "@/app/context/MultiStepContext"
import { newAccount } from "@/app/service/api"
import { normalizeData } from "@/app/util/nomalizer"
import { ImageBackground } from "expo-image"
import Toast from "react-native-toast-message"

import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { styles } from "./styles"
import LottieView from "lottie-react-native"
import LoadingAnimation from "@/app/assets/Loading.json"

type AccessFormData = {
  email: string
  password: string
  confirmPassword: string
}

export default function AccessStep() {
  const [loading, setLoading] = useState(false)
  const { userInfo } = useMultiStep()

  // Animação de fade in
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  const {
    control,
    handleSubmit,
    getValues,
  } = useForm<AccessFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function handleFinish(data: AccessFormData) {
    setLoading(true)

    try {
      // pega todos os dados coletados nos steps anteriores
      const accessData = {
        email: data.email,
        password: data.password,
      }

      // Normaliza e valida os dados antes de enviar
      const normalizedData = normalizeData(userInfo, accessData)

      // envia para a API
      newAccount(normalizedData)
        .then((res) => {
          Toast.show({
            type: "success",
            text1: "Cadastro realizado!",
            text2: "Você será redirecionado para o login",
            visibilityTime: 3000,
          })

          setTimeout(() => {
            router.replace("/(auth)/Signin")
          }, 2000)
        })
        .catch((err) => {
          Toast.show({
            type: "error",
            text1: "Erro ao cadastrar",
            text2: err.response?.data?.message || "Tente novamente",
          })
          setLoading(false)
        })
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erro na validação",
        text2: error.message,
      })
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={fundoBg} style={{ flex: 1 }}>
        <View style={styles.overlay} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Header
            title="Dados de Acesso"
            onBackPress={() => router.replace("/(auth)/register/StepVehicles")}
          />
          <MultiStep
            currentStep={3}
            steps={["Usuário", "Endereco", "Veículo", "Acesso"]}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Seção: Credenciais */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>🔐</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Credenciais de Acesso</Text>
                  </View>

                  <Input
                    icon="mail"
                    placeholder="Email"
                    control={control}
                    name="email"
                    rules={{
                      required: "Email é obrigatório",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Email inválido",
                      },
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    containerStyle={styles.inputContainer}
                  />

                  <Input
                    icon="lock"
                    placeholder="Senha"
                    control={control}
                    name="password"
                    rules={{
                      required: "Senha é obrigatória",
                      minLength: {
                        value: 6,
                        message: "Senha deve ter pelo menos 6 caracteres",
                      },
                    }}
                    isPassword
                    containerStyle={styles.inputContainer}
                  />

                  <Input
                    icon="lock"
                    placeholder="Confirmar Senha"
                    control={control}
                    name="confirmPassword"
                    rules={{
                      required: "Confirme sua senha",
                      validate: (value: string) =>
                        value === getValues("password") ||
                        "As senhas não coincidem",
                    }}
                    isPassword
                    containerStyle={styles.inputContainer}
                  />
                </View>

                {/* Dica de segurança */}
                <View style={styles.securityTip}>
                  <Text style={styles.securityTipIcon}>💡</Text>
                  <Text style={styles.securityTipText}>
                    Use uma senha forte com pelo menos 6 caracteres
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>

            <Button
              title={loading ? "Finalizando..." : "Finalizar Cadastro"}
              onPress={handleSubmit(handleFinish)}
              disabled={loading}
              style={styles.button}
            />

            {loading && (
              <View style={styles.loadingOverlay}>
                <LottieView
                  source={LoadingAnimation}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                  resizeMode="contain"
                />
                <Text style={styles.loadingText}>Criando sua conta...</Text>
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}
