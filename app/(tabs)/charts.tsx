/**
 * Tela de Relatórios e Estatísticas
 * Versão melhorada com API real e layout correto
 */

import React, { useState, useCallback, useEffect, useMemo } from "react"
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { Header } from "../components/Header"
import { colors } from "../theme"
import AppPicker from "../components/Select"
import DeliveryCard from "../components/DeliveryCard"
import { DeliveryItem, deliveriesData } from "../mocks/deliveriesData"
import { logger } from "../utils/logger"
import { ERROR_MESSAGES } from "../utils/constants"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import type {
  ReportsResponse,
  DailyStatsResponse,
  DeliveryFromAPI,
} from "../types/api"

/**
 * Normaliza o status para os valores aceitos
 */
const normalizeStatus = (
  status: string
): "completed" | "pending" | "in_progress" => {
  const statusLower = status.toLowerCase()
  if (statusLower === "delivered" || statusLower === "completed") {
    return "completed"
  }
  if (statusLower === "in_transit" || statusLower === "in_progress") {
    return "in_progress"
  }
  return "pending"
}

/**
 * Converte dados da API para o formato DeliveryItem
 */
const mapApiDeliveryToDeliveryItem = (
  apiDelivery: DeliveryFromAPI
): DeliveryItem => {
  return {
    id: apiDelivery.id,
    code: apiDelivery.code,
    status: normalizeStatus(apiDelivery.status),
    day: apiDelivery.day,
    customerName: apiDelivery.customerName,
    address: apiDelivery.address,
    value: apiDelivery.value,
    description:
      apiDelivery.description || `Entrega para ${apiDelivery.customerName}`,
    date: apiDelivery.date || apiDelivery.createdAt,
  }
}

type DayOption = {
  label: string
  value: string
}

type Stats = {
  total: number
  completed: number
  pending: number
}

// Constante de itens por página (fora do componente para evitar re-renders)
const ITEMS_PER_PAGE = 3

