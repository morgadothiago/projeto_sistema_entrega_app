import { Feather } from "@expo/vector-icons"
import React from "react"
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
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

interface InputProps<TFieldValues extends FieldValues = FieldValues>
  extends TextInputProps {
  icon?: keyof typeof Feather.glyphMap
  isPassword?: boolean
  style?: StyleProp<TextInputProps> // estilo do TextInput
  containerStyle?: StyleProp<ViewStyle> // estilo do container externo
  mask?: (value: string) => string // Aplica máscara e salva o valor mascarado
  visualMask?: (value: string) => string // Mostra máscara visual mas salva sem máscara
  unmask?: (value: string) => string // Remove a máscara antes de salvar
  control?: Control<TFieldValues>
  name?: Path<TFieldValues>
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>
}

export default function Input<TFieldValues extends FieldValues = FieldValues>({
  icon,
  isPassword,
  style,
  containerStyle,
  mask,
  visualMask,
  unmask,
  control,
  name,
  rules,
  placeholderTextColor,
  ...rest
}: InputProps<TFieldValues>) {
  // Estado local para armazenar o valor com máscara visual
  const [displayValue, setDisplayValue] = React.useState("")

  // Se control e name forem fornecidos, usa Controller
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => {
          // Atualiza o displayValue quando o value mudar (caso seja preenchido programaticamente)
          React.useEffect(() => {
            if (visualMask && value) {
              setDisplayValue(visualMask(value))
            } else if (value) {
              setDisplayValue(value)
            }
          }, [value])

          const handleChangeText = (text: string) => {
            if (visualMask && unmask) {
              // Mostra com máscara visual
              setDisplayValue(visualMask(text))
              // Salva sem máscara
              onChange(unmask(text))
            } else if (mask) {
              // Aplica máscara e salva com máscara
              const maskedValue = mask(text)
              onChange(maskedValue)
            } else {
              // Sem máscara
              onChange(text)
            }
          }

          return (
            <View>
              <View
                style={[
                  styles.container,
                  containerStyle,
                  error && styles.errorContainer,
                ]}
              >
                {icon && (
                  <Feather
                    name={icon}
                    size={20}
                    color={error ? "#FF3B30" : colors.buttons}
                    style={styles.icon}
                  />
                )}
                <TextInput
                  style={[styles.input, style]}
                  secureTextEntry={isPassword}
                  placeholderTextColor={error ? "#FF3B30" : placeholderTextColor || colors.support}
                  onBlur={onBlur}
                  onChangeText={handleChangeText}
                  value={visualMask && unmask ? displayValue : value}
                  {...rest}
                />
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )
        }}
      />
    )
  }

  // Caso contrário, usa como input controlado comum
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
          placeholderTextColor={placeholderTextColor || colors.support}
          onChangeText={(text) => rest.onChangeText?.(mask && text ? mask(text) : text)}
          {...rest}
        />
      </View>
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
  errorContainer: {
    borderWidth: 2,
    borderColor: "#FF3B30",
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
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 10,
  },
})
