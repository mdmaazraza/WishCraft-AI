/**
 * Wish Yours — Text Improvement & Grammar Polish Engine
 * Cleans user-written personal memories, notes, and messages:
 * - Fixes spelling typos, texting abbreviations, grammatical errors, and capitalization
 * - Strictly PRESERVES all personal facts, names, dates, jokes, events, and authentic voice
 * - Dual mode: Gemini AI-assisted polish + robust rule-based fallback cleaner
 */

const https = require('https');

// Rule-based dictionary of common typos and texting shorthands
const WORD_REPLACEMENTS = {
  // Common texting abbreviations
  'frnd': 'friend',
  'frnds': 'friends',
  'bday': 'birthday',
  'plz': 'please',
  'pls': 'please',
  'thx': 'thanks',
  'thnx': 'thanks',
  'tq': 'thank you',
  'u': 'you',
  'ur': 'your',
  'r': 'are',
  'alot': 'a lot',
  'coz': 'because',
  'cuz': 'because',
  'bcuz': 'because',
  'gud': 'good',
  'lyk': 'like',
  'wud': 'would',
  'cud': 'could',
  'shud': 'should',
  'abt': 'about',
  'msg': 'message',
  'pic': 'picture',
  'pics': 'pictures',
  'fvr': 'forever',

  // Common spelling errors
  'suport': 'support',
  'suported': 'supported',
  'suporting': 'supporting',
  'definatly': 'definitely',
  'definetly': 'definitely',
  'seperate': 'separate',
  'truely': 'truly',
  'untill': 'until',
  'wierd': 'weird',
  'acheive': 'achieve',
  'recieve': 'receive',
  'beleive': 'believe',
  'happened': 'happened',
  'happend': 'happened',
  'occured': 'occurred',
  'tommorrow': 'tomorrow',
  'tommorow': 'tomorrow',
  'rember': 'remember',
  'remeber': 'remember',

  // Contractions missing apostrophes
  'dont': "don't",
  'cant': "can't",
  'wont': "won't",
  'didnt': "didn't",
  'doesnt': "doesn't",
  'isnt': "isn't",
  'arent': "aren't",
  'wasnt': "wasn't",
  'werent': "weren't",
  'couldnt': "couldn't",
  'wouldnt': "wouldn't",
  'shouldnt': "shouldn't",
  'havent': "haven't",
  'hasnt': "hasn't",
  'im': "I'm",
  'ive': "I've",
  'youre': "you're",
  'theyre': "they're",
  'weve': "we've",
  'thats': "that's",
  'whats': "what's"
};

// Phrase-level grammatical agreement corrections
const PHRASE_REPLACEMENTS = [
  { regex: /\bwe was\b/gi, replacement: 'we were' },
  { regex: /\bthey was\b/gi, replacement: 'they were' },
  { regex: /\byou was\b/gi, replacement: 'you were' },
  { regex: /\bi were\b/gi, replacement: 'I was' },
  { regex: /\bcollage\b(?=\s*(?:and|days|time|life|degree|stud|campus|prof|class))/gi, replacement: 'college' },
  { regex: /\b(?:from|in|at)\s+collage\b/gi, replacement: (match) => match.replace(/collage/i, 'college') }
];

/**
 * Rule-based synchronous text cleaner
 * Fixes grammar, typos, abbreviations, capitalization, and punctuation while strictly preserving facts.
 */
