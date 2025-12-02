import React, { createContext, useContext, useState } from "react"
import Toast from "react-native-toast-message"

interface Notification {
    id: string
    title: string
    message: string
    timestamp: Date
    read: boolean
}

interface NotificationContextData {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    addNotification: (title: string, message: string) => void
}

const NotificationContext = createContext<NotificationContextData>(
    {} as NotificationContextData
)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    const unreadCount = notifications.filter((n) => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const addNotification = (title: string, message: string) => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            message,
            timestamp: new Date(),
            read: false,
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Show toast
        Toast.show({
            type: "info",
            text1: title,
            text2: message,
            position: "top",
            visibilityTime: 3000,

        })
    }

    // Simulate receiving notifications for demo
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const messages = [
    //             { title: "Nova Entrega", message: "Você tem uma nova entrega disponível" },
    //             { title: "Pagamento Recebido", message: "Pagamento de R$ 150,00 confirmado" },
    //             { title: "Avaliação", message: "Você recebeu uma nova avaliação" },
    //         ]

    //         const random = messages[Math.floor(Math.random() * messages.length)]
    //         addNotification(random.title, random.message)
    //     }, 10000) // Every 10 seconds for testing

    //     return () => clearInterval(interval)
    // }, [])

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error("useNotifications must be used within NotificationProvider")
    }
    return context
}
