import { useAuth } from "@/app/context/AuthContext"
import LottieView from "lottie-react-native"
import React from "react"
import { Pressable, Text, View } from "react-native"
import { styles } from "./styles"

import CheckIcon from "@/app/assets/check.json"
import ImageFundo from "@/app/assets/funndo.png"
import { ImageBackground } from "expo-image"
import { useRouter } from "expo-router"

export default function LoadingDocuments({ navigation }: any) {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <ImageBackground source={ImageFundo} style={styles.imageFundoContaier}>
        <View style={styles.overlay} />
        {/* ANIMAÇÃO */}
        <LottieView
          source={CheckIcon}
          autoPlay
          loop
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />

        {/* TEXTOS */}
        <View
          style={{
            marginBottom: 20,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            paddingHorizontal: 50,
          }}
        >
          <Text style={styles.title}>
            Olá, {user?.name} falta pouco para continuar seu cadastro!
          </Text>

          <Text style={styles.subtitle}>
            Por favor, envie seus documentos para finalizar o cadastro.
          </Text>
        </View>

        {/* BOTÃO */}
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/(auth)/Documents")}
        >
          <Text style={styles.buttonText}>Finalizar Cadastro</Text>
        </Pressable>
      </ImageBackground>
    </View>
  )
}
