import * as Location from "expo-location"
import { useRouter } from "expo-router"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Dimensions,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import DeliveryCompletionCapture from "../components/DeliveryCompletionCapture"
import { Header } from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { getElevation } from "../theme/elevations"
import { getFlatListProps } from "../theme/androidOptimizations"
import { ApiOrder } from "../types/order"
import { ERROR_MESSAGES, FLATLIST_CONFIG } from "../utils/constants"
import { logger } from "../utils/logger"

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallScreen = SCREEN_HEIGHT < 700

// ✅ OTIMIZAÇÃO 1: Constantes movidas para fora do componente
const STATUS_COLORS = {
  PENDING: "#f59e0b",
  IN_TRANSIT: "#3b82f6",
  IN_PROGRESS: "#3b82f6",
  DELIVERED: "#10b981",
} as const

const STATUS_TEXT = {
  PENDING: "Pendente",
  IN_TRANSIT: "A Caminho",
  IN_PROGRESS: "Em Andamento",
  DELIVERED: "Entregue",
} as const

// ✅ OTIMIZAÇÃO 2: Helper functions fora do componente
const getStatusColor = (status: string): string => {
  return (
    STATUS_COLORS[status?.toUpperCase() as keyof typeof STATUS_COLORS] ||
    colors.text
  )
}

const getStatusText = (status: string): string => {
  return (
    STATUS_TEXT[status?.toUpperCase() as keyof typeof STATUS_TEXT] || status
  )
}

const formatAddress = (delivery: ApiOrder): string => {
  if (!delivery.ClientAddress)
    return delivery.andress || "Endereço não disponível"

  const address = Array.isArray(delivery.ClientAddress)
    ? delivery.ClientAddress[0]
    : delivery.ClientAddress

  if (!address) return delivery.andress || "Endereço não disponível"

  return `${address.street}, ${address.number} - ${address.city}/${address.state}`
}

