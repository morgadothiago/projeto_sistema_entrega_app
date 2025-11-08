import React from "react"
import {
  Image,
  Text,
  View,
  ImageSourcePropType,
  StyleSheet,
} from "react-native"
import { ApiResponse } from "@/app/types/ApiResponse"

interface UserWarpperProps {
  deliveryMan: ApiResponse["DeliveryMan"]
  avatarSource?: ImageSourcePropType
}

export default function UserWarpper({
  deliveryMan,
  avatarSource,
}: UserWarpperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={avatarSource} style={styles.avatar} />
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.userName}>{deliveryMan?.name || "Usuário"}</Text>
        <Text>R$ 1000.000</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginVertical: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
})
