import React, { useState } from "react"
import { FlatList, StyleSheet, View, Text } from "react-native"
import { Header } from "../components/Header"
import { SafeAreaView } from "react-native-safe-area-context"
import { colors } from "../theme"
import ChartExample from "../components/Chats"
import AppPicker from "../components/Select"
import DeliveryCard from "../components/DeliveryCard"
import { deliveriesData, DeliveryItem } from "../mocks/deliveriesData"

export default function Charts() {
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

  const dayOptions = [
    { label: "Domingo", value: "sunday" },
    { label: "Segunda-feira", value: "monday" },
    { label: "Terça-feira", value: "tuesday" },
    { label: "Quarta-feira", value: "wednesday" },
    { label: "Quinta-feira", value: "thursday" },
    { label: "Sexta-feira", value: "friday" },
    { label: "Sábado", value: "saturday" },
  ]

  const filteredDeliveries = selectedDay
    ? deliveriesData.filter((delivery) => delivery.day === selectedDay)
    : deliveriesData

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Relatorios" tabs={true} tabsTitle="Relatorios" />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.secondary,
        }}
      >
        <View style={styles.fixedContent}>
          <ChartExample selectedDay={selectedDay} />
          <AppPicker
            label="Filtrar por dia da semana"
            selectedValue={selectedDay}
            onValueChange={setSelectedDay}
            options={dayOptions}
            placeholder="Selecione um dia"
          />
          <Text style={styles.deliveryListTitle}>
            {selectedDay
              ? `Entregas do dia ${
                  dayOptions.find((option) => option.value === selectedDay)
                    ?.label
                }`
              : "Todas as Entregas"}
          </Text>
        </View>
        <FlatList
          data={filteredDeliveries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DeliveryCard item={item as DeliveryItem} />
          )}
          contentContainerStyle={styles.flatListContentContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma entrega encontrada.</Text>
          }
        />
      </View>
    </SafeAreaView>
  )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  fixedContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.secondary,
  },
  flatListContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.secondary,
  },
  deliveryListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.text,
  },
})
