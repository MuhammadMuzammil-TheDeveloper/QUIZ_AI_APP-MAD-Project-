import Constants from "expo-constants";

const GROQ_API_KEY = Constants.expoConfig.extra.groqApiKey;

export const getAIExplanation = async (
  question,
  correctAnswer,
  selectedAnswer
) => {
  try {
    const prompt = `
You are a quiz teacher.

Question:
${question}

User Answer:
${selectedAnswer}

Correct Answer:
${correctAnswer}

Explain simply:
1. Why wrong answer is wrong
2. Why correct is correct
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
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.log("AI Error:", error);
    return "Explanation not available.";
  }
};