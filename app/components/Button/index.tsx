import React from "react"
import { Text, TouchableOpacity, StyleProp, ViewStyle } from "react-native"
import { styles } from "./styles"

type ButtonProps = {
  title?: string
  onPress?: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}
export function Button({ title, onPress, disabled, style }: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, disabled && { opacity: 0.6 }, style]}
      disabled={disabled}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  )
}
