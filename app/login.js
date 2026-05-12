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
  useWindowDimensions,
} from "react-native";

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth } from "../firebase/config";

export default function Login() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // 🔐 LOGIN
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      router.push("/home");
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      Alert.alert("Login Failed", err.message);
    }
  };

  // 🔥 FORGOT PASSWORD (FIXED + ROBUST)
  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        "Missing Email",
        "Please enter your email first"
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);

      Alert.alert(
        "Email Sent",
        "We sent a password reset link to your email."
      );
    } catch (error) {
      console.log("RESET ERROR:", error);

      let message = "Something went wrong";

      if (error.code === "auth/user-not-found") {
        message = "No account found with this email";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format";
      }

      Alert.alert("Error", message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, isTablet && styles.cardTablet]}>

          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue learning
            </Text>
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <Ionicons
              name="mail-outline"
              size={20}
              style={styles.icon}
            />
            <TextInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.inputGroup}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              style={styles.icon}
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
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

          {/* FORGOT PASSWORD */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Sign In</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          {/* REGISTER */}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryText}>
              Create new account
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },

  cardTablet: {
    maxWidth: 500,
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },

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

  icon: {
    marginRight: 8,
    color: "#9CA3AF",
  },

  input: {
    flex: 1,
    height: 50,
    color: "#111827",
  },

  eye: {
    padding: 6,
  },

  forgot: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  forgotText: {
    color: "#4F46E5",
    fontWeight: "500",
  },

  button: {
    flexDirection: "row",
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  secondary: {
    marginTop: 15,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  secondaryText: {
    color: "#374151",
    fontWeight: "500",
  },
});