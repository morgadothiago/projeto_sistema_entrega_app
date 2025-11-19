# 📚 Guia de Migração - Sistema de Entregas Mobile

Este guia ajudará você a migrar seu código para usar os novos utilitários, componentes e padrões implementados.

## 📋 Índice

1. [Mudanças na Estrutura](#mudanças-na-estrutura)
2. [Novos Arquivos Criados](#novos-arquivos-criados)
3. [Arquivos Deprecados](#arquivos-deprecados)
4. [Como Migrar](#como-migrar)
5. [Breaking Changes](#breaking-changes)
6. [Exemplos de Migração](#exemplos-de-migração)

---

## 🏗️ Mudanças na Estrutura

### Antes
```
app/
├── util/
│   ├── masks.ts
│   ├── pixKeyDetector.ts
│   └── nomalizer.ts
├── helpers/
│   ├── masks.ts (DUPLICADO)
│   ├── pixKeyDetector.ts (DUPLICADO)
│   └── Storage.ts
```

### Depois
```
app/
├── utils/              # ✅ NOVO - Consolidado
│   ├── logger.ts       # ✅ NOVO
│   ├── constants.ts    # ✅ NOVO
│   ├── masks.ts        # ✅ Atualizado e consolidado
│   ├── pixKeyDetector.ts  # ✅ Atualizado e consolidado
│   └── normalizer.ts   # ✅ Renomeado (era nomalizer.ts)
├── hooks/              # ✅ NOVO
│   ├── useFetch.ts
│   └── index.ts
├── types/
│   └── api.ts          # ✅ NOVO - Tipos para API
├── components/
│   ├── ErrorBoundary/  # ✅ NOVO
│   └── UserWrapper/    # ✅ Renomeado (era UserWarpper)
```

---

## 📦 Novos Arquivos Criados

### 1. `utils/logger.ts`
Logger centralizado para toda a aplicação.

**Uso:**
```typescript
import { logger } from '@/app/utils/logger';

// Log simples
logger.log('Mensagem de log');

// Log com contexto
logger.info('Usuário autenticado', {
  context: 'AuthContext',
  data: { userId: user.id }
});

// Erro
logger.error('Erro ao buscar dados', error, {
  context: 'Home',
  data: { endpoint: '/users' }
});

// API
logger.api('GET', '/users', 200, responseData);
```

### 2. `utils/constants.ts`
Constantes centralizadas (substitui magic numbers).

**Uso:**
```typescript
import {
  Z_INDEX,
  FLATLIST_CONFIG,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  REGEX,
  PIX_KEY_TYPES
} from '@/app/utils/constants';

// Modal com z-index
<View style={{ zIndex: Z_INDEX.MODAL }}>

// FlatList otimizado
<FlatList
  maxToRenderPerBatch={FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
  windowSize={FLATLIST_CONFIG.WINDOW_SIZE}
/>

// Mensagens de erro
Toast.show({
  text2: ERROR_MESSAGES.FETCH_DELIVERIES
});
```

### 3. `hooks/useFetch.ts`
Custom hook para requisições HTTP.

**Uso:**
```typescript
import { useFetch, useMutation } from '@/app/hooks';

// GET request
const { data, loading, error, refetch } = useFetch('/users/1', {
  enabled: true,
  onSuccess: (data) => console.log('Success!', data),
  onError: (error) => console.error('Error:', error)
});

// POST request
const { mutate, loading } = useMutation('post', '/users');
await mutate({ name: 'João', email: 'joao@example.com' });
```

### 4. `types/api.ts`
Tipos TypeScript para requisições/respostas da API.

**Uso:**
```typescript
import type {
  NewAccountData,
  DocumentUploadData,
  PaymentInfoData,
  ApiResponse
} from '@/app/types/api';

// Função com tipagem correta
async function createAccount(data: NewAccountData): Promise<ApiResponse> {
  // ...
}
```

### 5. `components/ErrorBoundary/`
Componente para capturar erros não tratados.

**Uso:**
```typescript
import ErrorBoundary from '@/app/components/ErrorBoundary';

// No _layout.tsx ou App root
<ErrorBoundary onError={(error, info) => {
  // Enviar para Sentry/Crashlytics
}}>
  <YourApp />
</ErrorBoundary>
```

### 6. `components/UserWrapper/`
Componente renomeado e corrigido (era `UserWarpper`).

**Uso:**
```typescript
import UserWrapper from '@/app/components/UserWrapper';

<UserWrapper
  deliveryMan={user.DeliveryMan}
  avatarSource={avatarUri}
  balance={1250.50}  // ✅ Agora dinâmico!
  loadingBalance={loading}
/>
```

---

## ⚠️ Arquivos Deprecados

Os seguintes arquivos foram **CONSOLIDADOS** e devem ser deletados:

### ❌ Remover:
- `app/util/masks.ts` → Use `app/utils/masks.ts`
- `app/util/pixKeyDetector.ts` → Use `app/utils/pixKeyDetector.ts`
- `app/util/nomalizer.ts` → Use `app/utils/normalizer.ts`
- `app/helpers/masks.ts` (duplicata)
- `app/helpers/pixKeyDetector.ts` (duplicata)
- `app/components/UserWarpper/` → Use `app/components/UserWrapper/`

---

## 🔄 Como Migrar

### Passo 1: Atualizar Imports

#### Antes:
```typescript
import { PhoneMask, CPFMask } from '../util/masks';
import { detectPixKeyType } from '../helpers/pixKeyDetector';
import { normalizeData } from '../util/nomalizer';
```

#### Depois:
```typescript
import { phoneMask, cpfMask } from '@/app/utils/masks';
import { detectPixKeyType } from '@/app/utils/pixKeyDetector';
import { normalizeData } from '@/app/utils/normalizer';
import { logger } from '@/app/utils/logger';
import { ERROR_MESSAGES } from '@/app/utils/constants';
```

### Passo 2: Substituir console.log por logger

#### Antes:
```typescript
try {
  const response = await api.get('/users');
  console.log('Dados:', response.data);
} catch (error) {
  console.error('Erro:', error);
}
```

#### Depois:
```typescript
import { logger } from '@/app/utils/logger';
import { ERROR_MESSAGES } from '@/app/utils/constants';
import Toast from 'react-native-toast-message';

try {
  logger.info('Buscando usuários', { context: 'Home' });
  const response = await api.get('/users');
  logger.api('GET', '/users', response.status, response.data);
} catch (error) {
  logger.error('Erro ao buscar usuários', error, { context: 'Home' });

  Toast.show({
    type: 'error',
    text1: 'Erro',
    text2: ERROR_MESSAGES.FETCH_USER
  });
}
```

### Passo 3: Substituir Magic Numbers

#### Antes:
```typescript
<View style={{ zIndex: 1000 }}>

<FlatList
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={5}
/>
```

#### Depois:
```typescript
import { Z_INDEX, FLATLIST_CONFIG } from '@/app/utils/constants';

<View style={{ zIndex: Z_INDEX.MODAL }}>

<FlatList
  maxToRenderPerBatch={FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
  updateCellsBatchingPeriod={FLATLIST_CONFIG.UPDATE_CELLS_BATCHING_PERIOD}
  windowSize={FLATLIST_CONFIG.WINDOW_SIZE}
/>
```

### Passo 4: Usar Tipos Corretos nas APIs

#### Antes:
```typescript
export async function newAccount(data: any) {  // ❌
  return api.post('/register', data);
}
```

#### Depois:
```typescript
import type { NewAccountData, ApiResponse } from '@/app/types/api';

export async function newAccount(data: NewAccountData): Promise<ApiResponse> {
  return api.post('/register', data);
}
```

### Passo 5: Atualizar Componente UserWrapper

#### Antes:
```typescript
import UserWarpper from '@/app/components/UserWarpper';

<UserWarpper
  deliveryMan={user.DeliveryMan}
  avatarSource={avatarUri}
/>
// Exibia "R$ 1000.000" fixo ❌
```

#### Depois:
```typescript
import UserWrapper from '@/app/components/UserWrapper';

<UserWrapper
  deliveryMan={user.DeliveryMan}
  avatarSource={avatarUri}
  balance={user.balance || 0}  // ✅ Dinâmico
  loadingBalance={loading}
/>
```

---

## 💥 Breaking Changes

### 1. Funções de Máscara Renomeadas

| Antes | Depois |
|-------|--------|
| `PhoneMask()` | `phoneMask()` OU `PhoneMask()` (alias mantido) |
| `CPFMask()` | `cpfMask()` OU `CPFMask()` (alias mantido) |
| `maskDate()` | `dateMask()` OU `maskDate()` (alias mantido) |

### 2. Normalizer Renomeado

| Antes | Depois |
|-------|--------|
| `util/nomalizer.ts` | `utils/normalizer.ts` |

### 3. PIX Key Types

| Antes | Depois |
|-------|--------|
| `"Email"` | `"EMAIL"` |
| `"Telefone"` | `"PHONE"` |
| `"Chave Aleatória"` | `"RANDOM"` |

Use as constantes:
```typescript
import { PIX_KEY_TYPES } from '@/app/utils/constants';

// Ao invés de: "EMAIL"
// Use: PIX_KEY_TYPES.EMAIL
```

---

## 📝 Exemplos de Migração

### Exemplo 1: Tela de Entrega

**Antes:**
```typescript
import { api } from "../service/api"

const getAllDeliverys = async () => {
  try {
    const response = await api.get("/delivery", {
      headers: { Authorization: `Bearer ${token}` },
    })
    setOrders(response.data.data)
  } catch (error) {
    // ❌ Erro silenciado
  }
}

<FlatList
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

**Depois:**
```typescript
import { api } from "../service/api"
import { logger } from "../utils/logger"
import { ERROR_MESSAGES, FLATLIST_CONFIG } from "../utils/constants"
import Toast from "react-native-toast-message"

const getAllDeliverys = useCallback(async () => {
  try {
    setLoading(true)
    logger.info('Buscando entregas', { context: 'Delivery' })

    const response = await api.get("/delivery", {
      headers: { Authorization: `Bearer ${token}` },
    })

    setOrders(response.data.data)
  } catch (error) {
    logger.error('Erro ao buscar entregas', error, { context: 'Delivery' })

    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: ERROR_MESSAGES.FETCH_DELIVERIES,
    })
  } finally {
    setLoading(false)
  }
}, [token])

<FlatList
  maxToRenderPerBatch={FLATLIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
  windowSize={FLATLIST_CONFIG.WINDOW_SIZE}
/>
```

### Exemplo 2: Cadastro com Validação

**Antes:**
```typescript
import { normalizeData } from '../util/nomalizer';

async function handleSubmit(data: any) {  // ❌ any
  try {
    const normalized = normalizeData(userInfo, accessData);
    await api.post('/register', normalized);
  } catch (error) {
    console.log(error);  // ❌
  }
}
```

**Depois:**
```typescript
import { normalizeData } from '@/app/utils/normalizer';
import type { UserInfo, AccessData } from '@/app/utils/normalizer';
import type { NewAccountData } from '@/app/types/api';
import { logger } from '@/app/utils/logger';
import { ERROR_MESSAGES } from '@/app/utils/constants';

async function handleSubmit(data: { userInfo: UserInfo; accessData: AccessData }) {
  try {
    const normalized: NewAccountData = normalizeData(data.userInfo, data.accessData);

    logger.info('Criando nova conta', { context: 'Register' });
    await api.post('/register', normalized);

    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Conta criada com sucesso!',
    });
  } catch (error) {
    logger.error('Erro ao criar conta', error, { context: 'Register' });

    Toast.show({
      type: 'error',
      text1: 'Erro',
      text2: error.message || ERROR_MESSAGES.GENERIC_ERROR,
    });
  }
}
```

---

## ✅ Checklist de Migração

Use este checklist para garantir que migrou tudo:

- [ ] Atualizar imports de `util/` para `utils/`
- [ ] Remover imports de `helpers/` (duplicatas)
- [ ] Substituir `UserWarpper` por `UserWrapper`
- [ ] Substituir `console.log` por `logger.*`
- [ ] Substituir magic numbers por constantes
- [ ] Adicionar tratamento de erro nos `catch` vazios
- [ ] Usar tipos do `types/api.ts` ao invés de `any`
- [ ] Atualizar `nomalizer` para `normalizer`
- [ ] Adicionar `ErrorBoundary` no root layout
- [ ] Deletar arquivos duplicados (após confirmar que tudo funciona)

---

## 🚀 Rodando o Projeto Após Migração

```bash
# 1. Limpar cache
npm run clean
# ou
expo start -c

# 2. Reinstalar dependências (se necessário)
npm install

# 3. Rodar em desenvolvimento
npm start
```

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module '@/app/utils/logger'"

**Solução:** Verifique o `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Erro: "logger is not a function"

**Solução:** Use a importação nomeada:
```typescript
// ❌ Errado
import logger from '@/app/utils/logger';

// ✅ Correto
import { logger } from '@/app/utils/logger';
```

### Erro: "PIX_KEY_TYPES is not defined"

**Solução:** Importe do constants:
```typescript
import { PIX_KEY_TYPES } from '@/app/utils/constants';
```

---

## 📞 Suporte

Se encontrar problemas durante a migração, verifique:

1. **Imports:** Todos os caminhos estão corretos?
2. **Duplicatas:** Removeu os arquivos antigos?
3. **Cache:** Limpou o cache do Expo/Metro?
4. **Types:** Atualizou todos os `any` para tipos corretos?

---

**Última atualização:** 19/11/2025

Boa migração! 🚀
