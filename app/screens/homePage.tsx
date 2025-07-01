import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function HomePage() {
  const router = useRouter();
  const handleLogin = () => {
    console.log("Login pressed");
    router.push("/screens/LoginPage");
  };

  const handleCreateAccount = () => {
    console.log("Create Account pressed");
    router.push("/screens/SignUpPage");
  };

  return (
    <SafeAreaView style={styles.container} edges={["right", "left", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Spacing - Reduced for iOS since SafeAreaView handles top spacing */}
      <View style={styles.topSpacing} />

      {/* Top Image Container */}
      <View style={styles.topImageContainer}>
        <Image
          source={require("../../assets/images/Logo_Name.png")}
          style={styles.scribbleImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Image Container */}
      <View style={styles.bottomImageContainer}>
        <Image
          style={styles.scribbleImage}
          source={require("../../assets/images/Logo_PaymXnts.png")}
          resizeMode="contain"
        />
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topSpacing: {
    height: Platform.OS === "ios" ? 5 : 15, // Less spacing needed on iOS with SafeAreaView
  },
  topImageContainer: {
    height: height * 0.32, // 32% of screen height
    marginBottom: -50,
  },
  bottomImageContainer: {
    height: height * 0.45, // 45% of screen height
    marginBottom: 80,
  },
  scribbleImage: {
    width: "100%",
    height: "100%",
  },
  buttonsContainer: {
    height: 110, // Fixed height to ensure buttons fit
    justifyContent: "center",
    gap: 15,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  createAccountButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
