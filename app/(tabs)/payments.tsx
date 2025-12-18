import React, { useCallback, useMemo, useState } from "react"
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native"

import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { logger } from "../utils/logger"
import { getFlatListProps } from "../theme/androidOptimizations"
import { getElevation } from "../theme/elevations"

import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ConfirmationModal from "../components/ConfirmationModal"
import { Header } from "../components/Header"
import ListItemPayments from "../components/ListItemPayments"
import LoadingWithdraw from "./LoadingWithdraw"
import LoadingWithdrawSuccess from "./LoadingWithdrawSuccess"

// Endpoints fallback types
// type ApiOrder = {
//   id: string
//   code: string
//   status: string
//   value: number
//   price?: number | string // Handle inconsistency
//   createdAt: string
//   updatedAt: string
//   description?: string
//   completedAt?: string
// }

type BackendTransaction = {
  id: string
  type: "earning" | "withdrawal"
  amount: number
  description: string
  status: string
  createdAt: string
  pixKey?: string
}

type DeliveryStats = {
  currentBalance: number
  totalEarned: number
  totalWithdrawn: number
  pendingBalance: number
  transactions: BackendTransaction[]
}

type MappedTransaction = {
  id: string
  tipo: "entrada" | "saida"
  valor: number
  descricao: string
  data: string
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
  const [transactions, setTransactions] = useState<MappedTransaction[]>([])

  const fetchFinancialData = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: balanceData } = await api.get<DeliveryStats>(
        `/deliveryman/${user.id}/balance`
      )

      setBalance(balanceData.currentBalance)
      setTransactions(
        balanceData.transactions.map((item) => ({
          id: item.id,
          tipo: item.type === "earning" ? "entrada" : "saida",
          valor: item.amount,
          descricao: item.description,
          data: item.createdAt,
        }))
      )

      logger.info("Dados financeiros carregados", {
        context: "Payments",
      })
    } catch (error: any) {
      logger.error("Erro ao carregar dados financeiros", error, {
        context: "Payments",
      })
    } finally {
      setIsFetching(false)
    }
  }, [user?.id])

  useFocusEffect(
    useCallback(() => {
      fetchFinancialData()
    }, [fetchFinancialData])
  )

  const handleConfirmPayment = useCallback(async () => {
    setWithdrawValue(formattedBalance)
    setIsLoading(true)

    try {
      const amount = balance

      if (!amount || amount <= 0) {
        logger.warn("Tentativa de saque com valor inválido", {
          data: { amount },
        })
        setIsLoading(false)
        return
      }

      // The check `if (amount > available)` is now redundant as `amount` is `balance`
      // and `available` is also derived from `balance`.
      // If the backend handles insufficient balance, this client-side check can be simplified or removed.

      await api.post(`/deliveryman/${user?.id}/withdraw`, {
        amount,
        email: user?.email,
      })

      // --- Lógica para notificar o admin (requer implementação no backend) ---
      // Após um saque bem-sucedido, você pode fazer uma nova chamada à API
      // para um endpoint que notifique o administrador.
      // Exemplo (descomente e adapte quando o endpoint estiver pronto):
      /*
      try {
        await api.post('/admin/notify-withdrawal', {
          userId: user?.id,
          amount: amount,
          // Inclua outros detalhes relevantes para o admin
        });
        logger.info("Admin notificado sobre o saque", { context: "Payments" });
      } catch (notificationError) {
        logger.error("Falha ao notificar o admin sobre o saque", notificationError, { context: "Payments" });
      }
      */
      // ---------------------------------------------------------------------

      setIsLoading(false)
      setShowSuccess(true)
      fetchFinancialData()
    } catch (error: any) {
      logger.error("Erro ao realizar saque", error, { context: "Payments" })

      const message =
        error.response?.data?.message || "Não foi possível realizar o saque."
      // If message is array (class-validator), join it
      const displayMessage = Array.isArray(message)
        ? message.join("\n")
        : message

      Alert.alert("Erro", displayMessage)
      setIsLoading(false)
    }
  }, [fetchFinancialData, user, balance])

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

  const renderPaymentItem = useCallback(
    ({ item }: any) => (
      <ListItemPayments
        item={{
          id: item.id,
          type: item.tipo as "entrada" | "saida",
          value: item.valor,
          description: item.descricao,
          date: item.data,
        }}
      />
    ),
    []
  )

  const keyExtractor = useCallback((item: any) => item.id, [])

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, [])

  const ListEmpty = useCallback(
    () => (
      <Text style={styles.emptyText}>
        {isFetching ? "Carregando..." : "Nenhuma transação encontrada."}
      </Text>
    ),
    [isFetching]
  )

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

  const formattedBalance = `R$ ${balance.toFixed(2).replace(".", ",")}`

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
            <MaterialIcons
              name="arrow-circle-down"
              size={18}
              color={colors.primary}
            />
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
              {...getFlatListProps()}
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
                handleConfirmPayment()
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
    marginHorizontal: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 6,
    borderLeftColor: colors.active,
    ...getElevation('elevated'),
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.3,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.active,
    marginVertical: 16,
    letterSpacing: -1,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.active,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 28,
    minWidth: 180,
    ...getElevation('elevated'),
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
    paddingVertical: 18,
    borderRadius: 20,
    ...getElevation('card'),
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
    paddingVertical: 18,
    borderRadius: 20,
    ...getElevation('card'),
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    ...getElevation('card'),
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
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
