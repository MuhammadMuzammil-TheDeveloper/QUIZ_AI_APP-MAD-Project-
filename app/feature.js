import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const FEATURES = [
  { id: 1, title: "AI Quiz", desc: "Smart AI quizzes", icon: "sparkles", color: "#6C63FF" },
  // { id: 2, title: "Leaderboard", desc: "Global ranking", icon: "trophy", color: "#F59E0B" },
  // { id: 3, title: "Daily Challenge", desc: "Daily missions", icon: "flash", color: "#10B981" },
  { id: 4, title: "Progress", desc: "Track growth", icon: "analytics", color: "#EF4444" },
  { id: 5, title: "Achievements", desc: "Earn badges", icon: "medal", color: "#8B5CF6" },
  { id: 6, title: "Categories", desc: "Explore topics", icon: "grid", color: "#06B6D4" },
];

export default function FeatureScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <LinearGradient colors={["#1E1B4B", "#2D2A5C"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Features</Text>
          <Text style={styles.heroText}>
            Powerful AI learning tools in one place
          </Text>

          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push("/CategoryScreen")}
          >
            <Text style={styles.heroBtnText}>Start Learning</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* FEATURES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Features</Text>

          <View style={styles.grid}>
            {FEATURES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={22} color="#fff" />
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CTA */}
        <LinearGradient colors={["#6C63FF", "#4A44CC"]} style={styles.cta}>
          <Ionicons name="rocket" size={40} color="#fff" />
          <Text style={styles.ctaTitle}>Level Up Your Learning</Text>
          <Text style={styles.ctaText}>
            Start quizzes and track your progress easily
          </Text>

          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push("/quiz")}
          >
            <Text style={styles.ctaBtnText}>Get Started</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Nav icon="home-outline" label="Home" />
        </TouchableOpacity>

        <Nav icon="sparkles" label="Features" active />

        <TouchableOpacity onPress={() => router.push("/CategoryScreen")}>
          <Nav icon="grid-outline" label="Category" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Nav icon="person-outline" label="Profile" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Nav({ icon, label, active }) {
  return (
    <View style={styles.navItem}>
      <Ionicons name={icon} size={22} color={active ? "#6C63FF" : "#94A3B8"} />
      <Text style={[styles.navText, active && styles.navActive]}>
        {label}
      </Text>
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },

  hero: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  heroText: {
    color: "#C7D2FE",
    marginTop: 8,
    fontSize: 14,
  },

  heroBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  heroBtnText: {
    color: "#4F46E5",
    fontWeight: "700",
  },

  section: {
    padding: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  cardDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  cta: {
    margin: 18,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },

  ctaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },

  ctaText: {
    color: "#E0E7FF",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 8,
  },

  ctaBtn: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 10,
  },

  ctaBtnText: {
    color: "#4F46E5",
    fontWeight: "700",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#94A3B8",
  },

  navActive: {
    color: "#6C63FF",
    fontWeight: "700",
  },
});