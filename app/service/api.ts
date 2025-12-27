import Axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import Toast from "react-native-toast-message"
import { clearSession, getItem, getToken, saveItem } from "../helpers/Storage"
import { ApiResponse } from "../types/ApiResponse"
import { STORAGE_KEYS } from "../utils/constants"
import { requestCache } from "../utils/requestCache"

interface LoginData {
  email: string
  password: string
}

// Resposta esperada do backend
interface LoginResponse {
  token: string
  refreshToken?: string
  user: ApiResponse
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL

const api = Axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "IEMobile",
  },
  timeout: 10000, // Timeout de 10 segundos
})

// -------------------- LOGIN --------------------
export async function login(data: LoginData): Promise<LoginResponse> {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post(
      "/auth/login",
      data
    )

    const { token, user, refreshToken } = response.data

    if (!token || !user) {
      throw new Error("Resposta inválida do servidor.")
    }

    // Define token global no axios
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`

    // Salvar no AsyncStorage
    await saveItem(STORAGE_KEYS.TOKEN, token)
    if (refreshToken) {
      await saveItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }
    await saveItem(STORAGE_KEYS.USER, JSON.stringify(user))

    Toast.show({
      type: "success",
      text1: "Login bem-sucedido!",
      text2: `Bem-vindo, ${user.name || "usuário"} 👋`,
    })

    return { token, user, refreshToken }
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro no login",
      text2: error.response?.data?.message || "Verifique suas credenciais.",
    })

    throw error
  }
}

// -------------------- CRIAÇÃO DE CONTA --------------------
export async function newAccount(data: any) {
  try {
    // Tenta normalizar os dados antes de enviar para a API
    // Se houver erro de validação, será capturado no catch

    const response = await api.post("/auth/signup/deliveryman", data)

    Toast.show({
      type: "success",
      text1: "Sucesso!",
      text2: "Conta criada com sucesso 👌",
    })

    return response.data
  } catch (error: any) {
    // Verifica se é um erro de validação local (do normalizeData)
    if (error.message && !error.response) {
      Toast.show({
        type: "error",
        text1: "Erro de validação",
        text2: error.message,
      })
      return
    }

    let errorMessage = "Verifique os dados enviados."

    if (error.response?.data?.message) {
      const errorData = error.response.data.message

      // Mapeamento de campos para nomes amigáveis em português
      const fieldNames: Record<string, string> = {
        name: "Nome",
        dob: "Data de nascimento",
        cpf: "CPF",
        phone: "Telefone",
        address: "Endereço",
        city: "Cidade",
        state: "Estado",
        zipCode: "CEP",
        licensePlate: "Placa do veículo",
        brand: "Marca do veículo",
        model: "Modelo do veículo",
        year: "Ano do veículo",
        color: "Cor do veículo",
        vehicleType: "Tipo de veículo",
        email: "E-mail",
        password: "Senha",
      }

      if (Array.isArray(errorData) && errorData.length > 0) {
        // Coletar todos os campos com erro
        const invalidFields: string[] = []

        errorData.forEach((item: any) => {
          const fieldName = Object.keys(item)[0]
          if (fieldName) {
            const friendlyName = fieldNames[fieldName] || fieldName
            invalidFields.push(friendlyName)
          }
        })

        if (invalidFields.length > 0) {
          if (invalidFields.length === 1) {
            errorMessage = `O campo ${invalidFields[0]} está inválido. Por favor, verifique.`
          } else if (invalidFields.length <= 3) {
            errorMessage = `Os campos ${invalidFields.join(
              ", "
            )} estão inválidos. Por favor, verifique.`
          } else {
            errorMessage = `Vários campos estão inválidos. Por favor, verifique todos os campos obrigatórios.`
          }
        }
      } else if (typeof errorData === "string") {
        errorMessage = errorData
      }
    }

    Toast.show({
      type: "error",
      text1: "Erro no cadastro!",
      text2: errorMessage,
    })

    throw new Error(
      error.response?.data?.message ||
      "Erro ao criar nova conta. Verifique os dados enviados."
    )
  }
}

// -------------------- ESQUECI A SENHA --------------------
export async function forgotPassword(data: { email: string }) {
  try {
    const response = await api.post("/auth/password/forgot", data)

    Toast.show({
      type: "success",
      text1: "Email enviado!",
      text2: "Verifique sua caixa de entrada para redefinir sua senha.",
    })

    return response.data
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro ao enviar email",
      text2:
        error.response?.data?.message ||
        "Não foi possível enviar o email. Tente novamente.",
    })

    throw error
  }
}

// -------------------- REDEFINIÇÃO DE SENHA --------------------
export async function resetPassword(data: {
  email: string
  newPassword: string
}) {
  try {
    const response = await api.post("/auth/password/reset", data)

    Toast.show({
      type: "success",
      text1: "Senha redefinida!",
      text2: "Sua senha foi alterada com sucesso.",
    })

    return response.data
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Erro ao redefinir senha",
      text2:
        error.response?.data?.message ||
        "Não foi possível alterar a senha. Tente novamente.",
    })

    throw error
  }
}

// -------------------- INTERCEPTORES GLOBAIS --------------------

// Configuração de cache por endpoint (em minutos)
const CACHE_CONFIG: Record<string, number> = {
  '/deliveryman': 3, // 3 minutos para dados financeiros
  '/delivery': 2, // 2 minutos para lista de entregas
  '/balance': 3, // 3 minutos para saldo
}

// Função para determinar se deve usar cache
function shouldUseCache(config: InternalAxiosRequestConfig): boolean {
  // Apenas GET requests são cacheadas
  if (config.method?.toLowerCase() !== 'get') return false

  // Ignora se explicitamente desabilitado
  if ((config as any).skipCache === true) return false

  return true
}

// Função para obter TTL do cache baseado na URL
function getCacheTTL(url: string = ''): number {
  for (const [path, ttl] of Object.entries(CACHE_CONFIG)) {
    if (url.includes(path)) {
      return ttl * 60 * 1000 // Converte minutos para ms
    }
  }
  return 5 * 60 * 1000 // 5 minutos padrão
}

api.interceptors.request.use(
  async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // ===== CACHE E DEDUPLICAÇÃO DE REQUESTS =====
    if (shouldUseCache(config)) {
      const url = config.url || ''

      // 1. Verifica se há dados em cache
      const cachedData = requestCache.get(url, config)
      if (cachedData) {
        // Retorna dados do cache sem fazer request
        return Promise.reject({
          config,
          response: {
            data: cachedData,
            status: 200,
            statusText: 'OK (from cache)',
            headers: {},
            config,
          },
          isFromCache: true,
        })
      }

      // 2. Verifica se há request idêntica em andamento (deduplicação)
      const pendingRequest = requestCache.getPendingRequest(url, config)
      if (pendingRequest) {
        // Aguarda a request existente ao invés de criar nova
        return pendingRequest.then((data) => {
          return Promise.reject({
            config,
            response: {
              data,
              status: 200,
              statusText: 'OK (from pending)',
              headers: {},
              config,
            },
            isFromCache: true,
          })
        })
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    // ===== ARMAZENA RESPOSTA NO CACHE =====
    const config = response.config as InternalAxiosRequestConfig
    if (shouldUseCache(config)) {
      const url = config.url || ''
      const ttl = getCacheTTL(url)
      requestCache.set(url, response.data, config, ttl)
    }
    return response
  },
  async (error) => {
    // Se é resposta do cache, retorna sucesso
    if (error.isFromCache) {
      return Promise.resolve(error.response)
    }

    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN)
        if (refreshToken) {
          const response = await Axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          })

          const { token } = response.data

          if (token) {
            await saveItem(STORAGE_KEYS.TOKEN, token)
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Falha no refresh, desloga
      }
    }

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message

      // 🔒 Token inválido ou expirado (e falha no refresh)
      if (status === 401) {
        Toast.show({
          type: "error",
          text1: "Sessão expirada",
          text2: "Faça login novamente.",
        })

        await clearSession()
        // Aqui você pode redirecionar o usuário para a tela de login
      }

      // ⚠️ Erros de validação ou requisição
      if (status >= 400 && status < 500 && status !== 401 && status !== 404) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: message || "Algo deu errado na sua solicitação.",
        })
      }
    } else if (error.request) {
      Toast.show({
        type: "error",
        text1: "Falha na conexão",
        text2: "Não foi possível se conectar ao servidor.",
      })
    } else {
      Toast.show({
        type: "error",
        text1: "Erro inesperado",
        text2: error.message,
      })
    }

    return Promise.reject(error)
  }
)

// Função auxiliar para invalidar cache
export function invalidateCache(pattern?: string) {
  requestCache.invalidate(pattern)
}

export function invalidateDeliveriesCache() {
  requestCache.invalidateDeliveries()
}

export function invalidateFinancialCache() {
  requestCache.invalidateFinancial()
}

export { api }
