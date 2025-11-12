import * as yup from "yup"

type DocumentType = "RG" | "CNH" | ""

export type DocumentFormData = {
  documentType: DocumentType
  documentImageUri: string
  documentNumber: string
  fullName?: string
  cpf?: string
  orgaoEmissao?: string
  cnhType?: "A" | "B" | "AB" | "D" | "E"
}

export const schema = yup.object().shape({
  address: yup.string().required("Endereço é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  number: yup.string().required("Número é obrigatório"),
  complement: yup.string(),
  state: yup.string().required("Estado é obrigatório"),
  zipCode: yup.string().required("CEP é obrigatório"),
})

export const UserInfoSchema = yup.object().shape({
  documentType: yup
    .string()
    .oneOf(["RG", "CNH", ""], "Selecione um tipo de documento válido")
    .required("Selecione o tipo de documento"),
  documentImageUri: yup.string().required("Adicione uma foto do documento"),
  documentNumber: yup.string().when("documentType", {
    is: (val: DocumentType) => val === "RG" || val === "CNH",
    then: (schema) => schema.required("Informe o número do documento"),
    otherwise: (schema) => schema.notRequired(),
  }),
  description: yup.string().notRequired(),
  fullName: yup.string().when("documentType", {
    is: (val: DocumentType) => val === "RG" || val === "CNH",
    then: (schema) => schema.required("Informe o nome completo"),
    otherwise: (schema) => schema.notRequired(),
  }),
  cpf: yup.string().when("documentType", {
    is: (val: DocumentType) => val === "RG" || val === "CNH",
    then: (schema) => schema.required("Informe o CPF"),
    otherwise: (schema) => schema.notRequired(),
  }),
  orgaoEmissao: yup.string().when("documentType", {
    is: "RG",
    then: (schema) => schema.required("Informe o órgão de emissão"),
    otherwise: (schema) => schema.notRequired(),
  }),
  cnhType: yup.string().when("documentType", {
    is: "CNH",
    then: (schema) =>
      schema
        .oneOf(["A", "B", "AB", "D", "E"], "Selecione um tipo de CNH válido")
        .required("Informe o tipo de CNH"),
    otherwise: (schema) => schema.notRequired(),
  }),
})
