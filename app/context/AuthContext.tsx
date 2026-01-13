import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { clearSession, getItem, saveItem } from "../helpers/Storage"
import { api, login } from "../service/api"
import { ApiResponse } from "../types/ApiResponse"
import { STORAGE_KEYS } from "../utils/constants"

type AuthContextData = {
  user: ApiResponse | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<ApiResponse>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Helpers do AsyncStorage removidos em favor do import global

  // 🔹 Carrega token e usuário do AsyncStorage ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storagedToken = await getItem(STORAGE_KEYS.TOKEN)
        const storagedUser = await getItem(STORAGE_KEYS.USER)

        if (storagedToken && storagedUser) {
          try {
            const parsedUser = JSON.parse(storagedUser)
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${storagedToken}`
            setToken(storagedToken)
            setUser(parsedUser)
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError)
            // Limpa dados corrompidos
            await clearSession()
          }
        }
      } catch (error) {
        console.error('Error loading storage data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStorageData()
  }, [])

  // 🔹 Login
  const signIn = useCallback(async (email: string, password: string): Promise<ApiResponse> => {
    try {
      const { token: responseToken, user: userData } = await login({
        email,
        password,
      })

      console.log('📡 Resposta da API de Login:')
      console.log('🔑 Token:', responseToken ? 'Recebido' : 'Não recebido')
      console.log('👤 Dados do usuário:', userData)
      console.log('📊 Status do usuário:', userData?.status)

      // Atualiza estado
      setUser(userData)
      setToken(responseToken)

      // Atualiza header global do Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${responseToken}`

      // Persiste no AsyncStorage (chaves padronizadas)
      await saveItem(STORAGE_KEYS.TOKEN, responseToken)
      await saveItem(STORAGE_KEYS.USER, JSON.stringify(userData))

      console.log('💾 Dados salvos no AsyncStorage')

      // Retorna o usuário para permitir verificação imediata do status
      return userData
    } catch (error: any) {
      console.error('❌ Erro no signIn:', error)
      throw error
    }
  }, [])

  // 🔹 Logout
  const signOut = useCallback(async () => {
    try {
      setUser(null)
      setToken(null)
      await clearSession()
      delete api.defaults.headers.common["Authorization"]
    } catch (error) { }
  }, [])

  const contextValue = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signOut,
    }),
    [user, token, loading, signIn, signOut]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
