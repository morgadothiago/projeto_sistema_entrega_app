/**
 * Sistema de cache inteligente para requisições API
 * Evita requisições duplicadas e reduz carga no servidor
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutos padrão

  /**
   * Gera chave única para cache baseada na URL e configuração
   */
  private getCacheKey(url: string, config?: any): string {
    const method = config?.method || 'GET';
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${method}:${url}:${params}`;
  }

  /**
   * Verifica se há uma requisição idêntica em andamento
   * Se sim, retorna a promise existente (request deduplication)
   */
  getPendingRequest(url: string, config?: any): Promise<any> | null {
    const key = this.getCacheKey(url, config);
    const pending = this.pendingRequests.get(key);

    if (pending) {
      // Limpar requisições pendentes muito antigas (30 segundos)
      if (Date.now() - pending.timestamp > 30000) {
        this.pendingRequests.delete(key);
        return null;
      }
      return pending.promise;
    }

    return null;
  }

  /**
   * Registra uma requisição em andamento
   */
  setPendingRequest(url: string, promise: Promise<any>, config?: any): void {
    const key = this.getCacheKey(url, config);
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    // Remove da lista de pendentes quando completar
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Busca dados do cache se ainda válidos
   */
  get<T>(url: string, config?: any): T | null {
    const key = this.getCacheKey(url, config);
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Verifica se expirou
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Armazena dados no cache
   */
  set<T>(url: string, data: T, config?: any, ttl?: number): void {
    const key = this.getCacheKey(url, config);
    const cacheTTL = ttl || this.defaultTTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheTTL
    });
  }

  /**
   * Invalida cache específico ou por padrão
   */
  invalidate(urlPattern?: string): void {
    if (!urlPattern) {
      this.cache.clear();
      return;
    }

    // Remove entradas que contêm o padrão
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalida cache relacionado a entregas
   */
  invalidateDeliveries(): void {
    this.invalidate('/delivery');
  }

  /**
   * Invalida cache relacionado a dados financeiros
   */
  invalidateFinancial(): void {
    this.invalidate('/deliveryman');
    this.invalidate('/balance');
  }

  /**
   * Limpa cache expirado (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retorna estatísticas do cache (útil para debug)
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Inicia limpeza automática periódica do cache
   */
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  startAutoCleanup(): void {
    if (this.cleanupInterval) return; // Já está rodando

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Para a limpeza automática (útil para testes e cleanup)
   */
  stopAutoCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Instância singleton
export const requestCache = new RequestCache();

// Inicia limpeza automática do cache
requestCache.startAutoCleanup();
