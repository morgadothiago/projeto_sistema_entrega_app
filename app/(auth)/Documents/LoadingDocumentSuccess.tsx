import React from "react"
import { useRouter } from "expo-router"
import Loading from "@/app/components/Loading"
import CheckIcon from "@/app/assets/check.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading de sucesso exibido após enviar o documento
 */
export default function LoadingDocumentSuccess() {
  const router = useRouter()

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      animationSize={{ width: 200, height: 200 }}
      title="Documento Enviado com Sucesso!"
      subtitle="Agora você precisa cadastrar suas informações de pagamento."
      loop={false}
      buttons={[
        {
          text: "Cadastrar Forma de Pagamento",
          onPress: () => router.replace("/(auth)/Payments"),
          variant: "primary",
        },
        {
          text: "Voltar para o Login",
          onPress: () => router.replace("/(auth)/Signin"),
          variant: "secondary",
        },
      ]}
    />
  )
}
