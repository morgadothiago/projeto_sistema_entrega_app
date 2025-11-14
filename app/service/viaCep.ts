import Axios from "axios"
import Constants from "expo-constants"

const VIA_CEP_URL = Constants.expoConfig?.extra?.viaCepApiUrl || "https://viacep.com.br/ws"

const api = Axios.create({
  baseURL: VIA_CEP_URL,
  timeout: 5000,
})

export default api
