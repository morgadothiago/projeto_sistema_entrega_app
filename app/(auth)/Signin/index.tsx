import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import React, { useEffect, useState } from "react"
import {
  Animated,
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
import { SafeAreaView } from "react-native-safe-area-context"

import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

import { useAuth } from "@/app/context/AuthContext"
import { UserStatus } from "@/app/types/ApiResponse"
import Toast from "react-native-toast-message"
import fundoLogo from "../../assets/funndo.png"
import Logo from "../../assets/logo.png"
import { Button } from "../../components/Button"
import Input from "../../components/Input"
import { loginSchema } from "../../schema/loginSchema"
import styles from "./styles"
import LoadingAnimation from "@/app/assets/Loading.json"
import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import { getKeyboardBehavior } from "@/app/theme/androidOptimizations"

interface LoginData {
  email: string
  password: string
}

export default function LoginScreen() {
  const { signIn, signOut, user } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: yupResolver(loginSchema),
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Animação do logo
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const scaleAnim = React.useRef(new Animated.Value(0.3)).current

  // Controle de teclado
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  useEffect(() => {
    // Animação de entrada do logo
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start()

    // Listeners do teclado
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
      const loggedUser = await signIn(data.email, data.password)

      console.log('🔐 Login bem-sucedido!')
      console.log('👤 Usuário:', loggedUser)
      console.log('📊 Status:', loggedUser.status)

      setLoading(false)

      // Verifica o status do usuário e redireciona ou mostra mensagem
      if (loggedUser.status === UserStatus.NO_DOCUMENTS) {
        console.log('➡️ Redirecionando para LoadingDocuments')
        Toast.show({
          type: "info",
          text1: "Complete seu cadastro",
          text2: "Envie seus documentos para continuar",
        })
        // Usuário precisa completar o cadastro (documentos e pagamento)
        router.replace("/(auth)/LoadingDocuments")
      } else if (loggedUser.status === UserStatus.ACTIVE) {
        console.log('➡️ Redirecionando para Home. Status: ACTIVE')
        Toast.show({
          type: "success",
          text1: "Bem-vindo!",
          text2: "Login realizado com sucesso",
        })
        // Usuário ativo pode acessar home
        router.replace("/(tabs)/home")
      } else if (loggedUser.status === UserStatus.INACTIVE) {
        console.log('⏳ Status: INACTIVE - aguardando aprovação')
        Toast.show({
          type: "info",
          text1: "Cadastro em análise",
          text2: "Seus documentos estão sendo analisados. Aguarde a aprovação.",
          visibilityTime: 5000,
        })
        // Não redireciona, mantém no login
      } else if (loggedUser.status === UserStatus.BLOCKED) {
        console.log('🚫 Status: BLOCKED')
        Toast.show({
          type: "error",
          text1: "Conta bloqueada",
          text2: "Sua conta foi bloqueada. Entre em contato com o suporte.",
          visibilityTime: 5000,
        })
        // Faz logout do usuário bloqueado
        await signOut()
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: error.response?.data?.message || "Tente novamente.",
      })

      setLoading(false)
    }
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={getKeyboardBehavior()}
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
              {/* Logo com animação */}
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
              >
                <View style={styles.logoContainer}>
                  <Image source={Logo} style={styles.logo} />
                </View>
              </Animated.View>

              {/* Título de boas-vindas */}
              <Text style={styles.welcomeTitle}>Bem-vindo de volta!</Text>
              <Text style={styles.welcomeSubtitle}>
                Faça login para continuar
              </Text>

              <View style={styles.form}>
                {/* E-mail */}
                <Input
                  icon="mail"
                  placeholder="E-mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  containerStyle={styles.inputContainer}
                  control={control}
                  name="email"
                />

                {/* Senha */}
                <Input
                  icon="lock"
                  placeholder="Senha"
                  isPassword
                  containerStyle={styles.inputContainer}
                  control={control}
                  name="password"
                />

                {/* Botão de login */}
                <Button
                  style={[styles.button, loading && styles.buttonDisabled]}
                  title={loading ? "Entrando..." : "Entrar"}
                  onPress={onSubmit}
                  disabled={loading}
                />
              </View>

              {/* Footer: escondido no Android quando o teclado está aberto */}
              {!(Platform.OS === "android" && keyboardVisible) && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() =>
                      router.push("/(auth)/ForgotPassword/sendEmail")
                    }
                  >
                    <Feather
                      name="help-circle"
                      size={18}
                      color={colors.buttons}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.linkText}>Esqueci minha senha</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push("/register/StepUser")}
                  >
                    <Feather
                      name="user-plus"
                      size={18}
                      color={colors.buttons}
                      style={{ marginRight: 6 }}
                    />
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
            source={LoadingAnimation}
            autoPlay
            loop
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
