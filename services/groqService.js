import Constants from "expo-constants";
// ✅ Safe API key loading (Expo + fallback)
const GROQ_API_KEY =
  Constants.expoConfig?.extra?.groqApiKey?.trim() ||
  Constants.manifest?.extra?.groqApiKey?.trim() || // older Expo SDK fallback
  "";
console.log(GROQ_API_KEY);

if (!GROQ_API_KEY) {
  console.warn(
    "⚠️ GROQ_API_KEY is missing. Check your app.config.js / .env setup.",
  );
} else {
  console.log("✅ GROQ KEY LOADED:", GROQ_API_KEY.slice(0, 8) + "...");
}

// ================= MAIN FUNCTION =================
export const getAIExplanation = async (
  question,
  correctAnswer,
  selectedAnswer,
) => {
  if (!GROQ_API_KEY) {
    return "AI explanation unavailable: API key not configured.";
  }

  if (!question || !correctAnswer || !selectedAnswer) {
    return "AI explanation unavailable: Missing question or answer data.";
  }

  try {
    const prompt = `You are a helpful quiz teacher.

Question:
${question}

User's Answer (Wrong):
${selectedAnswer}

Correct Answer:
${correctAnswer}

Please explain:
1. Why the user's answer is wrong
2. Why the correct answer is right

Keep your response short, clear, and easy to understand for a general audience.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      },
    );

    // ================= ERROR HANDLING =================
    if (!response.ok) {
      const errText = await response.text();
      console.log("🔥 GROQ FULL ERROR:", errText);

      let parsed = null;
      try {
        parsed = JSON.parse(errText);
      } catch (_) {}

      const errorCode = parsed?.error?.code || "";
      const errorMsg = parsed?.error?.message || errText;

      if (
        errorCode === "invalid_api_key" ||
        errText.includes("invalid_api_key")
      ) {
        return "Invalid API key. Please check your Groq key in app config.";
      }

      if (
        errorCode === "rate_limit_exceeded" ||
        errText.includes("rate_limit")
      ) {
        return "Rate limit exceeded. Please try again in a moment.";
      }

      if (response.status === 503 || errText.includes("service_unavailable")) {
        return "Groq service is temporarily unavailable. Try again later.";
      }

      console.log("Groq error details:", errorMsg);
      return `AI service error (${response.status}). Please try again later.`;
    }

    const data = await response.json();

    const explanation =
      data?.choices?.[0]?.message?.content?.trim() ||
      "No explanation returned from AI.";

    return explanation;
  } catch (error) {
    if (error?.message?.includes("Network request failed")) {
      console.log("AI Network Error:", error);
      return "No internet connection. Please check your network and try again.";
    }

    console.log("AI Unexpected Error:", error);
    return "Explanation not available due to an unexpected error.";
  }
};
