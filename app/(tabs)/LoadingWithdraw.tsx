import React from "react"
import Loading from "@/app/components/Loading"
import LoadingAnimation from "@/app/assets/Loading.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading exibido durante o processamento de saque
 */
export default function LoadingWithdraw() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.8}
      animationSize={{ width: 150, height: 150 }}
      title="Processando seu Saque"
      subtitle="Aguarde enquanto processamos sua solicitação..."
    />
  )
}
