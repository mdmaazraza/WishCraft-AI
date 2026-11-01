/**
 * Wish Yours — Centralized Occasion & Emotion Intelligence Engine
 * Defines emotional contexts, guidance, forbidden keywords, relationship nuances,
 * UI copy, and fallback templates for every occasion.
 */

const OCCASIONS = {
  "birthday": {
    "id": "birthday",
    "name": "Birthday",
    "displayName": "Birthday",
    "aliases": [
      "birthday",
      "bday",
      "birth day",
      "janamdin"
    ],
    "category": "celebration",
    "isCelebration": true,
    "emoji": "🎂",
    "icon": "🎉",
    "creationLabel": "Create a Birthday Wish",
    "previewHeading": "Happy Birthday, {name}!",
    "messageType": "Birthday Wish",
    "emotionalPurpose": "celebration",
    "allowedEmotions": [
      "Heartfelt",
      "Cheerful",
      "Funny & Playful",
      "Sweet & Loving",
      "Nostalgic",
      "Emotional",
      "Inspirational",
      "Playful"
    ],
    "defaultEmotion": "Heartfelt",
    "emptyPreviewText": "Your personalized birthday celebration message will appear here...",
    "generateButtonLabel": "Create Birthday Wish ✨",
    "recommendedTemplate": "cake",
    "emotionalContext": "celebratory, joyful, warm, uplifting, full of hope for the year ahead",
    "guidance": "Celebrate the recipient reaching a new milestone in life. Highlight their unique personality, wish them health, happiness, success, and joyful adventures.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolences",
      "grief",
      "farewell",
      "goodbye"
    ],
    "headlinePrefix": "Happy Birthday to",
    "cardBadge": "Birthday Celebration 🎂",
    "envelopeSealText": "WISH",
    "ctaText": "Blow the Candles 🎂",
    "studioPrompt": "Make their birthday unforgettable with candles, memories, and personal love.",
    "actionBoxPrompt": "Loved this birthday celebration? Create an unforgettable digital greeting in 2 minutes.",
    "ambientEffect": "balloons",
    "greetingModule": "cake",
    "musicTrack": "birthday_celebration",
    "relationshipNuance": {
      "Girlfriend": "Deeply affectionate, romantic, praising her smile and beauty, wishing a year full of romantic memories together.",
      "Boyfriend": "Loving, playful, expressing how special he is and how lucky you feel to have him in your life.",
      "Wife": "Deeply emotional, romantic, thanking her for being the pillar of your home and heart.",
      "Husband": "Loving, appreciative, honoring him as your partner and celebrating another year of shared life.",
      "Best Friend": "Playful, vibrant, bringing up shared craziness, inside jokes, and celebrating your unbreakable bond.",
      "Friend": "Warm, cheerful, enthusiastic, wishing good vibes and great times ahead.",
      "Colleague": "Respectful, cheerful, professional yet warm, wishing career success and a great year ahead.",
      "Teacher": "Respectful, admiring, thanking them for shaping minds and wishing a year of health, wisdom, and joy.",
      "Mother": "Tender, deeply grateful, honoring her unconditional love, selflessness, and warmth.",
      "Father": "Respectful, admiring, loving, thanking him for his guidance, strength, and support.",
      "Brother": "Playful banter mixed with genuine sibling warmth and loyalty.",
      "Sister": "Sweet, affectionate, perhaps playful, celebrating her radiance and sisterly bond.",
      "Other": "Warm, positive, uplifting."
    },
    "tones": [
      "Heartfelt",
      "Cheerful",
      "Funny & Playful",
      "Sweet & Loving",
      "Nostalgic",
      "Emotional",
      "Inspirational",
      "Playful"
    ]
  },
  "anniversary": {
    "id": "anniversary",
    "name": "Wedding Anniversary",
    "displayName": "Anniversary",
    "aliases": [
      "anniversary",
      "wedding anniversary",
      "marriage anniversary",
      "salgirah"
    ],
    "category": "romantic",
    "isCelebration": true,
    "emoji": "💍",
    "icon": "🥂",
    "creationLabel": "Create an Anniversary Greeting",
    "previewHeading": "Happy Anniversary, {name}!",
    "messageType": "Anniversary Greeting",
    "emotionalPurpose": "romantic_celebration",
    "allowedEmotions": [
      "Deeply Romantic",
      "Deep Love",
      "Heartfelt",
      "Devoted & Loyal",
      "Grateful",
      "Nostalgic",
      "Soulmate",
      "Poetic"
    ],
    "defaultEmotion": "Deeply Romantic",
    "emptyPreviewText": "Your heartfelt anniversary love letter will appear here...",
    "generateButtonLabel": "Create Anniversary Greeting 💍",
    "recommendedTemplate": "envelope",
    "emotionalContext": "romantic, loving, appreciative, nostalgic, committed, deeply intimate",
    "guidance": "Honor the enduring journey of love, partnership, and shared history. Celebrate milestones, shared growth, and lifelong promises.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "grief",
      "condolence",
      "breakup",
      "farewell"
    ],
    "headlinePrefix": "Celebrating Our Love,",
    "cardBadge": "Anniversary Milestone 💍",
    "envelopeSealText": "LOVE",
    "ctaText": "Break Wax Seal 💌",
    "studioPrompt": "Celebrate your shared journey with a wax-sealed love letter and cherished photos.",
    "actionBoxPrompt": "Inspired by this anniversary greeting? Celebrate your own love story today.",
    "ambientEffect": "hearts",
    "greetingModule": "envelope",
    "musicTrack": "romantic_melody",
    "relationshipNuance": {
      "Wife": "Deeply devoted, poetic, thanking her for being your greatest adventure and home.",
      "Husband": "Loving, proud, declaring your enduring respect and shared partnership.",
      "Girlfriend": "Sweet, romantic, celebrating every month/year of growing closer.",
      "Boyfriend": "Affectionate, warm, celebrating memories and promises.",
      "Friend": "Warmly congratulating a couple on their milestone with joy.",
      "Other": "Warm and admiring celebration of love."
    },
    "tones": [
      "Deeply Romantic",
      "Deep Love",
      "Heartfelt",
      "Devoted & Loyal",
      "Grateful",
      "Nostalgic",
      "Soulmate",
      "Poetic"
    ]
  },
  "sorry": {
    "id": "sorry",
    "name": "Sorry",
    "displayName": "Apology",
    "aliases": [
      "sorry",
      "apology",
      "apologize",
      "forgive me",
      "maafi"
    ],
    "category": "apology",
    "isCelebration": false,
    "emoji": "🥺",
    "icon": "🕊️",
    "creationLabel": "Create an Apology",
    "previewHeading": "A Heartfelt Message for {name}",
    "messageType": "Apology",
    "emotionalPurpose": "reconciliation",
    "allowedEmotions": [
      "Sincere & Apologetic",
      "Deeply Apologetic",
      "Regretful",
      "Gentle & Healing",
      "Deeply Accountable",
      "Humble",
      "Vulnerable",
      "Asking Forgiveness",
      "I Miss You",
      "I Want to Fix Things",
      "Deep & Meaningful"
    ],
    "defaultEmotion": "Deeply Apologetic",
    "emptyPreviewText": "Your sincere, thoughtful message of apology will appear here...",
    "generateButtonLabel": "Create Apology Message 🕊️",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "humble, sincere, deeply remorseful, accountable, gentle, longing for forgiveness and reconciliation — NEVER celebratory",
    "guidance": "Take genuine accountability, apologize from the heart without defensiveness, acknowledge the hurt caused, and express longing to heal the relationship. NEVER USE WORDS LIKE CELEBRATE, PARTY, HAPPY, CONGRATULATIONS, CHEERS, OR BIRTHDAY.",
    "forbiddenKeywords": [
      "celebrate",
      "celebration",
      "party",
      "cheers",
      "hurray",
      "happy",
      "yay",
      "festive",
      "cake",
      "candles",
      "congratulations",
      "happy sorry"
    ],
    "headlinePrefix": "A Sincere Apology For",
    "cardBadge": "Heartfelt Apology 🕊️",
    "envelopeSealText": "FORGIVE",
    "ctaText": "Open Sincere Message 🕊️",
    "studioPrompt": "Mend what matters with honest accountability, gentle words, and sincere care.",
    "actionBoxPrompt": "Need to say sorry from the heart? Send a thoughtful, sincere message in 2 minutes.",
    "ambientEffect": "calm_stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Best Friend": "Deeply humble, acknowledging how much you value their friendship above any argument, wishing to restore the bond.",
      "Friend": "Sincere, gentle, expressing regret for the misunderstanding and wanting things to be right.",
      "Girlfriend": "Vulnerable, deeply accountable, affirming your love and regretting causing her sadness.",
      "Boyfriend": "Honest, tender, expressing sincere regret and asking for a chance to talk through it.",
      "Wife": "Deeply loving and accountable, asking forgiveness and prioritizing her feelings and trust.",
      "Husband": "Sincere, peaceful, expressing regret and reaffirming your unity and love.",
      "Colleague": "Professional, accountable, acknowledging the workplace oversight and committing to smooth workflow.",
      "Teacher": "Deeply respectful, humble, acknowledging their guidance and apologizing sincerely.",
      "Other": "Sincere, respectful, and genuinely apologetic."
    },
    "tones": [
      "Sincere & Apologetic",
      "Deeply Apologetic",
      "Regretful",
      "Gentle & Healing",
      "Deeply Accountable",
      "Humble",
      "Vulnerable",
      "Asking Forgiveness",
      "I Miss You",
      "I Want to Fix Things",
      "Deep & Meaningful"
    ]
  },
  "romantic": {
    "id": "romantic",
    "name": "Valentine's Day",
    "displayName": "Love Letter",
    "aliases": [
      "valentine",
      "valentine's day",
      "romantic",
      "love",
      "pyaar"
    ],
    "category": "romantic",
    "isCelebration": true,
    "emoji": "🌹",
    "icon": "💖",
    "creationLabel": "Create a Love Message",
    "previewHeading": "For Someone Special, {name}",
    "messageType": "Love Letter",
    "emotionalPurpose": "romance",
    "allowedEmotions": [
      "Deeply Romantic",
      "Deep Love",
      "Heartfelt",
      "Passionate",
      "Sweet & Playful",
      "Devoted & Loyal",
      "Poetic"
    ],
    "defaultEmotion": "Deeply Romantic",
    "emptyPreviewText": "Your intimate love letter will appear here...",
    "generateButtonLabel": "Create Love Letter 💖",
    "recommendedTemplate": "envelope",
    "emotionalContext": "loving, affectionate, romantic, tender, passionate",
    "guidance": "Express romantic affection, appreciation for their presence in your life, and the beauty of your connection.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolence",
      "farewell"
    ],
    "headlinePrefix": "To My Sweetheart,",
    "cardBadge": "Love Letter 💖",
    "envelopeSealText": "LOVE",
    "ctaText": "Break Wax Seal 💌",
    "studioPrompt": "Craft an intimate love letter with a realistic wax seal and romantic music.",
    "actionBoxPrompt": "Want to surprise your partner? Create a digital love letter.",
    "ambientEffect": "hearts",
    "greetingModule": "envelope",
    "musicTrack": "romantic_melody",
    "relationshipNuance": {
      "Girlfriend": "Poetic, passionate, praising her beauty, personality, and the happiness she brings.",
      "Boyfriend": "Affectionate, warm, making him feel special and deeply loved.",
      "Wife": "Deeply romantic, expressing enduring love and devotion.",
      "Husband": "Loving, appreciative, declaring your ongoing romance.",
      "Other": "Deeply affectionate, warm, and romantic."
    },
    "tones": [
      "Deeply Romantic",
      "Deep Love",
      "Heartfelt",
      "Passionate",
      "Sweet & Playful",
      "Devoted & Loyal",
      "Poetic"
    ]
  },
  "friendship": {
    "id": "friendship",
    "name": "Friendship Day",
    "displayName": "Friendship",
    "aliases": [
      "friendship",
      "friendship day",
      "dosti",
      "best friend"
    ],
    "category": "friendship",
    "isCelebration": true,
    "emoji": "🌟",
    "icon": "🤝",
    "creationLabel": "Create a Friendship Message",
    "previewHeading": "For My Best Friend, {name}",
    "messageType": "Friendship Message",
    "emotionalPurpose": "companionship",
    "allowedEmotions": [
      "Loyal & Authentic",
      "Playful & Crazy",
      "Heartfelt",
      "Sweet",
      "Nostalgic"
    ],
    "defaultEmotion": "Loyal & Authentic",
    "emptyPreviewText": "Your celebration of unbreakable friendship will appear here...",
    "generateButtonLabel": "Create Friendship Message 🌟",
    "recommendedTemplate": "friendship_card",
    "emotionalContext": "friendly, fun, nostalgic, loyal, emotionally connected",
    "guidance": "Celebrate the bond of friendship. Bring up loyalty, shared memories, laughter through tough times, and the joy of having a true confidant.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolence",
      "grief"
    ],
    "headlinePrefix": "To My Wonderful Friend,",
    "cardBadge": "Friendship Celebration 🌟",
    "envelopeSealText": "BFF",
    "ctaText": "Celebrate Our Bond 🤝",
    "studioPrompt": "Celebrate your partner in crime with shared memories and badges of honor.",
    "actionBoxPrompt": "Have an irreplaceable best friend? Celebrate them with a custom greeting.",
    "ambientEffect": "stars",
    "greetingModule": "friendship_card",
    "musicTrack": "celebration_tune",
    "relationshipNuance": {
      "Best Friend": "Unapologetically fun, warm, bringing up inside jokes, celebrating unconditional loyalty.",
      "Friend": "Warm, cheerful, expressing how much you appreciate their companionship.",
      "Other": "Warm, loyal, and friendly."
    },
    "tones": [
      "Loyal & Authentic",
      "Playful & Crazy",
      "Heartfelt",
      "Sweet",
      "Nostalgic"
    ]
  },
  "thank_you": {
    "id": "thank_you",
    "name": "Thank You",
    "displayName": "Thank You",
    "aliases": [
      "thank you",
      "thanks",
      "gratitude",
      "shukriya",
      "dhanyawad"
    ],
    "category": "gratitude",
    "isCelebration": false,
    "emoji": "🙏",
    "icon": "🌸",
    "creationLabel": "Create a Thank You Message",
    "previewHeading": "Thank You, {name}",
    "messageType": "Thank You Message",
    "emotionalPurpose": "gratitude",
    "allowedEmotions": [
      "Deeply Grateful",
      "Warm & Appreciative",
      "Respectful",
      "Cheerful & Sweet",
      "Heartfelt",
      "Invaluable Support"
    ],
    "defaultEmotion": "Deeply Grateful",
    "emptyPreviewText": "Your message of sincere gratitude will appear here...",
    "generateButtonLabel": "Create Thank You Message 🙏",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "deeply appreciative, sincere, warm, honoring someone’s kindness or help",
    "guidance": "Express heartfelt appreciation for support, kindness, presence, or guidance. Make the recipient feel truly valued and seen.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolence",
      "party",
      "cake"
    ],
    "headlinePrefix": "Heartfelt Gratitude To",
    "cardBadge": "Message of Gratitude 🌸",
    "envelopeSealText": "THANKS",
    "ctaText": "Open Thank You Note 🌸",
    "studioPrompt": "Show someone how much their kindness, support, or mentorship meant to you.",
    "actionBoxPrompt": "Someone helped you out? Send a meaningful message of gratitude in 2 minutes.",
    "ambientEffect": "stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Mentor": "Reverent, honoring their guidance, patience, and lifetime lessons.",
      "Colleague": "Professional yet warmly appreciative of their workplace collaboration and assistance.",
      "Teacher": "Deeply reverent, honoring their mentorship, guidance, patience, and lifetime lessons.",
      "Friend": "Warm, sincere, thanking them for showing up and being an anchor.",
      "Best Friend": "Deeply emotional, thanking them for always having your back through thick and thin.",
      "Mother": "Deeply moving, thanking her for endless sacrifices and unconditional support.",
      "Father": "Loving and admiring, honoring his strength and steadfast support.",
      "Other": "Sincere, warm, and genuinely thankful."
    },
    "tones": [
      "Deeply Grateful",
      "Warm & Appreciative",
      "Respectful",
      "Cheerful & Sweet",
      "Heartfelt",
      "Invaluable Support"
    ]
  },
  "congratulations": {
    "id": "congratulations",
    "name": "Congratulations",
    "displayName": "Congratulations",
    "aliases": [
      "congratulations",
      "congrats",
      "achievement",
      "badhai",
      "promotion",
      "graduation"
    ],
    "category": "achievement",
    "isCelebration": true,
    "emoji": "🏆",
    "icon": "🎉",
    "creationLabel": "Create a Congratulations Message",
    "previewHeading": "Congratulations, {name}!",
    "messageType": "Congratulatory Message",
    "emotionalPurpose": "milestone_achievement",
    "allowedEmotions": [
      "Triumphant & Proud",
      "Inspiring",
      "Cheerful & Hype",
      "Dignified",
      "Proud & Cheerful"
    ],
    "defaultEmotion": "Triumphant & Proud",
    "emptyPreviewText": "Your congratulatory message honoring their achievement will appear here...",
    "generateButtonLabel": "Create Congratulations Message 🏆",
    "recommendedTemplate": "friendship_card",
    "emotionalContext": "proud, triumphant, celebratory, admiring, motivating",
    "guidance": "Applaud hard work, celebrate the victory or milestone, express immense pride, and wish them even greater summits ahead.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "grief",
      "condolence",
      "farewell"
    ],
    "headlinePrefix": "Huge Congratulations To",
    "cardBadge": "Milestone Achievement 🏆",
    "envelopeSealText": "BRAVO",
    "ctaText": "Celebrate Victory 🏆",
    "studioPrompt": "Celebrate promotions, graduations, new beginnings, and major wins with honors.",
    "actionBoxPrompt": "Know someone who just crushed a big goal? Celebrate them with a victory card.",
    "ambientEffect": "confetti",
    "greetingModule": "friendship_card",
    "musicTrack": "celebration_tune",
    "relationshipNuance": {
      "Colleague": "Admiring, cheering their career breakthrough and workplace excellence.",
      "Friend": "Ecstatic, proud, ready to celebrate their hard-earned milestone.",
      "Best Friend": "Unapologetically hyped, recounting how hard they worked and how proud you are.",
      "Brother": "Proud banter, high fives, celebrating his achievement.",
      "Sister": "Beaming with pride, praising her dedication and success.",
      "Teacher": "Respectful, celebrating their milestone with gratitude and admiration.",
      "Other": "Uplifting, congratulatory, and encouraging."
    },
    "tones": [
      "Triumphant & Proud",
      "Inspiring",
      "Cheerful & Hype",
      "Dignified",
      "Proud & Cheerful"
    ]
  },
  "farewell": {
    "id": "farewell",
    "name": "Farewell",
    "displayName": "Farewell",
    "aliases": [
      "farewell",
      "goodbye",
      "alvida",
      "moving away",
      "leaving"
    ],
    "category": "nostalgia",
    "isCelebration": false,
    "emoji": "✈️",
    "icon": "🌅",
    "creationLabel": "Create a Farewell Message",
    "previewHeading": "A Special Goodbye for {name}",
    "messageType": "Farewell Message",
    "emotionalPurpose": "farewell",
    "allowedEmotions": [
      "Bittersweet",
      "Nostalgic",
      "Emotional",
      "Inspiring & Hopeful",
      "Warm & Connected",
      "Grateful"
    ],
    "defaultEmotion": "Bittersweet",
    "emptyPreviewText": "Your heartfelt farewell note wishing them well will appear here...",
    "generateButtonLabel": "Create Farewell Message ✈️",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "bittersweet, warm, nostalgic, encouraging, wishing safety and success on their next chapter",
    "guidance": "Honor memories of working or living together, acknowledge how much they will be missed, and send heartfelt blessings for their upcoming journey.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolence",
      "happy birthday",
      "congratulations on parting"
    ],
    "headlinePrefix": "Wishing Safe Journeys To",
    "cardBadge": "Warm Farewell 🌅",
    "envelopeSealText": "BON VOYAGE",
    "ctaText": "Open Farewell Note ✈️",
    "studioPrompt": "Send warm memories, laughter, and high hopes as they embark on a new chapter.",
    "actionBoxPrompt": "Someone moving away or switching jobs? Send a memorable farewell card.",
    "ambientEffect": "stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Colleague": "Warm, acknowledging their impact on the team, wishing immense success at their new venture.",
      "Best Friend": "Emotional, bittersweet, stating that distance will never change your bond.",
      "Friend": "Warm, reminiscing on good times, wishing great adventures.",
      "Teacher": "Respectful, honoring their impact as an educator and guide.",
      "Other": "Warm, supportive, and bittersweet."
    },
    "tones": [
      "Bittersweet",
      "Nostalgic",
      "Emotional",
      "Inspiring & Hopeful",
      "Warm & Connected",
      "Grateful"
    ]
  },
  "festival": {
    "id": "festival",
    "name": "Festival & Holiday",
    "displayName": "Festival",
    "aliases": [
      "festival",
      "holiday",
      "diwali",
      "eid",
      "christmas",
      "new year",
      "holi",
      "festive"
    ],
    "category": "celebration",
    "isCelebration": true,
    "emoji": "🪔",
    "icon": "✨",
    "creationLabel": "Create a Festival Wish",
    "previewHeading": "Festive Blessings for {name}",
    "messageType": "Festival Greeting",
    "emotionalPurpose": "festive_blessing",
    "allowedEmotions": [
      "Warm Blessings",
      "Joyful & Festive",
      "Heartfelt Family Love",
      "Peace & Light"
    ],
    "defaultEmotion": "Warm Blessings",
    "emptyPreviewText": "Your festival blessings and joyful wishes will appear here...",
    "generateButtonLabel": "Create Festival Wish 🪔",
    "recommendedTemplate": "friendship_card",
    "emotionalContext": "joyful, blessed, warm, festive, family-centered, peaceful",
    "guidance": "Celebrate festival traditions, auspicious blessings, togetherness, prosperity, and light.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "grief",
      "condolence",
      "farewell"
    ],
    "headlinePrefix": "Festive Blessings To",
    "cardBadge": "Festive Joy 🪔",
    "envelopeSealText": "BLESSED",
    "ctaText": "Open Festive Card 🪔",
    "studioPrompt": "Send vibrant festival blessings, joyous wishes, and heartfelt warmth.",
    "actionBoxPrompt": "Spread festive joy! Create a custom festival greeting.",
    "ambientEffect": "confetti",
    "greetingModule": "friendship_card",
    "musicTrack": "celebration_tune",
    "relationshipNuance": {
      "Teacher": "Respectful, expressing reverence for their wisdom and wishing festive joy.",
      "Mother": "Deeply loving, honoring her festive warmth and family blessings.",
      "Father": "Respectful, wishing happiness, health, and prosperity.",
      "Friend": "Vibrant, joyful, wishing loads of sweets, laughter, and light.",
      "Best Friend": "Full of fun, warmth, inside jokes, and festive excitement.",
      "Colleague": "Warm, professional, wishing festive happiness and prosperity.",
      "Other": "Warm, positive, uplifting festive wishes."
    },
    "tones": [
      "Warm Blessings",
      "Joyful & Festive",
      "Heartfelt Family Love",
      "Peace & Light"
    ]
  },
  "sympathy": {
    "id": "sympathy",
    "name": "Condolence & Sympathy",
    "displayName": "Sympathy",
    "aliases": [
      "sympathy",
      "condolence",
      "grief",
      "loss",
      "in memory"
    ],
    "category": "sympathy",
    "isCelebration": false,
    "emoji": "🕯️",
    "icon": "🕊️",
    "creationLabel": "Create a Message of Solace",
    "previewHeading": "Thinking of You, {name}",
    "messageType": "Message of Solace",
    "emotionalPurpose": "comfort_condolence",
    "allowedEmotions": [
      "Gentle & Comforting",
      "Heartfelt Sympathy",
      "Peace & Solace",
      "Warm & Supportive"
    ],
    "defaultEmotion": "Gentle & Comforting",
    "emptyPreviewText": "Your respectful message of comfort and presence will appear here...",
    "generateButtonLabel": "Send Message of Solace 🕯️",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "respectful, comforting, sensitive, solemn, compassionate — NEVER celebratory",
    "guidance": "Offer gentle solace, compassionate presence, and quiet comfort during a time of loss. NEVER USE CELEBRATION, PARTY, OR UPBEAT EMOJIS OR WORDS.",
    "forbiddenKeywords": [
      "celebrate",
      "celebration",
      "party",
      "cheers",
      "hurray",
      "happy",
      "yay",
      "festive",
      "cake",
      "candles"
    ],
    "headlinePrefix": "With Deepest Sympathy For",
    "cardBadge": "In Loving Remembrance 🕯️",
    "envelopeSealText": "WITH YOU",
    "ctaText": "Open Message of Solace 🕊️",
    "studioPrompt": "Offer quiet comfort and compassionate strength in a time of grief.",
    "actionBoxPrompt": "Send a quiet, respectful message of comfort and presence.",
    "ambientEffect": "calm_stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Friend": "Gentle, offering a listening ear, reminding them they are not alone.",
      "Colleague": "Respectful, supportive, offering condolences on behalf of the team.",
      "Other": "Quiet, dignified, comforting."
    },
    "tones": [
      "Gentle & Comforting",
      "Heartfelt Sympathy",
      "Peace & Solace",
      "Warm & Supportive"
    ]
  },
  "good_morning": {
    "id": "good_morning",
    "name": "Good Morning",
    "displayName": "Good Morning",
    "aliases": [
      "good morning",
      "morning",
      "suprabhat"
    ],
    "category": "daily",
    "isCelebration": false,
    "emoji": "☀️",
    "icon": "☕",
    "creationLabel": "Create a Morning Wish",
    "previewHeading": "Good Morning, {name}!",
    "messageType": "Morning Note",
    "emotionalPurpose": "daily_uplift",
    "allowedEmotions": [
      "Cheerful & Energizing",
      "Warm & Loving",
      "Inspirational",
      "Gentle"
    ],
    "defaultEmotion": "Cheerful & Energizing",
    "emptyPreviewText": "Your uplifting morning message will appear here...",
    "generateButtonLabel": "Create Morning Wish ☀️",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "positive, warm, uplifting, energetic, hopeful",
    "guidance": "Wish the recipient a refreshing, peaceful, and productive day. Send cheerful morning warmth.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "condolence",
      "farewell",
      "cake"
    ],
    "headlinePrefix": "A Beautiful Morning To",
    "cardBadge": "Morning Warmth ☀️",
    "envelopeSealText": "SMILE",
    "ctaText": "Open Morning Wish ☀️",
    "studioPrompt": "Start their day with a burst of sunshine and a thoughtful note.",
    "actionBoxPrompt": "Brighten someone’s morning with a personalized card.",
    "ambientEffect": "stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Girlfriend": "Sweet, tender, wishing her a day as beautiful as her smile.",
      "Boyfriend": "Warm, motivating, sending love to start his day strong.",
      "Best Friend": "Upbeat, funny, motivating them to conquer the day."
    },
    "tones": [
      "Cheerful & Energizing",
      "Warm & Loving",
      "Inspirational",
      "Gentle"
    ]
  },
  "good_night": {
    "id": "good_night",
    "name": "Good Night",
    "displayName": "Good Night",
    "aliases": [
      "good night",
      "night",
      "shubh ratri",
      "sweet dreams"
    ],
    "category": "daily",
    "isCelebration": false,
    "emoji": "🌙",
    "icon": "✨",
    "creationLabel": "Create a Night Note",
    "previewHeading": "Sweet Dreams, {name}",
    "messageType": "Night Note",
    "emotionalPurpose": "daily_comfort",
    "allowedEmotions": [
      "Sweet & Tender",
      "Peaceful & Calming",
      "Romantic",
      "Warm"
    ],
    "defaultEmotion": "Peaceful & Calming",
    "emptyPreviewText": "Your soothing good night message will appear here...",
    "generateButtonLabel": "Create Night Note 🌙",
    "recommendedTemplate": "sincere_letter",
    "emotionalContext": "calm, caring, peaceful, affectionate, soothing",
    "guidance": "Wish the recipient tranquil rest, peaceful sleep, and sweet dreams after a long day.",
    "forbiddenKeywords": [
      "apology",
      "sorry",
      "party",
      "cake",
      "celebration"
    ],
    "headlinePrefix": "Peaceful Dreams To",
    "cardBadge": "Sweet Dreams 🌙",
    "envelopeSealText": "DREAM",
    "ctaText": "Open Night Note 🌙",
    "studioPrompt": "Send a calming wish for peaceful sleep and gentle dreams.",
    "actionBoxPrompt": "Send someone warm thoughts before they fall asleep.",
    "ambientEffect": "calm_stars",
    "greetingModule": "sincere_letter",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {
      "Girlfriend": "Tender, loving, wishing her peaceful sleep and sweet dreams of you both.",
      "Boyfriend": "Affectionate, calming, telling him to rest well.",
      "Friend": "Peaceful, wishing them good rest."
    },
    "tones": [
      "Sweet & Tender",
      "Peaceful & Calming",
      "Romantic",
      "Warm"
    ]
  },
  "custom": {
    "id": "custom",
    "name": "Custom Occasion",
    "displayName": "Personal Note",
    "aliases": [
      "custom",
      "custom occasion",
      "other"
    ],
    "category": "custom",
    "isCelebration": true,
    "emoji": "✨",
    "icon": "💫",
    "creationLabel": "Create a Personal Message",
    "previewHeading": "A Special Message for {name}",
    "messageType": "Personal Message",
    "emotionalPurpose": "personal_note",
    "allowedEmotions": [
      "Heartfelt",
      "Thoughtful",
      "Cheerful",
      "Inspiring"
    ],
    "defaultEmotion": "Heartfelt",
    "emptyPreviewText": "Your personalized message will appear here...",
    "generateButtonLabel": "Create Personal Message ✨",
    "recommendedTemplate": "friendship_card",
    "emotionalContext": "heartfelt, genuine, context-appropriate",
    "guidance": "Adapt naturally to whatever milestone or note the user is conveying.",
    "forbiddenKeywords": [],
    "headlinePrefix": "A Special Message For",
    "cardBadge": "Special Message ✨",
    "envelopeSealText": "FOR YOU",
    "ctaText": "Open Special Greeting ✨",
    "studioPrompt": "Tailor a personalized greeting experience for any special moment.",
    "actionBoxPrompt": "Have a special message to send? Create a greeting card in 2 minutes.",
    "ambientEffect": "stars",
    "greetingModule": "friendship_card",
    "musicTrack": "peaceful_melody",
    "relationshipNuance": {},
    "tones": [
      "Heartfelt",
      "Thoughtful",
      "Cheerful",
      "Inspiring"
    ]
  }
};

