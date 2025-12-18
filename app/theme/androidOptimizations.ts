import { Platform, PressableAndroidRippleConfig } from 'react-native';

/**
 * Configuração otimizada de ripple effect para Android
 *
 * @param color - Cor do ripple (padrão: verde cibernético com 30% opacidade)
 * @param borderless - Se o ripple deve ultrapassar os limites do componente
 * @returns Config do ripple ou undefined para iOS
 *
 * @example
 * ```tsx
 * <Pressable android_ripple={getRippleConfig()}>
 *   <Text>Botão com ripple</Text>
 * </Pressable>
 * ```
 */
export const getRippleConfig = (
  color: string = 'rgba(0, 255, 179, 0.3)',
  borderless: boolean = false
): PressableAndroidRippleConfig | undefined => {
  if (Platform.OS !== 'android') return undefined;

  return {
    color,
    borderless,
    radius: -1, // Auto - ajusta ao tamanho do componente
  };
};

/**
 * Props otimizadas para TouchableOpacity por plataforma
 *
 * Android: Resposta mais rápida (delayPressIn: 0)
 * iOS: Resposta padrão iOS (delayPressIn: 50ms)
 *
 * @returns Objeto com props de performance otimizadas
 *
 * @example
 * ```tsx
 * <TouchableOpacity {...getTouchableProps()}>
 *   <Text>Botão otimizado</Text>
 * </TouchableOpacity>
 * ```
 */
export const getTouchableProps = () => {
  return Platform.select({
    android: {
      activeOpacity: 0.85,
      delayPressIn: 0, // Resposta instantânea no Android
    },
    ios: {
      activeOpacity: 0.7,
      delayPressIn: 50, // Padrão iOS
    },
  });
};

/**
 * Behavior correto para KeyboardAvoidingView
 *
 * iOS: 'padding' - ajusta padding interno
 * Android: undefined - deixa o sistema Android gerenciar (mais performático)
 *
 * @returns 'padding' para iOS, undefined para Android
 *
 * @example
 * ```tsx
 * <KeyboardAvoidingView behavior={getKeyboardBehavior()}>
 *   // form components here
 * </KeyboardAvoidingView>
 * ```
 */
export const getKeyboardBehavior = (): 'padding' | 'height' | 'position' | undefined => {
  return Platform.OS === 'ios' ? 'padding' : undefined;
};

/**
 * Offset vertical do teclado por plataforma
 *
 * iOS: 0 - não precisa de ajuste
 * Android: -100 - evita que empurre muito o conteúdo
 *
 * @returns Offset numérico
 */
export const getKeyboardVerticalOffset = (): number => {
  return Platform.select({
    ios: 0,
    android: -100,
  }) || 0;
};

/**
 * Props de performance para FlatList otimizadas por plataforma
 *
 * Android: removeClippedSubviews + batch menor (mais fluido)
 * iOS: valores padrão otimizados
 *
 * @returns Objeto com props de FlatList
 *
 * @example
 * ```tsx
 * <FlatList
 *   data={items}
 *   renderItem={renderItem}
 *   {...getFlatListProps()}
 * />
 * ```
 */
export const getFlatListProps = () => {
  return {
    removeClippedSubviews: Platform.OS === 'android',
    maxToRenderPerBatch: Platform.select({ android: 5, ios: 10 }),
    updateCellsBatchingPeriod: Platform.select({ android: 100, ios: 50 }),
    windowSize: Platform.select({ android: 5, ios: 21 }),
    initialNumToRender: Platform.select({ android: 8, ios: 10 }),
  };
};

/**
 * Configuração de StatusBar por plataforma
 *
 * @returns Config de StatusBar
 */
export const getStatusBarConfig = () => {
  return Platform.select({
    android: {
      backgroundColor: '#003B73', // Azul primary
      barStyle: 'light-content' as const,
      translucent: false,
    },
    ios: {
      barStyle: 'light-content' as const,
    },
  });
};

/**
 * Helper para debounce de funções
 * Útil para inputs e validações
 *
 * @param func - Função a ser executada com debounce
 * @param wait - Tempo de espera em ms
 * @returns Função com debounce aplicado
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
