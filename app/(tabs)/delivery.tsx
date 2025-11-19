import { useRouter } from "expo-router"
import React, { useEffect, useState, useCallback, useMemo } from "react"
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Linking,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import * as Location from "expo-location"
import { DeliveryItem } from "../components/DeliveryItem"
import { Header } from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { ApiOrder } from "../types/order"
import { logger } from "../utils/logger"
import { ERROR_MESSAGES, FLATLIST_CONFIG } from "../utils/constants"

export default function Delivery() {
  const { token } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "IN_PROGRESS">("ALL")

  // Detectar se há entrega em andamento
  const activeDelivery = useMemo(() => {
    return orders.find(
      (order) =>
        order.status === "IN_TRANSIT" || order.status === "IN_PROGRESS"
    )
  }, [orders])

  // Entregas disponíveis (excluindo a em andamento)
  const availableDeliveries = useMemo(() => {
    if (filterStatus === "ALL") {
      return orders.filter((order) => order.status === "PENDING")
    }
    return orders.filter((order) => order.status === filterStatus)
  }, [orders, filterStatus])

  // Indicador de status automático baseado na API
  const hasActiveDelivery = useMemo(() => {
    return orders.some(
      (order) =>
        order.status === "IN_TRANSIT" || order.status === "IN_PROGRESS"
    )
  }, [orders])

  const hasPendingDeliveries = useMemo(() => {
    return orders.some((order) => order.status === "PENDING")
  }, [orders])

  const getAllDeliverys = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      logger.info("Buscando entregas", { context: "Delivery" })

      const response = await api.get("/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setOrders(response.data.data)
      logger.info("Entregas carregadas com sucesso", {
        context: "Delivery",
        data: { count: response.data.data?.length },
      })
    } catch (error) {
      logger.error("Erro ao buscar entregas", error, { context: "Delivery" })

      Toast.show({
        type: "error",
        text1: "Erro",
        text2: ERROR_MESSAGES.FETCH_DELIVERIES,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/Signin")
      return
    }
    getAllDeliverys()
  }, [token, getAllDeliverys, router])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    getAllDeliverys()
  }, [getAllDeliverys])

  const handleOpenDetails = useCallback(
    (order: ApiOrder) => {
      router.push({
        pathname: "/deliveryDetails",
        params: { code: order.code },
      })
    },
    [router]
  )

  const handleCallCustomer = useCallback((phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`)
    }
  }, [])

  const handleOpenMaps = useCallback((address: string) => {
    if (address) {
      const encodedAddress = encodeURIComponent(address)
      Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`)
    }
  }, [])

  const handleCompleteDelivery = useCallback(
    async (order: ApiOrder) => {
      if (!token) return

      try {
        logger.info("Finalizando entrega", {
          context: "Delivery",
          data: { code: order.code },
        })

        // Obter localização atual do entregador
        let latitude = null
        let longitude = null

        try {
          // Solicitar permissão de localização
          const { status } = await Location.requestForegroundPermissionsAsync()

          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            })

            latitude = location.coords.latitude
            longitude = location.coords.longitude

            // Log no terminal
            console.log("\n=== 📍 LOCALIZAÇÃO DO ENTREGADOR ===")
            console.log(`📦 Código da Entrega: ${order.code}`)
            console.log(`🌍 Latitude: ${latitude}`)
            console.log(`🌍 Longitude: ${longitude}`)
            console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
            console.log("=====================================\n")

            logger.info("Localização do entregador capturada", {
              context: "Delivery",
              data: {
                code: order.code,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
              },
            })
          } else {
            console.warn("⚠️ Permissão de localização não concedida")
            logger.warn("Permissão de localização negada", {
              context: "Delivery",
            })
          }
        } catch (locationError) {
          console.error("❌ Erro ao obter localização:", locationError)
          logger.error("Erro ao obter localização", locationError, {
            context: "Delivery",
          })
        }

        // Chamada à API para finalizar a entrega com localização
        const payload = {
          status: "DELIVERED",
          latitude,
          longitude,
          completedAt: new Date().toISOString(),
        }

        console.log("\n=== 📤 ENVIANDO PARA BACKEND ===")
        console.log("Payload:", JSON.stringify(payload, null, 2))
        console.log("================================\n")

        await api.put(
          `/delivery/${order.code}/complete`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        Toast.show({
          type: "success",
          text1: "Entrega Finalizada!",
          text2: `Entrega ${order.code} concluída com sucesso`,
        })

        logger.info("Entrega finalizada com sucesso", {
          context: "Delivery",
          data: { code: order.code, latitude, longitude },
        })

        // Recarregar lista de entregas
        await getAllDeliverys()
      } catch (error) {
        logger.error("Erro ao finalizar entrega", error, {
          context: "Delivery",
          data: { code: order.code },
        })

        Toast.show({
          type: "error",
          text1: "Erro ao Finalizar",
          text2: "Não foi possível concluir a entrega. Tente novamente.",
        })
      }
    },
    [token, getAllDeliverys]
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#f59e0b"
      case "IN_TRANSIT":
      case "IN_PROGRESS":
        return "#3b82f6"
      case "DELIVERED":
        return "#10b981"
      default:
        return colors.text
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente"
      case "IN_TRANSIT":
        return "A Caminho"
      case "IN_PROGRESS":
        return "Em Andamento"
      case "DELIVERED":
        return "Entregue"
      default:
        return status
    }
  }

  const renderDeliveryItem = useCallback(
    ({ item }: { item: ApiOrder }) => (
      <DeliveryItem item={item} onPress={handleOpenDetails} />
    ),
    [handleOpenDetails]
  )

  const keyExtractor = useCallback((item: ApiOrder) => item.code, [])

  // Se há entrega em andamento, mostrar tela especial
  if (activeDelivery) {
    const address = activeDelivery.ClientAddress
      ? Array.isArray(activeDelivery.ClientAddress)
        ? `${activeDelivery.ClientAddress[0]?.street}, ${activeDelivery.ClientAddress[0]?.number} - ${activeDelivery.ClientAddress[0]?.city}/${activeDelivery.ClientAddress[0]?.state}`
        : `${activeDelivery.ClientAddress.street}, ${activeDelivery.ClientAddress.number} - ${activeDelivery.ClientAddress.city}/${activeDelivery.ClientAddress.state}`
      : activeDelivery.andress

    return (
      <SafeAreaView style={styles.container}>
        <Header title="Entrega em Andamento" />

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
          {/* Card de Entrega Ativa */}
          <View style={styles.activeDeliveryCard}>
            <View style={styles.activeDeliveryHeader}>
              <Text style={styles.activeDeliveryTitle}>
                🚚 Entrega Atual
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(activeDelivery.status) },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {getStatusText(activeDelivery.status)}
                </Text>
              </View>
            </View>

            <View style={styles.orderCodeContainer}>
              <Text style={styles.orderCodeLabel}>Código:</Text>
              <Text style={styles.orderCodeValue}>{activeDelivery.code}</Text>
            </View>

            {/* Informações do Cliente */}
            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>📋 Informações</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente:</Text>
                <Text style={styles.infoValue}>
                  {activeDelivery.Company?.name || "N/A"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Telefone:</Text>
                <Text style={styles.infoValue}>
                  {activeDelivery.phone || activeDelivery.telefone}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Endereço:</Text>
                <Text style={[styles.infoValue, styles.addressText]}>
                  {address}
                </Text>
              </View>
              {activeDelivery.information && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Obs:</Text>
                  <Text style={styles.infoValue}>
                    {activeDelivery.information}
                  </Text>
                </View>
              )}
            </View>

            {/* Botões de Ação */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10b981" }]}
                onPress={() => handleCompleteDelivery(activeDelivery)}
              >
                <Text style={styles.actionButtonIcon}>✓</Text>
                <Text style={styles.actionButtonText}>Concluir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
                onPress={() => handleOpenMaps(address)}
              >
                <Text style={styles.actionButtonIcon}>📍</Text>
                <Text style={styles.actionButtonText}>Navegar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
                onPress={() =>
                  handleCallCustomer(
                    activeDelivery.phone || activeDelivery.telefone
                  )
                }
              >
                <Text style={styles.actionButtonIcon}>📞</Text>
                <Text style={styles.actionButtonText}>Ligar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
                onPress={() =>
                  Toast.show({
                    type: "info",
                    text1: "Suporte",
                    text2: "Entre em contato: (11) 9999-9999",
                  })
                }
              >
                <Text style={styles.actionButtonIcon}>🆘</Text>
                <Text style={styles.actionButtonText}>Ajuda</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Aviso de Bloqueio */}
          <View style={styles.blockNotice}>
            <Text style={styles.blockNoticeIcon}>🔒</Text>
            <Text style={styles.blockNoticeTitle}>
              Outras entregas bloqueadas
            </Text>
            <Text style={styles.blockNoticeText}>
              Conclua a entrega atual para aceitar novas entregas
            </Text>
          </View>

          {/* Lista de Entregas Bloqueadas (visualização apenas) */}
          {availableDeliveries.length > 0 && (
            <View style={styles.blockedSection}>
              <Text style={styles.blockedSectionTitle}>
                🕒 Próximas Entregas ({availableDeliveries.length})
              </Text>
              {availableDeliveries.slice(0, 3).map((order) => (
                <View key={order.code} style={styles.blockedOrderCard}>
                  <View style={styles.blockedOrderHeader}>
                    <Text style={styles.blockedOrderCode}>{order.code}</Text>
                    <View style={styles.blockedBadge}>
                      <Text style={styles.blockedBadgeText}>Bloqueada</Text>
                    </View>
                  </View>
                  <Text style={styles.blockedOrderClient}>
                    {order.Company?.name || "Cliente"}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Indicador de status automático */}
        <View
          style={[
            styles.statusIndicator,
            hasActiveDelivery && styles.statusIndicatorActive,
          ]}
        >
          <Text style={styles.statusIndicatorIcon}>
            {hasActiveDelivery ? "🔴" : "🟢"}
          </Text>
          <Text style={styles.statusIndicatorText}>
            {hasActiveDelivery ? "Em Rota" : "Disponível"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  // Tela normal quando não há entrega em andamento
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Entregas" />

      <View style={styles.content}>
        {/* Header com Estatísticas */}
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>
              {orders.filter((o) => o.status === "PENDING").length}
            </Text>
            <Text style={styles.statLabel}>Disponíveis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#10b981" }]}>
              {orders.filter((o) => o.status === "DELIVERED").length}
            </Text>
            <Text style={styles.statLabel}>Concluídas</Text>
          </View>
        </View>

        {/* Lista de Entregas */}
        <View style={styles.listContainer}>
          {availableDeliveries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Nenhuma entrega disponível</Text>
              <Text style={styles.emptyText}>
                No momento não há entregas pendentes para você
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableDeliveries}
              keyExtractor={keyExtractor}
              renderItem={renderDeliveryItem}
              contentContainerStyle={styles.listContent}
              removeClippedSubviews={true}
              maxToRenderPerBatch={FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
              updateCellsBatchingPeriod={
                FLATLIST_CONFIG.UPDATE_CELLS_BATCHING_PERIOD
              }
              windowSize={FLATLIST_CONFIG.WINDOW_SIZE}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.buttons]}
                  tintColor={colors.buttons}
                />
              }
            />
          )}
        </View>
      </View>

      {/* Indicador de status automático */}
      <View
        style={[
          styles.statusIndicator,
          hasActiveDelivery && styles.statusIndicatorActive,
        ]}
      >
        <Text style={styles.statusIndicatorIcon}>
          {hasActiveDelivery ? "🔴" : "🟢"}
        </Text>
        <Text style={styles.statusIndicatorText}>
          {hasActiveDelivery ? "Em Rota" : "Disponível"}
        </Text>
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
  },
  // Estatísticas Header
  statsHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.text,
    opacity: 0.1,
    marginHorizontal: 12,
  },
  // Active Delivery Card
  activeDeliveryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
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
    borderLeftWidth: 6,
    borderLeftColor: "#3b82f6",
  },
  activeDeliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#f3f4f6",
  },
  activeDeliveryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  orderCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  orderCodeLabel: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    marginRight: 8,
  },
  orderCodeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },
  addressText: {
    lineHeight: 22,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  blockNotice: {
    backgroundColor: "#fef3c7",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  blockNoticeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  blockNoticeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 8,
  },
  blockNoticeText: {
    fontSize: 14,
    color: "#92400e",
    textAlign: "center",
    opacity: 0.8,
  },
  blockedSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 80,
  },
  blockedSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  blockedOrderCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    opacity: 0.6,
  },
  blockedOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  blockedOrderCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  blockedBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  blockedBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  blockedOrderClient: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.7,
  },
  // Lista Normal
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
  },
  // Indicador de status automático
  statusIndicator: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  statusIndicatorActive: {
    backgroundColor: "#ef4444",
  },
  statusIndicatorIcon: {
    fontSize: 20,
  },
  statusIndicatorText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
})
