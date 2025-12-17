/**
 * Logger centralizado para o aplicativo
 * Em desenvolvimento: exibe logs no console
 * Em produção: pode ser integrado com serviços como Sentry, Crashlytics, etc.
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  context?: string;
  data?: any;
  [key: string]: any;
}

class Logger {
  private isDevelopment = __DEV__;

  private formatMessage(level: LogLevel, message: string, options?: LoggerOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${context} ${message}`;
  }

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  /**
   * Log genérico - usar para informações gerais
   */
  log(message: string, options?: LoggerOptions): void {
    if (this.shouldLog()) {
      console.log(this.formatMessage('log', message, options));
      if (options?.data) {
        console.log('Data:', options.data);
      }
    }
  }

  /**
   * Info - informações importantes mas não críticas
   */
  info(message: string, options?: LoggerOptions): void {
    if (this.shouldLog()) {
      console.info(this.formatMessage('info', message, options));
      if (options?.data) {
        console.info('Data:', options.data);
      }
    }
  }

  /**
   * Warning - avisos que não quebram a aplicação
   */
  warn(message: string, options?: LoggerOptions): void {
    if (this.shouldLog()) {
      console.warn(this.formatMessage('warn', message, options));
      if (options?.data) {
        console.warn('Data:', options.data);
      }
    }
  }

  /**
   * Error - erros que precisam de atenção
   * Em produção, enviar para serviço de monitoramento
   */
  error(message: string, error?: Error | unknown, options?: LoggerOptions): void {
    const formattedMessage = this.formatMessage('error', message, options);

    if (this.isDevelopment) {
      console.error(formattedMessage);
      if (error) {
        console.error('Error details:', error);
      }
      if (options?.data) {
        console.error('Additional data:', options.data);
      }
    } else {
      // Em produção, enviar para Sentry, Crashlytics, etc.
      // Exemplo:
      // Sentry.captureException(error, {
      //   extra: { message, ...options }
      // });
      // console.error(formattedMessage);
    }
  }

  /**
   * Debug - informações detalhadas apenas em desenvolvimento
   */
  debug(message: string, options?: LoggerOptions): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, options));
      if (options?.data) {
        console.debug('Data:', options.data);
      }
    }
  }

  /**
   * Útil para logar chamadas de API
   */
  api(method: string, url: string, status?: number, data?: any): void {
    if (this.shouldLog()) {
      const emoji = status && status >= 200 && status < 300 ? '✅' : '❌';
      console.log(
        `${emoji} API ${method.toUpperCase()} ${url}`,
        status ? `Status: ${status}` : ''
      );
      if (data) {
        console.log('Response data:', data);
      }
    }
  }
}

// Exportar instância única (singleton)
export const logger = new Logger();

// Exportar também como default para imports diferentes
export default logger;
