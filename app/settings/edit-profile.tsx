import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Animated,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

import fundoBg from "@/app/assets/funndo.png"
import LoadingAnimation from "@/app/assets/Loading.json"
import LottieView from "lottie-react-native"
import { Header } from "../components/Header"
import Input from "../components/Input"

import { useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import {
  cepMask,
  cpfMask,
  dateMask,
  phoneMask,
  removeNonNumeric,
} from "../helpers"
import { colors } from "../theme"
import { formatDateToBR } from "../util/masks"

type FormData = {
  name: string
  cpf: string
  dateOfBirth?: string
  dob?: string
  email: string
  phone: string
  street: string
  number: string
  neighborhood: string
  complement: string
  zipCode: string
  city: string
  state: string
  vehicleBrand: string
  vehicleModel: string
  licensePlate: string
  vehicleColor: string
}

type FieldItem = {
  label: string
  name: string
  icon: string
  secureTextEntry: boolean
  keyboardType?: string
  disabled?: boolean
  mask?: (value: string) => string
  visualMask?: (value: string) => string
  unmask?: (value: string) => string
}

export default function EditProfile() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  // Animação de fade in e slide up
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Perfil atualizado com sucesso",
      })

      router.back()
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível atualizar o perfil",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ImageBackground
      source={fundoBg}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          title="Editar Perfil"
          onBackPress={() => router.back()}
          tabs={false}
        />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}
          >
            <SectionList<FieldItem>
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.contentContainer}
              style={{ flex: 1 }}
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
                      icon: "credit-card",
                      secureTextEntry: false,
                      keyboardType: "numeric",
                      disabled: true,
                      visualMask: cpfMask,
                      unmask: removeNonNumeric,
                    },
                    {
                      label: "Data de Nascimento",
                      name: "dob",
                      icon: "calendar",
                      secureTextEntry: false,
                      keyboardType: "numeric",
                      disabled: true,
                      visualMask: dateMask,
                      unmask: removeNonNumeric,
                    },
                    {
                      label: "Email",
                      name: "email",
                      keyboardType: "email-address",
                      icon: "mail",
                      secureTextEntry: false,
                      disabled: true,
                    },
                    {
                      label: "Telefone",
                      name: "phone",
                      icon: "smartphone",
                      secureTextEntry: false,
                      keyboardType: "phone-pad",
                      disabled: false,
                      visualMask: phoneMask,
                      unmask: removeNonNumeric,
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
                      visualMask: cepMask,
                      unmask: removeNonNumeric,
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
                  <Input
                    control={control}
                    name={item.name as any}
                    placeholder={item.label}
                    placeholderTextColor={colors.support}
                    secureTextEntry={item.secureTextEntry}
                    icon={item.icon as any}
                    visualMask={item.visualMask}
                    unmask={item.unmask}
                    mask={item.mask}
                    editable={!item.disabled}
                    containerStyle={[
                      styles.inputStyle,
                      item.disabled && styles.disabledInput
                    ]}
                    keyboardType={item.keyboardType as any}
                  />
                  {errors[item.name as keyof typeof errors] && (
                    <Text style={styles.errorText}>
                      {errors[item.name as keyof typeof errors]?.message}
                    </Text>
                  )}
                </View>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeaderContainer}>
                  <Text style={styles.sectionHeader}>{title}</Text>
                </View>
              )}
              stickySectionHeadersEnabled={false}
              ListFooterComponent={() => (
                <View style={styles.footerContainer}>
                  <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    style={[
                      styles.saveButton,
                      isSubmitting && styles.saveButtonDisabled,
                    ]}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.saveButtonText}>
                      {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </Animated.View>

          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={LoadingAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Salvando alterações...</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  itemContainer: {
    marginBottom: 12,
  },
  inputStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  errorText: {
    color: "#FF453A",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: "600",
  },
  footerContainer: {
    marginTop: 24,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: colors.buttons,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})
