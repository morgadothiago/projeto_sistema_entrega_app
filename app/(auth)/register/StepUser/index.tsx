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
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as yup from "yup"
import { styles } from "./styles"

import LoadingAnimation from "@/app/assets/Loading.json"
import Input from "@/app/components/Input"
import { cpfMask, dateMask, phoneMask, removeNonNumeric } from "@/app/helpers"
import { RegisterFormData } from "@/app/types/UserData"
import LottieView from "lottie-react-native"

export default function UserInfo() {
  const { userInfo, setUserInfo } = useMultiStep()
  const [loading, setLoading] = useState(false)

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

  const schema = yup.object().shape({
    name: yup.string().required("Nome é obrigatório"),
    dob: yup.string().required("Data de nascimento é obrigatória"),
    cpf: yup.string().required("CPF é obrigatório"),
    phone: yup.string().required("Telefone é obrigatório"),
  })

  const { control, handleSubmit } = useForm<RegisterFormData>({
    defaultValues: userInfo,
    resolver: yupResolver(schema) as any,
  })

  function onSubmit(data: any) {
    setLoading(true)
    setUserInfo(data)
    router.push("/(auth)/register/StepAddress")
  }

  return (
    <View style={styles.container}>
      <ImageBackground source={fundoBg} style={{ flex: 1 }}>
        <View style={styles.overlay} />
        <SafeAreaView style={{ flex: 1, padding: 16 }}>
          <Header
            title="Dados do Usuário"
            onBackPress={() => router.replace("/(auth)/Signin")}
          />
          <MultiStep
            currentStep={0}
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
                {/* Seção: Dados Pessoais */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>👤</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                  </View>

                  <Input
                    icon="user"
                    placeholder="Nome completo"
                    control={control}
                    name="name"
                    containerStyle={styles.inputContainer}
                    autoCapitalize="words"
                  />

                  <Input
                    icon="calendar"
                    placeholder="Data de Nascimento (DD/MM/AAAA)"
                    control={control}
                    name="dob"
                    visualMask={dateMask}
                    unmask={removeNonNumeric}
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                  />

                  <Input
                    icon="credit-card"
                    placeholder="CPF"
                    control={control}
                    name="cpf"
                    visualMask={cpfMask}
                    unmask={removeNonNumeric}
                    keyboardType="numeric"
                    containerStyle={styles.inputContainer}
                  />
                </View>

                {/* Seção: Contato */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>📱</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Contato</Text>
                  </View>

                  <Input
                    icon="phone"
                    placeholder="Telefone"
                    control={control}
                    name="phone"
                    visualMask={phoneMask}
                    unmask={removeNonNumeric}
                    keyboardType="phone-pad"
                    containerStyle={styles.inputContainer}
                  />
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
