import * as yup from "yup"

type PaymentType = "Pix" | "Transferencia" | ""

export type PaymentFormData = {
  paymentType: PaymentType
  pixKey?: string
  pixKeyType?: "CPF" | "CNPJ" | "Email" | "Telefone" | "Chave Aleatória"
  bankName?: string
  agency?: string
  accountNumber?: string
}

export const PaymentInfoSchema = yup.object().shape({
  paymentType: yup
    .string()
    .oneOf(["Pix", "Transferencia"], "Selecione um tipo de pagamento válido")
    .required("Selecione o tipo de pagamento"),

  // Campos para Pix
  pixKey: yup.string().when("paymentType", {
    is: "Pix",
    then: (schema) => schema.required("Informe a chave Pix"),
    otherwise: (schema) => schema.notRequired(),
  }),
  pixKeyType: yup.string().when("paymentType", {
    is: "Pix",
    then: (schema) =>
      schema
        .oneOf(
          ["CPF", "CNPJ", "Email", "Telefone", "Chave Aleatória"],
          "Selecione um tipo de chave Pix válido"
        )
        .required("Selecione o tipo de chave Pix"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Campos para Transferência
  bankName: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe o nome do banco"),
    otherwise: (schema) => schema.notRequired(),
  }),
  agency: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe a agência"),
    otherwise: (schema) => schema.notRequired(),
  }),
  accountNumber: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe o número da conta"),
    otherwise: (schema) => schema.notRequired(),
  }),
})