import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CategoryScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://opentdb.com/api.php?amount=50");
      const data = await res.json();

      const unique = [
        ...new Set(data.results.map((item) => item.category)),
      ];

      const formatted = unique.map((cat, index) => ({
        title: cat,
        icon: "layers",
        color: getColor(index),
      }));

      setCategories(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>

        <Text style={styles.title}>Quiz Categories</Text>

        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>
        Choose a category and start your quiz 🚀
      </Text>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <Ionicons name={item.icon} size={20} color="#fff" style={styles.iconBox} />
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}

    </View>
  );
}

/* COLOR */
function getColor(index) {
  const colors = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#06B6D4"];
  return colors[index % colors.length];
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 10,
  },

  backBtn: {
    backgroundColor: "#E0E7FF",
    padding: 10,
    borderRadius: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 15,
    marginLeft: 5,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});