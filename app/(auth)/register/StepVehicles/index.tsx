import fundoBg from "@/app/assets/funndo.png"
import { Button } from "@/app/components/Button"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import { MultiStep } from "@/app/components/MultiStep"
import AppPicker from "@/app/components/Select"
import { useMultiStep } from "@/app/context/MultiStepContext"
import { licensePlateMask } from "@/app/helpers"
import { api } from "@/app/service/api"
import { RegisterFormData } from "@/app/types/UserData"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ImageBackground } from "expo-image"
import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { styles } from "./styles"

type VehicleTypeOption = {
  label: string
  value: string
}

export default function VehiclesInfo() {
  const { userInfo, setUserInfo } = useMultiStep()
  const { control, handleSubmit, watch, setValue, clearErrors, trigger } =
    useForm<RegisterFormData>({
      defaultValues: userInfo,
    })

  const [page] = useState(1)
  const [limit] = useState(100)
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([])
  const [loading, setLoading] = useState(false)

  // Observa o objeto selecionado
  const selectedVehicleTypeObj = watch("vehicleType")
  const licensePlate = watch("licensePlate")
  const brand = watch("brand")
  const model = watch("model")
  const year = watch("year")
  const color = watch("color")

  // 🔹 Verifica se é bike
  const isBike = selectedVehicleTypeObj === "Bike"

  // 🔹 Define se deve mostrar os inputs
  const showVehicleInputs = selectedVehicleTypeObj && !isBike

  // 🔹 Regra do botão
  const isButtonDisabled =
    !selectedVehicleTypeObj ||
    (!isBike && (!licensePlate || !brand || !model || !year || !color))

  async function loadVehicleData() {
    try {
      setLoading(true)
      const response = await api.get("/vehicle-types", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await AsyncStorage.getItem("@token")}`,
        },
      })
      const data = Array.isArray(response.data?.data) ? response.data.data : []

      const formattedOptions = data.map(
        (item: { id: number; type: string }) => ({
          label: item.type,
          value: item.type,
        })
      )
      setVehicleTypes(formattedOptions)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicleData()
  }, [])

  useEffect(() => {
    if (isBike) {
      setValue("licensePlate", "")
      setValue("brand", "")
      setValue("model", "")
      setValue("year", "")
      setValue("color", "")
      clearErrors(["licensePlate", "brand", "model", "year", "color"])
      trigger()
    }
  }, [isBike, setValue, clearErrors, trigger])

  function handleNextStep(data: RegisterFormData) {
    setLoading(true)
    let dataToSave = { ...data }

    if (isBike) {
      delete dataToSave.licensePlate
      delete dataToSave.brand
      delete dataToSave.model
      delete dataToSave.year
      delete dataToSave.color
    }

    setUserInfo(dataToSave)
    router.push("/(auth)/register/StepAcess")
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={fundoBg} style={{ flex: 1 }}>
        <View style={styles.overlay} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Header
            title="Dados do Veículo"
            onBackPress={() => router.replace("/(auth)/register/StepAddress")}
          />
          <MultiStep
            currentStep={2}
            steps={["Usuário", "Endereco", "Veículo", "Acesso"]}
          />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {loading && vehicleTypes.length === 0 ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Controller
                  control={control}
                  name="vehicleType"
                  rules={{ required: "Selecione um tipo de veículo" }}
                  render={({ field: { onChange, value } }) => (
                    <AppPicker
                      label="Tipo de Veículo"
                      onValueChange={onChange}
                      selectedValue={value}
                      options={vehicleTypes}
                    />
                  )}
                />
              )}

              {/* Inputs só aparecem se o veículo selecionado NÃO for bike */}
              {showVehicleInputs && (
                <>
                  <Controller
                    control={control}
                    name="licensePlate"
                    rules={{ required: !isBike && "A placa é obrigatória" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="credit-card"
                        placeholder="Placa do Veículo (ABC1D23)"
                        value={value}
                        onChangeText={onChange}
                        mask={licensePlateMask}
                        onBlur={onBlur}
                        autoCapitalize="characters"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="brand"
                    rules={{ required: !isBike && "A marca é obrigatória" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="tag"
                        placeholder="Marca"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="model"
                    rules={{ required: !isBike && "O modelo é obrigatório" }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="truck"
                        placeholder="Modelo"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Controller
                        control={control}
                        name="year"
                        rules={{ required: !isBike && "O ano é obrigatório" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            icon="calendar"
                            placeholder="Ano"
                            value={value?.toString() || ""}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="numeric"
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Controller
                        control={control}
                        name="color"
                        rules={{ required: !isBike && "A cor é obrigatória" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <Input
                            icon="droplet"
                            placeholder="Cor"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                          />
                        )}
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
          <Button
            title="Ir para Informações de Acesso"
            onPress={handleSubmit(handleNextStep)}
            disabled={loading || isButtonDisabled}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}
