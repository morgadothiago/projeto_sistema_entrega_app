export const paymentsData = [
  {
    id: "1",
    bankName: "Banco do Brasil",
    agency: "1234-5",
    account: "67890-1",
    accountType: "Conta Corrente",
    holderName: "João Silva",
    cpf: "123.456.789-09",
    isDefault: true,
    icon: "bank",
  },
]

interface PixInfo {
  key: string
  type: string
}

interface DocumentInfo {
  rg: string
  cpf: string
  cnh: string
  category: string
  validity: string
  type: string
  payments: string[]
  pix?: PixInfo
}

interface PaymentsData {
  document: DocumentInfo
}

export const MOCK_PAYMENTS_DATA: PaymentsData = {
  document: {
    rg: "368694963",
    cpf: "123.456.789-00",
    cnh: "12345678900",
    category: "AD",
    validity: "2028-12-31",
    type: "DeliveryMan",
    payments: ["Pix", "CreditCard"],
    pix: {
      key: "sua_chave_pix@email.com",
      type: "email",
    },
  },
}

export const cashFlowData = [
  {
    id: "1",
    descricao: "Pagamento de corrida #123",
    valor: 25.5,
    data: "2024-06-01T10:30:00Z",
    tipo: "entrada",
  },
  {
    id: "2",
    descricao: "Comissão plataforma",
    valor: -5.0,
    data: "2024-06-01T10:35:00Z",
    tipo: "saida",
  },
  {
    id: "3",
    descricao: "Pagamento de corrida #124",
    valor: 18.0,
    data: "2024-06-01T11:45:00Z",
    tipo: "entrada",
  },
  {
    id: "4",
    descricao: "Comissão plataforma",
    valor: -3.6,
    data: "2024-06-01T11:50:00Z",
    tipo: "saida",
  },
]
