import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import { useAuth } from "@/app/context/AuthContext"
import { DocumentFormData, UserInfoSchema } from "@/app/schema/accouts"
import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import { yupResolver } from "@hookform/resolvers/yup"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
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
import * as yup from "yup"

export default function Documents() {
  const { user, loading } = useAuth()
  const [submittedData, setSubmittedData] = useState<DocumentFormData | null>(
    null
  )
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<yup.InferType<typeof UserInfoSchema>>({
    resolver: yupResolver(UserInfoSchema) as any,

    defaultValues: {
      documentType: undefined,
      documentImageUri: "",
      documentNumber: "",
      rg: "",
      fullName: "",
      cpf: "",
      orgaoEmissao: "",
      cnhType: undefined,
    },
  })

  const documentImageUri = watch("documentImageUri")
  const documentType = watch("documentType")
  const router = useRouter()

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
      setValue("documentImageUri", result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    })
    if (!result.canceled) {
      setValue("documentImageUri", result.assets[0].uri)
    }
  }

  const chooseImageOption = () => {
    Alert.alert("Selecionar Imagem", "Escolha uma opção:", [
      { text: "Tirar foto", onPress: takePhoto },
      { text: "Escolher da galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ])
  }

  const onSubmit = (data: DocumentFormData) => {
    console.log(data)
    setSubmittedData(data) // Guarda os dados no estado

    // Aqui você pode adicionar a lógica para salvar os dados do documento

    Alert.alert("Documento enviado com sucesso!")

    router.replace("/(auth)/Payments")
  }

  const onErrors = () => {
    if (errors.documentImageUri) {
      Alert.alert("Erro", errors.documentImageUri.message)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Header title="Documento" tabs={false} />
        <View style={styles.content}>
          <View
            style={{
              marginBottom: 10,
              backgroundColor: colors.primary,

              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text style={styles.title}>Enviar foto do documento</Text>
          </View>

          {!documentImageUri && (
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

          {documentImageUri && (
            <View style={styles.documentImg}>
              <Image
                source={{ uri: documentImageUri }}
                style={{ height: 200, width: "100%", borderRadius: 8 }}
                contentFit="cover"
              />
            </View>
          )}
          <Select
            control={control}
            name="documentType"
            options={[
              { label: "RG", value: "RG" },
              { label: "CNH", value: "CNH" },
            ]}
            placeholder="Selecione o tipo de documento"
          />

          <View
            style={{
              height: 1,
              backgroundColor: colors.text,
              marginVertical: 20,
            }}
          />
          {documentType === "RG" && (
            <>
              <Input
                control={control}
                name="documentNumber"
                placeholder="Número do RG"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Input
                control={control}
                name="rg"
                placeholder="Nome completo"
                placeholderTextColor={colors.buttons}
                keyboardType="name-phone-pad"
              />
              <Input
                control={control}
                name="cpf"
                placeholder="CPF"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Input
                control={control}
                name="orgaoEmissao"
                placeholder="Órgão de emissão"
                placeholderTextColor={colors.buttons}
                keyboardType="name-phone-pad"
              />
            </>
          )}

          {documentType === "CNH" && (
            <>
              <Input
                control={control}
                name="documentNumber"
                placeholder="Número da CNH"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Input
                control={control}
                name="fullName"
                placeholder="Nome completo"
                placeholderTextColor={colors.buttons}
                keyboardType="name-phone-pad"
              />
              <Input
                control={control}
                name="cpf"
                placeholder="CPF"
                placeholderTextColor={colors.buttons}
                keyboardType="numeric"
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: colors.text,
                  marginVertical: 10,
                  marginBottom: -20,
                }}
              >
                Tipo de CNH
              </Text>
              <Select
                control={control}
                name="cnhType"
                options={[
                  { label: "A", value: "A" },
                  { label: "B", value: "B" },
                  { label: "AB", value: "AB" },
                  { label: "D", value: "D" },
                  { label: "E", value: "E" },
                ]}
                placeholder="Tipo de CNH"
              />
            </>
          )}

          <Pressable
            onPress={handleSubmit(
              (data) => onSubmit(data as DocumentFormData),
              onErrors
            )}
            style={{
              marginTop: 20,
              backgroundColor: colors.buttons,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text>Enviar</Text>
          </Pressable>
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.buttons,
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
