import fundoBg from "@/app/assets/funndo.png"
import LoadingAnimation from "@/app/assets/Loading.json"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import {
  applyPixKeyMask,
  cpfMask,
  removeNonNumeric,
  removePixKeyMask,
} from "@/app/utils/masks"
import {
  detectPixKeyType,
  getPixKeyTypeDescription,
} from "@/app/utils/pixKeyDetector"
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
import { getKeyboardBehavior } from "@/app/theme/androidOptimizations"
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
  account: string | null
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
      bankCode: "",
      bankName: "",
      agency: "",
      agencyDigit: "",
      account: "",
      accountDigit: "",
      accountType: undefined,
      holderName: "",
      cpf: "",
    },
  })

  // Ref para o timeout do debounce
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Função que detecta e define o tipo de chave
  const handlePixKeyDetection = useCallback(
    (pixKey: string) => {
      if (!pixKey || pixKey.trim() === "") {
        setValue("pixKeyType", "")
        return
      }

      const detectedType = detectPixKeyType(pixKey)

      if (detectedType) {
        setValue("pixKeyType", detectedType)
      } else {
        setValue("pixKeyType", "")
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

  // Limpa campos quando troca o tipo de pagamento
  React.useEffect(() => {
    if (paymentType === "Pix") {
      // Limpa campos de transferência
      setValue("bankCode", "")
      setValue("bankName", "")
      setValue("agency", "")
      setValue("agencyDigit", "")
      setValue("account", "")
      setValue("accountDigit", "")
      setValue("accountType", undefined)
      setValue("holderName", "")
      setValue("cpf", "")
    } else if (paymentType === "Transferencia") {
      // Limpa campos de Pix
      setValue("pixKey", "")
      setValue("pixKeyType", "")
    }
  }, [paymentType, setValue])

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
      } else if (data.paymentType === "Transferencia") {
        // Validação: Se for Transferência, garantir que os campos obrigatórios existem
        if (
          !data.bankName ||
          !data.agency ||
          !data.account ||
          !data.accountType ||
          !data.holderName ||
          !data.cpf
        ) {
          throw new Error("Dados de Transferência incompletos")
        }

        // Remove a máscara do CPF antes de enviar
        const cleanCpf = removeNonNumeric(data.cpf)

        // Se for Transferência, envia APENAS dados bancários (sem campos null de PIX)
        dataToSend = {
          paymentType: "Transferencia",
          bankCode: data.bankCode || null,
          bankName: data.bankName,
          agency: data.agency,
          agencyDigit: data.agencyDigit || null,
          account: data.account,
          accountDigit: data.accountDigit || null,
          accountType: data.accountType,
          holderName: data.holderName,
          cpf: cleanCpf,
        }
      } else {
        throw new Error("Tipo de pagamento não selecionado")
      }

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

        Toast.show({
          type: "success",
          text1: "Sucesso!",
          text2: "Informações bancárias cadastradas",
        })
      }

      setSubmittedData(dataToSend as any)
      setIsSubmitting(false)

      // Mostra tela de sucesso
      setShowSuccess(true)

      router.push("/(auth)/Signin")
    } catch (error: any) {
      setIsSubmitting(false)

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
            behavior={getKeyboardBehavior()}
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
                      name="bankCode"
                      placeholder="Código do Banco (ex: 001)"
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="hash"
                    />

                    <Input<PaymentFormData>
                      control={control as any}
                      name="bankName"
                      placeholder="Nome do Banco (ex: Banco do Brasil)"
                      containerStyle={styles.inputContainer}
                      icon="home"
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <View style={{ flex: 2 }}>
                        <Input<PaymentFormData>
                          control={control as any}
                          name="agency"
                          placeholder="Agência (ex: 1234)"
                          keyboardType="numeric"
                          containerStyle={styles.inputContainer}
                          icon="hash"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Input<PaymentFormData>
                          control={control as any}
                          name="agencyDigit"
                          placeholder="Dígito"
                          keyboardType="numeric"
                          containerStyle={styles.inputContainer}
                          maxLength={1}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <View style={{ flex: 2 }}>
                        <Input<PaymentFormData>
                          control={control as any}
                          name="account"
                          placeholder="Número da Conta"
                          keyboardType="numeric"
                          containerStyle={styles.inputContainer}
                          icon="credit-card"
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Input<PaymentFormData>
                          control={control as any}
                          name="accountDigit"
                          placeholder="Dígito"
                          keyboardType="numeric"
                          containerStyle={styles.inputContainer}
                          maxLength={1}
                        />
                      </View>
                    </View>

                    <Select<PaymentFormData>
                      control={control as any}
                      name="accountType"
                      options={[
                        { label: "Conta Corrente", value: "CHECKING" },
                        { label: "Conta Poupança", value: "SAVINGS" },
                      ]}
                      placeholder="Tipo de Conta"
                    />

                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>👤</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Titular da Conta</Text>
                    </View>

                    <Input<PaymentFormData>
                      control={control as any}
                      name="holderName"
                      placeholder="Nome Completo do Titular"
                      containerStyle={styles.inputContainer}
                      icon="user"
                    />

                    <Input<PaymentFormData>
                      control={control as any}
                      name="cpf"
                      placeholder="CPF do Titular (000.000.000-00)"
                      keyboardType="numeric"
                      visualMask={cpfMask}
                      unmask={removeNonNumeric}
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
