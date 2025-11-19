/**
 * Utilitários de máscaras para inputs
 * Versão consolidada e otimizada
 */

import { INPUT_MAX_LENGTH } from './constants';

/**
 * Remove todos os caracteres não numéricos
 * @param value - String com formatação
 * @returns String apenas com números
 */
export const removeNonNumeric = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Remove qualquer tipo de máscara (deixa apenas letras, números e @)
 * @param value - String com formatação
 * @returns String limpa
 */
export const removeMask = (value: string): string => {
  if (!value) return '';
  // Remove tudo exceto letras, números, @ e ponto
  return value.replace(/[^\w@.]/g, '');
};

/**
 * Remove máscara específica para chave Pix (mantém @ para email)
 * @param value - Chave Pix formatada
 * @returns Chave Pix limpa
 */
export const removePixKeyMask = (value: string): string => {
  if (!value) return '';

  // Se é email, mantém como está
  if (value.includes('@')) {
    return value.trim();
  }

  // Se é UUID (chave aleatória), mantém como está
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return value.trim();
  }

  // Remove toda formatação (parênteses, pontos, hífens, espaços)
  return removeNonNumeric(value);
};

/**
 * Máscara para CPF: 999.999.999-99
 * @param value - CPF com ou sem formatação
 * @param forDisplay - Se true, retorna formatado; se false, retorna apenas números
 * @returns CPF formatado ou limpo
 */
export const cpfMask = (value: string, forDisplay: boolean = true): string => {
  const cleaned = removeNonNumeric(value);

  if (!forDisplay) {
    return cleaned;
  }

  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  }
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
};

/**
 * Alias para manter compatibilidade
 */
export const CPFMask = cpfMask;

/**
 * Máscara para CNPJ: 99.999.999/9999-99
 * @param value - CNPJ com ou sem formatação
 * @param forDisplay - Se true, retorna formatado; se false, retorna apenas números
 * @returns CNPJ formatado ou limpo
 */
export const cnpjMask = (value: string, forDisplay: boolean = true): string => {
  const cleaned = removeNonNumeric(value);

  if (!forDisplay) {
    return cleaned;
  }

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  }
  if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  }
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

/**
 * Máscara para Telefone: (99) 99999-9999 ou (99) 9999-9999
 * @param value - Telefone com ou sem formatação
 * @param forDisplay - Se true, retorna formatado; se false, retorna apenas números
 * @returns Telefone formatado ou limpo
 */
export const phoneMask = (value: string, forDisplay: boolean = true): string => {
  const cleaned = removeNonNumeric(value);

  if (!forDisplay) {
    return cleaned;
  }

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  // Celular com 11 dígitos
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

/**
 * Alias para manter compatibilidade
 */
export const PhoneMask = phoneMask;

/**
 * Máscara para CEP: 99999-999
 * @param value - CEP com ou sem formatação
 * @returns CEP formatado
 */
export const cepMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
};

/**
 * Máscara dinâmica para CPF ou CNPJ
 * Detecta automaticamente qual aplicar baseado no tamanho
 * @param value - CPF ou CNPJ
 * @returns Valor formatado
 */
export const cpfCnpjMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  if (cleaned.length <= 11) {
    return cpfMask(value);
  } else {
    return cnpjMask(value);
  }
};

/**
 * Máscara para data no formato DD/MM/YYYY
 * @param value - Data sem formatação
 * @returns Data formatada
 */
export const dateMask = (value: string): string => {
  if (!value) return '';
  const cleaned = removeNonNumeric(value);

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

/**
 * Alias para manter compatibilidade
 */
export const maskDate = dateMask;

/**
 * Formata data para o padrão brasileiro DD/MM/YYYY
 * @param date - Data em formato ISO ou objeto Date
 * @returns Data formatada em PT-BR
 */
export const formatDateToBR = (date: string | Date | undefined): string => {
  if (!date) return '';

  let d: Date;
  if (typeof date === 'string') {
    // Extrai apenas a parte da data (YYYY-MM-DD) de uma string ISO
    const datePart = date.split('T')[0];
    if (datePart) {
      // Reconstrói como data UTC para parsing consistente
      d = new Date(datePart + 'T00:00:00Z');
    } else {
      return ''; // Formato de string de data inválido
    }
  } else {
    d = date;
  }

  if (isNaN(d.getTime())) return ''; // Data inválida

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC', // Garante que a data seja interpretada como UTC
  });
};

/**
 * Formata data ISO para formato brasileiro
 * @param isoDate - Data em formato ISO (YYYY-MM-DD)
 * @returns Data em formato BR (DD/MM/YYYY)
 */
