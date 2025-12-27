/**
 * Tela de Relatórios e Estatísticas
 * Versão melhorada com API real e layout correto
 */

import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import DeliveryCard from "../components/DeliveryCard"
import { Header } from "../components/Header"
import AppPicker from "../components/Select"
import { useAuth } from "../context/AuthContext"
import type { DeliveryItem } from "../mocks/deliveriesData"
import { api } from "../service/api"
import { colors } from "../theme"
import { getElevation } from "../theme/elevations"
import { ApiOrder } from "../types/order"
import { logger } from "../utils/logger"

// --- TIPOS ---

type DayOption = {
  label: string
  value: string
}

type Stats = {
  total: number
  completed: number
  pending: number
  earnings: number
}

// Constante de itens por página
const ITEMS_PER_PAGE = 5

// --- HELPER FUNCTIONS ---

/**
 * Normaliza o status da API para o formato da UI
 */
const normalizeStatus = (
  status: string
): "completed" | "pending" | "in_progress" => {
  const statusLower = status.toLowerCase()
  if (statusLower === "delivered" || statusLower === "completed") {
    return "completed"
  }
  if (
    statusLower === "in_transit" ||
    statusLower === "in_progress" ||
    statusLower === "picked_up"
  ) {
    return "in_progress"
  }
  return "pending"
}

/**
 * Mapeia ApiOrder para DeliveryItem
 */
const mapOrderToDeliveryItem = (order: ApiOrder): DeliveryItem => {
  // Tentar extrair data de completedAt ou usar data atual como fallback visual se status for pending
  const dateStr = order.completedAt || new Date().toISOString()
  const dateObj = new Date(dateStr)

  // Obter dia da semana em inglês para filtro (sunday, monday...)
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  const dayOfWeek = days[dateObj.getDay()]

  const status = normalizeStatus(order.status)

  // Parse do preço (ex: "R$ 50,00" -> 50.00)
  // Se for uma string vazia ou nulo, retorna 0
  let value = 0
  if (order.price) {
    // Remove "R$", espaços, substitui vírgula por ponto
    const cleanPrice = order.price.replace(/[R$\s]/g, "").replace(",", ".")
    value = parseFloat(cleanPrice) || 0
  }

  return {
    id: order.id.toString(),
    code: order.code,
    status: status,
    day: dayOfWeek,
    customerName: order.Company?.name || "Cliente",
    address: order.andress || "Endereço não informado",
    value: value,
    description: order.information || `Entrega para ${order.Company?.name || "Cliente"}`,
    date: dateStr,
  }
}

