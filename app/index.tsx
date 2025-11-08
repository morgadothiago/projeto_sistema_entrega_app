import React from "react"

import { useAuth } from "@/app/context/AuthContext"
import { Redirect } from "expo-router"

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) return null

  if (user) {
    return <Redirect href="/(tabs)/home" />
  } else {
    return <Redirect href="/(auth)/Signin" />
  }
}
