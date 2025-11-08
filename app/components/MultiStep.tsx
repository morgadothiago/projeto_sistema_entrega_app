import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../theme"

interface MultiStepProps {
  currentStep: number
  steps: string[]
}

export const MultiStep: React.FC<MultiStepProps> = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isActive = idx === currentStep
        const isCompleted = idx < currentStep
        return (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.circle,
                isActive && styles.activeCircle,
                isCompleted && styles.completedCircle,
              ]}
            >
              <Text style={styles.stepNumber}>{idx + 1}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {step}
            </Text>
            {idx < steps.length - 1 && <View />}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 58,
    marginTop: 58,
  },
  stepContainer: {
    flex: 1,
    flexDirection: "column",

    alignItems: "center",
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.support,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  activeCircle: {
    backgroundColor: colors.buttons,
  },
  completedCircle: {
    backgroundColor: colors.active,
  },
  stepNumber: {
    color: colors.primary,
    fontWeight: "bold",
  },
  label: {
    marginLeft: 6,
    marginRight: 12,
    color: colors.secondary,

    fontSize: 18,
  },
  activeLabel: {
    color: colors.buttons,
    fontWeight: "900",
    fontSize: 16,
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
})
