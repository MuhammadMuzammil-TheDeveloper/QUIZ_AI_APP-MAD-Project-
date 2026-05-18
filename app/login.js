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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Login() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // ─── Validation ───────────────────────────────────────────────
  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // ─── LOGIN ────────────────────────────────────────────────────
  const handleLogin = async () => {
    // Empty field check
    if (!email.trim() && !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);

      // Clear fields
      setEmail("");
      setPassword("");

      router.replace("/home");
    } catch (err) {
      console.log("LOGIN ERROR:", err.code, err.message);

      let msg = "Something went wrong. Please try again.";
      if (err.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (err.code === "auth/wrong-password") msg = "Incorrect password. Please try again.";
      else if (err.code === "auth/invalid-email") msg = "Invalid email format.";
      else if (err.code === "auth/invalid-credential") msg = "Incorrect email or password.";
      else if (err.code === "auth/too-many-requests") msg = "Too many failed attempts. Please try again later.";
      else if (err.code === "auth/network-request-failed") msg = "Network error. Check your internet connection.";

      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── FORGOT PASSWORD ──────────────────────────────────────────
  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert("Missing Email", "Please enter your email address first.");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      Alert.alert("Email Sent ✅", "A password reset link has been sent to your email.");
    } catch (error) {
      console.log("RESET ERROR:", error.code);
      let msg = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") msg = "No account found with this email.";
      else if (error.code === "auth/invalid-email") msg = "Invalid email format.";
      else if (error.code === "auth/network-request-failed") msg = "Network error. Check your connection.";
      Alert.alert("Reset Failed", msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, isTablet && styles.cardTablet]}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue learning</Text>
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} style={styles.icon} />
            <TextInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} style={styles.icon} />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eye}>
              <Ionicons
                name={showPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* FORGOT PASSWORD */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgot}
            disabled={resetLoading}
          >
            {resetLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Text style={styles.forgotText}>Forgot password?</Text>
            )}
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.buttonText}>Signing in...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {/* REGISTER */}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => router.push("/register")}
            disabled={loading}
          >
            <Text style={styles.secondaryText}>Create new account</Text>
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

  forgot: {
    alignSelf: "flex-end",
    marginBottom: 20,
    minHeight: 24,
    justifyContent: "center",
  },
  forgotText: { color: "#4F46E5", fontWeight: "500" },

  button: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: { backgroundColor: "#818CF8" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },

  secondary: {
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryText: { color: "#374151", fontWeight: "500" },
});