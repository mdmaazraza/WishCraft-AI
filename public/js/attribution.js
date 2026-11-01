/**
 * WishCraft AI — Client-Side Developer Attribution & Sender Signature Module
 * Manages consistent "Developed by MD RAZA" footer components and relationship-aware
 * sender signatures when sender is MD RAZA.
 */

(function (window) {
  'use strict';

  const DEVELOPER_NAME = 'MD RAZA';
  const DEVELOPER_TITLE = 'Creator & Developer of WishCraft AI';
  const DEVELOPER_URL = '/developer';
  const PLATFORM_NAME = 'WishCraft AI';

  const WishAttribution = {
    DEVELOPER_NAME,
    DEVELOPER_TITLE,
    DEVELOPER_URL,
    PLATFORM_NAME,

    /**
     * Determines whether a given sender name matches "MD RAZA"
     * Handles leading/trailing spaces, multiple spaces, and case insensitivity.
     * @param {string} senderName
     * @returns {boolean}
     */
    isMdRazaSender(senderName) {
      if (!senderName || typeof senderName !== 'string') return false;
      const normalized = senderName.trim().replace(/\s+/g, ' ').toLowerCase();
      return normalized === 'md raza';
    },

    /**
     * Formats relationship string to Title Case
     * @param {string} relationship
     * @returns {string}
     */
    formatRelationship(relationship) {
      if (!relationship || typeof relationship !== 'string') return 'Friend';
      const clean = relationship.trim();
      if (!clean) return 'Friend';
      return clean
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    },

    /**
     * Returns multiline sender signature
     * If sender is MD RAZA: "Your [Relationship],\nMD RAZA"
     * Otherwise: returns raw senderName
     * @param {string} senderName
     * @param {string} relationship
     * @returns {string}
     */
    getSenderSignature(senderName, relationship) {
      if (!senderName || typeof senderName !== 'string') {
        return this.isMdRazaSender(senderName) ? `Your ${this.formatRelationship(relationship)},\n${DEVELOPER_NAME}` : '';
      }
      const trimmed = senderName.trim();
      if (this.isMdRazaSender(trimmed)) {
        const rel = this.formatRelationship(relationship);
        return `Your ${rel},\n${DEVELOPER_NAME}`;
      }
      return trimmed;
    },

    /**
     * Returns single-line sender signature
     * If sender is MD RAZA: "Your [Relationship], MD RAZA"
     * Otherwise: returns raw senderName
     * @param {string} senderName
     * @param {string} relationship
     * @returns {string}
     */
    getSenderSignatureInline(senderName, relationship) {
      if (!senderName || typeof senderName !== 'string') {
        return this.isMdRazaSender(senderName) ? `Your ${this.formatRelationship(relationship)}, ${DEVELOPER_NAME}` : '';
      }
      const trimmed = senderName.trim();
      if (this.isMdRazaSender(trimmed)) {
        const rel = this.formatRelationship(relationship);
        return `Your ${rel}, ${DEVELOPER_NAME}`;
      }
      return trimmed;
    },

    /**
     * Generates reusable global developer credit HTML markup
     * Subtle, responsive, accessible contrast on both light and dark backgrounds.
     * @param {object} [options]
     * @returns {string}
     */
    getDeveloperCreditHTML(options = {}) {
      const extraClass = options.className || '';
      return `
        <div class="developer-credit-badge inline-flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition py-2 px-3 rounded-full bg-slate-900/60 border border-slate-800/80 shadow-sm ${extraClass}">
          <span class="text-pink-400">✨</span>
          <span>${PLATFORM_NAME}</span>
          <span class="text-slate-600">•</span>
          <span>Developed by <a href="${DEVELOPER_URL}" class="developer-credit-link font-bold text-pink-400 hover:text-pink-300 underline underline-offset-2 transition" title="View Developer Profile">MD RAZA</a></span>
        </div>
      `;
    },

    /**
     * Mounts developer credit into designated containers or footers
     */
    mountDeveloperCredits() {
      // 1. Mount into any explicit .developer-credit-container elements
      const containers = document.querySelectorAll('.developer-credit-container');
      containers.forEach(container => {
        if (!container.dataset.mounted) {
          container.innerHTML = this.getDeveloperCreditHTML();
          container.dataset.mounted = 'true';
        }
      });

      // 2. Fallback check for footer if no container was marked
      const footer = document.querySelector('footer');
      if (footer && !footer.querySelector('.developer-credit-badge')) {
        const creditWrapper = document.createElement('div');
        creditWrapper.className = 'w-full text-center mt-6 pt-4 border-t border-white/5';
        creditWrapper.innerHTML = this.getDeveloperCreditHTML();
        footer.appendChild(creditWrapper);
      }
    }
  };

  // Auto-mount when DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => WishAttribution.mountDeveloperCredits());
    } else {
      WishAttribution.mountDeveloperCredits();
    }
  }

  // Export to window
  window.WishAttribution = WishAttribution;

})(typeof window !== 'undefined' ? window : global);
