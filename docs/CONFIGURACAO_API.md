# Configuração da API para Dispositivos Físicos

Este guia explica como configurar a conexão da API para diferentes tipos de dispositivos.

## 📱 Tipos de Ambiente Suportados

O app detecta automaticamente o ambiente e usa a URL correta:

| Ambiente | URL Usada | Descrição |
|----------|-----------|-----------|
| **Android Emulator** | `http://10.0.2.2:3000` | IP especial do Android para localhost do host |
| **iOS Simulator** | `http://localhost:3000` | Simulador iOS compartilha rede com o Mac |
| **Dispositivo Físico** | `http://SEU_IP:3000` | Requer configuração manual |

## 🔧 Configuração para Dispositivo Físico

### Método 1: Usando arquivo .env (Recomendado)

1. **Descubra o IP da sua máquina:**

   **No Mac/Linux:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   
   **No Windows:**
   ```cmd
   ipconfig
   ```
   
   Procure por algo como: `192.168.x.x` ou `10.0.x.x`

2. **Crie o arquivo `.env` na raiz do projeto mobile:**
   ```bash
   cd mobile
   cp .env.example .env
   ```

3. **Edite o arquivo `.env` e ajuste o IP:**
   ```env
   EXPO_PUBLIC_API_URL=http://SEU_IP_AQUI:3000
   ```
   
   Exemplo:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```

4. **Reinicie o Expo:**
   ```bash
   npm start
   ```

### Método 2: Editando diretamente o código

Se preferir não usar `.env`, edite o arquivo `app/service/api.ts`:

```typescript
const PHYSICAL_DEVICE_IP = "192.168.1.100" // <- ALTERE AQUI
```

## ✅ Verificação

Ao iniciar o app, verifique no console do Metro:

```
🌐 API Base URL: http://192.168.1.100:3000
📱 Platform: android (ou ios)
🔧 Is Device: true (ou false)
```

## 🔥 Importante

1. **Firewall:** Certifique-se de que o firewall permite conexões na porta 3000
2. **Mesma Rede:** O dispositivo físico deve estar na mesma rede Wi-Fi que seu computador
3. **Backend Rodando:** Verifique se o backend está rodando em `http://localhost:3000`

## 🐛 Troubleshooting

### Erro: "Falha na conexão"

1. Verifique se o backend está rodando:
   ```bash
   curl http://localhost:3000
   ```

2. Teste a conexão do dispositivo:
   ```bash
   # No seu computador, descubra o IP
   ifconfig
   
   # No navegador do celular, acesse:
   http://SEU_IP:3000
   ```

3. Verifique o firewall:
   - **Mac:** System Preferences > Security & Privacy > Firewall
   - **Windows:** Windows Defender Firewall

### IP mudou

Se o IP da sua máquina mudou (comum em redes Wi-Fi):
1. Descubra o novo IP usando `ifconfig` ou `ipconfig`
2. Atualize o arquivo `.env` ou `api.ts`
3. Reinicie o Expo

## 📝 Exemplo Completo

```env
# .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

```bash
# Terminal 1 - Backend
cd delivery-back
npm run start:dev

# Terminal 2 - Mobile
cd mobile
npm start

# Escaneie o QR code com Expo Go
```
