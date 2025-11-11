import React, { useEffect } from "react"
import Loading from "@/app/components/Loading"
import CheckIcon from "@/app/assets/check.json"
import FundoLogo from "@/app/assets/funndo.png"

interface LoadingWithdrawSuccessProps {
  value: string
  onFinish: () => void
}

/**
 * Loading de sucesso exibido após processar o saque
 * Fecha automaticamente após 3 segundos
 */
export default function LoadingWithdrawSuccess({
  value,
  onFinish,
}: LoadingWithdrawSuccessProps) {
  useEffect(() => {
    // Auto fecha após 3 segundos
    const timer = setTimeout(() => {
      onFinish()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      animationSize={{ width: 180, height: 180 }}
      title="Saque Realizado com Sucesso!"
      subtitle={`Valor de ${value} foi solicitado. O valor estará disponível em até 2 dias úteis.`}
      loop={false}
    />
  )
}
