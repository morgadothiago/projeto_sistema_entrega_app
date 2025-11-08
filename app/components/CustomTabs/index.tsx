import { colors } from "@/app/theme"
import { Feather } from "@expo/vector-icons"
import React from "react"
import { Animated, TouchableOpacity, View } from "react-native"
import { styles } from "./styles"

interface TabItem {
  name: string // deve bater com o nome da rota (case-insensitive)
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
  { name: "charts", label: "Chat", icon: "bar-chart" },
  { name: "delivery", label: "Delivery", icon: "truck", highlight: true },
  { name: "payments", label: "Pagamentos", icon: "dollar-sign" },
  { name: "profile", label: "Perfil", icon: "user" },
]

export function CustomTabs({ state, navigation }: CustomTabBarProps) {
  // Verificar se state e navigation existem para evitar erros
  if (!state || !navigation || !state.routes) {
    return null;
  }

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        // Procura a rota correspondente pelo nome (case-insensitive)
        const route = state.routes.find(
          (r: any) => r?.name?.toLowerCase() === tab.name.toLowerCase()
        )
        // Se não encontrar, ainda renderiza o botão sem crashar
        const isFocused = route && state.routes && state.index !== undefined && state.routes[state.index]
          ? route.key === state.routes[state.index]?.key
          : false
        const isDelivery = tab.highlight

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
            console.log("Erro na navegação:", error)
          }
        }

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={onPress}
            style={[
              styles.tabButton,
              { marginTop: isDelivery ? -100 : 0 }, // destaca delivery
            ]}
          >
            <View style={isDelivery ? styles.deliveryWrapper : undefined}>
              <Animated.View
                style={{ transform: [{ scale: isFocused ? 1.2 : 1 }] }}
              >
                <Feather
                  name={tab.icon}
                  size={isDelivery ? 28 : 24}
                  color={
                    isDelivery
                      ? colors.primary
                      : isFocused
                      ? colors.buttons
                      : colors.active
                  }
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
