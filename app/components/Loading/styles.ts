import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  logo: {
    marginBottom: 20,
  },

  lottie: {
    marginBottom: 20,
  },

  textContainer: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 50,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    color: "#e3eeff",
    fontSize: 18,
    textAlign: "center",
  },

  buttonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },

  button: {
    backgroundColor: colors.primary,
    borderColor: colors.buttons,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
  },

  buttonSecondary: {
    backgroundColor: "transparent",
    borderColor: "#fff",
  },

  buttonText: {
    color: colors.buttons,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  buttonTextSecondary: {
    color: "#fff",
  },
})
