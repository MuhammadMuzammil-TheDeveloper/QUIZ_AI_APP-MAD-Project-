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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        uid: user.uid,
      });

      Alert.alert("Success", "Account created successfully");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
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
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} style={styles.icon} />
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

          {/* Button */}
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
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