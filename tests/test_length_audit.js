const { handleGenerateMessage } = require('../api/generate-message');

async function test() {
  console.log('--- AUDITING MESSAGE LENGTHS ACROSS SHORT, MEDIUM, LONG ---');
  for (const len of ['short', 'medium', 'long']) {
    for (const lang of ['en', 'hi', 'hinglish']) {
      const res = await handleGenerateMessage({
        occasion: 'Sorry',
        relationship: 'Best Friend',
        recipientName: 'Aisha',
        senderName: 'MD RAZA',
        memory: 'we was frnds from collage and you always suport me when i was sad',
        style: 'Deeply Apologetic',
        emotionIntensity: 'Deep',
        language: lang,
        length: len
      });
      const text = res.variations[0].text;
      const words = text.trim().split(/\s+/).length;
      console.log(`[${len.toUpperCase()}] (${lang}): ${words} words`);
      console.log(`  Sample: "${text.slice(0, 80)}..."`);
    }
  }
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
