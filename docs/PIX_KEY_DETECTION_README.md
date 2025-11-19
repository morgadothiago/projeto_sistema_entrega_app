# 🔑 Detecção Automática de Chave Pix

## 📋 Descrição

Sistema de detecção automática do tipo de chave Pix baseado no valor digitado pelo usuário. Quando o usuário sai do campo de chave Pix (`onBlur`), o sistema identifica automaticamente se é CPF, CNPJ, Email, Telefone ou Chave Aleatória.

---

## ✨ Funcionamento

### Como Funciona

1. **Usuário digita** a chave Pix no campo
2. **Usuário sai do campo** (onBlur)
3. **Sistema detecta** automaticamente o tipo
4. **Campo "Tipo de Chave"** é preenchido automaticamente

### Fluxo Visual

```
┌─────────────────────────┐
│ [Chave Pix: _________] │ ← Usuário digita
└───────────┬─────────────┘
            │
            ↓ (onBlur)
┌─────────────────────────┐
│  detectPixKeyType()     │ ← Função analisa
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│ [Tipo: CPF ✓]          │ ← Campo preenchido automaticamente
└─────────────────────────┘
```

---

## 🎯 Tipos de Chaves Suportadas

### 1. CPF
**Formato:** 11 dígitos numéricos

**Exemplos válidos:**
- `12345678901`
- `123.456.789-01`

**Regex:** `/^\d{11}$/` (após remover pontuações)

---

### 2. CNPJ
**Formato:** 14 dígitos numéricos

**Exemplos válidos:**
- `12345678000190`
- `12.345.678/0001-90`

**Regex:** `/^\d{14}$/` (após remover pontuações)

**Nota:** CNPJ é verificado ANTES de CPF para evitar falsos positivos

---

### 3. Email
**Formato:** email@dominio.com

**Exemplos válidos:**
- `usuario@exemplo.com`
- `nome.sobrenome@empresa.com.br`
- `contato+tag@site.org`

**Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Nota:** Email é verificado PRIMEIRO por causa do caractere `@`

---

### 4. Telefone
**Formato:** 10 ou 11 dígitos com DDD válido (11-99)

**Exemplos válidos:**
- `11987654321` (celular)
- `1140041234` (fixo)
- `(11) 98765-4321`
- `(11) 4004-1234`

**Validações:**
- DDD entre 11 e 99
- Celular (11 dígitos): terceiro dígito deve ser 9
- Fixo (10 dígitos): sem restrição adicional

**Regex:** `/^\d{10,11}$/` + validação de DDD

---

### 5. Chave Aleatória
**Formato:** UUID ou código alfanumérico de 32+ caracteres

**Exemplos válidos:**
- `123e4567-e89b-12d3-a456-426614174000` (UUID)
- `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (32 chars)

**Validações:**
- UUID padrão (8-4-4-4-12 caracteres hexadecimais)
- Código alfanumérico com 32+ caracteres
- Mistura de letras e números

---

## 💻 Implementação

### Arquivo Utilitário

**Localização:** `app/util/pixKeyDetector.ts`

**Funções principais:**

```typescript
// Detecta o tipo de chave
detectPixKeyType(value: string): PixKeyType | undefined

// Remove caracteres especiais
cleanPixKey(value: string): string

// Valida tipos específicos
isValidCPF(value: string): boolean
isValidCNPJ(value: string): boolean
isValidEmail(value: string): boolean
isValidPhone(value: string): boolean
isValidRandomKey(value: string): boolean

// Formata chaves
formatPixKey(value: string, type: PixKeyType): string

// Helpers
getPixKeyTypeDescription(type: PixKeyType): string
getPixKeyExample(type: PixKeyType): string
```

---

### Uso no Componente

**Arquivo:** `app/(auth)/Payments/index.tsx`

```tsx
import { detectPixKeyType } from "@/app/util/pixKeyDetector"

const handlePixKeyBlur = () => {
  const pixKey = watch("pixKey")
  if (pixKey) {
    const detectedType = detectPixKeyType(pixKey)
    if (detectedType) {
      setValue("pixKeyType", detectedType)
      console.log(`✅ Tipo de chave detectado: ${detectedType}`)
    }
  }
  trigger("pixKey")
}

