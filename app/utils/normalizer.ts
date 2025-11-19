/**
 * Utilitários para normalização e validação de dados de registro
 * Versão refatorada com tipagem adequada
 */

import { removeNonNumeric } from './masks';

/**
 * Informações do usuário no formulário de registro
 */
export interface UserInfo {
  name: string;
  dob: string | Date;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  number?: string;
  complement?: string;
  vehicleType: string | { value: string };
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: number | string;
  color?: string;
}

/**
 * Dados de acesso (email e senha)
 */
export interface AccessData {
  email: string;
  password: string;
}

/**
 * Dados normalizados para envio à API
 */
export interface NormalizedData {
  name: string;
  dob: string;
  cpf: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  number?: string;
  complement?: string;
  vehicleType: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
}

/**
 * Valida se um campo está preenchido
 */
function validateField(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

/**
 * Valida CPF (formato básico - apenas tamanho)
 */
function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  const cpfClean = removeNonNumeric(cpf);
  return cpfClean.length === 11;
}

/**
 * Valida telefone (formato básico - mínimo 10 dígitos)
 */
function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const phoneClean = removeNonNumeric(phone);
  return phoneClean.length >= 10;
}

/**
 * Valida CEP (formato básico - 8 dígitos)
 */
function validateZipCode(zipCode: string): boolean {
  if (!zipCode) return false;
  const zipCodeClean = removeNonNumeric(zipCode);
  return zipCodeClean.length === 8;
}

/**
 * Formata data de nascimento para o formato ISO (YYYY-MM-DD)
 */
