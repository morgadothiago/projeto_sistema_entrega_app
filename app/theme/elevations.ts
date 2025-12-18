import { Platform, ViewStyle } from 'react-native';

// Material Design 3 Elevation Levels para Android
const ANDROID_ELEVATIONS = {
  none: 0,
  surface: 1,    // Superfícies planas
  card: 3,       // Cards normais
  elevated: 6,   // Elementos elevados (botões)
  fab: 8,        // FABs, modais
  modal: 12,     // Modais, navigation drawer
};

// iOS Shadow presets otimizados
// Mantém consistência visual com Android mas usando shadows
const IOS_SHADOWS = {
  none: {},
  surface: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
  },
  modal: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
};

export type ElevationLevel = keyof typeof ANDROID_ELEVATIONS;

/**
 * Retorna o estilo de elevation/shadow apropriado para cada plataforma
 *
 * @param level - Nível de elevation segundo Material Design 3
 * @returns ViewStyle com elevation (Android) ou shadow (iOS)
 *
 * @example
 * ```tsx
 * <View style={[styles.card, getElevation('card')]}>
 *   // card content here
 * </View>
 * ```
 *
 * Níveis disponíveis:
 * - none: Sem elevation
 * - surface: 1dp - superfícies planas
 * - card: 3dp - cards e list items
 * - elevated: 6dp - botões e chips elevados
 * - fab: 8dp - floating action buttons
 * - modal: 12dp - modais e navigation
 */
export const getElevation = (level: ElevationLevel = 'card'): ViewStyle => {
  if (Platform.OS === 'android') {
    return { elevation: ANDROID_ELEVATIONS[level] };
  }

  return IOS_SHADOWS[level] as ViewStyle;
};

/**
 * Valores de elevation brutos para casos especiais
 * Útil quando você precisa do valor numérico diretamente
 */
export const elevationValues = ANDROID_ELEVATIONS;

/**
 * Valores de shadow iOS brutos para casos especiais
 */
export const shadowValues = IOS_SHADOWS;