function resolveOccasion(nameOrAlias) {
  if (!nameOrAlias || typeof nameOrAlias !== 'string') return OCCASIONS.birthday;
  const clean = nameOrAlias.trim().toLowerCase();

  for (const key of Object.keys(OCCASIONS)) {
    const occ = OCCASIONS[key];
    if (occ.aliases.some(alias => clean.includes(alias.toLowerCase()))) {
      return occ;
    }
  }

  if (clean.includes('sorry') || clean.includes('apolog')) return OCCASIONS.sorry;
  if (clean.includes('thank')) return OCCASIONS.thank_you;
  if (clean.includes('congrat')) return OCCASIONS.congratulations;
  if (clean.includes('birth') || clean.includes('bday')) return OCCASIONS.birthday;
  if (clean.includes('anniv') || clean.includes('wedding')) return OCCASIONS.anniversary;
  if (clean.includes('farewell') || clean.includes('goodbye')) return OCCASIONS.farewell;
  if (clean.includes('sympath') || clean.includes('condol')) return OCCASIONS.sympathy;
  if (clean.includes('festiv') || clean.includes('diwali') || clean.includes('eid') || clean.includes('holiday') || clean.includes('christmas')) return OCCASIONS.festival;
  if (clean.includes('morn')) return OCCASIONS.good_morning;
  if (clean.includes('night') || clean.includes('dream')) return OCCASIONS.good_night;
  if (clean.includes('friend')) return OCCASIONS.friendship;
  if (clean.includes('love') || clean.includes('valen')) return OCCASIONS.romantic;

  return OCCASIONS.custom;
}

function validateMessageContent(occasion, text) {
  const occ = resolveOccasion(occasion);
  if (!text || typeof text !== 'string') return { valid: true, violations: [] };
  const lower = text.toLowerCase();
  const violations = [];
  if (occ && occ.forbiddenKeywords) {
    for (const word of occ.forbiddenKeywords) {
      if (lower.includes(word.toLowerCase())) {
        violations.push(word);
      }
    }
  }
  return {
    valid: violations.length === 0,
    violations
  };
}

module.exports = {
  OCCASIONS,
  OCCASION_DEFINITIONS: OCCASIONS,
  resolveOccasion,
  getOccasionProfile: resolveOccasion,
  validateMessageContent
};
