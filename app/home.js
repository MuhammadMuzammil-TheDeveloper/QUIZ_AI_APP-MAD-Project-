/**
 * home.js — QuizAIApp Dashboard
 *
 * FIX: Uses onAuthStateChanged instead of auth.currentUser.
 * auth.currentUser is null on cold start because Firebase hasn't finished
 * restoring the persisted session yet. onAuthStateChanged fires as soon as
 * the session is ready — guaranteed to have the real user object.
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";


// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#3B82F6",
  "#06B6D4",
];
const ICONS = [
  "flask",
  "planet",
  "book",
  "musical-notes",
  "film",
  "football",
  "code-slash",
  "globe",
  "calculator",
  "color-palette",
];

const pickColor = (i) => COLORS[i % COLORS.length];
const pickIcon = (i) => ICONS[i % ICONS.length];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const handleLogout = async () => {
  try {
    await signOut(auth);
    router.replace("/login"); // clear history so user can't go back
  } catch (error) {
    console.log("Logout Error:", error);
  }
};
  const router = useRouter();

  // undefined = session still resolving | null = no user | object = logged in
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Step 1: Wait for Firebase to restore persisted auth session ───────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user ?? null);
    });
    return unsub; // unsubscribe on unmount
  }, []);

  // ── Step 2: Fetch Firestore doc once user is confirmed ────────────────────
  const fetchUserData = useCallback(async (user) => {
    if (!user) {
      setLoadingUser(false);
      return;
    }

    try {
      setLoadingUser(true);
      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        // No Firestore doc yet — use Auth displayName as fallback
        setUserData({
          name: user.displayName || "",
          email: user.email || "",
          score: 0,
        });
      }
    } catch (err) {
      console.error("[Home] fetchUserData:", err);
      setUserData({
        name: user.displayName || "",
        email: user.email || "",
        score: 0,
      });
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser === undefined) return; // still resolving — wait
    fetchUserData(firebaseUser);
  }, [firebaseUser, fetchUserData]);

  // ── Categories ────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryError(null);
      const res = await fetch("https://opentdb.com/api.php?amount=30");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const unique = [...new Set(data.results.map((q) => q.category))];
      setCategories(
        unique.map((cat, i) => ({
          id: i,
          title: cat,
          icon: pickIcon(i),
          color: pickColor(i),
        })),
      );
    } catch (err) {
      console.error("[Home] fetchCategories:", err);
      setCategoryError("Couldn't load categories. Pull down to retry.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCategories(),
      firebaseUser ? fetchUserData(firebaseUser) : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [fetchCategories, fetchUserData, firebaseUser]);

  // ── Derived display values ────────────────────────────────────────────────
  const userName = userData?.name?.trim() || userData?.displayName?.trim() || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userScore = userData?.score ?? 0;
  const userPhoto = userData?.profileImage || firebaseUser?.photoURL || null;

  // Show spinner while Firebase restores session (prevents "User" flash)
  if (firebaseUser === undefined) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            {loadingUser ? (
              <View style={styles.skeletonName} />
            ) : (
              <Text style={styles.hello}>Hello, {userName} 👋</Text>
            )}
            <Text style={styles.subText}>Ready to test your knowledge?</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarInitial}>{userInitial}</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* PROGRESS CARD */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.cardTitle}>Your Progress</Text>
              <Text style={styles.cardSub}>
                Welcome back, {loadingUser ? "..." : userName}!
              </Text>
            </View>
            <View style={styles.scorePill}>
              <Ionicons name="star" size={13} color="#FCD34D" />
              <Text style={styles.scoreText}>{userScore} pts</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <Stat icon="layers-outline" label="Total Quizzes" value="—" />
            <Stat icon="checkmark-circle-outline" label="Correct" value="—" />
            <Stat
              icon="trophy-outline"
              label="Best Score"
              value={String(userScore)}
            />
          </View>
        </View>

        {/* CATEGORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => router.push("/CategoryScreen")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingCategories && (
          <ActivityIndicator
            size="large"
            color="#4F46E5"
            style={{ marginVertical: 30 }}
          />
        )}

        {!loadingCategories && categoryError && (
          <View style={styles.errorBox}>
            <Ionicons name="cloud-offline-outline" size={28} color="#EF4444" />
            <Text style={styles.errorText}>{categoryError}</Text>
          </View>
        )}

        {!loadingCategories && !categoryError && (
          <View style={styles.grid}>
            {categories.slice(0, 6).map((item) => (
              <CategoryCard
                key={item.id}
                title={item.title}
                color={item.color}
                icon={item.icon}
                onPress={() =>
                  router.push({
                    pathname: "/QuizScreen",
                    params: { category: item.title },
                  })
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomBar}>
        <NavItem icon="home" label="Home" active />
        <TouchableOpacity onPress={() => router.push("/history")}>
          <NavItem icon="time-outline" label="History" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/leaderboard")}>
          <NavItem icon="trophy-outline" label="Leaderboard" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <NavItem icon="person-outline" label="Profile" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ icon, label, value }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color="#E0E7FF" />
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CategoryCard({ title, color, icon, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.catCard, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.catIconBox}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.catText} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <View style={styles.navItem}>
      <Ionicons name={icon} size={22} color={active ? "#4F46E5" : "#6B7280"} />
      <Text style={[styles.navText, active && styles.navActive]}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  container: { flex: 1, backgroundColor: "#F5F7FB" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 52,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  headerText: { flex: 1, marginRight: 12 },
  hello: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subText: { color: "#6B7280", marginTop: 4, fontSize: 14 },
  skeletonName: {
    width: 200,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    marginBottom: 4,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarInitial: { color: "#fff", fontSize: 18, fontWeight: "700" },
  avatarImg: { width: 46, height: 46, borderRadius: 23 },

  card: {
    backgroundColor: "#4F46E5",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 18,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardSub: { color: "#C7D2FE", marginTop: 4, fontSize: 13 },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  scoreText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 14,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center", gap: 4 },
  statVal: { color: "#fff", fontWeight: "700", fontSize: 16 },
  statLabel: { color: "#C7D2FE", fontSize: 11 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  seeAll: { color: "#4F46E5", fontWeight: "600", fontSize: 14 },

  errorBox: { alignItems: "center", padding: 30, gap: 10 },
  errorText: { color: "#EF4444", textAlign: "center", fontSize: 14 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    gap: 12,
  },
  catCard: {
    width: "47%",
    padding: 18,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  catText: { color: "#fff", fontWeight: "600", fontSize: 13, lineHeight: 18 },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  navItem: { alignItems: "center", minWidth: 56 },
  navText: { fontSize: 11, color: "#6B7280", marginTop: 3 },
  navActive: { color: "#4F46E5", fontWeight: "600" },
});
  