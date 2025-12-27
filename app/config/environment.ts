/**
 * Configuração de Ambiente
 * 
 * Este arquivo centraliza a configuração de ambiente da aplicação.
 * Usa a variável APP_ENV injetada pelo EAS Build para determinar
 * qual configuração usar.
 */

import Constants from 'expo-constants';

// Tipo do ambiente
export type AppEnvironment = 'development' | 'test' | 'staging' | 'production';

// Configuração por ambiente
interface EnvironmentConfig {
  apiUrl: string;
  wsUrl: string;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Configurações de cada ambiente
const ENV_CONFIG: Record<AppEnvironment, EnvironmentConfig> = {
  development: {
    apiUrl: 'https://api.quicktecnologia.com/',
    wsUrl: 'wss://api.quicktecnologia.com',
    enableAnalytics: false,
    enableCrashReporting: false,
    debugMode: true,
    logLevel: 'debug',
  },
  test: {
    apiUrl: 'https://api.quicktecnologia.com/',
    wsUrl: 'wss://api.quicktecnologia.com',
    enableAnalytics: false,
    enableCrashReporting: true,
    debugMode: true,
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://api.quicktecnologia.com/',
    wsUrl: 'wss://api.quicktecnologia.com',
    enableAnalytics: true,
    enableCrashReporting: true,
    debugMode: true,
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.quicktecnologia.com/',
    wsUrl: 'wss://api.quicktecnologia.com',
    enableAnalytics: true,
    enableCrashReporting: true,
    debugMode: false,
    logLevel: 'error',
  },
};

// Pega o ambiente atual (injetado pelo EAS Build)
const getAppEnvironment = (): AppEnvironment => {
  const env = Constants.expoConfig?.extra?.APP_ENV;
  
  // Fallback para development se não definido
  if (!env || !['development', 'test', 'staging', 'production'].includes(env)) {
    console.warn('APP_ENV não definido. Usando development como fallback.');
    return 'development';
  }
  
  return env as AppEnvironment;
};

// Ambiente atual
export const APP_ENV = getAppEnvironment();

// Configuração do ambiente atual
export const ENV = ENV_CONFIG[APP_ENV];

// Exports individuais para facilitar uso
export const API_BASE_URL = ENV.apiUrl;
export const WS_BASE_URL = ENV.wsUrl;
export const IS_DEV = APP_ENV === 'development';
export const IS_TEST = APP_ENV === 'test';
export const IS_STAGING = APP_ENV === 'staging';
export const IS_PROD = APP_ENV === 'production';

// Log de configuração no startup (apenas em dev)
if (IS_DEV) {
  console.log('Ambiente:', APP_ENV);
  console.log('API URL:', API_BASE_URL);
  console.log('WebSocket URL:', WS_BASE_URL);
}

export default ENV;
