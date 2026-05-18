import React, { useEffect, useState } from "react";
import { getAIExplanation } from "../services/groqService";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { auth, db } from "../firebase/firebaseConfig";

import { doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";

const { width } = Dimensions.get("window");

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

  // Accumulates wrong answers during quiz WITHOUT blocking for AI
  const [pendingWrong, setPendingWrong] = useState([]);

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
  // Now synchronous — no awaiting AI mid-quiz.
  // Wrong answers accumulate instantly; AI is called in batch only after the last question.
  // ================= NEXT QUESTION =================
const handleNext = () => {
  if (!selectedAnswer) return;

  const currentQuestion = questions[index];
  const correct = currentQuestion.correct_answer;

  let updatedScore = score;

  // create local updated wrong list
  let updatedWrong = [...pendingWrong];

  if (selectedAnswer === correct) {
    updatedScore = score + 1;
    setScore(updatedScore);
  } else {
    const wrongItem = {
      question: currentQuestion.question,
      selected: selectedAnswer,
      correct,
    };

    updatedWrong.push(wrongItem);

    setPendingWrong(updatedWrong);
  }

  const nextIndex = index + 1;

  // next question
  if (nextIndex < questions.length) {
    setIndex(nextIndex);
    setSelectedAnswer(null);
    return;
  }

  // final question
  setTimeout(() => {
    finishQuiz(updatedScore, updatedWrong);
  }, 0);
};
  const finishQuiz = async (finalScore, wrongList) => {
    try {
      const wrongList = pendingWrong;

      // ================= FIREBASE UPDATE =================
      const user = auth.currentUser;

      if (user) {
        const userRef = doc(db, "users", user.uid);

        const snap = await getDoc(userRef);

        if (snap.exists()) {
          await updateDoc(userRef, {
            quizzesAttempted: increment(1),
            correctAnswers: increment(finalScore),
            score: increment(finalScore),
          });
        } else {
          await setDoc(userRef, {
            name: user.displayName || "",
            email: user.email || "",
            quizzesAttempted: 1,
            correctAnswers: finalScore,
            score: finalScore,
          });
        }
      }

      // ================= AI EXPLANATIONS =================
      if (wrongList.length === 0) {
        setShowResult(true);
        return;
      }

      setLoadingExplanation(true);

      const resolved = await Promise.all(
        wrongList.map(async (item) => {
          try {
            const explanation = await getAIExplanation(
              item.question,
              item.correct,
              item.selected,
            );

            return {
              ...item,
              explanation: explanation || "No explanation available.",
            };
          } catch (err) {
            console.log("AI error:", err);

            return {
              ...item,
              explanation: "AI service failed. Check API or network.",
            };
          }
        }),
      );

      setWrongAnswers(resolved);

      setLoadingExplanation(false);

      setShowResult(true);
    } catch (err) {
      console.log("Finish Quiz Error:", err);

      setLoadingExplanation(false);

      setShowResult(true);
    }
  };
  // ================= LOADING (initial quiz fetch only) =================
  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loaderText}>Loading quiz…</Text>
        </View>
      </View>
    );
  }

  // ================= EMPTY =================
  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No questions found. Try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchQuiz}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ================= POST-QUIZ AI LOADER (shown only after the final answer) =================
  if (loadingExplanation) {
    return (
      <View style={styles.center}>
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loaderText}>Preparing your results…</Text>
          <Text style={styles.loaderSub}>
            AI is reviewing your wrong answers
          </Text>
        </View>
      </View>
    );
  }

  // ================= RESULT SCREEN =================
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = score >= 7 ? "🔥" : score >= 4 ? "👍" : "💪";
    const message =
      score >= 7
        ? "Excellent Work!"
        : score >= 4
          ? "Good Job!"
          : "Keep Practicing!";

    const scoreColor =
      score >= 7 ? "#10B981" : score >= 4 ? "#F59E0B" : "#EF4444";

    return (
      <SafeAreaView style={styles.resultWrapper}>
        <ScrollView
          contentContainerStyle={styles.resultScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── SCORE HERO ── */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>{emoji}</Text>
            <Text style={styles.heroTitle}>Quiz Completed!</Text>
            {category ? (
              <Text style={styles.heroCategory}>{category}</Text>
            ) : null}

            {/* Circular score ring */}
            <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreNumber, { color: scoreColor }]}>
                {score}/{questions.length}
              </Text>
              <Text style={[styles.scorePercent, { color: scoreColor }]}>
                {percentage}%
              </Text>
            </View>

            <Text style={styles.heroMessage}>{message}</Text>

            {/* Mini stat row */}
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#10B981" }]}>
                  {score}
                </Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#EF4444" }]}>
                  {questions.length - score}
                </Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: "#4F46E5" }]}>
                  {questions.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* ── AI EXPLANATIONS ── */}
          {wrongAnswers.length > 0 && (
            <View style={styles.explanationsSection}>
              <Text style={styles.sectionTitle}>
                📘 AI Explanations ({wrongAnswers.length} wrong)
              </Text>

              {wrongAnswers.map((item, i) => (
                <View key={i} style={styles.explanationCard}>
                  {/* Index badge */}
                  <View style={styles.qBadge}>
                    <Text style={styles.qBadgeText}>Q{i + 1}</Text>
                  </View>

                  <Text style={styles.expQuestion}>
                    {item.question.replace(/&quot;|&#039;|&amp;/g, "")}
                  </Text>

                  <View style={styles.answerRow}>
                    <View style={[styles.answerBadge, styles.wrongBadge]}>
                      <Text style={styles.answerBadgeLabel}>Your Answer</Text>
                      <Text style={styles.answerBadgeValue}>
                        {item.selected}
                      </Text>
                    </View>
                    <View style={[styles.answerBadge, styles.correctBadge]}>
                      <Text style={styles.answerBadgeLabel}>Correct</Text>
                      <Text style={styles.answerBadgeValue}>
                        {item.correct}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.aiBox}>
                    <Text style={styles.aiLabel}>🤖 AI Explanation</Text>
                    <Text style={styles.aiText}>{item.explanation}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── BACK BUTTON ── */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>← Back to Categories</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ================= MAIN QUIZ UI =================
  const q = questions[index];
  const options = q?.incorrect_answers
    ? [...q.incorrect_answers, q.correct_answer].sort()
    : [];

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.quizScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={styles.quizHeader}>
          <Text style={styles.categoryLabel}>{category}</Text>
          <Text style={styles.progressLabel}>
            {index + 1} / {questions.length}
          </Text>
        </View>

        {/* ── PROGRESS BAR ── */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* ── QUESTION CARD ── */}
        <View style={styles.questionCard}>
          <Text style={styles.questionIndex}>Question {index + 1}</Text>
          <Text style={styles.questionText}>
            {q?.question?.replace(/&quot;|&#039;|&amp;/g, "")}
          </Text>
        </View>

        {/* ── OPTIONS ── */}
        <View style={styles.optionsContainer}>
          {options.map((opt, i) => {
            const isSelected = selectedAnswer === opt;
            const letter = String.fromCharCode(65 + i); // A B C D
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, isSelected && styles.selectedOption]}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionLetter,
                    isSelected && styles.optionLetterSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      isSelected && styles.optionLetterTextSelected,
                    ]}
                  >
                    {letter}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── NEXT BUTTON ── */}
        <TouchableOpacity
          style={[styles.nextButton, !selectedAnswer && styles.disabledBtn]}
          disabled={!selectedAnswer}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {index + 1 === questions.length ? "Finish Quiz ✓" : "Next →"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  // ── SHARED ──
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
    padding: 20,
  },
  loaderCard: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  loaderText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
  },
  loaderSub: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── QUIZ SCREEN ──
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  quizScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
    flexShrink: 1,
    maxWidth: "70%",
  },
  progressLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 99,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 99,
  },
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  questionIndex: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  selectedOption: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionLetterSelected: {
    backgroundColor: "#4F46E5",
  },
  optionLetterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
  },
  optionLetterTextSelected: {
    color: "#fff",
  },
  optionText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
    flexWrap: "wrap",
  },
  optionTextSelected: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.4,
  },
  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // ── RESULT SCREEN ──
  resultWrapper: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  resultScroll: {
    padding: 20,
    paddingBottom: 48,
  },
  heroCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  heroCategory: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 24,
    textAlign: "center",
  },
  scoreRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: "800",
  },
  scorePercent: {
    fontSize: 13,
    fontWeight: "600",
  },
  heroMessage: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 24,
  },
  statRow: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E5E7EB",
  },

  // ── AI EXPLANATIONS ──
  explanationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 14,
  },
  explanationCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  qBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  qBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
  },
  expQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 22,
    marginBottom: 14,
  },
  answerRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  answerBadge: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  wrongBadge: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  correctBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  answerBadgeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answerBadgeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    flexWrap: "wrap",
  },
  aiBox: {
    backgroundColor: "#F8F7FF",
    borderLeftWidth: 3,
    borderLeftColor: "#4F46E5",
    borderRadius: 10,
    padding: 12,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 6,
  },
  aiText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },

  // ── BACK BUTTON ──
  backButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
