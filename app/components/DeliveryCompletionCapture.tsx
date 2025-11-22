import React, { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { Ionicons } from "@expo/vector-icons"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const isSmallScreen = SCREEN_HEIGHT < 700

interface DeliveryCompletionCaptureProps {
  deliveryCode: string
  onComplete: (data: {
    photo: string
    customerName: string
    trackingCode: string
  }) => void
  onCancel: () => void
}

export default function DeliveryCompletionCapture({
  deliveryCode,
  onComplete,
  onCancel,
}: DeliveryCompletionCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [step, setStep] = useState<"camera" | "form">("camera")
  const [photo, setPhoto] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [trackingCode, setTrackingCode] = useState("")
  const cameraRef = useRef<CameraView>(null)

  // Solicitar permissão se não tiver
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0057FF" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#666" />
          <Text style={styles.permissionTitle}>
            Permissão de Câmera Necessária
          </Text>
          <Text style={styles.permissionText}>
            Precisamos acessar sua câmera para tirar foto da entrega.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Conceder Permissão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const takePicture = async () => {
    if (!cameraRef.current) return

    try {
      const photoData = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      })

      if (photoData && photoData.base64) {
        setPhoto(`data:image/jpeg;base64,${photoData.base64}`)
        setStep("form")
      }
    } catch (error) {
      console.error("Erro ao tirar foto:", error)
      Alert.alert("Erro", "Não foi possível tirar a foto. Tente novamente.")
    }
  }

  const handleSubmit = () => {
    if (!photo) {
      Alert.alert("Atenção", "Por favor, tire uma foto antes de continuar.")
      return
    }

    if (!customerName.trim()) {
      Alert.alert("Atenção", "Por favor, informe o nome de quem recebeu.")
      return
    }

    if (!trackingCode.trim()) {
      Alert.alert("Atenção", "Por favor, informe o código de rastreio.")
      return
    }

    onComplete({
      photo,
      customerName: customerName.trim(),
      trackingCode: trackingCode.trim(),
    })
  }

  const retakePhoto = () => {
    setPhoto(null)
    setStep("camera")
  }

  if (step === "camera") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Foto da Entrega</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
        </View>

        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            Tire uma foto do número da casa
          </Text>
          <Text style={styles.instructionSubtext}>
            Código da entrega: {deliveryCode}
          </Text>
        </View>

        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Step: form
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePhoto} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados da Entrega</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.formContainer}
          contentContainerStyle={styles.formContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.photoPreviewContainer}>
            <Text style={styles.sectionTitle}>Foto Capturada</Text>
            {photo && (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            )}
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePhoto}
            >
              <Ionicons name="camera-outline" size={18} color="#0057FF" />
              <Text style={styles.retakeButtonText}>Tirar Novamente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Dados do Recebedor</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome de quem recebeu *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome completo"
                value={customerName}
                onChangeText={setCustomerName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código de Rastreio *</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o código de rastreio"
                value={trackingCode}
                onChangeText={setTrackingCode}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.formFooter}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Concluir Entrega</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: isSmallScreen ? 8 : 12,
    backgroundColor: "#0057FF",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
    color: "#fff",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
  },
  permissionText: {
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: "#0057FF",
    paddingHorizontal: 30,
    paddingVertical: isSmallScreen ? 12 : 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: isSmallScreen ? 12 : 15,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: isSmallScreen ? 14 : 16,
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  instructionContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: isSmallScreen ? 12 : 20,
    alignItems: "center",
  },
  instructionText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: "#ccc",
  },
  cameraControls: {
    padding: isSmallScreen ? 20 : 30,
    alignItems: "center",
    backgroundColor: "#000",
  },
  captureButton: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: isSmallScreen ? 56 : 64,
    height: isSmallScreen ? 56 : 64,
    borderRadius: isSmallScreen ? 28 : 32,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formContentContainer: {
    paddingBottom: isSmallScreen ? 10 : 20,
  },
  photoPreviewContainer: {
    backgroundColor: "#fff",
    padding: isSmallScreen ? 12 : 20,
    marginBottom: isSmallScreen ? 6 : 10,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: isSmallScreen ? 10 : 15,
  },
  photoPreview: {
    width: "100%",
    height: isSmallScreen ? 180 : 250,
    borderRadius: 8,
    marginBottom: isSmallScreen ? 10 : 15,
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: isSmallScreen ? 10 : 12,
    borderWidth: 1,
    borderColor: "#0057FF",
    borderRadius: 8,
  },
  retakeButtonText: {
    color: "#0057FF",
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  formSection: {
    backgroundColor: "#fff",
    padding: isSmallScreen ? 12 : 20,
  },
  inputContainer: {
    marginBottom: isSmallScreen ? 12 : 20,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: isSmallScreen ? 10 : 12,
    fontSize: isSmallScreen ? 14 : 16,
    backgroundColor: "#fff",
  },
  formFooter: {
    backgroundColor: "#fff",
    padding: isSmallScreen ? 12 : 20,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#0057FF",
    padding: isSmallScreen ? 14 : 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
  },
})
