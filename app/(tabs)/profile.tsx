import fundoBg from "@/app/assets/funndo.png"
import logo from "@/app/assets/logo.png"
import { Feather } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { Header } from "../components/Header"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { logger } from "../utils/logger"

export default function Profile() {
  const { user, signOut, token, refreshUser } = useAuth()
  const router = useRouter()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start()

    // Carregar avatar do backend se existir
    if (user?.Avatar?.path) {
      setProfileImage(user.Avatar.path)
    }
  }, [user])

  // 🔹 Pedir permissão de câmera e galeria
  useEffect(() => {
    ; (async () => {
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync()
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync()
      if (mediaStatus !== "granted" || cameraStatus !== "granted") {
        // Alert.alert("Permissão necessária", "Precisamos de permissão para acessar a câmera e galeria!")
      }
    })()
  }, [])

  const uploadAvatar = async (imageUri: string) => {
    if (!user?.id || !token) {
      Alert.alert("Erro", "Usuário não autenticado")
      return
    }

    setIsUploading(true)
    try {
      logger.info("Iniciando upload de avatar", { context: "Profile" })

      // Criar FormData
      const formData = new FormData()

      // Extrair o nome do arquivo da URI
      const filename = imageUri.split("/").pop() || "avatar.jpg"

      // Extrair tipo do arquivo
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : "image/jpeg"

      // Adicionar arquivo ao FormData
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      } as any)

      logger.info("Enviando arquivo para o backend", {
        context: "Profile",
        data: { filename, type },
      })

      // Fazer upload
      const response = await api.patch(`/users/${user.id}/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      logger.info("Avatar atualizado com sucesso", {
        context: "Profile",
        data: response.data,
      })

      // Atualizar imagem localmente
      setProfileImage(response.data.path)

      // Recarregar dados do usuário para atualizar o contexto
      await refreshUser()

      Toast.show({
        type: "success",
        text1: "Avatar atualizado!",
        text2: "Sua foto de perfil foi atualizada com sucesso",
        visibilityTime: 3000,
      })
    } catch (error: any) {
      logger.error("Erro ao fazer upload do avatar", error, {
        context: "Profile",
      })

      Toast.show({
        type: "error",
        text1: "Erro ao atualizar avatar",
        text2: error?.response?.data?.message || "Tente novamente mais tarde",
        visibilityTime: 4000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (!result.canceled) {
      const imageUri = result.assets[0].uri
      setProfileImage(imageUri)
      // Fazer upload imediatamente
      await uploadAvatar(imageUri)
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    })
    if (!result.canceled) {
      const imageUri = result.assets[0].uri
      setProfileImage(imageUri)
      // Fazer upload imediatamente
      await uploadAvatar(imageUri)
    }
  }

  const chooseImageOption = () => {
    Alert.alert("Alterar Foto", "Escolha uma opção:", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: signOut, style: "destructive" },
    ])
  }

  const renderMenuItem = (
    icon: keyof typeof Feather.glyphMap,
    title: string,
    subtitle: string,
    onPress: () => void,
    isDestructive = false
  ) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.menuIconContainer,
          isDestructive && styles.menuIconContainerDestructive,
        ]}
      >
        <Feather
          name={icon}
          size={22}
          color={isDestructive ? "#FF453A" : colors.buttons}
        />
      </View>
      <View style={styles.menuTextContainer}>
        <Text
          style={[styles.menuTitle, isDestructive && styles.menuTitleDestructive]}
        >
          {title}
        </Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.secondary} />
    </TouchableOpacity>
  )

  return (
    <ImageBackground
      source={fundoBg}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="Meu Perfil" onNotificationPress={() => { }} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Header do Perfil */}
            <View style={styles.profileHeader}>
              <TouchableOpacity
                onPress={chooseImageOption}
                style={styles.avatarContainer}
                disabled={isUploading}
              >
                <Image
                  source={profileImage ? { uri: profileImage } : logo}
                  style={styles.avatar}
                />
                {isUploading ? (
                  <View style={styles.uploadingBadge}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                ) : (
                  <View style={styles.editIconBadge}>
                    <Feather name="camera" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {user?.DeliveryMan?.name || "Entregador"}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Ativo</Text>
                </View>
              </View>
            </View>

            {/* Card de Veículo */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Meu Veículo</Text>
              <View style={styles.vehicleCard}>
                <View style={styles.vehicleIcon}>
                  <Feather name="truck" size={24} color={colors.buttons} />
                </View>
                <View style={styles.vehicleDetails}>
                  <Text style={styles.vehicleName}>
                    {user?.DeliveryMan?.Vehicle?.brand || "Marca"}{" "}
                    {user?.DeliveryMan?.Vehicle?.model || "Modelo"}
                  </Text>
                  <Text style={styles.vehiclePlate}>
                    {user?.DeliveryMan?.Vehicle?.licensePlate || "SEM PLACA"}
                  </Text>
                </View>
                <View style={styles.vehicleBadge}>
                  <Text style={styles.vehicleBadgeText}>
                    {user?.DeliveryMan?.Vehicle?.color || "Cor"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu de Ações */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Configurações</Text>
              <View style={styles.menuContainer}>
                {renderMenuItem(
                  "user",
                  "Dados Pessoais",
                  "Editar nome, telefone e endereço",
                  () => router.push("/settings/edit-profile")
                )}
                <View style={styles.separator} />
                {renderMenuItem(
                  "lock",
                  "Segurança",
                  "Alterar senha e privacidade",
                  () => router.push("/settings/security")
                )}
              </View>
            </View>

            {/* Botão Sair */}
            <View style={[styles.sectionContainer, { marginTop: 10 }]}>
              <View style={styles.menuContainer}>
                {renderMenuItem(
                  "log-out",
                  "Sair da Conta",
                  "Encerrar sessão atual",
                  handleLogout,
                  true
                )}
              </View>
            </View>

            <Text style={styles.versionText}>Versão 1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.buttons,
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.buttons,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  uploadingBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.buttons,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1A1A1A",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.buttons,
    marginRight: 6,
  },
  statusText: {
    color: colors.buttons,
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  vehicleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 255, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 14,
    color: colors.secondary,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    letterSpacing: 1,
  },
  vehicleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vehicleBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  menuContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 255, 179, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuIconContainerDestructive: {
    backgroundColor: "rgba(255, 69, 58, 0.1)",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 2,
  },
  menuTitleDestructive: {
    color: "#FF453A",
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.secondary,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginLeft: 68,
  },
  versionText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.3)",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
  },
})
