import Axios from "axios"

const api = Axios.create({
  baseURL: "https://viacep.com.br/ws/",
})

export default api
