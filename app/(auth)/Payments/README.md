# Componentes de Loading para Pagamentos

Este diretório contém os componentes de loading específicos para o fluxo de pagamentos.

## Componentes

### 1. LoadingPayment
**Uso:** Exibido enquanto carrega ou processa informações bancárias

```tsx
import LoadingPayment from "@/app/(auth)/Payments/LoadingPayment"

// Exibe loading de carregamento
<LoadingPayment />
```

**Características:**
- Animação: `payment_register.json`
- Overlay escuro (60%)
- Título: "Carregando Informações Bancárias"
- Subtítulo: "Aguarde enquanto preparamos tudo para você..."

---

### 2. LoadingPaymentSuccess
**Uso:** Exibido após finalizar com sucesso o cadastro de pagamento

```tsx
import LoadingPaymentSuccess from "@/app/(auth)/Payments/LoadingPaymentSuccess"

// Exibe tela de sucesso com botões
<LoadingPaymentSuccess />
```

**Características:**
- Animação: `check.json` (sem loop)
- Overlay escuro (70%)
- Título: "Cadastro Concluído com Sucesso!"
- Subtítulo: "Suas informações bancárias foram salvas..."
- **Botões:**
  - "Ir para Home" (primário) → Redireciona para home
  - "Ver Minha Carteira" (secundário) → Redireciona para carteira

---

## Fluxo de Uso na Tela de Cadastro

```tsx
import React, { useState } from "react"
import LoadingPayment from "./LoadingPayment"
import LoadingPaymentSuccess from "./LoadingPaymentSuccess"

export default function Payments() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      // Chama API para salvar dados
      await savePaymentInfo(data)

      setIsSubmitting(false)
      setShowSuccess(true)
    } catch (error) {
      setIsSubmitting(false)
      // Trata erro
    }
  }

  // Mostra loading enquanto processa
  if (isSubmitting) {
    return <LoadingPayment />
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return <LoadingPaymentSuccess />
  }

  // Renderiza formulário
  return (
    // ... formulário de pagamento
  )
}
```

## Estados do Fluxo

```
[Formulário]
    ↓ (usuário clica em enviar)
[LoadingPayment]
    ↓ (API responde com sucesso)
[LoadingPaymentSuccess]
    ↓ (usuário clica em um botão)
[Home ou Carteira]
```

## Integração com o Componente Base

Todos esses componentes usam o `Loading` component unificado:

```tsx
// LoadingPayment.tsx
<Loading
  animation={PaymentAnimation}
  background={FundoLogo}
  showOverlay
  overlayOpacity={0.6}
  title="Carregando..."
  subtitle="Aguarde..."
/>
```

## Customização

Para criar variações, você pode:

1. **Mudar a animação:**
```tsx
<Loading
  animation={require("@/app/assets/outra-animacao.json")}
  // ... outras props
/>
```

2. **Ajustar textos:**
```tsx
<Loading
  title="Seu título customizado"
  subtitle="Seu subtítulo customizado"
  // ... outras props
/>
```

3. **Adicionar/remover botões:**
```tsx
<Loading
  buttons={[
    { text: "OK", onPress: () => {}, variant: "primary" }
  ]}
  // ... outras props
/>
```

4. **Ajustar overlay:**
```tsx
<Loading
  showOverlay
  overlayOpacity={0.9} // Mais escuro
  // ... outras props
/>
```

## Assets Necessários

Certifique-se de ter estes arquivos no projeto:

- `app/assets/payment_register.json` - Animação de pagamento
- `app/assets/check.json` - Animação de sucesso
- `app/assets/funndo.png` - Background

## Ver Também

- [Loading Component Base](../../components/Loading/README.md) - Documentação do componente unificado
- [Loading Examples](../../components/Loading/examples.tsx) - Mais exemplos de uso
