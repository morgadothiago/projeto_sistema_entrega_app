import { io, Socket } from "socket.io-client"
import { logger } from "../utils/logger"

type LocationData = {
  latitude: number
  longitude: number
  deliveryCode?: string
  timestamp: string
}

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private url: string = ""
  private token: string = ""

  connect(url: string, token: string) {
    this.url = url
    this.token = token

    try {
      console.log("\n🔄 ========================================")
      console.log("🔄 CONECTANDO AO SOCKET.IO")
      console.log("🔄 ========================================")
      console.log(`📡 URL: ${url}`)
      console.log(`🔑 Token: ${token.substring(0, 20)}...`)
      console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
      console.log("🔄 ========================================\n")

      logger.info("Conectando ao Socket.IO", { context: "WebSocket", data: { url } })

      // Conecta com Socket.IO incluindo o token na query
      this.socket = io(url, {
        auth: {
          token: token,
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 3000,
      })

      // Eventos do Socket.IO
      this.socket.on("connect", () => {
        console.log("\n🟢 ========================================")
        console.log("🟢 SOCKET.IO CONECTADO COM SUCESSO!")
        console.log("🟢 ========================================")
        console.log(`📡 URL: ${url}`)
        console.log(`🆔 Socket ID: ${this.socket?.id}`)
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
        console.log("🟢 ========================================\n")

        logger.info("Socket.IO conectado com sucesso", {
          context: "WebSocket",
          data: { socketId: this.socket?.id },
        })
        this.reconnectAttempts = 0
      })

      this.socket.on("disconnect", (reason) => {
        console.log("\n🔴 ========================================")
        console.log("🔴 SOCKET.IO DESCONECTADO")
        console.log("🔴 ========================================")
        console.log(`❓ Motivo: ${reason}`)
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
        console.log("🔴 ========================================\n")

        logger.warn("Socket.IO desconectado", {
          context: "WebSocket",
          data: { reason },
        })
      })

      this.socket.on("connect_error", (error) => {
        console.log("\n❌ ========================================")
        console.log("❌ ERRO DE CONEXÃO SOCKET.IO")
        console.log("❌ ========================================")
        console.error("⚠️ Detalhes:", error.message)
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
        console.log("❌ ========================================\n")

        logger.error("Erro de conexão Socket.IO", error, { context: "WebSocket" })

        this.reconnectAttempts++
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log("\n🚫 ========================================")
          console.log("🚫 MÁXIMO DE RECONEXÕES ATINGIDO")
          console.log("🚫 ========================================")
          console.log(`❌ Tentativas: ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
          console.log("💡 Verifique se o backend está rodando")
          console.log("💡 Verifique se a URL está correta")
          console.log("🚫 ========================================\n")

          logger.error("Máximo de tentativas de reconexão atingido", undefined, {
            context: "WebSocket",
          })
        }
      })

      // Escuta confirmação de localização recebida
      this.socket.on("location_received", (data: any) => {
        console.log("\n📨 ========================================")
        console.log("📨 CONFIRMAÇÃO DE LOCALIZAÇÃO RECEBIDA")
        console.log("📨 ========================================")
        console.log(`📦 Dados:`, JSON.stringify(data, null, 2))
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
        console.log("📨 ========================================\n")

        logger.debug("Confirmação de localização recebida", {
          context: "WebSocket",
          data,
        })
      })

      // Escuta outros eventos customizados
      this.socket.on("message", (data: any) => {
        console.log("\n📨 ========================================")
        console.log("📨 MENSAGEM RECEBIDA DO SERVIDOR")
        console.log("📨 ========================================")
        console.log(`📦 Dados:`, JSON.stringify(data, null, 2))
        console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
        console.log("📨 ========================================\n")

        logger.debug("Mensagem recebida do servidor", {
          context: "WebSocket",
          data,
        })
      })
    } catch (error) {
      logger.error("Erro ao conectar Socket.IO", error, { context: "WebSocket" })
    }
  }

  // Envia localização via socket.emit
  sendLocation(latitude: number, longitude: number, deliveryCode?: string) {
    if (!this.socket || !this.socket.connected) {
      console.log("\n⚠️  ========================================")
      console.log("⚠️  SOCKET.IO NÃO CONECTADO")
      console.log("⚠️  ========================================")
      console.log(`🔌 Conectado: NÃO`)
      console.log("💡 Aguarde a reconexão automática")
      console.log("⚠️  ========================================\n")

      logger.warn("Socket.IO não está conectado", { context: "WebSocket" })
      return
    }

    const locationData: LocationData = {
      latitude,
      longitude,
      deliveryCode,
      timestamp: new Date().toISOString(),
    }

    console.log("\n📍 ========================================")
    console.log("📍 ENVIANDO LOCALIZAÇÃO VIA SOCKET.EMIT")
    console.log("📍 ========================================")
    console.log(`📦 Código da Entrega: ${deliveryCode || "N/A"}`)
    console.log(`🌍 Latitude: ${latitude}`)
    console.log(`🌍 Longitude: ${longitude}`)
    console.log(`⏰ Timestamp: ${locationData.timestamp}`)
    console.log(`🆔 Socket ID: ${this.socket.id}`)
    console.log(`🔌 Status: CONECTADO ✓`)
    console.log("📍 ========================================\n")

    // Emite evento "location_update" para o servidor
    this.socket.emit("location_update", locationData)

    logger.debug("Localização enviada via socket.emit", {
      context: "WebSocket",
      data: locationData,
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      logger.info("Socket.IO desconectado manualmente", { context: "WebSocket" })

      console.log("\n🔌 ========================================")
      console.log("🔌 SOCKET.IO DESCONECTADO MANUALMENTE")
      console.log("🔌 ========================================\n")
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected
  }

  // Método auxiliar para emitir eventos customizados
  emit(event: string, data: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data)
      logger.debug(`Evento '${event}' emitido`, {
        context: "WebSocket",
        data,
      })
    } else {
      logger.warn(`Não foi possível emitir evento '${event}' - Socket não conectado`, {
        context: "WebSocket",
      })
    }
  }

  // Método para escutar eventos customizados
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback)
      logger.debug(`Listener registrado para evento '${event}'`, {
        context: "WebSocket",
      })
    }
  }
}

export const websocketService = new WebSocketService()
