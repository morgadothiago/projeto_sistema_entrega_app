# 🌐 Configuração Automática da Base URL

## ✅ O Que Foi Implementado

O arquivo `mobile/app/service/api.ts` agora detecta **automaticamente** o melhor endpoint para cada ambiente:

### 📱 Detecção Automática por Ambiente

| Ambiente | URL Usada | Como Funciona |
|----------|-----------|---------------|
| **Simulador iOS** | `http://localhost:3000` | iOS permite acesso direto ao localhost |
| **Emulador Android** | `http://10.0.2.2:3000` | Android usa alias especial para localhost |
| **Dispositivo Físico** | `http://192.168.x.x:3000` | Detecta IP do Metro Bundler automaticamente |
| **Produção** | URL do `app.json` | Usa configuração do `extra.apiUrl` |

---

## 🚀 Como Usar

### 1. Desenvolvimento (Automático)

**Não precisa fazer NADA!** O sistema detecta automaticamente:

```typescript
// Quando você roda: npm start
// O app automaticamente:
// - Detecta se é simulador, emulador ou dispositivo físico
// - Pega o IP do seu computador do Metro Bundler
// - Configura a URL correta
```

**Logs no Terminal:**

Quando você iniciar o app, verá algo assim:

```
📡 ========================================
📡 API CONFIGURATION
📡 ========================================
🌐 Base URL: http://192.168.1.100:3000
⏱️  Timeout: 15000ms
📱 Platform: ios
🔧 Device: iPhone 15 Pro
🏗️  Environment: Development
📡 ========================================
```

### 2. Produção (Configuração Manual)

Edite o arquivo `mobile/app.json`:

```json
{
  "expo": {
    "name": "seu-app",
    "slug": "seu-app",
    "extra": {
      "apiUrl": "https://api.seudominio.com",
      "apiTimeout": 30000
    }
  }
}
```

Ou crie `mobile/app.config.js` (mais dinâmico):

```javascript
export default {
  expo: {
    name: "seu-app",
    slug: "seu-app",
    extra: {
      apiUrl: process.env.API_URL || "https://api.seudominio.com",
      apiTimeout: parseInt(process.env.API_TIMEOUT || "30000", 10),
    },
  },
}
```

---

## 🔧 Configurações Avançadas

### Mudar Porta do Backend

Se seu backend roda em uma porta diferente de 3000:

Edite `mobile/app/service/api.ts` linha 45:

```typescript
// Porta do backend (ajuste aqui se sua porta for diferente)
const backendPort = 3000  // ⬅️ MUDE AQUI
```

### Fallback Manual (Opcional)

Se a detecção automática falhar, edite linha 63:

```typescript
// 3. FALLBACK - Ambiente não detectado
return 'http://192.168.100.99:3000'  // ⬅️ COLOQUE SEU IP AQUI
```

**Como descobrir seu IP:**

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Procure por algo como `192.168.x.x` ou `10.0.x.x`

---

## 📊 Como Funciona Internamente

```typescript
function getBaseURL(): string {
  // 1️⃣ PRIORIDADE 1: Produção (app.json)
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl
  }

  // 2️⃣ PRIORIDADE 2: Desenvolvimento - Detecção Automática
  if (__DEV__) {
    const { manifest } = Constants

    // 2.1 - Pega IP do Metro Bundler (funciona 99% dos casos)
    if (manifest?.debuggerHost) {
      const host = manifest.debuggerHost.split(':')[0]
      return `http://${host}:3000`
    }

    // 2.2 - Emulador Android
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000'
    }

    // 2.3 - Simulador iOS
    if (Platform.OS === 'ios') {
      return 'http://localhost:3000'
    }
  }

  // 3️⃣ PRIORIDADE 3: Fallback manual
  return 'http://192.168.100.99:3000'
}
```

---

## 🧪 Como Testar

### Teste 1: Simulador iOS

```bash
cd mobile
npm start
# Pressione 'i' para abrir no simulador iOS
```

**Resultado esperado:**
```
🌐 Base URL: http://localhost:3000
📱 Platform: ios
```

### Teste 2: Emulador Android

```bash
cd mobile
npm start
# Pressione 'a' para abrir no emulador Android
```

**Resultado esperado:**
```
🌐 Base URL: http://10.0.2.2:3000
📱 Platform: android
```

### Teste 3: Dispositivo Físico (Expo Go)

```bash
cd mobile
npm start
# Escaneie o QR code com o Expo Go
```

**Resultado esperado:**
```
🌐 Base URL: http://192.168.1.100:3000  (seu IP local)
📱 Platform: ios/android
🔧 Device: iPhone 14 (ou seu dispositivo)
```

### Teste 4: Conexão com Backend

Faça login no app e observe os logs:

```
📤 POST /auth/login
📥 POST /auth/login - 200

