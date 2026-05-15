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

  // user fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [score, setScore] = useState(0);
  const [photo, setPhoto] = useState("");

  const user = auth.currentUser;

  // ─── FETCH USER ─────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoading(true);

      const snap = await getDoc(doc(db, "users", user.uid));

      if (snap.exists()) {
        const data = snap.data();

        setName(data.name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setPhone(data.phone || "");
        setScore(data.score || 0);
        setPhoto(data.profileImage || "");
      }

      setEmail(user.email || "");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ─── SAVE PROFILE ───────────────────────────
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
          bio: bio.trim(),
          phone: phone.trim(),
          email: user.email,
          profileImage: photo,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>My Profile</Text>

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

        {/* AVATAR */}
        <View style={styles.avatar}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.img} />
          ) : (
            <Text style={styles.initial}>{initial}</Text>
          )}
        </View>

        <Text style={styles.email}>{email}</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>

        <Input
          label="Name"
          value={name}
          setValue={setName}
          editable={editMode}
        />

        <Input
          label="Username"
          value={username}
          setValue={setUsername}
          editable={editMode}
        />

        <Input
          label="Bio"
          value={bio}
          setValue={setBio}
          editable={editMode}
        />

        <Input
          label="Phone"
          value={phone}
          setValue={setPhone}
          editable={editMode}
        />

      </View>

      {/* SAVE BUTTON */}
      {editMode && (
        <TouchableOpacity
          style={styles.btn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

/* INPUT COMPONENT */
function Input({ label, value, setValue, editable }) {
  return (
    <View style={{ marginBottom: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        editable={editable}
        style={[
          styles.input,
          !editable && { backgroundColor: "#eee" },
        ]}
      />
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: "#4F46E5",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  img: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  initial: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },

  email: {
    marginTop: 10,
    color: "#666",
  },

  score: {
    color: "#4F46E5",
    fontWeight: "bold",
    marginTop: 5,
  },

  form: {
    padding: 20,
  },

  label: {
    marginBottom: 5,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  btn: {
    backgroundColor: "#4F46E5",
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});