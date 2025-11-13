/**
 * Helper de máscaras para inputs
 */

// Remove todos os caracteres não numéricos
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, "")
}

// Remove qualquer tipo de máscara (deixa apenas letras, números e @)
export const removeMask = (value: string): string => {
  if (!value) return ""
  // Remove tudo exceto letras, números, @ e ponto
  return value.replace(/[^\w@.]/g, "")
}

// Remove máscara específica para chave Pix (mantém @ para email)
export const removePixKeyMask = (value: string): string => {
  if (!value) return ""

  // Se é email, mantém como está
  if (value.includes("@")) {
    return value.trim()
  }

  // Se é UUID (chave aleatória), mantém como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return value.trim()
  }

  // Remove toda formatação (parênteses, pontos, hífens, espaços)
  return value.replace(/\D/g, "")
}

/**
 * Máscara para CPF: 999.999.999-99
 */
export const cpfMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  }
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

/**
 * Máscara para CNPJ: 99.999.999/9999-99
 */
export const cnpjMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  }
  if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
  }
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}

/**
 * Máscara para Telefone: (99) 99999-9999 ou (99) 9999-9999
 */
export const phoneMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  // Celular com 11 dígitos
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * Máscara para CEP: 99999-999
 */
export const cepMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

/**
 * Máscara dinâmica para CPF ou CNPJ
 */
export const cpfCnpjMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 11) {
    return cpfMask(value)
  } else {
    return cnpjMask(value)
  }
}

/**
 * Aplica máscara automaticamente baseado no conteúdo
 */
export const autoMask = (value: string): string => {
  const cleaned = removeNonNumeric(value)

  // Se tem parênteses, é telefone
  if (value.includes("(") || value.includes(")")) {
    return phoneMask(value)
  }

  // Se tem @, é email - não aplica máscara
  if (value.includes("@")) {
    return value
  }

  // Se tem letras ou hífens sem ser formatação, pode ser chave aleatória
  if (/[a-zA-Z]/.test(value) || value.includes("-")) {
    return value
  }

  // Apenas números
  if (cleaned.length === 11) {
    // Pode ser CPF ou telefone - verifica padrão
    // Telefone geralmente começa com DDD (11-99)
    const ddd = parseInt(cleaned.slice(0, 2))
    if (ddd >= 11 && ddd <= 99) {
      return phoneMask(value)
    }
    return cpfMask(value)
  }

  if (cleaned.length === 14) {
    return cnpjMask(value)
  }

  if (cleaned.length === 10) {
    return phoneMask(value)
  }

  return value
}

/**
 * Aplica máscara baseado no tipo de chave Pix detectado
 */
export const applyPixKeyMask = (value: string, type?: string): string => {
  if (!value) return ""

  // Se é email ou chave aleatória, não aplica máscara
  if (type === "Email" || type === "Chave Aleatória") {
    return value
  }

  const cleaned = removeNonNumeric(value)

  switch (type) {
    case "CPF":
      return cpfMask(value)
    case "CNPJ":
      return cnpjMask(value)
    case "Telefone":
      return phoneMask(value)
    default:
      // Tenta detectar automaticamente
      if (cleaned.length === 11) {
        // Verifica se é telefone (DDD + 9)
        const ddd = parseInt(cleaned.slice(0, 2))
        const thirdDigit = cleaned[2]
        if (ddd >= 11 && ddd <= 99 && thirdDigit === "9") {
          return phoneMask(value)
        }
        return cpfMask(value)
      }
      if (cleaned.length === 14) {
        return cnpjMask(value)
      }
      if (cleaned.length === 10) {
        return phoneMask(value)
      }
      return value
  }
}

/**
 * Máscara para data no formato DD/MM/YYYY
 */
export const dateMask = (value: string): string => {
  if (!value) return ""
  const cleaned = removeNonNumeric(value)

  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
}

/**
 * Remove máscara de placa de veículo
 */
export const removeLicensePlateMask = (value: string): string => {
  if (!value) return ""
  // Remove espaços e caracteres especiais, mantém apenas letras e números em maiúsculas
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
}

/**
 * Máscara para placa de veículo (Mercosul: ABC1D23 ou antiga: ABC-1234)
 */
export const licensePlateMask = (value: string): string => {
  if (!value) return ""

  // Remove espaços e converte para maiúsculas
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()

  // Formato Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length === 4) return `${cleaned.slice(0, 3)}${cleaned.slice(3)}`
  if (cleaned.length === 5) return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4)}`
  if (cleaned.length === 6) return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5)}`
  if (cleaned.length >= 7) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5, 7)}`
  }

  return cleaned
}
