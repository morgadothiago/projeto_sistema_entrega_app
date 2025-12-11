/**
 * Constantes centralizadas da aplicação
 * Evita magic numbers e facilita manutenção
 */

// Z-Index Hierarchy
export const Z_INDEX = {
  MODAL: 1000,
  OVERLAY: 999,
  DROPDOWN: 500,
  HEADER: 100,
  TAB_BAR: 50,
  CONTENT: 1,
} as const;

// FlatList Performance Settings
export const FLATLIST_CONFIG = {
  MAX_TO_RENDER_PER_BATCH: 10,
  UPDATE_CELLS_BATCHING_PERIOD: 50,
  WINDOW_SIZE: 5,
  INITIAL_NUM_TO_RENDER: 10,
  MAX_TO_RENDER_PER_BATCH_SMALL: 8,
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  IMAGE_FADE: 0, // Para melhor performance
} as const;

// Input Masks Max Lengths
export const INPUT_MAX_LENGTH = {
  CPF: 14, // 000.000.000-00
  CNPJ: 18, // 00.000.000/0000-00
  PHONE: 15, // (00) 00000-0000
  CEP: 9, // 00000-000
  CREDIT_CARD: 19, // 0000 0000 0000 0000
  CVV: 4,
  DATE: 10, // DD/MM/YYYY
} as const;

// Validation Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  PHONE: /^\(\d{2}\) \d{4,5}-\d{4}$/,
  CEP: /^\d{5}-?\d{3}$/,
  ONLY_NUMBERS: /^\d+$/,
  PIX_KEY_PHONE: /^\+?5?\d{10,11}$/,
  PIX_KEY_CPF: /^\d{11}$/,
  PIX_KEY_CNPJ: /^\d{14}$/,
  PIX_KEY_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PIX_KEY_RANDOM: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,
} as const;

// Status de Pagamento
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Status de Entrega
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
} as const;

// Tipos de Documento
export const DOCUMENT_TYPES = {
  CNH: 'CNH',
  RG: 'RG',
  CPF: 'CPF',
  COMPROVANTE_RESIDENCIA: 'COMPROVANTE_RESIDENCIA',
  FOTO_VEICULO: 'FOTO_VEICULO',
} as const;

// Mensagens de Erro Comuns
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  GENERIC_ERROR: 'Ocorreu um erro. Tente novamente.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  TIMEOUT: 'Tempo esgotado. Tente novamente.',

  // Específicos
  FETCH_DELIVERIES: 'Não foi possível carregar as entregas',
  FETCH_PAYMENTS: 'Não foi possível carregar os pagamentos',
  FETCH_USER: 'Não foi possível carregar dados do usuário',
  UPLOAD_DOCUMENT: 'Erro ao enviar documento',
  UPDATE_PROFILE: 'Erro ao atualizar perfil',
  INVALID_CREDENTIALS: 'Email ou senha inválidos',
  INVALID_CEP: 'CEP inválido',
} as const;

// Mensagens de Sucesso
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Perfil atualizado com sucesso',
  DOCUMENT_UPLOADED: 'Documento enviado com sucesso',
  PASSWORD_RESET: 'Senha redefinida com sucesso',
  PAYMENT_COMPLETED: 'Pagamento realizado com sucesso',
  DELIVERY_COMPLETED: 'Entrega concluída com sucesso',
} as const;

// Dimensões de Imagem
export const IMAGE_SIZES = {
  AVATAR: {
    WIDTH: 80,
    HEIGHT: 80,
  },
  THUMBNAIL: {
    WIDTH: 100,
    HEIGHT: 100,
  },
  CARD: {
    WIDTH: 300,
    HEIGHT: 200,
  },
  FULL: {
    WIDTH: 1080,
    HEIGHT: 1920,
  },
} as const;

// Qualidade de Imagem para Upload
export const IMAGE_QUALITY = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
  THUMBNAIL: 0.3,
} as const;

// Tipos de Veículos
export const VEHICLE_TYPES = {
  MOTO: 'moto',
  CARRO: 'carro',
  VAN: 'van',
  CAMINHAO: 'caminhao',
} as const;

// Tipos de Pix
export const PIX_KEY_TYPES = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  RANDOM: 'RANDOM',
} as const;

// Export all as default também
export default {
  Z_INDEX,
  FLATLIST_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
  ANIMATION,
  INPUT_MAX_LENGTH,
  REGEX,
  PAYMENT_STATUS,
  DELIVERY_STATUS,
  DOCUMENT_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  IMAGE_SIZES,
  IMAGE_QUALITY,
  VEHICLE_TYPES,
  PIX_KEY_TYPES,
};
