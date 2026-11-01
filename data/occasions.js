/**
 * Wish Yours — Centralized Occasion & Emotion Intelligence Engine
 * Defines emotional contexts, guidance, forbidden keywords, relationship nuances,
 * UI copy, and fallback templates for every occasion.
 */

const OCCASIONS = {
  birthday: {
    id: 'birthday',
    name: 'Birthday',
    aliases: ['birthday', 'bday', 'birth day', 'janamdin'],
    category: 'celebration',
    isCelebration: true,
    emoji: '🎂',
    icon: '🎉',
    emotionalContext: 'celebratory, joyful, warm, uplifting, full of hope for the year ahead',
    guidance: 'Celebrate the recipient reaching a new milestone in life. Highlight their unique personality, wish them health, happiness, success, and joyful adventures.',
    forbiddenKeywords: ['apology', 'sorry', 'condolences', 'grief', 'farewell', 'goodbye'],
    headlinePrefix: 'Happy Birthday to',
    cardBadge: 'Birthday Celebration 🎂',
    envelopeSealText: 'WISH',
    ctaText: 'Blow the Candles 🎂',
    studioPrompt: 'Make their birthday unforgettable with candles, memories, and personal love.',
    actionBoxPrompt: 'Loved this birthday celebration? Create an unforgettable digital greeting in 2 minutes.',
    ambientEffect: 'balloons',
    greetingModule: 'cake',
    musicTrack: 'birthday_celebration',
    relationshipNuance: {
      'Girlfriend': 'Deeply affectionate, romantic, praising her smile and beauty, wishing a year full of romantic memories together.',
      'Boyfriend': 'Loving, playful, expressing how special he is and how lucky you feel to have him in your life.',
      'Wife': 'Deeply emotional, romantic, thanking her for being the pillar of your home and heart.',
      'Husband': 'Loving, appreciative, honoring him as your partner and celebrating another year of shared life.',
      'Best Friend': 'Playful, vibrant, bringing up shared craziness, inside jokes, and celebrating your unbreakable bond.',
      'Friend': 'Warm, cheerful, enthusiastic, wishing good vibes and great times ahead.',
      'Colleague': 'Respectful, cheerful, professional yet warm, wishing career success and a great year ahead.',
      'Mother': 'Tender, deeply grateful, honoring her unconditional love, selflessness, and warmth.',
      'Father': 'Respectful, admiring, loving, thanking him for his guidance, strength, and support.',
      'Brother': 'Playful banter mixed with genuine sibling warmth and loyalty.',
      'Sister': 'Sweet, affectionate, perhaps playful, celebrating her radiance and sisterly bond.',
      'Other': 'Warm, positive, uplifting.'
    }
  },

  anniversary: {
    id: 'anniversary',
    name: 'Wedding Anniversary',
    aliases: ['anniversary', 'wedding anniversary', 'marriage anniversary', 'salgirah'],
    category: 'romantic',
    isCelebration: true,
    emoji: '💍',
    icon: '🥂',
    emotionalContext: 'romantic, loving, appreciative, nostalgic, committed, deeply intimate',
    guidance: 'Honor the enduring journey of love, partnership, and shared history. Celebrate milestones, shared growth, and lifelong promises.',
    forbiddenKeywords: ['apology', 'sorry', 'grief', 'condolence', 'breakup', 'farewell'],
    headlinePrefix: 'Celebrating Our Love,',
    cardBadge: 'Anniversary Milestone 💍',
    envelopeSealText: 'LOVE',
    ctaText: 'Break Wax Seal 💌',
    studioPrompt: 'Celebrate your shared journey with a wax-sealed love letter and cherished photos.',
    actionBoxPrompt: 'Inspired by this anniversary greeting? Celebrate your own love story today.',
    ambientEffect: 'hearts',
    greetingModule: 'envelope',
    musicTrack: 'romantic_melody',
    relationshipNuance: {
      'Wife': 'Soulful, passionate, expressing gratitude for her companionship and declaring eternal love.',
      'Husband': 'Tender, loving, thanking him for his devotion and celebrating the vows you share.',
      'Girlfriend': 'Romantic, celebrating relationship milestones and dreaming of the future together.',
      'Boyfriend': 'Sweet, romantic, celebrating every month/year by his side.',
      'Other': 'Heartfelt congratulations to a wonderful couple.'
    }
  },

  sorry: {
    id: 'sorry',
    name: 'Sorry',
    aliases: ['sorry', 'apology', 'apologize', 'forgive me', 'im sorry', "i'm sorry", 'maafi'],
    category: 'apology',
    isCelebration: false,
    emoji: '🥺',
    icon: '🕊️',
    emotionalContext: 'sincere, apologetic, humble, empathetic, reconciliation-focused, deeply accountable',
    guidance: 'Acknowledge mistakes sincerely and humbly. Express genuine remorse without making excuses or shifting blame. Validate the recipient’s hurt feelings and express a heartfelt desire to rebuild trust and restore peace. ABSOLUTELY NEVER USE CELEBRATION, PARTY, FESTIVE, OR CONGRATULATORY LANGUAGE.',
    forbiddenKeywords: ['celebrate', 'celebration', 'celebrating', 'happy sorry', 'congratulations', 'cheers', 'party', 'hurray', 'yay', 'festive', 'cake', 'candles', 'blow', 'unforgettable celebration'],
    headlinePrefix: 'A Sincere Apology For',
    cardBadge: 'Heartfelt Apology 🕊️',
    envelopeSealText: 'FOR YOU',
    ctaText: 'Open Sincere Note 🕊️',
    studioPrompt: 'Reach out from the heart. Say what needs to be said and make things right.',
    actionBoxPrompt: 'Need to share something from the heart? Send a personalized sincere note.',
    ambientEffect: 'calm_stars',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Girlfriend': 'Tender, vulnerable, admitting fault without defensiveness, reassuring her of how much you cherish her and hate having caused her pain.',
      'Boyfriend': 'Honest, humble, sincere, expressing remorse and how much his peace of mind means to you.',
      'Wife': 'Deeply loving, emotionally mature, acknowledging where you fell short and reaffirming your dedication to her happiness.',
      'Husband': 'Respectful, sincere, expressing genuine sorrow and wishing to heal any rift between you.',
      'Best Friend': 'Raw, genuine, dropping all ego, acknowledging how irreplaceable their friendship is and that you hate having let them down.',
      'Friend': 'Courteous, sincere, respectful, acknowledging the mistake and expressing hope for reconciliation.',
      'Colleague': 'Professional, dignified, accountable, acknowledging the misstep or miscommunication and focusing on respectful collaboration moving forward.',
      'Mother': 'Deeply remorseful, humble, honoring her love and asking for her gentle forgiveness.',
      'Father': 'Respectful, honest, maturely apologizing and seeking his understanding.',
      'Brother': 'Honest, direct, putting aside sibling pride to say a real, heartfelt sorry.',
      'Sister': 'Affectionate, sincere, acknowledging hurt feelings and asking for her warmth back.',
      'Other': 'Humble, respectful, sincere, focused on amends.'
    }
  },

  thank_you: {
    id: 'thank_you',
    name: 'Thank You',
    aliases: ['thank you', 'thankyou', 'thanks', 'gratitude', 'shukriya', 'dhanyawad'],
    category: 'gratitude',
    isCelebration: false,
    emoji: '🙏',
    icon: '🌸',
    emotionalContext: 'grateful, appreciative, warm, heartfelt, acknowledging kindness and generosity',
    guidance: 'Express profound, genuine appreciation for specific acts of kindness, support, or presence. Highlight the positive impact the recipient had on the sender.',
    forbiddenKeywords: ['apology', 'sorry', 'condolence', 'farewell', 'cake', 'candles'],
    headlinePrefix: 'With Deepest Gratitude To',
    cardBadge: 'Token of Gratitude 🌸',
    envelopeSealText: 'THANKS',
    ctaText: 'Open Note of Thanks 🌸',
    studioPrompt: 'Show someone how much their kindness, support, or presence meant to you.',
    actionBoxPrompt: 'Someone made a difference in your life? Send them a heartfelt thank you note.',
    ambientEffect: 'petals',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Colleague': 'Professional, genuinely appreciative of their collaboration, support, or mentorship.',
      'Best Friend': 'Deeply personal, celebrating their constant loyalty and support through thick and thin.',
      'Mother': 'Overwhelmed with gratitude for her lifelong sacrifices, warmth, and unconditional love.',
      'Father': 'Deeply thankful for his silent sacrifices, guidance, and unwavering strength.',
      'Friend': 'Warm, cheerful, expressing real gratitude for their presence or help.',
      'Other': 'Warm, polite, appreciative.'
    }
  },

  congratulations: {
    id: 'congratulations',
    name: 'Congratulations',
    aliases: ['congratulations', 'congrats', 'bravo', 'badhai', 'mubarak'],
    category: 'achievement',
    isCelebration: true,
    emoji: '🥂',
    icon: '🏆',
    emotionalContext: 'proud, celebratory, encouraging, admiring, ecstatic',
    guidance: 'Applaud the recipient on a major milestone, promotion, graduation, award, or new chapter. Validate their hard work and celebrate their triumph.',
    forbiddenKeywords: ['apology', 'sorry', 'grief', 'condolence'],
    headlinePrefix: 'Huge Congratulations To',
    cardBadge: 'Major Milestone 🏆',
    envelopeSealText: 'BRAVO',
    ctaText: 'Celebrate Achievement 🥂',
    studioPrompt: 'Cheer on their triumph! Celebrate their hard work and major milestone.',
    actionBoxPrompt: 'Know someone who achieved greatness? Create a celebration card for them.',
    ambientEffect: 'confetti',
    greetingModule: 'friendship_card',
    musicTrack: 'celebration_tune',
    relationshipNuance: {
      'Colleague': 'Professional admiration, praising their dedication and career milestone.',
      'Best Friend': 'Ecstatic, hyped up, screaming in pride for their incredible win.',
      'Other': 'Proud, admiring, encouraging.'
    }
  },

  farewell: {
    id: 'farewell',
    name: 'Farewell',
    aliases: ['farewell', 'goodbye', 'alvida', 'going away', 'new journey'],
    category: 'nostalgia',
    isCelebration: false,
    emoji: '👋',
    icon: '✈️',
    emotionalContext: 'nostalgic, appreciative, emotional, bittersweet, hopeful for the next chapter',
    guidance: 'Reflect warmly on the memories and time spent together. Express sadness at their departure combined with sincere enthusiasm and blessings for their future endeavors.',
    forbiddenKeywords: ['happy birthday', 'happy anniversary', 'sorry', 'apology'],
    headlinePrefix: 'Wishing You The Very Best,',
    cardBadge: 'New Horizons ✈️',
    envelopeSealText: 'BON VOYAGE',
    ctaText: 'Read Farewell Note 👋',
    studioPrompt: 'Send off a valued friend or colleague with cherished memories and best wishes.',
    actionBoxPrompt: 'Saying goodbye to someone special? Send a memorable digital farewell card.',
    ambientEffect: 'calm_stars',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Colleague': 'Warm, admiring of their contributions, wishing them great strides in their next company/role.',
      'Best Friend': 'Emotional, bittersweet, promising that distance will never change your bond.',
      'Friend': 'Warm, nostalgic, wishing safe travels and smooth transitions.'
    }
  },

  sympathy: {
    id: 'sympathy',
    name: 'Condolence & Sympathy',
    aliases: ['sympathy', 'condolence', 'condolences', 'grief', 'shok'],
    category: 'sympathy',
    isCelebration: false,
    emoji: '🕯️',
    icon: '🕊️',
    emotionalContext: 'respectful, comforting, sensitive, solemn, compassionate — NEVER celebratory',
    guidance: 'Offer gentle solace, compassionate presence, and quiet comfort during a time of loss. NEVER USE CELEBRATION, PARTY, OR UPBEAT EMOJIS OR WORDS.',
    forbiddenKeywords: ['celebrate', 'celebration', 'party', 'cheers', 'hurray', 'happy', 'yay', 'festive', 'cake', 'candles'],
    headlinePrefix: 'With Deepest Sympathy For',
    cardBadge: 'In Loving Remembrance 🕯️',
    envelopeSealText: 'WITH YOU',
    ctaText: 'Open Message of Solace 🕊️',
    studioPrompt: 'Offer quiet comfort and compassionate strength in a time of grief.',
    actionBoxPrompt: 'Send a quiet, respectful message of comfort and presence.',
    ambientEffect: 'calm_stars',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Friend': 'Gentle, offering a listening ear, reminding them they are not alone.',
      'Colleague': 'Respectful, supportive, offering condolences on behalf of the team.',
      'Other': 'Quiet, dignified, comforting.'
    }
  },

  friendship: {
    id: 'friendship',
    name: 'Friendship Day',
    aliases: ['friendship', 'friendship day', 'dosti', 'best friend'],
    category: 'friendship',
    isCelebration: true,
    emoji: '🌟',
    icon: '🤝',
    emotionalContext: 'friendly, fun, nostalgic, loyal, emotionally connected',
    guidance: 'Celebrate the bond of friendship. Bring up loyalty, shared memories, laughter through tough times, and the joy of having a true confidant.',
    forbiddenKeywords: ['apology', 'sorry', 'condolence', 'grief'],
    headlinePrefix: 'To My Wonderful Friend,',
    cardBadge: 'Friendship Celebration 🌟',
    envelopeSealText: 'BFF',
    ctaText: 'Celebrate Our Bond 🤝',
    studioPrompt: 'Celebrate your partner in crime with shared memories and badges of honor.',
    actionBoxPrompt: 'Have an irreplaceable best friend? Celebrate them with a custom greeting.',
    ambientEffect: 'stars',
    greetingModule: 'friendship_card',
    musicTrack: 'celebration_tune',
    relationshipNuance: {
      'Best Friend': 'Unapologetically fun, warm, bringing up inside jokes, celebrating unconditional loyalty.',
      'Friend': 'Warm, cheerful, expressing how much you appreciate their companionship.'
    }
  },

  romantic: {
    id: 'romantic',
    name: "Valentine's Day",
    aliases: ['valentine', "valentine's day", 'romantic', 'love', 'pyaar'],
    category: 'romantic',
    isCelebration: true,
    emoji: '🌹',
    icon: '💖',
    emotionalContext: 'loving, affectionate, romantic, tender, passionate',
    guidance: 'Express romantic affection, appreciation for their presence in your life, and the beauty of your connection.',
    forbiddenKeywords: ['apology', 'sorry', 'condolence', 'farewell'],
    headlinePrefix: 'To My Sweetheart,',
    cardBadge: 'Love Letter 💖',
    envelopeSealText: 'LOVE',
    ctaText: 'Break Wax Seal 💌',
    studioPrompt: 'Craft an intimate love letter with a realistic wax seal and romantic music.',
    actionBoxPrompt: 'Want to surprise your partner? Create a digital love letter.',
    ambientEffect: 'hearts',
    greetingModule: 'envelope',
    musicTrack: 'romantic_melody',
    relationshipNuance: {
      'Girlfriend': 'Poetic, passionate, praising her beauty, personality, and the happiness she brings.',
      'Boyfriend': 'Affectionate, warm, making him feel special and deeply loved.',
      'Wife': 'Deeply romantic, expressing enduring love and devotion.',
      'Husband': 'Loving, appreciative, declaring your ongoing romance.'
    }
  },

  good_morning: {
    id: 'good_morning',
    name: 'Good Morning',
    aliases: ['good morning', 'morning', 'suprabhat'],
    category: 'daily',
    isCelebration: false,
    emoji: '☀️',
    icon: '☕',
    emotionalContext: 'positive, warm, uplifting, energetic, hopeful',
    guidance: 'Wish the recipient a refreshing, peaceful, and productive day. Send cheerful morning warmth.',
    forbiddenKeywords: ['apology', 'sorry', 'condolence', 'farewell', 'cake'],
    headlinePrefix: 'A Beautiful Morning To',
    cardBadge: 'Morning Warmth ☀️',
    envelopeSealText: 'SMILE',
    ctaText: 'Open Morning Wish ☀️',
    studioPrompt: 'Start their day with a burst of sunshine and a thoughtful note.',
    actionBoxPrompt: 'Brighten someone’s morning with a personalized card.',
    ambientEffect: 'stars',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Girlfriend': 'Sweet, tender, wishing her a day as beautiful as her smile.',
      'Boyfriend': 'Warm, motivating, sending love to start his day strong.',
      'Best Friend': 'Upbeat, funny, motivating them to conquer the day.'
    }
  },

  good_night: {
    id: 'good_night',
    name: 'Good Night',
    aliases: ['good night', 'night', 'shubh ratri', 'sweet dreams'],
    category: 'daily',
    isCelebration: false,
    emoji: '🌙',
    icon: '✨',
    emotionalContext: 'calm, caring, peaceful, affectionate, soothing',
    guidance: 'Wish the recipient tranquil rest, peaceful sleep, and sweet dreams after a long day.',
    forbiddenKeywords: ['apology', 'sorry', 'party', 'cake', 'celebration'],
    headlinePrefix: 'Peaceful Dreams To',
    cardBadge: 'Sweet Dreams 🌙',
    envelopeSealText: 'DREAM',
    ctaText: 'Open Night Note 🌙',
    studioPrompt: 'Send a calming wish for peaceful sleep and gentle dreams.',
    actionBoxPrompt: 'Send someone warm thoughts before they fall asleep.',
    ambientEffect: 'calm_stars',
    greetingModule: 'sincere_letter',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {
      'Girlfriend': 'Tender, loving, wishing her peaceful sleep and sweet dreams of you both.',
      'Boyfriend': 'Affectionate, calming, telling him to rest well.',
      'Friend': 'Peaceful, wishing them good rest.'
    }
  },

  custom: {
    id: 'custom',
    name: 'Custom Occasion',
    aliases: ['custom', 'custom occasion', 'other'],
    category: 'custom',
    isCelebration: true,
    emoji: '✨',
    icon: '💫',
    emotionalContext: 'heartfelt, genuine, context-appropriate',
    guidance: 'Adapt naturally to whatever milestone or note the user is conveying.',
    forbiddenKeywords: [],
    headlinePrefix: 'A Special Message For',
    cardBadge: 'Special Message ✨',
    envelopeSealText: 'FOR YOU',
    ctaText: 'Open Special Greeting ✨',
    studioPrompt: 'Tailor a personalized greeting experience for any special moment.',
    actionBoxPrompt: 'Have a special message to send? Create a greeting card in 2 minutes.',
    ambientEffect: 'stars',
    greetingModule: 'friendship_card',
    musicTrack: 'peaceful_melody',
    relationshipNuance: {}
  }
};

