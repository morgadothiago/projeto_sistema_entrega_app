import React, { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import { colors } from "../theme"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "../components/Header"
import { ApiOrder } from "../types/order"

import { ScrollView } from "react-native"
import { api } from "../service/api"
import { useAuth } from "../context/AuthContext"

export default function DeliveryDetails() {
  const router = useRouter()
  const { code } = useLocalSearchParams()

  const { token } = useAuth()
  const [deliveryDetails, setDeliveryDetails] = useState<ApiOrder | null>(null)

  // Atualiza o state com o primeiro item do array data

  console.log(code)

  async function GetDeliveryDetails() {
    console.log("Entering GetDeliveryDetails function.")
    try {
      if (!code || !token) {
        console.warn("Code or token is missing, cannot fetch delivery details.")
        return // Prevent API call if essential data is missing
      }

      console.log("token:", token)
      console.log("code:", code)

      const response = await api.get(`/delivery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          code: code,
        },
      })
      console.log("Full API response:", response)
      console.log("response: delivery details", response.data.data)
      setDeliveryDetails(response.data.data[0])
    } catch (error) {
      console.error("Erro ao buscar entrega:", error)
    }
  }

  useEffect(() => {
    if (!token) {
      return router.replace("/(auth)/Signin")
    }
    GetDeliveryDetails()
  }, [token])

  if (!deliveryDetails) {
    return (
      <SafeAreaView style={localStyles.container}>
        <Header title="Detalhes da Entrega" />
        <View style={localStyles.content}>
          <Text style={localStyles.message}>
            Carregando detalhes da entrega...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const statusColor =
    deliveryDetails.status === "DELIVERED" ? "green" : "orange"
  const statusLabel =
    deliveryDetails.status === "DELIVERED" ? "Concluída" : "Pendente"

  return (
    <SafeAreaView style={localStyles.container}>
      <Header title="Detalhes da Entrega" />

      <View style={localStyles.content}>
        <Text style={localStyles.message}>{deliveryDetails.Company?.name}</Text>

        <ScrollView>
          <View style={localStyles.detailsContainer}>
            <Text style={localStyles.sectionTitle}>Detalhes da Encomenda</Text>
            <Text style={localStyles.label}>ID da Entrega:</Text>
            <Text style={localStyles.value}>{deliveryDetails.code}</Text>

            <Text style={localStyles.label}>Empresa:</Text>
            <Text style={localStyles.value}>
              {deliveryDetails.Company?.name}
            </Text>

            <Text style={localStyles.label}>Endereço da Empresa:</Text>
            <Text style={localStyles.value}>
              {deliveryDetails.Company?.andress}
            </Text>

            <Text style={localStyles.label}>Telefone da Empresa:</Text>
            <Text style={localStyles.value}>
              {deliveryDetails.Company?.phone}
            </Text>

            <Text style={localStyles.label}>Tipo de Veículo:</Text>
            <Text style={localStyles.value}>{deliveryDetails.vehicleType}</Text>

            <Text style={localStyles.label}>Dimensões (AxLxC):</Text>
            <Text style={localStyles.value}>
              {deliveryDetails.height} x {deliveryDetails.width} x{" "}
              {deliveryDetails.length}
            </Text>

            <Text style={localStyles.label}>Peso:</Text>
            <Text style={localStyles.value}>{deliveryDetails.weight} kg</Text>

            <Text style={localStyles.label}>Fragilidade:</Text>
            <Text style={localStyles.value}>
              {deliveryDetails.isFragile ? "Sim" : "Não"}
            </Text>

            <Text style={localStyles.label}>Preço:</Text>
            <Text style={localStyles.value}>R$ {deliveryDetails.price}</Text>

            <Text style={localStyles.label}>Status:</Text>
            <Text style={[localStyles.value, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </ScrollView>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.buttons }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.secondary,
  },
  detailsContainer: {
    backgroundColor: colors.support,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: colors.secondary,
  },
  message: {
    marginBottom: 12,
    color: colors.secondary,
  },
})
