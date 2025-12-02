import React, { useCallback, useMemo, useState } from "react"
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { colors } from "../theme"

import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import ConfirmationModal from "../components/ConfirmationModal"
import { Header } from "../components/Header"
import ListItemPayments from "../components/ListItemPayments"
import { cashFlowData } from "../mocks/paymentsData"
import LoadingWithdraw from "./LoadingWithdraw"
import LoadingWithdrawSuccess from "./LoadingWithdrawSuccess"

export default function Payments() {
  const { user } = useAuth()
  const routes = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [withdrawValue, setWithdrawValue] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "entrada" | "saida"
  >("all")
  const insets = useSafeAreaInsets()
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false)
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState(cashFlowData)

  const handleConfirmPayment = useCallback((paymentData: any) => {
    // Salva o valor do saque
    setWithdrawValue(paymentData?.value || "R$ 0,00")

    // Mostra loading de processamento
    setIsLoading(true)

    // Simulação de processamento (remover na implementação real)
    setTimeout(() => {
      setIsLoading(false)

      // Limpar a lista de transações após o saque
      setTransactions([])

      // Mostra tela de sucesso
      setShowSuccess(true)

      // Aqui você pode adicionar a chamada à API ou outra lógica necessária
    }, 2000)
  }, [])

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
    <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
  ), [])

  // Mostra loading de processamento
  if (isLoading) {
    return <LoadingWithdraw />
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return (
      <LoadingWithdrawSuccess
        value={withdrawValue}
        onFinish={handleSuccessFinish}
      />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Minha Carteira"
        onNotificationPress={() => routes.push("/settings/notifications")}
      />
      <View style={styles.content}>
        {/* Card de saldo aprimorado */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <MaterialIcons
              name="account-balance-wallet"
              size={28}
              color={colors.active}
            />
            <Text style={styles.balanceTitle}>Saldo disponível</Text>
          </View>

          <Text style={styles.balanceValue}>R$ 1.000,00</Text>

          <Pressable
            style={({ pressed }) => [
              styles.withdrawButton,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              setData({ value: "R$ 1.000,00" } as any)
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

        {/* Lista de pagamentos */}
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

        {/* BOTÃO FLUTUANTE */}
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
              title="Confirmar Pagamento"
              message={`Deseja confirmar o pagamento de ${(data as unknown as { value: string })?.value || "R$ 0,00"
                }?`}
              onConfirm={() => {
                // Implementação da lógica de confirmação no componente pai
                handleConfirmPayment(data)
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

  /** --- CARD DE SALDO --- **/
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

  /** Botão sacar dentro do card */
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

  /** --- BOTÕES EXTERNOS --- **/
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

  /** --- LISTA DE PAGAMENTOS --- **/
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

  /** --- BOTÃO FLUTUANTE --- **/
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

  /** --- MODAL --- **/
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
})
