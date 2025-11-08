import AsyncStorage from "@react-native-async-storage/async-storage"

// Helpers do AsyncStorage
async function saveItem(key: string, value: string) {
  await AsyncStorage.setItem(key, value)
}

async function getItem(key: string) {
  return await AsyncStorage.getItem(key)
}

async function removeItem(key: string) {
  await AsyncStorage.removeItem(key)
}

export { saveItem, getItem, removeItem }
