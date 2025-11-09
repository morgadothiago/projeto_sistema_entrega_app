import { Header } from "@/app/components/Header"
import { useAuth } from "@/app/context/AuthContext"
import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Documents() {
  const { user, loading } = useAuth()
  const [documentImg, setDocumentImg] = useState<string | null>(null)

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

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    })
    if (!result.canceled) {
      setDocumentImg(result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    })
    if (!result.canceled) {
      setDocumentImg(result.assets[0].uri)
    }
  }

  const chooseImageOption = () => {
    Alert.alert("Selecionar Imagem", "Escolha uma opção:", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Header title="Documento" tabs={false} />
        <View style={styles.content}>
          {!documentImg && (
            <Pressable onPress={chooseImageOption}>
              <View style={styles.documentImg}>
                <Feather name="camera" size={24} color="white" />
                <Text
                  style={{
                    color: colors.buttons,
                    textAlign: "center",
                    fontSize: 18,
                    marginTop: 10,
                  }}
                >
                  Clique aqui para adicionar{"\n"}um documento
                </Text>
              </View>
            </Pressable>
          )}

          {documentImg && (
            <View style={styles.documentImg}>
              <Image
                source={documentImg}
                style={{ height: 200, width: "100%", borderRadius: 8 }}
                contentFit="cover"
              />
            </View>
          )}

          <View
            style={{
              marginTop: 20,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",

                padding: 10,
                width: "100%",
                borderRadius: 8,
              }}
            >
              <Feather name="credit-card" size={24} color="white" />
              <Text
                style={{
                  color: colors.buttons,
                  fontSize: 18,
                  fontWeight: "bold",
                  marginLeft: 8,
                }}
              >
                Informe seu dados
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: colors.secondary,
    padding: 16,
  },
  documentImg: {
    height: 200,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
})
