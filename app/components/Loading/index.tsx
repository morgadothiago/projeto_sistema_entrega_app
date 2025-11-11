import React from "react"
import LottieView from "lottie-react-native"
import { ImageBackground, View, Text, Pressable, ViewStyle } from "react-native"
import { Image } from "expo-image"
import { styles } from "./styles"

export interface LoadingButton {
  text: string
  onPress: () => void
  variant?: "primary" | "secondary"
}

export interface LoadingProps {
  /**
   * Caminho ou require da animação Lottie
   */
  animation: any

  /**
   * Caminho ou require do background
   */
  background?: any

  /**
   * Caminho ou require do logo (opcional)
   */
  logo?: any

  /**
   * Tamanho do logo
   */
  logoSize?: { width: number; height: number }

  /**
   * Título principal (opcional)
   */
  title?: string

  /**
   * Subtítulo (opcional)
   */
  subtitle?: string

  /**
   * Tamanho da animação
   */
  animationSize?: { width: number; height: number }

  /**
   * Botões de ação (opcional)
   */
  buttons?: LoadingButton[]

  /**
   * Mostrar overlay escuro sobre o background
   */
  showOverlay?: boolean

  /**
   * Intensidade do overlay (0 a 1)
   */
  overlayOpacity?: number

  /**
   * Estilo customizado para o container
   */
  containerStyle?: ViewStyle

  /**
   * Loop da animação (padrão: true)
   */
  loop?: boolean

  /**
   * AutoPlay da animação (padrão: true)
   */
  autoPlay?: boolean
}

export default function Loading({
  animation,
  background,
  logo,
  logoSize = { width: 100, height: 100 },
  title,
  subtitle,
  animationSize = { width: 200, height: 200 },
  buttons = [],
  showOverlay = false,
  overlayOpacity = 0.5,
  containerStyle,
  loop = true,
  autoPlay = true,
}: LoadingProps) {
  const content = (
    <>
      {showOverlay && (
        <View style={[styles.overlay, { opacity: overlayOpacity }]} />
      )}

      <View style={styles.contentContainer}>
        {/* Logo */}
        {logo && (
          <Image
            source={logo}
            style={[styles.logo, logoSize]}
          />
        )}

        {/* Animação Lottie */}
        <LottieView
          source={animation}
          autoPlay={autoPlay}
          loop={loop}
          style={[styles.lottie, animationSize]}
        />

        {/* Textos */}
        {(title || subtitle) && (
          <View style={styles.textContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}

        {/* Botões */}
        {buttons.length > 0 && (
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <Pressable
                key={index}
                style={[
                  styles.button,
                  button.variant === "secondary" && styles.buttonSecondary,
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.variant === "secondary" && styles.buttonTextSecondary,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  )

  // Se tem background, renderiza com ImageBackground
  if (background) {
    return (
      <ImageBackground source={background} style={[styles.container, containerStyle]}>
        {content}
      </ImageBackground>
    )
  }

  // Senão, renderiza sem background
  return (
    <View style={[styles.container, containerStyle]}>
      {content}
    </View>
  )
}
