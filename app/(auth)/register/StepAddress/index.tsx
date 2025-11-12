import fundoBg from "@/app/assets/funndo.png"
import { Button } from "@/app/components/Button"
import { Header } from "@/app/components/Header"
import { MultiStep } from "@/app/components/MultiStep"
import { useMultiStep } from "@/app/context/MultiStepContext"
import { yupResolver } from "@hookform/resolvers/yup"
import { ImageBackground } from "expo-image"
import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { styles } from "./styles"

import Input from "@/app/components/Input"
import { cepMask, removeNonNumeric } from "@/app/helpers"
import { schema } from "@/app/schema/accouts"
import api from "@/app/service/viaCep"
import LottieView from "lottie-react-native"
import LoadingAnimation from "@/app/assets/Loading.json"
import Toast from "react-native-toast-message"
import { Feather } from "@expo/vector-icons"
import { colors } from "@/app/theme"

type AddressType = {
  address: string
  city: string
  number: string
  complement: string
  state: string
  zipCode: string
}

export default function AddressInfo() {
  const { userInfo, setUserInfo } = useMultiStep()
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)

  // Animação de fade in
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()

    return () => setLoading(false)
  }, [])

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: userInfo,
    resolver: yupResolver(schema) as any,
  })

  const zipCode = watch("zipCode")

  async function handleGetAddressByCep() {
    const cepLimpo = zipCode?.replace(/\D/g, "") || ""
    if (!cepLimpo) return

    if (cepLimpo.length !== 8) {
      Toast.show({
        type: "error",
        text1: "CEP inválido",
        text2: "Digite um CEP válido com 8 dígitos",
      })
      return
    }

    setLoadingCep(true)
    try {
      const { data } = await api.get(`${cepLimpo}/json/`)

      if (data.erro) {
        Toast.show({
          type: "error",
          text1: "CEP não encontrado",
          text2: "Verifique o CEP digitado",
        })
        return
      }

      if (data.logradouro) setValue("address", data.logradouro)
      if (data.localidade) setValue("city", data.localidade)
      if (data.uf) setValue("state", data.uf)

      Toast.show({
        type: "success",
        text1: "Endereço encontrado!",
        text2: "Dados preenchidos automaticamente",
      })
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erro ao buscar CEP",
        text2: "Tente novamente mais tarde",
      })
    } finally {
      setLoadingCep(false)
    }
  }

  function onSubmit(data: any) {
    setLoading(true)
    setUserInfo(data)
    setTimeout(() => {
      router.push("/(auth)/register/StepVehicles")
    }, 1200)
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={fundoBg} style={{ flex: 1 }}>
        <View style={styles.overlay} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Header
            title="Dados do Endereço"
            onBackPress={() => router.replace("/(auth)/register/StepUser")}
          />
          <MultiStep
            currentStep={1}
            steps={["Usuário", "Endereco", "Veículo", "Acesso"]}
          />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Seção: CEP */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>📍</Text>
                    </View>
                    <Text style={styles.sectionTitle}>CEP</Text>
                  </View>

                  <View style={styles.cepContainer}>
                    <View style={{ flex: 1 }}>
                      <Input
                        icon="map-pin"
                        placeholder="CEP"
                        control={control}
                        name="zipCode"
                        visualMask={cepMask}
                        unmask={removeNonNumeric}
                        keyboardType="numeric"
                        containerStyle={styles.inputContainer}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={handleGetAddressByCep}
                      disabled={loadingCep}
                    >
                      {loadingCep ? (
                        <Text style={styles.searchButtonText}>...</Text>
                      ) : (
                        <Feather name="search" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Seção: Endereço Completo */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>🏠</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Endereço Completo</Text>
                  </View>

                  <Input
                    icon="map"
                    placeholder="Endereço"
                    control={control}
                    name="address"
                    containerStyle={styles.inputContainer}
                  />

                  <View style={styles.row}>
                    <View style={{ flex: 2 }}>
                      <Input
                        icon="home"
                        placeholder="Cidade"
                        control={control}
                        name="city"
                        containerStyle={styles.inputContainer}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Input
                        icon="flag"
                        placeholder="UF"
                        control={control}
                        name="state"
                        containerStyle={styles.inputContainer}
                        autoCapitalize="characters"
                        maxLength={2}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Input
                        icon="hash"
                        placeholder="Número"
                        control={control}
                        name="number"
                        containerStyle={styles.inputContainer}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 2 }}>
                      <Input
                        icon="info"
                        placeholder="Complemento (opcional)"
                        control={control}
                        name="complement"
                        containerStyle={styles.inputContainer}
                      />
                    </View>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>

          <Button
            title={loading ? "Carregando..." : "Continuar"}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
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
