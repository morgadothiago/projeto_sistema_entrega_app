export interface Company {
  name: string
  andress: string
  phone: string
}

export interface ClientAddress {
  street: string
  number: string
  city: string
  state: string
  zipCode: string
}

export interface ApiOrder {
  id: number
  Company: Company
  code: string
  completedAt: string | null
  email: string
  height: number
  information: string
  isFragile: boolean
  length: number
  price: string
  status: "PENDING" | "IN_TRANSIT" | "IN_PROGRESS" | "DELIVERED"
  telefone: string
  vehicleType: string
  weight: number
  width: number
  phone: string
  andress: string
  ClientAddress?: ClientAddress | ClientAddress[]
}
