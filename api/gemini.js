/**
 * WishCraft AI — Google Gemini AI Integration Service
 * Uses native HTTPS to interact with Google Gemini API securely on the backend.
 */

const https = require('https');

// Helper to make POST request to Gemini REST API
function callGeminiAPI(apiKey, model, systemInstruction, userPrompt) {
  return new Promise((resolve, reject) => {
    if (!apiKey) {
      return reject(new Error('GEMINI_API_KEY is not configured in backend environment'));
    }

    const payload = JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: userPrompt }
          ]
        }
      ],
      systemInstruction: systemInstruction ? {
        parts: [
          { text: systemInstruction }
        ]
      } : undefined,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1200,
        responseMimeType: "application/json"
      }
    });

    const endpoint = `/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 12000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
              return reject(new Error('Empty response from Gemini API'));
            }
            // Parse structured JSON output from Gemini
            const jsonResult = JSON.parse(rawText);
            resolve(jsonResult);
          } catch (e) {
            // If json parse failed, try extracting json block
            try {
              const matched = data.match(/\{[\s\S]*\}/);
              if (matched) {
                resolve(JSON.parse(matched[0]));
              } else {
                reject(new Error(`Failed to parse Gemini output: ${e.message}`));
              }
            } catch (innerErr) {
              reject(innerErr);
            }
          }
        } else {
          try {
            const errObj = JSON.parse(data);
            reject(new Error(`Gemini API Error (${res.statusCode}): ${errObj.error?.message || data}`));
          } catch {
            reject(new Error(`Gemini API Error (${res.statusCode}): ${data}`));
          }
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out after 12 seconds'));
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Intelligent Fallback Generator
 * Generates 3 rich personalized variations based on inputs when offline or without API key.
 */
function generateFallbackVariations({ occasion, relationship, recipientName, senderName, style, memories, language, length }) {
  const name = recipientName || "my favorite person";
  const sender = senderName || "With love";
  const mem = memories ? ` I still treasure ${memories}.` : "";
  const lang = (language || "en").toLowerCase();

  // English Fallbacks
  const enVariations = {
    Romantic: [
      {
        title: "Poetic & Heartfelt",
        text: `To my dearest ${name}, every day with you feels like a melody only our hearts can hear.${mem} On this special ${occasion}, I want you to know how deeply you are cherished, today and for all the tomorrows to come. Happy ${occasion}, my love! 🌹✨❤️ — Forever yours, ${sender}`,
        tone: "Romantic",
        estimatedWords: 52
      },
      {
        title: "Passionate & Sweet",
        text: `Happy ${occasion}, gorgeous ${name}! You brought light into places I didn't even know were dark.${mem} Walking through life holding your hand is my greatest joy. Here's to us, our endless laughs, and a lifetime of love. 🥂💍💖 — All my love, ${sender}`,
        tone: "Passionate",
        estimatedWords: 48
      },
      {
        title: "Short & Captivating",
        text: `Dearest ${name}, you are my sun, my moon, and all my stars.${mem} Happy ${occasion}! Can't wait to celebrate another year of magic together. 🌟💌 — With all my heart, ${sender}`,
        tone: "Short & Sweet",
        estimatedWords: 33
      }
    ],
    Funny: [
      {
        title: "Playful Roast & Toast",
        text: `Happy ${occasion}, ${name}! Another year of putting up with each other and pretending we have our lives figured out.${mem} I promised myself I wouldn't roast you today... but let's be honest, you're lucky to have a ${relationship} as awesome as me! Stay legendary! 🎂🚀😂 — Cheers, ${sender}`,
        tone: "Funny & Playful",
        estimatedWords: 54
      },
      {
        title: "Witty & Wild",
        text: `Wishing the happiest ${occasion} to my official partner in bad decisions, ${name}!${mem} May your day be packed with treats, zero responsibilities, and zero unapproved photos on social media! 🥳🍕🍾 — Your co-conspirator, ${sender}`,
        tone: "Witty",
        estimatedWords: 44
      },
      {
        title: "Quick Laugh",
        text: `Happy ${occasion}, ${name}! You're not getting older, you're just leveling up! (Or accumulating more funny quirks). Love you lots! 🎮🎈🤪 — ${sender}`,
        tone: "Short & Humorous",
        estimatedWords: 29
      }
    ],
    "Heart-touching": [
      {
        title: "Deeply Moving & Warm",
        text: `Dearest ${name}, some people make the world brighter just by existing, and you are truly one of them.${mem} On this ${occasion}, I wish you boundless peace, joyful surprises, and all the dreams your heart has been whispering. Thank you for being such a wonderful ${relationship}. 💫🌸✨ — Always here for you, ${sender}`,
        tone: "Heart-touching",
        estimatedWords: 56
      },
      {
        title: "Inspiring & Gentle",
        text: `Happy ${occasion}, ${name}! Life is composed of little moments that leave permanent warmth in our souls, and so many of mine belong to you.${mem} May this year bring you deep contentment and breathtaking blessings. 🌻🕊️ — With immense gratitude, ${sender}`,
        tone: "Gentle & Inspiring",
        estimatedWords: 48
      },
      {
        title: "Sweet Blessing",
        text: `To beloved ${name}, may every step ahead bring you closer to genuine joy.${mem} Happy ${occasion}! You deserve the sweetest celebrations today and always. 💖🎉 — Warmly, ${sender}`,
        tone: "Short & Soulful",
        estimatedWords: 32
      }
    ]
  };

  // Hindi Fallbacks
  const hiVariations = [
    {
      title: "दिल से शुभकामनाएं (Heartfelt)",
      text: `प्रिय ${name}, इस पावन ${occasion} पर मेरी तरफ से आपको ढेर सारा प्यार और शुभकामनाएं।${mem} ईश्वर से यही प्रार्थना है कि आपके जीवन में सदैव खुशियां, अच्छी सेहत और कामयाबी बनी रहे। खुशियों भरा दिन मुबारक हो! 🌸✨🙏 — आपका/आपकी ${sender}`,
      tone: "Emotional & Blessed",
      estimatedWords: 45
    },
    {
      title: "उमंग और मिठास (Vibrant & Sweet)",
      text: `जन्मदिन और खुशियों की ढेर सारी बधाइयाँ, ${name}! आप जैसे प्यारे ${relationship} का हमारे जीवन में होना सच में ईश्वर का एक अनमोल तोहफा है।${mem} सदा मुस्कुराते रहो! 🎂🎉💖 — स्नेह सहित, ${sender}`,
      tone: "Sweet & Joyful",
      estimatedWords: 40
    },
    {
      title: "संक्षिप्त और सुंदर (Short & Touching)",
      text: `प्यारे ${name}, हर दिन आपके लिए नई उम्मीदें और अनगिनत खुशियां लेकर आए। ${occasion} की हार्दिक शुभकामनाएं! 🌹💫 — हमेशा आपका, ${sender}`,
      tone: "Short & Sweet",
      estimatedWords: 30
    }
  ];

  // Hinglish Fallbacks
  const hinglishVariations = [
    {
      title: "Super Warm & Friendly",
      text: `Happy ${occasion}, ${name}! Yaar, you truly are the sweetest person ever.${mem} Wish karta hu ki yeh saal tumhare liye super exciting, full of blessings aur non-stop smiles leke aaye. Party hard and stay blessed! 🎂🥳🌟 — Tera best buddy, ${sender}`,
      tone: "Warm Hinglish",
      estimatedWords: 48
    },
    {
      title: "Dil Se Connected & Fun",
      text: `A very happy ${occasion} to you, ${name}! Sach me, life kitni boring hoti agar tum jaisa ${relationship} nahi hota.${mem} Aaj ke din sirf chill karo, cake khao aur enjoy karo! Always got your back! 🍕💃🚀 — Cheers, ${sender}`,
      tone: "Playful Hinglish",
      estimatedWords: 46
    },
    {
      title: "Short & Impactful",
      text: `Dear ${name}, happy ${occasion}! May all your dreams turn into reality this year. Dil se dua hai for your success and happiness! 💫🥂❤️ — Lots of love, ${sender}`,
      tone: "Short Hinglish",
      estimatedWords: 34
    }
  ];

  if (lang === 'hi') {
    return hiVariations;
  }
  if (lang === 'hinglish') {
    return hinglishVariations;
  }

  // Return style-matched English variations or default
  const styleKey = Object.keys(enVariations).find(k => k.toLowerCase() === (style || '').toLowerCase()) || "Heart-touching";
  return enVariations[styleKey] || enVariations["Heart-touching"];
}

module.exports = {
  callGeminiAPI,
  generateFallbackVariations
};
