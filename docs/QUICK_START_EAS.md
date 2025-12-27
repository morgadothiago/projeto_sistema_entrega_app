# 🚀 Quick Start - EAS Build

**Comandos mais usados para começar rapidamente**

---

## 📱 Primeiro Build

### Android - Build de Teste

```bash
# 1. Login no EAS (primeira vez)
eas login

# 2. Criar build de teste
npm run build:test:android

# 3. Aguardar ~10-15 minutos
# 4. EAS vai gerar link para download do APK
# 5. Abrir link no celular e instalar
```

### iOS - Build de Teste

```bash
# 1. Login no EAS (primeira vez)
eas login

# 2. Criar build de teste
npm run build:test:ios

# 3. Aguardar ~15-20 minutos
# 4. Build vai para TestFlight automaticamente
# 5. Adicionar testers no App Store Connect
```

---

## 🔄 Builds Mais Comuns

```bash
# Teste interno (QA)
npm run build:test:android

# Homologação/Staging (Cliente)
npm run build:staging:android

# Produção (Loja)
npm run build:prod:android

# Produção APK (Distribuição direta)
npm run build:prod:apk
```

---

## ⚡ Updates Rápidos (OTA)

Atualizar app sem rebuild (apenas código JS/TS):

```bash
# Update de teste
npm run update:test "Correção de bugs"

# Update de staging
npm run update:staging "Ajustes do cliente"

# Update de produção
npm run update:prod "Hotfix crítico"
```

---

## 📝 Fluxo Simples

### 1. Desenvolvimento Local

```bash
npm start
npm run android  # ou npm run ios
```

### 2. Testar com QA

```bash
npm run build:test:android
```

### 3. Validar com Cliente

```bash
npm run build:staging:android
```

### 4. Publicar Produção

```bash
# Atualizar version em app.json
npm run build:prod:android
npm run submit:prod:android
```

---

## 🌍 Configurar URLs (IMPORTANTE!)

Antes de fazer builds, configure suas URLs reais:

Editar `app/config/environment.ts`:

```typescript
production: {
  apiUrl: 'https://SUA-API.com.br/api',  // ⬅️ Mudar
  wsUrl: 'wss://SUA-API.com.br',         // ⬅️ Mudar
  // ...
}
```

---

## 📚 Mais Informações

- Guia completo: `EAS_BUILD_GUIDE.md`
- Resumo configuração: `EAS_SETUP_RESUMO.md`
- Lista de comandos: `package.json`

---

**Pronto para começar! 🎉**
