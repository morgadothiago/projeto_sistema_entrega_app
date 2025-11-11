/**
 * Utilitário para detecção automática de tipo de chave Pix
 */

export type PixKeyType = "CPF" | "CNPJ" | "Email" | "Telefone" | "Chave Aleatória"

/**
 * Remove caracteres especiais comuns em chaves Pix formatadas
 */
export const cleanPixKey = (value: string): string => {
  return value.replace(/[.\-/\s()]/g, "")
}

/**
 * Valida se é um email válido
 */
export const isValidEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Valida se é um CPF (11 dígitos)
 */
export const isValidCPF = (value: string): boolean => {
  const cleanValue = cleanPixKey(value)
  return /^\d{11}$/.test(cleanValue)
}

/**
 * Valida se é um CNPJ (14 dígitos)
 */
export const isValidCNPJ = (value: string): boolean => {
  const cleanValue = cleanPixKey(value)
  return /^\d{14}$/.test(cleanValue)
}

/**
 * Valida se é um telefone brasileiro válido (10 ou 11 dígitos com DDD)
 * Formato aceito: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const isValidPhone = (value: string): boolean => {
  const cleanValue = cleanPixKey(value)

  // Deve ter 10 ou 11 dígitos
  if (!/^\d{10,11}$/.test(cleanValue)) {
    return false
  }

  // DDD válido (11-99)
  const ddd = parseInt(cleanValue.substring(0, 2))
  if (ddd < 11 || ddd > 99) {
    return false
  }

  // Se tiver 11 dígitos, o terceiro deve ser 9 (celular)
  if (cleanValue.length === 11 && cleanValue[2] !== "9") {
    return false
  }

  return true
}

/**
 * Valida se é uma chave aleatória (UUID ou formato Pix)
 * UUID padrão: 8-4-4-4-12 caracteres hexadecimais
 * Exemplo: 123e4567-e89b-12d3-a456-426614174000
 */
export const isValidRandomKey = (value: string): boolean => {
  const cleanValue = cleanPixKey(value)

  // UUID format
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) {
    return true
  }

  // Chave aleatória do Pix (32 caracteres alfanuméricos)
  if (/^[a-zA-Z0-9]{32}$/.test(cleanValue)) {
    return true
  }

  // Formato com letras e números misturados (mínimo 32 caracteres)
  if (/[a-zA-Z]/.test(cleanValue) && /[0-9]/.test(cleanValue) && cleanValue.length >= 32) {
    return true
  }

  return false
}

/**
 * Detecta automaticamente o tipo de chave Pix baseado no valor digitado
 * @param value - Chave Pix digitada pelo usuário
 * @returns Tipo de chave detectado ou undefined se não conseguir identificar
 */
export const detectPixKeyType = (value: string): PixKeyType | undefined => {
  if (!value || value.trim() === "") {
    return undefined
  }

  // Ordem de verificação importa!

  // 1. Email (deve vir primeiro por causa do @)
  if (isValidEmail(value)) {
    return "Email"
  }

  // 2. CNPJ (14 dígitos - deve vir antes de CPF)
  if (isValidCNPJ(value)) {
    return "CNPJ"
  }

  // 3. CPF (11 dígitos)
  if (isValidCPF(value)) {
    return "CPF"
  }

  // 4. Telefone (10 ou 11 dígitos com DDD válido)
  if (isValidPhone(value)) {
    return "Telefone"
  }

  // 5. Chave Aleatória (UUID ou formato Pix)
  if (isValidRandomKey(value)) {
    return "Chave Aleatória"
  }

  return undefined
}

/**
 * Formata a chave Pix de acordo com o tipo detectado
 * @param value - Chave Pix
 * @param type - Tipo de chave
 * @returns Chave formatada
 */
export const formatPixKey = (value: string, type: PixKeyType): string => {
  const cleanValue = cleanPixKey(value)

  switch (type) {
    case "CPF":
      // Formato: XXX.XXX.XXX-XX
      if (cleanValue.length === 11) {
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
      }
      return value

    case "CNPJ":
      // Formato: XX.XXX.XXX/XXXX-XX
      if (cleanValue.length === 14) {
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
      }
      return value

    case "Telefone":
      // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (cleanValue.length === 11) {
        return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      } else if (cleanValue.length === 10) {
        return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      }
      return value

    case "Email":
    case "Chave Aleatória":
    default:
      return value
  }
}

/**
 * Retorna uma mensagem explicativa sobre o tipo de chave
 */
export const getPixKeyTypeDescription = (type: PixKeyType): string => {
  const descriptions: Record<PixKeyType, string> = {
    CPF: "Chave Pix do tipo CPF (11 dígitos)",
    CNPJ: "Chave Pix do tipo CNPJ (14 dígitos)",
    Email: "Chave Pix do tipo E-mail",
    Telefone: "Chave Pix do tipo Telefone (com DDD)",
    "Chave Aleatória": "Chave Pix Aleatória (UUID ou código gerado pelo banco)",
  }

  return descriptions[type]
}

/**
 * Exemplos de chaves válidas para cada tipo
 */
export const getPixKeyExample = (type: PixKeyType): string => {
  const examples: Record<PixKeyType, string> = {
    CPF: "12345678901 ou 123.456.789-01",
    CNPJ: "12345678000190 ou 12.345.678/0001-90",
    Email: "usuario@exemplo.com",
    Telefone: "11987654321 ou (11) 98765-4321",
    "Chave Aleatória": "123e4567-e89b-12d3-a456-426614174000",
  }

  return examples[type]
}
