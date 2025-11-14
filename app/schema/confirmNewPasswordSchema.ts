import * as yup from "yup"

export const confirmNewPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "As senhas não coincidem")
    .required("Confirmação de senha é obrigatória"),
})
