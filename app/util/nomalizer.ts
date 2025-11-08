// Função para validar se um campo está preenchido
function validateField(value: any): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === "string" && value.trim() === "") return false
  return true
}

// Função para validar CPF (formato básico)
function validateCPF(cpf: string): boolean {
  if (!cpf) return false
  const cpfClean = cpf.replace(/[^\d]/g, "")
  return cpfClean.length === 11
}

// Função para validar telefone (formato básico)
function validatePhone(phone: string): boolean {
  if (!phone) return false
  const phoneClean = phone.replace(/[^\d]/g, "")
  return phoneClean.length >= 10
}

// Função para validar CEP (formato básico)
function validateZipCode(zipCode: string): boolean {
  if (!zipCode) return false
  const zipCodeClean = zipCode.replace(/[^\d]/g, "")
  return zipCodeClean.length === 8
}

export function normalizeData(userInfo: any, accessData: any) {
  // Validar campos obrigatórios
  const missingFields = []

  if (!validateField(userInfo.name)) missingFields.push("Nome")
  if (!validateField(userInfo.dob)) missingFields.push("Data de nascimento")
  if (!validateField(userInfo.cpf) || !validateCPF(userInfo.cpf))
    missingFields.push("CPF")
  if (!validateField(userInfo.phone) || !validatePhone(userInfo.phone))
    missingFields.push("Telefone")
  if (!validateField(userInfo.address)) missingFields.push("Endereço")
  if (!validateField(userInfo.city)) missingFields.push("Cidade")
  if (!validateField(userInfo.state)) missingFields.push("Estado")
  if (!validateField(userInfo.zipCode) || !validateZipCode(userInfo.zipCode))
    missingFields.push("CEP")
  if (!validateField(accessData.email)) missingFields.push("Email")
  if (!validateField(accessData.password)) missingFields.push("Senha")

  // Validar campos do veículo
  if (!validateField(userInfo.vehicleType))
    missingFields.push("Tipo de veículo")
  if (!validateField(userInfo.licensePlate))
    missingFields.push("Placa do veículo")
  if (!validateField(userInfo.brand)) missingFields.push("Marca do veículo")
  if (!validateField(userInfo.model)) missingFields.push("Modelo do veículo")
  if (!validateField(userInfo.year)) missingFields.push("Ano do veículo")
  if (!validateField(userInfo.color)) missingFields.push("Cor do veículo")

  // Se houver campos faltando, lançar erro
  if (missingFields.length > 0) {
    let errorMessage = ""
    if (missingFields.length === 1) {
      errorMessage = `O campo ${missingFields[0]} é obrigatório.`
    } else if (missingFields.length <= 3) {
      errorMessage = `Os campos ${missingFields.join(", ")} são obrigatórios.`
    } else {
      errorMessage = `Vários campos obrigatórios não foram preenchidos: ${missingFields.join(
        ", "
      )}`
    }
    throw new Error(errorMessage)
  }

  // Garantir que a data de nascimento esteja no formato YYYY-MM-DD
  let formattedDob = ""

  try {
    if (userInfo.dob instanceof Date) {
      formattedDob = userInfo.dob.toISOString().split("T")[0]
    } else if (typeof userInfo.dob === "string") {
      // Se já for uma string, verificar se está no formato correto
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (dateRegex.test(userInfo.dob)) {
        formattedDob = userInfo.dob
      } else if (/^\d{8}$/.test(userInfo.dob)) {
        // Formato DDMMYYYY (como "01021992")
        const day = userInfo.dob.substring(0, 2)
        const month = userInfo.dob.substring(2, 4)
        const year = userInfo.dob.substring(4, 8)
        formattedDob = `${year}-${month}-${day}`
      } else {
        // Tentar converter de outros formatos de string (DD/MM/YYYY)
        const parts = userInfo.dob.split("/")
        if (parts.length === 3) {
          formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
    } else if (userInfo.dob && typeof userInfo.dob === "object") {
      // Se for um objeto com year, month, day
      if (userInfo.dob.year && userInfo.dob.month && userInfo.dob.day) {
        formattedDob = `${userInfo.dob.year}-${String(
          userInfo.dob.month
        ).padStart(2, "0")}-${String(userInfo.dob.day).padStart(2, "0")}`
      }
    }

    // Verificar se a data foi formatada corretamente
    if (!formattedDob || !/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) {
      throw new Error(
        "Formato de data de nascimento inválido. Use o formato DD/MM/AAAA."
      )
    }
  } catch (error) {
    console.error("Erro ao formatar data de nascimento:", error)
    throw new Error(
      "Formato de data de nascimento inválido. Use o formato DD/MM/AAAA."
    )
  }

  // Formatar CPF (remover caracteres não numéricos)
  const formattedCPF = userInfo.cpf ? userInfo.cpf.replace(/[^\d]/g, "") : ""

  // Formatar telefone (remover caracteres não numéricos)
  const formattedPhone = userInfo.phone
    ? userInfo.phone.replace(/[^\d]/g, "")
    : ""

  // Formatar vehicleType (garantir que seja uma string)
  const vehicleType =
    typeof userInfo.vehicleType === "object" && userInfo.vehicleType?.value
      ? userInfo.vehicleType.value
      : typeof userInfo.vehicleType === "string"
      ? userInfo.vehicleType
      : ""

  return {
    name: userInfo.name,
    dob: formattedDob,
    cpf: formattedCPF,
    phone: formattedPhone,
    email: accessData.email,
    password: accessData.password,
    address: userInfo.address,
    city: userInfo.city,
    state: userInfo.state,
    zipCode: userInfo.zipCode,
    number: userInfo.number,
    complement: userInfo.complement,
    vehicleType: vehicleType,
    licensePlate: userInfo.licensePlate || "",
    brand: userInfo.brand || "",
    model: userInfo.model || "",
    year: userInfo.year?.toString() || "",
    color: userInfo.color || "",
  }
}
