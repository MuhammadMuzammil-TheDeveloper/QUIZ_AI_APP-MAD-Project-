import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      Alert.alert(
        "Email Sent ✅",
        "A password reset link has been sent to your email. Check your inbox (and spam folder).",
        [
          {
            text: "Back to Login",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.log("RESET ERROR:", error.code);

      let msg = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found") {
        msg = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many requests. Please wait a moment and try again.";
      } else if (error.code === "auth/network-request-failed") {
        msg = "Network error. Please check your internet connection.";
      }

      Alert.alert("Reset Failed", msg);
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

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/login")}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={20} color="#4F46E5" />
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>

      <View style={styles.content}>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={32} color="#4F46E5" />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter your email and we'll send you a reset link.
        </Text>

        {/* Email Input */}
        <View style={[styles.inputGroup, sent && styles.inputDisabled]}>
          <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#9CA3AF"
            editable={!loading && !sent}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.button, (loading || sent) && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading || sent}
          activeOpacity={0.8}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.buttonText}>Sending...</Text>
            </>
          ) : sent ? (
            <>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Email Sent</Text>
            </>
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Send Reset Link</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Resend hint */}
        {sent && (
          <TouchableOpacity
            onPress={() => { setSent(false); setEmail(""); }}
            style={styles.resend}
          >
            <Text style={styles.resendText}>Didn't receive it? Try again</Text>
          </TouchableOpacity>
        )}

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    padding: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#4F46E5",
    fontWeight: "500",
    fontSize: 14,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 420,
    width: "100%",
    alignSelf: "center",
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 28,
  },

  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#F3F4F6",
  },
  input: {
    flex: 1,
    height: 50,
    color: "#111827",
    fontSize: 15,
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
  buttonDisabled: { backgroundColor: "#818CF8" },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  resend: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    color: "#4F46E5",
    fontWeight: "500",
    fontSize: 14,
  },
});