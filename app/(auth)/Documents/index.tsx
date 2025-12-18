import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import Select from "@/app/components/Select"
import { useAuth } from "@/app/context/AuthContext"
import { DocumentFormData, UserInfoSchema } from "@/app/schema/accouts"
import { api } from "@/app/service/api"
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
  Animated,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"
import { getKeyboardBehavior } from "@/app/theme/androidOptimizations"
import * as yup from "yup"

import LoadingDocument from "./LoadingDocument"
import LoadingDocumentSuccess from "./LoadingDocumentSuccess"
import { cpfMask, removeNonNumeric } from "@/app/helpers"
import fundoBg from "@/app/assets/funndo.png"
import LottieView from "lottie-react-native"
import LoadingAnimation from "@/app/assets/Loading.json"

export default function Documents() {
  const { user, loading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedData, setSubmittedData] = useState<DocumentFormData | null>()

  // Animação de fade in
  const fadeAnim = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start()
  }, [])

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
      documentType: "",
      documentImageUri: "",
      documentNumber: "",
      description: "",
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
        Toast.show({
          type: "error",
          text1: "Permissões necessárias",
          text2: "Precisamos de acesso à câmera e galeria",
        })
      }
    })()
  }, [user, loading])

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    })
    if (!result.canceled) {
      setValue("documentImageUri", result.assets[0].uri)
    }
  }

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
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

  const onSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      // Arquivo da imagem
      formData.append("file", {
        uri: data.documentImageUri,
        name: "document.jpeg",
        type: "image/jpeg",
      } as any)

      // Tipo do documento
      formData.append("type", data.documentType)

      // Campos obrigatórios baseados no tipo
      if (data.documentNumber) {
        formData.append("documentNumber", data.documentNumber)
      }

      if (data.fullName) {
        formData.append("fullName", data.fullName)
      }

      if (data.cpf) {
        formData.append("cpf", removeNonNumeric(data.cpf))
      }

      // Campos específicos por tipo
      if (data.documentType === "RG" && data.orgaoEmissao) {
        formData.append("orgaoEmissao", data.orgaoEmissao)
      }

      if (data.documentType === "CNH" && data.cnhType) {
        formData.append("cnhType", data.cnhType)
      }

      const response = await api.post("/deliveryman/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSubmittedData(data)
      setIsSubmitting(false)
      setShowSuccess(true)

      Toast.show({
        type: "success",
        text1: "Sucesso!",
        text2: "Documento enviado com sucesso 👌",
      })
    } catch (error: any) {
      setIsSubmitting(false)

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Ocorreu um erro ao enviar o documento"

      Toast.show({
        type: "error",
        text1: "Erro ao enviar documento",
        text2: errorMessage,
        visibilityTime: 5000,
      })
    }
  }

  const onErrors = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((error: any) => error.message)
      .join("\n")
    if (errorMessages) {
      Toast.show({
        type: "error",
        text1: "Erro de Validação!",
        text2: errorMessages,
      })
    }
  }

  // Mostra tela de sucesso
  if (showSuccess) {
    return <LoadingDocumentSuccess />
  }

  return (
    <ImageBackground source={fundoBg} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Header title="Enviar Documento" tabs={false} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={getKeyboardBehavior()}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* Seção: Foto do Documento */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>📸</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Foto do Documento</Text>
                  </View>

                  {!documentImageUri ? (
                    <Pressable onPress={chooseImageOption}>
                      <View style={styles.uploadContainer}>
                        <View style={styles.uploadIconCircle}>
                          <Feather name="camera" size={40} color={colors.buttons} />
                        </View>
                        <Text style={styles.uploadText}>
                          Toque para adicionar foto
                        </Text>
                        <Text style={styles.uploadSubtext}>
                          Tire uma foto ou escolha da galeria
                        </Text>
                      </View>
                    </Pressable>
                  ) : (
                    <Pressable onPress={chooseImageOption}>
                      <View style={styles.imagePreviewContainer}>
                        <Image
                          source={{ uri: documentImageUri }}
                          style={styles.imagePreview}
                          contentFit="cover"
                        />
                        <View style={styles.changePhotoButton}>
                          <Feather name="edit-2" size={16} color={colors.primary} />
                          <Text style={styles.changePhotoText}>Alterar foto</Text>
                        </View>
                      </View>
                    </Pressable>
                  )}
                </View>

                {/* Seção: Tipo de Documento */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Text style={styles.sectionIcon}>📄</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Tipo de Documento</Text>
                  </View>

                  <Select
                    control={control}
                    name="documentType"
                    options={[
                      { label: "RG", value: "RG" },
                      { label: "CNH", value: "CNH" },
                    ]}
                    placeholder="Selecione o tipo"
                  />
                </View>

                {/* Seção: Dados do RG */}
                {documentType === "RG" && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>🆔</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Dados do RG</Text>
                    </View>

                    <Input
                      control={control}
                      name="documentNumber"
                      placeholder="Número do RG"
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="credit-card"
                    />

                    <Input
                      control={control}
                      name="fullName"
                      placeholder="Nome completo"
                      keyboardType="default"
                      containerStyle={styles.inputContainer}
                      icon="user"
                    />

                    <Input
                      control={control}
                      name="cpf"
                      placeholder="CPF"
                      visualMask={cpfMask}
                      unmask={removeNonNumeric}
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="credit-card"
                    />

                    <Input
                      control={control}
                      name="orgaoEmissao"
                      placeholder="Órgão de emissão"
                      keyboardType="default"
                      containerStyle={styles.inputContainer}
                      icon="file-text"
                    />
                  </View>
                )}

                {/* Seção: Dados da CNH */}
                {documentType === "CNH" && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionIconContainer}>
                        <Text style={styles.sectionIcon}>🚗</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Dados da CNH</Text>
                    </View>

                    <Input
                      control={control}
                      name="documentNumber"
                      placeholder="Número da CNH"
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="credit-card"
                    />

                    <Input
                      control={control}
                      name="fullName"
                      placeholder="Nome completo"
                      keyboardType="default"
                      containerStyle={styles.inputContainer}
                      icon="user"
                    />

                    <Input
                      control={control}
                      name="cpf"
                      placeholder="CPF"
                      visualMask={cpfMask}
                      unmask={removeNonNumeric}
                      keyboardType="numeric"
                      containerStyle={styles.inputContainer}
                      icon="credit-card"
                    />

                    <Text style={styles.selectLabel}>Tipo de CNH</Text>
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
                      placeholder="Selecione o tipo de CNH"
                    />
                  </View>
                )}
              </Animated.View>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleSubmit(
                  (data) => onSubmit(data as DocumentFormData),
                  onErrors
                )}
                style={[styles.button, isSubmitting && styles.buttonDisabled]}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Enviando..." : "Enviar Documento"}
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>

          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <LottieView
                source={LoadingAnimation}
                autoPlay
                loop
                style={styles.lottieAnimation}
                resizeMode="contain"
              />
              <Text style={styles.loadingText}>Enviando documento...</Text>
            </View>
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
  uploadContainer: {
    backgroundColor: "rgba(0, 59, 115, 0.3)",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.buttons,
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: colors.support,
    textAlign: "center",
  },
  imagePreviewContainer: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imagePreview: {
    height: 250,
    width: "100%",
    borderRadius: 16,
  },
  changePhotoButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.buttons,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.buttons,
    marginBottom: 8,
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: colors.buttons,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})
