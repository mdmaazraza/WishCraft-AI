/**
 * Wish Yours — AI Message Generation Endpoint Handler
 * Emotionally intelligent synthesis combining Gemini 1.5 Flash with strict occasion & relationship logic.
 */

const { callGeminiAPI, generateFallbackVariations } = require('./gemini');
const { resolveOccasion, validateMessageContent } = require('../data/occasions');
const { cleanText } = require('../data/text_cleaner');
const { isMdRazaSender, formatRelationship, applySignatureToMessage } = require('../data/attribution');

// In-memory rate limiting map (IP -> timestamps)
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25;

const WORD_LIMITS = {
  short: { min: 25, max: 45, label: "Short (~25–45 words, 2-3 crisp sentences, never exceed 45 words)" },
  medium: { min: 50, max: 80, label: "Medium (~50–80 words, 3-5 balanced sentences, STRICT CEILING OF 80 WORDS)" },
  long: { min: 90, max: 130, label: "Long (~90–130 words, 6-9 sentences, STRICT CEILING OF 130 WORDS)" }
};

function enforceWordLimit(text, targetLength = 'medium') {
  if (!text || typeof text !== 'string') return text;
  const config = WORD_LIMITS[targetLength.toLowerCase()] || WORD_LIMITS.medium;
  const words = text.trim().split(/\s+/);
  if (words.length <= config.max + 5) {
    return text;
  }
  // Trim at sentence boundary within max words
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  let accumulated = '';
  for (const s of sentences) {
    const testCount = (accumulated + ' ' + s).trim().split(/\s+/).length;
    if (testCount <= config.max) {
      accumulated = (accumulated + ' ' + s).trim();
    } else {
      break;
    }
  }
  if (accumulated && accumulated.split(/\s+/).length >= config.min) {
    return accumulated;
  }
  return words.slice(0, config.max).join(' ').replace(/[,;:\s]+$/, '') + '.';
}

function sanitizeForbiddenKeywords(text, occ) {
  if (!text || typeof text !== 'string' || !occ) return text;
  const check = validateMessageContent(occ.id, text);
  if (check.valid) return text;
  let cleaned = text;
  for (const word of check.violations) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (word.toLowerCase() === 'celebrate' || word.toLowerCase() === 'celebration') {
      cleaned = cleaned.replace(regex, 'honor');
    } else if (word.toLowerCase() === 'party') {
      cleaned = cleaned.replace(regex, 'moment');
    } else if (word.toLowerCase() === 'happy sorry') {
      cleaned = cleaned.replace(regex, 'sincere apology');
    } else if (word.toLowerCase() === 'happy') {
      cleaned = cleaned.replace(regex, 'peaceful');
    } else if (word.toLowerCase() === 'congratulations') {
      cleaned = cleaned.replace(regex, 'best wishes');
    } else {
      cleaned = cleaned.replace(regex, '');
    }
  }
  return cleaned;
}

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

  // 2. Validate & normalize inputs (supporting dual camelCase & snake_case)
  const payload = reqData || {};
  const occasion = payload.occasion || 'Birthday';
  const relationship = payload.relationship || 'Friend';
  const recipientName = (payload.recipientName || payload.recipient_name || 'Special Person').trim();
  const senderName = (payload.senderName || payload.sender_name || 'Friend').trim();
  const style = (payload.style || payload.emotion || 'Heartfelt').trim();
  const emotionIntensity = (payload.emotionIntensity || payload.emotion_intensity || 'Balanced').trim();
  const memories = (payload.memories || payload.memory || '').trim();
  const language = (payload.language || 'en').trim();
  const length = (payload.length || payload.message_length || 'medium').trim();
  const template = (payload.template || 'cake').trim();

  // Resolve the structured occasion profile
  const occ = resolveOccasion(occasion);

  // Clean raw user memory (fix spelling/grammar typos while strictly preserving facts)
  const cleanedMemory = memories ? cleanText(memories).improved : '';

  // Resolve relationship-specific nuance
  const relNuance = occ.relationshipNuance?.[relationship] || `Adapt tone naturally to a ${relationship}.`;

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const limitConfig = WORD_LIMITS[length.toLowerCase()] || WORD_LIMITS.medium;

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
6. WORD COUNT ENFORCEMENT:
   - Target is ${limitConfig.label}. NEVER exceed ${limitConfig.max} words.

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

      const userPrompt = `Generate 3 personalized greeting variations for:
- Occasion: ${occ.name}
- Occasion Category: ${occ.category} (Is Celebration? ${occ.isCelebration ? 'YES' : 'NO - DO NOT USE CELEBRATORY LANGUAGE'})
- Required Emotional Context: ${occ.emotionalContext}
- Specific Guidance: ${occ.guidance}
- FORBIDDEN KEYWORDS (DO NOT USE ANY OF THESE): ${occ.forbiddenKeywords.join(', ') || 'None'}
- Recipient Name: ${recipientName}
- Sender Name: ${senderName}
${isMdRazaSender(senderName)
  ? `- SPECIAL SENDER SIGNATURE: The sender is MD RAZA. At the end of every variation, sign specifically as: "— Your ${formatRelationship(relationship)}, MD RAZA"`
  : `- SENDER ATTRIBUTION RESTRICTION: The sender is strictly "${senderName}". You MUST conclude with "— ${senderName}". Under NO circumstances sign as "MD RAZA" or mention MD RAZA. MD RAZA is the developer, NOT the greeting sender.`
}
- Relationship: ${relationship}
- Relationship Nuance: ${relNuance}
- Desired Style / Emotion: ${style}
- Emotion Intensity: ${emotionIntensity} (${emotionIntensity === 'Light' ? 'Gentle and understated' : emotionIntensity === 'Deep' ? 'Profound and deeply soulful' : emotionIntensity === 'Very Emotional' ? 'Intensely vulnerable and heartfelt' : 'Balanced, warm and natural'})
- Personal Memories / Context (PRESERVE ACCURATELY): ${cleanedMemory || 'None specified'}
- Language: ${langDirective}
- Strict Target Word Count: ${limitConfig.label}

Ensure all 3 options hit the exact emotional chord of the occasion, intensity, and relationship without exceeding word count limits.`;

      const result = await callGeminiAPI(apiKey, model, systemInstruction, userPrompt);
      if (result && Array.isArray(result.variations) && result.variations.length > 0) {
        const sanitizedVariations = result.variations.map((v, i) => {
          let text = sanitizeForbiddenKeywords(v.text, occ);
          text = enforceWordLimit(text, length);
          return {
            ...v,
            text,
            estimatedWords: text.trim().split(/\s+/).length
          };
        });

        return {
          status: 'success',
          source: 'gemini',
          model: model,
          occasion: occ.name,
          cleanedMemory: cleanedMemory || undefined,
          variations: sanitizedVariations
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
    emotionIntensity,
    memories: cleanedMemory,
    language,
    length
  });

  const sanitizedFallbacks = fallbackVariations.map(v => {
    let text = sanitizeForbiddenKeywords(v.text, occ);
    text = enforceWordLimit(text, length);
    return {
      ...v,
      text,
      estimatedWords: text.trim().split(/\s+/).length
    };
  });

  return {
    status: 'success',
    source: 'template_synthesizer',
    occasion: occ.name,
    cleanedMemory: cleanedMemory || undefined,
    variations: sanitizedFallbacks
  };
}

module.exports = {
  handleGenerateMessage,
  checkRateLimit
};
