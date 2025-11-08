import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 100,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryWrapper: {
    backgroundColor: colors.buttons,
    borderRadius: 35,
    padding: 10,
  },

  deliveryText: {
    color: colors.buttons,
    fontSize: 16,
    marginTop: 4,
    fontWeight: "900",
  },

  defaultText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.secondary,
    fontWeight: "900",
  },

  focusedText: {
    color: colors.secondary,
    fontWeight: "900",
  },
})