// No Input
<Input
  control={control}
  name="pixKey"
  placeholder="Chave Pix"
  onBlur={handlePixKeyBlur}
/>
```

---

## 🔍 Ordem de Verificação

**IMPORTANTE:** A ordem das verificações é crucial!

```
1. Email         → Único com @
2. CNPJ (14)     → Antes de CPF para evitar confusão
3. CPF (11)      → Depois de CNPJ
4. Telefone      → Com validação de DDD
5. Chave Aleat.  → Qualquer outra coisa com letras+números
```

**Por que esta ordem?**

- **Email primeiro:** É o único com `@`, fácil de identificar
- **CNPJ antes de CPF:** 14 dígitos vs 11 dígitos - mais específico primeiro
- **Telefone validado:** Precisa de DDD válido brasileiro
- **Chave Aleatória por último:** É o "catch-all" para outros formatos

---

## 📝 Exemplos de Detecção

### Exemplo 1: CPF

```
Input: "12345678901"
Limpo: "12345678901"
Detecção: ✅ CPF (11 dígitos)
Resultado: setValue("pixKeyType", "CPF")
```

### Exemplo 2: CPF Formatado

```
Input: "123.456.789-01"
Limpo: "12345678901"
Detecção: ✅ CPF (11 dígitos)
Resultado: setValue("pixKeyType", "CPF")
```

### Exemplo 3: CNPJ

```
Input: "12.345.678/0001-90"
Limpo: "12345678000190"
Detecção: ✅ CNPJ (14 dígitos)
Resultado: setValue("pixKeyType", "CNPJ")
```

### Exemplo 4: Email

```
Input: "usuario@exemplo.com"
Limpo: (não precisa limpar)
Detecção: ✅ Email (contém @ e domínio)
Resultado: setValue("pixKeyType", "Email")
```

### Exemplo 5: Telefone Celular

```
Input: "(11) 98765-4321"
Limpo: "11987654321"
Detecção: ✅ Telefone (11 dígitos, DDD 11, começa com 9)
Resultado: setValue("pixKeyType", "Telefone")
```

### Exemplo 6: Telefone Fixo

```
Input: "1140041234"
Limpo: "1140041234"
Detecção: ✅ Telefone (10 dígitos, DDD válido)
Resultado: setValue("pixKeyType", "Telefone")
```

### Exemplo 7: UUID

```
Input: "123e4567-e89b-12d3-a456-426614174000"
Limpo: "123e4567e89b12d3a456426614174000"
Detecção: ✅ Chave Aleatória (UUID)
Resultado: setValue("pixKeyType", "Chave Aleatória")
```

### Exemplo 8: Chave Pix Aleatória

```
Input: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
Limpo: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
Detecção: ✅ Chave Aleatória (32 chars alfanuméricos)
Resultado: setValue("pixKeyType", "Chave Aleatória")
```

---

## 🧪 Casos de Teste

### Testes Válidos

| Entrada | Tipo Detectado |
|---------|---------------|
| `12345678901` | CPF |
| `123.456.789-01` | CPF |
| `12345678000190` | CNPJ |
| `12.345.678/0001-90` | CNPJ |
| `user@email.com` | Email |
| `11987654321` | Telefone |
| `(11) 98765-4321` | Telefone |
| `123e4567-e89b-12d3-a456-426614174000` | Chave Aleatória |

### Casos Especiais

| Entrada | Resultado | Motivo |
|---------|-----------|--------|
| `12345678` | ❌ `undefined` | Poucos dígitos |
| `abcdefghij` | ❌ `undefined` | Apenas letras, sem números |
| `1234567890` | ⚠️ `undefined` | DDD inválido (12) |
| `email@` | ❌ `undefined` | Email incompleto |

---

## 🎨 UX/UI Melhorias

### Placeholder Inteligente

```tsx
placeholder="Chave Pix (CPF, CNPJ, Email, Telefone ou Chave Aleatória)"
```

### Select com Dica

```tsx
placeholder="Tipo de Chave Pix (detectado automaticamente)"
```

### Feedback Visual (Futuro)

Pode adicionar:

```tsx
{detectedType && (
  <Text style={{ color: 'green', fontSize: 12 }}>
    ✅ {detectedType} detectado
  </Text>
)}
```

---

## ⚡ Performance

### Otimizações

1. **onBlur ao invés de onChange**
   - Evita processamento desnecessário a cada tecla
   - Melhor UX - usuário termina de digitar primeiro

2. **Regex pré-compiladas**
   - Regexes são compiladas uma vez
   - Reutilizadas em todas as chamadas

3. **Ordem de verificação otimizada**
   - Verificações mais simples primeiro (Email)
   - Verificações complexas por último

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────┐
│ Usuário acessa tela Payments    │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Seleciona "Pix" como pagamento  │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Campo "Chave Pix" aparece       │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Usuário digita chave            │
│ Ex: "user@email.com"            │
└────────────┬────────────────────┘
             │
             ↓ (onBlur - sai do campo)
┌─────────────────────────────────┐
│ handlePixKeyBlur() executado    │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ detectPixKeyType() analisa      │
│ Resultado: "Email"              │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ setValue("pixKeyType", "Email") │
└────────────┬────────────────────┘
             │
             ↓
┌─────────────────────────────────┐
│ Select preenchido com "Email"   │
│ ✅ Detecção concluída           │
└─────────────────────────────────┘
```

