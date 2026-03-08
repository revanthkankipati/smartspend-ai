const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Generates text using Gemini Pro model.
 * @param {string} prompt - The prompt to send to Gemini.
 * @param {boolean} isJson - Whether to expect JSON response.
 * @returns {Promise<string|object>} - The generated content.
 */
async function generateGeminiContent(prompt, isJson = false) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (isJson) {
      try {
        // Simple parse
        return JSON.parse(text);
      } catch (e) {
        // Robust fallback for gemini-pro which doesn't support JSON mode
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/) || text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const rawJson = (jsonMatch[1] || jsonMatch[0]).trim();
          return JSON.parse(rawJson);
        }
        throw new Error("Could not extract JSON from Gemini response: " + text.substring(0, 100));
      }
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}

module.exports = { generateGeminiContent };