export default function Charts() {
  const { user, token } = useAuth()
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dados da API
  const [reportsData, setReportsData] = useState<ReportsResponse | null>(null)
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    completed: 0,
    pending: 0,
  })

  // Paginação para scroll infinito
  const [displayedDeliveries, setDisplayedDeliveries] = useState<
    DeliveryItem[]
  >([])
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

  // Função para carregar dados mock
  const loadMockData = useCallback(() => {
    logger.info("Carregando dados mock", { context: "Charts" })

    // Usar dados mock (type assertion para compatibilidade)
    setDeliveries(deliveriesData as DeliveryItem[])

    // Calcular estatísticas dos dados mock
    const completed = deliveriesData.filter(
      (d) => d.status === "completed"
    ).length
    const pending = deliveriesData.filter((d) => d.status === "pending").length

    setStats({
      total: deliveriesData.length,
      completed,
      pending,
    })

    setReportsData(null)
  }, [])

  // Buscar dados da API
  const fetchReportsData = useCallback(async () => {
    if (!user?.id || !token) {
      logger.warn("Usuário não autenticado, usando dados mock", {
        context: "Charts",
      })
      loadMockData()
      setError("Faça login para ver seus dados reais.")
      setIsLoading(false)
      setRefreshing(false)
      return
    }

    try {
      setError(null)
      logger.info("Buscando dados de relatórios", { context: "Charts" })

      // Endpoint: GET /deliveryman/{id}/reports ou /reports
      const response = await api.get(`/deliveryman/${user.id}/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data: ReportsResponse = response.data

      setReportsData(data)

      // Mapeia dados da API para o formato esperado
      const mappedDeliveries = (data.deliveries || []).map(
        mapApiDeliveryToDeliveryItem
      )
      setDeliveries(mappedDeliveries)

      // Define estatísticas iniciais (da semana toda)
      setStats({
        total: data.summary?.totalDeliveries || 0,
        completed: data.summary?.completedDeliveries || 0,
        pending: data.summary?.pendingDeliveries || 0,
      })

      logger.info("Dados de relatórios carregados", {
        context: "Charts",
        data: {
          totalDeliveries: data.summary?.totalDeliveries,
          deliveriesCount: data.deliveries?.length,
        },
      })
    } catch (err: any) {
      logger.error("Erro ao buscar relatórios", err, { context: "Charts" })

      // Se o endpoint não existir (404), usar dados mock
      if (err.response?.status === 404) {
        logger.warn("Endpoint de relatórios não encontrado, usando mock", {
          context: "Charts",
        })
        setError("Endpoint ainda não implementado. Usando dados de exemplo.")
        loadMockData()
      } else {
        setError(ERROR_MESSAGES.GENERIC_ERROR)
        loadMockData()
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: ERROR_MESSAGES.GENERIC_ERROR,
        })
      }
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }, [user?.id, token, loadMockData])

  // Carregar dados ao montar
  useEffect(() => {
    fetchReportsData()
  }, [fetchReportsData])

  // Atualizar dados quando o dia muda
  useEffect(() => {
    // Se temos dados da API
    if (reportsData) {
      if (selectedDay && reportsData.weeklyStats?.[selectedDay]) {
        const dayData = reportsData.weeklyStats[selectedDay]
        setStats({
          total: dayData.totalDeliveries,
          completed: dayData.completedDeliveries,
          pending: dayData.pendingDeliveries,
        })

        // Filtrar entregas do dia
        const filtered = (reportsData.deliveries || [])
          .filter((d) => d.day === selectedDay)
          .map(mapApiDeliveryToDeliveryItem)
        setDeliveries(filtered)

        logger.debug("Filtro de dia aplicado (API)", {
          context: "Charts",
          data: { day: selectedDay, count: filtered.length },
        })
      } else {
        // Mostrar dados da semana toda
        setStats({
          total: reportsData.summary?.totalDeliveries || 0,
          completed: reportsData.summary?.completedDeliveries || 0,
          pending: reportsData.summary?.pendingDeliveries || 0,
        })
        const mappedDeliveries = (reportsData.deliveries || []).map(
          mapApiDeliveryToDeliveryItem
        )
        setDeliveries(mappedDeliveries)
      }
    } else {
      // Usando dados mock - filtrar se um dia foi selecionado
      if (selectedDay) {
        const filtered = deliveriesData.filter(
          (d) => d.day === selectedDay
        ) as DeliveryItem[]
        setDeliveries(filtered)

        const completed = filtered.filter(
          (d) => d.status === "completed"
        ).length
        const pending = filtered.filter((d) => d.status === "pending").length

        setStats({
          total: filtered.length,
          completed,
          pending,
        })

        logger.debug("Filtro de dia aplicado (Mock)", {
          context: "Charts",
          data: { day: selectedDay, count: filtered.length },
        })
      } else {
        // Mostrar todos os dados mock
        setDeliveries(deliveriesData as DeliveryItem[])

        const completed = deliveriesData.filter(
          (d) => d.status === "completed"
        ).length
        const pending = deliveriesData.filter(
          (d) => d.status === "pending"
        ).length

        setStats({
          total: deliveriesData.length,
          completed,
          pending,
        })
      }
    }
  }, [selectedDay, reportsData])

  // Handler para mudança de dia
  const handleDayChange = useCallback(
    (value: string | undefined) => {
      logger.info("Filtro de dia alterado", {
        context: "Charts",
        data: { from: selectedDay, to: value },
      })
      setSelectedDay(value)
    },
    [selectedDay]
  )

  // Handler para refresh
  const handleRefresh = useCallback(() => {
    logger.info("Atualizando relatórios", { context: "Charts" })
    setRefreshing(true)
    fetchReportsData()
  }, [fetchReportsData])

  // Handler para limpar filtro
  const handleClearFilter = useCallback(() => {
    setSelectedDay(undefined)
  }, [])

  // Carregar mais entregas (scroll infinito)
  const loadMoreDeliveries = useCallback(() => {
    console.log("🔄 [Charts] loadMoreDeliveries chamado", {
      loadingMore,
      currentlyDisplayed: displayedDeliveries.length,
      total: deliveries.length,
    })

    if (loadingMore) {
      console.log("⏸️ [Charts] Já está carregando, ignorando...")
      return
    }

    const totalItems = deliveries.length
    const currentlyDisplayed = displayedDeliveries.length

    if (currentlyDisplayed >= totalItems) {
      console.log("✅ [Charts] Todas as entregas já foram carregadas")
      logger.debug("Todas as entregas já foram carregadas", {
        context: "Charts",
        data: { total: totalItems, displayed: currentlyDisplayed },
      })
      return
    }

    setLoadingMore(true)
    console.log("⏳ [Charts] Carregando mais entregas...")
    logger.info("Carregando mais entregas", {
      context: "Charts",
      data: { page: currentPage + 1 },
    })

    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = 0
      const endIndex = nextPage * ITEMS_PER_PAGE
      const newDisplayedDeliveries = deliveries.slice(startIndex, endIndex)

      console.log("✨ [Charts] Mais entregas carregadas:", {
        antes: currentlyDisplayed,
        depois: newDisplayedDeliveries.length,
        pagina: nextPage,
      })

      setDisplayedDeliveries(newDisplayedDeliveries)
      setCurrentPage(nextPage)
      setLoadingMore(false)

      logger.debug("Mais entregas carregadas", {
        context: "Charts",
        data: { loaded: newDisplayedDeliveries.length, total: totalItems },
      })
    }, 300) // Pequeno delay para melhor UX
  }, [deliveries, displayedDeliveries, currentPage, loadingMore])

  // Atualizar entregas exibidas quando deliveries mudar
  useEffect(() => {
    if (deliveries.length === 0) {
      setDisplayedDeliveries([])
      setCurrentPage(1)
      return
    }

    // Reset para primeira página - SEMPRE limitar a 5 itens
    const initialDeliveries = deliveries.slice(0, ITEMS_PER_PAGE)
    setCurrentPage(1)
    setDisplayedDeliveries(initialDeliveries)

    // Debug log
    console.log("📊 [Charts] Entregas atualizadas:", {
      total: deliveries.length,
      exibidas: initialDeliveries.length,
      limite: ITEMS_PER_PAGE,
    })

    logger.info("Entregas exibidas resetadas", {
      context: "Charts",
      data: {
        total: deliveries.length,
        displayed: initialDeliveries.length,
        limit: ITEMS_PER_PAGE,
      },
    })
  }, [deliveries])

  // Loading inicial
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Relatórios" tabs={true} tabsTitle="Relatórios" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.buttons} />
          <Text style={styles.loadingText}>Carregando relatórios...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Relatórios" tabs={true} tabsTitle="Relatórios" />

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
        {/* Mensagem de erro (se houver) */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>ℹ️ {error}</Text>
          </View>
        )}

        {/* Card de Destaque Principal */}
        <View style={styles.section}>
          <View style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Text style={styles.highlightTitle}>📊 Estatísticas</Text>
              <View style={styles.highlightBadge}>
                <Text style={styles.highlightBadgeText}>
                  {selectedDay
                    ? dayOptions.find((opt) => opt.value === selectedDay)?.label
                    : "Semana"}
                </Text>
              </View>
            </View>
            <View style={styles.highlightStats}>
              <View style={styles.highlightStatItem}>
                <Text style={styles.highlightStatValue}>{stats.total}</Text>
                <Text style={styles.highlightStatLabel}>Total de Entregas</Text>
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
                <Text style={[styles.highlightStatValue, { color: "#f59e0b" }]}>
                  {stats.pending}
                </Text>
                <Text style={styles.highlightStatLabel}>Pendentes</Text>
              </View>
            </View>
            {stats.total > 0 && (
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${(stats.completed / stats.total) * 100}%` },
                  ]}
                />
              </View>
            )}
            <Text style={styles.highlightSubtext}>
              Taxa de conclusão:{" "}
              {stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              %
            </Text>
          </View>
        </View>

        {/* Cards de Insights */}
        <View style={styles.section}>
          <Text style={styles.insightsTitle}>💡 Insights Rápidos</Text>
          <View style={styles.insightsGrid}>
            {/* Card: Taxa de Sucesso */}
            <View style={[styles.insightCard, { backgroundColor: "#10b981" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>✅</Text>
              </View>
              <Text style={styles.insightValue}>
                {stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.insightLabel}>Taxa de Sucesso</Text>
            </View>

            {/* Card: Pendentes */}
            <View style={[styles.insightCard, { backgroundColor: "#f59e0b" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>⏳</Text>
              </View>
              <Text style={styles.insightValue}>{stats.pending}</Text>
              <Text style={styles.insightLabel}>Pendentes</Text>
            </View>
          </View>

          <View style={styles.insightsGrid}>
            {/* Card: Concluídas */}
            <View style={[styles.insightCard, { backgroundColor: "#3b82f6" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>🎯</Text>
              </View>
              <Text style={styles.insightValue}>{stats.completed}</Text>
              <Text style={styles.insightLabel}>Concluídas</Text>
            </View>

            {/* Card: Em Progresso */}
            <View style={[styles.insightCard, { backgroundColor: "#8b5cf6" }]}>
              <View style={styles.insightIconContainer}>
                <Text style={styles.insightIcon}>🚚</Text>
              </View>
              <Text style={styles.insightValue}>
                {stats.total - stats.completed - stats.pending}
              </Text>
              <Text style={styles.insightLabel}>Em Progresso</Text>
            </View>
          </View>
        </View>

        {/* Card de Performance */}
        {stats.total > 0 && (
          <View style={styles.section}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Text style={styles.performanceTitle}>📈 Performance</Text>
                <View
                  style={[
                    styles.performanceBadge,
                    {
                      backgroundColor:
                        stats.completed / stats.total >= 0.8
                          ? "#10b981"
                          : stats.completed / stats.total >= 0.5
                          ? "#f59e0b"
                          : "#ef4444",
                    },
                  ]}
                >
                  <Text style={styles.performanceBadgeText}>
                    {stats.completed / stats.total >= 0.8
                      ? "Excelente"
                      : stats.completed / stats.total >= 0.5
                      ? "Bom"
                      : "Precisa Melhorar"}
                  </Text>
                </View>
              </View>
              <View style={styles.performanceStats}>
                <View style={styles.performanceStatItem}>
                  <Text style={styles.performanceStatLabel}>
                    Total de Entregas
                  </Text>
                  <Text style={styles.performanceStatValue}>{stats.total}</Text>
                </View>
                <View style={styles.performanceStatItem}>
                  <Text style={styles.performanceStatLabel}>
                    Taxa de Conclusão
                  </Text>
                  <Text style={styles.performanceStatValue}>
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Filtro de dia */}
        <View style={styles.section}>
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <View>
                <Text style={styles.filterTitle}>🔍 Filtrar Entregas</Text>
                <Text style={styles.filterSubtitle}>
                  Selecione um dia específico
                </Text>
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
              placeholder="Todos os dias da semana"
            />
          </View>
        </View>

        {/* Lista de entregas */}
        <View style={styles.section}>
          <View style={styles.deliveriesHeaderCard}>
            <View style={styles.deliveriesHeaderContent}>
              <Text style={styles.deliveriesTitle}>
                📦{" "}
                {selectedDay
                  ? `Entregas de ${
                      dayOptions.find((opt) => opt.value === selectedDay)?.label
                    }`
                  : "Todas as Entregas"}
              </Text>
              <View style={styles.deliveriesCountBadge}>
                <Text style={styles.deliveriesCountText}>
                  {displayedDeliveries.length} de {deliveries.length}
                </Text>
              </View>
            </View>
            {deliveries.length > 0 && (
              <Text style={styles.deliveriesSubtext}>
                Mostrando{" "}
                {displayedDeliveries.length < deliveries.length
                  ? `primeiras ${displayedDeliveries.length}`
                  : "todas"}{" "}
                as entregas
              </Text>
            )}
          </View>

          {deliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>Nenhuma entrega encontrada</Text>
              <Text style={styles.emptySubtext}>
                {selectedDay
                  ? "Tente selecionar outro dia"
                  : "Não há dados disponíveis no momento"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={displayedDeliveries}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                console.log(
                  `📋 [Charts] Renderizando item ${index + 1}/${
                    displayedDeliveries.length
                  }: ${item.id}`
                )
                return <DeliveryCard item={item} />
              }}
              scrollEnabled={false}
              contentContainerStyle={styles.deliveriesList}
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={colors.buttons} />
                    <Text style={styles.loadingMoreText}>
                      Carregando mais...
                    </Text>
                  </View>
                ) : displayedDeliveries.length < deliveries.length ? (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreDeliveries}
                  >
                    <Text style={styles.loadMoreButtonText}>
                      Ver mais 4 entregas (
                      {deliveries.length - displayedDeliveries.length}{" "}
                      restantes)
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          )}
        </View>

        {/* Espaçamento no final */}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  clearButton: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    fontWeight: "500",
  },
  deliveriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deliveriesCount: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  deliveriesList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
  },
  bottomSpacer: {
    height: 100,
  },
  loadingMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingMoreText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
  },
  loadMoreButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 80,
  },
  loadMoreButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  // Novos estilos para UI melhorada
  highlightCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.buttons,
  },
  highlightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  highlightBadge: {
    backgroundColor: colors.buttons,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  highlightBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  highlightStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  highlightStatItem: {
    alignItems: "center",
    flex: 1,
  },
  highlightStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  highlightStatLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
  },
  highlightDivider: {
    width: 1,
    backgroundColor: colors.text,
    opacity: 0.1,
    marginHorizontal: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  highlightSubtext: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
    fontWeight: "500",
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  filterSubtitle: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 12,
  },
  clearFilterButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#dc2626",
  },
  deliveriesHeaderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveriesHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deliveriesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  deliveriesCountBadge: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deliveriesCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  deliveriesSubtext: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
  },
  // Insights Cards
  insightsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  insightIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 32,
  },
  insightValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  insightLabel: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.9,
  },
  // Performance Card
  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  performanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#f3f4f6",
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  performanceBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  performanceBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  performanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  performanceStatItem: {
    alignItems: "center",
    flex: 1,
  },
  performanceStatLabel: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 8,
    textAlign: "center",
  },
  performanceStatValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
})
