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

  const CACHE_KEY_USER = user?.id ? `@delivery_app:user_data:${user.id}` : null
  const CACHE_KEY_STATS = user?.id ? `@delivery_app:user_stats:${user.id}` : null

  // Função para carregar dados do usuário (APENAS AsyncStorage - SEM API)
  const loadUserData = useCallback(async () => {
    if (!user?.id) return null

    try {
      if (CACHE_KEY_USER) {
        const cachedUser = await AsyncStorage.getItem(CACHE_KEY_USER)
        if (cachedUser) {
          const data = JSON.parse(cachedUser)
          setDeliveryManData(data)
          logger.info("Dados do usuário carregados do AsyncStorage", {
            context: "Home",
            data: { userId: user?.id, hasDeliveryMan: !!data?.DeliveryMan }
          })
          return data
        } else {
          logger.warn("Nenhum dado de usuário em cache", { context: "Home" })
          return null
        }
      }
      return null
    } catch (error: any) {
      logger.error("Erro ao ler dados do usuário do AsyncStorage", error, { context: "Home" })
      return null
    }
  }, [user?.id, CACHE_KEY_USER])

  // Função para estatísticas (APENAS AsyncStorage - SEM API)
  const loadStats = useCallback(async () => {
    if (!user?.id) return

    setIsLoadingStats(true)
    setStatsError(null)
    try {
      // Ler stats do AsyncStorage
      if (CACHE_KEY_STATS) {
        const cachedStats = await AsyncStorage.getItem(CACHE_KEY_STATS)
        if (cachedStats) {
          const parsedStats = JSON.parse(cachedStats)
          setStats(parsedStats)
          logger.info("Estatísticas carregadas do AsyncStorage", {
            context: "Home",
            data: parsedStats
          })
        } else {
          // Valores padrão se não houver cache
          setStats({
            completed: 0,
            todayEarnings: 0,
            balance: 0,
          })
          logger.warn("Nenhuma estatística em cache - usando valores padrão", {
            context: "Home"
          })
        }
      }
    } catch (error: any) {
      logger.error("Erro ao ler estatísticas do AsyncStorage", error, {
        context: "Home"
      })
      setStatsError("Erro ao carregar dados locais")
    } finally {
      setIsLoadingStats(false)
    }
  }, [user?.id, CACHE_KEY_STATS])

  const init = useCallback(async () => {
    // APENAS AsyncStorage - SEM CHAMADAS À API
    setIsLoading(true)

    try {
      // Carregar dados do usuário do AsyncStorage
      await loadUserData()

      // Carregar estatísticas do AsyncStorage
      if (CACHE_KEY_STATS) {
        const cachedStats = await AsyncStorage.getItem(CACHE_KEY_STATS)
        if (cachedStats) {
          const parsedStats = JSON.parse(cachedStats)
          const cachedDate = parsedStats.date
          const today = new Date().toDateString()

          // Verificar se o cache expirou (24h - data diferente)
          if (cachedDate !== today) {
            logger.info("Cache de stats expirado (24h) - limpando", {
              context: "Home",
              data: { cachedDate, today }
            })
            // Limpar cache expirado
            await AsyncStorage.removeItem(CACHE_KEY_STATS)
            // Resetar stats para valores padrão
            setStats({
              completed: 0,
              todayEarnings: 0,
              balance: 0,
            })
          } else {
            // Cache válido - usar dados em cache
            setStats(parsedStats)
            logger.info("Stats carregadas do cache (válido)", { context: "Home" })
          }
        } else {
          // Sem cache - valores padrão
          setStats({
            completed: 0,
            todayEarnings: 0,
            balance: 0,
          })
          logger.info("Nenhum cache de stats - usando valores padrão", { context: "Home" })
        }
      }
    } catch (e) {
      logger.warn("Erro ao ler cache", { context: "Home" })
    } finally {
      setIsLoading(false)
    }
  }, [CACHE_KEY_STATS, loadUserData])

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
    // Apenas recarrega do AsyncStorage (SEM API)
    setRefreshing(true)
    try {
      await loadUserData()
      await loadStats()
      logger.info("Dados recarregados do AsyncStorage", { context: "Home" })
    } catch (error: any) {
      logger.error("Erro ao recarregar do AsyncStorage", error, { context: "Home" })
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
          <Text style={styles.sectionSubtitle}>
            {isLoadingStats ? "Carregando..." : "Seus números de hoje (AsyncStorage)"}
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
  spacer: {
    height: 20,
  },
})