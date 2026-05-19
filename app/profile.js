import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [score, setScore] = useState(0);
  const [photo, setPhoto] = useState("");

  const user = auth.currentUser;

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setUsername(data.username || "");
        setScore(data.score || 0);
        setPhoto(data.profileImage || "");
      }

      setEmail(user.email || "");
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name.trim(),
          username: username.trim(),
          email: user.email,
          profileImage: photo,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      Alert.alert("Error", "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      {/* REMOVE THIS COMPLETE HEADER BLOCK */}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/home")}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>

        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Ionicons
            name={editMode ? "close" : "create-outline"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
      
      {/* PROFILE CARD */}
      <View style={styles.card}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.img} />
            ) : (
              <Text style={styles.initial}>{initial}</Text>
            )}
          </View>
        </View>

        <Text style={styles.nameText}>{name || "No Name"}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
      </View>
      {/* FORM */}
      <View style={styles.form}>
        <Input
          label="Full Name"
          value={name}
          setValue={setName}
          editable={editMode}
        />

        <Input
          label="Email"
          value={username}
          setValue={setUsername}
          editable={editMode}
        />
      </View>
      {/* SAVE */}
      {editMode && (
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

/* INPUT */
function Input({ label, value, setValue, editable }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={editable}
        placeholder={`Enter ${label}`}
        placeholderTextColor="#aaa"
        style={[styles.input, !editable && { backgroundColor: "#F1F1F1" }]}
      />
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FB",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#6C5CE7",
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  card: {
    marginTop: 25,
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  avatarRing: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#6C5CE7",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  img: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  initial: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },

  nameText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },

  email: {
    color: "#777",
    marginTop: 3,
  },

  scoreBox: {
    marginTop: 15,
    backgroundColor: "#F1EEFF",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: "center",
  },

  scoreLabel: {
    fontSize: 12,
    color: "#6C5CE7",
  },

  score: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6C5CE7",
  },

  form: {
    padding: 20,
  },

  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  btn: {
    backgroundColor: "#6C5CE7",
    margin: 20,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
