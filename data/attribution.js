/**
 * WishCraft AI — Developer Attribution & Sender Signature Engine
 * 
 * Provides:
 * 1. Global developer attribution metadata for MD RAZA
 * 2. Case-insensitive, whitespace-tolerant MD RAZA sender detection
 * 3. Dynamic relationship-aware sender signatures (e.g. "Your Best Friend, MD RAZA")
 * 4. Strict separation between greeting sender identity and platform developer identity
 */

const DEVELOPER_NAME = 'MD RAZA';
const DEVELOPER_TITLE = 'Creator & Developer of WishCraft AI';
const DEVELOPER_BIO = 'WishCraft AI was created and developed by MD RAZA to make digital wishes more personal, meaningful, and interactive through artificial intelligence and modern web experiences.';
const DEVELOPER_URL = '/developer';
const PLATFORM_NAME = 'WishCraft AI';

/**
 * Checks if a sender name matches "MD RAZA"
 * Safely trims spaces, normalizes internal whitespace, and compares case-insensitively.
 * Matches: "MD RAZA", "Md Raza", "md raza", "  MD RAZA  ", "MD   RAZA"
 * Does NOT match: "Rahul", "Priya", "MD RAZA JR", etc.
 */
function isMdRazaSender(senderName) {
  if (!senderName || typeof senderName !== 'string') return false;
  const normalized = senderName.trim().replace(/\s+/g, ' ').toLowerCase();
  return normalized === 'md raza';
}

/**
 * Formats a relationship string into clean Title Case
 * e.g. "best friend" -> "Best Friend", "colleague" -> "Colleague"
 */
function formatRelationship(relationship) {
  if (!relationship || typeof relationship !== 'string') return 'Friend';
  const clean = relationship.trim();
  if (!clean) return 'Friend';
  return clean
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Returns the proper sender signature.
 * If sender is MD RAZA: returns relationship-aware signature "Your [Relationship],\nMD RAZA"
 * Otherwise: returns the normal sender name unmodified.
 * 
 * @param {string} senderName - Raw sender name entered by user
 * @param {string} relationship - Recipient relationship (Friend, Best Friend, Brother, etc.)
 * @returns {string} Formatted signature
 */
function getSenderSignature(senderName, relationship) {
  if (!senderName || typeof senderName !== 'string') {
    return isMdRazaSender(senderName) ? `Your ${formatRelationship(relationship)},\n${DEVELOPER_NAME}` : '';
  }
  const trimmed = senderName.trim();
  if (isMdRazaSender(trimmed)) {
    const rel = formatRelationship(relationship);
    return `Your ${rel},\n${DEVELOPER_NAME}`;
  }
  return trimmed;
}

/**
 * Single-line inline version of sender signature
 * e.g. "Your Best Friend, MD RAZA" or "Rahul"
 */
function getSenderSignatureInline(senderName, relationship) {
  if (!senderName || typeof senderName !== 'string') {
    return isMdRazaSender(senderName) ? `Your ${formatRelationship(relationship)}, ${DEVELOPER_NAME}` : '';
  }
  const trimmed = senderName.trim();
  if (isMdRazaSender(trimmed)) {
    const rel = formatRelationship(relationship);
    return `Your ${rel}, ${DEVELOPER_NAME}`;
  }
  return trimmed;
}

/**
 * Formats a message body so that if sender is MD RAZA, the trailing signature
 * matches the relationship-aware signature format without duplicate signoffs.
 */
function applySignatureToMessage(message, senderName, relationship) {
  if (!message || typeof message !== 'string') return message;
  if (!isMdRazaSender(senderName)) return message;

  const targetSig = getSenderSignatureInline(senderName, relationship);

  // If already contains exact target signature, return as is
  if (message.includes(targetSig)) {
    return message;
  }

  // Check if message ends with dash-prefixed md raza signoff
  const mdRazaRegex = /—\s*(?:with love,\s*)?(?:your\s+[\w\s]+,\s*)?md\s+raza\s*$/i;
  if (mdRazaRegex.test(message)) {
    return message.replace(mdRazaRegex, `— ${targetSig}`);
  }

  // Check if message ends with trailing md raza signoff without dash
  const trailingMdRaza = /(?:with love,\s*)?(?:your\s+[\w\s]+,\s*)?md\s+raza\s*$/i;
  if (trailingMdRaza.test(message)) {
    return message.replace(trailingMdRaza, targetSig);
  }

  // If message doesn't contain md raza signoff, append it cleanly
  return `${message.trim()}\n\n— ${targetSig}`;
}

/**
 * Returns standard developer footer HTML markup
 */
function getDeveloperCreditHTML() {
  return `<span class="developer-credit-text text-xs text-gray-400">WishCraft AI • Developed by <a href="${DEVELOPER_URL}" class="developer-link font-semibold text-pink-400 hover:text-pink-300 hover:underline transition">MD RAZA</a></span>`;
}

module.exports = {
  DEVELOPER_NAME,
  DEVELOPER_TITLE,
  DEVELOPER_BIO,
  DEVELOPER_URL,
  PLATFORM_NAME,
  isMdRazaSender,
  formatRelationship,
  getSenderSignature,
  getSenderSignatureInline,
  applySignatureToMessage,
  getDeveloperCreditHTML
};
