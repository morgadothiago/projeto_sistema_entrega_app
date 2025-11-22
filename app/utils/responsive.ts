import { Dimensions } from "react-native"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// Breakpoints
export const BREAKPOINTS = {
  SMALL_HEIGHT: 700,
  SMALL_WIDTH: 375,
  MEDIUM_HEIGHT: 812,
  MEDIUM_WIDTH: 414,
}

// Detecção de tela pequena
export const isSmallScreen = SCREEN_HEIGHT < BREAKPOINTS.SMALL_HEIGHT
export const isSmallWidth = SCREEN_WIDTH < BREAKPOINTS.SMALL_WIDTH
export const isMediumScreen =
  SCREEN_HEIGHT >= BREAKPOINTS.SMALL_HEIGHT &&
  SCREEN_HEIGHT < BREAKPOINTS.MEDIUM_HEIGHT

// Funções de escala responsiva
export const scale = (size: number): number => {
  if (isSmallScreen) {
    return size * 0.85 // Reduz 15% em telas pequenas
  }
  return size
}

export const scaleFont = (size: number): number => {
  if (isSmallScreen) {
    return size * 0.9 // Reduz 10% em telas pequenas
  }
  return size
}

export const verticalScale = (size: number): number => {
  if (isSmallScreen) {
    return size * 0.75 // Reduz 25% em telas pequenas
  }
  return size
}

// Helpers para valores condicionais
export const responsiveSize = (normal: number, small?: number): number => {
  if (small !== undefined && isSmallScreen) {
    return small
  }
  return normal
}

export const responsiveValue = <T,>(normal: T, small: T): T => {
  return isSmallScreen ? small : normal
}

// Dimensões da tela
export const screenDimensions = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: isSmallScreen,
  isSmallWidth,
  isMedium: isMediumScreen,
}

// Espaçamentos responsivos
export const spacing = {
  xs: responsiveSize(4, 3),
  sm: responsiveSize(8, 6),
  md: responsiveSize(12, 10),
  lg: responsiveSize(16, 12),
  xl: responsiveSize(20, 16),
  xxl: responsiveSize(24, 20),
  xxxl: responsiveSize(32, 24),
}

// Tamanhos de fonte responsivos
export const fontSize = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  base: scaleFont(16),
  lg: scaleFont(18),
  xl: scaleFont(20),
  xxl: scaleFont(24),
  xxxl: scaleFont(32),
}

// Border radius responsivos
export const borderRadius = {
  sm: responsiveSize(4, 3),
  md: responsiveSize(8, 6),
  lg: responsiveSize(12, 10),
  xl: responsiveSize(16, 12),
  xxl: responsiveSize(24, 20),
  round: 9999,
}
