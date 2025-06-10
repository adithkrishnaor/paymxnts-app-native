import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";

export default function AddNewLead() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [cityState, setCityState] = useState("");
  const [creditProcessingVolume, setCreditProcessingVolume] = useState("");
  const [pointsOfSale, setPointsOfSale] = useState("");
  const [businessLocations, setBusinessLocations] = useState("");
  const [otherNotes, setOtherNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [agentId, setAgentId] = useState("");
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const volumeOptions = ["Under $25,000/month", "Over $25,000/month"];

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const storedAgentEmail = await AsyncStorage.getItem("agentEmail");

        if (!storedAgentEmail) {
          router.replace("/screens/homePage");
          return;
        }

        const agentQuery = query(
          collection(db, "agents"),
          where("email", "==", storedAgentEmail.toLowerCase())
        );

        const agentSnapshot = await getDocs(agentQuery);

        if (agentSnapshot.empty) {
          Alert.alert("Error", "Agent not found");
          router.replace("/screens/homePage");
          return;
        }

        const agentDoc = agentSnapshot.docs[0];
        const agentData = agentDoc.data();
        setAgentName(`${agentData.firstName} ${agentData.lastName}`);
        setAgentEmail(storedAgentEmail);
        setAgentId(agentDoc.id);
      } catch (error) {
        console.error("Error fetching agent data:", error);
        Alert.alert("Error", "Failed to load agent data");
        router.replace("/screens/homePage");
      } finally {
        setLoadingAgent(false);
      }
    };

    fetchAgentData();
  }, []);

  const resetForm = () => {
    console.log("Resetting form...");
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setPhone("");
    setEmailAddress("");
    setCityState("");
    setCreditProcessingVolume("");
    setPointsOfSale("");
    setBusinessLocations("");
    setOtherNotes("");
  };

  const handleLogout = async () => {
    try {
      Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("agentEmail");
              router.replace("/screens/homePage");
              console.log("User logged out successfully");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert(
                "Logout Error",
                "Failed to log out. Please try again."
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Logout confirmation error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const handleViewLeads = () => {
    router.push("/screens/ViewLeads");
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Validation Error", "First Name is required");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Validation Error", "Last Name is required");
      return false;
    }
    if (!businessName.trim()) {
      Alert.alert("Validation Error", "Business Name is required");
      return false;
    }
    if (!phone.trim()) {
      Alert.alert("Validation Error", "Phone number is required");
      return false;
    }
    if (!emailAddress.trim()) {
      Alert.alert("Validation Error", "Email Address is required");
      return false;
    }
    if (!cityState.trim()) {
      Alert.alert("Validation Error", "City/State is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    // Phone validation
    const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
    if (!phoneRegex.test(phone.trim()) || phone.trim().length < 10) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid phone number (minimum 10 digits)"
      );
      return false;
    }

    if (!creditProcessingVolume) {
      Alert.alert(
        "Validation Error",
        "Please select Monthly Credit Card Processing volume"
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    console.log("Save button pressed");

    if (!validateForm()) {
      return;
    }

    if (!agentName || !agentEmail || !agentId) {
      Alert.alert(
        "Error",
        "Agent information not loaded. Please try logging in again."
      );
      return;
    }

    setLoading(true);

    try {
      const leadData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        emailAddress: emailAddress.trim(),
        cityState: cityState.trim(),
        creditProcessingVolume,
        pointsOfSale: pointsOfSale.trim(),
        businessLocations: businessLocations.trim(),
        otherNotes: otherNotes.trim(),
        agentId,
        agentName,
        agentEmail,
        createdAt: serverTimestamp(),
        status: "new",
      };

      console.log("Saving lead:", leadData);

      // Save to Firestore
      await addDoc(collection(db, "leads"), leadData);

      // Show success modal
      setShowSuccessModal(true);

      // Reset form
      resetForm();
    } catch (error: any) {
      console.error("Save error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to save lead. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const SuccessModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showSuccessModal}
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              New lead has been added successfully
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loadingAgent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading agent information...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.userName}>{agentName || "Agent"}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.viewLeadsButton}
                onPress={handleViewLeads}
              >
                <Ionicons name="list-outline" size={20} color="#666" />
                <Text style={styles.viewLeadsText}>View Leads</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileIcon}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Add New Lead</Text>

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="First Name"
                  placeholderTextColor="#999"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Last Name"
                  placeholderTextColor="#999"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>

          {/* Business Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Business Name *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter business name"
                placeholderTextColor="#999"
                value={businessName}
                onChangeText={setBusinessName}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Ionicons
                name="business-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* City/State */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City/State *</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter City, State"
                placeholderTextColor="#999"
                value={cityState}
                onChangeText={setCityState}
                autoCapitalize="words"
                autoCorrect={false}
              />
              <Ionicons
                name="location-outline"
                size={20}
                color="#999"
                style={styles.inputIcon}
              />
            </View>
          </View>

          {/* Monthly Credit Card Processing */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Monthly Credit Card Processing *
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={creditProcessingVolume}
                onValueChange={(itemValue) =>
                  setCreditProcessingVolume(itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item
                  label="Select Processing Volume"
                  value=""
                  color="#999"
                />
                {volumeOptions.map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option}
                    value={option}
                    color="#333"
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Notes Section */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>

            {/* Points of Sale */}
            <View style={styles.notesSubContainer}>
              <Text style={styles.notesSubLabel}>
                How many Points of Sale currently have:
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Number of POS systems"
                  placeholderTextColor="#999"
                  value={pointsOfSale}
                  onChangeText={setPointsOfSale}
                  keyboardType="numeric"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Business Locations */}
            <View style={styles.notesSubContainer}>
              <Text style={styles.notesSubLabel}>
                How many Business locations:
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Number of locations"
                  placeholderTextColor="#999"
                  value={businessLocations}
                  onChangeText={setBusinessLocations}
                  keyboardType="numeric"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Other Notes */}
            <View style={styles.notesSubContainer}>
              <Text style={styles.notesSubLabel}>Other notes:</Text>
              <View style={styles.notesWrapper}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add other notes here..."
                  placeholderTextColor="#999"
                  value={otherNotes}
                  onChangeText={setOtherNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="sentences"
                  autoCorrect={true}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Submitting..." : "Submit Lead"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeContainer: {
    flex: 1,
    marginTop: 50,
  },
  welcomeText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    gap: 10,
  },
  viewLeadsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  viewLeadsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  nameInputContainer: {
    flex: 0.48,
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
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  notesSubContainer: {
    marginBottom: 15,
  },
  notesSubLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  notesWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesInput: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#FFD700",
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
  saveButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxWidth: 300,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
    minWidth: 100,
  },
  modalButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
