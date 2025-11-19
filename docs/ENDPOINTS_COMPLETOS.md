# Endpoints Completos para Remover Fallbacks

Este documento lista **TODOS** os endpoints necessários para que o aplicativo mobile funcione completamente com dados reais, sem fallbacks.

## Índice

1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Entregador](#entregador)
4. [Entregas](#entregas)
5. [Veículos](#veículos)
6. [Pagamentos](#pagamentos)
7. [Prioridade de Implementação](#prioridade-de-implementação)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## Autenticação

### 1. POST `/auth/login`

**Descrição**: Autentica um entregador e retorna um token JWT.

**Usado em**: `app/service/api.ts:42` | `app/(auth)/Signin/index.tsx`

**Request Body**:
```typescript
{
  "email": "entregador@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200)**:
```typescript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "cpf": "12345678900",
    "phone": "11999999999",
    "role": "deliveryman",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

**Resposta de Erro (401)**:
```json
{
  "success": false,
  "message": "Email ou senha inválidos"
}
```

**Validações Backend**:
- Email deve ser válido e existir no banco
- Senha deve corresponder ao hash salvo
- Conta deve estar ativa (não bloqueada/banida)

---

### 2. POST `/auth/signup/deliveryman`

**Descrição**: Cria uma nova conta de entregador.

**Usado em**: `app/service/api.ts:84` | `app/(auth)/register/`

**Request Body**:
```typescript
{
  // Dados pessoais
  "name": "João Silva",
  "dob": "1990-05-15",
  "cpf": "12345678900",
  "phone": "11999999999",
  "email": "joao@exemplo.com",
  "password": "senha123",

  // Endereço
  "address": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310100",

  // Veículo
  "vehicleType": "motorcycle",
  "licensePlate": "ABC1234",
  "brand": "Honda",
  "model": "CG 160",
  "year": "2020",
  "color": "Vermelha"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Conta criada com sucesso",
  "data": {
    "id": "456",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": [
    { "cpf": "CPF já cadastrado" },
    { "email": "Email já está em uso" }
  ]
}
```

**Validações Backend**:
- CPF único (não pode estar cadastrado)
- Email único
- Telefone único
- Placa do veículo única
- Data de nascimento (maior de 18 anos)
- CEP válido
- Senha com mínimo 6 caracteres

---

### 3. POST `/auth/password/forgot`

**Descrição**: Solicita código de recuperação de senha por email.

**Usado em**: `app/(auth)/ForgotPassword/sendEmail/index.tsx:67`

**Request Body**:
```typescript
{
  "email": "joao@exemplo.com"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Código de recuperação enviado para o email"
}
```

**Resposta de Erro (404)**:
```json
{
  "success": false,
  "message": "Email não encontrado"
}
```

**Lógica Backend**:
1. Verificar se email existe no banco
2. Gerar código de 6 dígitos (ex: "123456")
3. Salvar código com expiração de 15 minutos
4. Enviar email com o código
5. Retornar sucesso (mesmo que email não exista, por segurança)

---

### 4. POST `/auth/password/reset`

**Descrição**: Redefine a senha usando o código recebido por email.

**Usado em**: `app/service/api.ts:173` | `app/(auth)/ForgotPassword/ConfirmNewPassword/index.tsx:80`

**Request Body**:
```typescript
{
  "email": "joao@exemplo.com",
  "code": "123456",
  "newPassword": "novaSenha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": "Código inválido ou expirado"
}
```

**Validações Backend**:
- Código deve corresponder ao enviado por email
- Código não pode estar expirado (máximo 15 minutos)
- Nova senha deve ter mínimo 6 caracteres
- Apagar código após uso bem-sucedido

---

## Usuários

### 5. GET `/users/{id}`

**Descrição**: Retorna dados completos de um usuário/entregador.

**Usado em**: `app/(tabs)/home.tsx:104`

**Autenticação**: Obrigatória

**Parâmetros de URL**:
- `id` (string): ID do usuário

**Headers**:
```
Authorization: Bearer {token}
```

**Resposta de Sucesso (200)**:
```typescript
{
  "id": "123",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "cpf": "12345678900",
  "phone": "11999999999",
  "dob": "1990-05-15",
  "createdAt": "2024-01-15T10:00:00Z",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310100"
  },
  "DeliveryMan": {
    "id": "dm123",
    "userId": "123",
    "status": "active",
    "rating": 4.8,
    "totalDeliveries": 350,
    "vehicle": {
      "type": "motorcycle",
      "licensePlate": "ABC1234",
      "brand": "Honda",
      "model": "CG 160",
      "year": "2020",
      "color": "Vermelha"
    },
    "documents": {
      "cnh": {
        "status": "approved",
        "url": "https://..."
      },
      "rg": {
        "status": "approved",
        "url": "https://..."
      }
    },
    "paymentInfo": {
      "pixKey": "joao@exemplo.com",
      "pixKeyType": "EMAIL"
    }
  }
}
```

**Resposta de Erro (404)**:
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

**Validações Backend**:
- Token deve ser válido
- Usuário autenticado só pode ver seus próprios dados (id do token == id da URL)

---

## Entregador

### 6. GET `/deliveryman/{id}/stats`

**Descrição**: Retorna estatísticas do entregador (usado no dashboard/home).

**Usado em**: `app/(tabs)/home.tsx:191`

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
  "totalDeliveries": 350,
  "completedDeliveries": 320,
  "pendingDeliveries": 25,
  "cancelledDeliveries": 5,
  "totalEarnings": 17500.00,
  "currentBalance": 5430.00,
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
    },
    {
      "month": "2024-03",
      "deliveries": 95,
      "earnings": 4750.00
    }
  ]
}
```

**Tipo TypeScript**: `DeliverymanStatsResponse` (em `app/types/api.ts:94`)

**Cálculos Backend**:
- `totalDeliveries`: COUNT de todas as entregas
- `completedDeliveries`: COUNT onde status = "delivered"
- `pendingDeliveries`: COUNT onde status IN ("pending", "in_transit")
- `cancelledDeliveries`: COUNT onde status = "cancelled"
- `totalEarnings`: SUM de todos os valores das entregas concluídas
- `currentBalance`: Total ganho - saques realizados
- `averageRating`: AVG das avaliações recebidas
- `monthlyStats`: Agrupado por mês (últimos 3 meses)

---

### 7. GET `/deliveryman/{id}/reports`

**Descrição**: Retorna relatórios detalhados da semana com dados para gráficos.

**Usado em**: `app/(tabs)/charts.tsx:133`

**Autenticação**: Obrigatória

**Parâmetros de URL**:
- `id` (string): ID do entregador

**Query Parameters (Opcional)**:
- `startDate` (string): Data inicial (ISO 8601)
- `endDate` (string): Data final (ISO 8601)
- Se não fornecidos, usar semana atual (domingo a sábado)

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
    "tuesday": {
      "dayOfWeek": "tuesday",
      "hourlyData": [20, 35, 25, 55, 70, 40],
      "totalDeliveries": 245,
      "completedDeliveries": 230,
      "pendingDeliveries": 15
    },
    "wednesday": {
      "dayOfWeek": "wednesday",
      "hourlyData": [35, 60, 40, 85, 100, 55],
      "totalDeliveries": 375,
      "completedDeliveries": 350,
      "pendingDeliveries": 25
    },
    "thursday": {
      "dayOfWeek": "thursday",
      "hourlyData": [40, 65, 45, 90, 105, 60],
      "totalDeliveries": 405,
      "completedDeliveries": 380,
      "pendingDeliveries": 25
    },
    "friday": {
      "dayOfWeek": "friday",
      "hourlyData": [45, 70, 50, 95, 110, 65],
      "totalDeliveries": 435,
      "completedDeliveries": 410,
      "pendingDeliveries": 25
    },
    "saturday": {
      "dayOfWeek": "saturday",
      "hourlyData": [50, 75, 55, 100, 115, 70],
      "totalDeliveries": 465,
      "completedDeliveries": 440,
      "pendingDeliveries": 25
    }
  },
  "summary": {
    "totalDeliveries": 2515,
    "completedDeliveries": 2340,
    "pendingDeliveries": 175,
    "totalEarnings": 12587.50
  },
  "deliveries": [
    {
      "id": "del001",
      "code": "ENT-2024-0001",
      "status": "delivered",
      "day": "sunday",
      "customerName": "Maria Santos",
      "address": "Rua Augusta, 1000, São Paulo - SP",
      "value": 45.50,
      "createdAt": "2024-11-17T10:30:00Z",
      "deliveredAt": "2024-11-17T11:15:00Z",
      "description": "Entrega de documentos"
    },
    {
      "id": "del002",
      "code": "ENT-2024-0002",
      "status": "in_transit",
      "day": "monday",
      "customerName": "Carlos Oliveira",
      "address": "Av. Paulista, 2000, São Paulo - SP",
      "value": 78.00,
      "createdAt": "2024-11-18T09:00:00Z",
      "description": "Entrega de eletrônicos"
    }
  ]
}
```

**Tipo TypeScript**: `ReportsResponse` (em `app/types/api.ts:122`)

**Campo `hourlyData` - Explicação**:
Array de 6 valores representando entregas por período:
- Índice 0: 00h-04h
- Índice 1: 04h-08h
- Índice 2: 08h-12h
- Índice 3: 12h-16h
- Índice 4: 16h-20h
- Índice 5: 20h-24h

**Cálculos Backend**:
1. Buscar todas as entregas da semana atual
2. Agrupar por dia da semana
3. Para cada dia, agrupar por período de 4 horas
4. Calcular totais e subtotais
5. Normalizar status ("delivered" → "completed", "in_transit" → "in_progress")

---

### 8. POST `/deliveryman/documents`

**Descrição**: Upload de documentos do entregador (CNH, RG, foto veículo, etc).

**Usado em**: `app/(auth)/Documents/index.tsx:168`

**Autenticação**: Obrigatória

**Content-Type**: `multipart/form-data`

**Request Body (FormData)**:
```typescript
{
  "file": <binary>,
  "documentType": "CNH" | "RG" | "CPF" | "COMPROVANTE_RESIDENCIA" | "FOTO_VEICULO",
  "documentNumber": "12345678900", // Opcional
  "fullName": "João Silva", // Opcional
  "issueDate": "2020-01-15", // Opcional
  "expirationDate": "2030-01-15" // Opcional
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Documento enviado com sucesso",
  "data": {
    "documentId": "doc123",
    "documentType": "CNH",
    "status": "pending_review",
    "url": "https://s3.amazonaws.com/bucket/documents/doc123.jpg",
    "uploadedAt": "2024-11-19T10:00:00Z"
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": "Arquivo muito grande. Máximo 5MB."
}
```

**Validações Backend**:
- Arquivo deve ser imagem (JPG, PNG) ou PDF
- Tamanho máximo: 5MB
- Apenas um documento de cada tipo por entregador
- Salvar em storage (S3, Google Cloud Storage, etc.)
- Criar registro no banco com status "pending_review"

---

## Entregas

### 9. GET `/delivery`

**Descrição**: Lista todas as entregas atribuídas ao entregador autenticado.

**Usado em**:
- `app/(tabs)/delivery.tsx:28`
- `app/(tabs)/deliveryDetails.tsx:28`
- `app/(tabs)/Delivery/deliveryDetails.tsx:41`

**Autenticação**: Obrigatória

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters (Opcional)**:
- `status` (string): Filtrar por status ("pending", "in_transit", "delivered", "cancelled")
- `code` (string): Buscar por código específico (usado em deliveryDetails)
- `page` (number): Número da página (paginação)
- `limit` (number): Itens por página (padrão: 20)

**Resposta de Sucesso (200)**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": "order001",
      "code": "ENT-2024-0001",
      "status": "in_transit",
      "customer": {
        "name": "Maria Santos",
        "phone": "11987654321",
        "address": {
          "street": "Rua Augusta",
          "number": "1000",
          "complement": "Sala 12",
          "neighborhood": "Consolação",
          "city": "São Paulo",
          "state": "SP",
          "zipCode": "01305000",
          "coordinates": {
            "latitude": -23.5505,
            "longitude": -46.6333
          }
        }
      },
      "pickup": {
        "address": "Av. Paulista, 2000, São Paulo - SP",
        "coordinates": {
          "latitude": -23.5613,
          "longitude": -46.6565
        },
        "scheduledTime": "2024-11-19T10:00:00Z"
      },
      "delivery": {
        "scheduledTime": "2024-11-19T11:00:00Z",
        "estimatedTime": "2024-11-19T11:15:00Z"
      },
      "items": [
        {
          "description": "Documentos importantes",
          "quantity": 1,
          "weight": "0.5kg"
        }
      ],
      "value": 45.50,
      "paymentMethod": "credit_card",
      "notes": "Entregar apenas para o destinatário",
      "createdAt": "2024-11-19T09:00:00Z",
      "updatedAt": "2024-11-19T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Tipo TypeScript**: `ApiOrder` (em `app/types/order.ts`)

**Lógica Backend**:
1. Extrair ID do entregador do token JWT
2. Buscar entregas WHERE deliverymanId = {id}
3. Aplicar filtros (status, code) se fornecidos
4. Ordenar por data de criação (mais recentes primeiro)
5. Implementar paginação
6. Retornar com metadados de paginação

---

### 10. PATCH `/delivery/{id}/status`

**Descrição**: Atualiza o status de uma entrega (iniciar, concluir, cancelar).

**Usado em**: `app/(tabs)/deliveryDetails.tsx` (botões de ação)

**Autenticação**: Obrigatória

**Parâmetros de URL**:
- `id` (string): ID da entrega

**Request Body**:
```typescript
{
  "status": "in_transit" | "delivered" | "cancelled",
  "latitude": -23.5505, // Opcional - localização atual
  "longitude": -46.6333, // Opcional
  "notes": "Cliente não estava no local", // Opcional
  "photo": "base64..." // Opcional - comprovante de entrega
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Status atualizado com sucesso",
  "data": {
    "id": "order001",
    "code": "ENT-2024-0001",
    "status": "delivered",
    "deliveredAt": "2024-11-19T11:15:00Z"
  }
}
```

**Resposta de Erro (403)**:
```json
{
  "success": false,
  "message": "Esta entrega não está atribuída a você"
}
```

**Validações Backend**:
- Entrega deve pertencer ao entregador autenticado
- Transição de status deve ser válida:
  - `pending` → `in_transit`
  - `in_transit` → `delivered` ou `cancelled`
  - Não permitir voltar status
- Salvar timestamp de cada mudança de status
- Atualizar histórico de rastreamento

---

## Veículos

### 11. GET `/vehicle-types`

**Descrição**: Retorna lista de tipos de veículos disponíveis.

**Usado em**: `app/(auth)/register/StepVehicles/index.tsx:79`

**Autenticação**: Não obrigatória (endpoint público)

**Resposta de Sucesso (200)**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": "motorcycle",
      "name": "Motocicleta",
      "description": "Ideal para entregas rápidas em áreas urbanas",
      "icon": "🏍️",
      "capacityKg": 50,
      "active": true
    },
    {
      "id": "bicycle",
      "name": "Bicicleta",
      "description": "Sustentável e ágil no trânsito",
      "icon": "🚴",
      "capacityKg": 20,
      "active": true
    },
    {
      "id": "car",
      "name": "Carro",
      "description": "Para entregas maiores",
      "icon": "🚗",
      "capacityKg": 300,
      "active": true
    },
    {
      "id": "van",
      "name": "Van",
      "description": "Grande capacidade de carga",
      "icon": "🚐",
      "capacityKg": 1000,
      "active": true
    }
  ]
}
```

**Lógica Backend**:
- Retornar apenas tipos ativos
- Ordenar por popularidade ou alfabeticamente

---

## Pagamentos

### 12. POST `/payment-info`

**Descrição**: Salva informações de pagamento PIX do entregador.

**Usado em**:
- `app/service/api.ts:256`
- `app/(auth)/Payments/index.tsx:295`

**Autenticação**: Obrigatória

**Request Body**:
```typescript
{
  "pixKey": "joao@exemplo.com",
  "pixKeyType": "EMAIL" | "CPF" | "CNPJ" | "PHONE" | "RANDOM"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Informações de pagamento salvas com sucesso",
  "data": {
    "id": "pay123",
    "pixKey": "joao@exemplo.com",
    "pixKeyType": "EMAIL",
    "verifiedAt": null,
    "createdAt": "2024-11-19T10:00:00Z"
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": "Chave PIX inválida para o tipo selecionado"
}
```

**Validações Backend**:
- Validar formato da chave PIX de acordo com o tipo:
  - `EMAIL`: Validar email
  - `CPF`: Validar CPF (11 dígitos)
  - `CNPJ`: Validar CNPJ (14 dígitos)
  - `PHONE`: Validar telefone (+55...)
  - `RANDOM`: Validar formato UUID
- Permitir apenas uma chave PIX ativa por entregador
- Opcional: Integrar com API do Banco Central para validar chave

---

### 13. GET `/deliveryman/{id}/balance`

**Descrição**: Retorna saldo atual e histórico de transações do entregador.

**Usado em**: `app/(tabs)/home.tsx` (para exibir saldo)

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
  "currentBalance": 5430.00,
  "totalEarned": 17500.00,
  "totalWithdrawn": 12070.00,
  "pendingBalance": 0.00,
  "transactions": [
    {
      "id": "txn001",
      "type": "earning",
      "amount": 45.50,
      "description": "Entrega ENT-2024-0001 concluída",
      "status": "completed",
      "createdAt": "2024-11-19T11:15:00Z"
    },
    {
      "id": "txn002",
      "type": "withdrawal",
      "amount": -500.00,
      "description": "Saque via PIX",
      "status": "completed",
      "pixKey": "joao@exemplo.com",
      "createdAt": "2024-11-18T14:00:00Z"
    }
  ]
}
```

**Cálculos Backend**:
- `currentBalance`: Total ganho - total sacado
- `totalEarned`: SUM de todas as entregas concluídas
- `totalWithdrawn`: SUM de todos os saques
- `pendingBalance`: Valor de entregas concluídas ainda não liberadas (ex: período de análise)

---

### 14. POST `/deliveryman/withdraw`

**Descrição**: Solicita saque do saldo para a chave PIX cadastrada.

**Usado em**: Futura tela de carteira/wallet

**Autenticação**: Obrigatória

**Request Body**:
```typescript
{
  "amount": 500.00,
  "pixKey": "joao@exemplo.com" // Deve corresponder à chave cadastrada
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Solicitação de saque realizada com sucesso",
  "data": {
    "withdrawalId": "wd001",
    "amount": 500.00,
    "pixKey": "joao@exemplo.com",
    "status": "processing",
    "estimatedDate": "2024-11-20T10:00:00Z",
    "createdAt": "2024-11-19T15:00:00Z"
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": "Saldo insuficiente. Disponível: R$ 450.00"
}
```

**Validações Backend**:
- Saldo disponível >= valor solicitado
- Valor mínimo de saque (ex: R$ 10,00)
- Chave PIX deve estar cadastrada e verificada
- Limite de saques por dia (ex: 3 saques/dia)
- Criar registro de transação
- Integrar com processador de pagamentos

---

## Prioridade de Implementação

Para remover os fallbacks de forma incremental, implemente nesta ordem:

### Fase 1: Essencial (Sem isso o app não funciona)
1. ✅ POST `/auth/login` - Login
2. ✅ POST `/auth/signup/deliveryman` - Registro
3. ✅ GET `/users/{id}` - Dados do usuário
4. ✅ GET `/vehicle-types` - Tipos de veículos

### Fase 2: Core Features (Funcionalidades principais)
5. ✅ GET `/delivery` - Lista de entregas
6. ✅ PATCH `/delivery/{id}/status` - Atualizar status
7. ✅ GET `/deliveryman/{id}/stats` - Estatísticas (home)
8. ✅ POST `/payment-info` - Cadastro PIX

### Fase 3: Features Avançadas (Melhorias)
9. ✅ GET `/deliveryman/{id}/reports` - Relatórios (charts)
10. ✅ POST `/deliveryman/documents` - Upload documentos
11. ✅ POST `/auth/password/forgot` - Recuperar senha
12. ✅ POST `/auth/password/reset` - Reset senha

### Fase 4: Wallet/Financeiro (Futuro)
13. ⏳ GET `/deliveryman/{id}/balance` - Saldo e transações
14. ⏳ POST `/deliveryman/withdraw` - Saque

---

## Checklist de Implementação

Use este checklist para cada endpoint:

### Backend
- [ ] Criar rota no servidor (Express, NestJS, etc.)
- [ ] Implementar autenticação JWT (middleware)
- [ ] Validar permissões (usuário só acessa seus dados)
- [ ] Implementar validação de dados (Joi, Zod, class-validator)
- [ ] Criar/atualizar models no banco de dados
- [ ] Implementar lógica de negócio
- [ ] Testar com Postman/Insomnia
- [ ] Adicionar logs de erro e debug
- [ ] Documentar no Swagger/OpenAPI
- [ ] Implementar rate limiting (proteção DDoS)
- [ ] Testar casos de erro (400, 401, 403, 404, 500)

### Frontend (App Mobile)
- [ ] Remover código de fallback/mock
- [ ] Testar integração com API real
- [ ] Implementar loading states
- [ ] Implementar tratamento de erros
- [ ] Adicionar pull-to-refresh onde aplicável
- [ ] Testar offline behavior (se aplicável)
- [ ] Validar tipos TypeScript
- [ ] Remover console.logs de debug
- [ ] Testar em iOS e Android

### QA
- [ ] Testar fluxo completo end-to-end
- [ ] Validar performance (tempo de resposta)
- [ ] Testar com dados reais
- [ ] Validar segurança (OWASP top 10)
- [ ] Testar edge cases
- [ ] Validar responsividade mobile

---

## Endpoints Adicionais (Sugeridos)

Estes endpoints não são usados atualmente mas podem ser úteis:

### 15. GET `/deliveryman/{id}/history`
Histórico completo de entregas com filtros avançados

### 16. POST `/deliveryman/availability`
Atualizar disponibilidade (online/offline)

### 17. GET `/notifications`
Listar notificações push

### 18. PATCH `/notifications/{id}/read`
Marcar notificação como lida

### 19. POST `/support/ticket`
Criar ticket de suporte

### 20. GET `/deliveryman/{id}/ratings`
Ver avaliações recebidas

---

## Variáveis de Ambiente

Configure no backend:

```bash
# API
PORT=3000
NODE_ENV=production
API_URL=https://api.seuapp.com

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_db
DB_USER=admin
DB_PASS=senha_segura

# JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# AWS S3 (Upload de documentos)
AWS_ACCESS_KEY_ID=sua_key
AWS_SECRET_ACCESS_KEY=sua_secret
AWS_BUCKET_NAME=delivery-documents
AWS_REGION=us-east-1

# Email (Recuperação de senha)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@seuapp.com
SMTP_PASS=senha_email

# PIX (Pagamentos)
PIX_PROVIDER_API_KEY=key_do_provedor
PIX_PROVIDER_URL=https://api.provedor.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Configure no app mobile (`app.config.js` ou `.env`):

```bash
API_URL=https://api.seuapp.com
API_TIMEOUT=10000
GOOGLE_MAPS_API_KEY=sua_key_do_maps
SENTRY_DSN=https://...@sentry.io/...
```

---

## Diagrama de Fluxo de Dados

```
┌─────────────────┐
│   App Mobile    │
│   (React Native)│
└────────┬────────┘
         │
         │ HTTPS
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (Load Balance)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│   (Node.js)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────┐  ┌──────────┐
│  DB  │  │  Storage │
│(SQL) │  │   (S3)   │
└──────┘  └──────────┘
```

---

## Segurança

### Headers de Segurança Obrigatórios

```javascript
// Backend (Express.js exemplo)
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
})
app.use('/api/', limiter)
```

### Validação de Token JWT

```javascript
// Middleware de autenticação
async function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token não fornecido'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    })
  }
}
```

### Proteção de Dados Sensíveis

- ❌ NUNCA retornar senhas (mesmo hasheadas)
- ✅ Hashear senhas com bcrypt (salt rounds >= 10)
- ✅ Validar CPF/CNPJ no backend
- ✅ Sanitizar inputs para prevenir SQL Injection
- ✅ Validar tipos de arquivo no upload
- ✅ Criptografar dados sensíveis em repouso

---

## Monitoramento e Logs

### Logs Essenciais

```javascript
// Exemplo com Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'combined.log'
    })
  ]
})

