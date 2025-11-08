import React, { useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"

// import LottieView from "lottie-react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { colors } from "../theme"

import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import ConfirmationModal from "../components/ConfirmationModal"
import { Header } from "../components/Header"
import ListItemPayments from "../components/ListItemPayments"
import { cashFlowData } from "../mocks/paymentsData"

export default function Payments() {
  const { user } = useAuth()
  const routes = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "entrada" | "saida"
  >("all")
  const insets = useSafeAreaInsets()
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false)
  const [data, setData] = useState(null)
  const [transactions, setTransactions] = useState(cashFlowData)

  const handleConfirmPayment = (paymentData: any) => {
    // Implementação da lógica de confirmação de pagamento
    setIsLoading(true)

    // Simulação de processamento (remover na implementação real)
    setTimeout(() => {
      setIsLoading(false)

      // Limpar a lista de transações após o saque
      setTransactions([])

      // Exibindo o Toast somente após o loading terminar
      Toast.show({
        type: "success",
        text1: "Saque realizado com sucesso",
        text2: `Valor: ${paymentData?.value || "R$ 0,00"}`,
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
      })
      // Aqui você pode adicionar a chamada à API ou outra lógica necessária
    }, 1500)
  }

  const filteredCashFlowData = transactions.filter((item) => {
    if (selectedFilter === "all") {
      return true
    }
    return item.tipo === selectedFilter
  })

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          paddingHorizontal: 10,
        }}
      >
        <Header title="Minha Carteira" />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#f6f5fd",
          width: "100%",
          paddingHorizontal: 16,
        }}
      >
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
            <MaterialIcons name="arrow-circle-down" size={18} color="#fff" />
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
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <ListItemPayments
                  item={{
                    id: item.id,
                    type: item.tipo as "entrada" | "saida",
                    value: item.valor,
                    description: item.descricao,
                    date: item.data,
                  }}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Nenhuma transação encontrada.
                </Text>
              }
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

        {/* Modal de loading */}
        <Modal transparent animationType="fade" visible={isLoading}>
          <View style={styles.overlay}>
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={colors.active} />
              <Text style={styles.overlayText}>Processando...</Text>
            </View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={isConfirmationModalVisible}
        >
          <View style={styles.overlay}>
            <ConfirmationModal
              title="Confirmar Pagamento"
              message={`Deseja confirmar o pagamento de ${
                (data as unknown as { value: string })?.value || "R$ 0,00"
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
  withdrawText: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "600",
  },

  /** --- CARD DE SALDO --- **/
  balanceCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.active,
    marginBottom: 16,
  },

  /** Botão sacar dentro do card */
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.active,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginTop: 22,
  },
  depositButton: {
    width: "30%",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    backgroundColor: colors.active,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  transferText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  filterButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.buttons,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: colors.active,
  },
  filterButtonText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },

  /** --- LISTA DE PAGAMENTOS --- **/
  listWrapper: {
    marginTop: 24,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
    marginLeft: 4,
    marginTop: -10,
  },
  listContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 20,
  },

  /** --- BOTÃO FLUTUANTE --- **/
  floatingButtonContainer: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 999,
  },
  addButton: {
    backgroundColor: colors.active,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  /** --- MODAL --- **/
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  loaderBox: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  overlayText: {
    color: colors.text,
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
})
