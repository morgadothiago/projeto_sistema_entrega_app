# Componentes de Loading para Carteira/Saques

Este diretório contém os componentes de loading para operações na carteira (saques).

## Componentes

### 1. LoadingWithdraw
**Uso:** Exibido durante o processamento de um saque

```tsx
import LoadingWithdraw from "@/app/(tabs)/LoadingWithdraw"

// Exibe loading de processamento
<LoadingWithdraw />
```

**Características:**
- Animação: `Loading.json`
- Overlay escuro (80%)
- Título: "Processando seu Saque"
- Subtítulo: "Aguarde enquanto processamos sua solicitação..."
- Sem botões (não interativo)

---

### 2. LoadingWithdrawSuccess
**Uso:** Exibido após processar com sucesso um saque

```tsx
import LoadingWithdrawSuccess from "@/app/(tabs)/LoadingWithdrawSuccess"

// Exibe tela de sucesso que fecha automaticamente
<LoadingWithdrawSuccess
  value="R$ 1.000,00"
  onFinish={() => console.log("Fechou")}
/>
```

**Props:**
- `value` (string) - Valor do saque a ser exibido
- `onFinish` (function) - Callback chamado após 3 segundos

**Características:**
- Animação: `check.json` (sem loop)
- Overlay escuro (70%)
- Título: "Saque Realizado com Sucesso!"
- Subtítulo dinâmico com o valor
- **Auto-fecha após 3 segundos**
- Sem botões (fecha automaticamente)

---

## Fluxo de Uso na Tela de Carteira

```tsx
import React, { useState } from "react"
import LoadingWithdraw from "./LoadingWithdraw"
import LoadingWithdrawSuccess from "./LoadingWithdrawSuccess"

export default function Payments() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [withdrawValue, setWithdrawValue] = useState("")

  const handleConfirmPayment = async (paymentData) => {
    setWithdrawValue(paymentData.value)
    setIsLoading(true)

    try {
      // Processa o saque
      await processWithdraw(paymentData)

      setIsLoading(false)
      setShowSuccess(true)
    } catch (error) {
      setIsLoading(false)
      // Trata erro
    }
  }

  const handleSuccessFinish = () => {
    setShowSuccess(false)
    // Recarrega dados, limpa lista, etc.
  }

  // Mostra loading de processamento
  if (isLoading) {
    return <LoadingWithdraw />
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return (
      <LoadingWithdrawSuccess
        value={withdrawValue}
        onFinish={handleSuccessFinish}
      />
    )
  }

  // Renderiza a carteira
  return (
    // ... tela da carteira
  )
}
```

## Estados do Fluxo

```
[Carteira]
    ↓ (usuário confirma saque)
[LoadingWithdraw]
    ↓ (API responde com sucesso)
[LoadingWithdrawSuccess]
    ↓ (fecha automaticamente após 3s)
[Carteira] (atualizada)
```

## Diferenças entre Cadastro e Saque

| Aspecto | Cadastro de Pagamento | Saque |
|---------|----------------------|-------|
| **Loading** | LoadingPayment | LoadingWithdraw |
| **Success** | LoadingPaymentSuccess | LoadingWithdrawSuccess |
| **Overlay** | 60% / 70% | 80% / 70% |
| **Botões** | Sim (2 botões) | Não (auto-fecha) |
| **Tempo** | Permanece até interação | Fecha em 3s |
| **Navegação** | Redireciona para outras telas | Volta para mesma tela |
| **Props** | Nenhuma | value, onFinish |

## Auto-fechamento

O componente `LoadingWithdrawSuccess` usa um `useEffect` para fechar automaticamente:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    onFinish()
  }, 3000)

  return () => clearTimeout(timer)
}, [onFinish])
```

## Customização

### Mudar o tempo de auto-fechamento:

```tsx
// LoadingWithdrawSuccess.tsx
const timer = setTimeout(() => {
  onFinish()
}, 5000) // 5 segundos ao invés de 3
```

### Adicionar botão (remover auto-fechamento):

```tsx
<Loading
  animation={CheckIcon}
  background={FundoLogo}
  showOverlay
  title="Saque Realizado!"
  subtitle={`Valor: ${value}`}
  loop={false}
  buttons={[
    {
      text: "OK",
      onPress: onFinish,
      variant: "primary"
    }
  ]}
/>
```

### Mudar intensidade do overlay:

```tsx
<Loading
  showOverlay
  overlayOpacity={0.9} // Mais escuro
  // ... outras props
/>
```

## Comparação com Implementação Anterior

### Antes (Modal + ActivityIndicator):

```tsx
<Modal transparent visible={isLoading}>
  <View style={styles.overlay}>
    <View style={styles.loaderBox}>
      <ActivityIndicator size="large" />
      <Text>Processando...</Text>
    </View>
  </View>
</Modal>
```

### Depois (Loading Component):

```tsx
{isLoading && <LoadingWithdraw />}
```

**Vantagens:**
- Código mais limpo e declarativo
- Animação Lottie ao invés de ActivityIndicator
- Consistência visual com resto do app
- Reutilizável e customizável
- TypeScript type-safe

## Assets Necessários

Certifique-se de ter estes arquivos no projeto:

- `app/assets/Loading.json` - Animação de loading
- `app/assets/check.json` - Animação de sucesso
- `app/assets/funndo.png` - Background

## Ver Também

- [Loading Component Base](../components/Loading/README.md) - Documentação do componente unificado
- [Loading de Cadastro](../(auth)/Payments/README.md) - Loading para cadastro de pagamento
- [Loading Examples](../components/Loading/examples.tsx) - Mais exemplos de uso
