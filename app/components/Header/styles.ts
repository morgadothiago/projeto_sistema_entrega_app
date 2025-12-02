

import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  title: {
    color: colors.buttons,
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  tabs: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  tabsTitile: {
    color: colors.buttons,
    fontSize: 18,
    fontWeight: "bold",
  },
  notificationButton: {
    padding: 8,
    position: "relative",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF453A",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
  },
})
