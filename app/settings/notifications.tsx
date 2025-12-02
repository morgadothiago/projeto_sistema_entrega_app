import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import fundoBg from "@/app/assets/funndo.png"
import { Header } from "@/app/components/Header"
import { colors } from "@/app/theme"

export default function Notifications() {
    const router = useRouter()

    const [pushEnabled, setPushEnabled] = useState(true)
    const [ordersEnabled, setOrdersEnabled] = useState(true)
    const [promosEnabled, setPromosEnabled] = useState(false)
    const [emailEnabled, setEmailEnabled] = useState(true)

    const renderToggle = (
        title: string,
        subtitle: string,
        value: boolean,
        onValueChange: (val: boolean) => void,
        icon: keyof typeof Feather.glyphMap
    ) => (
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <View style={styles.iconContainer}>
                    <Feather name={icon} size={20} color={colors.buttons} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#767577", true: colors.buttons }}
                thumbColor={value ? colors.primary : "#f4f3f4"}
            />
        </View>
    )

    return (
        <ImageBackground source={fundoBg} style={styles.container} resizeMode="cover">
            <View style={styles.overlay} />
            <SafeAreaView style={{ flex: 1 }}>
                <Header title="Notificações" onBackPress={() => router.back()} tabs={false} />

                <ScrollView contentContainerStyle={styles.content}>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Geral</Text>
                        <View style={styles.card}>
                            {renderToggle(
                                "Notificações Push",
                                "Receber notificações no dispositivo",
                                pushEnabled,
                                setPushEnabled,
                                "bell"
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferências</Text>
                        <View style={styles.card}>
                            {renderToggle(
                                "Atualizações de Pedidos",
                                "Status de entrega e novas ofertas",
                                ordersEnabled,
                                setOrdersEnabled,
                                "package"
                            )}
                            <View style={styles.separator} />
                            {renderToggle(
                                "Promoções e Novidades",
                                "Dicas e ofertas especiais",
                                promosEnabled,
                                setPromosEnabled,
                                "tag"
                            )}
                            <View style={styles.separator} />
                            {renderToggle(
                                "Notificações por Email",
                                "Resumos e recibos importantes",
                                emailEnabled,
                                setEmailEnabled,
                                "mail"
                            )}
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.6)" },
    content: { padding: 20 },
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
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },
    rowLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(0, 255, 179, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 2,
    },
    subtitle: {
        color: colors.secondary,
        fontSize: 12,
    },
    separator: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        marginLeft: 68,
    },
})
