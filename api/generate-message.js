/**
 * WishCraft AI — AI Message Generation Endpoint Handler
 */

const { callGeminiAPI, generateFallbackVariations } = require('./gemini');

// Simple in-memory rate limiting map (IP -> timestamps)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(ip) {
  const now = Date.now();
  const history = rateLimits.get(ip) || [];
  const recent = history.filter(ts => now - ts < RATE_LIMIT_WINDOW);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  recent.push(now);
  rateLimits.set(ip, recent);
  return true;
}

async function handleGenerateMessage(reqData, clientIp = '127.0.0.1') {
  // 1. Rate limiting check
  if (!checkRateLimit(clientIp)) {
    throw {
      statusCode: 429,
      message: 'Too many generation requests. Please wait a minute before generating again.'
    };
  }

  // 2. Validate input
  const {
    occasion = 'Birthday',
    relationship = 'Friend',
    recipientName = 'Special Person',
    senderName = 'Friend',
    style = 'Heart-touching',
    memories = '',
    language = 'en',
    length = 'medium'
  } = reqData || {};

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // 3. If API key exists, call Gemini AI
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemInstruction = `You are Wish Yours, an empathetic world-class greeting card copywriter and poet.
Your mission is to craft deeply touching, personalized, and memorable celebration messages that make people smile, tear up with joy, or laugh happily.
Always return responses strictly in valid JSON matching this schema:
{
  "variations": [
    {
      "id": "1",
      "title": "Creative headline for this option",
      "text": "The full personalized message text including appropriate emojis",
      "tone": "Descriptive tone",
      "estimatedWords": 45
    },
    {
      "id": "2",
      "title": "Creative headline for option 2",
      "text": "Distinct alternative tone and rhythm",
      "tone": "Descriptive tone",
      "estimatedWords": 40
    },
    {
      "id": "3",
      "title": "Creative headline for option 3 (shorter or punchier)",
      "text": "Third unique option",
      "tone": "Descriptive tone",
      "estimatedWords": 28
    }
  ]
}`;

      let langDirective = "in fluent, natural English";
      if (language.toLowerCase() === 'hi') {
        langDirective = "in pure, poetic Hindi (Devanagari script)";
      } else if (language.toLowerCase() === 'hinglish') {
        langDirective = "in modern, warm conversational Hinglish (Hindi written in Roman/English alphabet, popular in everyday texts/WhatsApp in India)";
      }

      const userPrompt = `Create 3 personalized message variations for:
- Occasion: ${occasion}
- Relationship: ${relationship}
- Recipient Name: ${recipientName}
- Sender Name: ${senderName}
- Desired Style / Tone: ${style}
- Personal Memories or Context: ${memories || 'None specified'}
- Language: ${langDirective}
- Target Length: ${length}

Make sure each option feels genuine, emotionally resonant, and avoids robotic clichés. Include emojis naturally.`;

      const aiResult = await callGeminiAPI(apiKey, model, systemInstruction, userPrompt);

      if (aiResult && Array.isArray(aiResult.variations) && aiResult.variations.length > 0) {
        return {
          status: 'success',
          source: 'gemini',
          model,
          variations: aiResult.variations
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to intelligent template synthesizer:', err.message);
      // Fallback below
    }
  }

  // 4. Intelligent Fallback Synthesizer
  const fallbackVariations = generateFallbackVariations({
    occasion,
    relationship,
    recipientName,
    senderName,
    style,
    memories,
    language,
    length
  });

  return {
    status: 'success',
    source: 'fallback',
    message: apiKey ? 'Generated via template synthesizer (Gemini API unavailable)' : 'Generated via instant template engine (Add GEMINI_API_KEY for live AI models)',
    variations: fallbackVariations
  };
}

module.exports = {
  handleGenerateMessage
};