export default function Delivery() {
  const { token } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showCaptureScreen, setShowCaptureScreen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)

  // ✅ OTIMIZAÇÃO 3: Usar useRef para evitar re-criação de função
  const isFirstRender = useRef(true)

  // ✅ OTIMIZAÇÃO 4: Memoizar cálculos pesados
  const { activeDelivery, availableDeliveries, stats } = useMemo(() => {
    const active = orders.find((order) => {
      const s = order.status?.toUpperCase()
      return s === "IN_TRANSIT" || s === "IN_PROGRESS"
    })

    const available = orders.filter(
      (order) => order.status?.toUpperCase() === "PENDING"
    )

    const delivered = orders.filter(
      (order) => order.status?.toUpperCase() === "DELIVERED"
    ).length

    return {
      activeDelivery: active,
      availableDeliveries: available,
      stats: {
        total: orders.length,
        pending: available.length,
        delivered,
      },
    }
  }, [orders])

  // ✅ OTIMIZAÇÃO 5: useCallback com dependências corretas
  const getAllDeliverys = useCallback(async () => {
    if (!token) return

    try {
      setRefreshing(true)
      logger.info("Buscando entregas", { context: "Delivery" })

      const response = await api.get("/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setOrders(response.data.data)
      if (response.data.data?.length > 0) {
        logger.info("Primeira entrega carregada (Debug):", {
          context: "Delivery",
          data: response.data.data[0],
        })
      }
      logger.info("Entregas carregadas com sucesso", {
        context: "Delivery",
        data: { count: response.data.data?.length },
      })
    } catch (error: any) {
      logger.error("Erro ao buscar entregas", error, { context: "Delivery" })

      // Tratamento específico para erro 404
      if (error?.response?.status === 404) {
        Toast.show({
          type: "info",
          text1: "Nenhuma entrega disponível",
          text2: "Não há entregas cadastradas no momento",
          visibilityTime: 4000,
        })
        // Mantém lista vazia - app continua funcionando
        setOrders([])
      } else {
        // Outros erros
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: ERROR_MESSAGES.FETCH_DELIVERIES,
        })
      }
    } finally {
      setRefreshing(false)
    }
  }, [token])

  // ✅ OTIMIZAÇÃO 6: Carregar dados apenas uma vez
  useEffect(() => {
    if (!token) {
      router.replace("/(auth)/Signin")
      return
    }

    if (isFirstRender.current) {
      getAllDeliverys()
      isFirstRender.current = false
    }
  }, [token, router, getAllDeliverys])

  // WebSocket removido: mantemos apenas chamadas de API

  // ✅ OTIMIZAÇÃO 8: Location tracking otimizado
  // Rastreamento de localização removido (sem WebSocket)

  // ✅ OTIMIZAÇÃO 9: Callbacks memoizados
  const handleRefresh = useCallback(() => {
    getAllDeliverys()
  }, [getAllDeliverys])

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

  // Aceitar entrega (mudar de PENDING para IN_PROGRESS)
  const handleAcceptDelivery = useCallback(
    async (order: ApiOrder) => {
      if (!token) return

      try {
        logger.info("Aceitando entrega", {
          context: "Delivery",
          data: {
            id: order.id,
            code: order.code,
            status: order.status,
          },
        })

        const payload = {
          status: "in_progress",
        }

        await api.patch(`/delivery/${order.id}/status`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        Toast.show({
          type: "success",
          text1: "Entrega Aceita!",
          text2: `Você agora está em rota para ${order.code}`,
        })

        logger.info("Entrega aceita com sucesso", {
          context: "Delivery",
          data: { id: order.id, code: order.code },
        })

        // Atualiza estado local imediatamente para feedback instantâneo
        setOrders((currentOrders) =>
          currentOrders.map((o) =>
            o.id === order.id ? { ...o, status: "IN_PROGRESS" } : o
          )
        )

        // Recarregar em background para garantir sincronia
        getAllDeliverys()
      } catch (error: any) {
        logger.error("Erro ao aceitar entrega", error, {
          context: "Delivery",
          data: {
            id: order.id,
            code: order.code,
            status: error?.response?.status,
            message: error?.response?.data?.message,
          },
        })

        Toast.show({
          type: "error",
          text1: "Erro ao Aceitar",
          text2:
            error?.response?.data?.message ||
            "Não foi possível aceitar a entrega. Tente novamente.",
        })
      }
    },
    [token, getAllDeliverys]
  )

  // Abrir modal de confirmação
  const openCompleteModal = useCallback((order: ApiOrder) => {
    setSelectedOrder(order)
    setShowCompleteModal(true)
  }, [])

  // Fechar modal
  const closeCompleteModal = useCallback(() => {
    setShowCompleteModal(false)
    setSelectedOrder(null)
  }, [])

  // Abrir tela de captura de foto
  const handleConfirmCompletion = useCallback(() => {
    setShowCompleteModal(false)
    setShowCaptureScreen(true)
  }, [])

  // Cancelar captura e voltar
  const handleCancelCapture = useCallback(() => {
    setShowCaptureScreen(false)
    setSelectedOrder(null)
  }, [])

  // ✅ OTIMIZAÇÃO 10: Corrigir endpoint e payload
  const handleCompleteDelivery = useCallback(
    async (captureData: {
      photo: string
      customerName: string
      trackingCode: string
    }) => {
      if (!token || !selectedOrder) return

      try {
        setIsCompleting(true)
        logger.info("Finalizando entrega", {
          context: "Delivery",
          data: {
            id: selectedOrder.id,
            code: selectedOrder.code,
            status: selectedOrder.status,
          },
        })

        let latitude = null
        let longitude = null

        try {
          const { status } = await Location.requestForegroundPermissionsAsync()

          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            })

            latitude = location.coords.latitude
            longitude = location.coords.longitude

            logger.info("Localização capturada", {
              context: "Delivery",
              data: { latitude, longitude },
            })
          }
        } catch (locationError) {
          logger.error("Erro ao obter localização", locationError, {
            context: "Delivery",
          })
        }

        // Payload correto para o backend com dados de captura
        const payload = {
          status: "completed",
          latitude,
          longitude,
          notes: `Entrega finalizada - Recebido por: ${captureData.customerName}`,
          photo: captureData.photo,
          customerName: captureData.customerName,
          trackingCode: captureData.trackingCode,
        }

        logger.info("Enviando requisição", {
          context: "Delivery",
          data: {
            endpoint: `/delivery/${selectedOrder.id}/status`,
            payload: { ...payload, photo: "[base64]" }, // Não logar a foto completa
            hasToken: !!token,
          },
        })

        const response = await api.patch(
          `/delivery/${selectedOrder.id}/status`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        logger.info("Resposta recebida", {
          context: "Delivery",
          data: response.data,
        })

        // Fechar tela de captura
        setShowCaptureScreen(false)
        setSelectedOrder(null)

        Toast.show({
          type: "success",
          text1: "Entrega Finalizada!",
          text2: `Entrega ${selectedOrder.code} concluída com sucesso`,
        })

        logger.info("Entrega finalizada com sucesso", {
          context: "Delivery",
          data: { id: selectedOrder.id, code: selectedOrder.code },
        })

        // Atualiza estado local imediatamente
        setOrders((currentOrders) =>
          currentOrders.map((o) =>
            o.id === selectedOrder.id ? { ...o, status: "DELIVERED" } : o
          )
        )

        // Recarregar em background
        getAllDeliverys()
      } catch (error: any) {
        // Log detalhado do erro
        logger.error("Erro ao finalizar entrega", error, {
          context: "Delivery",
          data: {
            id: selectedOrder.id,
            code: selectedOrder.code,
            status: error?.response?.status,
            message: error?.response?.data?.message,
            fullError: error?.response?.data,
          },
        })

        // Exibe o erro completo no console para debug
        console.error("❌ Erro completo:", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        })

        // Tratamento específico para erro 403
        const errorMessage =
          error?.response?.status === 403
            ? error?.response?.data?.message ||
            "Esta entrega não está atribuída a você."
            : error?.response?.data?.message ||
            "Não foi possível concluir a entrega. Tente novamente."

        Toast.show({
          type: "error",
          text1: "Erro ao Finalizar",
          text2: errorMessage,
        })
      } finally {
        setIsCompleting(false)
      }
    },
    [token, selectedOrder, getAllDeliverys]
  )

  const keyExtractor = useCallback((item: ApiOrder) => item.code, [])

  // ✅ OTIMIZAÇÃO 11: Renderizar item de entrega
  const renderDeliveryItem = useCallback(
    ({ item }: { item: ApiOrder }) => (
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <Text style={styles.deliveryCode}>{item.code}</Text>
          <View
            style={[
              styles.deliveryStatusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.deliveryStatusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Cliente:</Text>
          <Text style={styles.deliveryValue}>
            {item.Company?.name || "N/A"}
          </Text>
        </View>

        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryLabel}>Endereço:</Text>
          <Text style={styles.deliveryValue} numberOfLines={2}>
            {formatAddress(item)}
          </Text>
        </View>

        {/* Botão Aceitar Entrega */}
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptDelivery(item)}
        >
          <Text style={styles.acceptButtonText}>Aceitar Entrega</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleAcceptDelivery]
  )

  // ✅ OTIMIZAÇÃO 12: Memoizar address para evitar cálculos repetidos
  const activeDeliveryAddress = useMemo(
    () => (activeDelivery ? formatAddress(activeDelivery) : ""),
    [activeDelivery]
  )

  // Se há entrega em andamento
  if (activeDelivery) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Entrega em Andamento" onNotificationPress={() => { }} />

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
              <Text style={styles.activeDeliveryTitle}>🚚 Entrega Atual</Text>
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
                  {activeDeliveryAddress}
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
                onPress={() => openCompleteModal(activeDelivery)}
              >
                <Text style={styles.actionButtonIcon}>✓</Text>
                <Text style={styles.actionButtonText}>Concluir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
                onPress={() => handleOpenMaps(activeDeliveryAddress)}
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

          {/* Lista de Entregas Bloqueadas */}
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

        {/* Indicador de status */}
        <View style={[styles.statusIndicator, styles.statusIndicatorActive]}>
          <Text style={styles.statusIndicatorIcon}>🔴</Text>
          <Text style={styles.statusIndicatorText}>Em Rota</Text>
        </View>

        {/* Modal de Confirmação de Conclusão */}
        <Modal
          visible={showCompleteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeCompleteModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmar Conclusão</Text>
              <Text style={styles.modalText}>
                Deseja realmente concluir a entrega{" "}
                <Text style={styles.modalTextBold}>{selectedOrder?.code}</Text>?
              </Text>
              <Text style={styles.modalSubtext}>
                Esta ação não poderá ser desfeita.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={closeCompleteModal}
                  disabled={isCompleting}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleConfirmCompletion}
                  disabled={isCompleting}
                >
                  <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Tela de Captura de Foto */}
        {showCaptureScreen && selectedOrder && (
          <Modal
            visible={showCaptureScreen}
            animationType="slide"
            onRequestClose={handleCancelCapture}
          >
            <DeliveryCompletionCapture
              deliveryCode={selectedOrder.code}
              onComplete={handleCompleteDelivery}
              onCancel={handleCancelCapture}
            />
          </Modal>
        )}
      </SafeAreaView>
    )
  }

  // Tela normal
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Entregas" />

      <View style={styles.content}>
        {/* Header com Estatísticas - Usando stats memoizado */}
        <View style={styles.statsHeader}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Disponíveis</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#10b981" }]}>
              {stats.delivered}
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
              {...getFlatListProps()}
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

      {/* Indicador de status */}
      <View style={styles.statusIndicator}>
        <Text style={styles.statusIndicatorIcon}>🟢</Text>
        <Text style={styles.statusIndicatorText}>Disponível</Text>
      </View>
    </SafeAreaView>
  )
}

