# Helpers - Máscaras e Validações

Este diretório contém helpers para máscaras de input e detecção de tipos de chave Pix.

## 📁 Estrutura

```
helpers/
├── index.ts              # Exportações centralizadas
├── masks.ts              # Máscaras para inputs
├── pixKeyDetector.ts     # Detecção de tipo de chave Pix
└── README.md            # Este arquivo
```

## 🎭 Máscaras Disponíveis

### CPF
```typescript
import { cpfMask } from "@/app/helpers"

const formatted = cpfMask("12345678901")
// Retorna: "123.456.789-01"
```

### CNPJ
```typescript
import { cnpjMask } from "@/app/helpers"

const formatted = cnpjMask("12345678000190")
// Retorna: "12.345.678/0001-90"
```

### Telefone
```typescript
import { phoneMask } from "@/app/helpers"

const celular = phoneMask("11987654321")
// Retorna: "(11) 98765-4321"

const fixo = phoneMask("1134567890")
// Retorna: "(11) 3456-7890"
```

### CEP
```typescript
import { cepMask } from "@/app/helpers"

const formatted = cepMask("12345678")
// Retorna: "12345-678"
```

### CPF ou CNPJ Automático
```typescript
import { cpfCnpjMask } from "@/app/helpers"

const cpf = cpfCnpjMask("12345678901")
// Retorna: "123.456.789-01"

const cnpj = cpfCnpjMask("12345678000190")
// Retorna: "12.345.678/0001-90"
```

## 🔍 Detector de Tipo de Chave Pix

### Uso Básico
```typescript
import { detectPixKeyType, getPixKeyTypeDescription } from "@/app/helpers"

// Detectar tipo
const tipo1 = detectPixKeyType("12345678901")
// Retorna: "CPF"

const tipo2 = detectPixKeyType("11987654321")
// Retorna: "Telefone"

const tipo3 = detectPixKeyType("usuario@email.com")
// Retorna: "Email"

// Obter descrição
const desc = getPixKeyTypeDescription("Telefone")
// Retorna: "Telefone detectado (com DDD)"
```

### Lógica de Detecção

O detector analisa a chave Pix na seguinte ordem de prioridade:

1. **Email**: Se contém `@` e formato válido
2. **Chave Aleatória**: Se é UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
3. **CNPJ**: Se tem 14 dígitos
4. **Telefone**: Se tem 10 ou 11 dígitos + DDD válido (11-99)
   - Celular: 11 dígitos, terceiro dígito = 9
   - Fixo: 10 dígitos
5. **CPF**: Se tem 11 dígitos e NÃO é telefone
6. **Chave Aleatória**: Qualquer outro formato

### Diferenciação CPF vs Telefone

O sistema diferencia corretamente CPF de telefone:

```typescript
// Telefone (DDD 11 + começa com 9)
detectPixKeyType("11987654321")
// ✅ Retorna: "Telefone"

// CPF (não tem padrão de DDD + 9)
detectPixKeyType("12345678901")
// ✅ Retorna: "CPF"
```

## 💡 Exemplos de Uso

### Em um Input com React Hook Form

```typescript
import { useForm } from "react-hook-form"
import { phoneMask } from "@/app/helpers"

const { control } = useForm()

<Input
  control={control}
  name="telefone"
  placeholder="Telefone"
  mask={phoneMask}
/>
```

### Detecção Automática de Chave Pix

```typescript
import { detectPixKeyType } from "@/app/helpers"
import { useForm } from "react-hook-form"

const { watch, setValue } = useForm()
const pixKey = watch("pixKey")

useEffect(() => {
  if (pixKey) {
    const tipo = detectPixKeyType(pixKey)
    setValue("pixKeyType", tipo)
  }
}, [pixKey])
```

## 🧪 Testes

### Exemplos de Chaves e Tipos Detectados

| Chave                                      | Tipo Detectado    |
|-------------------------------------------|-------------------|
| `123.456.789-01`                          | CPF               |
| `12345678901`                             | CPF               |
| `(11) 98765-4321`                         | Telefone          |
| `11987654321`                             | Telefone          |
| `(11) 3456-7890`                          | Telefone          |
| `1134567890`                              | Telefone          |
| `usuario@email.com`                       | Email             |
| `12.345.678/0001-90`                      | CNPJ              |
| `12345678000190`                          | CNPJ              |
| `550e8400-e29b-41d4-a716-446655440000`    | Chave Aleatória   |

## 📝 Notas

- Todas as máscaras removem caracteres não numéricos automaticamente
- O detector de tipo de chave Pix valida DDD (11-99)
- Telefone celular deve ter 11 dígitos com terceiro dígito = 9
- CPF e CNPJ não validam dígitos verificadores (apenas formato)
