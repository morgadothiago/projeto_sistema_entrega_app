export type FormData = {
  name: string
  dob: Date | { day: number; month: number; year: number } | string
  cpf: string
  phone: string
  email: string
  password?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  zipCode?: string
  city?: string
  state?: string
  vehicleType?: string
  licensePlate?: string
  brand?: string
  model?: string
  year?: string | number
  color?: string
}
