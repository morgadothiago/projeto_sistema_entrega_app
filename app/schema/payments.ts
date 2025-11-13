import * as yup from "yup"

type PaymentType = "Pix" | "Transferencia"

export const PaymentInfoSchema = yup.object({
  paymentType: yup
    .string()
    .oneOf(["Pix", "Transferencia"] as const, "Selecione um tipo de pagamento válido")
    .required("Selecione o tipo de pagamento"),

  // Campos para Pix
  pixKey: yup.string().when("paymentType", {
    is: "Pix",
    then: (schema) => schema.required("Informe a chave Pix"),
    otherwise: (schema) => schema.optional(),
  }),
  pixKeyType: yup.string().when("paymentType", {
    is: "Pix",
    then: (schema) =>
      schema
        .oneOf(
          ["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM"] as const,
          "Selecione um tipo de chave Pix válido"
        )
        .required("Selecione o tipo de chave Pix"),
    otherwise: (schema) => schema.optional(),
  }),

  // Campos para Transferência
  bankName: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe o nome do banco"),
    otherwise: (schema) => schema.optional(),
  }),
  agency: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe a agência"),
    otherwise: (schema) => schema.optional(),
  }),
  account: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe o número da conta"),
    otherwise: (schema) => schema.optional(),
  }),
  accountType: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Selecione o tipo de conta"),
    otherwise: (schema) => schema.optional(),
  }),
  holderName: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) => schema.required("Informe o nome do titular"),
    otherwise: (schema) => schema.optional(),
  }),
  cpf: yup.string().when("paymentType", {
    is: "Transferencia",
    then: (schema) =>
      schema
        .required("Informe o CPF do titular")
        .min(11, "CPF deve ter 11 dígitos")
        .max(14, "CPF inválido"),
    otherwise: (schema) => schema.optional(),
  }),
  bankCode: yup.string().optional(),
  agencyDigit: yup.string().optional(),
  accountDigit: yup.string().optional(),
  isDefault: yup.boolean().optional(),
})

export type PaymentFormData = {
  paymentType: PaymentType | undefined
  pixKey?: string | null
  pixKeyType?: string | null
  bankName?: string | null
  agency?: string | null
  account?: string | null
  bankCode?: string | null
  agencyDigit?: string | null
  accountDigit?: string | null
  accountType?: string | null
  holderName?: string | null
  cpf?: string | null
  isDefault?: boolean | null
}