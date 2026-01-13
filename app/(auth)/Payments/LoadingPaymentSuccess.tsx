import React from "react"
import { useRouter } from "expo-router"
import { useAuth } from "@/app/context/AuthContext"
import Loading from "@/app/components/Loading"
import CheckIcon from "@/app/assets/check.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading de sucesso exibido após finalizar o cadastro de pagamento
 */
export default function LoadingPaymentSuccess() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleBackToLogin = async () => {
    // Faz logout para forçar novo login e verificação de status
    await signOut()
    router.replace("/(auth)/Signin")
  }

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      animationSize={{ width: 220, height: 220 }}
      title="Cadastro Concluído com Sucesso!"
      subtitle="Seus documentos estão em análise. Você será notificado quando forem aprovados."
      loop={false}
      buttons={[
        {
          text: "Voltar para o Login",
          onPress: handleBackToLogin,
          variant: "primary",
        },
      ]}
    />
  )
}
