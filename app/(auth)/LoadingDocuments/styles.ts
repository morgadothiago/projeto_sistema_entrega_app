import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  imageFundoContaier: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Preto com 50% de opacidade
  },
  imageFundo: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  subtitle: {
    color: "#e3eeff",
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderColor: colors.buttons,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.buttons,
    fontSize: 18,
    fontWeight: "bold",
  },
})
