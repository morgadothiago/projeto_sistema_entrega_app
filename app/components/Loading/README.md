# Loading Component

Componente de loading dinâmico e reutilizável que suporta diversas configurações.

## Uso Básico

### Loading Simples (apenas animação e logo)

```tsx
import Loading from "@/app/components/Loading"
import LoadingAnimation from "@/app/assets/Loading.json"
import Logo from "@/app/assets/logo.png"
import FundoLogo from "@/app/assets/funndo.png"

export default function SimpleLoading() {
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
```

### Loading com Título e Subtítulo

```tsx
import Loading from "@/app/components/Loading"
import CheckIcon from "@/app/assets/check.json"
import ImageFundo from "@/app/assets/funndo.png"

export default function LoadingWithText() {
  return (
    <Loading
      animation={CheckIcon}
      background={ImageFundo}
      showOverlay
      overlayOpacity={0.5}
      animationSize={{ width: 200, height: 200 }}
      title="Carregando..."
      subtitle="Por favor, aguarde um momento."
    />
  )
}
```

### Loading com Botões

```tsx
import Loading from "@/app/components/Loading"
import { useRouter } from "expo-router"

export default function LoadingWithButtons() {
  const router = useRouter()

  return (
    <Loading
      animation={require("@/app/assets/check.json")}
      background={require("@/app/assets/funndo.png")}
      showOverlay
      title="Cadastro Pendente"
      subtitle="Finalize seu cadastro para continuar."
      buttons={[
        {
          text: "Continuar Cadastro",
          onPress: () => router.push("/register"),
          variant: "primary",
        },
        {
          text: "Sair",
          onPress: () => router.replace("/login"),
          variant: "secondary",
        },
      ]}
    />
  )
}
```

### Loading sem Background

```tsx
import Loading from "@/app/components/Loading"

export default function LoadingNoBackground() {
  return (
    <Loading
      animation={require("@/app/assets/Loading.json")}
      logo={require("@/app/assets/logo.png")}
      title="Processando..."
    />
  )
}
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `animation` | `any` | **obrigatório** | Caminho ou require da animação Lottie |
| `background` | `any` | `undefined` | Caminho ou require do background |
| `logo` | `any` | `undefined` | Caminho ou require do logo |
| `logoSize` | `{width: number, height: number}` | `{width: 100, height: 100}` | Tamanho do logo |
| `title` | `string` | `undefined` | Título principal |
| `subtitle` | `string` | `undefined` | Subtítulo |
| `animationSize` | `{width: number, height: number}` | `{width: 200, height: 200}` | Tamanho da animação |
| `buttons` | `LoadingButton[]` | `[]` | Botões de ação |
| `showOverlay` | `boolean` | `false` | Mostrar overlay escuro |
| `overlayOpacity` | `number` | `0.5` | Opacidade do overlay (0-1) |
| `containerStyle` | `ViewStyle` | `undefined` | Estilo customizado |
| `loop` | `boolean` | `true` | Loop da animação |
| `autoPlay` | `boolean` | `true` | AutoPlay da animação |

## LoadingButton Interface

```typescript
interface LoadingButton {
  text: string
  onPress: () => void
  variant?: "primary" | "secondary"
}
```

## Exemplos de Uso no Projeto

### Como era antes (Loading simples):

```tsx
// app/components/Loading/index.tsx (antigo)
export default function Loading() {
  return (
    <ImageBackground source={FundoLogo} style={styles.fundoImg}>
      <View style={styles.splash}>
        <Image source={Logo} style={styles.logo} />
        <LottieView source={animation} autoPlay loop style={styles.lottie} />
      </View>
    </ImageBackground>
  )
}
```

### Como é agora:

```tsx
<Loading
  animation={require("@/app/assets/Loading.json")}
  background={require("@/app/assets/funndo.png")}
  logo={require("@/app/assets/logo.png")}
  logoSize={{ width: 100, height: 100 }}
  animationSize={{ width: 50, height: 50 }}
/>
```

### Como era antes (LoadingDocuments):

```tsx
// app/(auth)/LoadingDocuments/index.tsx (antigo)
export default function LoadingDocuments() {
  // ... código complexo com muita estrutura
}
```

### Como é agora:

```tsx
<Loading
  animation={CheckIcon}
  background={ImageFundo}
  showOverlay
  overlayOpacity={0.5}
  animationSize={{ width: 200, height: 200 }}
  title={`Olá, ${user?.DeliveryMan?.name}`}
  subtitle="Finalize seu cadastro."
  buttons={[
    { text: "Finalizar", onPress: () => {}, variant: "primary" },
    { text: "Sair", onPress: () => {}, variant: "secondary" },
  ]}
/>
```

## Vantagens

- ✅ **Componente único** para todos os casos de loading
- ✅ **Altamente configurável** com props
- ✅ **Type-safe** com TypeScript
- ✅ **Reutilizável** em todo o projeto
- ✅ **Fácil manutenção** - um único lugar para atualizar
- ✅ **Flexível** - suporta múltiplas variações
