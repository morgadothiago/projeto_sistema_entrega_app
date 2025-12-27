# ✅ Configuração EAS Completa - Resumo

**Data:** 24/12/2025
**Status:** ✅ Configurado

---

## 📁 Arquivos Criados/Modificados

### Arquivos Configurados (3)

1. **`eas.json`** ✅ Atualizado
   - 5 perfis de build configurados
   - Configurações específicas por ambiente
   - Channels configurados para updates OTA

2. **`package.json`** ✅ Atualizado
   - 24 scripts NPM criados
   - Comandos organizados por perfil e plataforma
   - Scripts de build, submit e update

3. **`app/config/environment.ts`** ✅ Criado
   - Configuração centralizada de ambiente
   - Suporte a múltiplos ambientes
   - Type-safe com TypeScript

### Documentação (3)

1. **`EAS_BUILD_GUIDE.md`** ✅ Criado
   - Guia completo de uso
   - Exemplos de cada comando
   - Fluxo de trabalho recomendado

2. **`EAS_SETUP_RESUMO.md`** ✅ Este arquivo
   - Resumo da configuração
   - Quick start guide

3. **`.env.example`** ✅ Criado
   - Template de variáveis de ambiente
   - Exemplos de configuração

---

## 🎯 Perfis de Build Configurados

### 1. Development
- **Bundle ID:** `com.thiagomorgado.entregador`
- **Tipo:** APK Debug (Android) / Debug (iOS)
- **Uso:** Desenvolvimento local
- **Channel:** `development`

### 2. Test
- **Bundle ID:** `com.thiagomorgado.entregador.test`
- **Tipo:** APK Release (Android) / Release (iOS)
- **Uso:** Testes internos com QA
- **Channel:** `test`
- ✅ Pode coexistir com Production

### 3. Staging/Preview
- **Bundle ID:** `com.thiagomorgado.entregador.staging`
- **Tipo:** APK Release (Android) / Release (iOS)
- **Uso:** Homologação com cliente
- **Channel:** `preview`
- ✅ Pode coexistir com Production

### 4. Production
- **Bundle ID:** `com.thiagomorgado.entregador`
- **Tipo:** AAB (Android) / Release (iOS)
- **Uso:** Produção - Lojas
- **Channel:** `production`
- ✅ Auto increment de versão

### 5. Production APK
- **Bundle ID:** `com.thiagomorgado.entregador`
- **Tipo:** APK Release (Android)
- **Uso:** Distribuição direta (fora da loja)

---

## 🚀 Comandos Principais

### Builds Rápidos

```bash
# Teste para Android
npm run build:test:android

# Staging para Android
npm run build:staging:android

# Produção para Android (AAB)
npm run build:prod:android

# Produção para Android (APK)
npm run build:prod:apk
```

### Builds para iOS

```bash
# Teste para iOS
npm run build:test:ios

# Staging para iOS
npm run build:staging:ios

# Produção para iOS
npm run build:prod:ios
```

### Builds para Todas as Plataformas

```bash
# Teste
npm run build:test:all

# Staging
npm run build:staging:all

# Produção
npm run build:prod:all
```

---

## 📝 Lista Completa de Comandos

### Development (12 comandos)

```bash
# Builds Development
npm run build:dev:android      # Build Android Development
npm run build:dev:ios          # Build iOS Development
npm run build:dev:all          # Build ambas plataformas

# Builds Test
npm run build:test:android     # Build Android Test
npm run build:test:ios         # Build iOS Test
npm run build:test:all         # Build ambas plataformas

# Builds Staging
npm run build:staging:android  # Build Android Staging
npm run build:staging:ios      # Build iOS Staging
npm run build:staging:all      # Build ambas plataformas

# Builds Production
npm run build:prod:android     # Build Android Production (AAB)
npm run build:prod:ios         # Build iOS Production
npm run build:prod:all         # Build ambas plataformas
npm run build:prod:apk         # Build Android Production (APK)
```

### Submit (2 comandos)

```bash
npm run submit:prod:android    # Enviar para Google Play Store
npm run submit:prod:ios        # Enviar para Apple App Store
```

### Updates OTA (4 comandos)

```bash
npm run update:dev "msg"       # Update Development
npm run update:test "msg"      # Update Test
npm run update:staging "msg"   # Update Staging
npm run update:prod "msg"      # Update Production
```

### Outros (4 comandos)

```bash
npm start                      # Iniciar Expo Dev Server
npm run android               # Run Android local
npm run ios                   # Run iOS local
npm run lint                  # Lint code
```

**Total: 24 comandos NPM**

---

## 🔄 Fluxo de Trabalho Típico

### Dia a Dia (Desenvolvimento)

```bash
# 1. Trabalhar no código
npm start

# 2. Testar localmente
npm run android
# ou
npm run ios
```

### Testes com QA

```bash
# 1. Criar build de teste
npm run build:test:android

# 2. QA testa e reporta bugs
# 3. Corrigir e enviar update
npm run update:test "Correções de bugs"
```

### Homologação com Cliente

```bash
# 1. Criar build de staging
npm run build:staging:android

# 2. Cliente valida
# 3. Ajustes necessários
npm run update:staging "Ajustes do cliente"
```

### Release em Produção

```bash
# 1. Atualizar versão em app.json
# 2. Criar build de produção
npm run build:prod:all

# 3. Submeter para lojas
npm run submit:prod:android
npm run submit:prod:ios
```

---

## 🌍 Configuração de Ambiente

### Como Usar no Código

```typescript
// Importar configuração
import { API_BASE_URL, IS_PROD, APP_ENV } from '@/app/config/environment';

// Usar API URL
axios.get(`${API_BASE_URL}/deliveries`);

// Verificar ambiente
if (IS_PROD) {
  // Código específico de produção
}

// Log condicional
if (!IS_PROD) {
  console.log('Debug:', APP_ENV);
}
```

