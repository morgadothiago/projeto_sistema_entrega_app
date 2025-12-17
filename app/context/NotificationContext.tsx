import React, { createContext, useContext, useState } from "react"
import { Platform } from "react-native"
import Toast from "react-native-toast-message"
import * as Notifications from "expo-notifications"

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

    const notificationListener = React.useRef<Notifications.Subscription | null>(null);
    const responseListener = React.useRef<Notifications.Subscription | null>(null);

    // Expo Notifications Integration
    React.useEffect(() => {
        let isMounted = true;

        const setupNotifications = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            try {
                const tokenData = await Notifications.getExpoPushTokenAsync({
                    projectId: "88c7717f-f0c8-4f10-9062-05720523cb8b" // ID do projeto obtido do app.json/eas.json
                });
                console.log("📢 EXPO PUSH TOKEN:", tokenData.data);
            } catch (error) {
                console.log("Error fetching push token:", error);
            }

            // Android Channel Configuration
            try {
                // Defensive check and logging
                console.log("Checking Platform:", Platform);
                if (Platform?.OS === 'android') {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#FF231F7C',
                    });
                }
            } catch (error) {
                console.log("Error setting notification channel:", error);
            }

            // Sync with Backend if user is logged in
            try {
                const { getItem } = require("../helpers/Storage");
                const { STORAGE_KEYS } = require("../utils/constants");
                const { updatePushToken } = require("../service/api");

                const userJson = await getItem(STORAGE_KEYS.USER);
                if (userJson) {
                    const user = JSON.parse(userJson);
                    const tokenData = await Notifications.getExpoPushTokenAsync({
                        projectId: "88c7717f-f0c8-4f10-9062-05720523cb8b"
                    });

                    if (user?.id && tokenData?.data) {
                        console.log(`Sending token for user ${user.id}...`);
                        await updatePushToken(user.id, tokenData.data);
                    }
                }
            } catch (error) {
                console.log("Error syncing token with backend:", error);
            }
        };

        setupNotifications();

        // Listener for foreground notifications
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log("🔔 Notification Received in Foreground:", notification);
            const { title, body } = notification.request.content;
            if (title && body) {
                // Update local state smoothly
                addNotification(title, body);
            }
        });

        // Listener for interaction (user tapped notification)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("👆 Notification Tapped:", response);
            // Here you can handle navigation based on data
        });

        return () => {
            isMounted = false;
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    // Sync Badge Count
    React.useEffect(() => {
        const updateBadge = async () => {
            try {
                await Notifications.setBadgeCountAsync(unreadCount);
            } catch (error) {
                console.log("Error setting badge count:", error);
            }
        };
        updateBadge();
    }, [unreadCount]);

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
