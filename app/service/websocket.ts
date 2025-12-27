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
  private maxReconnectAttempts = 3 // Reduzido de 5 para 3
  private url: string = ""
  private token: string = ""
  private lastLocationSent = 0
  private locationThrottle = 10000 // 10 segundos entre envios de localização

  connect(url: string, token: string) {
    this.url = url
    this.token = token

    try {
      logger.info("Conectando ao Socket.IO", { context: "WebSocket", data: { url } })

      // Conecta com Socket.IO incluindo o token na query
      this.socket = io(url, {
        auth: {
          token: token,
        },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000, // Delay inicial: 2s
        reconnectionDelayMax: 30000, // Máximo: 30s (backoff exponencial)
      })

      // Eventos do Socket.IO
      this.socket.on("connect", () => {
        logger.info("Socket.IO conectado com sucesso", {
          context: "WebSocket",
          data: { socketId: this.socket?.id },
        })
        this.reconnectAttempts = 0
      })

      this.socket.on("disconnect", (reason) => {
        logger.warn("Socket.IO desconectado", {
          context: "WebSocket",
          data: { reason },
        })
      })

      this.socket.on("connect_error", (error) => {
        logger.error("Erro de conexão Socket.IO", error, { context: "WebSocket" })

        this.reconnectAttempts++
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          logger.error("Máximo de tentativas de reconexão atingido", undefined, {
            context: "WebSocket",
          })
        }
      })

      // Escuta confirmação de localização recebida
      this.socket.on("location_received", (data: any) => {
        logger.debug("Confirmação de localização recebida", {
          context: "WebSocket",
          data,
        })
      })

      // Escuta outros eventos customizados
      this.socket.on("message", (data: any) => {
        logger.debug("Mensagem recebida do servidor", {
          context: "WebSocket",
          data,
        })
      })
    } catch (error) {
      logger.error("Erro ao conectar Socket.IO", error, { context: "WebSocket" })
    }
  }

  // Envia localização via socket.emit (com throttling)
  sendLocation(latitude: number, longitude: number, deliveryCode?: string) {
    if (!this.socket || !this.socket.connected) {
      logger.warn("Socket.IO não está conectado", { context: "WebSocket" })
      return
    }

    // Throttling: evita enviar localização muito frequentemente
    const now = Date.now()
    if (now - this.lastLocationSent < this.locationThrottle) {
      logger.debug("Envio de localização ignorado (throttle ativo)", {
        context: "WebSocket",
      })
      return
    }

    this.lastLocationSent = now

    const locationData: LocationData = {
      latitude,
      longitude,
      deliveryCode,
      timestamp: new Date().toISOString(),
    }

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
