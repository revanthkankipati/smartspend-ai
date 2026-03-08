const { OpenAI } = require('openai');
require('dotenv').config();

const groq = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
}) : null;

/**
 * Generates text using Groq (OpenAI-compatible) API.
 * @param {string} prompt - The prompt to send.
 * @param {boolean} isJson - Whether to expect JSON response.
 * @returns {Promise<string|object>} - The generated content.
 */
async function generateGroqContent(prompt, isJson = false) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is missing in .env");
  }

  try {
    const params = {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    };

    if (isJson) {
      params.response_format = { type: "json_object" };
    }

    const chatCompletion = await groq.chat.completions.create(params);
    const text = chatCompletion.choices[0].message.content;

    if (isJson) {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error("Groq JSON parse error:", e);
        // Fallback: try to find JSON in the text
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/) || text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1] || jsonMatch[0]);
        }
        throw e;
      }
    }

    return text;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error;
  }
}

module.exports = { generateGroqContent };
