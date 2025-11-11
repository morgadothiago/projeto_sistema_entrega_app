import React from "react"
import Loading from "@/app/components/Loading"
import LoadingAnimation from "@/app/assets/Loading.json"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * Loading exibido durante o upload de documentos
 */
export default function LoadingDocument() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      animationSize={{ width: 150, height: 150 }}
      title="Enviando Documento..."
      subtitle="Aguarde enquanto processamos seu documento."
    />
  )
}
