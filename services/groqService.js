import Constants from "expo-constants";

// ✅ Safe API key loading (Expo + fallback optional)
const GROQ_API_KEY =
  Constants.expoConfig?.extra?.groqApiKey?.trim() ||
  "gsk_YOUR_FALLBACK_KEY_IF_NEEDED";

console.log("🔥 GROQ KEY LOADED:", GROQ_API_KEY);

// ================= MAIN FUNCTION =================
export const getAIExplanation = async (
  question,
  correctAnswer,
  selectedAnswer
) => {
  try {
    const prompt = `
You are a helpful quiz teacher.

Question:
${question}

User Answer:
${selectedAnswer}

Correct Answer:
${correctAnswer}

Explain simply:
1. Why user answer is wrong (if wrong)
2. Why correct answer is correct
Keep response short and easy.
`;

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
        }),
      }
    );

    // ================= ERROR HANDLING =================
    if (!response.ok) {
      const errText = await response.text();
      console.log("🔥 GROQ FULL ERROR:", errText);

      if (errText.includes("invalid_api_key")) {
        return "Invalid API key. Please check your Groq key.";
      }

      if (errText.includes("rate_limit")) {
        return "Rate limit exceeded. Try again later.";
      }

      return "AI service error. Please try again later.";
    }

    const data = await response.json();

    const explanation =
      data?.choices?.[0]?.message?.content ||
      "No explanation returned from AI.";

    return explanation;
  } catch (error) {
    console.log("AI Error:", error);
    return "Explanation not available due to network error.";
  }
};