export default function Charts() {
  const { user, token } = useAuth()
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<number>(0)

  // Dados
  const [allDeliveries, setAllDeliveries] = useState<DeliveryItem[]>([])
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryItem[]>([])

  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
    earnings: 0,
  })

  // Paginação
  const [displayedDeliveries, setDisplayedDeliveries] = useState<DeliveryItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)

  // Opções de dias da semana
  const dayOptions: DayOption[] = [
    { label: "Domingo", value: "sunday" },
    { label: "Segunda-feira", value: "monday" },
    { label: "Terça-feira", value: "tuesday" },
    { label: "Quarta-feira", value: "wednesday" },
    { label: "Quinta-feira", value: "thursday" },
    { label: "Sexta-feira", value: "friday" },
    { label: "Sábado", value: "saturday" },
  ]

  // --- ACTIONS ---

  const calculateStats = useCallback((items: DeliveryItem[]) => {
    const total = items.length
    // Convert status to lowercase for robust comparison just in case
    const completed = items.filter((i) => i.status?.toLowerCase() === "completed" || i.status?.toLowerCase() === "delivered").length
    const pending = items.filter((i) => i.status?.toLowerCase() === "pending").length

    // Earnings calculation - ensure value is treated as number
    const earnings = items
      .filter((i) => i.status?.toLowerCase() === "completed" || i.status?.toLowerCase() === "delivered")
      .reduce((acc, curr) => {
        const val = typeof curr.value === 'number' ? curr.value : parseFloat(String(curr.value || 0));
        return acc + (isNaN(val) ? 0 : val);
      }, 0)

    setStats({
      total,
      completed,
      pending,
      earnings
    })
  }, [])

  const fetchDeliveries = useCallback(async (forceRefresh = false) => {
    if (!token || !user) return

    try {
      setError(null)
      logger.info("Buscando entregas para relatórios", { context: "Charts" })

      // Usando o mesmo endpoint de listagem de entregas
      const response = await api.get("/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Permite forçar refresh ignorando cache
        ...(forceRefresh && { skipCache: true }),
      } as any)

      let orders: ApiOrder[] = response.data.data || [] // Garantir que é array

      // Tentar filtrar pelo ID do entregador se a API retornar esse campo
      // Isso atende à solicitação: "entregas tem que ser relacionada a o deliveryman"
      // Se não tiver o campo, mostramos todas (assumindo que o endpoint já filtra ou retorna pool aberto)
      const hasDeliverymanInfo = orders.some((o: any) => o.deliverymanId)

      if (hasDeliverymanInfo) {
        orders = orders.filter((o: any) => o.deliverymanId === user.id || o.deliverymanId === Number(user.id))
      }

      const mappedItems = orders.map(mapOrderToDeliveryItem)

      // Ordenar por data (mais recente primeiro)
      mappedItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setAllDeliveries(mappedItems)
      setFilteredDeliveries(mappedItems) // Inicialmente, todos
      calculateStats(mappedItems)

      logger.info("Dados carregados com sucesso", {
        context: "Charts",
        data: { count: mappedItems.length }
      })

    } catch (err: any) {
      logger.error("Erro ao buscar entregas", err, { context: "Charts" })

      // Tratamento específico para erro 404
      if (err?.response?.status === 404) {
        Toast.show({
          type: "info",
          text1: "Nenhuma entrega encontrada",
          text2: "Não há entregas cadastradas no sistema ainda",
          visibilityTime: 4000,
        })
        // Mantém listas vazias - app continua funcionando
        setAllDeliveries([])
        setFilteredDeliveries([])
        calculateStats([])
        setError(null) // Remove erro visual
      } else {
        // Outros erros
        setError("Não foi possível carregar os dados das entregas.")
        Toast.show({
          type: "error",
          text1: "Erro ao carregar entregas",
          text2: err?.message || "Tente novamente mais tarde",
          visibilityTime: 4000,
        })
      }
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [token, user, calculateStats])

  // --- EFFECTS ---

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // Aplicar Filtro de Dia
  useEffect(() => {
    if (selectedDay) {
      const filtered = allDeliveries.filter(d => d.day === selectedDay)
      setFilteredDeliveries(filtered)
      calculateStats(filtered)
    } else {
      setFilteredDeliveries(allDeliveries)
      calculateStats(allDeliveries)
    }
  }, [selectedDay, allDeliveries, calculateStats])

  // Paginação: Atualizar lista exibida quando filteredDeliveries mudar
  useEffect(() => {
    setDisplayedDeliveries(filteredDeliveries.slice(0, ITEMS_PER_PAGE))
    setCurrentPage(1)
  }, [filteredDeliveries])

  // --- HANDLERS ---

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    // Força refresh ignorando cache
    fetchDeliveries(true)
  }, [fetchDeliveries])

  const handleDayChange = useCallback((value: string | undefined) => {
    setSelectedDay(value)
  }, [])

  const handleClearFilter = useCallback(() => {
    setSelectedDay(undefined)
  }, [])

  const loadMoreDeliveries = useCallback(() => {
    if (loadingMore || displayedDeliveries.length >= filteredDeliveries.length) return

    setLoadingMore(true)
    setTimeout(() => {
      const nextPage = currentPage + 1
      const endIndex = nextPage * ITEMS_PER_PAGE
      const newItems = filteredDeliveries.slice(0, endIndex)

      setDisplayedDeliveries(newItems)
      setCurrentPage(nextPage)
      setLoadingMore(false)
    }, 500)
  }, [loadingMore, displayedDeliveries.length, filteredDeliveries, currentPage])

  // --- RENDER ---

  const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const inProgress = stats.total - stats.completed - stats.pending

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Relatórios" tabs={true} tabsTitle="Relatórios" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttons} />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Relatórios"
        tabs={true}
        tabsTitle="Relatórios"
        onNotificationPress={() => { }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.buttons]}
            tintColor={colors.buttons}
          />
        }
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>ℹ️ {error}</Text>
          </View>
        )}

        {/* --- Card Principal de Estatísticas --- */}
        <View style={styles.section}>
          <View style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Text style={styles.highlightTitle}>📊 Estatísticas</Text>
              <View style={styles.highlightBadge}>
                <Text style={styles.highlightBadgeText}>
                  {selectedDay
                    ? dayOptions.find((opt) => opt.value === selectedDay)?.label
                    : "Geral"}
                </Text>
              </View>
            </View>

            <View style={styles.highlightStats}>
              <View style={styles.highlightStatItem}>
                <Text style={styles.highlightStatValue}>{stats.total}</Text>
                <Text style={styles.highlightStatLabel}>Total</Text>
              </View>
              <View style={styles.highlightDivider} />
              <View style={styles.highlightStatItem}>
                <Text style={[styles.highlightStatValue, { color: "#10b981" }]}>
                  {stats.completed}
                </Text>
                <Text style={styles.highlightStatLabel}>Concluídas</Text>
              </View>
              <View style={styles.highlightDivider} />
              <View style={styles.highlightStatItem}>
                <Text style={[styles.highlightStatValue, { color: "#3b82f6" }]}>
                  {inProgress}
                </Text>
                <Text style={styles.highlightStatLabel}>Em Rota</Text>
              </View>
            </View>

            {stats.total > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${successRate}%` },
                  ]}
                />
              </View>
            )}

            <Text style={styles.highlightSubtext}>
              {stats.completed} entregas concluídas de {stats.total}
            </Text>
          </View>
        </View>

        {/* --- Insights --- */}
        <View style={styles.section}>
          <Text style={styles.insightsTitle}>💡 Resumo</Text>
          <View style={styles.insightsGrid}>
            <View style={[styles.insightCard, { backgroundColor: "#3b82f6" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>💰</Text>
              </View>
              <Text style={styles.insightValue}>R$ {stats.earnings.toFixed(2)}</Text>
              <Text style={styles.insightLabel}>Ganhos</Text>
            </View>

            <View style={[styles.insightCard, { backgroundColor: "#8b5cf6" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>🚚</Text>
              </View>
              <Text style={styles.insightValue}>{inProgress}</Text>
              <Text style={styles.insightLabel}>Em Rota</Text>
            </View>
          </View>
        </View>

        {/* --- Filtro --- */}
        <View style={styles.section}>
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>🔍 Filtrar</Text>
                <Text style={styles.filterSubtitle}>Por dia da semana</Text>
              </View>
              {selectedDay && (
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={handleClearFilter}
                >
                  <Text style={styles.clearFilterText}>✕ Limpar</Text>
                </TouchableOpacity>
              )}
            </View>
            <AppPicker
              label=""
              selectedValue={selectedDay}
              onValueChange={handleDayChange}
              options={dayOptions}
              placeholder="Todos os dias"
            />
          </View>
        </View>

        {/* --- Lista de Entregas --- */}
        <View style={styles.section}>
          <View style={styles.deliveriesHeaderCard}>
            <View style={styles.deliveriesHeaderContent}>
              <Text style={styles.deliveriesTitle}>
                📦 {selectedDay ? dayOptions.find(d => d.value === selectedDay)?.label : "Histórico"}
              </Text>
              <View style={styles.deliveriesCountBadge}>
                <Text style={styles.deliveriesCountText}>
                  {displayedDeliveries.length} de {filteredDeliveries.length}
                </Text>
              </View>
            </View>
          </View>

          {filteredDeliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>Nenhuma entrega encontrada</Text>
            </View>
          ) : (
            <FlatList
              data={displayedDeliveries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <DeliveryCard item={item} />}
              scrollEnabled={false}
              contentContainerStyle={styles.deliveriesList}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.buttons} />
                    <Text style={styles.loadingMoreText}>Carregando...</Text>
                  </View>
                ) : displayedDeliveries.length < filteredDeliveries.length ? (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreDeliveries}
                  >
                    <Text style={styles.loadMoreButtonText}>
                      Ver mais ({filteredDeliveries.length - displayedDeliveries.length})
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#92400e",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  highlightCard: {
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 4,
    borderTopWidth: 4,
    borderTopColor: colors.active,
    ...getElevation('elevated'),
  },
  highlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  highlightBadge: {
    backgroundColor: "rgba(0, 200, 179, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  highlightBadgeText: {
    color: colors.buttons,
    fontSize: 12,
    fontWeight: "600",
  },
  highlightStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  highlightStatItem: {
    alignItems: "center",
    flex: 1,
  },
  highlightStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  highlightStatLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  highlightDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.buttons,
    borderRadius: 4,
  },
  highlightSubtext: {
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  insightsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  insightCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
    ...getElevation('card'),
  },
  insightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 20,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    ...getElevation('card'),
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  filterSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  clearFilterButton: {
    padding: 8,
  },
  clearFilterText: {
    color: colors.buttons,
    fontSize: 12,
    fontWeight: "600",
  },
  deliveriesHeaderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  deliveriesHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  deliveriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  deliveriesCountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.buttons,
  },
  deliveriesCountText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 4,
    ...getElevation('surface'),
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  deliveriesList: {
    gap: 12,
    paddingBottom: 20,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  loadingMoreText: {
    color: colors.text,
    fontSize: 14,
  },
  loadMoreButton: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.buttons,
    ...getElevation('surface'),
  },
  loadMoreButtonText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  bottomSpacer: {
    height: 40,
  },
})
