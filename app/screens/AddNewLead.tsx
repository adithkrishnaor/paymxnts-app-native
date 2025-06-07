import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { db } from "../../config/FirebaseConfig";

export default function AddNewLead() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [creditProcessingVolume, setCreditProcessingVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const [loadingAgent, setLoadingAgent] = useState(true);

  const volumeOptions = [
    "Select Volume",
    "Under $25,000/Month",
    "Over $25,000/Month",
  ];

  // Configuration - you can move these to a config file
  const RECIPIENT_EMAIL = "adthkrshna@gmail.com"; // Change this to your desired email
  const COMPANY_NAME = "Adith Company";

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const storedAgentEmail = await AsyncStorage.getItem("agentEmail");

        if (!storedAgentEmail) {
          // Clear navigation stack and redirect to home
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
          // Clear navigation stack and redirect to home
          router.replace("/screens/homePage");
          return;
        }

        const agentDoc = agentSnapshot.docs[0];
        const agentData = agentDoc.data();
        setAgentName(`${agentData.firstName} ${agentData.lastName}`);
        setAgentEmail(storedAgentEmail);
      } catch (error) {
        console.error("Error fetching agent data:", error);
        Alert.alert("Error", "Failed to load agent data");
        // Clear navigation stack and redirect to home
        router.replace("/screens/homePage");
      } finally {
        setLoadingAgent(false);
      }
    };

    fetchAgentData();
  }, []);

  const generateCSVContent = (leadData: any) => {
    // CSV headers
    const headers = [
      "First Name",
      "Last Name",
      "Business Name",
      "Phone",
      "Email Address",
      "Zip Code",
      "Credit Processing Volume",
      "Notes",
      "Agent Name",
      "Agent Email",
      "Submission Date",
      "Submission Time",
    ];

    // Current date and time
    const now = new Date();
    const submissionDate = now.toLocaleDateString();
    const submissionTime = now.toLocaleTimeString();

    // CSV data row - properly escape all fields
    const dataRow = [
      `"${leadData.firstName.replace(/"/g, '""')}"`,
      `"${leadData.lastName.replace(/"/g, '""')}"`,
      `"${leadData.businessName.replace(/"/g, '""')}"`,
      `"${leadData.phone.replace(/"/g, '""')}"`,
      `"${leadData.emailAddress.replace(/"/g, '""')}"`,
      `"${leadData.zipCode.replace(/"/g, '""')}"`,
      `"${leadData.creditProcessingVolume.replace(/"/g, '""')}"`,
      `"${leadData.notes.replace(/"/g, '""')}"`,
      `"${agentName.replace(/"/g, '""')}"`,
      `"${agentEmail.replace(/"/g, '""')}"`,
      `"${submissionDate}"`,
      `"${submissionTime}"`,
    ];

    // Combine headers and data
    const csvContent = [headers.join(","), dataRow.join(",")].join("\n");

    return csvContent;
  };

  const generateCSVFileName = () => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
    const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, "");
    const cleanLastName = lastName.replace(/[^a-zA-Z0-9]/g, "");
    return `lead_${cleanFirstName}_${cleanLastName}_${dateStr}_${timeStr}.csv`;
  };

  const sendLeadViaEmail = async (leadData: any) => {
    try {
      console.log("Starting email send process...");

      // In Expo Go, MailComposer might not work properly, so we'll use sharing as primary method
      // and provide email as a sharing option

      // Check if we're in Expo Go environment
      const isExpoGo = __DEV__ && Platform.OS !== "web";

      if (isExpoGo) {
        console.log("Detected Expo Go environment, using sharing method");
        return await sendViaSharing(leadData);
      }

      // Check if mail composer is available
      const isMailAvailable = await MailComposer.isAvailableAsync();
      console.log("Mail available:", isMailAvailable);

      if (!isMailAvailable) {
        console.log("Mail not available, falling back to sharing");
        return await sendViaSharing(leadData);
      }

      // Generate CSV content
      const csvContent = generateCSVContent(leadData);
      const fileName = generateCSVFileName();

      // Create temporary file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      console.log("Creating CSV file at:", fileUri);

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("CSV file created successfully");

      // Compose email with agent as sender
      const emailOptions: MailComposer.MailComposerOptions = {
        recipients: [RECIPIENT_EMAIL],
        subject: `New Lead Submission - ${leadData.firstName} ${leadData.lastName}`,
        body: `
Dear Team,

A new lead has been submitted by ${agentName}.

Lead Details:
- Name: ${leadData.firstName} ${leadData.lastName}
- Business: ${leadData.businessName}
- Phone: ${leadData.phone}
- Email: ${leadData.emailAddress}
- Zip Code: ${leadData.zipCode}
- Processing Volume: ${leadData.creditProcessingVolume}
- Notes: ${leadData.notes}

Agent: ${agentName} (${agentEmail})
Submission Date: ${new Date().toLocaleString()}

Please find the detailed information in the attached CSV file.

Best regards,
${COMPANY_NAME} Lead Management System
        `,
        attachments: [fileUri],
        isHtml: false,
      };

      console.log("Composing email with options:", {
        recipients: emailOptions.recipients,
        subject: emailOptions.subject,
        hasAttachment: !!emailOptions.attachments?.length,
      });

      // Send email
      const result = await MailComposer.composeAsync(emailOptions);
      console.log("Email composer result:", result);

      // Clean up temporary file
      try {
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        console.log("Temporary file cleaned up");
      } catch (cleanupError) {
        console.warn("Failed to cleanup temporary file:", cleanupError);
      }

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        Alert.alert("Success", "Lead submitted and email sent successfully!");
        return true;
      } else if (result.status === MailComposer.MailComposerStatus.CANCELLED) {
        Alert.alert("Cancelled", "Email composition was cancelled");
        return false;
      } else if (result.status === MailComposer.MailComposerStatus.SAVED) {
        Alert.alert("Saved", "Email has been saved to drafts");
        return true;
      } else {
        console.log("Unexpected email result status:", result.status);
        Alert.alert(
          "Notice",
          "Email composer closed. Please check if the email was sent."
        );
        return false;
      }
    } catch (error) {
      console.error("Email sending error:", error);
      console.log("Falling back to sharing method due to error");
      return await sendViaSharing(leadData);
    }
  };

  const sendViaSharing = async (leadData: any) => {
    try {
      console.log("Using sharing method for lead submission");

      // Generate email content as text
      const emailContent = `
TO: ${RECIPIENT_EMAIL}
SUBJECT: New Lead Submission - ${leadData.firstName} ${leadData.lastName}

Dear Team,

A new lead has been submitted by ${agentName}.

Lead Details:
- Name: ${leadData.firstName} ${leadData.lastName}
- Business: ${leadData.businessName}
- Phone: ${leadData.phone}
- Email: ${leadData.emailAddress}
- Zip Code: ${leadData.zipCode}
- Processing Volume: ${leadData.creditProcessingVolume}
- Notes: ${leadData.notes}

Agent: ${agentName} (${agentEmail})
Submission Date: ${new Date().toLocaleString()}

CSV data is included below:
${generateCSVContent(leadData)}

Best regards,
${COMPANY_NAME} Lead Management System
      `;

      // Create text file with email content
      const fileName = `lead_${leadData.firstName}_${leadData.lastName}_${
        new Date().toISOString().split("T")[0]
      }.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, emailContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("Lead file created for sharing:", fileUri);

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      console.log("Sharing available:", isSharingAvailable);

      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/plain",
          dialogTitle: "Share Lead Information",
        });

        Alert.alert(
          "Lead Prepared",
          `Lead information has been prepared for sharing. You can email it to ${RECIPIENT_EMAIL} or share via any app.`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Lead sharing completed successfully");
              },
            },
          ]
        );

        return true;
      } else {
        // Fallback: Show the content in an alert for copying
        Alert.alert(
          "Lead Information",
          `Please copy this information and send to ${RECIPIENT_EMAIL}:\n\n${emailContent.substring(
            0,
            500
          )}...`,
          [
            {
              text: "OK",
            },
          ]
        );
        return true;
      }
    } catch (error) {
      console.error("Sharing method error:", error);
      Alert.alert("Error", "Failed to prepare lead for sharing");
      return false;
    }
  };

  const saveAndShareCSV = async (leadData: any) => {
    try {
      console.log("Generating CSV for sharing...");

      const csvContent = generateCSVContent(leadData);
      const fileName = generateCSVFileName();
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log("CSV file created for sharing:", fileUri);

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      console.log("Sharing available:", isSharingAvailable);

      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Share Lead CSV",
        });

        Alert.alert(
          "CSV Generated",
          `Lead data has been saved as ${fileName}. You can share it via your preferred method.`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("CSV sharing completed successfully");
              },
            },
          ]
        );

        return true;
      } else {
        Alert.alert("Error", "Unable to share the CSV file on this device");
        return false;
      }
    } catch (error) {
      console.error("CSV generation error:", error);
      Alert.alert("Error", "Failed to generate CSV file");
      return false;
    }
  };

  const resetForm = () => {
    console.log("Resetting form...");
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setPhone("");
    setEmailAddress("");
    setZipCode("");
    setCreditProcessingVolume("");
    setNotes("");
  };

  const handleLogout = async () => {
    try {
      // Show confirmation dialog before logout
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
              // Clear the stored email
              await AsyncStorage.removeItem("agentEmail");

              // Clear any other stored authentication data if needed
              // await AsyncStorage.multiRemove(['agentEmail', 'otherAuthData']);

              // Use replace instead of push to clear navigation stack
              // This prevents users from going back to authenticated screens
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress.trim())) {
      Alert.alert("Validation Error", "Please enter a valid email address");
      return false;
    }

    // Phone validation (more flexible)
    const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
    if (!phoneRegex.test(phone.trim()) || phone.trim().length < 10) {
      Alert.alert(
        "Validation Error",
        "Please enter a valid phone number (minimum 10 digits)"
      );
      return false;
    }

    if (!creditProcessingVolume || creditProcessingVolume === "") {
      Alert.alert("Validation Error", "Please select Credit Processing Volume");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    console.log("Save button pressed");

    if (!validateForm()) {
      return;
    }

    if (!agentName || !agentEmail) {
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
        zipCode: zipCode.trim(),
        creditProcessingVolume,
        notes: notes.trim(),
      };

      console.log("Saving lead:", leadData);

      // Send lead via email as CSV or sharing
      const leadSent = await sendLeadViaEmail(leadData);

      if (leadSent) {
        // Reset form only if lead was sent/shared successfully
        resetForm();
      }
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
            <TouchableOpacity style={styles.profileIcon} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#666" />
            </TouchableOpacity>
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
            <Text style={styles.inputLabel}>Credit Processing Volume *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={creditProcessingVolume}
                onValueChange={(itemValue) => {
                  if (itemValue !== "") {
                    setCreditProcessingVolume(itemValue);
                  }
                }}
                style={styles.picker}
              >
                {volumeOptions.map((option, index) => (
                  <Picker.Item
                    key={index}
                    label={option}
                    value={index === 0 ? "" : option}
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
              {loading ? "Submitting..." : "Submit Lead"}
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
