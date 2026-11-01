/**
 * Wish Yours — AI Message Generation Endpoint Handler
 * Emotionally intelligent synthesis combining Gemini 1.5 Flash with strict occasion & relationship logic.
 */

const { callGeminiAPI, generateFallbackVariations } = require('./gemini');
const { resolveOccasion } = require('../data/occasions');
const { cleanText } = require('../data/text_cleaner');

// In-memory rate limiting map (IP -> timestamps)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

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

  // 2. Validate & normalize inputs
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

  // Resolve the structured occasion profile
  const occ = resolveOccasion(occasion);

  // Clean raw user memory (fix spelling/grammar typos while strictly preserving facts)
  const cleanedMemory = memories ? cleanText(memories).improved : '';

  // Resolve relationship-specific nuance
  const relNuance = occ.relationshipNuance?.[relationship] || `Adapt tone naturally to a ${relationship}.`;

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // 3. If API key exists, call Gemini AI with structured emotional prompt
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const systemInstruction = `You are Wish Yours, an empathetic world-class interpersonal copywriter and poet.
Your mission is to craft deeply touching, personalized messages tailored with exact emotional precision to specific occasions and relationships.

CRITICAL EMOTIONAL RULES:
1. OCCASION INTEGRITY:
   - If the occasion is "Sorry" or an apology: be humble, sincere, accountable, and focused on healing the relationship. NEVER use celebratory, party, happy, or cheerful words. Never say "Happy Sorry" or "Let's celebrate".
   - If the occasion is "Condolence & Sympathy": be quiet, comforting, compassionate, and solemn. Never use party or cheerful language.
   - If the occasion is "Thank You": focus on gratitude, appreciation, and warmth.
   - If the occasion is "Birthday", "Anniversary", or "Congratulations": be joyful, celebratory, proud, or romantic.
2. RELATIONSHIP AWARENESS:
   - A message for a romantic partner (Girlfriend/Boyfriend/Wife/Husband) must feel tender, affectionate, and personal.
   - A message for a colleague must be professional, dignified, respectful, and collaborative.
   - A message for a best friend should feel loyal, genuine, and authentic.
3. PERSONAL MEMORIES & FACTS:
   - Preserve all real details, names, dates, and inside jokes supplied by the user. Never invent fictional events or change their memories.
4. NATURAL HUMAN TONE:
   - Write like a real person writing from the heart. Avoid robotic clichés or repetitive greeting-card filler phrases.
5. STRICT LANGUAGE DIRECTIVE:
   - Match the requested language (English, pure Hindi Devanagari, or modern conversational Hinglish).

Always return responses strictly in valid JSON matching this schema:
{
  "variations": [
    {
      "id": "1",
      "title": "Creative headline for this option (e.g. Sincere & Heartfelt)",
      "text": "The full personalized message text including natural emojis matching the occasion emotion",
      "tone": "Descriptive tone",
      "estimatedWords": 45
    },
    {
      "id": "2",
      "title": "Creative headline for option 2 (e.g. Reflective & Gentle)",
      "text": "Distinct alternative tone and cadence",
      "tone": "Descriptive tone",
      "estimatedWords": 40
    },
    {
      "id": "3",
      "title": "Creative headline for option 3 (e.g. Short & Genuine)",
      "text": "Third unique option (concise)",
      "tone": "Descriptive tone",
      "estimatedWords": 28
    }
  ]
}`;

      let langDirective = "in fluent, natural English";
      if (language.toLowerCase() === 'hi') {
        langDirective = "in pure, poetic Hindi (Devanagari script)";
      } else if (language.toLowerCase() === 'hinglish') {
        langDirective = "in modern, warm conversational Hinglish (Hindi written in Roman/English alphabet, everyday WhatsApp/text style in India)";
      }

      const lengthGuidance = length === 'short' 
        ? 'Short & punchy (around 25-35 words)' 
        : (length === 'long' ? 'Long & detailed (around 65-85 words)' : 'Standard heartfelt length (around 40-55 words)');

      const userPrompt = `Generate 3 personalized greeting variations for:
- Occasion: ${occ.name}
- Occasion Category: ${occ.category} (Is Celebration? ${occ.isCelebration ? 'YES' : 'NO - DO NOT USE CELEBRATORY LANGUAGE'})
- Required Emotional Context: ${occ.emotionalContext}
- Specific Guidance: ${occ.guidance}
- FORBIDDEN KEYWORDS (DO NOT USE ANY OF THESE): ${occ.forbiddenKeywords.join(', ') || 'None'}
- Recipient Name: ${recipientName}
- Sender Name: ${senderName}
- Relationship: ${relationship}
- Relationship Nuance: ${relNuance}
- Desired Style / Tone: ${style}
- Personal Memories / Context (PRESERVE ACCURATELY): ${cleanedMemory || 'None specified'}
- Language: ${langDirective}
- Target Length: ${lengthGuidance}

Ensure all 3 options hit the exact emotional chord of the occasion and relationship.`;

      const result = await callGeminiAPI(apiKey, model, systemInstruction, userPrompt);
      if (result && Array.isArray(result.variations) && result.variations.length > 0) {
        return {
          status: 'success',
          source: 'gemini',
          model: model,
          occasion: occ.name,
          cleanedMemory: cleanedMemory || undefined,
          variations: result.variations
        };
      }
    } catch (err) {
      console.warn('[Gemini API Warning] Falling back to intelligent emotion synthesizer:', err.message);
    }
  }

  // 4. Intelligent Fallback Synthesizer
  const fallbackVariations = generateFallbackVariations({
    occasion: occ.name,
    relationship,
    recipientName,
    senderName,
    style,
    memories: cleanedMemory,
    language,
    length
  });

  return {
    status: 'success',
    source: 'template_synthesizer',
    occasion: occ.name,
    cleanedMemory: cleanedMemory || undefined,
    variations: fallbackVariations
  };
}

module.exports = {
  handleGenerateMessage,
  checkRateLimit
};
