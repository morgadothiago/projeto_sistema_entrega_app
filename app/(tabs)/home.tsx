import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect, useRouter } from "expo-router"
import React, { useCallback, useRef, useState } from "react"
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "../components/Header"
import QuickActionButton from "../components/QuickActionButton"
import StatCard from "../components/StatCard"
import UserWrapper from "../components/UserWrapper"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { getElevation } from "../theme/elevations"
import { ApiOrder } from "../types/order"
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

type DeliveryStats = {
  completed: number
  todayEarnings: number
  balance: number
}

export default function Home() {
  const { user, token } = useAuth()
  const [deliveryManData, setDeliveryManData] = useState<DeliveryMan | null>(
    null
  )
  const [stats, setStats] = useState<DeliveryStats>({
    completed: 0,
    todayEarnings: 0,
    balance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { DeliveryMan } = user || {}
  const router = useRouter()

  const [refreshing, setRefreshing] = useState(false)
  const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null)
  const lastFetchRef = useRef<number>(0)
  const rateLimitUntil = useRef<number>(0) // Bloqueia requisições até este timestamp

  const CACHE_KEY_USER = user?.id ? `@delivery_app:user_data:${user.id}` : null
  const CACHE_KEY_STATS = user?.id ? `@delivery_app:user_stats:${user.id}` : null

  // Função para carregar dados do usuário
  const loadUserData = useCallback(async (abortSignal?: AbortSignal) => {
    if (token === null) {
      router.replace("/(auth)/Signin")
      return null
    }
    if (!user?.id) return null

    try {
      const response = await api.get(`/users/${user.id}`, { signal: abortSignal })
      const data = response.data
      setDeliveryManData(data)
      if (CACHE_KEY_USER) {
        await AsyncStorage.setItem(CACHE_KEY_USER, JSON.stringify(data))
      }

      logger.debug("Dados do usuário carregados", {
        context: "Home",
        data: { userId: user?.id, hasDeliveryMan: !!data?.DeliveryMan }
      })

      // Verificações de documentos/banco...
      const hasDocuments =
        data?.DeliveryMan?.Documents &&
        data.DeliveryMan.Documents.length > 0

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

      if (!hasDocuments || !hasBankAccount) {
        logger.warn("Cadastro incompleto, redirecionando", {
          context: "Home",
          data: { hasDocuments, hasBankAccount }
        })
        router.replace("/(auth)/LoadingDocuments")
        return null
      }
      logger.info("Cadastro completo verificado", { context: "Home" })
      return data
    } catch (error: any) {
      if (error.name === 'CanceledError') return null

      // Tratamento especial para erro 429 - NÃO redirecionar
      if (error?.response?.status === 429) {
        // Bloqueia novas requisições por 2 minutos
        rateLimitUntil.current = Date.now() + 120000
        logger.warn("Rate limit 429 em loadUserData - bloqueando por 2 minutos", {
          context: "Home",
          data: { until: new Date(rateLimitUntil.current).toISOString() }
        })
        return null // Retorna null mas NÃO redireciona
      }

      logger.error("Erro ao carregar usuário", error, { context: "Home" })

      // Só redireciona para Signin em erros de autenticação (401, 403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        router.replace("/(auth)/Signin")
      }
      return null
    }
  }, [token, user?.id, CACHE_KEY_USER, router])

  // Função para estatísticas
  const loadStats = useCallback(async (abortSignal?: AbortSignal) => {
    if (!user?.id) return

    setIsLoadingStats(true)
    setStatsError(null)
    try {
      const [statsResponse, deliveriesResponse] = await Promise.all([
        api.get(`/deliveryman/${user.id}/stats`, { signal: abortSignal }),
        api.get(`/delivery`, { params: { limit: 100 }, signal: abortSignal })
      ])

      const statsData = statsResponse.data
      const balance = statsData.balance?.available || 0
      const orders: ApiOrder[] = deliveriesResponse.data.data || []

      const today = new Date().toDateString()
      const todayDeliveries = orders.filter(order => {
        const status = order.status?.toLowerCase()
        const isCompleted = status === "delivered" || status === "completed"
        if (!isCompleted) return false
        if (order.completedAt) {
          return new Date(order.completedAt).toDateString() === today
        }
        return false
      })

      const todayCompletedCount = todayDeliveries.length
      const todayEarnings = todayDeliveries.reduce((acc, curr) => {
        if (!curr.price) return acc
        const cleanPrice = String(curr.price).replace(/[R$\s]/g, "").replace(",", ".")
        const val = parseFloat(cleanPrice) || 0
        return acc + val
      }, 0)

      setStats({
        completed: todayCompletedCount,
        todayEarnings: todayEarnings,
        balance: balance,
      })

      // Salvar no cache com a data de hoje para reset automático
      if (CACHE_KEY_STATS) {
        const todayDate = new Date().toDateString()
        await AsyncStorage.setItem(CACHE_KEY_STATS, JSON.stringify({
          completed: todayCompletedCount,
          todayEarnings: todayEarnings,
          balance: balance,
          date: todayDate // Importante para o reset de 24h
        }))
      }

      logger.info("Estatísticas Home atualizadas (Cálculo Local)", {
        context: "Home",
        data: {
          todayCompletedCount,
          todayEarnings,
          balance
        }
      })

    } catch (error: any) {
      if (error.name === "CanceledError") return

      if (error.response?.status === 429) {
        // Bloqueia novas requisições por 2 minutos
        rateLimitUntil.current = Date.now() + 120000
        setStatsError("Muitas tentativas. Aguarde 2 minutos.")
        logger.warn("Rate limit 429 em loadStats - bloqueando por 2 minutos", {
          context: "Home",
          data: { until: new Date(rateLimitUntil.current).toISOString() }
        })
      } else {
        setStatsError("Não foi possível atualizar os dados")
      }
      logger.warn("Erro ao carregar estatísticas Home", {
        context: "Home",
        data: { error: error.message }
      })
    } finally {
      setIsLoadingStats(false)
    }
  }, [user?.id, CACHE_KEY_STATS])

  const init = useCallback(async () => {
    // 1. SEMPRE carregar do cache primeiro - APP NUNCA PARA
    try {
      if (CACHE_KEY_USER && CACHE_KEY_STATS) {
        const [cachedUser, cachedStats] = await Promise.all([
          AsyncStorage.getItem(CACHE_KEY_USER),
          AsyncStorage.getItem(CACHE_KEY_STATS)
        ])

        if (cachedUser && !deliveryManData) {
          setDeliveryManData(JSON.parse(cachedUser))
          logger.info("Dados carregados do cache", { context: "Home" })
        }

        if (cachedStats) {
          const parsedStats = JSON.parse(cachedStats)
          // MUDANÇA: Aceita cache de qualquer dia se não tiver dados
          if (!stats.completed && !stats.todayEarnings) {
            setStats(parsedStats)
            logger.info("Stats carregadas do cache", { context: "Home" })
          }
        }
      }
    } catch (e) {
      logger.warn("Erro ao ler cache", { context: "Home" })
    }

    // 2. VERIFICAÇÃO: Se estamos bloqueados por rate limit, usar só cache
    const now = Date.now()
    if (now < rateLimitUntil.current) {
      const waitTime = Math.ceil((rateLimitUntil.current - now) / 1000)
      logger.warn("Rate limit ativo - usando cache", {
        context: "Home",
        data: { waitTimeSeconds: waitTime }
      })
      setIsLoading(false)
      return // Para aqui, mas app continua funcionando com cache
    }

    // 3. Evita requisições muito frequentes
    const timeSinceLastFetch = Date.now() - lastFetchRef.current
    if (deliveryManData && timeSinceLastFetch < 60000) {
      logger.info("Usando dados em memória", {
        context: "Home",
        data: { timeSinceLastFetch }
      })
      return
    }

    // 4. Tentar atualizar com API (opcional - se falhar, app continua com cache)
    setIsLoading(true)
    const abortController = new AbortController()
    try {
      const data = await loadUserData(abortController.signal)
      if (data) {
        await loadStats(abortController.signal)
        lastFetchRef.current = Date.now()
      }
    } catch (error: any) {
      // Qualquer erro: app continua com cache
      logger.info("API falhou - continuando com cache", {
        context: "Home",
        data: { error: error?.message }
      })
    } finally {
      setIsLoading(false)
    }
  }, [deliveryManData, stats, CACHE_KEY_USER, CACHE_KEY_STATS, loadUserData, loadStats])

  useFocusEffect(
    useCallback(() => {
      init()

      // AUTO-REFRESH DESABILITADO - Evita rate limit 429
      // Usuário pode atualizar manualmente com pull-to-refresh

      return () => {
        // Cleanup se necessário
      }
    }, [init])
  )

  const handleRefresh = async () => {
    // Verificar se estamos bloqueados por rate limit
    const now = Date.now()
    if (now < rateLimitUntil.current) {
      const waitTime = Math.ceil((rateLimitUntil.current - now) / 1000)
      logger.warn("Pull-to-refresh bloqueado por rate limit", {
        context: "Home",
        data: { waitTimeSeconds: waitTime }
      })
      setRefreshing(false)
      // Não faz nada - mantém dados em cache
      return
    }

    setRefreshing(true)
    const abortController = new AbortController()
    try {
      const data = await loadUserData(abortController.signal)
      if (data) {
        await loadStats(abortController.signal)
        lastFetchRef.current = Date.now()
      }
    } catch (error: any) {
      // Qualquer erro: mantém cache, não quebra app
      logger.info("Refresh falhou - mantendo cache", {
        context: "Home",
        data: { error: error?.message }
      })
    } finally {
      setRefreshing(false)
    }
  }

  const handleClearCache = async () => {
    try {
      if (CACHE_KEY_USER && CACHE_KEY_STATS) {
        await AsyncStorage.removeItem(CACHE_KEY_USER)
        await AsyncStorage.removeItem(CACHE_KEY_STATS)
      }
      Alert.alert("Cache Limpo", "Os dados locais foram removidos. Recarregando...")
      setDeliveryManData(null)
      init()
    } catch (error) {
      Alert.alert("Erro", "Falha ao limpar cache")
    }
  }

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
      <Header
        title="Home"
        tabs={false}
        onNotificationPress={() => router.push("/settings/notifications")}
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.buttons]}
          />
        }
      >
        {DeliveryMan && user && (
          <UserWrapper
            deliveryMan={DeliveryMan}
            balance={stats.todayEarnings}
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
          <QuickActionButton
            icon="trash-outline"
            title="Limpar Cache"
            color="#ef4444"
            onPress={handleClearCache}
          />
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.sectionSubtitle}>
              {isLoadingStats ? "Carregando..." : "Seus números de hoje"}
            </Text>
            {nextUpdateTime && (
              <Text style={styles.updateText}>
                Próx. atualização {nextUpdateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
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
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    marginHorizontal: 20,
    ...getElevation('fab'),
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
    borderLeftWidth: 6,
    borderLeftColor: "#f59e0b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 4,
    ...getElevation('surface'),
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
  subtitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updateText: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.5,
  },
  spacer: {
    height: 20,
  },
})
