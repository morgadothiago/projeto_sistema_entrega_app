/**
 * Tipos para requisições e respostas da API
 * Substitui o uso de 'any' por tipos bem definidos
 */

/**
 * Dados para criação de nova conta
 */
export interface NewAccountData {
  name: string;
  dob: string; // ISO format: YYYY-MM-DD
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
 * Dados para upload de documento
 */
export interface DocumentUploadData {
  file: {
    uri: string;
    name: string;
    type: string;
  };
  documentType: 'CNH' | 'RG' | 'CPF' | 'COMPROVANTE_RESIDENCIA' | 'FOTO_VEICULO';
  documentNumber?: string;
  fullName?: string;
  issueDate?: string;
  expirationDate?: string;
}

/**
 * Dados para criar informação de pagamento Pix
 */
export interface PaymentInfoData {
  pixKey: string;
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
}

/**
 * Dados para atualizar perfil
 */
export interface UpdateProfileData {
  name?: string;
  dob?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  number?: string;
  complement?: string;
  vehicleType?: string;
  licensePlate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
}

/**
 * Dados para reset de senha
 */
export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

/**
 * Dados para solicitar código de reset
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Resposta de estatísticas do entregador
 */
export interface DeliverymanStatsResponse {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  cancelledDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  monthlyStats?: {
    month: string;
    deliveries: number;
    earnings: number;
  }[];
}

/**
 * Dados de estatísticas por dia para o gráfico
 */
export interface DailyStatsResponse {
  dayOfWeek: string; // "sunday", "monday", etc.
  hourlyData: number[]; // [30, 50, 35, 70, 80, 50]
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
}

/**
 * Resposta completa de relatórios
 */
export interface ReportsResponse {
  weeklyStats: {
    [key: string]: DailyStatsResponse;
  };
  summary: {
    totalDeliveries: number;
    completedDeliveries: number;
    pendingDeliveries: number;
    totalEarnings: number;
  };
  deliveries: Array<DeliveryFromAPI>;
}

/**
 * Dados de entrega retornados pela API
 */
export interface DeliveryFromAPI {
  id: string;
  code: string;
  status: string;
  day: string;
  customerName: string;
  address: string;
  value: number;
  createdAt: string;
  description?: string;
  date?: string;
}

/**
 * Dados de pagamento para confirmação
 */
export interface PaymentConfirmationData {
  amount: number;
  pixKey: string;
  description?: string;
}

/**
 * Resposta genérica da API com sucesso/erro
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Type guard para verificar se a resposta é de sucesso
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard para verificar se a resposta é de erro
 */
export function isApiError(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false;
}

/**
 * Dados de endereço retornados pela API ViaCEP
 */
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Erro customizado para API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: ApiErrorResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Configuração para requisições com timeout customizado
 */
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
}
