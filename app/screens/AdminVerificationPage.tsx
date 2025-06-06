import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/FirebaseConfig";

interface VerificationRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please log in as admin");
      router.push("/screens/LoginPage");
      return;
    }

    const adminEmails = ["adith3939@gmail.com", "admin@example.com"]; // Add your admin emails
    if (!adminEmails.includes(currentUser.email?.toLowerCase() || "")) {
      Alert.alert("Access Denied", "You don't have admin privileges");
      router.push("/screens/LoginPage");
      return;
    }

    // Store admin user info
    setAdminUser(currentUser);

    // Listen for pending verification requests
    const q = query(
      collection(db, "agentVerifications"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const pendingRequests: VerificationRequest[] = [];
        querySnapshot.forEach((doc) => {
          pendingRequests.push({
            id: doc.id,
            ...doc.data(),
          } as VerificationRequest);
        });
        setRequests(pendingRequests);
        setError(null);
      },
      (error) => {
        console.error("Firestore error:", error);
        setError("Permission denied. Please ensure you're logged in as admin.");
        Alert.alert(
          "Permission Error",
          "You don't have permission to access this data. Please ensure you're logged in as admin."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: VerificationRequest) => {
    Alert.alert(
      "Approve Agent",
      `Are you sure you want to approve ${request.firstName} ${request.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setLoading(true);
            try {
              // Step 1: Create agent profile directly in Firestore
              await addDoc(collection(db, "agents"), {
                firstName: request.firstName,
                lastName: request.lastName,
                email: request.email.toLowerCase(),
                phone: request.phone,
                password: request.password, // Store hashed in production
                role: "agent",
                status: "active",
                createdAt: new Date().toISOString(),
                approvedAt: new Date().toISOString(),
                approvedBy: adminUser?.uid || "admin",
                lastLoginAt: null,
              });

              // Step 2: Delete verification request
              await deleteDoc(doc(db, "agentVerifications", request.id));

              Alert.alert("Success", "Agent approved successfully!");
            } catch (error: any) {
              console.error("Error approving agent:", error);
              Alert.alert("Error", error.message || "Failed to approve agent");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (request: VerificationRequest) => {
    Alert.alert(
      "Reject Agent",
      `Are you sure you want to reject ${request.firstName} ${request.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Update the status to rejected
              await updateDoc(doc(db, "agentVerifications", request.id), {
                status: "rejected",
                rejectedAt: new Date().toISOString(),
                rejectedBy: adminUser?.uid || "admin",
              });

              // Delete the verification request
              await deleteDoc(doc(db, "agentVerifications", request.id));

              Alert.alert("Success", "Agent registration rejected and removed");
            } catch (error: any) {
              console.error("Error rejecting agent:", error);
              Alert.alert("Error", error.message || "Failed to reject agent");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        onPress: async () => {
          try {
            await auth.signOut();
            router.push("/screens/LoginPage");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const renderRequest = ({ item }: { item: VerificationRequest }) => {
    console.log("Rendering request:", item.id, "loading state:", loading);

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.agentName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.requestDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.detailText}>📧 {item.email}</Text>
          <Text style={styles.detailText}>📱 {item.phone}</Text>
          <Text style={styles.statusText}>Status: {item.status}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.approveButton,
              loading && styles.disabledButton, // Add this style if needed
            ]}
            onPress={() => {
              console.log("Approve button pressed for:", item.id);
              handleApprove(item);
            }}
            disabled={loading}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Approve"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              loading && styles.disabledButton, // Add this style if needed
            ]}
            onPress={() => {
              console.log("Reject button pressed for:", item.id);
              handleReject(item);
            }}
            disabled={loading}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {loading ? "Processing..." : "Reject"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={60} color="#f44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              router.push("/screens/LoginPage");
            }}
          >
            <Text style={styles.retryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Agent Verifications</Text>
          <Text style={styles.headerSubtitle}>
            {requests.length} pending requests
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.emptyText}>No pending verifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  signOutButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  agentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  requestDate: {
    fontSize: 12,
    color: "#666",
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
