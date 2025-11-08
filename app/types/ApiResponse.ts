interface Address {
  city: string
  complement: string
  country: string
  number: string
  state: string
  street: string
  zipCode: string
}

interface Vehicle {
  brand: string
  color: string
  licensePlate: string
  model: string
  year: string
}

interface DeliveryMan {
  Address: Address
  Vehicle: Vehicle
  cpf: string
  dob: string // ou Date se você for converter
  name: string
  phone: string
  document: Document[]
  payments: PaymentOption[]
}

interface Balance {
  amount: string
}

interface ApiResponse {
  id: number
  name?: string
  email: string
  role: string
  Balance: Balance
  Company: null | any // se você tiver tipagem da Company, substitua "any"
  DeliveryMan: DeliveryMan | null // pode ser null dependendo do role
  Extract: any[] // se você tiver tipagem dos extratos, substitua "any"
  Status: Status[]
}
interface Status {
  id: number
  name: string
  payments: PaymentOption[]
}

interface Document {
  number: string
  type: string
}

enum PaymentOption {
  Pix = "Pix",
  CreditCard = "CreditCard",
}

export type { ApiResponse }
