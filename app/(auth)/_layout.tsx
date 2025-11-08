import React from "react"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

export default function AuthLayout() {
  return (
    <>
      <StatusBar hidden />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  )
}