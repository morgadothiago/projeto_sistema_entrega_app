export default ({ config }) => ({
  ...config,
  expo: {
    name: "entregador-app",
    slug: "entregador-app",
    owner: "thiago_morgado",
    version: "1.0.0",
    platforms: ["ios", "android"],
    orientation: "portrait",
    icon: "./app/assets/icon.png",
    splash: {
      image: "./app/assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#0057FF"
    },
    backgroundColor: "#0057FF",
    scheme: "mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    // Privacy and descriptions
    description: "Aplicativo de gestão de entregas para entregadores. Gerencie suas rotas, acompanhe pagamentos e otimize seu trabalho.",
    privacy: "public",

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.thiago_morgado.entregador",
      buildNumber: "1",
      infoPlist: {
        // Encryption
        ITSAppUsesNonExemptEncryption: false,

        // Location permissions
        NSLocationWhenInUseUsageDescription: "Precisamos da sua localização para mostrar entregas próximas e calcular rotas de navegação.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Usamos sua localização para rastrear entregas em andamento e otimizar suas rotas.",
        NSLocationAlwaysUsageDescription: "A localização em segundo plano nos permite rastrear suas entregas ativas.",

        // Camera and Photos permissions
        NSPhotoLibraryUsageDescription: "Precisamos acessar suas fotos para você adicionar foto de perfil e anexar comprovantes de entrega.",
        NSPhotoLibraryAddUsageDescription: "Permitir salvar fotos de comprovantes de entrega na galeria.",
        NSCameraUsageDescription: "Precisamos da câmera para você tirar fotos de documentos, comprovantes e foto de perfil.",

        // App Transport Security
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "localhost": {
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            }
          }
        }
      }
    },

    android: {
      package: "com.thiago_morgado.entregador",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./app/assets/android-icon-foreground.png",
        backgroundImage: "./app/assets/android-icon-foreground.png",
        monochromeImage: "./app/assets/android-icon-foreground.png",
        backgroundColor: "#0057FF"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,

      // Android permissions
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ]
    },

    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
          locationWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "The app needs access to your photos to let you share images.",
          cameraPermission: "The app needs access to your camera to let you take photos."
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./app/assets/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#0057FF",
          dark: {
            backgroundColor: "#0057FF"
          }
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      router: {},
      eas: {
        projectId: "88c7717f-f0c8-4f10-9062-05720523cb8b"
      },
      // Environment variables
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000",
      apiTimeout: process.env.EXPO_PUBLIC_API_TIMEOUT || "10000",
      viaCepApiUrl: process.env.EXPO_PUBLIC_VIA_CEP_API_URL || "https://viacep.com.br/ws"
    },



    assetBundlePatterns: [
      "**/*"
    ]
  }
})
