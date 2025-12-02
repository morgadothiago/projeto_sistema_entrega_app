import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import React from "react"
import { Animated, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { styles } from "./styles"

interface TabItem {
  name: string
  label: string
  icon: keyof typeof Feather.glyphMap
  highlight?: boolean
}

interface CustomTabBarProps {
  state: any
  navigation: any
}

const tabs: TabItem[] = [
  { name: "home", label: "Início", icon: "home" },
  { name: "charts", label: "Relatório", icon: "file-text" },
  { name: "delivery", label: "Delivery", icon: "truck", highlight: true },
  { name: "payments", label: "Pagamentos", icon: "dollar-sign" },
  { name: "profile", label: "Perfil", icon: "user" },
]

export function CustomTabs({ state, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets()

  if (!state || !navigation || !state.routes) {
    return null
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const route = state.routes.find(
            (r: any) => r?.name?.toLowerCase() === tab.name.toLowerCase()
          )
          const isFocused = route && state.routes && state.index !== undefined && state.routes[state.index]
            ? route.key === state.routes[state.index]?.key
            : false
          const isHighlight = tab.highlight

          const onPress = () => {
            if (!route || !navigation) return

            try {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })

              if (!isFocused && !event?.defaultPrevented) {
                navigation.navigate(tab.name)
              }
            } catch (error) {
              console.error("Navigation error:", error)
            }
          }

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabContent,
                isHighlight && styles.highlightTab,
              ]}>
                <Animated.View
                  style={[
                    styles.iconContainer,
                    { opacity: isFocused ? 1 : 0.6 }
                  ]}
                >
                  <Feather
                    name={tab.icon}
                    size={isHighlight ? 26 : 22}
                    color={
                      isHighlight
                        ? colors.primary
                        : isFocused
                          ? colors.buttons
                          : colors.secondary
                    }
                  />
                </Animated.View>
                {!isHighlight && (
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused && styles.tabLabelFocused
                    ]}
                  >
                    {tab.label}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}
