import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const CATEGORY_META = {
  "Science & Nature":       { icon: "flask-outline",      color: "#185FA5", bg: "#E6F1FB" },
  "Science: Mathematics":   { icon: "calculator-outline",  color: "#534AB7", bg: "#EEEDFE" },
  "Geography":              { icon: "globe-outline",       color: "#0F6E56", bg: "#E1F5EE" },
  "Art":                    { icon: "color-palette-outline",color: "#993C1D", bg: "#FAECE7" },
  "Entertainment":          { icon: "tv-outline",          color: "#854F0B", bg: "#FAEEDA" },
};

const DEFAULT_META = { icon: "layers-outline", color: "#534AB7", bg: "#EEEDFE" };

function getMeta(title) {
  const key = Object.keys(CATEGORY_META).find((k) =>
    title.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_META[key] : DEFAULT_META;
}

function getQuestionCount(title) {
  // Deterministic pseudo-count based on title length for demo
  return 15 + (title.charCodeAt(0) % 30);
}

export default function CategoryScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://opentdb.com/api.php?amount=50");
      const data = await res.json();
      const unique = [...new Set(data.results.map((item) => item.category))];
      const formatted = unique.map((cat) => ({
        title: cat,
        count: getQuestionCount(cat),
        popular: cat.toLowerCase().includes("geography") || cat.toLowerCase().includes("general"),
        ...getMeta(cat),
      }));
      setCategories(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(q ? categories.filter((c) => c.title.toLowerCase().includes(q)) : categories);
  }, [search, categories]);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* STATS ROW */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total categories</Text>
          <Text style={styles.statValue}>{categories.length || "—"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Questions today</Text>
          <Text style={styles.statValue}>50</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionLabel}>PICK A TOPIC</Text>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#534AB7" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, item.popular && styles.cardPopular]}
              onPress={() => router.push({ pathname: "/quiz", params: { category: item.title } })}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.count} questions</Text>
              </View>

              {item.popular ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No categories found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 20,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 56,
    marginBottom: 18,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F1F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  /* Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.07)",
  },
  cardPopular: {
    borderWidth: 1.5,
    borderColor: "#185FA5",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  /* Badge */
  badge: {
    backgroundColor: "#E6F1FB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#185FA5",
  },

  empty: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
    fontSize: 14,
  },
});