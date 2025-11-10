import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import React from "react"

import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Control, Controller, FieldValues, RegisterOptions } from "react-hook-form"

type Option = { label: string; value: string }
type Props<T extends FieldValues> = {
  label?: string
  selectedValue?: string
  onValueChange?: (value: string) => void
  options: Option[]
  placeholder?: string
  control: Control<T>
  name: keyof T
  rules?: RegisterOptions
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
}: Props<T>) {
  const processedOptions = options.map((option) => ({
    label: option.label,
    value: option.value,
  }))

  const [visible, setVisible] = React.useState(false)

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          <Pressable style={styles.selector} onPress={() => setVisible(true)}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={styles.selectorText}>
                {processedOptions.find((o) => o.value === value)?.label ?? placeholder}
              </Text>
              <Feather name="arrow-down-circle" size={30} color={colors.buttons} />
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

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6, color: colors.secondary, fontWeight: "900" },
  selector: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 30,
  },
  selectorText: { fontSize: 16, color: colors.buttons, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "50%",
  },
  option: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionText: { fontSize: 16, color: colors.buttons, fontWeight: "600" },
  cancel: { padding: 16, alignItems: "center" },
  cancelText: { color: "red", fontWeight: "600" },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
})
