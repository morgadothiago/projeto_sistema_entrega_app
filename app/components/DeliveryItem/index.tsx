import { colors } from "@/app/theme"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { ApiOrder } from "@/app/types/order"

interface DeliveryItemProps {
  item: ApiOrder
  onPress: (order: ApiOrder) => void
}

export function DeliveryItem({ item, onPress }: DeliveryItemProps) {
  const statusLabel =
    item.status === "PENDING"
      ? "Pendente"
      : item.status === "IN_TRANSIT"
      ? "A caminho"
      : "Entregue"

  const statusColor =
    item.status === "PENDING"
      ? colors.buttons
      : item.status === "IN_TRANSIT"
      ? colors.active
      : colors.stars

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>{item.code}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.customer}>{item.Company.name}</Text>
        <Text style={styles.message}>{item.information}</Text>
        <Text style={styles.fee}>Taxa: R$ {item.price}</Text>
      </View>

      <Pressable style={styles.button} onPress={() => onPress(item)}>
        <Text style={styles.buttonText}>Ver detalhes</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
  },
  body: {
    marginBottom: 10,
  },
  customer: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  address: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  message: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    fontStyle: "italic",
  },
  fee: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.buttons,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
})
