# 📡 Documentação da API - Sistema de Entregas

Este documento lista todas as chamadas de API usadas no projeto e como implementá-las.

## 🔐 Autenticação

### Login
**Endpoint:** `POST /auth/login`

**Payload:**
```typescript
{
  email: string
  password: string
}
```

**Uso no código:**
```typescript
import { login } from '@/app/service/api'

const response = await login({
  email: "usuario@exemplo.com",
  password: "senha123"
})
```

**Resposta:**
```typescript
{
  token: string
  user: {
    id: string
    name: string
    email: string
    // ... outros campos
  }
}
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L86-L122)

---

### Cadastro de Entregador
**Endpoint:** `POST /auth/signup/deliveryman`

**Payload:**
```typescript
{
  name: string
  email: string
  password: string
  cpf: string
  phone: string
  dob: string
  address: string
  city: string
  state: string
  zipCode: string
  licensePlate: string
  brand: string
  model: string
  year: string
  color: string
  vehicleType: string
}
```

**Uso no código:**
```typescript
import { newAccount } from '@/app/service/api'

const response = await newAccount(userData)
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L124-L214)

---

### Esqueci Minha Senha
**Endpoint:** `POST /auth/password/forgot`

**Payload:**
```typescript
{
  email: string
}
```

**Uso no código:**
```typescript
import { forgotPassword } from '@/app/service/api'

await forgotPassword({ email: "usuario@exemplo.com" })
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L216-L239)

---

### Redefinir Senha
**Endpoint:** `POST /auth/password/reset`

**Payload:**
```typescript
{
  email: string
  newPassword: string
}
```

**Uso no código:**
```typescript
import { resetPassword } from '@/app/service/api'

await resetPassword({
  email: "usuario@exemplo.com",
  newPassword: "novaSenha123"
})
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L241-L267)

---

## 👤 Usuário

### Buscar Dados do Usuário
**Endpoint:** `GET /users/:id`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get(`/users/${userId}`)
const userData = response.data
```

**Resposta:**
```typescript
{
  id: string
  name: string
  email: string
  DeliveryMan: {
    Documents: Array
    BankAccounts: Array
  }
}
```

**Arquivo:** [home.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(tabs)/home.tsx#L104)

---

## 📊 Estatísticas

### Buscar Estatísticas do Entregador
**Endpoint:** `GET /deliveryman/:id/stats`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get(`/deliveryman/${userId}/stats`)
```

**Resposta esperada:**
```typescript
{
  deliveries: {
    pending: number
    completed: number
    total: number
  }
  earnings: {
    today: number
    week: number
    month: number
    goal?: number
  }
  performance: {
    averageDeliveryTime: number
    rating?: number
  }
  balance: {
    available: number
    pending: number
  }
}
```

**Arquivo:** [home.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(tabs)/home.tsx#L191)

---

### Buscar Relatórios
**Endpoint:** `GET /deliveryman/:id/reports`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get(`/deliveryman/${userId}/reports`)
```

**Resposta esperada:**
```typescript
{
  weeklyStats: {
    [day: string]: {
      totalDeliveries: number
      completedDeliveries: number
      pendingDeliveries: number
    }
  }
  summary: {
    totalDeliveries: number
    completedDeliveries: number
    pendingDeliveries: number
  }
  deliveries: Array<{
    id: string
    day: string
    status: string
    // ... outros campos
  }>
}
```

**Arquivo:** [charts.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(tabs)/charts.tsx#L157)

---

## 🚚 Entregas

### Listar Entregas
**Endpoint:** `GET /delivery`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get('/delivery')
const deliveries = response.data
```

**Arquivo:** [delivery.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(tabs)/delivery.tsx#L111)

---

### Buscar Detalhes de uma Entrega
**Endpoint:** `GET /delivery/:id`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get(`/delivery/${deliveryId}`)
const deliveryDetails = response.data
```

**Arquivo:** [deliveryDetails.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(tabs)/Delivery/deliveryDetails.tsx#L41)

---

## 📄 Documentos

### Enviar Documentos
**Endpoint:** `POST /deliveryman/documents`

**Payload:** FormData (multipart/form-data)

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const formData = new FormData()
formData.append('rg', rgFile)
formData.append('cpf', cpfFile)
formData.append('cnh', cnhFile)

const response = await api.post('/deliveryman/documents', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

**Arquivo:** [Documents/index.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(auth)/Documents/index.tsx#L168)

---

## 💰 Pagamentos

### Criar Informações de Pagamento
**Endpoint:** `POST /payment-info`

**Payload:**
```typescript
{
  bankName: string
  accountNumber: string
  agency: string
  pixCode: string
  accountType: string
  holderName: string
}
```

**Uso no código:**
```typescript
import { createPaymentInfo } from '@/app/service/api'

await createPaymentInfo(paymentData)
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L330-L349) | [Payments/index.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(auth)/Payments/index.tsx#L295)

---

## 🚗 Veículos

### Listar Tipos de Veículos
**Endpoint:** `GET /vehicle-types`

**Uso no código:**
```typescript
import { api } from '@/app/service/api'

const response = await api.get('/vehicle-types')
const vehicleTypes = response.data
```

**Arquivo:** [StepVehicles/index.tsx](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/(auth)/register/StepVehicles/index.tsx#L79)

---

## 🔧 Configuração da API

### Base URL
A API está configurada para usar `http://localhost:3000` por padrão.

**Arquivo de configuração:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L75-L83)

### Headers Padrão
```typescript
{
  "Content-Type": "application/json",
  "User-Agent": "IEMobile"
}
```

### Autenticação
O token é automaticamente incluído em todas as requisições via interceptor:

```typescript
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

**Arquivo:** [api.ts](file:///Users/morgado/Desktop/sistema_entregas/mobile/app/service/api.ts#L270-L281)

---

## 📝 Notas Importantes

1. **Timeout:** Todas as requisições têm timeout de 10 segundos
2. **Tratamento de erros:** Errors são tratados globalmente via interceptor
3. **Toast messages:** Sucessos e erros mostram notificações automáticas
4. **Token storage:** JWT é salvo no AsyncStorage após login
5. **Session expiration:** Token expirado (401) faz logout automático

---

## 🎯 Como Adicionar Nova Rota

1. **Adicionar função no `api.ts`:**
```typescript
export async function minhaNovaFuncao(data: any) {
  try {
    const response = await api.post('/minha-rota', data)
    Toast.show({
      type: 'success',
      text1: 'Sucesso!',
      text2: 'Operação concluída'
    })
    return response.data
  } catch (error: any) {
    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: error.response?.data?.message || 'Erro ao processar'
    })
    throw error
  }
}
```

2. **Usar no componente:**
```typescript
import { minhaNovaFuncao } from '@/app/service/api'

const handleSubmit = async () => {
  try {
    await minhaNovaFuncao(formData)
  } catch (error) {
    console.error(error)
  }
}
```
