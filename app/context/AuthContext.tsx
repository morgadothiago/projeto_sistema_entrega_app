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

type AuthContextData = {
  user: ApiResponse | null
  token: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
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
        const storagedToken = await getItem("@token")
        const storagedUser = await getItem("@user")

        if (storagedToken && storagedUser) {
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storagedToken}`
          setToken(storagedToken)
          setUser(JSON.parse(storagedUser))
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    loadStorageData()
  }, [])

  // 🔹 Login
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { token: responseToken, user: userData } = await login({
        email,
        password,
      })

      // Atualiza estado
      setUser(userData)
      setToken(responseToken)

      // Atualiza header global do Axios
      api.defaults.headers.common["Authorization"] = `Bearer ${responseToken}`

      // Persiste no AsyncStorage (chaves padronizadas com '@')
      await saveItem("@token", responseToken)
      await saveItem("@user", JSON.stringify(userData))
    } catch (error: any) {
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
