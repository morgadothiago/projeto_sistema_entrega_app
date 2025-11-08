import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import React, { useEffect, useState } from "react"
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native"

import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"

import Toast from "react-native-toast-message"
import fundoLogo from "../../assets/funndo.png"
import Logo from "../../assets/logo.png"
import Input from "../../components/Input"
import { loginSchema } from "../../schema/loginSchema"
import { api, login } from "../../service/api"
import { FormData } from "../../types/FormData"
import styles from "./styles"
import { useAuth } from "@/app/context/AuthContext"

interface LoginData {
  email: string
  password: string
}

export default function LoginScreen() {
  const { signIn } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: yupResolver(loginSchema),
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // -----------------------
  // Controle de teclado
  // -----------------------
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true)
    })
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  const onSubmit = handleSubmit(async (data: LoginData) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Você fez login corretamente 👌",
      })

      // espera 2 segundos mostrando loading + toast
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setLoading(false)
      router.push("/(tabs)/home")
    } catch (error: any) {
      console.log("Erro no login", error)

      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: error.response?.data?.message || "Tente novamente.",
      })

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setLoading(false)
    }
  })

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding" // funciona no Android e iOS
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ImageBackground
          source={fundoLogo}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
          >
            <View
              style={[styles.content, { flex: 1, justifyContent: "center" }]}
            >
              <Image source={Logo} style={styles.logo} />

              <View style={styles.form}>
                {/* E-mail */}
                <Controller
                  control={control}
                  name="email"
                  rules={{ required: "E-mail é obrigatório" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      icon="mail"
                      placeholder="E-mail"
                      placeholderTextColor="#aaa"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      containerStyle={styles.input}
                    />
                  )}
                />
                {errors.email && (
                  <Text style={styles.error}>{errors.email.message}</Text>
                )}

                {/* Senha */}
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: "Senha é obrigatória" }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      icon="lock"
                      placeholder="Senha"
                      placeholderTextColor="#aaa"
                      isPassword
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      containerStyle={styles.input}
                    />
                  )}
                />
                {errors.password && (
                  <Text style={styles.error}>{errors.password.message}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={onSubmit}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>
              </View>

              {/* Footer: escondido no Android quando o teclado está aberto */}
              {!(Platform.OS === "android" && keyboardVisible) && (
                <View style={styles.footer}>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Esqueci minha senha</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/register/StepUser")}
                  >
                    <Text style={styles.linkText}>Cadastrar-se</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </ImageBackground>
      </TouchableWithoutFeedback>

      {loading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require("../../assets/Delivery Truck | Loading | Exporting-2.json")}
            autoPlay
            loop
            style={styles.cartAnimation}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}
