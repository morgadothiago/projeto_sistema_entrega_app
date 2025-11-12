# 🎭 Guia Completo de Máscaras

## 📋 Sumário

1. [Diferença entre Máscara Visual e Valor no Banco](#diferença)
2. [Como Usar](#como-usar)
3. [Exemplos Práticos](#exemplos-práticos)
4. [Console Logs](#console-logs)

---

## 🎯 Diferença entre Máscara Visual e Valor no Banco {#diferença}

### Conceito

O sistema permite que você mostre valores **formatados** para o usuário (com máscara), mas salve valores **limpos** no banco de dados (sem máscara).

### Exemplo

| Tipo | Visual (Usuário vê) | Banco (API recebe) |
|------|---------------------|-------------------|
| CPF | `123.456.789-01` | `12345678901` |
| Telefone | `(11) 98765-4321` | `11987654321` |
| CNPJ | `12.345.678/0001-90` | `12345678000190` |
| Email | `usuario@email.com` | `usuario@email.com` |

---

## 🚀 Como Usar {#como-usar}

### 1. Input com Máscara Visual

Use as props `visualMask` e `unmask` juntas:

```typescript
import { Input } from "@/app/components/Input"
import { applyPixKeyMask, removePixKeyMask } from "@/app/helpers"

<Input
  control={control}
  name="pixKey"
  placeholder="Digite sua chave Pix"
  visualMask={applyPixKeyMask}  // ✅ Aplica máscara VISUAL
  unmask={removePixKeyMask}      // ✅ Remove máscara ao SALVAR
/>
```

**Resultado:**
- **Usuário digita:** `11987654321`
- **Usuário vê:** `(11) 98765-4321` 🎭
- **Salvo no formulário:** `11987654321` 💾

### 2. Input com Máscara Permanente

Use a prop `mask` sozinha:

```typescript
<Input
  control={control}
  name="cpf"
  mask={cpfMask}  // ✅ Aplica máscara E salva com máscara
/>
```

**Resultado:**
- **Usuário digita:** `12345678901`
- **Usuário vê:** `123.456.789-01` 🎭
- **Salvo no formulário:** `123.456.789-01` 💾

### 3. Input sem Máscara

Não use nenhuma prop de máscara:

```typescript
<Input
  control={control}
  name="email"
  placeholder="Email"
/>
```

---

## 💡 Exemplos Práticos {#exemplos-práticos}

### Exemplo 1: Chave Pix com Detecção Automática

```typescript
import { useForm } from "react-hook-form"
import { applyPixKeyMask, removePixKeyMask, detectPixKeyType } from "@/app/helpers"

const { control, watch, setValue } = useForm()
const pixKey = watch("pixKey")
const pixKeyType = watch("pixKeyType")

// Detecta tipo automaticamente
React.useEffect(() => {
  if (pixKey) {
    const tipo = detectPixKeyType(pixKey)
    setValue("pixKeyType", tipo)
  }
}, [pixKey])

// Função para aplicar máscara baseada no tipo
const applyVisualMask = React.useCallback((value: string) => {
  return applyPixKeyMask(value, pixKeyType)
}, [pixKeyType])

// No JSX
<Input
  control={control}
  name="pixKey"
  visualMask={applyVisualMask}
  unmask={removePixKeyMask}
/>
```

**Fluxo Completo:**

1. Usuário digita: `11987654321`
2. Sistema detecta: `Telefone` 🔍
3. Aplica máscara visual: `(11) 98765-4321` 🎭
4. Salva sem máscara: `11987654321` 💾

### Exemplo 2: CPF com Máscara Visual

```typescript
import { cpfMask, removeNonNumeric } from "@/app/helpers"

<Input
  control={control}
  name="cpf"
  placeholder="CPF"
  visualMask={cpfMask}
  unmask={removeNonNumeric}
  keyboardType="numeric"
/>
```

**Resultado:**
```
Digita: 12345678901
Vê: 123.456.789-01
Salva: 12345678901
```

### Exemplo 3: Telefone com Máscara Visual

```typescript
import { phoneMask, removeNonNumeric } from "@/app/helpers"

<Input
  control={control}
  name="telefone"
  placeholder="Telefone"
  visualMask={phoneMask}
  unmask={removeNonNumeric}
  keyboardType="numeric"
/>
```

**Resultado:**
```
Digita: 11987654321
Vê: (11) 98765-4321
Salva: 11987654321
```

### Exemplo 4: CEP com Máscara Visual

```typescript
import { cepMask, removeNonNumeric } from "@/app/helpers"

<Input
  control={control}
  name="cep"
  placeholder="CEP"
  visualMask={cepMask}
  unmask={removeNonNumeric}
  keyboardType="numeric"
/>
```

**Resultado:**
```
Digita: 12345678
Vê: 12345-678
Salva: 12345678
```

---

## 📊 Console Logs {#console-logs}

### Logs ao Detectar Tipo de Chave

```
🔑 Telefone detectado (com DDD) - (11) 98765-4321
```

### Logs ao Enviar Formulário (PIX)

```
==================== DADOS PIX ====================
📤 Enviando para API: {
  "paymentType": "Pix",
  "pixKey": "11987654321",
  "pixKeyType": "Telefone"
}

📊 Comparação de valores:
  🎭 Valor com máscara (visual): (11) 98765-4321
  💾 Valor sem máscara (banco): 11987654321
  🏷️  Tipo detectado: Telefone
==================================================
```

### Logs ao Enviar Formulário (Transferência)

```
============= DADOS TRANSFERÊNCIA =============
📤 Enviando para API: {
  "paymentType": "Transferencia",
  "bankName": "Banco do Brasil",
  "agency": "1234",
  "accountNumber": "12345-6"
}
================================================
```

---

## 🎨 Tabela de Máscaras Disponíveis

| Função | Entrada | Saída Visual | Saída Limpa |
|--------|---------|--------------|-------------|
| `cpfMask` | `12345678901` | `123.456.789-01` | Use `removeNonNumeric` |
| `cnpjMask` | `12345678000190` | `12.345.678/0001-90` | Use `removeNonNumeric` |
| `phoneMask` | `11987654321` | `(11) 98765-4321` | Use `removeNonNumeric` |
| `cepMask` | `12345678` | `12345-678` | Use `removeNonNumeric` |
| `applyPixKeyMask` | `11987654321` | `(11) 98765-4321` | Use `removePixKeyMask` |

---

## 🔧 Funções de Limpeza (Unmask)

| Função | Uso | Mantém |
|--------|-----|--------|
| `removeNonNumeric` | Remove tudo exceto números | Apenas `0-9` |
| `removeMask` | Remove formatação geral | `a-zA-Z0-9@.` |
| `removePixKeyMask` | Remove máscara de chave Pix | Email e UUID intactos |

---

## ✅ Boas Práticas

1. **Use `visualMask` + `unmask`** quando quiser mostrar formatação mas salvar limpo
2. **Use `mask`** quando quiser salvar com formatação
3. **Sempre teste** os dados no console antes de enviar para API
4. **Para chaves Pix**, use sempre `removePixKeyMask` para preservar emails e UUIDs

---

## 🚨 Problemas Comuns

### Problema: "O input está travando ao digitar"

**Solução:** Use debounce na detecção de tipo:

```typescript
const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

const debouncedDetection = useCallback((pixKey: string) => {
  if (debounceTimeout.current) {
    clearTimeout(debounceTimeout.current)
  }
  debounceTimeout.current = setTimeout(() => {
    detectPixKeyType(pixKey)
  }, 500)
}, [])
```

### Problema: "A máscara não está sendo aplicada"

**Solução:** Certifique-se de passar as props corretas:

```typescript
// ❌ Errado
<Input
  control={control}
  name="cpf"
  mask={cpfMask}  // Isso salva COM máscara
/>

// ✅ Correto
<Input
  control={control}
  name="cpf"
  visualMask={cpfMask}          // Mostra com máscara
  unmask={removeNonNumeric}      // Salva SEM máscara
/>
```

---

## 📚 Referências

- [README principal](./README.md)
- [Máscaras](./masks.ts)
- [Detector de Chave Pix](./pixKeyDetector.ts)
