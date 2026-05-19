import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const CATEGORY_META = {
  "Science & Nature": { icon: "flask-outline", color: "#185FA5", bg: "#E6F1FB" },
  "Science: Mathematics": { icon: "calculator-outline", color: "#534AB7", bg: "#EEEDFE" },
  Geography: { icon: "globe-outline", color: "#0F6E56", bg: "#E1F5EE" },
  Art: { icon: "color-palette-outline", color: "#993C1D", bg: "#FAECE7" },
  Entertainment: { icon: "tv-outline", color: "#854F0B", bg: "#FAEEDA" },
};

const DEFAULT_META = {
  icon: "layers-outline",
  color: "#534AB7",
  bg: "#EEEDFE",
};

function getMeta(title) {
  const key = Object.keys(CATEGORY_META).find((k) =>
    title.toLowerCase().includes(k.toLowerCase())
  );
  return key ? CATEGORY_META[key] : DEFAULT_META;
}

function getQuestionCount(title) {
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
        popular:
          cat.toLowerCase().includes("geography") ||
          cat.toLowerCase().includes("general"),
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q
        ? categories.filter((c) => c.title.toLowerCase().includes(q))
        : categories
    );
  }, [search, categories]);

  return (
    <View style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#F6F7FB" /> */}

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="arrow-back" size={18} color="#111827" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Categories</Text>
          <Text style={styles.subtitle}>Choose your quiz topic</Text>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{categories.length || "—"}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>50</Text>
        </View>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionLabel}>PICK A TOPIC</Text>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                item.popular && styles.cardPopular,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/QuizScreen",
                  params: { category: item.title },
                })
              }
              activeOpacity={0.8}
            >
              {/* ICON */}
              <View style={[styles.iconWrap, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>

              {/* TEXT */}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.cardSub}>
                  {item.count} questions
                </Text>
              </View>

              {/* RIGHT SIDE */}
              {item.popular ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

/* STYLES (ONLY UI UPGRADED) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingHorizontal: 16,
  },

  /* HEADER */
  header: {
    marginTop: 55,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 2,
  },

  statLabel: {
    fontSize: 11,
    color: "#6B7280",
  },

  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },

  /* SEARCH */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#111827",
  },

  /* SECTION */
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 10,
  },

  /* CARD */
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },

  cardPopular: {
    borderWidth: 1,
    borderColor: "#4F46E5",
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardBody: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  cardSub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  badge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4F46E5",
  },
});