### URLs Configuradas por Ambiente

| Ambiente | API URL | WebSocket URL |
|----------|---------|---------------|
| Development | `http://localhost:3000/api` | `ws://localhost:3000` |
| Test | `https://api-test.seudominio.com.br/api` | `wss://api-test.seudominio.com.br` |
| Staging | `https://api-staging.seudominio.com.br/api` | `wss://api-staging.seudominio.com.br` |
| Production | `https://api.seudominio.com.br/api` | `wss://api.seudominio.com.br` |

**⚠️ Atualizar URLs em `app/config/environment.ts` com suas URLs reais!**

---

## ⚙️ Variáveis de Ambiente Injetadas

Cada perfil injeta automaticamente:

```typescript
// Injetado pelo EAS Build
process.env.APP_ENV = "development" | "test" | "staging" | "production"
```

Acessível via:

```typescript
import Constants from 'expo-constants';
const env = Constants.expoConfig?.extra?.APP_ENV;
```

---

## 📱 Instalação de Apps

### Android

**Test/Staging (APK):**
1. Build completa → EAS gera link
2. Abrir link no celular
3. Permitir instalação
4. Instalar APK

**Production (Play Store):**
1. `npm run build:prod:android`
2. `npm run submit:prod:android`
3. Aguardar aprovação Google
4. Publicar

### iOS

**Test/Staging (TestFlight):**
1. Build completa → Vai para TestFlight
2. Adicionar testers no App Store Connect
3. Testers instalam via TestFlight

**Production (App Store):**
1. `npm run build:prod:ios`
2. `npm run submit:prod:ios`
3. Configurar no App Store Connect
4. Enviar para revisão
5. Aguardar aprovação Apple
6. Publicar

---

## ✅ Benefícios da Configuração

### 1. Múltiplos Ambientes
- ✅ Test, Staging e Production separados
- ✅ Apps podem coexistir no mesmo device
- ✅ Teste nova versão sem remover produção

### 2. URLs Configuráveis
- ✅ API diferente por ambiente
- ✅ Fácil alternar entre dev/staging/prod
- ✅ Type-safe com TypeScript

### 3. Comandos Simples
- ✅ 24 comandos NPM prontos
- ✅ Nomes intuitivos e organizados
- ✅ Não precisa lembrar flags do EAS

### 4. Updates OTA
- ✅ Atualizar app sem rebuild
- ✅ Hotfix em produção rápido
- ✅ Channels separados por ambiente

### 5. Submissão Automatizada
- ✅ Submit para lojas com 1 comando
- ✅ Configuração centralizada
- ✅ Versionamento automático

---

## 🎓 Próximos Passos

### 1. Configurar URLs Reais

Editar `app/config/environment.ts`:

```typescript
const ENV_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  // ...
  production: {
    apiUrl: 'https://SUA-API-REAL.com.br/api',  // ⬅️ Mudar aqui
    wsUrl: 'wss://SUA-API-REAL.com.br',         // ⬅️ Mudar aqui
    // ...
  },
};
```

### 2. Atualizar Service API

Editar `app/service/api.ts` para usar a config:

```typescript
import { API_BASE_URL } from '@/app/config/environment';

export const api = axios.create({
  baseURL: API_BASE_URL,  // ⬅️ Usar variável de ambiente
  timeout: 15000,
});
```

### 3. Atualizar WebSocket

Editar `app/service/websocket.ts`:

```typescript
import { WS_BASE_URL } from '@/app/config/environment';

const socket = io(WS_BASE_URL, {  // ⬅️ Usar variável de ambiente
  // ...
});
```

### 4. Primeiro Build de Teste

```bash
# Fazer login no EAS
eas login

# Criar primeiro build
npm run build:test:android

# Aguardar ~10-15 minutos
# Instalar e testar
```

### 5. Configurar Submit (Quando for para produção)

**Android:**
- Criar Service Account no Google Cloud
- Baixar JSON key
- Salvar como `google-service-account.json`
- Adicionar ao `.gitignore`

**iOS:**
- Atualizar Apple ID em `eas.json`
- Configurar App Store Connect API key
- Run `eas credentials`

---

## ⚠️ Checklist Final

Antes de fazer builds de produção:

- [ ] URLs reais configuradas em `environment.ts`
- [ ] `app/service/api.ts` usando `API_BASE_URL`
- [ ] `app/service/websocket.ts` usando `WS_BASE_URL`
- [ ] Versão atualizada em `app.json`
- [ ] Service Account configurado (Android)
- [ ] Apple ID configurado (iOS)
- [ ] `.gitignore` atualizado (não commitar credenciais)
- [ ] Testado build de staging antes de produção

---

## 📚 Documentação

- **Guia Completo:** `EAS_BUILD_GUIDE.md`
- **Resumo:** `EAS_SETUP_RESUMO.md` (este arquivo)
- **Variáveis Ambiente:** `.env.example`
- **Config Ambiente:** `app/config/environment.ts`

---

## 🆘 Problemas Comuns

### Build falhou

```bash
# Ver logs
eas build:list

# Tentar com cache limpo
npm run build:test:android -- --clear-cache
```

### URLs não funcionam

```bash
# Verificar ambiente injetado
# Ver logs no console do app
# Deve mostrar: "Ambiente: test" (ou outro)
```

### App não atualiza com OTA

```bash
# Forçar reload no app
# Ou fazer novo build
npm run build:test:android
```

---

**Configurado por:** Claude Code
**Data:** 24/12/2025
**Status:** ✅ Pronto para uso
