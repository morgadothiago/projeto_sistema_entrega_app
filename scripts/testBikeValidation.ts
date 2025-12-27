import { normalizeData } from "../app/utils/normalizer"

const bikeUserInfo = {
  name: "Bike Tester",
  dob: "1990-01-01",
  cpf: "123.456.789-00",
  phone: "(11) 99999-9999",
  address: "Rua das Bikes",
  city: "São Paulo",
  state: "SP",
  zipCode: "01001000",
  number: "123",
  complement: "",
  vehicleType: { label: "Bike", value: "Bike" },
  licensePlate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
}

const accessData = {
  email: "bike@example.com",
  password: "123456",
}

try {
  const result = normalizeData(bikeUserInfo, accessData)
} catch (error) {
  process.exit(1)
}
