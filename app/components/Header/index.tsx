import { useNotifications } from "@/app/context/NotificationContext"
import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { styles } from "./styles"

type HeaderProps = {
  title?: string
  onBackPress?: () => void
  tabs?: boolean
  tabsTitle?: string
  onNotificationPress?: () => void
  showNotifications?: boolean
  showNotificationBadge?: boolean
}

export function Header({
  title,
  onBackPress,
  tabs,
  tabsTitle,
  onNotificationPress,
  showNotifications = true,
  showNotificationBadge
}: HeaderProps) {
  const { unreadCount } = useNotifications()
  const displayNotifications = showNotificationBadge ?? showNotifications

  return (
    <View style={[styles.container, tabs && styles.tabs]}>
      {onBackPress ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Feather
            name="arrow-left"
            size={28}
            color={colors.buttons}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Text style={[styles.title, tabs && styles.tabsTitile]}>
        {tabs ? tabsTitle : title}
      </Text>

      {displayNotifications && onNotificationPress && (
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onNotificationPress}
        >
          <Feather
            name="bell"
            size={24}
            color={colors.buttons}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  )
}
