/**
 * Utilitário para detecção e validação de chaves Pix
 * Versão consolidada e otimizada
 */

import { REGEX, PIX_KEY_TYPES } from './constants';

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';

/**
 * Remove caracteres não numéricos
 */
const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida se é um email válido
 */
const isEmail = (value: string): boolean => {
  return REGEX.PIX_KEY_EMAIL.test(value);
};

/**
 * Valida se é um telefone brasileiro válido
 * Formatos aceitos:
 * - (XX) XXXXX-XXXX (11 dígitos com DDD)
 * - (XX) XXXX-XXXX (10 dígitos com DDD)
 * - Sem formatação: 11 ou 10 dígitos começando com DDD válido
 */
const isPhone = (value: string): boolean => {
  const cleaned = removeNonNumeric(value);

  // Telefone tem 10 ou 11 dígitos
  if (cleaned.length !== 10 && cleaned.length !== 11) {
    return false;
  }

  // Verifica se começa com DDD válido (11 a 99)
  const ddd = parseInt(cleaned.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) {
    return false;
  }

  // Se tem 11 dígitos, o terceiro dígito deve ser 9 (celular)
  if (cleaned.length === 11) {
    const thirdDigit = cleaned[2];
    return thirdDigit === '9';
  }

  // Telefone fixo com 10 dígitos
  return cleaned.length === 10;
};

/**
 * Valida se é um CPF (11 dígitos)
 * Inclui lógica para diferenciar de telefone
 */
const isCPF = (value: string): boolean => {
  const cleaned = removeNonNumeric(value);

  // CPF tem 11 dígitos
  if (cleaned.length !== 11) {
    return false;
  }

  // Verifica se não é telefone
  // CPF não começa com DDD válido ou não tem padrão de telefone
  const possibleDDD = parseInt(cleaned.slice(0, 2), 10);
  const thirdDigit = cleaned[2];

  // Se parece com telefone (DDD válido + terceiro dígito 9), não é CPF
  if (possibleDDD >= 11 && possibleDDD <= 99 && thirdDigit === '9') {
    return false;
  }

  // Verifica se não é sequência repetida (111.111.111-11)
  const allSame = cleaned.split('').every((digit) => digit === cleaned[0]);
  if (allSame) {
    return false;
  }

  return true;
};

/**
 * Valida se é um CNPJ (14 dígitos)
 */
const isCNPJ = (value: string): boolean => {
  const cleaned = removeNonNumeric(value);

  if (cleaned.length !== 14) {
    return false;
  }

  // Verifica se não é sequência repetida
  const allSame = cleaned.split('').every((digit) => digit === cleaned[0]);
  return !allSame;
};

/**
 * Valida se é uma chave aleatória
 * Formatos aceitos:
 * - UUID: 8-4-4-4-12 caracteres hexadecimais
 * - Chave aleatória Pix: 32 caracteres alfanuméricos
 */
const isRandomKey = (value: string): boolean => {
  // UUID padrão
  if (REGEX.PIX_KEY_RANDOM.test(value)) {
    return true;
  }

  const cleaned = removeNonNumeric(value);

  // Chave aleatória do Pix (32 caracteres alfanuméricos)
  if (/^[a-zA-Z0-9]{32}$/.test(cleaned)) {
    return true;
  }

  // Formato com letras e números misturados (mínimo 32 caracteres)
  if (/[a-zA-Z]/.test(value) && /[0-9]/.test(value) && value.length >= 32) {
    return true;
  }

  return false;
};

/**
 * Detecta automaticamente o tipo de chave Pix
 * @param pixKey - Chave Pix a ser analisada
 * @returns Tipo de chave detectado ou undefined se não identificar
 */
