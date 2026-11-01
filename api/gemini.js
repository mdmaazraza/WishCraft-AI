/**
 * Wish Yours — Google Gemini AI Integration Service
 * Uses native HTTPS to interact with Google Gemini API securely on the backend.
 * Provides occasion-aware, emotionally intelligent fallback synthesis.
 */

const https = require('https');
const { resolveOccasion } = require('../data/occasions');
const { cleanText } = require('../data/text_cleaner');

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
        temperature: 0.75,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1400,
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
            const jsonResult = JSON.parse(rawText);
            resolve(jsonResult);
          } catch (e) {
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
 * Intelligent Emotion-Aware Fallback Generator
 * Generates 3 rich personalized variations based strictly on the occasion's emotional reality.
 */
function generateFallbackVariations({ occasion, relationship, recipientName, senderName, style, memories, language, length }) {
  const occ = resolveOccasion(occasion);
  const name = recipientName || "my friend";
  const { isMdRazaSender, getSenderSignatureInline } = require('../data/attribution');
  const sender = isMdRazaSender(senderName) ? getSenderSignatureInline(senderName, relationship) : (senderName || "With warmth");
  const rel = relationship || "friend";
  const cleanedMem = memories ? cleanText(memories).improved : "";
  const mem = cleanedMem ? ` ${cleanedMem}` : "";
  const lang = (language || "en").toLowerCase();

  // 1. SORRY / APOLOGY FALLBACKS (Zero celebratory words!)
  if (occ.id === 'sorry') {
    if (lang === 'hi') {
      return [
        {
          id: "1",
          title: "सच्चे दिल से माफ़ी (Heartfelt & Sincere)",
          text: `प्रिय ${name}, मैं यह संदेश पूरे दिल से माफ़ी मांगने के लिए लिख रहा हूँ।${mem} मुझसे जो गलती हुई, उसका मुझे गहरा अफ़सोस है। आपका साथ और आपकी भावनाएं मेरे लिए बहुत अनमोल हैं। उम्मीद है कि आप मेरी भूल को माफ़ कर पाएंगे और हम फिर से सब ठीक कर पाएंगे। — आपका/आपकी ${sender}`,
          tone: "Sincere & Humble",
          estimatedWords: 46
        },
        {
          id: "2",
          title: "गंभीर और विनम्र (Reflective & Respectful)",
          text: `प्यारे ${name}, शब्दों से गलती मिटाई तो नहीं जा सकती, लेकिन मैं अपनी भूल पूरी ज़िम्मेदारी के साथ स्वीकार करता हूँ।${mem} मैं कभी भी आपका दिल नहीं दुखाना चाहता था। जब भी आपका मन शांत हो, मुझे बात करने का एक मौका ज़रूर देना। — दिल से, ${sender}`,
          tone: "Respectful & Accountable",
          estimatedWords: 42
        },
        {
          id: "3",
          title: "संक्षिप्त और सच्चा (Short & Genuine)",
          text: `प्रिय ${name}, मुझे अपनी गलती के लिए सच में बहुत अफ़सोस है।${mem} हमारा यह रिश्ता मेरे लिए दुनिया में सबसे कीमती है। कृपया मुझे माफ़ कर दीजिए। — ${sender}`,
          tone: "Short & Sincere",
          estimatedWords: 30
        }
      ];
    }

    if (lang === 'hinglish') {
      return [
        {
          id: "1",
          title: "Dil Se Sorry (Genuine & Vulnerable)",
          text: `Dear ${name}, I am truly, deeply sorry.${mem} Mujhse jo galti hui uska mujhe sach me bohot regret hai. Aapka aur mera ${rel} ka rishta mere liye bohot important hai, and I hate that I caused you pain. I really want to make things right whenever you're ready. Please forgive me. — ${sender}`,
          tone: "Vulnerable & Sincere",
          estimatedWords: 52
        },
        {
          id: "2",
          title: "Honest & Accountable",
          text: `Hi ${name}, I wanted to reach out and take full responsibility for what happened.${mem} No excuses, I messed up and I feel terrible about it. You mean too much to me for silence to stand between us. I promise to do better. — With genuine remorse, ${sender}`,
          tone: "Accountable",
          estimatedWords: 46
        },
        {
          id: "3",
          title: "Short & Sincere",
          text: `Dearest ${name}, I am truly sorry.${mem} Our bond means the world to me and I hope we can move past this. Sincerely hoping for your forgiveness. — ${sender}`,
          tone: "Short & Heartfelt",
          estimatedWords: 30
        }
      ];
    }

    // English Sorry
    const isColleague = rel.toLowerCase().includes('colleague');
    if (isColleague) {
      return [
        {
          id: "1",
          title: "Professional & Accountable",
          text: `Dear ${name}, I am writing to sincerely apologize for the recent miscommunication and any disruption it may have caused.${mem} I hold our professional working relationship in high regard and take full accountability for this mistake. I am committed to making sure things are handled smoothly moving forward. — Sincerely, ${sender}`,
          tone: "Professional & Sincere",
          estimatedWords: 49
        },
        {
          id: "2",
          title: "Direct & Collaborative",
          text: `Dear ${name}, please accept my sincere apology regarding what occurred.${mem} I greatly value your partnership as a ${rel} and regret any inconvenience caused. Let's touch base soon so we can ensure everything is aligned. — Best regards, ${sender}`,
          tone: "Courteous & Direct",
          estimatedWords: 40
        },
        {
          id: "3",
          title: "Short & Professional",
          text: `Dear ${name}, I apologize sincerely for my error.${mem} I appreciate your patience and look forward to continuing our positive collaboration. — ${sender}`,
          tone: "Concise",
          estimatedWords: 24
        }
      ];
    }

    return [
      {
        id: "1",
        title: "Deeply Sincere & Vulnerable",
        text: `Dearest ${name}, I am reaching out from the bottom of my heart to apologize.${mem} It hurts me deeply knowing that my words or actions caused you pain. You mean far too much to me for my pride to stand in the way. I take full responsibility, and I truly want to make things right. Whenever you are ready, I am here. — With love and sincere remorse, ${sender}`,
        tone: "Deeply Sincere",
        estimatedWords: 64
      },
      {
        id: "2",
        title: "Honest & Reconciliation-Focused",
        text: `Dear ${name}, I am truly sorry for letting you down.${mem} I know an apology doesn't instantly erase what happened, but I want you to know how deeply I value our ${rel}. I promise to learn from this and treat our connection with the care it deserves. Hoping for your forgiveness. — Warmly, ${sender}`,
        tone: "Humble & Reflective",
        estimatedWords: 52
      },
      {
        id: "3",
        title: "Short & Meaningful",
        text: `Dearest ${name}, I am genuinely sorry.${mem} Our relationship means everything to me, and I hate knowing I caused a rift between us. I hope you can find it in your heart to forgive me. — Always yours, ${sender}`,
        tone: "Heartfelt",
        estimatedWords: 36
      }
    ];
  }

  // 2. THANK YOU FALLBACKS
  if (occ.id === 'thank_you') {
    if (lang === 'hi') {
      return [
        {
          id: "1",
          title: "दिल से आभार (Heartfelt Gratitude)",
          text: `प्रिय ${name}, आपके इस स्नेह और सहयोग के लिए मैं तहे दिल से आपका धन्यवाद करता हूँ।${mem} आपने जिस तरह मेरा साथ दिया, वह मेरे लिए अनमोल है। आपकी अच्छाई और बड़प्पन को मैं हमेशा याद रखूँगा। बहुत-बहुत शुक्रिया! 🌸🙏 — कृतज्ञता सहित, ${sender}`,
          tone: "Grateful & Warm",
          estimatedWords: 46
        },
        {
          id: "2",
          title: "स्नेह और कृतज्ञता (Warm Appreciation)",
          text: `प्यारे ${name}, आपकी मदद और इस खूबसूरत साथ के लिए बहुत शुक्रिया।${mem} आप जैसे सच्चे ${rel} का जीवन में होना एक बहुत बड़ा आशीर्वाद है। — ढेर सारा प्यार, ${sender}`,
          tone: "Appreciative",
          estimatedWords: 34
        },
        {
          id: "3",
          title: "संक्षिप्त धन्यवाद (Short Thanks)",
          text: `प्रिय ${name}, आपकी हर मदद और अपनेपन के लिए दिल से शुक्रिया।${mem} आप सच में बहुत खास हैं। 🌸 — ${sender}`,
          tone: "Short & Sweet",
          estimatedWords: 24
        }
      ];
    }

    return [
      {
        id: "1",
        title: "Deeply Grateful & Moving",
        text: `Dearest ${name}, I wanted to take a moment to express my deepest gratitude to you.${mem} Your kindness, support, and generosity left a lasting mark on my heart. Having someone as wonderful as you in my corner as a ${rel} is a true blessing. Thank you for simply being you. 🌸🙏✨ — With immense appreciation, ${sender}`,
        tone: "Deeply Grateful",
        estimatedWords: 56
      },
      {
        id: "2",
        title: "Warm & Heartfelt",
        text: `Dear ${name}, thank you so much for your thoughtfulness.${mem} It's rare to meet people who bring so much genuine care into the world, and you are definitely one of them. I appreciate everything you've done more than words can say. 🌻💫 — Warmest thanks, ${sender}`,
        tone: "Warm Appreciation",
        estimatedWords: 48
      },
      {
        id: "3",
        title: "Short & Sweet",
        text: `Dearest ${name}, thank you from the bottom of my heart!${mem} Your kindness means the world to me. Grateful for you every day! 🌸💖 — ${sender}`,
        tone: "Concise Gratitude",
        estimatedWords: 28
      }
    ];
  }

  // 3. FAREWELL FALLBACKS
  if (occ.id === 'farewell') {
    if (lang === 'hi') {
      return [
        {
          id: "1",
          title: "हार्दिक विदाई और शुभकामनाएं",
          text: `प्रिय ${name}, आपके साथ बिताए हर पल की खूबसूरत यादें हमेशा हमारे दिलों में रहेंगी।${mem} आपके नए सफर और नए मुकाम के लिए हमारी तरफ से ढेर सारी शुभकामनाएं। हमेशा खुश और सफल रहें! ✈️🌸 — ${sender}`,
          tone: "Bittersweet & Inspiring",
          estimatedWords: 38
        },
        {
          id: "2",
          title: "स्नेहपूर्ण विदाई",
          text: `प्रिय ${name}, अलविदा कहना कभी आसान नहीं होता, खासकर आप जैसे प्यारे ${rel} को।${mem} आपके भविष्य के हर कदम पर सफलता और खुशियां आपके कदम चूमती रहें। ✈️💫 — ढेर सारे प्यार के साथ, ${sender}`,
          tone: "Warm & Hopeful",
          estimatedWords: 36
        },
        {
          id: "3",
          title: "संक्षिप्त विदाई संदेश",
          text: `प्रिय ${name}, आपके नए सफर के लिए हार्दिक शुभकामनाएं!${mem} हम सब आपको बहुत याद करेंगे। Bon Voyage! 🌍✨ — ${sender}`,
          tone: "Short Farewell",
          estimatedWords: 24
        }
      ];
    }

    return [
      {
        id: "1",
        title: "Bittersweet & Hopeful",
        text: `Dearest ${name}, it is bittersweet to see you embark on your next adventure, but I couldn't be more excited for what lies ahead for you.${mem} Thank you for all the laughter, support, and wonderful memories we shared as ${rel}s. You will be sorely missed, but I know you're going to achieve incredible things! ✈️🌟💫 — Wishing you the very best, ${sender}`,
        tone: "Bittersweet & Inspiring",
        estimatedWords: 58
      },
      {
        id: "2",
        title: "Fond Memories & Well Wishes",
        text: `Dear ${name}, saying goodbye is never easy, especially to someone who brought so much energy and warmth to every room.${mem} Wishing you smooth transitions, boundless success, and endless happiness in this new chapter. Keep in touch! 🥂👋 — Best always, ${sender}`,
        tone: "Warm & Hopeful",
        estimatedWords: 46
      },
      {
        id: "3",
        title: "Short & Heartfelt Farewell",
        text: `Dearest ${name}, wishing you the absolute best on your new journey!${mem} You will always have a friend in me no matter the distance. Bon voyage! 🌍✨ — ${sender}`,
        tone: "Short Farewell",
        estimatedWords: 30
      }
    ];
  }

  // 4. CONDOLENCE & SYMPATHY FALLBACKS (Solemn & gentle)
  if (occ.id === 'sympathy') {
    if (lang === 'hi') {
      return [
        {
          id: "1",
          title: "हार्दिक संवेदना और सांत्वना",
          text: `प्रिय ${name}, इस कठिन और दुखद समय में मेरी गहरी संवेदनाएं आपके और आपके परिवार के साथ हैं।${mem} ईश्वर दिवंगत आत्मा को शांति प्रदान करें और आपको इस असहनीय दुख को सहने का संबल दें। हम हमेशा आपके साथ हैं। 🕊️🕯️ — ${sender}`,
          tone: "Solemn & Comforting",
          estimatedWords: 48
        },
        {
          id: "2",
          title: "शांति और संबल की प्रार्थना",
          text: `प्रिय ${name}, इस अपार क्षति पर मैं अपनी गहरी संवेदना व्यक्त करता हूँ।${mem} ईश्वर से प्रार्थना है कि इस मुश्किल समय में आपको और आपके परिवार को शांति और धैर्य मिले। 🕊️ — सादर, ${sender}`,
          tone: "Gentle & Respectful",
          estimatedWords: 38
        },
        {
          id: "3",
          title: "संक्षिप्त संवेदना संदेश",
          text: `प्रिय ${name}, आपके इस दुखद समय में मेरी हार्दिक संवेदनाएं। ईश्वर आत्मा को शांति दें। 🕯️ — ${sender}`,
          tone: "Respectful",
          estimatedWords: 22
        }
      ];
    }

    if (lang === 'hinglish') {
      return [
        {
          id: "1",
          title: "Deepest Condolences & Support",
          text: `Dear ${name}, is mushkil waqt mein meri dil se sympathy aapke aur aapki family ke saath hai.${mem} Bhagwan aapko is tough time mein himmat aur peace de. We are always here for you. 🕊️🕯️ — ${sender}`,
          tone: "Solemn & Comforting",
          estimatedWords: 44
        },
        {
          id: "2",
          title: "Thoughts & Prayers",
          text: `Dearest ${name}, words feel so small right now, but please know you are in my thoughts.${mem} Wishing you peace and strength in the days ahead. 🕊️ — Warmly, ${sender}`,
          tone: "Gentle & Respectful",
          estimatedWords: 34
        },
        {
          id: "3",
          title: "Short Message of Solace",
          text: `Dear ${name}, thinking of you with deep care.${mem} May loving memories bring you peace. 🕯️ — Sincerely, ${sender}`,
          tone: "Respectful",
          estimatedWords: 20
        }
      ];
    }

    return [
      {
        id: "1",
        title: "Comforting & Compassionate",
        text: `Dear ${name}, my heart goes out to you during this difficult time of loss.${mem} Please know that you are wrapped in my thoughts and prayers. May gentle memories bring comfort, and may you find solace in the love of those around you. I am here for you for whatever you need. 🕊️🕯️ — With deepest sympathy, ${sender}`,
        tone: "Solemn & Comforting",
        estimatedWords: 56
      },
      {
        id: "2",
        title: "Quiet Presence & Strength",
        text: `Dearest ${name}, words feel so small at a time like this, but I wanted to send my sincere condolences.${mem} Wishing you peace, gentle moments of comfort, and strength in the days ahead. Holding you in my heart. 🕊️ — With warm sympathy, ${sender}`,
        tone: "Gentle & Respectful",
        estimatedWords: 44
      },
      {
        id: "3",
        title: "Short Message of Solace",
        text: `Dear ${name}, thinking of you with deep care and sympathy.${mem} May loving memories bring you comfort and peace. 🕯️ — Sincerely, ${sender}`,
        tone: "Respectful",
        estimatedWords: 24
      }
    ];
  }

  // 5. ROMANTIC / ANNIVERSARY / VALENTINE FALLBACKS
  if (occ.category === 'romantic') {
    return [
      {
        id: "1",
        title: "Poetic & Heartfelt Love",
        text: `To my beloved ${name}, every day with you feels like a melody only our hearts can hear.${mem} On this special ${occ.name}, I want you to know how deeply you are cherished, today and for all the tomorrows to come. Happy ${occ.name}, my love! 🌹✨❤️ — Forever yours, ${sender}`,
        tone: "Romantic",
        estimatedWords: 52
      },
      {
        id: "2",
        title: "Passionate & Tender",
        text: `Happy ${occ.name}, gorgeous ${name}! You brought light into places I didn't even know were dark.${mem} Walking through life holding your hand is my greatest joy. Here's to us, our endless laughs, and a lifetime of love. 🥂💍💖 — All my love, ${sender}`,
        tone: "Passionate",
        estimatedWords: 48
      },
      {
        id: "3",
        title: "Short & Captivating",
        text: `Dearest ${name}, you are my sun, my moon, and all my stars.${mem} Happy ${occ.name}! Can't wait to celebrate another year of magic together. 🌟💌 — With all my heart, ${sender}`,
        tone: "Short & Sweet",
        estimatedWords: 33
      }
    ];
  }

  // 6. GENERAL CELEBRATORY (Birthday, Congratulations, Friendship)
  if (lang === 'hi') {
    return [
      {
        id: "1",
        title: "दिल से शुभकामनाएं (Heartfelt Celebration)",
        text: `प्रिय ${name}, इस पावन ${occ.name} पर मेरी तरफ से आपको ढेर सारा प्यार और शुभकामनाएं।${mem} ईश्वर से यही प्रार्थना है कि आपके जीवन में सदैव खुशियां, अच्छी सेहत और कामयाबी बनी रहे। 🌸✨🙏 — आपका/आपकी ${sender}`,
        tone: "Emotional & Blessed",
        estimatedWords: 45
      },
      {
        id: "2",
        title: "उमंग और मिठास (Vibrant & Sweet)",
        text: `खुशियों की ढेर सारी बधाइयाँ, ${name}! आप जैसे प्यारे ${rel} का हमारे जीवन में होना सच में ईश्वर का एक अनमोल तोहफा है।${mem} सदा मुस्कुराते रहो! 🎂🎉💖 — स्नेह सहित, ${sender}`,
        tone: "Sweet & Joyful",
        estimatedWords: 38
      },
      {
        id: "3",
        title: "संक्षिप्त और सुंदर (Short & Touching)",
        text: `प्यारे ${name}, हर दिन आपके लिए नई उम्मीदें और अनगिनत खुशियां लेकर आए। ${occ.name} की हार्दिक शुभकामनाएं! 🌹💫 — हमेशा आपका, ${sender}`,
        tone: "Short & Sweet",
        estimatedWords: 28
      }
    ];
  }

  if (lang === 'hinglish') {
    return [
      {
        id: "1",
        title: "Super Warm & Friendly",
        text: `Happy ${occ.name}, ${name}! Yaar, you truly are the sweetest person ever.${mem} Wish karta hu ki yeh moment tumhare liye super exciting, full of blessings aur non-stop smiles leke aaye. Stay blessed! 🎂🥳🌟 — Tera best buddy, ${sender}`,
        tone: "Warm Hinglish",
        estimatedWords: 46
      },
      {
        id: "2",
        title: "Dil Se Connected & Fun",
        text: `A very happy ${occ.name} to you, ${name}! Sach me, life kitni boring hoti agar tum jaisa ${rel} nahi hota.${mem} Keep shining bright and enjoying life to the fullest! Always got your back! 🚀💃 — Cheers, ${sender}`,
        tone: "Playful Hinglish",
        estimatedWords: 44
      },
      {
        id: "3",
        title: "Short & Impactful",
        text: `Dear ${name}, happy ${occ.name}! May all your dreams turn into reality. Dil se dua hai for your success and happiness! 💫🥂❤️ — Lots of love, ${sender}`,
        tone: "Short Hinglish",
        estimatedWords: 32
      }
    ];
  }

  // Standard English Celebration
  return [
    {
      id: "1",
      title: "Deeply Moving & Warm",
      text: `Dearest ${name}, some people make the world brighter just by existing, and you are truly one of them.${mem} On this ${occ.name}, I wish you boundless peace, joyful surprises, and all the dreams your heart has been whispering. Thank you for being such a wonderful ${rel}. 💫🌸✨ — Always here for you, ${sender}`,
      tone: "Heart-touching",
      estimatedWords: 56
    },
    {
      id: "2",
      title: "Inspiring & Gentle",
      text: `Happy ${occ.name}, ${name}! Life is composed of little moments that leave permanent warmth in our souls, and so many of mine belong to you.${mem} May this chapter bring you deep contentment and breathtaking blessings. 🌻🕊️ — With immense gratitude, ${sender}`,
      tone: "Gentle & Inspiring",
      estimatedWords: 48
    },
    {
      id: "3",
      title: "Sweet Blessing",
      text: `To beloved ${name}, may every step ahead bring you closer to genuine joy.${mem} Happy ${occ.name}! You deserve all the sweetest things today and always. 💖🎉 — Warmly, ${sender}`,
      tone: "Short & Soulful",
      estimatedWords: 32
    }
  ];
}

module.exports = {
  callGeminiAPI,
  generateFallbackVariations
};
