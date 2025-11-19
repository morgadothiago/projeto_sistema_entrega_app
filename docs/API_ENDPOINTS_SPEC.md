# Especificação de Endpoints da API

Este documento descreve todos os endpoints que o aplicativo mobile espera consumir. Use este documento como guia para implementar a API backend.

## Índice

1. [Configuração Base](#configuração-base)
2. [Autenticação](#autenticação)
3. [Endpoint de Relatórios](#endpoint-de-relatórios)
4. [Endpoint de Estatísticas](#endpoint-de-estatísticas)
5. [Comportamento de Fallback](#comportamento-de-fallback)
6. [Tipos TypeScript](#tipos-typescript)

---

## Configuração Base

**Base URL configurada no app**: Definida em `app/service/api.ts`

```typescript
// O app usa axios com a base URL configurada
import { api } from '../service/api'

// Exemplo de chamada:
const response = await api.get('/deliveryman/123/reports', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

---

## Autenticação

Todos os endpoints protegidos devem aceitar o header de autenticação:

```
Authorization: Bearer {token}
```

O token é obtido do `AuthContext` e armazenado após login.

---

## Endpoint de Relatórios

### 1. GET `/deliveryman/{id}/reports`

**Descrição**: Retorna relatórios semanais de entregas para um entregador específico.

**Usado em**: `app/(tabs)/charts.tsx:108`

**Autenticação**: Obrigatória

**Parâmetros de URL**:
- `id` (string): ID do entregador

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**:

```typescript
{
  "weeklyStats": {
    "sunday": {
      "dayOfWeek": "sunday",
      "hourlyData": [30, 50, 35, 70, 80, 50],
      "totalDeliveries": 315,
      "completedDeliveries": 280,
      "pendingDeliveries": 35
    },
    "monday": {
      "dayOfWeek": "monday",
      "hourlyData": [25, 40, 30, 60, 75, 45],
      "totalDeliveries": 275,
      "completedDeliveries": 250,
      "pendingDeliveries": 25
    },
    // ... outros dias da semana
  },
  "summary": {
    "totalDeliveries": 2100,
    "completedDeliveries": 1950,
    "pendingDeliveries": 150,
    "totalEarnings": 15750.50
  },
  "deliveries": [
    {
      "id": "1",
      "code": "ENT-2024-0001",
      "status": "delivered",
      "day": "sunday",
      "customerName": "João Silva",
      "address": "Rua das Flores, 123, São Paulo - SP",
      "value": 45.50,
      "createdAt": "2024-07-21T10:30:00Z",
      "description": "Entrega de documentos",
      "date": "2024-07-21"
    },
    // ... outras entregas
  ]
}
```

**Tipo TypeScript**: `ReportsResponse` (definido em `app/types/api.ts:122`)

**Campos Detalhados**:

#### `weeklyStats`
- Objeto com chaves para cada dia da semana: `"sunday"`, `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`
- Cada dia contém:
  - `dayOfWeek` (string): Nome do dia em inglês
  - `hourlyData` (number[]): Array com 6 valores representando entregas por período do dia (00-04h, 04-08h, 08-12h, 12-16h, 16-20h, 20-24h)
  - `totalDeliveries` (number): Total de entregas no dia
  - `completedDeliveries` (number): Entregas concluídas no dia
  - `pendingDeliveries` (number): Entregas pendentes no dia

#### `summary`
- `totalDeliveries` (number): Total de entregas na semana
- `completedDeliveries` (number): Total de entregas concluídas na semana
- `pendingDeliveries` (number): Total de entregas pendentes na semana
- `totalEarnings` (number): Total ganho na semana em reais

#### `deliveries`
Array de objetos com:
- `id` (string): ID único da entrega
- `code` (string): Código da entrega (ex: "ENT-2024-0001")
- `status` (string): Status da entrega. Valores aceitos:
  - `"delivered"` ou `"completed"` → convertido para "completed"
  - `"in_transit"` ou `"in_progress"` → convertido para "in_progress"
  - `"pending"` → mantido como "pending"
- `day` (string): Dia da semana em inglês ("sunday", "monday", etc.)
- `customerName` (string): Nome do cliente
- `address` (string): Endereço completo de entrega
- `value` (number): Valor da entrega em reais
- `createdAt` (string): Data/hora de criação (ISO 8601)
- `description` (string, opcional): Descrição da entrega
- `date` (string, opcional): Data da entrega (formato ISO ou "YYYY-MM-DD")

**Resposta de Erro (404)**:

```json
{
  "success": false,
  "message": "Endpoint não implementado",
  "error": "NOT_IMPLEMENTED"
}
```

**Comportamento Atual no App**:
- Se retornar 404, o app exibe uma mensagem: "Endpoint ainda não implementado. Usando dados de exemplo."
- Os dados mock são usados como fallback
- Ver função `fetchReportsData()` em `app/(tabs)/charts.tsx:97`

---

## Endpoint de Estatísticas

### 2. GET `/deliveryman/{id}/stats`

**Descrição**: Retorna estatísticas gerais do entregador.

**Usado em**: Tela home (`app/(tabs)/home.tsx`)

**Autenticação**: Obrigatória

**Parâmetros de URL**:
- `id` (string): ID do entregador

**Resposta de Sucesso (200)**:

```typescript
{
  "totalDeliveries": 350,
  "completedDeliveries": 320,
  "pendingDeliveries": 25,
  "cancelledDeliveries": 5,
  "totalEarnings": 17500.00,
  "averageRating": 4.8,
  "monthlyStats": [
    {
      "month": "2024-01",
      "deliveries": 120,
      "earnings": 6000.00
    },
    {
      "month": "2024-02",
      "deliveries": 135,
      "earnings": 6750.00
    }
  ]
}
```

**Tipo TypeScript**: `DeliverymanStatsResponse` (definido em `app/types/api.ts:94`)

---

## Comportamento de Fallback

### Como o App Lida com Endpoints Não Implementados

O app está preparado para funcionar mesmo quando os endpoints ainda não estão prontos:

1. **Dados Mock**: Arquivos em `app/mocks/` fornecem dados de exemplo
   - `deliveriesData.ts`: Lista de entregas de exemplo

2. **Detecção de 404**: Quando um endpoint retorna 404:
   ```typescript
   if (err.response?.status === 404) {
     logger.warn("Endpoint de relatórios não encontrado, usando mock")
     setError("Endpoint ainda não implementado. Usando dados de exemplo.")
     // Usa dados mock
   }
   ```

3. **Mensagem ao Usuário**: Um banner amarelo é exibido informando:
   ```
   ℹ️ Endpoint ainda não implementado. Usando dados de exemplo.
   ```

4. **Funcionalidade Preservada**: Todas as features funcionam normalmente com dados mock

### Transição de Mock para API Real

Quando um endpoint for implementado:

1. **Nenhuma mudança no código do app é necessária**
2. O app automaticamente detecta que o endpoint está disponível (não retorna 404)
3. Os dados da API substituem os dados mock
4. A mensagem de aviso dessome automaticamente

---

## Tipos TypeScript

Todos os tipos estão definidos em `app/types/api.ts`. Os principais são:

### ReportsResponse
```typescript
export interface ReportsResponse {
  weeklyStats: {
    [key: string]: DailyStatsResponse;
  };
  summary: {
    totalDeliveries: number;
    completedDeliveries: number;
    pendingDeliveries: number;
    totalEarnings: number;
  };
  deliveries: Array<DeliveryFromAPI>;
}
```

### DailyStatsResponse
```typescript
export interface DailyStatsResponse {
  dayOfWeek: string;
  hourlyData: number[];
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
}
```

### DeliveryFromAPI
```typescript
export interface DeliveryFromAPI {
  id: string;
  code: string;
  status: string;
  day: string;
  customerName: string;
  address: string;
  value: number;
  createdAt: string;
  description?: string;
  date?: string;
}
```

### DeliverymanStatsResponse
```typescript
export interface DeliverymanStatsResponse {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  monthlyStats?: {
    month: string;
    deliveries: number;
    earnings: number;
  }[];
}
```

---

## Conversão de Dados

### Normalização de Status

O app normaliza os status retornados pela API usando a função `normalizeStatus()` em `app/(tabs)/charts.tsx:33`:

```typescript
const normalizeStatus = (status: string): "completed" | "pending" | "in_progress" => {
  const statusLower = status.toLowerCase()
  if (statusLower === "delivered" || statusLower === "completed") {
    return "completed"
  }
  if (statusLower === "in_transit" || statusLower === "in_progress") {
    return "in_progress"
  }
  return "pending"
}
```

**Mapeamento**:
- `"delivered"` → `"completed"`
- `"completed"` → `"completed"`
- `"in_transit"` → `"in_progress"`
- `"in_progress"` → `"in_progress"`
- Qualquer outro valor → `"pending"`

### Mapeamento de Entregas

A função `mapApiDeliveryToDeliveryItem()` converte dados da API para o formato usado nos componentes:

```typescript
const mapApiDeliveryToDeliveryItem = (apiDelivery: DeliveryFromAPI): DeliveryItem => {
  return {
    id: apiDelivery.id,
    code: apiDelivery.code,
    status: normalizeStatus(apiDelivery.status),
    day: apiDelivery.day,
    customerName: apiDelivery.customerName,
    address: apiDelivery.address,
    value: apiDelivery.value,
    description: apiDelivery.description || `Entrega para ${apiDelivery.customerName}`,
    date: apiDelivery.date || apiDelivery.createdAt,
  }
}
```

---

## Exemplos de Uso no Código

### Fazendo uma Requisição

```typescript
import { api } from '../service/api'
import { useAuth } from '../context/AuthContext'
import type { ReportsResponse } from '../types/api'

const { user, token } = useAuth()

const fetchData = async () => {
  try {
    const response = await api.get<ReportsResponse>(
      `/deliveryman/${user.id}/reports`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = response.data
    // Use os dados...

  } catch (err: any) {
    if (err.response?.status === 404) {
      // Endpoint não implementado, usar mock
    } else {
      // Outro erro
    }
  }
}
```

### Usando o Hook useFetch

```typescript
import { useFetch } from '../hooks/useFetch'
import type { ReportsResponse } from '../types/api'

const { data, loading, error, refetch } = useFetch<ReportsResponse>(
  `/deliveryman/${user.id}/reports`,
  {
    enabled: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    onSuccess: (data) => {
      console.log('Dados carregados:', data)
    },
    onError: (error) => {
      console.error('Erro ao carregar:', error)
    },
  }
)
```

---

## Checklist de Implementação Backend

Para implementar cada endpoint, siga este checklist:

- [ ] Criar rota no backend (ex: `GET /deliveryman/:id/reports`)
- [ ] Implementar autenticação via Bearer token
- [ ] Validar permissões (usuário só pode ver seus próprios dados)
- [ ] Buscar dados do banco de dados
- [ ] Formatar resposta conforme o tipo TypeScript especificado
- [ ] Testar com dados reais
- [ ] Documentar possíveis erros (400, 401, 403, 404, 500)
- [ ] Adicionar logs no backend
- [ ] Validar performance (resposta em menos de 2 segundos)
- [ ] Testar integração com o app mobile

---

## Suporte

Se tiver dúvidas sobre algum endpoint ou tipo de dados:

1. Verifique os tipos em `app/types/api.ts`
2. Veja exemplos de uso em `app/(tabs)/charts.tsx`
3. Consulte os dados mock em `app/mocks/deliveriesData.ts`

---

**Última atualização**: 2025-11-19
**Versão do documento**: 1.0
