const { OpenAI } = require('openai');
require('dotenv').config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'General', 'Other'];

async function categorizeTransaction(description) {
  if (!openai) {
    // If no API key, fallback to General
    return 'General';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a finacial transaction categorizer. Classify the transaction into ONE of these categories: ${VALID_CATEGORIES.join(', ')}. Return ONLY the category name and nothing else.`
        },
        {
          role: 'user',
          content: `Transaction: "${description}"`
        }
      ],
      temperature: 0,
      max_tokens: 10
    });

    const category = response.choices[0].message.content.trim();
    if (VALID_CATEGORIES.includes(category)) {
      return category;
    }
    return 'General';
  } catch (error) {
    console.error('OpenAI Categorization Error:', error.message);
    return 'General';
  }
}

async function bulkCategorize(transactions) {
  // Batch processing (to avoid hitting rate limits on a free tier, process sequentially or in chunks)
  // For demonstration, we'll process those with empty/General category
  const categorized = [];

  for (const t of transactions) {
    if (!t.category || t.category === 'General' || t.category === '') {
      t.category = await categorizeTransaction(t.description);
    }
    categorized.push(t);
  }

  return categorized;
}

module.exports = { categorizeTransaction, bulkCategorize };
