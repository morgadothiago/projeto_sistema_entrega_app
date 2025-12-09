import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

// Chaves que devem ser salvas de forma segura
const SECURE_KEYS = ["@token", "@refresh_token"]

// Helper para saber se devemos usar SecureStore (apenas tokens)
function isSecureKey(key: string): boolean {
  return SECURE_KEYS.includes(key)
}

/**
 * Salva um item no armazenamento apropriado.
 * Tokens vão para o SecureStore, o resto para o AsyncStorage.
 */
async function saveItem(key: string, value: string) {
  try {
    if (isSecureKey(key)) {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(key, value)
      } else {
        // Fallback para web (não seguro, mas funcional)
        await AsyncStorage.setItem(key, value)
      }
    } else {
      await AsyncStorage.setItem(key, value)
    }
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error)
  }
}

/**
 * Recupera um item do armazenamento apropriado.
 */
async function getItem(key: string): Promise<string | null> {
  try {
    if (isSecureKey(key)) {
      if (Platform.OS !== "web") {
        return await SecureStore.getItemAsync(key)
      } else {
        return await AsyncStorage.getItem(key)
      }
    } else {
      return await AsyncStorage.getItem(key)
    }
  } catch (error) {
    console.error(`Erro ao ler ${key}:`, error)
    return null
  }
}

/**
 * Remove um item do armazenamento apropriado.
 */
async function removeItem(key: string) {
  try {
    if (isSecureKey(key)) {
      if (Platform.OS !== "web") {
        await SecureStore.deleteItemAsync(key)
      } else {
        await AsyncStorage.removeItem(key)
      }
    } else {
      await AsyncStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Erro ao remover ${key}:`, error)
  }
}

/**
 * Helper específico para pegar tokens (mais semântico)
 */
async function getToken(): Promise<string | null> {
  return await getItem("@token")
}

/**
 * Helper para limpar todos os dados de sessão (logout)
 */
async function clearSession() {
  await removeItem("@token")
  await removeItem("@refresh_token")
  await removeItem("@user")
  // Adicionar outras chaves de sessão aqui se necessário
}

export { clearSession, getItem, getToken, removeItem, saveItem }

