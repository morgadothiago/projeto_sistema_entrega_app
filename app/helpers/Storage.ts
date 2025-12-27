import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

// Chaves que devem ser salvas de forma segura
const SECURE_KEYS = ["token", "refresh_token"]

// Helper para saber se devemos usar SecureStore (apenas tokens)
function isSecureKey(key: string): boolean {
  return SECURE_KEYS.includes(key)
}

/**
 * Salva um item no armazenamento apropriado.
 * Tokens vão para o SecureStore, o resto para o AsyncStorage.
 * @throws Error se falhar ao salvar
 */
async function saveItem(key: string, value: string) {
  try {
    if (isSecureKey(key)) {
      await SecureStore.setItemAsync(key, value)
    } else {
      await AsyncStorage.setItem(key, value)
    }
  } catch (error) {
    console.error(`Erro ao salvar ${key}:`, error)
    throw new Error(`Falha ao salvar ${key}: ${error}`)
  }
}

/**
 * Recupera um item do armazenamento apropriado.
 */
async function getItem(key: string): Promise<string | null> {
  try {
    if (isSecureKey(key)) {
      return await SecureStore.getItemAsync(key)
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
 * @throws Error se falhar ao remover
 */
async function removeItem(key: string) {
  try {
    if (isSecureKey(key)) {
      await SecureStore.deleteItemAsync(key)
    } else {
      await AsyncStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Erro ao remover ${key}:`, error)
    throw new Error(`Falha ao remover ${key}: ${error}`)
  }
}

/**
 * Helper específico para pegar tokens (mais semântico)
 */
async function getToken(): Promise<string | null> {
  return await getItem("token")
}

/**
 * Helper para limpar todos os dados de sessão (logout)
 */
async function clearSession() {
  await removeItem("token")
  await removeItem("refresh_token")
  await removeItem("user")
  // Adicionar outras chaves de sessão aqui se necessário
}

export { clearSession, getItem, getToken, removeItem, saveItem }

