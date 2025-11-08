import React from "react"

import LottieView from "lottie-react-native"
import { ImageBackground, StyleSheet, View } from "react-native"

import { Image } from "expo-image"
import FundoLogo from "../../assets/funndo.png"
import animation from "../../assets/Loading.json" // arquivo Lottie
import Logo from "../../assets/logo.png"

export default function Loading() {
  return (
    <ImageBackground source={FundoLogo} style={styles.fundoImg}>
      <View style={styles.splash}>
        <Image source={Logo} style={styles.logo} />
        <LottieView source={animation} autoPlay loop style={styles.lottie} />
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  fundoImg: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  splash: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  lottie: {
    width: 50,
    height: 50,
  },
})
