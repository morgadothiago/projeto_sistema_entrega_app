import * as yup from "yup"

export const schema = yup.object().shape({
  address: yup.string().required("Endereço é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  number: yup.string().required("Número é obrigatório"),
  complement: yup.string(),
  state: yup.string().required("Estado é obrigatório"),
  zipCode: yup.string().required("CEP é obrigatório"),
})
