import React, { useEffect, useState } from "react";
import { getAIExplanation } from "../services/groqService";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

export default function QuizScreen() {
  const { category } = useLocalSearchParams();
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // ================= FETCH QUIZ =================
  const fetchQuiz = async () => {
    try {
      const url = `https://opentdb.com/api.php?amount=10&type=multiple`;
      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.results || []);
    } catch (err) {
      console.log("Quiz API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  // ================= SELECT ANSWER =================
  const handleSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // ================= NEXT QUESTION =================
  const handleNext = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[index];
    const correct = currentQuestion.correct_answer;

    // CORRECT
    if (selectedAnswer === correct) {
      setScore((prev) => prev + 1);
    } else {
      // WRONG ANSWER
      setLoadingExplanation(true);

      const explanation = await getAIExplanation(
        currentQuestion.question,
        correct,
        selectedAnswer,
      );

      setWrongAnswers((prev) => [
        ...prev,
        {
          question: currentQuestion.question,
          selected: selectedAnswer,
          correct,
          explanation,
        },
      ]);

      setLoadingExplanation(false);
    }

    const nextIndex = index + 1;

    if (nextIndex < questions.length) {
      setIndex(nextIndex);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // ================= EMPTY =================
  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text>No questions found</Text>
      </View>
    );
  }

  // ================= RESULT SCREEN =================
  if (showResult) {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <View style={styles.card}>
          <Text style={styles.resultTitle}>🎉 Quiz Completed</Text>

          <Text style={styles.resultCategory}>Category: {category}</Text>

          <Text style={styles.scoreText}>
            {score} / {questions.length}
          </Text>

          <Text style={styles.message}>
            {score >= 7
              ? "Excellent Work 🔥"
              : score >= 4
                ? "Good Job 👍"
                : "Keep Practicing 💪"}
          </Text>
          {/* AI EXPLANATIONS */}

          {wrongAnswers.length > 0 && (
            <View style={{ width: "100%", marginTop: 20 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 10,
                }}
              >
                AI Explanations
              </Text>

              {wrongAnswers.map((item, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: 15,
                    borderRadius: 10,
                    marginBottom: 15,
                  }}
                >
                  {/* QUESTION */}
                  <Text style={{ fontWeight: "700" }}>Question:</Text>

                  <Text style={{ marginBottom: 10 }}>
                    {item.question.replace(/&quot;|&#039;|&amp;/g, "")}
                  </Text>

                  {/* USER ANSWER */}
                  <Text style={{ color: "red" }}>
                    Your Answer: {item.selected}
                  </Text>

                  {/* CORRECT ANSWER */}
                  <Text style={{ color: "green", marginBottom: 10 }}>
                    Correct Answer: {item.correct}
                  </Text>

                  {/* AI EXPLANATION */}
                  <Text style={{ color: "#111827" }}>{item.explanation}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Back to Categories</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const q = questions[index];

  const options = q?.incorrect_answers
    ? [...q.incorrect_answers, q.correct_answer].sort()
    : [];

  // ================= MAIN UI =================
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{category}</Text>

      {/* QUESTION */}
      <Text style={styles.question}>
        {q?.question?.replace(/&quot;|&#039;|&amp;/g, "")}
      </Text>

      {/* OPTIONS */}
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === opt;

        return (
          <TouchableOpacity
            key={i}
            style={[styles.option, isSelected && styles.selectedOption]}
            onPress={() => handleSelect(opt)}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        );
      })}

      {/* NEXT BUTTON */}
      <TouchableOpacity
        style={[styles.nextButton, !selectedAnswer && styles.disabledBtn]}
        disabled={!selectedAnswer}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>
          {index + 1 === questions.length ? "Finish Quiz" : "Next Question"}
        </Text>
      </TouchableOpacity>

      {/* PROGRESS */}
      <Text style={styles.progress}>
        {index + 1} / {questions.length}
      </Text>
    </SafeAreaView>
  );
}

// ================= STYLES =================
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
    color: "#4F46E5",
    marginBottom: 10,
  },

  question: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 20,
  },

  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  optionText: {
    fontSize: 15,
  },

  selectedOption: {
    borderWidth: 2,
    borderColor: "#4F46E5",
  },

  nextButton: {
    backgroundColor: "#4F46E5",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },

  disabledBtn: {
    opacity: 0.5,
  },

  nextText: {
    color: "#fff",
    fontWeight: "700",
  },

  progress: {
    textAlign: "center",
    marginTop: 15,
    color: "#6B7280",
  },

  // ================= RESULT CARD =================
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  resultCategory: {
    color: "#6B7280",
    marginBottom: 20,
  },

  scoreText: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 10,
  },

  message: {
    fontSize: 16,
    marginBottom: 20,
    color: "#111827",
  },

  button: {
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
