import fundoBg from "@/app/assets/funndo.png"
import LoadingAnimation from "@/app/assets/Loading.json"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import { applyPixKeyMask, removePixKeyMask } from "@/app/helpers/masks"
import {
  detectPixKeyType,
  getPixKeyTypeDescription,
} from "@/app/helpers/pixKeyDetector"
import { PaymentFormData, PaymentInfoSchema } from "@/app/schema/payments"
import { api } from "@/app/service/api"
import { colors } from "@/app/theme"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import LoadingPaymentSuccess from "./LoadingPaymentSuccess"

// Tipos para os dados enviados à API
type PixPaymentData = {
  paymentType: "Pix"
  pixKey: string | null
  pixKeyType: "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM" | null
}

type TransferenciaPaymentData = {
  paymentType: "Transferencia"
  bankName: string | null
  agency: string | null
  accountNumber: string | null
  bankCode: string | null
  agencyDigit: string | null
  accountDigit: string | null
  accountType: string | null
  holderName: string | null
  cpf: string | null
}

type PaymentDataToSend = PixPaymentData | TransferenciaPaymentData

type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM" | undefined

export default function Payments() {
  const router = useRouter()
  const [submittedData, setSubmittedData] = useState<PaymentDataToSend | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: yupResolver(PaymentInfoSchema) as any,
    mode: "onChange",
    defaultValues: {
      paymentType: undefined,
      pixKey: "",
      pixKeyType: "",
      bankName: "",
      agency: "",
      accountNumber: "",
    },
  })

  // Ref para o timeout do debounce
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Função que detecta e define o tipo de chave
  const handlePixKeyDetection = useCallback(
    (pixKey: string) => {
      if (!pixKey || pixKey.trim() === "") {
        setValue("pixKeyType", "")
        console.log("🔑 Tipo de chave: Nenhuma chave inserida")
        return
      }

      const detectedType = detectPixKeyType(pixKey)

      if (detectedType) {
        setValue("pixKeyType", detectedType)
        console.log(`🔑 ${getPixKeyTypeDescription(detectedType)} - ${pixKey}`)
      } else {
        setValue("pixKeyType", "")
        console.log("🔑 Tipo de chave não identificado")
      }
    },
    [setValue]
  )

  // Função com debounce para evitar muitas chamadas
  const debouncedDetection = useCallback(
    (pixKey: string) => {
      // Limpa o timeout anterior
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }

      // Define um novo timeout
      debounceTimeout.current = setTimeout(() => {
        handlePixKeyDetection(pixKey)
      }, 500) // Aguarda 500ms após o usuário parar de digitar
    },
    [handlePixKeyDetection]
  )

  const paymentType = watch("paymentType")
  const pixKey = watch("pixKey")
  const pixKeyType = watch("pixKeyType")

  // Detecta o tipo de chave quando o pixKey muda
  React.useEffect(() => {
    if (paymentType === "Pix" && pixKey) {
      debouncedDetection(pixKey)
    }
  }, [pixKey, paymentType, debouncedDetection])

  // Função para aplicar máscara visual baseada no tipo detectado
  const applyVisualMask = React.useCallback(
    (value: string) => {
      const keyType = pixKeyType as
        | "CPF"
        | "CNPJ"
        | "EMAIL"
        | "PHONE"
        | "RANDOM"
        | undefined
      return applyPixKeyMask(value, keyType)
    },
    [pixKeyType]
  )

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true)

    try {
      // Prepara os dados de acordo com o tipo de pagamento
      let dataToSend: any

      if (data.paymentType === "Pix") {
        // Validação: Se for Pix, garantir que os campos obrigatórios existem
        if (!data.pixKey || !data.pixKeyType || data.pixKeyType === "") {
          throw new Error("Dados de Pix incompletos")
        }

        // Remove a máscara da chave Pix antes de enviar
        const cleanPixKey = removePixKeyMask(data.pixKey)

        // Se for Pix, envia APENAS dados do Pix (sem campos null de transferência)
        dataToSend = {
          paymentType: "Pix",
          pixKey: cleanPixKey,
          pixKeyType: data.pixKeyType,
        }

        console.log("\n🔑 TIPO DE PAGAMENTO: PIX")
        console.log("\n📊 Processamento da Chave Pix:")
        console.log("  🎭 Chave com máscara (digitada):", data.pixKey)
        console.log("  💾 Chave sem máscara (limpa):", cleanPixKey)
        console.log("  🏷️  Detected Type:", data.pixKeyType)
        console.log("\n📤 Dados que serão enviados para API:")
        console.log(JSON.stringify(dataToSend, null, 2))
        console.log("\n" + "=".repeat(60) + "\n")
      } else if (data.paymentType === "Transferencia") {
        // Validação: Se for Transferência, garantir que os campos obrigatórios existem
        if (!data.bankName || !data.agency || !data.accountNumber) {
          throw new Error("Dados de Transferência incompletos")
        }

        // Se for Transferência, envia APENAS dados bancários (sem campos null de PIX)
        dataToSend = {
          paymentType: "Transferencia",
          bankName: data.bankName,
          agency: data.agency,
          accountNumber: data.accountNumber,
          accountType: "CHECKING",
        }

        console.log("\n🏦 TIPO DE PAGAMENTO: TRANSFERÊNCIA BANCÁRIA")
        console.log("\n📊 Dados Bancários:")
        console.log("  🏛️  Banco:", data.bankName)
        console.log("  🔢 Agência:", data.agency)
        console.log("  💳 Conta:", data.accountNumber)
        console.log("\n📤 Dados que serão enviados para API:")
        console.log(JSON.stringify(dataToSend, null, 2))
        console.log("\n" + "=".repeat(60) + "\n")
      } else {
        throw new Error("Tipo de pagamento não selecionado")
      }

      console.log("⏳ Validação concluída. Enviando para API...")

      // Aqui você faria a chamada real para a API
      if (dataToSend) {
        const response = await api.post(
          "/deliveryman/bank-accounts",
          dataToSend,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        console.log("✅ Resposta da API:", response.data)

        Toast.show({
          type: "success",
          text1: "Sucesso!",
          text2: "Informações bancárias cadastradas",
        })
      }

      setSubmittedData(dataToSend as any)
      setIsSubmitting(false)

      console.log("\n" + "=".repeat(60) + "\n")

      // Mostra tela de sucesso
      setShowSuccess(true)

      router.push("/(auth)/Signin")
    } catch (error: any) {
      setIsSubmitting(false)

      console.log("❌ Erro ao salvar:", error)
      console.log("❌ Resposta da API:", error.response?.data)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Ocorreu um erro ao salvar"

      Toast.show({
        type: "error",
        text1: "Erro ao salvar",
        text2: errorMessage,
        visibilityTime: 5000,
      })
    }
  }

  const onErrors = () => {
    const errorMessages = Object.values(errors)
      .map((error: any) => error?.message)
      .filter(Boolean)
      .join("\n")

    if (errorMessages) {
      Toast.show({
        type: "error",
        text1: "Erro de Validação",
        text2: errorMessages,
        visibilityTime: 4000,
      })
    }
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return <LoadingPaymentSuccess />
  }

  return (
    <ImageBackground
      source={fundoBg}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Header
            title="Informações Bancárias"
            tabs={false}
            onBackPress={() => router.push("/(auth)/Documents")}
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
                {/* Seção: Tipo de Pagamento */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>💳</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Método de Pagamento</Text>
                  </View>

                  <Select<PaymentFormData>
                    control={control as any}
                    name="paymentType"
                    options={[
                      { label: "Pix", value: "Pix" },
                      { label: "Transferência", value: "Transferencia" },
                    ]}
                    placeholder="Selecione o tipo de pagamento"
                  />
                </View>

                {/* Seção: Pix */}
                {paymentType === "Pix" && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>🔑</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Chave Pix</Text>
                    </View>

                    <Input<PaymentFormData>
                      control={control as any}
                      name="pixKey"
                      placeholder="Digite sua chave Pix"
                      visualMask={applyVisualMask}
                      unmask={removePixKeyMask}
                      containerStyle={styles.inputContainer}
                      icon="key"
                    />

                    {pixKeyType && (
                      <View style={styles.detectedTypeContainer}>
                        <Text style={styles.detectedTypeLabel}>
                          Tipo detectado:
                        </Text>
                        <Text style={styles.detectedTypeValue}>
                          {getPixKeyTypeDescription(pixKeyType)}
                        </Text>
                      </View>
                    )}

                    <Select<PaymentFormData>
                      control={control as any}
                      name="pixKeyType"
                      options={[
                        { label: "CPF", value: "CPF" },
                        { label: "CNPJ", value: "CNPJ" },
                        { label: "E-mail", value: "EMAIL" },
                        { label: "Telefone", value: "PHONE" },
                        { label: "Chave Aleatória", value: "RANDOM" },
                      ]}
                      placeholder="Tipo de Chave Pix (auto-detectado)"
                      disabled={true}
                    />
                  </View>
                )}

                {/* Seção: Transferência Bancária */}
                {paymentType === "Transferencia" && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>🏦</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Dados Bancários</Text>
                    </View>

                    <Input<PaymentFormData>
                      control={control as any}
                      name="bankName"
                      placeholder="Nome do Banco"
                      containerStyle={styles.inputContainer}
                      icon="home"
                    />

                    <Input<PaymentFormData>
                      control={control as any}
                      name="agency"
                      placeholder="Agência (ex: 1234)"
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="hash"
                    />

                    <Input<PaymentFormData>
                      control={control as any}
                      name="accountNumber"
                      placeholder="Número da Conta (ex: 12345-6)"
                      containerStyle={styles.inputContainer}
                      icon="credit-card"
                    />
                  </View>
                )}
              </Animated.View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleSubmit(onSubmit, onErrors)}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Salvando..." : "Salvar Informações"}
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>

          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={LoadingAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Salvando informações...</Text>
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  detectedTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: colors.buttons,
  },
  detectedTypeLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginRight: 8,
  },
  detectedTypeValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.buttons,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: colors.buttons,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})
