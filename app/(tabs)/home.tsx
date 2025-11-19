import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "../components/Header"
import QuickActionButton from "../components/QuickActionButton"
import StatCard from "../components/StatCard"
import UserWrapper from "../components/UserWrapper"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { logger } from "../utils/logger"

type DeliveryMan = {
  name: string
  email: string
  cpf: string
  phone: string
  documents: DeliverDocuments
  bankAccount: deliveryBankAccount
  avatar: string
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

// Tipos para as estatísticas do dashboard
type DeliveryStats = {
  pending: number
  completed: number
  todayEarnings: number
  averageTime: number
  balance: number
}

type StatsResponse = {
  deliveries: {
    pending: number
    completed: number
    total: number
  }
  earnings: {
    today: number
    week: number
    month: number
    goal?: number
  }
  performance: {
    averageDeliveryTime: number
    rating?: number
  }
  balance: {
    available: number
    pending: number
  }
}

export default function Home() {
  const { user, token } = useAuth()
  const [deliveryManData, setDeliveryManData] = useState<DeliveryMan | null>(
    null
  )
  const [stats, setStats] = useState<DeliveryStats>({
    pending: 0,
    completed: 0,
    todayEarnings: 0,
    averageTime: 0,
    balance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
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
    let isMounted = true
    const abortController = new AbortController()

    async function LoadAndCheckInfo() {
      setIsLoading(true)
      try {
        const response = await api.get(`/users/${user?.id}`, {
          signal: abortController.signal
        })
        const data = response.data

        if (!isMounted) return

        setDeliveryManData(data)

        logger.debug("Dados do usuário carregados", {
          context: "Home",
          data: { userId: user?.id, hasDeliveryMan: !!data?.DeliveryMan }
        })

        // Verifica se tem documentos cadastrados
        const hasDocuments =
          data?.DeliveryMan?.Documents &&
          data.DeliveryMan.Documents.length > 0

        // Verifica se tem conta bancária cadastrada
        const hasBankAccount =
          data?.DeliveryMan?.BankAccounts &&
          data.DeliveryMan.BankAccounts.length > 0

        logger.info("Verificação de cadastro", {
          context: "Home",
          data: {
            status: data?.status,
            hasDocuments,
            documentsCount: data.DeliveryMan?.Documents?.length || 0,
            hasBankAccount,
            bankAccountsCount: data.DeliveryMan?.BankAccounts?.length || 0
          }
        })

        // Se não tiver documentos OU conta bancária, redireciona para completar
        if (!hasDocuments || !hasBankAccount) {
          logger.warn("Cadastro incompleto, redirecionando", {
            context: "Home",
            data: { hasDocuments, hasBankAccount }
          })
          if (isMounted) {
            router.replace("/(auth)/LoadingDocuments")
          }
          return
        }

        logger.info("Cadastro completo verificado", { context: "Home" })
      } catch (error: any) {
        if (error.name === 'CanceledError') return

        logger.error("Erro ao carregar dados do usuário", error, { context: "Home" })
        if (isMounted) {
          router.replace("/(auth)/Signin")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    if (user?.id) {
      LoadAndCheckInfo()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [user?.id])

  // Função para buscar estatísticas do backend
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    async function fetchStats() {
      if (!user?.id) return

      setIsLoadingStats(true)
      setStatsError(null)
      try {
        // TODO: Substituir pela rota real do backend quando estiver pronto
        // Exemplo de rota: /deliveryman/${user.id}/stats ou /dashboard/stats
        const response = await api.get(`/deliveryman/${user.id}/stats`, {
          signal: abortController.signal,
        })

        if (!isMounted) return

        const data: StatsResponse = response.data

        // Mapeia os dados da API para o formato usado no componente
        setStats({
          pending: data.deliveries?.pending || 0,
          completed: data.deliveries?.completed || 0,
          todayEarnings: data.earnings?.today || 0,
          averageTime: data.performance?.averageDeliveryTime || 0,
          balance: data.balance?.available || 0,
        })

        logger.info("Estatísticas carregadas", {
          context: "Home",
          data: {
            pending: data.deliveries?.pending,
            completed: data.deliveries?.completed,
            todayEarnings: data.earnings?.today
          }
        })
      } catch (error: any) {
        if (error.name === "CanceledError") return

        logger.warn("Erro ao carregar estatísticas", {
          context: "Home",
          data: { status: error.response?.status }
        })

        // Em caso de erro, mantém os valores padrão (zeros)
        if (error.response?.status === 404) {
          logger.info("Endpoint de estatísticas não encontrado", { context: "Home" })
          setStatsError("Endpoint ainda não implementado no backend")
        } else {
          setStatsError("Não foi possível carregar as estatísticas")
        }
      } finally {
        if (isMounted) {
          setIsLoadingStats(false)
        }
      }
    }

    // Busca estatísticas após carregar os dados do usuário
    if (!isLoading && deliveryManData) {
      fetchStats()
    }

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [user?.id, isLoading, deliveryManData])

  if (isLoading || !deliveryManData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Carregando dados...</Text>
            <Text style={styles.loadingSubtext}>Por favor, aguarde</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" tabs={false} />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {DeliveryMan && user && (
          <UserWrapper
            deliveryMan={DeliveryMan}
            balance={stats.balance}
            loadingBalance={isLoadingStats}
          />
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          <QuickActionButton
            icon="bicycle-outline"
            title="Ver Entregas"
            color="#3b82f6"
            onPress={() => router.push("/(tabs)/delivery")}
          />
          <QuickActionButton
            icon="person-outline"
            title="Perfil"
            color="#8b5cf6"
            onPress={() => router.push("/(tabs)/profile")}
          />
          <QuickActionButton
            icon="wallet-outline"
            title="Pagamentos"
            color="#10b981"
            onPress={() => router.push("/(tabs)/payments")}
          />
          <QuickActionButton
            icon="bar-chart-outline"
            title="Estatísticas"
            color="#f59e0b"
            onPress={() => router.push("/(tabs)/charts")}
          />
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <Text style={styles.sectionSubtitle}>
            {isLoadingStats ? "Carregando..." : "Seus números de hoje"}
          </Text>
        </View>

        {statsError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>ℹ️ {statsError}</Text>
            <Text style={styles.errorSubtext}>
              Mostrando valores padrão
            </Text>
          </View>
        )}

        <StatCard
          icon="bicycle-outline"
          title="Entregas Pendentes"
          value={stats.pending}
          subtitle="Aguardando coleta"
          color="#f59e0b"
        />

        <StatCard
          icon="checkmark-circle-outline"
          title="Entregas Concluídas"
          value={stats.completed}
          subtitle="Hoje"
          color="#10b981"
        />

        <StatCard
          icon="cash-outline"
          title="Ganhos do Dia"
          value={`R$ ${stats.todayEarnings.toFixed(2).replace(".", ",")}`}
          subtitle="Continue assim!"
          color="#3b82f6"
        />

        <StatCard
          icon="time-outline"
          title="Tempo Médio"
          value={stats.averageTime > 0 ? `${stats.averageTime} min` : "-"}
          subtitle="Por entrega"
          color="#8b5cf6"
        />

        <View style={styles.spacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    padding: 20,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: "#e0e0e0",
    borderTopColor: "#3b5998",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#666",
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActionsContent: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  errorContainer: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#92400e",
    fontWeight: "600",
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: "#78350f",
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  spacer: {
    height: 20,
  },
})
