import { Feather } from "@expo/vector-icons"
import React from "react"
import {
  FieldValues,
  RegisterOptions,
  UseControllerProps,
} from "react-hook-form"
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native"
import { colors } from "../../theme"

interface InputProps<TFieldValues extends FieldValues = FieldValues> extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap
  isPassword?: boolean
  style?: StyleProp<TextInputProps> // estilo do TextInput
  containerStyle?: StyleProp<ViewStyle> // estilo do container externo
  mask?: (value: string) => string // Adiciona a propriedade mask
  onChange: (...event: any[]) => void
  onBlur: (...event: any[]) => void
  value: string
  error?: string
}

export default function Input<TFieldValues extends FieldValues = FieldValues>({
  icon,
  isPassword,
  style,
  containerStyle,
  mask,
  onChange,
  onBlur,
  value,
  error,
  ...rest
}: InputProps<TFieldValues>) {
  return (
    <View>
      <View style={[styles.container, containerStyle]}>
        {icon && (
          <Feather
            name={icon}
            size={20}
            color={colors.buttons}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          secureTextEntry={isPassword}
          placeholderTextColor={colors.support}
          onBlur={onBlur}
          onChangeText={(text) => onChange(mask ? mask(text) : text)}
          value={value}
          {...rest}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 10,
  },
})
