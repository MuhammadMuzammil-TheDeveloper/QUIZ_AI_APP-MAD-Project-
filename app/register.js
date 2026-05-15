import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function Register() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── Validation ───────────────────────────────────────────────
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // ─── REGISTER ─────────────────────────────────────────────────
  const handleRegister = async () => {
    // Empty field checks (individual, specific messages)
    if (!name.trim() && !email.trim() && !password) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all fields to create your account.",
      );
      return;
    }
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert("Invalid Name", "Name must be at least 2 characters.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address (e.g. user@example.com).",
      );
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter a password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long.",
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const user = userCredential.user;

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: email.trim(),
        uid: user.uid,
        score: 0,
        createdAt: Date.now(), // better than string
      });

      // Clear all fields
      setName("");
      setEmail("");
      setPassword("");

      // Show success then navigate
      Alert.alert(
        "Account Created ✅",
        `Welcome, ${name.trim()}! Your account has been created successfully.`,
        [
          {
            text: "Get Started",
            onPress: () => router.replace("/home"),
          },
        ],
      );
    } catch (error) {
      console.log("REGISTER ERROR:", error.code, error.message);

      let msg = "Something went wrong. Please try again.";
      if (error.code === "auth/email-already-in-use") {
        msg =
          "This email is already registered. Please log in or use a different email.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Invalid email address format.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (error.code === "auth/network-request-failed") {
        msg = "Network error. Please check your internet connection.";
      } else if (error.code === "auth/operation-not-allowed") {
        msg = "Email/password registration is not enabled. Contact support.";
      }

      Alert.alert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isTablet && styles.cardTablet]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="person-add-outline" size={16} color="#4F46E5" />
              <Text style={styles.badgeText}>Join Quiz AI</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your learning journey today
            </Text>
          </View>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Ionicons name="person-outline" size={20} style={styles.icon} />
            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} style={styles.icon} />
            <TextInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              style={styles.icon}
            />
            <TextInput
              placeholder="Password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eye}
            >
              <Ionicons
                name={showPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Creating Account...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* Login */}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => router.push("/login")}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },

  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },

  card: { width: "100%", maxWidth: 420, alignSelf: "center" },
  cardTablet: { maxWidth: 500 },

  header: { marginBottom: 25 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  badgeText: { color: "#4F46E5", fontWeight: "600" },

  title: { fontSize: 30, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 5 },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  icon: { marginRight: 8, color: "#9CA3AF" },

  input: { flex: 1, height: 50, color: "#111827" },

  eye: { padding: 6 },

  button: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#818CF8" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  or: { marginHorizontal: 10, color: "#9CA3AF" },

  secondary: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryText: { color: "#374151", fontWeight: "500" },
});
