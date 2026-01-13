import { useAuth } from "@/app/context/AuthContext"
import React from "react"
import { useRouter } from "expo-router"
import Loading from "@/app/components/Loading"

import CheckIcon from "@/app/assets/check.json"
import ImageFundo from "@/app/assets/funndo.png"

export default function LoadingDocuments() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.replace("/(auth)/Signin")
  }

  return (
    <Loading
      animation={CheckIcon}
      background={ImageFundo}
      showOverlay
      overlayOpacity={0.5}
      animationSize={{ width: 200, height: 200 }}
      title={`Olá, ${user?.DeliveryMan?.name} falta pouco para continuar seu cadastro!`}
      subtitle="Por favor, envie seus documentos para finalizar o cadastro."
      buttons={[
        {
          text: "Finalizar Cadastro",
          onPress: () => router.replace("/(auth)/Documents"),
          variant: "primary",
        },
        {
          text: "Voltar para o login",
          onPress: handleLogout,
          variant: "secondary",
        },
      ]}
    />
  )
}
