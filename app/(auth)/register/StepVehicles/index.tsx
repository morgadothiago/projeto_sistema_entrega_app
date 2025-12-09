import fundoBg from "@/app/assets/funndo.png"
import LoadingAnimation from "@/app/assets/Loading.json"
import { Button } from "@/app/components/Button"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import { MultiStep } from "@/app/components/MultiStep"
import AppPicker from "@/app/components/Select"
import { useMultiStep } from "@/app/context/MultiStepContext"
import { licensePlateMask, removeLicensePlateMask } from "@/app/helpers"
import { api } from "@/app/service/api"
import { RegisterFormData } from "@/app/types/UserData"
import { ImageBackground } from "expo-image"
import { router } from "expo-router"
import LottieView from "lottie-react-native"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

import { getToken } from "@/app/helpers/Storage"
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

  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(true)

  // Animação de fade in
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  // Observa o objeto selecionado
  const selectedVehicleTypeObj = watch("vehicleType")
  const licensePlate = watch("licensePlate")
  const brand = watch("brand")
  const model = watch("model")
  const year = watch("year")
  const color = watch("color")

  // Verifica se é bike
  const isBike = selectedVehicleTypeObj === "Bike"

  // Define se deve mostrar os inputs
  const showVehicleInputs = selectedVehicleTypeObj && !isBike

  // Regra do botão
  const isButtonDisabled =
    !selectedVehicleTypeObj ||
    (!isBike && (!licensePlate || !brand || !model || !year || !color))

  async function loadVehicleData() {
    try {
      setLoadingTypes(true)
      const response = await api.get("/vehicle-types", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
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
      Toast.show({
        type: "error",
        text1: "Erro ao carregar tipos de veículos",
        text2: "Tente novamente mais tarde",
      })
    } finally {
      setLoadingTypes(false)
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
    } else {
      console.log("📤 Placa enviada SEM máscara:", dataToSave.licensePlate)
      console.log("✅ Formato limpo (apenas letras e números):", dataToSave.licensePlate)
    }

    setUserInfo(dataToSave)
    setTimeout(() => {
      router.push("/(auth)/register/StepAcess")
    }, 1200)
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Seção: Tipo de Veículo */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>🚗</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Tipo de Veículo</Text>
                  </View>

                  {loadingTypes ? (
                    <View style={styles.loadingContainer}>
                      <LottieView
                        source={LoadingAnimation}
                        autoPlay
                        loop
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain"
                      />
                      <Text style={styles.loadingTypeText}>
                        Carregando tipos...
                      </Text>
                    </View>
                  ) : (
                    <AppPicker
                      label="Selecione o tipo"
                      onValueChange={(value) => setValue("vehicleType", value)}
                      selectedValue={selectedVehicleTypeObj}
                      options={vehicleTypes}
                    />
                  )}
                </View>

                {/* Seção: Informações do Veículo (só aparece se não for bike) */}
                {showVehicleInputs && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>📋</Text>
                      </View>
                      <Text style={styles.sectionTitle}>
                        Informações do Veículo
                      </Text>
                    </View>

                    <Input
                      icon="credit-card"
                      placeholder="Placa do Veículo (ABC1D23)"
                      control={control}
                      name="licensePlate"
                      visualMask={licensePlateMask}
                      unmask={removeLicensePlateMask}
                      autoCapitalize="characters"
                      containerStyle={styles.inputContainer}
                    />

                    <Input
                      icon="tag"
                      placeholder="Marca"
                      control={control}
                      name="brand"
                      containerStyle={styles.inputContainer}
                    />

                    <Input
                      icon="truck"
                      placeholder="Modelo"
                      control={control}
                      name="model"
                      containerStyle={styles.inputContainer}
                    />

                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Input
                          icon="calendar"
                          placeholder="Ano"
                          control={control}
                          name="year"
                          containerStyle={styles.inputContainer}
                          keyboardType="numeric"
                          maxLength={4}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input
                          icon="droplet"
                          placeholder="Cor"
                          control={control}
                          name="color"
                          containerStyle={styles.inputContainer}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Mensagem para Bike */}
                {isBike && (
                  <View style={styles.bikeMessage}>
                    <Text style={styles.bikeMessageText}>
                      ✅ Bike selecionada! Não é necessário informar dados do
                      veículo.
                    </Text>
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Button
            title={loading ? "Carregando..." : "Continuar"}
            onPress={handleSubmit(handleNextStep)}
            disabled={loading || isButtonDisabled}
            style={styles.button}
          />

          {loading && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={LoadingAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}
        </SafeAreaView>
      </ImageBackground>
    </View>
  )
}
