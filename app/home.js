import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DATA FROM API
  const fetchCategories = async () => {
    try {
      const res = await fetch("https://opentdb.com/api.php?amount=30");
      const data = await res.json();

      // extract unique categories
      const unique = [
        ...new Set(data.results.map((item) => item.category)),
      ];

      // map categories into UI format
      const formatted = unique.map((cat, index) => ({
        title: cat,
        icon: "layers",
        color: getColor(index),
      }));

      setCategories(formatted);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>Hello, Muzammil 👋</Text>
            <Text style={styles.subText}>
              Ready to test your knowledge?
            </Text>
          </View>

          <Ionicons name="notifications-outline" size={24} />
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Progress</Text>
        </View>

        {/* CATEGORY HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <TouchableOpacity onPress={() => router.push("/CategoryScreen")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>

        </View>

        {/* LOADING */}
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <View style={styles.grid}>
            {categories.slice(0, 6).map((item, index) => (
              <Category key={index} {...item} />
            ))}
          </View>
        )}

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        <NavItem icon="home" label="Home" active />
        <NavItem icon="time" label="History" />
        <NavItem icon="trophy" label="Leadership" />
        <NavItem icon="person" label="Profile" />
      </View>

    </View>
  );
}

/* COLOR GENERATOR */
function getColor(index) {
  const colors = ["#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#06B6D4"];
  return colors[index % colors.length];
}

/* CATEGORY */
function Category({ title, color, icon }) {
  return (
    <TouchableOpacity style={[styles.category, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color="#fff" />
      <Text style={styles.categoryText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* NAV */
function NavItem({ icon, label, active }) {
  return (
    <TouchableOpacity style={styles.navItem}>
      <Ionicons
        name={icon}
        size={22}
        color={active ? "#4F46E5" : "#6B7280"}
      />
      <Text style={[styles.navText, active && { color: "#4F46E5" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 15,
  },

  hello: {
    fontSize: 22,
    fontWeight: "700",
  },

  subText: {
    color: "#6B7280",
  },

  card: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "#D1D5DB",
    fontSize: 12,
  },

  value: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  seeAll: {
    color: "#4F46E5",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  category: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },

  categoryText: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "600",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
});