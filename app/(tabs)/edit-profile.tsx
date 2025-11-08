import React, { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Header } from "../components/Header"
import Input from "../components/Input"

import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { colors } from "../theme"
import { formatDateToBR } from "../util/masks"

export default function EditProfile() {
  const { user } = useAuth()
  const router = useRouter()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: user?.DeliveryMan?.name || "",
      cpf: user?.DeliveryMan?.cpf || "",
      dateOfBirth: user?.DeliveryMan?.dob || "",
      email: user?.email || "",
      phone: user?.DeliveryMan?.phone || "",
      street: user?.DeliveryMan?.Address?.street || "",
      number: user?.DeliveryMan?.Address?.number || "",
      neighborhood: user?.DeliveryMan?.Address?.country || "",
      complement: user?.DeliveryMan?.Address?.complement || "",
      zipCode: user?.DeliveryMan?.Address?.zipCode || "",

      city: user?.DeliveryMan?.Address?.city || "",
      state: user?.DeliveryMan?.Address?.state || "",
      vehicleBrand: user?.DeliveryMan?.Vehicle?.brand || "",
      vehicleModel: user?.DeliveryMan?.Vehicle?.model || "",
      licensePlate: user?.DeliveryMan?.Vehicle?.licensePlate || "",
      vehicleColor: user?.DeliveryMan?.Vehicle?.color || "",
    },
  })

  useEffect(() => {
    if (user) {
      setValue("name" as any, user?.DeliveryMan?.name || "")
      console.log("Original DOB:", user?.DeliveryMan?.dob)
      console.log("Formatted DOB:", formatDateToBR(user?.DeliveryMan?.dob))
      setValue("dob" as any, formatDateToBR(user?.DeliveryMan?.dob) || "")
      setValue("cpf" as any, user?.DeliveryMan?.cpf || "")
      setValue("phone" as any, user?.DeliveryMan?.phone || "")
      setValue("email" as any, user?.email || "")
      setValue("street" as any, user?.DeliveryMan?.Address?.street || "")
      setValue("number" as any, user?.DeliveryMan?.Address?.number || "")
      setValue("neighborhood" as any, user?.DeliveryMan?.Address?.city || "")
      setValue(
        "complement" as any,
        user?.DeliveryMan?.Address?.complement || ""
      )
      setValue(
        "complement" as any,
        user?.DeliveryMan?.Address?.complement || ""
      )
      setValue("zipCode" as any, user?.DeliveryMan?.Address?.zipCode || "")
      setValue("city" as any, user?.DeliveryMan?.Address?.city || "")
      setValue("state" as any, user?.DeliveryMan?.Address?.state || "")
      setValue(
        "licensePlate" as any,
        user?.DeliveryMan?.Vehicle?.licensePlate || ""
      )
      setValue("brand" as any, user?.DeliveryMan?.Vehicle?.brand || "")
      setValue("model" as any, user?.DeliveryMan?.Vehicle?.model || "")
      setValue("year" as any, user?.DeliveryMan?.Vehicle?.year || "")
      setValue("color" as any, user?.DeliveryMan?.Vehicle?.color || "")
    }
  }, [user, setValue])

  const onSubmit = (data: any) => {
    console.log("Form submitted:", data)
    // Em uma aplicação real, você enviaria esses dados para uma API
    // e lidaria com feedback de sucesso/erro (por exemplo, usando Toast)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Editar perfil"
        onBackPress={() => router.push("/(tabs)/profile")}
        tabs={true}
        tabsTitle="Editar perfil"
      />

      <View style={styles.contentContainer}>
        <SectionList
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          sections={[
            {
              title: "Dados Pessoais",
              data: [
                {
                  label: "Nome",
                  name: "name",
                  icon: "user",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "CPF",
                  name: "cpf",
                  icon: "id-card",
                  secureTextEntry: false,
                  keyboardType: "numeric",
                  disabled: true,
                },
                {
                  label: "Data de Nascimento",
                  name: "dob",
                  icon: "calendar",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: true,
                },
                {
                  label: "Email",
                  name: "email",
                  keyboardType: "email-address",
                  icon: "mail",
                  secureTextEntry: false,
                },
                {
                  label: "Telefone",
                  name: "phone",
                  icon: "phone",
                  secureTextEntry: false,
                  keyboardType: "phone-pad",
                  disabled: false,
                },
              ],
            },
            {
              title: "Endereço",
              data: [
                {
                  label: "Rua",
                  name: "street",
                  icon: "map-pin",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "Número",
                  name: "number",
                  keyboardType: "numeric",
                  icon: "hash",
                  secureTextEntry: false,

                  disabled: false,
                },
                {
                  label: "Complemento",
                  name: "complement",
                  icon: "info",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "Bairro",
                  name: "neighborhood",
                  icon: "map",
                  secureTextEntry: false,
                  disabled: true,
                  keyboardType: "default",
                },
                {
                  label: "CEP",
                  name: "zipCode",
                  icon: "map-pin",
                  secureTextEntry: false,
                  keyboardType: "numeric",
                  disabled: true,
                },
                {
                  label: "Cidade",
                  name: "city",
                  icon: "globe",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: true,
                },
                {
                  label: "Estado",
                  name: "state",
                  icon: "map",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: true,
                },
              ],
            },
            {
              title: "Veículo",
              data: [
                {
                  label: "Marca",
                  name: "brand",
                  icon: "truck",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "Modelo",
                  name: "model",
                  icon: "truck",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "Ano",
                  name: "year",
                  icon: "calendar",
                  secureTextEntry: false,
                  keyboardType: "numeric",
                  disabled: false,
                },
                {
                  label: "Placa",
                  name: "licensePlate",
                  icon: "tag",
                  secureTextEntry: false,
                  keyboardType: "default",
                  disabled: false,
                },
                {
                  label: "Cor",
                  name: "color",
                  icon: "droplet",
                  secureTextEntry: false,
                  keyboardType: "default",
                },
              ],
            },
          ]}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Controller
                control={control}
                name={item.name as any}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      if (item.mask) {
                        onChange(item.mask(text))
                      } else {
                        onChange(text)
                      }
                    }}
                    value={value as any | undefined}
                    placeholder={item.label}
                    secureTextEntry={item.secureTextEntry}
                    icon={item.icon as any}
                    mask={item.mask}
                  />
                )}
              />
              {errors[item.name as keyof typeof errors] && (
                <Text style={styles.errorText}>
                  {errors[item.name as keyof typeof errors]?.message}
                </Text>
              )}
            </View>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
        />
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          style={styles.saveButton}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Salvar Alterações
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    marginVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 5,
  },
  contentContainer: {
    paddingHorizontal: 18,
    backgroundColor: colors.secondary,
    height: "85%",
    paddingVertical: 50,
  },
  sectionHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.secondary,
    marginBottom: 18,
    borderRadius: 8,
    gap: 20,
  },
  itemContainer: {
    backgroundColor: colors.support,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 18,
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: colors.buttons,
    margin: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
})
