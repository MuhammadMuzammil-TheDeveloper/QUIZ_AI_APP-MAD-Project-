import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Category({ title, color, icon }) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]}>
      <Ionicons name={icon} size={22} color="#fff" />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "600",
  },
});