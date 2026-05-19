import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

import { auth, db } from "../firebase/firebaseConfig";

export default function Register() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [registered, setRegistered] = useState(false);

  // NEW STATES
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  // Redirect after success
  useEffect(() => {
    if (registered) {
      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    }
  }, [registered]);

  // Email validation
  const validateEmail = (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // REGISTER
  const handleRegister = async () => {
    // Clear old messages
    setErrorText("");
    setSuccessText("");

    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorText("Please fill all the fields.");
      return;
    }

    if (name.trim().length < 2) {
      setErrorText("Name must be at least 2 characters.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorText("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorText(
        "Password must be at least 6 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      // Firebase auth
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const user = userCredential.user;

      // Firestore user data
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        email: email.trim(),
        uid: user.uid,
        score: 0,
        quizzesAttempted: 0,
        correctAnswers: 0,
        bestScore: 0,
        createdAt: Date.now(),
      });

      // Clear fields
      setName("");
      setEmail("");
      setPassword("");

      // Success message
      setSuccessText(
        "Account created successfully! Redirecting to login..."
      );

      setRegistered(true);

    } catch (error) {
      console.log("REGISTER ERROR:", error.code);

      let msg =
        "Something went wrong. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        msg =
          "This email is already registered.";
      } else if (error.code === "auth/invalid-email") {
        msg =
          "Invalid email address format.";
      } else if (error.code === "auth/weak-password") {
        msg =
          "Password is too weak.";
      } else if (
        error.code === "auth/network-request-failed"
      ) {
        msg =
          "Check your internet connection.";
      }

      setErrorText(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.card,
            isTablet && styles.cardTablet,
          ]}
        >

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons
                name="person-add-outline"
                size={16}
                color="#4F46E5"
              />

              <Text style={styles.badgeText}>
                Join Quiz AI
              </Text>
            </View>

            <Text style={styles.title}>
              Create Account
            </Text>

            <Text style={styles.subtitle}>
              Start your learning journey today
            </Text>
          </View>

          {/* ERROR MESSAGE */}
          {!!errorText && (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#EF4444"
              />

              <Text style={styles.errorText}>
                {errorText}
              </Text>
            </View>
          )}

          {/* SUCCESS MESSAGE */}
          {!!successText && (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#10B981"
              />

              <Text style={styles.successText}>
                {successText}
              </Text>
            </View>
          )}

          {/* NAME */}
          <View style={styles.inputGroup}>
            <Ionicons
              name="person-outline"
              size={20}
              style={styles.icon}
            />

            <TextInput
              placeholder="Full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrorText("");
              }}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              editable={!loading}
            />
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
              onChangeText={(text) => {
                setEmail(text);
                setErrorText("");
              }}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
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
              placeholder="Password (min. 6 characters)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorText("");
              }}
              secureTextEntry={!showPass}
              style={styles.input}
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPass(!showPass)
              }
              style={styles.eye}
            >
              <Ionicons
                name={
                  showPass
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#fff"
                />

                <Text style={styles.buttonText}>
                  Creating Account...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonText}>
                  Create Account
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                />
              </>
            )}
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* LOGIN */}
          <TouchableOpacity
            style={styles.secondary}
            onPress={() =>
              router.push("/login")
            }
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

  badgeText: {
    color: "#4F46E5",
    fontWeight: "600",
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

  // ERROR
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  errorText: {
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },

  // SUCCESS
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  successText: {
    color: "#059669",
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
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

  buttonDisabled: {
    backgroundColor: "#818CF8",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 10,
    color: "#9CA3AF",
  },

  secondary: {
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