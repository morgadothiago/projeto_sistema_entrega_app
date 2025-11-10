import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import { useAuth } from "@/app/context/AuthContext"
import { PaymentFormData, PaymentInfoSchema } from "@/app/schema/payments"

import { colors } from "@/app/theme"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "expo-router"
import React, { useState } from "react"
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
import * as yup from "yup"

export default function Payments() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [submittedData, setSubmittedData] = useState<PaymentFormData | null>(
    null
  )

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<yup.InferType<typeof PaymentInfoSchema>>({
    resolver: yupResolver(PaymentInfoSchema) as any,
    defaultValues: {
      paymentType: undefined as "Pix" | "Transferencia" | undefined,
      pixKey: "",
      pixKeyType: undefined,
      bankName: "",
      agency: "",
      accountNumber: "",
    },
  })

  const paymentType = watch("paymentType")

  const onSubmit = (data: PaymentFormData) => {
    console.log(data)
    setSubmittedData(data)
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

          <Select
            control={control}
            name="paymentType"
            options={[
              { label: "Pix", value: "Pix" },
              { label: "Transferência", value: "Transferencia" },
            ]}
            placeholder="Selecione o tipo de pagamento"
          />

          {paymentType === "Pix" && (
            <>
              <Input
                control={control}
                name="pixKey"
                placeholder="Chave Pix"
                placeholderTextColor={colors.buttons}
              />
              <Select
                control={control}
                name="pixKeyType"
                options={[
                  { label: "CPF", value: "CPF" },
                  { label: "CNPJ", value: "CNPJ" },
                  { label: "E-mail", value: "Email" },
                  { label: "Telefone", value: "Telefone" },
                  { label: "Chave Aleatória", value: "Chave Aleatória" },
                ]}
                placeholder="Tipo de Chave Pix"
              />
            </>
          )}

          {paymentType === "Transferencia" && (
            <>
              <Input
                control={control}
                name="bankName"
                placeholder="Nome do Banco"
                placeholderTextColor={colors.buttons}
              />
              <Input
                control={control}
                name="agency"
                placeholder="Agência"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Input
                control={control}
                name="accountNumber"
                placeholder="Número da Conta"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
            </>
          )}

          <Pressable
            onPress={handleSubmit(
              (data) => onSubmit(data as PaymentFormData),
              onErrors
            )}
            style={{
              marginTop: 20,
              backgroundColor: colors.buttons,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text>Enviar</Text>
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
})
