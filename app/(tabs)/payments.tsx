import React, { useCallback, useMemo, useState } from "react"
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { logger } from "../utils/logger"

import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ConfirmationModal from "../components/ConfirmationModal"
import { Header } from "../components/Header"
import ListItemPayments from "../components/ListItemPayments"
import LoadingWithdraw from "./LoadingWithdraw"
import LoadingWithdrawSuccess from "./LoadingWithdrawSuccess"

// Endpoints fallback types
type ApiOrder = {
  id: string
  code: string
  status: string
  value: number
  price?: number | string // Handle inconsistency
  createdAt: string
  updatedAt: string
  description?: string
  completedAt?: string
}

type DeliveryStats = {
  currentBalance: number
  totalEarnings: number
}

type Transaction = {
  id: string
  type: "earning" | "withdrawal" // We only have earnings from deliveries for now
  amount: number
  description: string
  status: string
  createdAt: string
}

export default function Payments() {
  const { user } = useAuth()
  const routes = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [withdrawValue, setWithdrawValue] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "entrada" | "saida"
  >("all")
  const insets = useSafeAreaInsets()
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false)

  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])

  const fetchFinancialData = useCallback(async () => {
    if (!user?.id) return

    try {
      // Usar Promise.all para buscar stats e entregas em paralelo
      // Endpoint de balance deu 404, então usamos stats + delivery
      const [statsRes, deliveryRes] = await Promise.all([
        api.get<DeliveryStats>(`/deliveryman/${user.id}/stats`),
        api.get<{ data: ApiOrder[] }>(`/delivery`, { params: { limit: 100 } })
      ])

      const stats = statsRes.data
      const deliveries = deliveryRes.data.data || []

      // 1. Set Balance
      // Se currentBalance não vier, usamos totalEarnings como fallback ou 0
      setBalance(stats.currentBalance || stats.totalEarnings || 0)

      // 2. Map Deliveries to Transactions
      // Filtrar apenas entregas concluídas ou entregues
      const completedDeliveries = deliveries.filter(d => {
        const s = d.status?.toLowerCase()
        return s === 'delivered' || s === 'completed'
      })

      const mappedTransactions = completedDeliveries.map(d => {
        // Normalizar valor (alguns endpoints retornam string price "R$ 10,00", outros value number)
        let val = d.value
        if (!val && d.price) {
          const clean = String(d.price).replace(/[R$\s]/g, "").replace(",", ".")
          val = parseFloat(clean)
        }
        val = val || 0

        return {
          id: d.id,
          tipo: 'entrada', // Assumindo entrada para entregas
          valor: val,
          // Descrição: Código do pedido ou descrição genérica
          descricao: `Entrega ${d.code || d.id.slice(0, 8)}`,
          data: d.completedAt || d.updatedAt || d.createdAt
        }
      })

      // Ordenar por data (mais recente primeiro)
      mappedTransactions.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

      setTransactions(mappedTransactions)
      logger.info("Dados financeiros carregados (Fallback)", { context: "Payments" })

    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn("Endpoints alternativos também falharam?", error)
      } else {
        logger.error("Erro ao carregar dados financeiros", error, { context: "Payments" })
      }
    } finally {
      setIsFetching(false)
    }
  }, [user?.id])

  useFocusEffect(
    useCallback(() => {
      fetchFinancialData()
    }, [fetchFinancialData])
  )

  const handleConfirmPayment = useCallback((paymentData: any) => {
    setWithdrawValue(paymentData?.value || "R$ 0,00")
    setIsLoading(true)

    // TODO: Implementar chamada real de saque quando backend estiver pronto
    setTimeout(() => {
      setIsLoading(false)
      setShowSuccess(true)
      fetchFinancialData() // Recarrega saldo (simulado)
    }, 2000)
  }, [fetchFinancialData])

  const handleSuccessFinish = useCallback(() => {
    setShowSuccess(false)
  }, [])

  const filteredCashFlowData = useMemo(() => {
    return transactions.filter((item) => {
      if (selectedFilter === "all") {
        return true
      }
      return item.tipo === selectedFilter
    })
  }, [transactions, selectedFilter])

  const renderPaymentItem = useCallback(({ item }: any) => (
    <ListItemPayments
      item={{
        id: item.id,
        type: item.tipo as "entrada" | "saida",
        value: item.valor,
        description: item.descricao,
        date: item.data,
      }}
    />
  ), [])

  const keyExtractor = useCallback((item: any) => item.id, [])

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, [])

  const ListEmpty = useCallback(() => (
    <Text style={styles.emptyText}>
      {isFetching ? "Carregando..." : "Nenhuma transação encontrada."}
    </Text>
  ), [isFetching])

  if (isLoading) {
    return <LoadingWithdraw />
  }

  if (showSuccess) {
    return (
      <LoadingWithdrawSuccess
        value={withdrawValue}
        onFinish={handleSuccessFinish}
      />
    )
  }

  const formattedBalance = `R$ ${balance.toFixed(2).replace('.', ',')}`

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Minha Carteira"
        onNotificationPress={() => routes.push("/settings/notifications")}
      />
      <View style={styles.content}>
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialIcons
              name="account-balance-wallet"
              size={28}
              color={colors.active}
            />
            <Text style={styles.balanceTitle}>Saldo disponível</Text>
          </View>

          <Text style={styles.balanceValue}>
            {isFetching && balance === 0 ? "..." : formattedBalance}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.withdrawButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              setIsConfirmationModalVisible(true)
            }}
          >
            <MaterialIcons name="arrow-circle-down" size={18} color={colors.primary} />
            <Text style={styles.withdrawText}>Sacar</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.actionGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.depositButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => setSelectedFilter("entrada")}
            >
              <MaterialIcons name="arrow-downward" size={20} color="#fff" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.transferButton,
                { opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => setSelectedFilter("saida")}
            >
              <MaterialIcons name="arrow-upward" size={20} color="#fff" />
            </Pressable>
          </View>
          <View>
            <Pressable
              onPress={() => setSelectedFilter("all")}
              style={[
                styles.filterButton,
                selectedFilter === "all" && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === "all" && styles.filterButtonTextActive,
                ]}
              >
                Mostrar Todas
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>Histórico de transações</Text>

          <View style={styles.listContainer}>
            <FlatList
              data={filteredCashFlowData}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={ItemSeparator}
              renderItem={renderPaymentItem}
              ListEmptyComponent={ListEmpty}
              removeClippedSubviews={true}
              maxToRenderPerBatch={8}
              updateCellsBatchingPeriod={50}
              windowSize={5}
            />
          </View>
        </View>

        <View
          style={[
            styles.floatingButtonContainer,
            { bottom: insets.bottom + 90 },
          ]}
        ></View>

        <Modal
          transparent
          animationType="fade"
          visible={isConfirmationModalVisible}
        >
          <View style={styles.overlay}>
            <ConfirmationModal
              title="Confirmar Saque"
              message={`Deseja transferir ${formattedBalance} para sua chave PIX?`}
              onConfirm={() => {
                handleConfirmPayment({ value: formattedBalance })
                setIsConfirmationModalVisible(false)
              }}
              onCancel={() => {
                setIsConfirmationModalVisible(false)
              }}
            />
          </View>
        </Modal>
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
    paddingHorizontal: 16,
  },
  withdrawText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  balanceCard: {
    marginTop: 20,
    backgroundColor: "rgba(0, 200, 179, 0.1)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 200, 179, 0.2)",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.active,
    marginBottom: 20,
    letterSpacing: 1,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.buttons,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    shadowColor: colors.buttons,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  depositButton: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#10b981",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  depositText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  transferButton: {
    width: "30%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  transferText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  filterButtonActive: {
    backgroundColor: colors.buttons,
    borderColor: colors.buttons,
  },
  filterButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  listWrapper: {
    marginTop: 28,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  listContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 12,
  },
  emptyText: {
    textAlign: "center",
    color: colors.text,
    fontSize: 15,
    marginTop: 20,
    opacity: 0.6,
    fontWeight: "500",
  },
  floatingButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
  },
  addButton: {
    backgroundColor: colors.buttons,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.buttons,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
})
