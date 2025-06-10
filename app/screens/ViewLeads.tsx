import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  emailAddress: string;
  cityState: string;
  creditProcessingVolume: string;
  pointsOfSale: string;
  businessLocations: string;
  otherNotes: string;
  createdAt: any;
  status: string;
}

export default function ViewLeads() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [agentId, setAgentId] = useState("");

  const handleAddNewLead = () => {
    router.push("/screens/AddNewLead");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("agentEmail");
    router.replace("/screens/homePage");
  };

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      const storedAgentEmail = await AsyncStorage.getItem("agentEmail");

      if (!storedAgentEmail) {
        router.replace("/screens/homePage");
        return;
      }

      // Get agent info
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
      setAgentId(agentDoc.id);

      // Fetch leads
      await fetchLeads(agentDoc.id);
    } catch (error) {
      console.error("Error initializing screen:", error);
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (agentIdParam?: string) => {
    try {
      const targetAgentId = agentIdParam || agentId;
      if (!targetAgentId) return;

      const leadsQuery = query(
        collection(db, "leads"),
        where("agentId", "==", targetAgentId),
        orderBy("createdAt", "desc")
      );

      const leadsSnapshot = await getDocs(leadsQuery);
      const leadsData: Lead[] = [];

      leadsSnapshot.forEach((doc) => {
        leadsData.push({
          id: doc.id,
          ...doc.data(),
        } as Lead);
      });

      setLeads(leadsData);
    } catch (error) {
      console.error("Error fetching leads:", error);
      Alert.alert("Error", "Failed to fetch leads");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setRefreshing(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "#4CAF50";

      default:
        return "#757575";
    }
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <View style={styles.leadCard}>
      <View style={styles.leadHeader}>
        <View style={styles.leadNameContainer}>
          <Text style={styles.leadName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.businessName}>{item.businessName}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status?.toUpperCase() || "NEW"}
          </Text>
        </View>
      </View>

      <View style={styles.leadDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.emailAddress}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.cityState}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.creditProcessingVolume}</Text>
        </View>

        {(item.pointsOfSale || item.businessLocations || item.otherNotes) && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            {item.pointsOfSale && (
              <Text style={styles.notesText}>POS: {item.pointsOfSale}</Text>
            )}
            {item.businessLocations && (
              <Text style={styles.notesText}>
                Locations: {item.businessLocations}
              </Text>
            )}
            {item.otherNotes && (
              <Text style={styles.notesText}>Notes: {item.otherNotes}</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.leadFooter}>
        <Text style={styles.dateText}>
          Created: {formatDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="document-outline" size={60} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Leads Found</Text>
      <Text style={styles.emptyStateText}>
        You haven't added any leads yet. Start by adding your first lead!
      </Text>
      <TouchableOpacity style={styles.addLeadButton} onPress={handleAddNewLead}>
        <Ionicons name="add-outline" size={20} color="#fff" />
        <Text style={styles.addLeadButtonText}>Add First Lead</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading leads...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>My Leads</Text>
          <Text style={styles.userName}>{agentName || "Agent"}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddNewLead}
          >
            <Ionicons name="add-outline" size={20} color="#666" />
            <Text style={styles.addNewText}>Add Lead</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileIcon} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{leads.length}</Text>
          <Text style={styles.statsLabel}>Total Leads</Text>
        </View>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>
            {
              leads.filter((lead) => lead.status?.toLowerCase() === "new")
                .length
            }
          </Text>
          <Text style={styles.statsLabel}>New</Text>
        </View>
      </View>

      {/* Leads List */}
      <FlatList
        data={leads}
        renderItem={renderLeadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FFD700"]}
            tintColor="#FFD700"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
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
    marginTop: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  welcomeContainer: {
    flex: 1,
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
    gap: 10,
  },
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addNewText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
    fontWeight: "600",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statsCard: {
    flex: 1,
    alignItems: "center",
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statsLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  leadCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  leadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leadNameContainer: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  businessName: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  leadDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  notesSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  leadFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  addLeadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD700",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#FFD700",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addLeadButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
