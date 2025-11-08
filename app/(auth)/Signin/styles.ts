import { Platform, StyleSheet } from "react-native"
import { colors } from "../../theme"

const styles = StyleSheet.create({
  container: { flex: 1 },

  imgFundo: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 40,
    resizeMode: "contain",
  },
  form: {
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.buttons,
    height: Platform.OS === "ios" ? 50 : 60,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: colors.primary,
    color: "#333",
  },
  button: {
    backgroundColor: "#003B73",
    padding: 14,
    borderRadius: 8,
    alignItems: "center", // centraliza o texto
    width: "100%", // agora ocupa toda a largura
    borderColor: colors.buttons,
    borderWidth: 1,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#0da87aff", // cor diferente quando desabilitado
  },
  buttonText: {
    color: colors.buttons,
    fontWeight: "bold",
    fontSize: 18,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,

    padding: 20,
  },
  linkText: {
    color: colors.buttons,
    fontSize: 18,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // Preto com 50% de opacidade
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // cobre toda a tela
    backgroundColor: "rgba(0, 0, 0, 0.6)", // fundo semitransparente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // garante que fique por cima
  },

  cartAnimation: {
    width: 120,
    height: 120,
    color: colors.buttons,
    resizeMode: "cover",
  },

  loadingText: {
    fontSize: 18,
    color: "#0da87aff",
    fontWeight: "bold",
  },

  error: {
    color: "red",
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "flex-start",

    padding: 5,
    width: "100%",
    borderRadius: 5,
  },
})

export default styles