// Styles (mesmos do arquivo original)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  statsHeader: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 24,
    ...getElevation('card'),
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
  activeDeliveryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    borderLeftWidth: 6,
    borderLeftColor: "#3b82f6",
    ...getElevation('elevated'),
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
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    ...getElevation('card'),
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
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderLeftWidth: 6,
    borderLeftColor: "#f59e0b",
    ...getElevation('surface'),
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
  statusIndicator: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    ...getElevation('fab'),
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
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isSmallScreen ? 10 : 12,
    paddingBottom: isSmallScreen ? 10 : 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  deliveryCode: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "bold",
    color: colors.text,
  },
  deliveryStatusBadge: {
    paddingHorizontal: isSmallScreen ? 8 : 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deliveryStatusText: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: "600",
    color: "#fff",
    textTransform: "uppercase",
  },
  deliveryInfo: {
    marginBottom: isSmallScreen ? 6 : 8,
  },
  deliveryLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: colors.text,
    opacity: 0.6,
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: isSmallScreen ? 13 : 14,
    color: colors.text,
    fontWeight: "500",
  },
  acceptButton: {
    backgroundColor: colors.buttons,
    borderRadius: isSmallScreen ? 10 : 12,
    padding: isSmallScreen ? 12 : 14,
    alignItems: "center",
    marginTop: isSmallScreen ? 10 : 12,
  },
  acceptButtonText: {
    fontSize: isSmallScreen ? 13 : 15,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: isSmallScreen ? 20 : 24,
    borderTopRightRadius: isSmallScreen ? 20 : 24,
    padding: isSmallScreen ? 16 : 24,
    paddingBottom: isSmallScreen ? 32 : 40,
  },
  modalTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: isSmallScreen ? 12 : 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: colors.text,
    marginBottom: isSmallScreen ? 6 : 8,
    textAlign: "center",
    lineHeight: isSmallScreen ? 20 : 24,
  },
  modalTextBold: {
    fontWeight: "bold",
    color: colors.buttons,
  },
  modalSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: colors.text,
    opacity: 0.6,
    marginBottom: isSmallScreen ? 20 : 24,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: isSmallScreen ? 10 : 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: isSmallScreen ? 10 : 12,
    padding: isSmallScreen ? 14 : 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: isSmallScreen ? 48 : 52,
  },
  modalButtonCancel: {
    backgroundColor: "#f3f4f6",
  },
  modalButtonConfirm: {
    backgroundColor: "#10b981",
  },
  modalButtonTextCancel: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "700",
    color: colors.text,
  },
  modalButtonTextConfirm: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "700",
    color: "#fff",
  },
})
