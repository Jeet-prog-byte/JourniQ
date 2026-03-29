const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { getDb } = require('../config/db');

// Retrieve all packages function
async function getAllPackagesContext() {
  const db = await getDb();
  const result = db.exec("SELECT id, title, destination, category, price, duration, rating FROM packages");
  
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const packages = result[0].values.map(row => {
    const pkg = {};
    columns.forEach((col, i) => {
      pkg[col] = row[i];
    });
    return pkg;
  });

  return packages;
}

// Ensure the API key exists
const apiKey = process.env.GEMINI_API_KEY;

let ai;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set. The chatbot will not function.");
} else {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("✅ Gemini AI client initialized successfully.");
  } catch (e) {
    console.error("Error initializing GoogleGenAI client:", e);
  }
}

// Helper: call Gemini with automatic retry on 429
async function callGeminiWithRetry(ai, params, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const status = err?.status || err?.error?.code;
      if (status === 429 && attempt < maxRetries) {
        // Parse retry delay from error or default to 10 seconds
        const waitSec = 10;
        console.log(`Rate limited (429). Retrying in ${waitSec}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
        continue;
      }
      throw err;
    }
  }
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Valid messages array is required.' });
    }

    if (!ai) {
      return res.status(500).json({ error: 'Chatbot is unavailable. GEMINI_API_KEY is missing.' });
    }

    // Build system instruction with live package data
    const packagesContext = await getAllPackagesContext();
    const systemInstruction = `You are a helpful, enthusiastic, and knowledgeable travel agent assistant for 'JourniQ'. 
Your job is to guide users to book the perfect travel package from the provided available packages.
Only recommend destinations and packages that exist in the catalog below. Be concise, friendly, and persuasive.
Keep responses under 150 words unless detailed info is requested.

Available JourniQ Packages:
${JSON.stringify(packagesContext, null, 2)}
`;

    // Build the full conversation as contents array
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      role: 'assistant',
      content: response.text
    });

  } catch (err) {
    console.error('Chat endpoint error:', err.message || err);
    
    const status = err?.status || err?.error?.code;
    
    // If rate-limited, provide a fallback "offline" response
    if (status === 429) {
      const fallbackResponses = [
        "I'm currently receiving a high volume of requests, but I recommend checking out our 'Bali Adventure' or 'Swiss Alps' packages from the Packages page!",
        "My AI brain is a bit overloaded right now! Feel free to browse the 'Explore Packages' section, where we have highly-rated trips like the 'Kyoto Cultural Tour'.",
        "It seems my API key has reached its request limit for the moment. However, I can tell you that our packages starting under $1000 have been extremely popular today!"
      ];
      
      return res.json({
        role: 'assistant',
        content: `*(Gemini Rate Limit Exceeded)*\n\n${fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]}`
      });
    }
    
    res.status(500).json({ error: 'Failed to generate response: ' + (err.message || 'Unknown error') });
  }
});

module.exports = router;
