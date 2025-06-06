import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PendingPage() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleBackToLogin = () => {
    router.push("/screens/LoginPage");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="hourglass-outline" size={80} color="#FFD700" />
        </View>

        <Text style={styles.title}>Verification Pending</Text>
        <Text style={styles.subtitle}>
          Your agent account registration has been submitted successfully.
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>📧 Email: {email}</Text>
          <Text style={styles.infoText}>
            ⏳ Status: Waiting for admin approval
          </Text>
        </View>

        <Text style={styles.description}>
          An administrator will review your application and approve your account
          within 24-48 hours. You'll receive an email notification once your
          account is approved.
        </Text>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  infoContainer: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
