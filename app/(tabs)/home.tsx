import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "../components/Header"
import UserWarpper from "../components/UserWarpper"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"

type DeliveryMan = {
  name: string
  email: string
  cpf: string
  phone: string
  documents: DeliverDocuments
  bankAccount: deliveryBankAccount
}

type DeliverDocuments = {
  rg: string
  cpf: string
  cnh: string
}

type deliveryBankAccount = {
  bankName: string
  accountNumber: string
  agency: string
  pixCode: string
  accountType: string
  holderName: string
}

export default function Home() {
  const { user, token } = useAuth()
  const [deliveryManData, setDeliveryManData] = useState<DeliveryMan | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const { DeliveryMan } = user || {}
  const router = useRouter()

  useEffect(() => {
    const checkTokenExpiration = async () => {
      if (token === null) {
        router.replace("/(auth)/Signin")
      }
    }
    checkTokenExpiration()
  }, [token])

  useEffect(() => {
    async function LoadAndCheckInfo() {
      setIsLoading(true)
      try {
        const response = await api.get(`/users/${user?.id}`)
        const data = response.data
        setDeliveryManData(data)

        console.log("📋 Dados do usuário:", JSON.stringify(data, null, 2))

        // Verifica se o usuário está ativo
        const isActive = data?.status === "ACTIVE"

        console.log("🔍 Verificação de status:")
        console.log("  📊 Status do usuário:", data?.status)
        console.log("  ✅ Está ativo?", isActive ? "Sim" : "Não")

        // Se não estiver ativo, redireciona para completar cadastro
        if (!isActive) {
          console.log(
            `⚠️  Status é "${data?.status}", redirecionando para LoadingDocuments`
          )
          router.replace("/(auth)/LoadingDocuments")
          return
        }

        console.log("✅ Status ACTIVE, acesso liberado à aplicação")
      } catch (error) {
        console.log("❌ Erro ao carregar dados:", error)
        router.replace("/(auth)/Signin")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      LoadAndCheckInfo()
    } else {
      setIsLoading(false)
    }
  }, [user?.id, router, token])

  if (isLoading || !deliveryManData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text
          style={{ color: colors.text, textAlign: "center", marginTop: 50 }}
        >
          Carregando...
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" tabs={false} />
      <View style={styles.content}>
        {DeliveryMan && user && <UserWarpper deliveryMan={DeliveryMan} />}
        <Text style={styles.welcomeText}>
          Bem-vindo, {DeliveryMan?.name || "Usuário"}!
        </Text>
        <Text style={styles.paymentText}>Formas de pagamento: R$ 1000.00</Text>
      </View>
    </SafeAreaView>
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
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
  },
  paymentText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 10,
  },
})
