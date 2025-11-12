import { colors } from "@/app/theme"
import { Platform, StyleSheet } from "react-native"

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 255, 179, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  securityTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(93, 173, 226, 0.15)",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.support,
  },
  securityTipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  securityTipText: {
    flex: 1,
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: colors.buttons,
    marginTop: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.buttons,
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: colors.buttons,
    letterSpacing: 0.5,
  },
})
