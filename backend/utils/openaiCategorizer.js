const { generateGroqContent } = require('./groqService');

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];

const CATEGORY_KEYWORDS = {
  'Food': ['swiggy', 'zomato', 'restaurant', 'cafe', 'food', 'blinkit', 'zepto', 'grocer', 'supermarket', 'bakery'],
  'Transport': ['uber', 'ola', 'rapido', 'metro', 'petrol', 'fuel', 'shell', 'parking', 'bus', 'train', 'irctc'],
  'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'zara', 'h&m', 'mall', 'shopping'],
  'Bills': ['electricity', 'water', 'gas', 'recharge', 'jio', 'airtel', 'vi', 'broadband', 'insurance', 'rent'],
  'Entertainment': ['netflix', 'hotstar', 'prime video', 'booking', 'movie', 'multiplex', 'theatre', 'club', 'spotify']
};

function localCategorize(name = '', fallbackCategory = 'Other') {
  const lowercaseName = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowercaseName.includes(kw))) {
      return category;
    }
  }
  return fallbackCategory;
}

async function categorizeTransaction(name) {
  // First try local categorization
  const localResult = localCategorize(name);
  if (localResult !== 'Other') {
    return localResult;
  }

  try {
    const prompt = `Classify this financial transaction into ONE of these categories: ${VALID_CATEGORIES.join(', ')}. 
    Return ONLY the category name and nothing else.
    Transaction: "${name}"`;
    
    const category = await generateGroqContent(prompt);
    
    const cleanedCategory = category.trim().replace(/[*_`]/g, '');
    
    if (VALID_CATEGORIES.includes(cleanedCategory)) {
      return cleanedCategory;
    }
    return 'Other';
  } catch (error) {
    console.error('Groq Categorization Error:', error.message);
    return 'Other';
  }
}

async function bulkCategorize(transactions) {
  const categorized = [];

  for (const t of transactions) {
    const name = t.name || t.description || 'Unnamed Transaction';
    
    if (!t.category || t.category === 'Other' || t.category === 'General' || t.category === '') {
      t.category = await categorizeTransaction(name);
    }
    
    const normalized = {
      name: name,
      amount: parseFloat(t.amount) || 0,
      category: VALID_CATEGORIES.includes(t.category) ? t.category : 'Other',
      date: t.date || new Date().toISOString().split('T')[0],
      notes: t.notes || ''
    };
    
    categorized.push(normalized);
  }

  return categorized;
}

module.exports = { categorizeTransaction, localCategorize, bulkCategorize };
