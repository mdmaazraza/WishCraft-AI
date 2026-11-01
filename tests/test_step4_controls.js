/**
 * End-to-End Automated Regression Test for Step 4-7 Creation Flow Controls
 * Tests the exact Section 24 user verification scenario:
 * 1. Occasion: Sorry
 * 2. Relationship: Best Friend
 * 3. Recipient: Aisha, Sender: MD RAZA, Memory: "We had a fight yesterday..."
 * 4. Step 4: Dynamic Tone "Deeply Apologetic", Intensity "Deep"
 * 5. Step 5: Language "hinglish", Length "medium"
 * 6. Step 6: Template "sincere_letter", Font "Playfair Display"
 * 7. Step 7: Multi-stage generation payload verification
 * 8. Back / Next persistence across all 7 steps
 * 9. Modal display and pointer-events defense
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Verify public files exist
const createHtml = fs.readFileSync(path.join(__dirname, '../public/create.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, '../public/css/styles.css'), 'utf8');
const creatorJs = fs.readFileSync(path.join(__dirname, '../public/js/creator.js'), 'utf8');
const occasionsJs = fs.readFileSync(path.join(__dirname, '../public/js/occasions.js'), 'utf8');
const attribJs = fs.readFileSync(path.join(__dirname, '../public/js/attribution.js'), 'utf8');

console.log('--- TEST 1: CSS & Modal Overlay Protection ---');
assert.ok(stylesCss.includes('.hidden {'), 'styles.css must define .hidden');
assert.ok(stylesCss.includes('display: none !important;'), 'styles.css must have display: none !important');
assert.ok(stylesCss.includes('pointer-events: none !important;'), 'styles.css must have pointer-events: none !important');
assert.ok(stylesCss.includes('#previewModal'), 'styles.css must protect previewModal');
assert.ok(stylesCss.includes('#shareModal'), 'styles.css must protect shareModal');
assert.ok(stylesCss.includes('#scheduleWishModal'), 'styles.css must protect scheduleWishModal');
assert.ok(stylesCss.includes('#scheduleSuccessModal'), 'styles.css must protect scheduleSuccessModal');

// Check inline modal protection in create.html
assert.ok(createHtml.includes('id="previewModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4" style="display: none !important; pointer-events: none !important;"'), 'previewModal must have inline display: none and pointer-events: none');
assert.ok(createHtml.includes('id="shareModal" class="fixed inset-0 z-50 bg-black bg-opacity-80 hidden items-center justify-center p-4" style="display: none !important; pointer-events: none !important;"'), 'shareModal must have inline display: none and pointer-events: none');
assert.ok(createHtml.includes('id="scheduleWishModal" class="fixed inset-0 z-50 bg-black bg-opacity-80 hidden items-center justify-center p-4" style="display: none !important; pointer-events: none !important;"'), 'scheduleWishModal must have inline display: none and pointer-events: none');
assert.ok(createHtml.includes('id="scheduleSuccessModal" class="fixed inset-0 z-50 bg-black bg-opacity-80 hidden items-center justify-center p-4" style="display: none !important; pointer-events: none !important;"'), 'scheduleSuccessModal must have inline display: none and pointer-events: none');

console.log('✓ Test 1 passed: All modals and hidden utility are ironclad against invisible overlays.');

console.log('--- TEST 2: Occasion Resolution for "Sorry" ---');
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
sandbox.window = sandbox;

const runInSandbox = (code) => {
  const fn = new Function('window', 'document', 'localStorage', code);
  fn(sandbox, sandbox.document, sandbox.localStorage);
};

runInSandbox(occasionsJs);
runInSandbox(attribJs);

const occMeta = sandbox.OccasionManager.resolve('Sorry');
assert.strictEqual(occMeta.id, 'sorry');
assert.strictEqual(occMeta.defaultEmotion, 'Deeply Apologetic');
assert.strictEqual(occMeta.recommendedTemplate, 'sincere_letter');
assert.ok(occMeta.allowedEmotions.includes('Deeply Apologetic'));
console.log('✓ Test 2 passed: OccasionManager resolves Sorry with Deeply Apologetic tone & sincere_letter template.');

console.log('--- TEST 3: Full End-to-End Headless Flow & Section 24 Verification ---');
// Run our headless Chrome diagnostic runner and verify output
const { spawnSync } = require('child_process');
const diagPath = path.resolve(__dirname, '../public/test_diagnostics.html');

// Create test runner with Sorry flow
let testDiagnosticsHtml = createHtml
  .replace('href="/css/styles.css"', 'href="css/styles.css"')
  .replace('src="/js/audio.js"', 'src="js/audio.js"')
  .replace('src="/js/share.js"', 'src="js/share.js"')
  .replace('src="/js/app.js"', 'src="js/app.js"')
  .replace('src="/js/occasions.js"', 'src="js/occasions.js"')
  .replace('src="/js/attribution.js"', 'src="js/attribution.js"')
  .replace('src="/js/creator.js"', 'src="js/creator.js"');

const testHarnessScript = `
<div id="test-report" style="padding: 20px; font-family: monospace; white-space: pre-wrap;"></div>
<script>
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(runSection24Test, 600);
});

function logReport(key, val) {
  const el = document.getElementById('test-report');
  if (el) el.innerText += key + ': ' + JSON.stringify(val) + '\\n';
}

function runSection24Test() {
  try {
    // 1. Initial modals check
    const modals = ['previewModal', 'shareModal', 'scheduleWishModal', 'scheduleSuccessModal'];
    modals.forEach(id => {
      const m = document.getElementById(id);
      const style = window.getComputedStyle(m);
      logReport('MODAL_' + id, { display: style.display, pointerEvents: style.pointerEvents, w: m.offsetWidth, h: m.offsetHeight });
    });

    // 2. Select Occasion: Sorry
    const sorryBtn = document.querySelector('.occasion-btn[data-occasion="Sorry"]');
    if (sorryBtn) sorryBtn.click();
    logReport('STEP1_OCCASION', WishCreator.draft.occasion);
    logReport('STEP1_TEMPLATE', WishCreator.draft.template);
    logReport('STEP1_EMOTION', WishCreator.draft.emotion);

    // 3. Step 2: Relationship Best Friend
    WishCreator.goToStep(2);
    const bfBtn = document.querySelector('.relationship-btn[data-relationship="Best Friend"]');
    if (bfBtn) bfBtn.click();
    logReport('STEP2_RELATIONSHIP', WishCreator.draft.relationship);

    // 4. Step 3: Aisha & MD RAZA & Memory
    WishCreator.goToStep(3);
    const recInput = document.getElementById('recipientNameInput');
    recInput.value = 'Aisha';
    recInput.dispatchEvent(new Event('input', { bubbles: true }));

    const senderInput = document.getElementById('senderNameInput');
    senderInput.value = 'MD RAZA';
    senderInput.dispatchEvent(new Event('input', { bubbles: true }));

    const memInput = document.getElementById('memoriesInput');
    memInput.value = 'We had a fight yesterday at the cafe and I said something hurtful';
    memInput.dispatchEvent(new Event('input', { bubbles: true }));

    logReport('STEP3_DRAFT', { recipient: WishCreator.draft.recipientName, sender: WishCreator.draft.senderName, memory: WishCreator.draft.memory });

    // 5. Step 4: Choose Deeply Apologetic and Intensity Deep
    WishCreator.goToStep(4);
    const apolBtn = document.querySelector('.tone-btn[data-tone="Deeply Apologetic"]');
    if (apolBtn) apolBtn.click();
    const deepBtn = document.querySelector('.intensity-btn[data-intensity="Deep"]');
    if (deepBtn) deepBtn.click();
    logReport('STEP4_DRAFT', { emotion: WishCreator.draft.emotion, intensity: WishCreator.draft.emotionIntensity });
    logReport('STEP4_STICKY', { tone: document.getElementById('sumValTone')?.innerText, intensity: document.getElementById('sumValIntensity')?.innerText });

    // 6. Step 5: Hinglish & Medium
    WishCreator.goToStep(5);
    const hinglishCard = document.querySelector('.language-card[data-language="hinglish"]');
    if (hinglishCard) hinglishCard.click();
    const medBtn = document.querySelector('.length-btn[data-length="medium"]');
    if (medBtn) medBtn.click();
    logReport('STEP5_DRAFT', { language: WishCreator.draft.language, length: WishCreator.draft.messageLength });
    logReport('STEP5_STICKY', { language: document.getElementById('sumValLanguage')?.innerText, length: document.getElementById('sumValLength')?.innerText });

    // 7. Step 6: Template Sincere Letter & Font Playfair Display
    WishCreator.goToStep(6);
    const tplBtn = document.querySelector('.template-btn[data-template="sincere_letter"]');
    if (tplBtn) tplBtn.click();
    const fontBtn = document.querySelector('.font-btn[data-font="Playfair Display"]');
    if (fontBtn) fontBtn.click();
    logReport('STEP6_DRAFT', { template: WishCreator.draft.template, font: WishCreator.draft.font });
    logReport('STEP6_STICKY', { template: document.getElementById('sumValTemplate')?.innerText, font: document.getElementById('sumValFont')?.innerText });

    // 8. Step 7: Verify generation payload readiness
    WishCreator.goToStep(7);
    const payload = {
      occasion: WishCreator.draft.occasion,
      relationship: WishCreator.draft.relationship,
      recipientName: WishCreator.draft.recipientName,
      senderName: WishCreator.draft.senderName,
      memories: WishCreator.draft.memory,
      style: WishCreator.draft.emotion,
      emotion: WishCreator.draft.emotion,
      emotionIntensity: WishCreator.draft.emotionIntensity,
      language: WishCreator.draft.language,
      length: WishCreator.draft.messageLength,
      template: WishCreator.draft.template
    };
    logReport('STEP7_PAYLOAD', payload);

    // 9. Back Navigation Persistence Test
    WishCreator.goToStep(6);
    WishCreator.goToStep(5);
    WishCreator.goToStep(4);
    logReport('BACK_TO_STEP4', {
      emotion: WishCreator.draft.emotion,
      intensity: WishCreator.draft.emotionIntensity,
      activeToneBtnClass: document.querySelector('.tone-btn[data-tone="Deeply Apologetic"]')?.className,
      activeIntensityBtnClass: document.querySelector('.intensity-btn[data-intensity="Deep"]')?.className
    });

    WishCreator.goToStep(7);
    logReport('SECTION24_STATUS', 'SUCCESS');
  } catch (e) {
    logReport('SECTION24_ERROR', e.stack);
  }
}
</script>
`;

testDiagnosticsHtml = testDiagnosticsHtml.replace('</body>', testHarnessScript + '</body>');
fs.writeFileSync(diagPath, testDiagnosticsHtml, 'utf8');

const testRun = spawnSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--virtual-time-budget=3000',
  '--dump-dom',
  'file:///' + diagPath.replace(/\\/g, '/')
], { encoding: 'utf8' });

try { fs.unlinkSync(diagPath); } catch (e) {}

const reportMatch = testRun.stdout.match(/<div id="test-report"[^>]*>([\s\S]*?)<\/div>/);
assert.ok(reportMatch, 'Test report element must exist in output DOM');
const reportText = reportMatch[1];
console.log('--- TEST HARNESS REPORT OUTPUT ---');
console.log(reportText);

assert.ok(reportText.includes('STEP1_OCCASION: "Sorry"'), 'Step 1 occasion must be Sorry');
assert.ok(reportText.includes('STEP1_TEMPLATE: "sincere_letter"'), 'Step 1 recommended template must be sincere_letter');
assert.ok(reportText.includes('STEP2_RELATIONSHIP: "Best Friend"'), 'Step 2 relationship must be Best Friend');
assert.ok(reportText.includes('"recipient":"Aisha"'), 'Step 3 recipient must be Aisha');
assert.ok(reportText.includes('"sender":"MD RAZA"'), 'Step 3 sender must be MD RAZA');
assert.ok(reportText.includes('STEP4_DRAFT: {"emotion":"Deeply Apologetic","intensity":"Deep"}'), 'Step 4 draft must have Deeply Apologetic and Deep');
assert.ok(reportText.includes('STEP4_STICKY: {"tone":"Deeply Apologetic","intensity":"Deep"}'), 'Step 4 sticky summary bar must update immediately');
assert.ok(reportText.includes('STEP5_DRAFT: {"language":"hinglish","length":"medium"}'), 'Step 5 draft must have Hinglish and Medium');
assert.ok(reportText.includes('STEP5_STICKY: {"language":"Hinglish","length":"Medium"}'), 'Step 5 sticky summary bar must update language and length');
assert.ok(reportText.includes('STEP6_DRAFT: {"template":"sincere_letter","font":"Playfair Display"}'), 'Step 6 draft must have sincere_letter and Playfair Display');
assert.ok(reportText.includes('STEP6_STICKY: {"template":"Sincere","font":"Playfair Display"}'), 'Step 6 sticky summary bar must update template and font');
assert.ok(reportText.includes('"emotion":"Deeply Apologetic"'), 'Step 7 payload must include emotion Deeply Apologetic');
assert.ok(reportText.includes('"emotionIntensity":"Deep"'), 'Step 7 payload must include emotionIntensity Deep');
assert.ok(reportText.includes('"language":"hinglish"'), 'Step 7 payload must include language hinglish');
assert.ok(reportText.includes('ring-4 ring-indigo-500 bg-slate-800 border-indigo-500'), 'Back navigation to Step 4 must preserve active ring on Deeply Apologetic');
assert.ok(reportText.includes('SECTION24_STATUS: "SUCCESS"'), 'Section 24 test status must be SUCCESS');

console.log('✓ Test 3 passed: Section 24 exact end-to-end flow verified with 100% success!');
console.log('\n================ ALL STEP 4-7 TESTS PASSED SUCCESSFULLY ================\n');
