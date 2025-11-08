import React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { styles } from "./styles"
import { colors } from "@/app/theme"

export default function Payments() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.text, marginTop: 10 }}>Carregando...</Text>
    </View>
  )
}