function formatDateOfBirth(dob: string | Date | object): string {
  // Se for objeto Date
  if (dob instanceof Date) {
    return dob.toISOString().split('T')[0];
  }

  // Se for string
  if (typeof dob === 'string') {
    // Já está no formato ISO (YYYY-MM-DD)
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (isoRegex.test(dob)) {
      return dob;
    }

    // Formato DDMMYYYY (como "01021992")
    if (/^\d{8}$/.test(dob)) {
      const day = dob.substring(0, 2);
      const month = dob.substring(2, 4);
      const year = dob.substring(4, 8);
      return `${year}-${month}-${day}`;
    }

    // Formato DD/MM/YYYY
    const parts = dob.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Se for objeto com propriedades year, month, day
  if (typeof dob === 'object' && dob !== null) {
    const dobObj = dob as { year?: number | string; month?: number | string; day?: number | string };
    if (dobObj.year && dobObj.month && dobObj.day) {
      const year = dobObj.year.toString();
      const month = dobObj.month.toString().padStart(2, '0');
      const day = dobObj.day.toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  throw new Error('Formato de data de nascimento inválido. Use o formato DD/MM/AAAA.');
}

/**
 * Extrai o valor do tipo de veículo
 * Suporta tanto string quanto objeto com propriedade 'value'
 */
function extractVehicleType(vehicleType: string | { value: string } | undefined): string {
  if (!vehicleType) return '';

  if (typeof vehicleType === 'object' && 'value' in vehicleType) {
    return vehicleType.value;
  }

  if (typeof vehicleType === 'string') {
    return vehicleType;
  }

  return '';
}

/**
 * Verifica se o tipo de veículo é bike/bicicleta
 */
function isBikeVehicle(vehicleType: string): boolean {
  const vehicleTypeValue = vehicleType.trim().toLowerCase();
  return vehicleTypeValue.includes('bike') || vehicleTypeValue.includes('bicicleta');
}

/**
 * Normaliza e valida dados do formulário de registro
 * @throws {Error} Se houver campos obrigatórios faltando ou inválidos
 */
export function normalizeData(userInfo: UserInfo, accessData: AccessData): NormalizedData {
  const missingFields: string[] = [];

  // Extrair tipo de veículo
  const vehicleType = extractVehicleType(userInfo.vehicleType);

  // Validar campos obrigatórios do usuário
  if (!validateField(userInfo.name)) missingFields.push('Nome');
  if (!validateField(userInfo.dob)) missingFields.push('Data de nascimento');
  if (!validateField(userInfo.cpf) || !validateCPF(userInfo.cpf)) missingFields.push('CPF');
  if (!validateField(userInfo.phone) || !validatePhone(userInfo.phone)) missingFields.push('Telefone');
  if (!validateField(userInfo.address)) missingFields.push('Endereço');
  if (!validateField(userInfo.city)) missingFields.push('Cidade');
  if (!validateField(userInfo.state)) missingFields.push('Estado');
  if (!validateField(userInfo.zipCode) || !validateZipCode(userInfo.zipCode)) missingFields.push('CEP');

  // Validar campos de acesso
  if (!validateField(accessData.email)) missingFields.push('Email');
  if (!validateField(accessData.password)) missingFields.push('Senha');

  // Validar campos do veículo
  if (!validateField(vehicleType)) missingFields.push('Tipo de veículo');

  const isBike = isBikeVehicle(vehicleType);

  // Se não for bike, validar campos do veículo
  if (!isBike) {
    if (!validateField(userInfo.licensePlate)) missingFields.push('Placa do veículo');
    if (!validateField(userInfo.brand)) missingFields.push('Marca do veículo');
    if (!validateField(userInfo.model)) missingFields.push('Modelo do veículo');
    if (!validateField(userInfo.year)) missingFields.push('Ano do veículo');
    if (!validateField(userInfo.color)) missingFields.push('Cor do veículo');
  }

  // Se houver campos faltando, lançar erro com mensagem apropriada
  if (missingFields.length > 0) {
    let errorMessage = '';
    if (missingFields.length === 1) {
      errorMessage = `O campo ${missingFields[0]} é obrigatório.`;
    } else if (missingFields.length <= 3) {
      errorMessage = `Os campos ${missingFields.join(', ')} são obrigatórios.`;
    } else {
      errorMessage = `Vários campos obrigatórios não foram preenchidos: ${missingFields.join(', ')}`;
    }
    throw new Error(errorMessage);
  }

  // Formatar data de nascimento
  let formattedDob: string;
  try {
    formattedDob = formatDateOfBirth(userInfo.dob);

    // Validar formato final
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) {
      throw new Error('Formato de data inválido');
    }
  } catch (error) {
    throw new Error('Formato de data de nascimento inválido. Use o formato DD/MM/AAAA.');
  }

  // Formatar CPF (remover caracteres não numéricos)
  const formattedCPF = removeNonNumeric(userInfo.cpf);

  // Formatar telefone (remover caracteres não numéricos)
  const formattedPhone = removeNonNumeric(userInfo.phone);

  // Formatar CEP (remover caracteres não numéricos)
  const formattedZipCode = removeNonNumeric(userInfo.zipCode);

  // Retornar dados normalizados
  return {
    name: userInfo.name.trim(),
    dob: formattedDob,
    cpf: formattedCPF,
    phone: formattedPhone,
    email: accessData.email.trim().toLowerCase(),
    password: accessData.password,
    address: userInfo.address.trim(),
    city: userInfo.city.trim(),
    state: userInfo.state.trim(),
    zipCode: formattedZipCode,
    number: userInfo.number?.trim(),
    complement: userInfo.complement?.trim(),
    vehicleType: vehicleType.trim(),
    licensePlate: isBike ? undefined : userInfo.licensePlate?.trim() || '',
    brand: isBike ? undefined : userInfo.brand?.trim() || '',
    model: isBike ? undefined : userInfo.model?.trim() || '',
    year: isBike ? undefined : userInfo.year?.toString() || '',
    color: isBike ? undefined : userInfo.color?.trim() || '',
  };
}

/**
 * Valida se um email tem formato válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida força da senha
 * @returns Object com isValid e mensagem de erro se houver
 */
export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter no mínimo 6 caracteres' };
  }

  if (password.length > 50) {
    return { isValid: false, message: 'A senha deve ter no máximo 50 caracteres' };
  }

  // Opcional: adicionar mais regras de validação
  // if (!/[A-Z]/.test(password)) {
  //   return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
  // }

  return { isValid: true };
}
