import { colors } from "@/app/theme"
import React from "react"
import { View, Text, Dimensions } from "react-native"
import { BarChart } from "react-native-chart-kit"

type ChartExampleProps = {
  selectedDay?: string
}

export default function ChartExample({ selectedDay }: ChartExampleProps) {
  const screenWidth = Dimensions.get("window").width

  const allData = {
    sunday: [30, 50, 35, 70, 80, 50],
    monday: [25, 40, 30, 60, 75, 45],
    tuesday: [20, 35, 25, 55, 70, 40],
    wednesday: [35, 60, 40, 85, 100, 55],
    thursday: [40, 65, 45, 90, 105, 60],
    friday: [45, 70, 50, 95, 110, 65],
    saturday: [50, 75, 55, 100, 115, 70],
  }

  const aggregatedData = Object.values(allData).reduce((acc, current) => {
    current.forEach((value, index) => {
      acc[index] = (acc[index] || 0) + value
    })
    return acc
  }, [] as number[])

  const dataToDisplay = selectedDay
    ? allData[selectedDay as keyof typeof allData]
    : aggregatedData

  const dayLabels = selectedDay
    ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    : ["Cat1", "Cat2", "Cat3", "Cat4", "Cat5", "Cat6"]

  const dayNamesInPortuguese: { [key: string]: string } = {
    sunday: "Domingo",
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
  }

  const chartTitle = selectedDay
    ? `Entregas de ${dayNamesInPortuguese[selectedDay]}`
    : "Total de Entregas da Semana"

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 10, color: colors.text }}>
        {chartTitle}
      </Text>
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          paddingVertical: 10,
        }}
      >
        <BarChart
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars={true}
          data={{
            labels: dayLabels,
            datasets: [{ data: dataToDisplay }],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: colors.primary,
            backgroundGradientTo: colors.support,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.buttons,
            barPercentage: 0.5,
            style: {
              borderRadius: 16,
            },
            labelColor: (opacity = 1) => colors.secondary,
          }}
          flatColor={true}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  )
}