// Log de requisições
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id
  })
  next()
})
```

### Métricas Importantes

- Tempo de resposta médio por endpoint
- Taxa de erro (4xx, 5xx)
- Número de requisições por minuto
- Uso de CPU/memória
- Tempo de query do banco de dados

---

## Testes

### Exemplo de Teste de Endpoint

```javascript
// Jest + Supertest
describe('GET /deliveryman/:id/stats', () => {
  it('should return stats for authenticated deliveryman', async () => {
    const response = await request(app)
      .get('/deliveryman/123/stats')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)

    expect(response.body).toHaveProperty('totalDeliveries')
    expect(response.body).toHaveProperty('currentBalance')
    expect(response.body.totalDeliveries).toBeGreaterThanOrEqual(0)
  })

  it('should return 401 without token', async () => {
    await request(app)
      .get('/deliveryman/123/stats')
      .expect(401)
  })

  it('should return 403 for other deliveryman data', async () => {
    await request(app)
      .get('/deliveryman/456/stats')
      .set('Authorization', `Bearer ${validTokenForUser123}`)
      .expect(403)
  })
})
```

---

## Suporte

Para dúvidas sobre implementação:

1. Consulte os tipos TypeScript em `app/types/api.ts`
2. Veja exemplos de uso nos componentes
3. Revise a documentação completa em `API_ENDPOINTS_SPEC.md`

---

**Última atualização**: 2025-11-19
**Versão**: 2.0
**Total de Endpoints**: 14 implementados + 6 sugeridos