📤 GET /delivery
📥 GET /delivery - 200
```

Se aparecer erro de conexão:
```
❌ POST /auth/login - Network Error
   Base URL: http://192.168.x.x:3000
```

**Solução:** Verifique se:
1. Backend está rodando (`npm run dev`)
2. Porta está correta (3000)
3. Firewall não está bloqueando

---

## 🆘 Troubleshooting

### ❌ "Falha na conexão" em dispositivo físico

**Problema:** App não conecta ao backend

**Causas possíveis:**

1. **Dispositivo e computador em redes diferentes**
   ```
   ✅ Solução: Conecte ambos no mesmo Wi-Fi
   ```

2. **Firewall bloqueando a porta**
   ```
   ✅ Mac: System Settings > Network > Firewall > Permitir conexões
   ✅ Windows: Firewall > Permitir app > Node.js
   ```

3. **Backend não está rodando**
   ```bash
   cd delivery-back
   npm run dev
   # Deve mostrar: Server running on port 3000
   ```

4. **IP errado no fallback**
   ```typescript
   // Descubra seu IP:
   # Mac/Linux:
   ifconfig | grep "inet "

   # Windows:
   ipconfig

   // Edite linha 63 do api.ts:
   return 'http://SEU_IP_AQUI:3000'
   ```

### ❌ "localhost refused to connect" no Android

**Problema:** Emulador Android não aceita localhost

**Solução:** Use `10.0.2.2` (já configurado automaticamente)

```typescript
// Já está implementado:
if (Platform.OS === 'android') {
  return 'http://10.0.2.2:3000'
}
```

### ❌ "debuggerHost is undefined"

**Problema:** Detecção automática de IP falhou

**Solução:** Configure o fallback manual (linha 63)

```typescript
return 'http://192.168.1.100:3000'  // ⬅️ Seu IP aqui
```

### ❌ Logs não aparecem

**Problema:** Não vejo os logs de configuração

**Solução:** Os logs só aparecem em modo desenvolvimento

```bash
# Verifique se está em modo dev:
npm start

# Se usar build de produção, não verá logs
```

---

## 🔒 Segurança em Produção

### Não exponha URLs sensíveis

**❌ ERRADO:**
```typescript
const BASE_URL = "https://api.minhaempresa.com"  // Hard-coded
```

**✅ CORRETO:**
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,  // Variável de ambiente
    },
  },
}
```

### Use HTTPS em produção

```json
{
  "extra": {
    "apiUrl": "https://api.seudominio.com"  // ✅ HTTPS, não HTTP
  }
}
```

### Timeout apropriado

```json
{
  "extra": {
    "apiTimeout": 30000  // 30s para produção (rede pode ser lenta)
  }
}
```

---

## 📚 Variáveis de Ambiente

### Desenvolvimento (.env)

Crie `mobile/.env`:

```env
API_URL=http://192.168.1.100:3000
API_TIMEOUT=15000
```

### Produção (.env.production)

Crie `mobile/.env.production`:

```env
API_URL=https://api.seudominio.com
API_TIMEOUT=30000
```

### Usar no app.config.js

```javascript
import 'dotenv/config'

export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL,
      apiTimeout: process.env.API_TIMEOUT,
    },
  },
}
```

---

## 🎯 Resumo

### O que VOCÊ precisa fazer:

**Desenvolvimento:**
- ✅ **NADA!** Funciona automaticamente

**Produção:**
- ✅ Configurar `extra.apiUrl` no `app.json`
- ✅ Usar HTTPS
- ✅ Ajustar timeout se necessário

### O que o SISTEMA faz automaticamente:

- ✅ Detecta simulador/emulador/dispositivo
- ✅ Pega IP do Metro Bundler
- ✅ Usa URL correta para cada ambiente
- ✅ Mostra logs detalhados em desenvolvimento
- ✅ Trata erros de conexão

---

## 📞 Precisa de Ajuda?

Se nada funcionar, envie:

1. **Logs do app:**
   ```
   (copie os logs de "📡 API CONFIGURATION")
   ```

2. **Ambiente:**
   - Dispositivo físico ou simulador?
   - iOS ou Android?
   - Qual versão do Expo?

3. **Backend:**
   - Está rodando?
   - Qual porta?
   - Qual IP?

4. **Erro exato:**
   ```
   (copie a mensagem de erro completa)
   ```
