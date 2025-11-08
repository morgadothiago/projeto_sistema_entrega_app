export interface Company {
  name: string
  andress: string
  phone: string
}

export interface ApiOrder {
  Company: Company
  code: string
  completedAt: string | null
  email: string
  height: number
  information: string
  isFragile: boolean
  length: number
  price: string
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED"
  telefone: string
  vehicleType: string
  weight: number
  width: number
  phone: string
  andress: string
}
