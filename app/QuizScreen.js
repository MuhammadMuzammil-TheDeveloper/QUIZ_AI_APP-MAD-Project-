import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

export default function QuizScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  // 🔥 FETCH QUESTIONS BY CATEGORY
  const fetchQuiz = async () => {
    try {
      const url = `https://opentdb.com/api.php?amount=10&category=&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.results);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleAnswer = (answer) => {
    const correct = questions[index].correct_answer;

    if (answer === correct) {
      setScore(score + 1);
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      alert(`Quiz Finished 🎉\nScore: ${score + 1}/${questions.length}`);
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const q = questions[index];

  const options = [...q.incorrect_answers, q.correct_answer].sort();

  return (
    <View style={styles.container}>

      <Text style={styles.title}>{category}</Text>

      <Text style={styles.question}>
        {q.question.replace(/&quot;|&#039;/g, "")}
      </Text>

      {options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={styles.option}
          onPress={() => handleAnswer(opt)}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.progress}>
        {index + 1} / {questions.length}
      </Text>

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FB",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    color: "#4F46E5",
  },

  question: {
    fontSize: 18,
    marginVertical: 20,
  },

  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  progress: {
    marginTop: 20,
    textAlign: "center",
    color: "#6B7280",
  },
});