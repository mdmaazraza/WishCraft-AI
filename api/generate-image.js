/**
 * WishCraft AI — Image & Visual Assets Service
 */

// Curated high quality presets matching each occasion
const OCCASION_PRESETS = {
  birthday: [
    {
      id: "bday_cake_gold",
      title: "Golden Celebration Cake",
      url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80",
      category: "birthday"
    },
    {
      id: "bday_confetti",
      title: "Vibrant Confetti Rain",
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80",
      category: "birthday"
    },
    {
      id: "bday_balloons",
      title: "Pastel Floating Balloons",
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80",
      category: "birthday"
    }
  ],
  anniversary: [
    {
      id: "anniv_rings",
      title: "Forever Together",
      url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
      category: "anniversary"
    },
    {
      id: "anniv_roses",
      title: "Velvet Red Roses",
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
      category: "anniversary"
    },
    {
      id: "anniv_champagne",
      title: "Golden Toast",
      url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
      category: "anniversary"
    }
  ],
  friendship: [
    {
      id: "friends_laughter",
      title: "Pure Joy & Sunshine",
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
      category: "friendship"
    },
    {
      id: "friends_adventure",
      title: "Roadtrip Adventures",
      url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=900&q=80",
      category: "friendship"
    }
  ],
  romantic: [
    {
      id: "romantic_sunset",
      title: "Golden Hour Glow",
      url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=80",
      category: "romantic"
    },
    {
      id: "romantic_stargaze",
      title: "Midnight Under the Stars",
      url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
      category: "romantic"
    }
  ]
};

// SVG badge and stickers generator (safe, zero copyright)
function getSvgStickers() {
  return [
    { id: "stk_heart", name: "Heart of Gold", svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-rose-500"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>` },
    { id: "stk_cake", name: "Party Cake", svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-amber-400"><path d="M12 6a2 2 0 100-4 2 2 0 000 4zm7 4H5a2 2 0 00-2 2v2a2 2 0 002 2h14a2 2 0 002-2v-2a2 2 0 00-2-2zm-1 6H6a2 2 0 00-2 2v3h16v-3a2 2 0 00-2-2z"/></svg>` },
    { id: "stk_stars", name: "Sparkles", svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-yellow-300"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z"/></svg>` },
    { id: "stk_champagne", name: "Cheers", svg: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-purple-400"><path d="M11 20v-5.2A8 8 0 014 7V3h16v4a8 8 0 01-7 7.8V20h5v2H6v-2h5zM6 5v2a6 6 0 006 6 6 6 0 006-6V5H6z"/></svg>` }
  ];
}

async function handleGetVisualAssets(query) {
  const occasion = (query.occasion || 'birthday').toLowerCase();
  const presets = OCCASION_PRESETS[occasion] || OCCASION_PRESETS.birthday;

  return {
    status: 'success',
    presets,
    stickers: getSvgStickers()
  };
}

module.exports = {
  handleGetVisualAssets,
  OCCASION_PRESETS,
  getSvgStickers
};
