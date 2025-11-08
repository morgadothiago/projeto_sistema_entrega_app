import { CustomTabs } from "@/app/components/CustomTabs"
import { Tabs } from "expo-router"
import React from "react"

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
