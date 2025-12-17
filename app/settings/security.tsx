import { Feather } from "@expo/vector-icons"
import { yupResolver } from "@hookform/resolvers/yup"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
    Alert,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as yup from "yup"

import fundoBg from "@/app/assets/funndo.png"
import { Button } from "@/app/components/Button"
import { Header } from "@/app/components/Header"
import Input from "@/app/components/Input"
import { colors } from "@/app/theme"

const changePasswordSchema = yup.object({
    currentPassword: yup.string().required("Senha atual é obrigatória"),
    newPassword: yup.string().min(6, "A senha deve ter no mínimo 6 caracteres").required("Nova senha é obrigatória"),
    confirmNewPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "As senhas não conferem")
        .required("Confirmação é obrigatória"),
})

export default function Security() {
    const router = useRouter()
    const [biometricsEnabled, setBiometricsEnabled] = useState(false)

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(changePasswordSchema)
    })

    const onSubmit = (data: any) => {
        Alert.alert("Sucesso", "Senha alterada com sucesso!")
    }

    const handleDeleteAccount = () => {
        Alert.alert(
            "Excluir Conta",
            "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => Alert.alert("Conta excluída", "Sua conta foi agendada para exclusão.")
                }
            ]
        )
    }

    return (
        <ImageBackground source={fundoBg} style={styles.container} resizeMode="cover">
            <View style={styles.overlay} />
            <SafeAreaView style={{ flex: 1 }}>
                <Header title="Segurança" onBackPress={() => router.back()} tabs={false} />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>

                        {/* Alterar Senha */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Alterar Senha</Text>
                            <View style={styles.card}>
                                <Input
                                    control={control}
                                    name="currentPassword"
                                    placeholder="Senha Atual"
                                    icon="lock"
                                    isPassword
                                    containerStyle={styles.input}
                                />
                                <Input
                                    control={control}
                                    name="newPassword"
                                    placeholder="Nova Senha"
                                    icon="lock"
                                    isPassword
                                    containerStyle={styles.input}
                                />
                                <Input
                                    control={control}
                                    name="confirmNewPassword"
                                    placeholder="Confirmar Nova Senha"
                                    icon="lock"
                                    isPassword
                                    containerStyle={styles.input}
                                />

                                <Button
                                    title="Atualizar Senha"
                                    onPress={handleSubmit(onSubmit)}
                                    style={styles.button}
                                />
                            </View>
                        </View>

                        {/* Excluir Conta */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: "#FF453A" }]}>Zona de Perigo</Text>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                                <Feather name="trash-2" size={20} color="#FF453A" style={{ marginRight: 10 }} />
                                <Text style={styles.deleteButtonText}>Excluir Minha Conta</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.6)" },
    content: { padding: 20, paddingBottom: 40 },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.secondary,
        marginBottom: 12,
        marginLeft: 4,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    card: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    input: {
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        marginBottom: 12,
        borderWidth: 0,
    },
    button: {
        marginTop: 8,
        backgroundColor: colors.buttons,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rowInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    rowText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "500",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 69, 58, 0.1)",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 69, 58, 0.3)",
    },
    deleteButtonText: {
        color: "#FF453A",
        fontSize: 16,
        fontWeight: "bold",
    },
})
