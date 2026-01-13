import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect, useRouter } from "expo-router"
import React, { useCallback, useState } from "react"
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
import { logger } from "../utils/logger"



type DeliveryStats = {
  completed: number
  todayEarnings: number
  balance: number
  date?: string // Data para controle de reset de 24h
}

export default function Home() {
  const { user, token } = useAuth()
  // Remove deliveryManData state - use user from context directly
  const [stats, setStats] = useState<DeliveryStats>({
    completed: 0,
    todayEarnings: 0,
    balance: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Destructure DeliveryMan from user context
  const { DeliveryMan } = user || {}
  const router = useRouter()

  const [refreshing, setRefreshing] = useState(false)

  // Remove CACHE_KEY_USER - not needed
  const CACHE_KEY_STATS = user?.id ? `@delivery_app:user_stats:${user.id}` : null

  // Remove loadUserData function - not needed

  // Função para buscar estatísticas da API e salvar no cache
  const loadStats = useCallback(async () => {
    if (!user?.id || !token) return

    setIsLoadingStats(true)
    setStatsError(null)
    try {
      // Buscar entregas da API
      const response = await api.get("/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const orders = response.data.data || []

      // Calcular estatísticas
      const today = new Date().toDateString()

      // Contar entregas concluídas de hoje
      const completedToday = orders.filter((order: any) => {
        if (order.status?.toUpperCase() !== "COMPLETED") return false

        const completedDate = order.completedAt ? new Date(order.completedAt).toDateString() : null
        return completedDate === today
      }).length

      // Calcular ganhos de hoje (soma dos preços das entregas concluídas)
      const todayEarnings = orders
        .filter((order: any) => {
          if (order.status?.toUpperCase() !== "COMPLETED") return false

          const completedDate = order.completedAt ? new Date(order.completedAt).toDateString() : null
          return completedDate === today
        })
        .reduce((acc: number, order: any) => {
          const price = typeof order.price === "string"
            ? parseFloat(order.price.replace(/[R$\s]/g, "").replace(",", "."))
            : parseFloat(order.price || 0)
          return acc + (isNaN(price) ? 0 : price)
        }, 0)

      const newStats = {
        completed: completedToday,
        todayEarnings,
        balance: 0,
        date: today, // Importante: salvar a data
      }

      setStats(newStats)

      // Salvar no AsyncStorage com data de hoje para reset automático
      if (CACHE_KEY_STATS) {
        await AsyncStorage.setItem(
          CACHE_KEY_STATS,
          JSON.stringify(newStats)
        )
      }

      logger.info("Estatísticas carregadas da API e salvas no cache", {
        context: "Home",
        data: newStats
      })
    } catch (error: any) {
      logger.error("Erro ao buscar estatísticas da API", error, {
        context: "Home"
      })
      setStatsError("Erro ao carregar estatísticas")

      // Tentar carregar do cache em caso de erro
      if (CACHE_KEY_STATS) {
        const cachedStats = await AsyncStorage.getItem(CACHE_KEY_STATS)
        if (cachedStats) {
          try {
            const parsedStats = JSON.parse(cachedStats)
            // Verificar se o cache não expirou (ainda é do dia de hoje)
            const cachedDate = parsedStats.date
            const today = new Date().toDateString()

            if (cachedDate === today) {
              setStats(parsedStats)
              logger.info("Estatísticas carregadas do cache (fallback válido)", {
                context: "Home"
              })
            } else {
              // Cache expirado - usar zeros
              setStats({
                completed: 0,
                todayEarnings: 0,
                balance: 0,
              })
              logger.info("Cache expirado - usando zeros", { context: "Home" })
            }
          } catch {
            // Ignorar erros de parse
          }
        }
      }
    } finally {
      setIsLoadingStats(false)
    }
  }, [user?.id, token, CACHE_KEY_STATS])

  const init = useCallback(async () => {
    setIsLoading(true)

    try {
      // Verificar se o cache expirou (passou 24h - dia mudou)
      if (CACHE_KEY_STATS) {
        const cachedStats = await AsyncStorage.getItem(CACHE_KEY_STATS)
        if (cachedStats) {
          try {
            const parsedStats = JSON.parse(cachedStats)
            const cachedDate = parsedStats.date
            const today = new Date().toDateString()

            // Se mudou o dia, limpar o cache (reset de 24h)
            if (cachedDate !== today) {
              logger.info("Cache expirado (24h) - limpando e buscando novos dados", {
                context: "Home",
                data: { cachedDate, today }
              })
              await AsyncStorage.removeItem(CACHE_KEY_STATS)
              // Buscar dados atualizados da API
              await loadStats()
            } else {
              // Cache válido - carregar do cache primeiro (mais rápido)
              setStats(parsedStats)
              logger.info("Stats carregadas do cache (válido)", { context: "Home" })

              // Buscar da API em background para atualizar
              loadStats()
            }
          } catch (parseError) {
            logger.error("Erro ao parsear cache - buscando da API", parseError, {
              context: "Home"
            })
            await AsyncStorage.removeItem(CACHE_KEY_STATS)
            await loadStats()
          }
        } else {
          // Sem cache - buscar da API
          logger.info("Sem cache - buscando da API", { context: "Home" })
          await loadStats()
        }
      }
    } catch (e) {
      logger.warn("Erro ao inicializar", { context: "Home" })
    } finally {
      setIsLoading(false)
    }
  }, [CACHE_KEY_STATS, loadStats])

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
    setRefreshing(true)
    try {
      await loadStats()
      logger.info("Dados recarregados da API", { context: "Home" })
    } catch (error: any) {
      logger.error("Erro ao recarregar da API", error, { context: "Home" })
    } finally {
      setRefreshing(false)
    }
  }

  const handleClearCache = async () => {
    try {
      if (CACHE_KEY_STATS) {
        await AsyncStorage.removeItem(CACHE_KEY_STATS)
      }
      Alert.alert("Cache Limpo", "Os dados locais foram removidos. Recarregando da API...")
      // Buscar dados atualizados da API
      await loadStats()
    } catch (error) {
      Alert.alert("Erro", "Falha ao limpar cache")
    }
  }

  // Remove (!deliveryManData) check from loading condition
  if (isLoading || !user) {
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
            avatarUrl={user.Avatar?.path}
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
            {isLoadingStats ? "Carregando..." : "Seus números de hoje (zera a cada 24h)"}
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