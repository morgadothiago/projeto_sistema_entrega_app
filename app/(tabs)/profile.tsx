import fundoBg from "@/app/assets/funndo.png"
import logo from "@/app/assets/logo.png"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Animated,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { colors } from "../theme"

type BankAccount = {
  pixKey?: string
  pixKeyType?: string
  bankName?: string
  agency?: string
  account?: string
  accountType?: string
}

export default function Profile() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("Usuario")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  // Animação de fade in
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

  // 🔹 Pedir permissão de câmera e galeria
  useEffect(() => {
    ;(async () => {
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync()
      if (mediaStatus !== "granted" || cameraStatus !== "granted") {
        alert("Precisamos de permissão para acessar a câmera e galeria!")
      }
    })()
  }, [user, loading])

  // 🔹 Escolher da galeria
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  // 🔹 Tirar foto com a câmera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  // 🔹 Exibir alerta de escolha
  const chooseImageOption = () => {
    Alert.alert("Selecionar Imagem", "Escolha uma opção:", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  return (
    <ImageBackground
      source={fundoBg}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="Perfil" tabs={false} tabsTitle="Meu Perfil" />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.imageContainer}>
              <Pressable onPress={chooseImageOption}>
                <Image
                  source={profileImage ? { uri: profileImage } : logo}
                  style={{ width: 90, height: 90, borderRadius: 45 }}
                />
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👤 Nome</Text>
                <Text style={styles.infoValue}>{user?.DeliveryMan?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>✉️ Email</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
            </View>

            <View>
              <Text>Area De direcionamento para</Text>
            </View>

            <View>
              <Button title="Sair" onPress={() => signOut()} />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.primary,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.buttons,
    marginBottom: 16,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 179, 0.3)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: colors.buttons,
    fontWeight: "bold",
  },
  tabInfoUser: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 179, 0.2)",
  },
  tabText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  activeTabButton: {
    backgroundColor: colors.buttons,
    borderColor: colors.buttons,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    width: "100%",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  accountCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 179, 0.2)",
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.buttons,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: colors.secondary,
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: 20,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",

    alignItems: "flex-start",

    paddingBottom: 20,
    marginTop: 10,
  },
})
