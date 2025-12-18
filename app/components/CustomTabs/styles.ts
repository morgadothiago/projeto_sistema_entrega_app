import { colors } from "@/app/theme"
import { Platform, StyleSheet } from "react-native"
import { getElevation } from "@/app/theme/elevations"

export const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 59, 115, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    ...getElevation('modal'),
  },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 12 : 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 10,
    paddingHorizontal: 8,
    minHeight: Platform.OS === "ios" ? 60 : 56,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },

  highlightTab: {
    backgroundColor: colors.buttons,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    transform: [{ translateY: -8 }],
    ...getElevation('fab'),
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: colors.secondary,
    fontWeight: "600",
  },

  tabLabelFocused: {
    color: colors.buttons,
    fontWeight: "700",
  },
})
