import { Feather } from "@expo/vector-icons"
import React from "react"
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native"
import { colors } from "../../theme"

interface InputProps extends TextInputProps {
  icon: keyof typeof Feather.glyphMap
  isPassword?: boolean
  style?: StyleProp<TextInputProps> // estilo do TextInput
  containerStyle?: StyleProp<ViewStyle> // estilo do container externo
  mask?: (value: string) => string // Adiciona a propriedade mask
}

export default function Input({
  icon,
  isPassword,
  style,
  containerStyle,
  mask,
  onChangeText,
  value,
  ...rest
}: InputProps) {
  const handleChangeText = (text: string) => {
    if (mask) {
      onChangeText?.(mask(text))
    } else {
      onChangeText?.(text)
    }
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Feather
        name={icon}
        size={20}
        color={colors.buttons}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, style]}
        secureTextEntry={isPassword}
        placeholderTextColor={colors.support}
        onChangeText={handleChangeText}
        value={value}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 5,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.buttons,
  },
})
