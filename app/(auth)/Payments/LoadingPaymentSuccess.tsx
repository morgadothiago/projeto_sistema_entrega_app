import React from "react"
import { useRouter } from "expo-router"
import Loading from "@/app/components/Loading"
import CheckIcon from "@/app/assets/check.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading de sucesso exibido após finalizar o cadastro de pagamento
 */
export default function LoadingPaymentSuccess() {
  const router = useRouter()

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      animationSize={{ width: 220, height: 220 }}
      title="Cadastro Concluído com Sucesso!"
      subtitle="Suas informações bancárias foram salvas. Agora você pode receber seus pagamentos."
      loop={false}
    />
  )
}
