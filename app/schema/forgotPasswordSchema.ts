import * as yup from "yup"

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email("Por favor, insira um email válido")
    .required("Email é obrigatório"),
})
