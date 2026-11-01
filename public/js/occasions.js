/**
 * Wish Yours — Frontend Occasion & Emotion Intelligence System
 * Provides client-side helpers to resolve occasion emotion, UI copy, and visual themes.
 */

const OccasionManager = {
  OCCASIONS: {
    birthday: {
      id: 'birthday',
      name: 'Birthday',
      category: 'celebration',
      isCelebration: true,
      emoji: '🎂',
      icon: '🎉',
      tones: ['Heartfelt', 'Funny & Playful', 'Sweet & Loving', 'Emotional'],
      cardBadge: 'Birthday Celebration 🎂',
      headlinePrefix: 'Happy Birthday to',
      senderPrefix: 'With love from',
      ctaText: 'Blow the Candles 🎂',
      ambientEffect: 'balloons',
      greetingModule: 'cake',
      musicTrack: 'birthday_celebration',
      reShareTitle: 'Loved this birthday celebration? 🎉',
      reShareSubtitle: 'Create an unforgettable birthday greeting for someone special in 2 minutes.'
    },
    anniversary: {
      id: 'anniversary',
      name: 'Wedding Anniversary',
      category: 'romantic',
      isCelebration: true,
      emoji: '💍',
      icon: '🥂',
      tones: ['Deeply Romantic', 'Devoted & Loyal', 'Sweet & Playful', 'Poetic'],
      cardBadge: 'Anniversary Milestone 💍',
      headlinePrefix: 'Celebrating Our Love,',
      senderPrefix: 'Forever yours,',
      ctaText: 'Break Wax Seal 💌',
      ambientEffect: 'hearts',
      greetingModule: 'envelope',
      musicTrack: 'romantic_melody',
      reShareTitle: 'Cherished this love letter? 💖',
      reShareSubtitle: 'Surprise your partner with an intimate digital love letter.'
    },
    sorry: {
      id: 'sorry',
      name: 'Sorry',
      category: 'apology',
      isCelebration: false,
      emoji: '🥺',
      icon: '🕊️',
      tones: ['Sincere & Apologetic', 'Gentle & Healing', 'Deeply Accountable', 'Humble'],
      cardBadge: 'Heartfelt Apology 🕊️',
      headlinePrefix: 'A Sincere Apology For',
      senderPrefix: 'With deep sincerity from',
      ctaText: 'Open Sincere Note 🕊️',
      ambientEffect: 'calm_stars',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Need to make things right? 🕊️',
      reShareSubtitle: 'Send a sincere, heartfelt personal apology note to someone you care about.'
    },
    thank_you: {
      id: 'thank_you',
      name: 'Thank You',
      category: 'gratitude',
      isCelebration: false,
      emoji: '🙏',
      icon: '🌸',
      tones: ['Deeply Grateful', 'Warm & Appreciative', 'Respectful', 'Cheerful & Sweet'],
      cardBadge: 'Token of Gratitude 🌸',
      headlinePrefix: 'With Deepest Gratitude To',
      senderPrefix: 'With heartfelt thanks from',
      ctaText: 'Open Note of Thanks 🌸',
      ambientEffect: 'petals',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Touched by their kindness? 🌸',
      reShareSubtitle: 'Send a meaningful thank you card that shows your real appreciation.'
    },
    congratulations: {
      id: 'congratulations',
      name: 'Congratulations',
      category: 'achievement',
      isCelebration: true,
      emoji: '🥂',
      icon: '🏆',
      tones: ['Triumphant & Proud', 'Inspiring', 'Cheerful & Hype', 'Dignified'],
      cardBadge: 'Major Milestone 🏆',
      headlinePrefix: 'Huge Congratulations To',
      senderPrefix: 'So proud of you,',
      ctaText: 'Celebrate Achievement 🥂',
      ambientEffect: 'confetti',
      greetingModule: 'friendship_card',
      musicTrack: 'celebration_tune',
      reShareTitle: 'Celebrate someone’s big win! 🏆',
      reShareSubtitle: 'Applaud a friend, colleague, or family member on their major milestone.'
    },
    farewell: {
      id: 'farewell',
      name: 'Farewell',
      category: 'nostalgia',
      isCelebration: false,
      emoji: '👋',
      icon: '✈️',
      tones: ['Bittersweet', 'Nostalgic', 'Inspiring & Hopeful', 'Warm & Connected'],
      cardBadge: 'New Horizons ✈️',
      headlinePrefix: 'Wishing You The Very Best,',
      senderPrefix: 'Wishing you the best,',
      ctaText: 'Read Farewell Note 👋',
      ambientEffect: 'calm_stars',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Saying goodbye to someone special? 👋',
      reShareSubtitle: 'Send off a valued friend or colleague with memories they can keep forever.'
    },
    sympathy: {
      id: 'sympathy',
      name: 'Condolence & Sympathy',
      category: 'sympathy',
      isCelebration: false,
      emoji: '🕯️',
      icon: '🕊️',
      tones: ['Gentle & Comforting', 'Heartfelt Sympathy', 'Peace & Solace', 'Warm & Supportive'],
      cardBadge: 'In Loving Remembrance 🕯️',
      headlinePrefix: 'With Deepest Sympathy For',
      senderPrefix: 'Holding you in my thoughts,',
      ctaText: 'Open Message of Solace 🕊️',
      ambientEffect: 'calm_stars',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Send comfort in times of need 🕊️',
      reShareSubtitle: 'Offer quiet, dignified presence and heartfelt comfort.'
    },
    friendship: {
      id: 'friendship',
      name: 'Friendship Day',
      category: 'friendship',
      isCelebration: true,
      emoji: '🌟',
      icon: '🤝',
      tones: ['Loyal & Authentic', 'Playful & Crazy', 'Heartfelt', 'Sweet'],
      cardBadge: 'Friendship Celebration 🌟',
      headlinePrefix: 'To My Wonderful Friend,',
      senderPrefix: 'Your partner in crime,',
      ctaText: 'Celebrate Our Bond 🤝',
      ambientEffect: 'stars',
      greetingModule: 'friendship_card',
      musicTrack: 'celebration_tune',
      reShareTitle: 'Celebrate your ride-or-die! 🤝',
      reShareSubtitle: 'Create a personalized greeting packed with memories and inside jokes.'
    },
    romantic: {
      id: 'romantic',
      name: "Valentine's Day",
      category: 'romantic',
      isCelebration: true,
      emoji: '🌹',
      icon: '💖',
      cardBadge: 'Love Letter 💖',
      headlinePrefix: 'To My Sweetheart,',
      senderPrefix: 'All my love,',
      ctaText: 'Break Wax Seal 💌',
      ambientEffect: 'hearts',
      greetingModule: 'envelope',
      musicTrack: 'romantic_melody',
      reShareTitle: 'Loved this love letter? 🌹',
      reShareSubtitle: 'Express your feelings with a personalized wax-sealed experience.'
    },
    good_morning: {
      id: 'good_morning',
      name: 'Good Morning',
      category: 'daily',
      isCelebration: false,
      emoji: '☀️',
      icon: '☕',
      tones: ['Cheerful & Energizing', 'Warm & Loving', 'Inspirational', 'Gentle'],
      cardBadge: 'Morning Warmth ☀️',
      headlinePrefix: 'A Beautiful Morning To',
      senderPrefix: 'Wishing you a bright day,',
      ctaText: 'Open Morning Wish ☀️',
      ambientEffect: 'stars',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Brighten someone’s morning ☀️',
      reShareSubtitle: 'Start their day with joy, motivation, and positive energy.'
    },
    good_night: {
      id: 'good_night',
      name: 'Good Night',
      category: 'daily',
      isCelebration: false,
      emoji: '🌙',
      icon: '✨',
      tones: ['Sweet & Tender', 'Peaceful & Calming', 'Romantic', 'Warm'],
      cardBadge: 'Sweet Dreams 🌙',
      headlinePrefix: 'Peaceful Dreams To',
      senderPrefix: 'Sweet dreams from',
      ctaText: 'Open Night Note 🌙',
      ambientEffect: 'calm_stars',
      greetingModule: 'sincere_letter',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Send peaceful night thoughts 🌙',
      reShareSubtitle: 'Wish sweet dreams and tranquil rest to someone you love.'
    },
    festival: {
      id: 'festival',
      name: 'Festival & Holiday',
      category: 'celebration',
      isCelebration: true,
      emoji: '🪔',
      icon: '✨',
      tones: ['Warm Blessings', 'Joyful & Festive', 'Heartfelt Family Love', 'Peace & Light'],
      cardBadge: 'Festive Joy 🪔',
      headlinePrefix: 'Festive Blessings To',
      senderPrefix: 'Warm festive blessings from',
      ctaText: 'Open Festive Card 🪔',
      ambientEffect: 'confetti',
      greetingModule: 'friendship_card',
      musicTrack: 'celebration_tune',
      reShareTitle: 'Spread festive cheer! 🪔',
      reShareSubtitle: 'Send warm blessings and celebrate festive traditions.'
    },
    custom: {
      id: 'custom',
      name: 'Custom Occasion',
      category: 'custom',
      isCelebration: true,
      emoji: '✨',
      icon: '💫',
      tones: ['Heartfelt', 'Thoughtful', 'Cheerful', 'Inspiring'],
      cardBadge: 'Special Message ✨',
      headlinePrefix: 'A Special Message For',
      senderPrefix: 'Warmly from',
      ctaText: 'Open Special Greeting ✨',
      ambientEffect: 'stars',
      greetingModule: 'friendship_card',
      musicTrack: 'peaceful_melody',
      reShareTitle: 'Loved this digital greeting? ✨',
      reShareSubtitle: 'Create a personalized digital celebration card in just 2 minutes.'
    }
  },

  resolve(nameOrAlias) {
    if (!nameOrAlias || typeof nameOrAlias !== 'string') return this.OCCASIONS.birthday;
    const clean = nameOrAlias.trim().toLowerCase();

    if (clean.includes('sorry') || clean.includes('apolog')) return this.OCCASIONS.sorry;
    if (clean.includes('thank')) return this.OCCASIONS.thank_you;
    if (clean.includes('congrat')) return this.OCCASIONS.congratulations;
    if (clean.includes('birth') || clean.includes('bday')) return this.OCCASIONS.birthday;
    if (clean.includes('anniv') || clean.includes('wedding')) return this.OCCASIONS.anniversary;
    if (clean.includes('farewell') || clean.includes('goodbye')) return this.OCCASIONS.farewell;
    if (clean.includes('sympath') || clean.includes('condol')) return this.OCCASIONS.sympathy;
    if (clean.includes('morn')) return this.OCCASIONS.good_morning;
    if (clean.includes('night') || clean.includes('dream')) return this.OCCASIONS.good_night;
    if (clean.includes('friend')) return this.OCCASIONS.friendship;
    if (clean.includes('love') || clean.includes('valen')) return this.OCCASIONS.romantic;
    if (clean.includes('festiv') || clean.includes('diwali') || clean.includes('eid') || clean.includes('holiday') || clean.includes('christmas')) return this.OCCASIONS.festival;

    return this.OCCASIONS.custom;
  }
};

window.OccasionManager = OccasionManager;
