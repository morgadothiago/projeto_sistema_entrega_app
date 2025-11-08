import logo from "@/app/assets/logo.png"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import Input from "../components/Input"
import { useAuth } from "../context/AuthContext"
import { paymentsData } from "../mocks/paymentsData"
import { colors } from "../theme"

export default function Profile() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("Usuario")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [payments, setPayments] = useState(paymentsData)

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
      quality: 1,
    })
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  // 🔹 Tirar foto com a câmera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
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
    <View style={styles.container}>
      <SafeAreaView>
        <Header title="Perfil" tabs={true} tabsTitle="Meu Perfil" />

        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <Pressable onPress={chooseImageOption}>
              <Image
                source={profileImage ? { uri: profileImage } : logo}
                style={{ width: 90, height: 90, borderRadius: 45 }}
              />
            </Pressable>
          </View>

          <View
            style={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: colors.support,
              padding: 16,
              borderRadius: 12,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text>Nome</Text>
              <Text>{user?.DeliveryMan?.name}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text>Email</Text>
              <Text>{user?.email}</Text>
            </View>
          </View>

          {/* Abas */}
          <View style={styles.tabInfoUser}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "Usuario" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("Usuario")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Usuario" && styles.activeTabText,
                ]}
              >
                Usuario
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "Veiculo" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("Veiculo")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Veiculo" && styles.activeTabText,
                ]}
              >
                Veiculo
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "Banco" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("Banco")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Banco" && styles.activeTabText,
                ]}
              >
                banco
              </Text>
            </Pressable>
          </View>

          {/* Conteúdo das abas */}
          {activeTab === "Usuario" && (
            <View style={styles.tabContent}>
              <Input
                value={user?.DeliveryMan?.name}
                editable={false}
                icon="user"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.email}
                editable={false}
                icon="mail"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.DeliveryMan?.cpf}
                editable={false}
                icon="credit-card"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.DeliveryMan?.phone}
                editable={false}
                icon="phone"
                containerStyle={{ width: "100%" }}
              />
            </View>
          )}
          {activeTab === "Veiculo" && (
            <View style={styles.tabContent}>
              <Input
                value={user?.DeliveryMan?.Vehicle.model}
                editable={false}
                icon="info"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.DeliveryMan?.Vehicle.licensePlate}
                editable={false}
                icon="credit-card"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.DeliveryMan?.Vehicle.model}
                editable={false}
                icon="truck"
                containerStyle={{ width: "100%" }}
              />
              <Input
                value={user?.DeliveryMan?.Vehicle.year}
                editable={false}
                icon="calendar"
                containerStyle={{ width: "100%" }}
              />
            </View>
          )}
          {activeTab === "Banco" && (
            <View style={styles.tabContent}>
              <ScrollView
                contentContainerStyle={{
                  flex: 1,
                  width: "100%",
                }}
              >
                {payments.map((payment, index) => (
                  <View key={index} style={styles.paymentContainer}>
                    <Input
                      value={payment.bankName}
                      editable={false}
                      icon="dollar-sign"
                      containerStyle={{ width: "100%" }}
                    />
                    <Input
                      value={payment.agency}
                      editable={false}
                      icon="map-pin"
                      containerStyle={{ width: "100%" }}
                    />
                    <Input
                      value={payment.account}
                      editable={false}
                      icon="credit-card"
                      containerStyle={{ width: "100%" }}
                    />
                    <Input
                      value={payment.accountType}
                      editable={false}
                      icon="tag"
                      containerStyle={{ width: "100%" }}
                    />
                    <Input
                      value={payment.holderName}
                      editable={false}
                      icon="user"
                      containerStyle={{ width: "100%" }}
                    />
                    <Input
                      value={payment.cpf}
                      editable={false}
                      icon="file-text"
                      containerStyle={{ width: "100%" }}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Editar Perfil"
              onPress={() => router.push("/(tabs)/edit-profile")}
            />
            <Button title="Sair" onPress={() => signOut()} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.secondary,
    paddingTop: 24, // Adjusted from 50 to 24
  },
  imageContainer: {
    width: 120, // Adjusted from 100 to 120
    height: 120, // Adjusted from 100 to 120
    backgroundColor: colors.primary,
    borderRadius: 60, // Adjusted from 70 to 60
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.support,
    marginBottom: 10,
  },

  userNameText: {
    color: colors.text,
    fontSize: 20, // Adjusted from 18 to 20
    fontWeight: "bold",
  },
  tabInfoUser: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginTop: 26,
    gap: 10,

    borderRadius: 12, // Added borderRadius
    padding: 8, // Added padding
  },
  tabButton: {
    paddingVertical: 12, // Adjusted from 10 to 12
    paddingHorizontal: 18, // Adjusted from 15 to 18
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    color: colors.secondary,
    fontSize: 18, // Adjusted from 16 to 18
    fontWeight: "bold",
  },
  activeTabButton: {
    backgroundColor: colors.buttons,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    width: "100%",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    gap: 10,
    marginBottom: 26,
  },

  paymentContainer: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "red",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
})
