import { colors } from "@/app/theme"
import { Dimensions, Platform, StyleSheet } from "react-native"

const { width } = Dimensions.get("window")

export const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "center",

    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0, 59, 115, 0.8)",
    borderWidth: 3,
    borderColor: colors.buttons,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.secondary,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: colors.secondary,
    marginBottom: 40,
    paddingHorizontal: 8,
    opacity: 0.9,
  },
  form: {
    width: "100%",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colors.buttons,
    marginTop: 8,
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
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})

export default styles