/**
 * Resolve an occasion by name or alias case-insensitively
 */
function resolveOccasion(nameOrAlias) {
  if (!nameOrAlias || typeof nameOrAlias !== 'string') {
    return OCCASIONS.birthday;
  }
  const clean = nameOrAlias.trim().toLowerCase();
  
  for (const key of Object.keys(OCCASIONS)) {
    const occ = OCCASIONS[key];
    if (occ.id === clean || occ.name.toLowerCase() === clean) {
      return occ;
    }
    if (occ.aliases && occ.aliases.some(a => clean.includes(a) || a.includes(clean))) {
      return occ;
    }
  }

  // Fallback checks
  if (clean.includes('sorry') || clean.includes('apolog')) return OCCASIONS.sorry;
  if (clean.includes('thank')) return OCCASIONS.thank_you;
  if (clean.includes('congrat') || clean.includes('cheer')) return OCCASIONS.congratulations;
  if (clean.includes('birth') || clean.includes('bday')) return OCCASIONS.birthday;
  if (clean.includes('anniv') || clean.includes('wedding')) return OCCASIONS.anniversary;
  if (clean.includes('farewell') || clean.includes('goodbye')) return OCCASIONS.farewell;
  if (clean.includes('sympath') || clean.includes('condol')) return OCCASIONS.sympathy;
  if (clean.includes('morn')) return OCCASIONS.good_morning;
  if (clean.includes('night') || clean.includes('dream')) return OCCASIONS.good_night;
  if (clean.includes('friend')) return OCCASIONS.friendship;
  if (clean.includes('love') || clean.includes('valen')) return OCCASIONS.romantic;

  return OCCASIONS.custom;
}

/**
 * Validate message content against occasion negative constraints / forbidden keywords
 */
function validateMessageContent(occasion, text) {
  const occ = resolveOccasion(occasion);
  if (!text || typeof text !== 'string') return { valid: true, violations: [] };
  const lower = text.toLowerCase();
  const violations = [];
  if (occ.forbiddenKeywords) {
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
  resolveOccasion,
  getOccasionProfile: resolveOccasion,
  validateMessageContent
};
