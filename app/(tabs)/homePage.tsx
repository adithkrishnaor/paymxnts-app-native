import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
export default function LoginPage() {
  const handleLogin = () => {
    console.log("Login pressed");
    // Add your login logic here
  };

  const handleCreateAccount = () => {
    console.log("Create Account pressed");
    // Add your create account logic here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Spacing */}
      <View style={styles.topSpacing} />

      {/* Top Image Container - Much Larger */}
      <View style={styles.topImageContainer}>
        <Image
          // source={{
          //   uri: "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto/v1/secured-attachments/messaging_message/attachment/ee0e9c1f8c1cfc1250ded0e4d598679e-1747666020533/Logo%20-PaymXnts-01.jpg?__cld_token__=exp=1748450947~hmac=9e61c2fd187dbe437e19461a497912c4c27369b2abc306d253baad1efdc71964",
          // }}
          source={require("../../assets/images/Logo_Name.png")}
          style={styles.scribbleImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Image Container - Much Larger */}
      <View style={styles.bottomImageContainer}>
        <Image
          // source={{
          //   uri: "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto/v1/secured-attachments/messaging_message/attachment/8820d01053fab874695e115aeb4ee333-1747666020462/Logo%20X%20Only%20-PaymXnts-01.jpg?__cld_token__=exp=1748446961~hmac=6fbfd919ae6619db2124f04db59dece6ac9625d9e56335e3af5f5c25cb41d880",
          // }}
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
    height: 15,
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
