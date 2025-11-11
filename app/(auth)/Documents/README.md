# Componentes de Loading para Documentos

Este diretório contém os componentes de loading específicos para o fluxo de envio de documentos.

## Componentes

### 1. LoadingDocument
**Uso:** Exibido durante o upload do documento

```tsx
import LoadingDocument from "@/app/(auth)/Documents/LoadingDocument"

// Exibe loading de upload
<LoadingDocument />
```

**Características:**
- Animação: `Loading.json`
- Overlay escuro (70%)
- Título: "Enviando Documento..."
- Subtítulo: "Aguarde enquanto processamos seu documento."
- Sem botões (não interativo)

---

### 2. LoadingDocumentSuccess
**Uso:** Exibido após enviar com sucesso o documento

```tsx
import LoadingDocumentSuccess from "@/app/(auth)/Documents/LoadingDocumentSuccess"

// Exibe tela de sucesso com botões
<LoadingDocumentSuccess />
```

**Características:**
- Animação: `check.json` (sem loop)
- Overlay escuro (70%)
- Título: "Documento Enviado com Sucesso!"
- Subtítulo: "Agora você precisa cadastrar suas informações de pagamento."
- **Botões:**
  - "Cadastrar Forma de Pagamento" (primário) → Redireciona para pagamento
  - "Voltar para o Login" (secundário) → Redireciona para login

---

## Fluxo de Uso na Tela de Documents

```tsx
import React, { useState } from "react"
import LoadingDocument from "./LoadingDocument"
import LoadingDocumentSuccess from "./LoadingDocumentSuccess"

export default function Documents() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const onSubmit = async (data) => {
    setIsSubmitting(true)

    try {
      // Upload do documento
      await uploadDocument(data)

      setIsSubmitting(false)
      setShowSuccess(true)
    } catch (error) {
      setIsSubmitting(false)
      // Trata erro
    }
  }

  // Mostra loading durante upload
  if (isSubmitting) {
    return <LoadingDocument />
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return <LoadingDocumentSuccess />
  }

  // Renderiza formulário
  return (
    // ... formulário de documentos
  )
}
```

## Estados do Fluxo

```
[Formulário de Documentos]
    ↓ (usuário envia documento)
[LoadingDocument]
    ↓ (Upload completo)
[LoadingDocumentSuccess]
    ↓ (usuário escolhe)
    ├─> [Cadastrar Pagamento]
    └─> [Login]
```

## Integração com o Componente Base

Todos esses componentes usam o `Loading` component unificado:

```tsx
// LoadingDocument.tsx
<Loading
  animation={LoadingAnimation}
  background={FundoLogo}
  showOverlay
  overlayOpacity={0.7}
  title="Enviando Documento..."
  subtitle="Aguarde..."
/>
```

## Fluxo Completo do Cadastro

```
[Login/Registro]
    ↓
[Cadastro de Usuário]
    ↓
[Envio de Documentos] ← Você está aqui
    ↓ (LoadingDocument)
    ↓ (LoadingDocumentSuccess)
    ↓
[Cadastro de Pagamento]
    ↓ (LoadingPayment)
    ↓ (LoadingPaymentSuccess)
    ↓
[Home/Dashboard]
```

## Problemas Corrigidos

### Antes (Com Erro):
```tsx
// ❌ Variável submittedData não definida
{submittedData && (
  <Loading
    animation={CheckIcon}
    showOverlay
    // ... sem background, causava erro
  />
)}
```

### Depois (Corrigido):
```tsx
// ✅ Estados bem definidos e componentes separados
const [isSubmitting, setIsSubmitting] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

if (isSubmitting) return <LoadingDocument />
if (showSuccess) return <LoadingDocumentSuccess />
```

## Customização

### Mudar Textos:
```tsx
<Loading
  title="Seu título customizado"
  subtitle="Seu subtítulo customizado"
  // ... outras props
/>
```

### Mudar Animação:
```tsx
<Loading
  animation={require("@/app/assets/outra-animacao.json")}
  animationSize={{ width: 250, height: 250 }}
  // ... outras props
/>
```

### Mudar Overlay:
```tsx
<Loading
  showOverlay
  overlayOpacity={0.9} // Mais escuro
  // ... outras props
/>
```

### Personalizar Botões:
```tsx
<Loading
  buttons={[
    {
      text: "Continuar",
      onPress: () => handleContinue(),
      variant: "primary"
    },
    {
      text: "Pular",
      onPress: () => handleSkip(),
      variant: "secondary"
    }
  ]}
  // ... outras props
/>
```

## Tratamento de Erros

O componente já trata erros internamente:

```tsx
try {
  await api.post("/deliveryman/documents", formData)
  setShowSuccess(true)
} catch (error) {
  setIsSubmitting(false) // Para o loading
  Toast.show({
    type: "error",
    text1: "Erro!",
    text2: "Ocorreu um erro ao enviar o documento"
  })
}
```

## Upload de Imagens

O componente suporta:
- ✅ Foto da câmera
- ✅ Foto da galeria
- ✅ Preview da imagem
- ✅ Tipos de documentos (RG, CNH)
- ✅ Validação de campos

```tsx
const chooseImageOption = () => {
  Alert.alert("Selecionar Imagem", "Escolha uma opção:", [
    { text: "Tirar foto", onPress: takePhoto },
    { text: "Escolher da galeria", onPress: pickFromGallery },
    { text: "Cancelar", style: "cancel" },
  ])
}
```

## Assets Necessários

Certifique-se de ter estes arquivos no projeto:

- `app/assets/Loading.json` - Animação loading
- `app/assets/check.json` - Animação sucesso
- `app/assets/funndo.png` - Background

## Ver Também

- [Loading Component Base](../../components/Loading/README.md) - Documentação do componente unificado
- [Loading de Pagamento](../Payments/README.md) - Loading para pagamento
- [Loading Examples](../../components/Loading/examples.tsx) - Mais exemplos de uso
