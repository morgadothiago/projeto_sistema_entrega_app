import React, { useCallback, useState, useRef } from "react"
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    RefreshControl,
} from "react-native"

import { useFocusEffect, useRouter } from "expo-router"
import { useAuth } from "../context/AuthContext"
import { api } from "../service/api"
import { colors } from "../theme"
import { logger } from "../utils/logger"

import { MaterialIcons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "../components/Header"

type BackendTransaction = {
    id: string
    type: "earning" | "withdrawal"
    amount: number
    description: string
    status: string
    createdAt: string
    pixKey?: string
}

type DeliveryStats = {
    currentBalance: number
    totalEarned: number
    totalWithdrawn: number
    pendingBalance: number
    transactions: BackendTransaction[]
}

export default function Notifications() {
    const { user } = useAuth()
    const routes = useRouter()
    const [isFetching, setIsFetching] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [transactions, setTransactions] = useState<BackendTransaction[]>([])
    const [selectedFilter, setSelectedFilter] = useState<
        "all" | "earning" | "withdrawal"
    >("all")

    // Ref para controlar frequência de chamadas
    const lastFetchTime = useRef<number>(0)
    const FETCH_COOLDOWN = 3000 // 3 segundos de cooldown

    const fetchTransactions = useCallback(async (forceRefresh = false) => {
        if (!user?.id) return

        // Evita chamadas excessivas se não for forçado
        const now = Date.now()
        if (!forceRefresh && now - lastFetchTime.current < FETCH_COOLDOWN) {
            logger.info("Fetch ignorado - cooldown ativo", { context: "Notifications" })
            setIsFetching(false)
            setRefreshing(false)
            return
        }

        lastFetchTime.current = now

        try {
            const { data: balanceData } = await api.get<DeliveryStats>(
                `/deliveryman/${user.id}/balance`
            )

            setTransactions(balanceData.transactions || [])

            logger.info("Transações carregadas", {
                context: "Notifications",
                count: balanceData.transactions?.length || 0,
            })
        } catch (error: any) {
            logger.error("Erro ao carregar transações", error, {
                context: "Notifications",
            })
        } finally {
            setIsFetching(false)
            setRefreshing(false)
        }
    }, [user?.id])

    useFocusEffect(
        useCallback(() => {
            fetchTransactions()
        }, [fetchTransactions])
    )

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        // Força refresh ao puxar para atualizar
        fetchTransactions(true)
    }, [fetchTransactions])

    const filteredTransactions = transactions.filter((item) => {
        if (selectedFilter === "all") return true
        return item.type === selectedFilter
    })

    const getTransactionIcon = (type: "earning" | "withdrawal") => {
        if (type === "earning") {
            return <MaterialIcons name="arrow-downward" size={24} color="#10b981" />
        }
        return <MaterialIcons name="arrow-upward" size={24} color="#ef4444" />
    }

    const getTransactionColor = (type: "earning" | "withdrawal") => {
        return type === "earning" ? "#10b981" : "#ef4444"
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
            return `Hoje às ${date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
        } else if (diffDays === 2) {
            return `Ontem às ${date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
        } else if (diffDays <= 7) {
            return `Há ${diffDays - 1} dias`
        } else {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        }
    }

    const renderTransaction = useCallback(
        ({ item }: { item: BackendTransaction }) => {
            const color = getTransactionColor(item.type)
            const isEarning = item.type === "earning"

            return (
                <View style={styles.transactionCard}>
                    <View style={styles.transactionHeader}>
                        <View
                            style={[
                                styles.iconContainer,
                                { backgroundColor: `${color}20` },
                            ]}
                        >
                            {getTransactionIcon(item.type)}
                        </View>
                        <View style={styles.transactionInfo}>
                            <Text style={styles.transactionTitle}>
                                {isEarning ? "Entrega concluída" : "Saque realizado"}
                            </Text>
                            <Text style={styles.transactionDescription}>
                                {item.description}
                            </Text>
                            <Text style={styles.transactionDate}>
                                {formatDate(item.createdAt)}
                            </Text>
                        </View>
                        <Text style={[styles.transactionAmount, { color }]}>
                            {isEarning ? "+" : "-"} R${" "}
                            {item.amount.toFixed(2).replace(".", ",")}
                        </Text>
                    </View>
                </View>
            )
        },
        []
    )

    const keyExtractor = useCallback((item: BackendTransaction) => item.id, [])

    const ItemSeparator = useCallback(() => <View style={styles.separator} />, [])

    const ListEmpty = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="notifications-none" size={64} color={colors.text} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyText}>
                    {isFetching
                        ? "Carregando..."
                        : "Nenhuma notificação encontrada."}
                </Text>
                <Text style={styles.emptySubtext}>
                    Suas movimentações financeiras aparecerão aqui
                </Text>
            </View>
        ),
        [isFetching]
    )

    const unreadCount = transactions.length

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Notificações"
                onNotificationPress={() => routes.push("/settings/notifications")}
                showNotificationBadge={false}
            />
            <View style={styles.content}>
                <View style={styles.filterContainer}>
                    <Pressable
                        onPress={() => setSelectedFilter("all")}
                        style={[
                            styles.filterButton,
                            selectedFilter === "all" && styles.filterButtonActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedFilter === "all" && styles.filterButtonTextActive,
                            ]}
                        >
                            Todas ({unreadCount})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter("earning")}
                        style={[
                            styles.filterButton,
                            selectedFilter === "earning" && styles.filterButtonActive,
                        ]}
                    >
                        <MaterialIcons
                            name="arrow-downward"
                            size={16}
                            color={
                                selectedFilter === "earning" ? colors.primary : colors.text
                            }
                        />
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedFilter === "earning" && styles.filterButtonTextActive,
                            ]}
                        >
                            Ganhos
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter("withdrawal")}
                        style={[
                            styles.filterButton,
                            selectedFilter === "withdrawal" && styles.filterButtonActive,
                        ]}
                    >
                        <MaterialIcons
                            name="arrow-upward"
                            size={16}
                            color={
                                selectedFilter === "withdrawal" ? colors.primary : colors.text
                            }
                        />
                        <Text
                            style={[
                                styles.filterButtonText,
                                selectedFilter === "withdrawal" &&
                                styles.filterButtonTextActive,
                            ]}
                        >
                            Saques
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.listWrapper}>
                    <FlatList
                        data={filteredTransactions}
                        keyExtractor={keyExtractor}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={ItemSeparator}
                        renderItem={renderTransaction}
                        ListEmptyComponent={ListEmpty}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.active}
                                colors={[colors.active]}
                            />
                        }
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        updateCellsBatchingPeriod={50}
                        windowSize={5}
                    />
                </View>
            </View>
        </SafeAreaView>
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
        paddingHorizontal: 16,
    },
    filterContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        marginBottom: 20,
    },
    filterButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    filterButtonActive: {
        backgroundColor: colors.buttons,
        borderColor: colors.buttons,
    },
    filterButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
    filterButtonTextActive: {
        color: colors.primary,
        fontWeight: "700",
    },
    listWrapper: {
        flex: 1,
    },
    transactionCard: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    transactionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
        marginBottom: 4,
    },
    transactionDescription: {
        fontSize: 13,
        color: colors.text,
        opacity: 0.7,
        marginBottom: 4,
    },
    transactionDate: {
        fontSize: 12,
        color: colors.text,
        opacity: 0.5,
    },
    transactionAmount: {
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    separator: {
        height: 12,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        textAlign: "center",
        color: colors.text,
        fontSize: 16,
        marginTop: 16,
        fontWeight: "600",
    },
    emptySubtext: {
        textAlign: "center",
        color: colors.text,
        fontSize: 14,
        marginTop: 8,
        opacity: 0.6,
    },
})
