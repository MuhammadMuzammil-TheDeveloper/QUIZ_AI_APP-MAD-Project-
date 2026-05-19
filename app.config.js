// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "QuizAIApp",
    slug: "QuizAIApp",
    extra: {
      groqApiKey: process.env.GROQ_API_KEY,
    },
  },
};