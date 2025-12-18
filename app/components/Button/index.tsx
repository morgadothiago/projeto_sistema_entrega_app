import React from "react"
import { Text, TouchableOpacity, Pressable, Platform, StyleProp, ViewStyle } from "react-native"
import { styles } from "./styles"
import { getElevation } from "@/app/theme/elevations"
import { getRippleConfig, getTouchableProps } from "@/app/theme/androidOptimizations"

type ButtonProps = {
  title?: string
  onPress?: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

// Usa Pressable no Android (melhor performance) e TouchableOpacity no iOS
const ButtonWrapper = Platform.OS === 'android' ? Pressable : TouchableOpacity;

export function Button({ title, onPress, disabled, style }: ButtonProps) {
  const baseStyle = [
    styles.container,
    getElevation('elevated'),
    disabled && { opacity: 0.6 },
    style
  ];

  if (Platform.OS === 'android') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        android_ripple={getRippleConfig()}
        style={({ pressed }) => [
          baseStyle,
          pressed && { opacity: 0.85 }
        ]}
      >
        <Text style={styles.title}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      {...getTouchableProps()}
      style={baseStyle}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}
