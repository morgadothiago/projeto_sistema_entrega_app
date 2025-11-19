/**
 * Componente de Gráfico de Barras
 * Versão atualizada para receber dados da API
 */

import React, { useMemo } from "react"
import { View, Text, Dimensions, StyleSheet } from "react-native"
import { BarChart } from "react-native-chart-kit"
import { colors } from "@/app/theme"
import type { DailyStatsResponse } from "@/app/types/api"

type ChartProps = {
  selectedDay?: string
  chartData?: DailyStatsResponse | null
  weeklyData?: { [key: string]: DailyStatsResponse }
}

type ChartData = {
  [key: string]: number[]
}

// Dados de fallback (mock) caso a API não retorne dados
const MOCK_DATA: ChartData = {
  sunday: [30, 50, 35, 70, 80, 50],
  monday: [25, 40, 30, 60, 75, 45],
  tuesday: [20, 35, 25, 55, 70, 40],
  wednesday: [35, 60, 40, 85, 100, 55],
  thursday: [40, 65, 45, 90, 105, 60],
  friday: [45, 70, 50, 95, 110, 65],
  saturday: [50, 75, 55, 100, 115, 70],
}

const DAY_NAMES_PT: Record<string, string> = {
  sunday: "Domingo",
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
}

export default function Charts({ selectedDay, chartData, weeklyData }: ChartProps) {
  const screenWidth = Dimensions.get("window").width

  // Dados para exibir no gráfico
  const dataToDisplay = useMemo(() => {
    // Se tem dados da API para o dia específico
    if (selectedDay && chartData?.hourlyData) {
      return chartData.hourlyData
    }

    // Se tem dados da API para a semana
    if (weeklyData && Object.keys(weeklyData).length > 0) {
      return Object.values(weeklyData).reduce((acc, current) => {
        current.hourlyData.forEach((value, index) => {
          acc[index] = (acc[index] || 0) + value
        })
        return acc
      }, [] as number[])
    }

    // Fallback: usa dados mock
    if (selectedDay && MOCK_DATA[selectedDay]) {
      return MOCK_DATA[selectedDay]
    }

    // Agrega dados mock de todos os dias
    return Object.values(MOCK_DATA).reduce((acc, current) => {
      current.forEach((value, index) => {
        acc[index] = (acc[index] || 0) + value
      })
      return acc
    }, [] as number[])
  }, [selectedDay, chartData, weeklyData])

  // Labels do gráfico
  const dayLabels = useMemo(() => {
    if (selectedDay) {
      return ["00h", "04h", "08h", "12h", "16h", "20h"]
    }
    return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  }, [selectedDay])

  // Título do gráfico
  const chartTitle = useMemo(() => {
    if (selectedDay && DAY_NAMES_PT[selectedDay]) {
      return `Entregas de ${DAY_NAMES_PT[selectedDay]}`
    }
    return "Entregas da Semana"
  }, [selectedDay])

  // Subtítulo
  const subtitle = useMemo(() => {
    if (chartData) {
      return `${chartData.totalDeliveries} entregas no total`
    }
    if (selectedDay) {
      return "Por período do dia"
    }
    return "Últimos 7 dias"
  }, [selectedDay, chartData])

  // Valor máximo para escala do gráfico
  const maxValue = useMemo(() => {
    return Math.max(...dataToDisplay, 0)
  }, [dataToDisplay])

  // Se não há dados para exibir
  if (!dataToDisplay || dataToDisplay.length === 0 || maxValue === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Sem dados para exibir</Text>
          <Text style={styles.emptySubtext}>
            Não há entregas registradas para este período
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Título */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{chartTitle}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Gráfico */}
      <View style={styles.chartWrapper}>
        <BarChart
          yAxisLabel=""
          yAxisSuffix=""
          showValuesOnTopOfBars={true}
          data={{
            labels: dayLabels,
            datasets: [{ data: dataToDisplay }],
          }}
          width={screenWidth - 60}
          height={240}
          chartConfig={{
            backgroundGradientFrom: colors.primary,
            backgroundGradientTo: colors.support,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            barPercentage: 0.6,
            style: {
              borderRadius: 16,
            },
            labelColor: (opacity = 1) => colors.secondary,
            propsForBackgroundLines: {
              strokeDasharray: "",
              stroke: "rgba(255, 255, 255, 0.1)",
              strokeWidth: 1,
            },
            propsForLabels: {
              fontSize: 11,
            },
          }}
          flatColor={true}
          style={styles.chart}
          fromZero={true}
        />
      </View>

      {/* Legenda com informações adicionais */}
      {maxValue > 0 && (
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
            <Text style={styles.legendText}>Pico: {maxValue} entregas</Text>
          </View>
          {chartData && (
            <>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
                <Text style={styles.legendText}>
                  Concluídas: {chartData.completedDeliveries}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
                <Text style={styles.legendText}>
                  Pendentes: {chartData.pendingDeliveries}
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
  },
  chartWrapper: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  chart: {
    marginVertical: 0,
    borderRadius: 16,
  },
  legendContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.text,
    opacity: 0.6,
    textAlign: "center",
  },
})