export const formatISOToBR = (isoDate: string): string => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return '';

  return `${day}/${month}/${year}`;
};

/**
 * Converte data BR para ISO
 * @param brDate - Data em formato BR (DD/MM/YYYY)
 * @returns Data em formato ISO (YYYY-MM-DD)
 */
export const formatBRToISO = (brDate: string): string => {
  if (!brDate) return '';

  const [day, month, year] = brDate.split('/');
  if (!day || !month || !year) return '';

  return `${year}-${month}-${day}`;
};

/**
 * Remove máscara de placa de veículo
 * @param value - Placa formatada
 * @returns Placa sem formatação em maiúsculas
 */
export const removeLicensePlateMask = (value: string): string => {
  if (!value) return '';
  // Remove espaços e caracteres especiais, mantém apenas letras e números em maiúsculas
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

/**
 * Máscara para placa de veículo (Mercosul: ABC1D23 ou antiga: ABC-1234)
 * @param value - Placa sem formatação
 * @returns Placa formatada
 */
export const licensePlateMask = (value: string): string => {
  if (!value) return '';

  // Remove espaços e converte para maiúsculas
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  // Formato Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length === 4) return `${cleaned.slice(0, 3)}${cleaned.slice(3)}`;
  if (cleaned.length === 5)
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4)}`;
  if (cleaned.length === 6)
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5)}`;
  if (cleaned.length >= 7) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)}${cleaned.slice(4, 5)}${cleaned.slice(5, 7)}`;
  }

  return cleaned;
};

/**
 * Aplica máscara automaticamente baseado no conteúdo
 * @param value - Valor a ser mascarado
 * @returns Valor com máscara apropriada
 */
export const autoMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);

  // Se tem parênteses, é telefone
  if (value.includes('(') || value.includes(')')) {
    return phoneMask(value);
  }

  // Se tem @, é email - não aplica máscara
  if (value.includes('@')) {
    return value;
  }

  // Se tem letras ou hífens sem ser formatação, pode ser chave aleatória
  if (/[a-zA-Z]/.test(value) || value.includes('-')) {
    return value;
  }

  // Apenas números
  if (cleaned.length === 11) {
    // Pode ser CPF ou telefone - verifica padrão
    // Telefone geralmente começa com DDD (11-99)
    const ddd = parseInt(cleaned.slice(0, 2), 10);
    if (ddd >= 11 && ddd <= 99) {
      return phoneMask(value);
    }
    return cpfMask(value);
  }

  if (cleaned.length === 14) {
    return cnpjMask(value);
  }

  if (cleaned.length === 10) {
    return phoneMask(value);
  }

  return value;
};

/**
 * Aplica máscara baseado no tipo de chave Pix detectado
 * @param value - Chave Pix
 * @param type - Tipo de chave detectado
 * @returns Chave formatada
 */
export const applyPixKeyMask = (value: string, type?: string): string => {
  if (!value) return '';

  // Se é email ou chave aleatória, não aplica máscara
  if (type === 'EMAIL' || type === 'RANDOM') {
    return value;
  }

  const cleaned = removeNonNumeric(value);

  switch (type) {
    case 'CPF':
      return cpfMask(value);
    case 'CNPJ':
      return cnpjMask(value);
    case 'PHONE':
      return phoneMask(value);
    default:
      // Tenta detectar automaticamente
      if (cleaned.length === 11) {
        // Verifica se é telefone (DDD + 9)
        const ddd = parseInt(cleaned.slice(0, 2), 10);
        const thirdDigit = cleaned[2];
        if (ddd >= 11 && ddd <= 99 && thirdDigit === '9') {
          return phoneMask(value);
        }
        return cpfMask(value);
      }
      if (cleaned.length === 14) {
        return cnpjMask(value);
      }
      if (cleaned.length === 10) {
        return phoneMask(value);
      }
      return value;
  }
};

/**
 * Máscara para cartão de crédito: 9999 9999 9999 9999
 * @param value - Número do cartão
 * @returns Número formatado
 */
export const creditCardMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ').substr(0, 19) : cleaned;
};

/**
 * Máscara para CVV: 999 ou 9999
 * @param value - CVV
 * @returns CVV limitado
 */
export const cvvMask = (value: string): string => {
  const cleaned = removeNonNumeric(value);
  return cleaned.slice(0, INPUT_MAX_LENGTH.CVV);
};

/**
 * Máscara para valor monetário: R$ 1.234,56
 * @param value - Valor em centavos ou string
 * @returns Valor formatado
 */
export const moneyMask = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

/**
 * Remove formatação de valor monetário
 * @param value - Valor formatado (R$ 1.234,56)
 * @returns Número puro
 */
export const removeMoneyMask = (value: string): number => {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};
