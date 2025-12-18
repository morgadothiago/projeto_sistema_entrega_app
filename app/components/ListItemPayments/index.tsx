import { colors } from "@/app/theme"
import React, { memo } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { getElevation } from "@/app/theme/elevations"

type PaymentItem = {
  id: string
  type: "entrada" | "saida"
  value: number
  description: string
  date: string
}

interface ListItemPaymentsProps {
  item: PaymentItem
}

const ListItemPayments = memo(({ item }: ListItemPaymentsProps) => {
  const isEntrada = item.type === "entrada"

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.row}>
        {/* Ícone e descrição */}
        <View style={styles.leftSection}>
          <Feather
            name={isEntrada ? "arrow-down-circle" : "arrow-up-circle"}
            size={24}
            color={isEntrada ? colors.active : "#c62828"}
          />

          <View style={styles.textContainer}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>

        {/* Valor */}
        <Text style={[styles.value, isEntrada ? styles.entrada : styles.saida]}>
          {isEntrada ? "+ " : "- "}R$ {item.value.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  )
});

export default ListItemPayments;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    ...getElevation('card'),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textContainer: {
    flexDirection: "column",
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  entrada: {
    color: colors.active,
  },
  saida: {
    color: "#c62828",
  },
})
