/**
 * Custom hook para fazer requisições HTTP com gerenciamento de estado
 * Reduz duplicação de código de fetch em componentes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosRequestConfig, AxiosError } from 'axios';
import { api } from '../service/api';
import { logger } from '../utils/logger';

export interface UseFetchOptions extends AxiosRequestConfig {
  /**
   * Se true, a requisição é executada automaticamente ao montar o componente
   * Se false, precisa chamar refetch() manualmente
   */
  enabled?: boolean;
  /**
   * Callback executado quando a requisição tem sucesso
   */
  onSuccess?: (data: any) => void;
  /**
   * Callback executado quando a requisição falha
   */
  onError?: (error: Error) => void;
  /**
   * Número de tentativas em caso de erro
   */
  retryCount?: number;
  /**
   * Delay entre tentativas (ms)
   */
  retryDelay?: number;
}

export interface UseFetchResult<T> {
  /**
   * Dados retornados pela API
   */
  data: T | null;
  /**
   * Indica se a requisição está em andamento
   */
  loading: boolean;
  /**
   * Erro retornado pela requisição
   */
  error: Error | null;
  /**
   * Re-executa a requisição
   */
  refetch: () => Promise<void>;
  /**
   * Executa a requisição com novos parâmetros
   */
  mutate: (newData?: T) => void;
}

/**
 * Hook para fazer requisições GET
 */
export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);

  const {
    enabled = true,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
    ...axiosConfig
  } = options;

  // Usar ref para evitar re-renders desnecessários
  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!url) return;

    try {
      setLoading(true);
      setError(null);

      logger.api('GET', url);

      const response = await api.get<T>(url, axiosConfig);

      if (isMountedRef.current) {
        setData(response.data);
        setError(null);
        retryCountRef.current = 0;

        if (onSuccess) {
          onSuccess(response.data);
        }

        logger.api('GET', url, response.status, response.data);
      }
    } catch (err) {
      const error = err as AxiosError;

      logger.error('Erro ao buscar dados', error, {
        context: 'useFetch',
        data: { url, status: error.response?.status },
      });

      if (isMountedRef.current) {
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          logger.info(`Tentativa ${retryCountRef.current} de ${retryCount}`, {
            context: 'useFetch',
          });

          setTimeout(() => {
            fetchData();
          }, retryDelay);
          return;
        }

        const errorMessage =
          (error.response?.data as any)?.message ||
          error.message ||
          'Erro ao buscar dados';

        const errorObj = new Error(errorMessage);
        setError(errorObj);
        setData(null);

        if (onError) {
          onError(errorObj);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [url, axiosConfig, onSuccess, onError, retryCount, retryDelay]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, fetchData]);

  const mutate = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

/**
 * Hook para fazer requisições POST/PUT/DELETE com gerenciamento de estado
 */
export function useMutation<TData = any, TVariables = any>(
  method: 'post' | 'put' | 'delete',
  baseUrl: string,
  options: UseFetchOptions = {}
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { onSuccess, onError } = options;

  const mutate = useCallback(
    async (variables?: TVariables, urlSuffix: string = '') => {
      const url = baseUrl + urlSuffix;

      try {
        setLoading(true);
        setError(null);

        logger.api(method.toUpperCase(), url);

        let response;
        if (method === 'delete') {
          response = await api[method]<TData>(url);
        } else {
          response = await api[method]<TData>(url, variables);
        }

        setData(response.data);
        setError(null);

        if (onSuccess) {
          onSuccess(response.data);
        }

        logger.api(method.toUpperCase(), url, response.status, response.data);

        return response.data;
      } catch (err) {
        const error = err as AxiosError;

        logger.error(`Erro ao executar ${method.toUpperCase()}`, error, {
          context: 'useMutation',
          data: { url, status: error.response?.status },
        });

        const errorMessage =
          (error.response?.data as any)?.message ||
          error.message ||
          `Erro ao executar ${method}`;

        const errorObj = new Error(errorMessage);
        setError(errorObj);

        if (onError) {
          onError(errorObj);
        }

        throw errorObj;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, method, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

export default useFetch;
