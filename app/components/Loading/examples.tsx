/**
 * Exemplos de uso do componente Loading unificado
 *
 * Este arquivo contém vários exemplos de como usar o componente Loading
 * em diferentes situações.
 */

import React from "react"
import Loading from "./index"
import { useRouter } from "expo-router"

// Importações dos assets
import LoadingAnimation from "@/app/assets/Loading.json"
import CheckIcon from "@/app/assets/check.json"
import Logo from "@/app/assets/logo.png"
import FundoLogo from "@/app/assets/funndo.png"

/**
 * EXEMPLO 1: Loading Simples
 * Apenas logo e animação, como era o componente Loading original
 */
export function SimpleLoading() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      logo={Logo}
      logoSize={{ width: 100, height: 100 }}
      animationSize={{ width: 50, height: 50 }}
    />
  )
}

/**
 * EXEMPLO 2: Loading com Título
 * Loading com mensagem personalizada
 */
export function LoadingWithTitle() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      logo={Logo}
      title="Carregando seus dados..."
      animationSize={{ width: 80, height: 80 }}
    />
  )
}

/**
 * EXEMPLO 3: Loading Completo com Botões
 * Como era o LoadingDocuments, com título, subtítulo e botões
 */
export function LoadingWithButtons() {
  const router = useRouter()

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.5}
      animationSize={{ width: 200, height: 200 }}
      title="Bem-vindo de volta!"
      subtitle="Complete seu cadastro para continuar."
      buttons={[
        {
          text: "Continuar Cadastro",
          onPress: () => router.push("/(auth)/Documents"),
          variant: "primary",
        },
        {
          text: "Voltar ao Login",
          onPress: () => router.replace("/(auth)/Signin"),
          variant: "secondary",
        },
      ]}
    />
  )
}

/**
 * EXEMPLO 4: Loading sem Background
 * Loading minimalista sem imagem de fundo
 */
export function LoadingMinimal() {
  return (
    <Loading
      animation={LoadingAnimation}
      logo={Logo}
      animationSize={{ width: 60, height: 60 }}
    />
  )
}

/**
 * EXEMPLO 5: Loading com Overlay Forte
 * Loading com overlay escuro para destacar o conteúdo
 */
export function LoadingWithStrongOverlay() {
  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.8}
      title="Processando..."
      subtitle="Isso pode levar alguns segundos."
      animationSize={{ width: 150, height: 150 }}
    />
  )
}

/**
 * EXEMPLO 6: Loading de Sucesso
 * Loading mostrando mensagem de sucesso
 */
export function LoadingSuccess() {
  const router = useRouter()

  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      title="Cadastro Concluído!"
      subtitle="Seu cadastro foi realizado com sucesso."
      animationSize={{ width: 180, height: 180 }}
      loop={false}
      buttons={[
        {
          text: "Ir para Home",
          onPress: () => router.replace("/(tabs)/home"),
          variant: "primary",
        },
      ]}
    />
  )
}

/**
 * EXEMPLO 7: Loading de Erro
 * Loading mostrando mensagem de erro com opções
 */
export function LoadingError() {
  const handleRetry = () => {
    // Retry logic here
  }

  const handleCancel = () => {
    // Cancel logic here
  }

  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      showOverlay
      title="Ops! Algo deu errado"
      subtitle="Não foi possível completar a operação."
      buttons={[
        {
          text: "Tentar Novamente",
          onPress: handleRetry,
          variant: "primary",
        },
        {
          text: "Cancelar",
          onPress: handleCancel,
          variant: "secondary",
        },
      ]}
    />
  )
}

/**
 * EXEMPLO 8: Loading Customizado
 * Loading com tamanhos personalizados
 */
export function LoadingCustom() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      logo={Logo}
      logoSize={{ width: 150, height: 150 }}
      animationSize={{ width: 100, height: 100 }}
      title="Processando Pagamento"
      subtitle="Aguarde enquanto processamos sua transação."
      showOverlay
      overlayOpacity={0.6}
    />
  )
}

/**
 * EXEMPLO 9: Loading sem Logo
 * Apenas animação e texto
 */
export function LoadingWithoutLogo() {
  return (
    <Loading
      animation={CheckIcon}
      background={FundoLogo}
      showOverlay
      title="Carregando Entregas..."
      subtitle="Buscando suas entregas recentes."
      animationSize={{ width: 120, height: 120 }}
    />
  )
}

/**
 * EXEMPLO 10: Loading de Upload
 * Loading para processo de upload de documentos
 */
export function LoadingUpload() {
  return (
    <Loading
      animation={LoadingAnimation}
      background={FundoLogo}
      showOverlay
      overlayOpacity={0.7}
      title="Enviando Documentos..."
      subtitle="Por favor, não feche o aplicativo."
      animationSize={{ width: 100, height: 100 }}
      loop={true}
      autoPlay={true}
    />
  )
}
