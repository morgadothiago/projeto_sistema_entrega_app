import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"
import React from "react"
export const styles = StyleSheet.create({
  container: {
    width: "100%", // Ocupa toda a largura disponível
    marginBottom: 15, // Espaçamento inferior
  },
  input: {
    width: "100%", // Ocupa toda a largura do container
    padding: 14, // Preenchimento interno
    borderWidth: 1, // Largura da borda
    borderColor: "#bbb", // Cor da borda
    borderRadius: 10, // Arredondamento da borda
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fundo semi-transparente
    color: "#333", // Cor do texto
    fontSize: 16, // Tamanho da fonte
  },
  errorText: {
    color: colors.secondary, // Cor do texto de erro
    fontSize: 12, // Tamanho da fonte do erro
    marginTop: 5, // Margem superior
    marginLeft: 5, // Margem esquerda
  },
})
