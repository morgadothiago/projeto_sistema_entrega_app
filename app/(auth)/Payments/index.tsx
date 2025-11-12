import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import { useAuth } from "@/app/context/AuthContext"
import { PaymentFormData, PaymentInfoSchema } from "@/app/schema/payments"
import { colors } from "@/app/theme"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "expo-router"
import React, { useState, useCallback, useRef } from "react"
import { useForm } from "react-hook-form"
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import LoadingPayment from "./LoadingPayment"
import LoadingPaymentSuccess from "./LoadingPaymentSuccess"
import {
  detectPixKeyType,
  getPixKeyTypeDescription,
} from "@/app/helpers/pixKeyDetector"
import { applyPixKeyMask, removePixKeyMask } from "@/app/helpers/masks"
import { api } from "@/app/service/api"

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
      let dataToSend: PaymentFormData | undefined

      if (data.paymentType === "Pix") {
        // Validação: Se for Pix, garantir que os campos obrigatórios existem
        if (!data.pixKey || !data.pixKeyType || data.pixKeyType === "") {
          throw new Error("Dados de Pix incompletos")
        }

        // Remove a máscara da chave Pix antes de enviar
        const cleanPixKey = removePixKeyMask(data.pixKey)

        // Se for Pix, envia apenas dados do Pix
        dataToSend = {
          paymentType: "Pix",
          pixKey: cleanPixKey,
          pixKeyType: data.pixKeyType as
            | "CPF"
            | "CNPJ"
            | "EMAIL"
            | "PHONE"
            | "RANDOM",
          bankName: null,
          agency: null,
          accountNumber: null,
          bankCode: null,
          agencyDigit: null,
          accountDigit: null,
          accountType: null,
          holderName: null,
          cpf: null,
          isDefault: null,
        } as PaymentFormData

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

        // Se for Transferência, envia apenas dados bancários
        dataToSend = {
          paymentType: "Transferencia",
          bankName: data.bankName,
          agency: data.agency,
          accountNumber: data.accountNumber,
          pixKey: null,
          pixKeyType: null,
          bankCode: null,
          agencyDigit: null,
          accountDigit: null,
          accountType: "CHECKING",
          holderName: null,
          cpf: null,
          isDefault: true,
        } as PaymentFormData

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

      // Simula delay de requisição (Substitua pela chamada real à API)
      await new Promise((resolve) => setTimeout(resolve, 2000))

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
      }

      setSubmittedData(dataToSend as any)
      setIsSubmitting(false)

      // /setShowSuccess(true)
      console.log("\n" + "=".repeat(60) + "\n")

      // Mostra tela de sucesso
      setShowSuccess(true)
    } catch (error) {
      setIsSubmitting(false)

      console.log("❌ Erro ao salvar:", error)
    }
  }

  const onErrors = () => {
    if (errors.paymentType) {
      Alert.alert("Erro", errors.paymentType.message)
    } else if (errors.pixKey) {
      Alert.alert("Erro", errors.pixKey.message)
    } else if (errors.pixKeyType) {
      Alert.alert("Erro", errors.pixKeyType.message)
    } else if (errors.bankName) {
      Alert.alert("Erro", errors.bankName.message)
    } else if (errors.agency) {
      Alert.alert("Erro", errors.agency.message)
    } else if (errors.accountNumber) {
      Alert.alert("Erro", errors.accountNumber.message)
    }
  }

  // Mostra loading enquanto submete
  if (isSubmitting) {
    return <LoadingPayment />
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return <LoadingPaymentSuccess />
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Header
          title="Informações Bancárias"
          tabs={false}
          onBackPress={() => router.push("/(auth)/Documents")}
        />
        <View style={styles.content}>
          <View
            style={{
              marginBottom: 10,
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text style={styles.title}>Cadastro de Informações Bancárias</Text>
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

          {paymentType === "Pix" && (
            <>
              <Input<PaymentFormData>
                control={control as any}
                name="pixKey"
                placeholder="Digite sua chave Pix"
                placeholderTextColor={colors.buttons}
                visualMask={applyVisualMask}
                unmask={removePixKeyMask}
              />
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
                placeholder="Tipo de Chave Pix"
                disabled={true}
              />
            </>
          )}

          {paymentType === "Transferencia" && (
            <>
              <Input<PaymentFormData>
                control={control as any}
                name="bankName"
                placeholder="Nome do Banco"
                placeholderTextColor={colors.buttons}
              />
              <Input<PaymentFormData>
                control={control as any}
                name="agency"
                placeholder="Agência (ex: 1234)"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Input<PaymentFormData>
                control={control as any}
                name="accountNumber"
                placeholder="Número da Conta (ex: 12345-6)"
                placeholderTextColor={colors.buttons}
              />
            </>
          )}

          <Pressable
            onPress={handleSubmit(onSubmit, onErrors)}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Enviar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.buttons,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: colors.buttons,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
})
