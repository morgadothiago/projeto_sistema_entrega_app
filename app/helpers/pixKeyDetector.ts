/**
 * Helper para detectar o tipo de chave Pix
 */

import { removeNonNumeric } from "./masks"

export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM"

/**
 * Valida se é um email
 */
const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * Valida se é um telefone brasileiro
 * Formatos aceitos:
 * - (XX) XXXXX-XXXX (11 dígitos com DDD)
 * - (XX) XXXX-XXXX (10 dígitos com DDD)
 * - Sem formatação: 11 ou 10 dígitos começando com DDD válido
 */
const isPhone = (value: string): boolean => {
  const cleaned = removeNonNumeric(value)

  // Telefone tem 10 ou 11 dígitos
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return false
  }

  // Verifica se começa com DDD válido (11 a 99)
  const ddd = parseInt(cleaned.slice(0, 2))
  if (ddd < 11 || ddd > 99) {
    return false
  }

  // Se tem 11 dígitos, o terceiro dígito deve ser 9 (celular)
  if (cleaned.length === 11) {
    const thirdDigit = cleaned[2]
    return thirdDigit === "9"
  }

  // Telefone fixo com 10 dígitos
  return cleaned.length === 10
}

/**
 * Valida se é um CPF (11 dígitos)
 */
const isCPF = (value: string): boolean => {
  const cleaned = removeNonNumeric(value)

  // CPF tem 11 dígitos
  if (cleaned.length !== 11) {
    return false
  }

  // Verifica se não é telefone
  // CPF não começa com DDD válido ou não tem padrão de telefone
  const possibleDDD = parseInt(cleaned.slice(0, 2))
  const thirdDigit = cleaned[2]

  // Se parece com telefone (DDD válido + terceiro dígito 9), não é CPF
  if (possibleDDD >= 11 && possibleDDD <= 99 && thirdDigit === "9") {
    return false
  }

  // Verifica se não é sequência repetida (111.111.111-11)
  const allSame = cleaned.split("").every(digit => digit === cleaned[0])
  if (allSame) {
    return false
  }

  return true
}

/**
 * Valida se é um CNPJ (14 dígitos)
 */
const isCNPJ = (value: string): boolean => {
  const cleaned = removeNonNumeric(value)
  return cleaned.length === 14
}

/**
 * Valida se é uma chave aleatória (formato UUID)
 */
const isRandomKey = (value: string): boolean => {
  // UUID tem formato: 8-4-4-4-12 caracteres separados por hífen
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

/**
 * Detecta automaticamente o tipo de chave Pix
 */
export const detectPixKeyType = (pixKey: string): PixKeyType | undefined => {
  if (!pixKey || pixKey.trim() === "") {
    return undefined
  }

  const trimmedKey = pixKey.trim()

  // Verifica na ordem de prioridade

  // 1. Email (tem @)
  if (isEmail(trimmedKey)) {
    return "EMAIL"
  }

  // 2. Chave Aleatória (formato UUID)
  if (isRandomKey(trimmedKey)) {
    return "RANDOM"
  }

  // 3. CNPJ (14 dígitos)
  if (isCNPJ(trimmedKey)) {
    return "CNPJ"
  }

  // 4. Telefone (10 ou 11 dígitos com DDD válido)
  if (isPhone(trimmedKey)) {
    return "PHONE"
  }

  // 5. CPF (11 dígitos, mas não telefone)
  if (isCPF(trimmedKey)) {
    return "CPF"
  }

  // 6. Se não se encaixa em nenhum padrão específico, considera chave aleatória
  if (trimmedKey.length > 0) {
    return "RANDOM"
  }

  return undefined
}

/**
 * Retorna uma descrição do tipo de chave detectado
 */
export const getPixKeyTypeDescription = (type: PixKeyType | undefined | string): string => {
  if (!type || type === "") {
    return "Digite sua chave Pix"
  }

  switch (type) {
    case "CPF":
      return "CPF detectado (11 dígitos)"
    case "CNPJ":
      return "CNPJ detectado (14 dígitos)"
    case "EMAIL":
      return "E-mail detectado"
    case "PHONE":
      return "Telefone detectado (com DDD)"
    case "RANDOM":
      return "Chave Aleatória (UUID ou outro formato)"
    default:
      return "Digite sua chave Pix"
  }
}
