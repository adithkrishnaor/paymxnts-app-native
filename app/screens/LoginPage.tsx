import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/FirebaseConfig";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userEmail = email.toLowerCase();

      // Check if user is admin (use Firebase Auth for admins only)
      const adminEmails = ["adith3939@gmail.com", "admin@gmail.com"];
      if (adminEmails.includes(userEmail)) {
        try {
          // Admin login through Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          router.push("/screens/AdminVerificationPage");
          return;
        } catch (authError: any) {
          // Handle specific Firebase Auth errors with custom messages
          let errorMessage = "Invalid email or password";

          if (
            authError.code === "auth/user-not-found" ||
            authError.code === "auth/wrong-password" ||
            authError.code === "auth/invalid-credential"
          ) {
            errorMessage = "Invalid email or password";
          } else if (authError.code === "auth/too-many-requests") {
            errorMessage =
              "Too many failed login attempts. Please try again later.";
          } else if (authError.code === "auth/network-request-failed") {
            errorMessage = "Network error. Please check your connection.";
          }

          Alert.alert("Login Error", errorMessage);
          setLoading(false);
          return;
        }
      }

      // Agent login through Firestore validation
      const agentQuery = query(
        collection(db, "agents"),
        where("email", "==", userEmail),
        where("status", "==", "active")
      );

      const agentSnapshot = await getDocs(agentQuery);

      if (agentSnapshot.empty) {
        Alert.alert("Login Error", "No active account found with this email");
        return;
      }

      const agentDoc = agentSnapshot.docs[0];
      const agentData = agentDoc.data();

      // Validate password (in production, use proper password hashing)
      if (agentData.password !== password) {
        Alert.alert("Login Error", "Incorrect password");
        return;
      }

      // Update last login
      await updateDoc(doc(db, "agents", agentDoc.id), {
        lastLoginAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem("agentEmail", userEmail);
      router.push("/screens/AddNewLead");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Error", error.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("Google Sign In");
      Alert.alert("Coming Soon", "Google Sign In will be available soon");
    } catch (error: any) {
      Alert.alert(
        "Google Sign In Error",
        error.message || "An unknown error occurred"
      );
    }
  };

  const handleAppleSignIn = async () => {
    try {
      console.log("Apple Sign In");
      Alert.alert("Coming Soon", "Apple Sign In will be available soon");
    } catch (error: any) {
      Alert.alert(
        "Apple Sign In Error",
        error.message || "An unknown error occurred"
      );
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "Please contact admin to reset your password or implement forgot password functionality"
    );
  };

  const handleRegister = () => {
    console.log("Navigate to Register");
    router.push("/screens/SignUpPage");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Image
            source={require("../../assets/images/Logo_Name.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Log In Your Account</Text>
          <Text style={styles.subtitle}>
            Enter your email and password to continue.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.inputIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Logging In..." : "Log In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={{
                uri: "https://developers.google.com/identity/images/g-logo.png",
              }}
              style={styles.socialIcon}
            />
            <Text style={styles.socialButtonText}>Sign In with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleSignIn}
          >
            <Ionicons
              name="logo-apple"
              size={20}
              color="#000"
              style={styles.socialIconApple}
            />
            <Text style={styles.socialButtonText}>Sign In with Apple</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logo: {
    width: 200,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#a0a0a0",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 50,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialIconApple: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerText: {
    color: "#666",
    fontSize: 14,
  },
  registerLink: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
});
