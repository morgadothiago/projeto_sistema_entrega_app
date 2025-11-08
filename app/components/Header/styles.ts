import React from "react"

import { colors } from "@/app/theme"
import { StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 12,
  },
  button: {
    padding: 8,
  },
  title: {
    color: colors.buttons,
    fontSize: 22,
    fontWeight: "bold",
  },
  tabs: {
    backgroundColor: colors.primary,

    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabsTitile: {
    color: colors.buttons,
    fontSize: 18,
    fontWeight: "bold",
  },
})
