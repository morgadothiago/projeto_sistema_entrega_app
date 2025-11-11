import React from "react"
import Loading from "@/app/components/Loading"
import PaymentAnimation from "@/app/assets/payment_register.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading exibido quando o usuário está indo para a tela de pagamento
 * ou enquanto carrega as informações bancárias
 */
export default function LoadingPayment() {
  return (
    <Loading
      animation={PaymentAnimation}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.6}
      animationSize={{ width: 200, height: 200 }}
      title="Carregando Informações Bancárias"
      subtitle="Aguarde enquanto preparamos tudo para você..."
    />
  )
}
