import { Platform, StyleSheet } from "react-native"
import { colors } from "../../theme"
import {
  spacing,
  fontSize,
  borderRadius,
  isSmallScreen,
  responsiveSize,
} from "../../utils/responsive"

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: responsiveSize(160, 120),
    height: responsiveSize(160, 120),
    resizeMode: "contain",
  },
  welcomeTitle: {
    fontSize: responsiveSize(28, 24),
    fontWeight: "bold",
    color: colors.secondary,
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: fontSize.base,
    color: colors.secondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
    opacity: 0.9,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  button: {
    width: "100%",
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.buttons,
    marginTop: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    position: "absolute",
    bottom: responsiveSize(40, 24),
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  linkText: {
    color: colors.secondary,
    fontSize: fontSize.base,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: responsiveSize(200, 150),
    height: responsiveSize(200, 150),
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})

export default styles