export const detectPixKeyType = (pixKey: string): PixKeyType | undefined => {
  if (!pixKey || pixKey.trim() === '') {
    return undefined;
  }

  const trimmedKey = pixKey.trim();

  // Ordem de verificação importa!

  // 1. Email (tem @)
  if (isEmail(trimmedKey)) {
    return PIX_KEY_TYPES.EMAIL;
  }

  // 2. Chave Aleatória (formato UUID ou 32 caracteres)
  if (isRandomKey(trimmedKey)) {
    return PIX_KEY_TYPES.RANDOM;
  }

  // 3. CNPJ (14 dígitos - deve vir antes de CPF)
  if (isCNPJ(trimmedKey)) {
    return PIX_KEY_TYPES.CNPJ;
  }

  // 4. Telefone (10 ou 11 dígitos com DDD válido)
  if (isPhone(trimmedKey)) {
    return PIX_KEY_TYPES.PHONE;
  }

  // 5. CPF (11 dígitos, mas não telefone)
  if (isCPF(trimmedKey)) {
    return PIX_KEY_TYPES.CPF;
  }

  return undefined;
};

/**
 * Retorna uma descrição amigável do tipo de chave detectado
 * @param type - Tipo de chave Pix
 * @returns Descrição em português
 */
export const getPixKeyTypeDescription = (
  type: PixKeyType | undefined | string
): string => {
  if (!type || type === '') {
    return 'Digite sua chave Pix';
  }

  switch (type) {
    case PIX_KEY_TYPES.CPF:
      return 'CPF detectado (11 dígitos)';
    case PIX_KEY_TYPES.CNPJ:
      return 'CNPJ detectado (14 dígitos)';
    case PIX_KEY_TYPES.EMAIL:
      return 'E-mail detectado';
    case PIX_KEY_TYPES.PHONE:
      return 'Telefone detectado (com DDD)';
    case PIX_KEY_TYPES.RANDOM:
      return 'Chave Aleatória (UUID ou código gerado)';
    default:
      return 'Digite sua chave Pix';
  }
};

/**
 * Retorna exemplos de chaves válidas para cada tipo
 * @param type - Tipo de chave Pix
 * @returns Exemplo formatado
 */
export const getPixKeyExample = (type: PixKeyType): string => {
  const examples: Record<PixKeyType, string> = {
    CPF: '12345678901 ou 123.456.789-01',
    CNPJ: '12345678000190 ou 12.345.678/0001-90',
    EMAIL: 'usuario@exemplo.com',
    PHONE: '11987654321 ou (11) 98765-4321',
    RANDOM: '123e4567-e89b-12d3-a456-426614174000',
  };

  return examples[type] || '';
};

/**
 * Valida e formata a chave Pix de acordo com o tipo
 * @param value - Chave Pix
 * @param type - Tipo de chave
 * @returns Chave formatada
 */
export const formatPixKey = (value: string, type: PixKeyType): string => {
  const cleaned = removeNonNumeric(value);

  switch (type) {
    case PIX_KEY_TYPES.CPF:
      // Formato: XXX.XXX.XXX-XX
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      return value;

    case PIX_KEY_TYPES.CNPJ:
      // Formato: XX.XXX.XXX/XXXX-XX
      if (cleaned.length === 14) {
        return cleaned.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          '$1.$2.$3/$4-$5'
        );
      }
      return value;

    case PIX_KEY_TYPES.PHONE:
      // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return value;

    case PIX_KEY_TYPES.EMAIL:
    case PIX_KEY_TYPES.RANDOM:
    default:
      return value;
  }
};

/**
 * Remove formatação de chave Pix mantendo apenas os dados essenciais
 * @param value - Chave Pix formatada
 * @returns Chave sem formatação
 */
export const cleanPixKey = (value: string): string => {
  if (!value) return '';

  // Se é email, mantém como está
  if (value.includes('@')) {
    return value.trim();
  }

  // Se é UUID (chave aleatória), mantém como está
  if (REGEX.PIX_KEY_RANDOM.test(value)) {
    return value.trim();
  }

  // Remove toda formatação (parênteses, pontos, hífens, espaços)
  return removeNonNumeric(value);
};

/**
 * Valida se a chave Pix é válida para o tipo especificado
 * @param value - Chave Pix
 * @param type - Tipo esperado
 * @returns true se válido
 */
export const validatePixKey = (value: string, type: PixKeyType): boolean => {
  const detectedType = detectPixKeyType(value);
  return detectedType === type;
};
