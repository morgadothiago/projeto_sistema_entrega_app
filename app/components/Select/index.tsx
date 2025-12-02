import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import React from "react"

import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form"
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"

type Option = { label: string; value: string }
type Props<T extends FieldValues> = {
  label?: string
  selectedValue?: string
  onValueChange?: (value: string) => void
  options: Option[]
  placeholder?: string
  control?: Control<T>
  name?: Path<T>
  rules?: RegisterOptions<T, Path<T>>
  disabled?: boolean
}

export default function Select<T extends FieldValues>({
  label,
  selectedValue,
  onValueChange,
  options,
  placeholder = "Selecione",
  control,
  name,
  rules,
  disabled = false,
}: Props<T>) {
  const processedOptions = options.map((option) => ({
    label: option.label,
    value: option.value,
  }))

  const [visible, setVisible] = React.useState(false)

  // Se control e name forem fornecidos, usa Controller
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View style={styles.container}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <Pressable
              style={[styles.selector, disabled && styles.selectorDisabled]}
              onPress={() => !disabled && setVisible(true)}
              disabled={disabled}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.selectorText, disabled && styles.selectorTextDisabled]}>
                  {processedOptions.find((o) => o.value === value)?.label ?? placeholder}
                </Text>
                <Feather
                  name="arrow-down-circle"
                  size={30}
                  color={disabled ? colors.secondary + "80" : colors.buttons}
                />
              </View>
            </Pressable>

            {error && <Text style={styles.errorText}>{error.message}</Text>}

            <Modal
              visible={visible}
              transparent
              animationType="slide"
              onRequestClose={() => setVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setVisible(false)}
              >
                <View style={styles.modal}>
                  <FlatList
                    data={processedOptions}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => {
                          onChange(item.value)
                          if (onValueChange) {
                            onValueChange(item.value)
                          }
                          setVisible(false)
                        }}
                      >
                        <Text style={[styles.optionText]}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <Text style={{ padding: 12 }}>Sem opções</Text>
                    }
                  />

                  <TouchableOpacity
                    style={styles.cancel}
                    onPress={() => setVisible(false)}
                  >
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </View>
        )}
      />
    )
  }

  // Caso contrário, usa como select controlado comum
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        style={[styles.selector, disabled && styles.selectorDisabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={[styles.selectorText, disabled && styles.selectorTextDisabled]}>
            {processedOptions.find((o) => o.value === selectedValue)?.label ?? placeholder}
          </Text>
          <Feather
            name="arrow-down-circle"
            size={30}
            color={disabled ? colors.secondary + "80" : colors.buttons}
          />
        </View>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <View style={styles.modal}>
            <FlatList
              data={processedOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    if (onValueChange) {
                      onValueChange(item.value)
                    }
                    setVisible(false)
                  }}
                >
                  <Text style={[styles.optionText]}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ padding: 12 }}>Sem opções</Text>
              }
            />

            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: {
    marginBottom: 8,
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  selector: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorDisabled: {
    backgroundColor: colors.secondary + "40",
    opacity: 0.6,
  },
  selectorText: {
    fontSize: 16,
    color: colors.buttons,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  selectorTextDisabled: {
    color: colors.secondary + "80",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modal: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "65%",
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  option: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: colors.buttons,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  cancel: {
    padding: 20,
    margin: 16,
    marginTop: 8,
    alignItems: "center",
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 69, 58, 0.3)",
  },
  cancelText: {
    color: "#FF453A",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#FF453A",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
})
