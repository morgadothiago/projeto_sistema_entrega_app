import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme"
import { Header } from "../components/Header"
import UserWarpper from "../components/UserWarpper"
import { useAuth } from "../context/AuthContext"

export default function Home() {
  const { user } = useAuth()

  const { DeliveryMan } = user || {}

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" tabs={false} />
      <View style={styles.content}>
        {DeliveryMan && user && <UserWarpper deliveryMan={DeliveryMan} />}
        <Text style={styles.welcomeText}>
          Bem-vindo, {DeliveryMan?.name || "Usuário"}!
        </Text>
        <Text style={styles.paymentText}>Formas de pagamento: R$ 1000.00</Text>
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
    padding: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 20,
  },
  paymentText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 10,
  },
})