---

## 🐛 Tratamento de Erros

### Chave não reconhecida

```tsx
if (!detectedType) {
  console.log("⚠️ Não foi possível detectar o tipo de chave")
  // Campo permanece vazio para usuário escolher manualmente
}
```

### Validação no Submit

O schema Yup valida se:
- Chave Pix foi preenchida
- Tipo de chave foi selecionado (manual ou automático)

---

## 📚 Referências

### Documentação Oficial Pix

- [Especificações Técnicas Pix - Banco Central](https://www.bcb.gov.br/estabilidadefinanceira/pix)
- Tipos de chaves aceitos pelo sistema Pix
- Validações de formato

### Regex101

- [Testar Regex para CPF](https://regex101.com/)
- [Testar Regex para Email](https://regex101.com/)
- [Testar Regex para Telefone](https://regex101.com/)

---

## 🚀 Melhorias Futuras

### 1. Formatação Automática

```tsx
// Formatar automaticamente enquanto digita
const handlePixKeyChange = (text: string) => {
  const formatted = formatPixKey(text, detectedType)
  setValue("pixKey", formatted)
}
```

### 2. Validação em Tempo Real

```tsx
// Mostrar se é válido enquanto digita
const [isValid, setIsValid] = useState<boolean | null>(null)

useEffect(() => {
  const type = detectPixKeyType(pixKey)
  setIsValid(type !== undefined)
}, [pixKey])
```

### 3. Sugestões de Correção

```tsx
// Se detectar formato quase válido, sugerir correção
if (cleanValue.length === 10) {
  Alert.alert("Dica", "CPF deve ter 11 dígitos. Está faltando 1 dígito.")
}
```

### 4. Histórico de Chaves

```tsx
// Salvar últimas chaves usadas
const [recentKeys, setRecentKeys] = useState<string[]>([])

// Autocompletar com chaves recentes
```

---

## ✅ Checklist de Implementação

- [x] Função de detecção criada
- [x] Validações para todos os tipos
- [x] Integração com formulário
- [x] onBlur handler implementado
- [x] Logs de debug
- [x] Documentação completa
- [ ] Testes unitários
- [ ] Formatação automática
- [ ] Feedback visual ao usuário
- [ ] Sugestões de correção

---

## 🎉 Resultado

Agora o usuário pode:

1. ✅ Digitar qualquer tipo de chave Pix
2. ✅ Sistema detecta automaticamente o tipo
3. ✅ Campo de tipo é preenchido automaticamente
4. ✅ Pode corrigir manualmente se necessário
5. ✅ UX melhorada - menos cliques

**Antes:**
- Usuário digita chave
- Usuário seleciona tipo manualmente
- 2 ações necessárias

**Depois:**
- Usuário digita chave
- Tipo detectado automaticamente
- 1 ação necessária ✨
