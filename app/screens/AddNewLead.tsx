import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

interface AddNewLeadPageProps {
  userName?: string; // Dynamic user name prop
}

export default function AddNewLead({
  userName = "Albert Jordan",
}: AddNewLeadPageProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [creditProcessingVolume, setCreditProcessingVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const volumeOptions = [
    "Select Volume",
    "Under $25,000/Month",
    "Over $25,000/Month",
  ];

  const handleSave = async () => {
    if (!firstName || !lastName || !businessName || !phone || !emailAddress) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // API call to save lead data
      const leadData = {
        firstName,
        lastName,
        businessName,
        phone,
        emailAddress,
        zipCode,
        creditProcessingVolume,
        notes,
      };

      console.log("Saving lead:", leadData);

      // Placeholder for API call
      // await saveLead(leadData);

      Alert.alert("Success", "Lead saved successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form or navigate back
            setFirstName("");
            setLastName("");
            setBusinessName("");
            setPhone("");
            setEmailAddress("");
            setZipCode("");
            setCreditProcessingVolume("");
            setNotes("");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save lead");
    } finally {
      setLoading(false);
    }
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
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity style={styles.profileIcon}>
              <Ionicons name="person-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>Add New Lead</Text>

          {/* Name Row */}
          <View style={styles.nameRow}>
            <View style={styles.nameInputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
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
              <Text style={styles.inputLabel}>Last Name</Text>
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
            <Text style={styles.inputLabel}>Business Name</Text>
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
            <Text style={styles.inputLabel}>Phone</Text>
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
            <Text style={styles.inputLabel}>Email Address</Text>
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

          {/* Zip Code */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Zip Code</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Zip Code"
                placeholderTextColor="#999"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
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

          {/* Credit Processing Volume */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Credit Processing Volume</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={creditProcessingVolume}
                onValueChange={(itemValue) => {
                  // Only set the value if it's not the placeholder
                  if (itemValue !== "") {
                    setCreditProcessingVolume(itemValue);
                  }
                }}
                style={styles.picker}
                itemStyle={
                  creditProcessingVolume === ""
                    ? styles.pickerPlaceholder
                    : undefined
                }
              >
                {volumeOptions.map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option}
                    value={index === 0 ? "" : option} // First item (placeholder) has empty value
                    // Optional: You can style the placeholder item differently
                    color={
                      index === 0 && creditProcessingVolume === ""
                        ? "#999"
                        : "#333"
                    }
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes</Text>
            <View style={styles.notesWrapper}>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes here..."
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect={true}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    marginTop: 50,
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
  pickerIcon: {
    paddingHorizontal: 16,
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
    height: 100,
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
  pickerPlaceholder: {
    color: "#999",
  },
});