function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { original: '', improved: '', changesMade: false };
  }

  const original = rawText.trim();
  if (!original) {
    return { original: '', improved: '', changesMade: false };
  }

  let text = original;

  // 1. Phrase-level grammatical replacements
  for (const item of PHRASE_REPLACEMENTS) {
    text = text.replace(item.regex, item.replacement);
  }

  // 2. Tokenize while preserving punctuation and spacing
  // Match words, spaces, and punctuation
  const tokens = text.match(/([A-Za-z0-9_']+|[^\s\w]+|\s+)/g) || [text];

  const processedTokens = tokens.map((token, idx, arr) => {
    // If it's pure word characters
    const lower = token.toLowerCase();

    // Check specific contextual grammar fixes:
    // e.g., "always suport me when i was sad" -> "suport" followed by past tense context becomes "supported"
    if (lower === 'suport') {
      const remainingText = arr.slice(idx).join(' ').toLowerCase();
      if (remainingText.includes('was') || remainingText.includes('were') || remainingText.includes('did')) {
        return 'supported';
      }
      return 'support';
    }

    if (WORD_REPLACEMENTS[lower]) {
      const rep = WORD_REPLACEMENTS[lower];
      // Match original case if first letter was capitalized
      if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
        return rep.charAt(0).toUpperCase() + rep.slice(1);
      }
      return rep;
    }

    // Capitalize standalone 'i'
    if (token === 'i') {
      return 'I';
    }

    return token;
  });

  text = processedTokens.join('');

  // 3. Fix multiple spaces and punctuation spacing
  text = text.replace(/\s{2,}/g, ' ');
  text = text.replace(/\s+([,.!?;:])/g, '$1');

  // 4. Sentence capitalization: capitalize first letter of text and after . ! ?
  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  // 5. If text looks like a complete sentence or phrase without trailing punctuation, append a period
  if (!/[.!?…]$/.test(text) && text.length > 5) {
    text += '.';
  }

  const changesMade = text.trim() !== original;

  return {
    original,
    improved: text.trim(),
    changesMade,
    explanation: changesMade ? 'Cleaned spelling, grammar, and capitalization while preserving all personal details.' : 'Text looks clean.'
  };
}

/**
 * Intelligent text correction using Gemini AI with fallback to rule-based cleaner
 */
async function correctTextWithAI(rawText, context = {}) {
  const { original, improved: ruleImproved, changesMade: ruleChanges } = cleanText(rawText);

  if (!original) {
    return { original: '', improved: '', changesMade: false };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // If no Gemini key, return rule-based cleaned text immediately
  if (!apiKey || apiKey.trim().length < 10) {
    return {
      original,
      improved: ruleImproved,
      changesMade: ruleChanges,
      source: 'rule_engine'
    };
  }

  const systemPrompt = `You are a careful personal editor.
Your ONLY job is to correct spelling mistakes, grammatical errors, broken sentence structure, punctuation, and capitalization in the user's raw personal note or memory.
CRITICAL RULES:
1. PRESERVE 100% of the user's authentic facts, names, dates, events, numbers, inside jokes, and original tone.
2. Do NOT invent new facts or rewrite the memory into something different.
3. Fix typos naturally (e.g. 'we was frnds from collage and you always suport me when i was sad' -> 'We were friends from college and you always supported me when I was sad.').
4. Return strictly valid JSON:
{
  "improved": "The corrected text",
  "changesMade": true,
  "explanation": "Brief description of fixes made"
}`;

  const userPrompt = `User's raw text: "${original}"
Occasion context: ${context.occasion || 'Celebration'}
Relationship: ${context.relationship || 'Friend'}
Recipient: ${context.recipientName || ''}

Return JSON with "improved", "changesMade", and "explanation".`;

  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      temperature: 0.2, // Low temperature for high precision editing
      topP: 0.8,
      maxOutputTokens: 400,
      responseMimeType: "application/json"
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 6000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(data);
            const rawOutput = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawOutput) {
              const jsonResult = JSON.parse(rawOutput);
              if (jsonResult.improved && jsonResult.improved.trim()) {
                return resolve({
                  original,
                  improved: jsonResult.improved.trim(),
                  changesMade: Boolean(jsonResult.changesMade),
                  explanation: jsonResult.explanation || 'Polished grammar and spelling',
                  source: 'gemini'
                });
              }
            }
          }
        } catch (e) {
          // Fall through to rule engine
        }
        // Fallback to rule engine on any parse or non-200 issue
        resolve({
          original,
          improved: ruleImproved,
          changesMade: ruleChanges,
          source: 'rule_engine'
        });
      });
    });

    req.on('error', () => {
      resolve({
        original,
        improved: ruleImproved,
        changesMade: ruleChanges,
        source: 'rule_engine'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        original,
        improved: ruleImproved,
        changesMade: ruleChanges,
        source: 'rule_engine'
      });
    });

    req.write(payload);
    req.end();
  });
}

module.exports = {
  cleanText,
  correctTextWithAI,
  WORD_REPLACEMENTS,
  PHRASE_REPLACEMENTS
};
