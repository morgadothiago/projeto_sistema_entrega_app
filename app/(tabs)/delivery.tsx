import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { DeliveryItem } from "../components/DeliveryItem"
import { Header } from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { ApiOrder } from "../types/order"

export default function Delivery() {
  const { token } = useAuth()

  useEffect(() => {
    if (!token) {
      return router.replace("/(auth)/Signin")
    }
    getAllDeliverys()
  }, [token])

  const testeToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzYxMTg4OTE4LCJleHAiOjE3NjEyMTc3MTh9.CqLeXF4QcSMDHNCnrSyS-09dsh2Ncn0w74xb5hZsBss"

  const router = useRouter()
  const [orders, setOrders] = useState<ApiOrder[]>([])

  console.log("token:", token)

  const getAllDeliverys = async () => {
    try {
      const response = await api.get("/delivery", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("response:", response.data.data)
      setOrders(response.data.data)
    } catch (error) {
      console.error("Erro ao buscar entregas:", error)
    }
  }

  const handleOpenDetails = (order: ApiOrder) => {
    router.push({
      pathname: "/deliveryDetails",
      params: { code: order.code },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Entregas" />

      <View style={styles.listContainer}>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <DeliveryItem item={item} onPress={() => handleOpenDetails(item)} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma entrega disponível</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  listContent: {
    padding: 16,

    flex: 1,
    backgroundColor: colors.secondary,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 15,
  },
})
