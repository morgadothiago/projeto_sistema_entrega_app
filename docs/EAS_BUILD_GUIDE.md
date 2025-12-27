# Guia de Build e Deploy - EAS (Expo Application Services)

## 📋 Índice
- [Perfis de Build Disponíveis](#perfis-de-build-disponíveis)
- [Comandos NPM](#comandos-npm)
- [Como Usar](#como-usar)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Diferenças entre Perfis](#diferenças-entre-perfis)
- [Fluxo de Trabalho Recomendado](#fluxo-de-trabalho-recomendado)

---

## 🎯 Perfis de Build Disponíveis

### 1. **Development** (Desenvolvimento Local)
- **Objetivo:** Builds para desenvolvimento e debug local
- **Android:** APK Debug com Development Client
- **iOS:** Debug build para simulador
- **Bundle ID:** `com.thiagomorgado.entregador` (padrão)
- **Distribuição:** Internal
- **Channel:** `development`

### 2. **Test** (Testes Internos)
- **Objetivo:** Builds para testes internos e QA
- **Android:** APK Release para instalação direta
- **iOS:** Build Release para TestFlight
- **Bundle ID:** `com.thiagomorgado.entregador.test`
- **Distribuição:** Internal
- **Channel:** `test`
- **✅ Pode coexistir com Production no mesmo device**

### 3. **Staging/Preview** (Homologação)
- **Objetivo:** Builds para ambiente de staging/homologação
- **Android:** APK Release
- **iOS:** Build Release
- **Bundle ID:** `com.thiagomorgado.entregador.staging`
- **Distribuição:** Internal
- **Channel:** `preview`
- **✅ Pode coexistir com Production no mesmo device**

### 4. **Production** (Produção)
- **Objetivo:** Builds para lojas (Google Play Store / Apple App Store)
- **Android:** AAB (App Bundle) - otimizado para Play Store
- **iOS:** Build Release
- **Bundle ID:** `com.thiagomorgado.entregador` (padrão)
- **Distribuição:** Store
- **Channel:** `production`
- **Auto Increment:** Sim (versão incrementada automaticamente)

### 5. **Production APK** (Produção - APK Direto)
- **Objetivo:** APK de produção para distribuição direta (fora da Play Store)
- **Android:** APK Release (mesmo que production mas em APK)
- **Bundle ID:** `com.thiagomorgado.entregador` (padrão)

---

## 🚀 Comandos NPM

### Builds de Development

```bash
# Android Development (APK Debug com Development Client)
npm run build:dev:android

# iOS Development (Simulador)
npm run build:dev:ios

# Ambas as plataformas
npm run build:dev:all
```

### Builds de Test

```bash
# Android Test (APK para testers)
npm run build:test:android

# iOS Test (TestFlight)
npm run build:test:ios

# Ambas as plataformas
npm run build:test:all
```

### Builds de Staging

```bash
# Android Staging (APK de homologação)
npm run build:staging:android

# iOS Staging
npm run build:staging:ios

# Ambas as plataformas
npm run build:staging:all
```

### Builds de Production

```bash
# Android Production (AAB para Play Store)
npm run build:prod:android

# iOS Production (App Store)
npm run build:prod:ios

# Ambas as plataformas
npm run build:prod:all

# Android Production APK (distribuição direta)
npm run build:prod:apk
```

### Submit para Lojas

```bash
# Enviar para Google Play Store
npm run submit:prod:android

# Enviar para Apple App Store
npm run submit:prod:ios
```

### Updates OTA (Over The Air)

```bash
# Update Development
npm run update:dev "Mensagem do update"

# Update Test
npm run update:test "Mensagem do update"

# Update Staging
npm run update:staging "Mensagem do update"

# Update Production
npm run update:prod "Mensagem do update"
```

---

## 📖 Como Usar

### 1. Primeiro Build (Setup Inicial)

```bash
# Login no EAS (se ainda não fez)
eas login

# Configurar projeto (se necessário)
eas build:configure
```

### 2. Build para Testes Internos

```bash
# Criar build de teste para Android
npm run build:test:android

# Aguardar conclusão (~10-15 minutos)
# O EAS vai gerar um link para download do APK
```

### 3. Build para Staging/Homologação

```bash
# Criar build de staging
npm run build:staging:android

# Compartilhar APK com cliente/stakeholders
```

### 4. Build para Production

```bash
# 1. Atualizar versão no app.json
# 2. Criar build de produção
npm run build:prod:android

# 3. Após aprovação, submeter para loja
npm run submit:prod:android
```

### 5. Updates OTA (Sem rebuild)

```bash
# Fazer pequenas mudanças no código
# Enviar update OTA
npm run update:prod "Correção de bug no login"

# ✅ Usuários receberão update automaticamente
```

---

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente por Perfil

Cada perfil injeta automaticamente a variável `APP_ENV`:

```typescript
// Acesso via expo-constants
import Constants from 'expo-constants';

const appEnv = Constants.expoConfig?.extra?.APP_ENV;

// Valores possíveis:
// - "development"
// - "test"
// - "staging"
// - "production"
```

### Configurar API Base URL por Ambiente

```typescript
// app/config/api.ts
import Constants from 'expo-constants';

const ENV = {
  development: {
    apiUrl: 'http://localhost:3000/api',
  },
  test: {
    apiUrl: 'https://api-test.seudominio.com.br/api',
  },
  staging: {
    apiUrl: 'https://api-staging.seudominio.com.br/api',
  },
  production: {
    apiUrl: 'https://api.seudominio.com.br/api',
  },
};

const appEnv = Constants.expoConfig?.extra?.APP_ENV || 'development';
export const API_BASE_URL = ENV[appEnv].apiUrl;
```

---

## 🔄 Diferenças entre Perfis

| Característica | Development | Test | Staging | Production |
|----------------|-------------|------|---------|------------|
| **Dev Client** | ✅ Sim | ❌ Não | ❌ Não | ❌ Não |
| **Bundle ID** | Padrão | `.test` | `.staging` | Padrão |
| **Build Type (Android)** | APK Debug | APK Release | APK Release | AAB/APK |
| **Pode coexistir com Prod** | ❌ Não* | ✅ Sim | ✅ Sim | - |
| **Auto Increment** | ❌ Não | ❌ Não | ❌ Não | ✅ Sim |
| **Distribuição** | Internal | Internal | Internal | Store |
| **Updates OTA** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |

*Development usa o mesmo Bundle ID de Production

---

## 🔀 Fluxo de Trabalho Recomendado

### Desenvolvimento Diário

```bash
# 1. Desenvolvimento local
npm start

# 2. Testar no simulador/emulador
npm run android
npm run ios
```

### Testes com QA

```bash
# 1. Criar build de test
npm run build:test:android

# 2. Compartilhar link do APK com QA
# 3. QA testa e reporta bugs
# 4. Corrigir bugs
# 5. Enviar update OTA (se possível)
npm run update:test "Correção de bugs reportados"

# Ou criar novo build se necessário
npm run build:test:android
```

### Homologação com Cliente

```bash
# 1. Criar build de staging
npm run build:staging:all

# 2. Cliente valida funcionalidades
# 3. Fazer ajustes se necessário
# 4. Recriar build ou enviar update OTA
npm run update:staging "Ajustes solicitados pelo cliente"
```

### Deploy em Produção

```bash
# 1. Garantir que staging está aprovado
# 2. Atualizar versão no app.json
# 3. Criar build de produção
npm run build:prod:all

# 4. Testar build de produção
# 5. Submeter para lojas
npm run submit:prod:android
npm run submit:prod:ios

# 6. Aguardar aprovação das lojas
# 7. Publicar para usuários
```

### Hotfix em Produção

```bash
# 1. Corrigir bug urgente
# 2. Se for código JS/TS (não nativo):
npm run update:prod "Hotfix: correção de bug crítico"

# 3. Se for código nativo ou config:
npm run build:prod:all
npm run submit:prod:all
```

---

## 📱 Instalação de Builds

### Android

**APK (Test/Staging/Dev):**
1. EAS gera link de download
2. Abrir link no celular
3. Permitir instalação de fontes desconhecidas
4. Instalar APK

**Play Store (Production):**
1. Submeter via `npm run submit:prod:android`
2. Aguardar aprovação do Google
3. Publicar para produção
4. Usuários instalam via Play Store

### iOS

**TestFlight (Test/Staging):**
1. Build automaticamente vai para TestFlight
2. Adicionar testers no App Store Connect
3. Testers recebem notificação
4. Instalar via app TestFlight

**App Store (Production):**
1. Submeter via `npm run submit:prod:ios`
2. Configurar no App Store Connect
3. Enviar para revisão
4. Aguardar aprovação da Apple
5. Publicar para produção

---

## 🔐 Configuração para Submit

### Android (Google Play Store)

1. **Criar Service Account:**
   - Google Cloud Console → IAM → Service Accounts
   - Criar nova conta de serviço
   - Baixar JSON key

2. **Configurar Play Console:**
   - Play Console → Setup → API access
   - Vincular service account
   - Dar permissões necessárias

3. **Adicionar key ao projeto:**
   ```bash
   # Salvar google-service-account.json na raiz do projeto
   # NÃO commitar este arquivo!
   ```

### iOS (Apple App Store)

1. **Apple ID e ASC App ID:**
   - Atualizar `eas.json` com seu Apple ID
   - Adicionar ASC App ID (do App Store Connect)
   - Adicionar Apple Team ID

2. **App Store Connect API Key (opcional):**
   ```bash
   # Baixar API key do App Store Connect
   # Configurar no EAS
   eas credentials
   ```

---

## ⚠️ Importante

### Não commitar arquivos sensíveis:

```gitignore
# .gitignore
google-service-account.json
*.p12
*.mobileprovision
.env.production
```

### Bundle IDs diferentes permitem:

- ✅ Test e Production instalados juntos
- ✅ Staging e Production instalados juntos
- ✅ Testar nova versão sem remover produção
- ✅ Comparar versões lado a lado

### Auto Increment (Production):

- ✅ EAS incrementa versionCode/buildNumber automaticamente
- ✅ Não precisa atualizar manualmente
- ⚠️ **Sempre** atualizar `version` no `app.json` para releases maiores

---

## 🆘 Troubleshooting

### Build falhou

```bash
# Ver logs detalhados
eas build:list

# Tentar novamente com cache limpo
eas build --platform android --profile test --clear-cache
```

### Submit falhou

```bash
# Verificar credenciais
eas credentials

# Re-submit
npm run submit:prod:android
```

### Update não aplicou

```bash
# Verificar branch correta
eas update:list

# Forçar rollback se necessário
eas update:rollback --branch production
```

---

## 📚 Recursos Adicionais

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentação EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Documentação EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

---

**Última atualização:** 24/12/2025
**Configurado por:** Claude Code
