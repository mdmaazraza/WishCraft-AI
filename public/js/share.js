/**
 * Wish Yours — Sharing & Communication Controller
 * Supports context-aware WhatsApp click-to-chat, international phone normalization,
 * Web Share API, SMS, and Email delivery.
 */

const WishShare = {
  // Normalize phone number to international E.164 without leading + or symbols
  formatWhatsAppNumber(phone) {
    if (!phone || typeof phone !== 'string') return '';
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('+')) clean = clean.substring(1);
    if (clean.startsWith('00')) clean = clean.substring(2);
    // If user enters 10 digits without country code (common in India e.g. 9876543210)
    if (/^[6-9]\d{9}$/.test(clean)) {
      clean = '91' + clean;
    }
    return clean;
  },

  // Generate short, context-aware WhatsApp share text (NOT full message body)
  generateShareText(wish, currentUrl) {
    const occ = (wish?.occasion || '').toLowerCase().trim();
    const recipient = wish?.recipient_name || wish?.recipientName || 'Friend';
    const sender = wish?.sender_name || wish?.senderName || 'Someone special';
    const url = currentUrl || (wish?.slug ? `${window.location.origin}/wish/${wish.slug}` : window.location.href);

    let senderSignature = sender;
    if (typeof WishAttribution !== 'undefined' && WishAttribution.isMdRazaSender(sender)) {
      senderSignature = 'MD RAZA';
    } else if (typeof isMdRazaSender === 'function' && isMdRazaSender(sender)) {
      senderSignature = 'MD RAZA';
    }

    // 1. Birthday (Celebratory)
    if (occ === 'birthday') {
      return `Happy Birthday, ${recipient}! 🎂 I made something special for you.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // 2. Sorry / Apology (Strictly Non-Celebratory)
    if (occ === 'sorry' || occ === 'apology' || occ.includes('sorry')) {
      return `${recipient}, I made something I really want you to see.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // 3. Anniversary (Romantic)
    if (occ.includes('anniversary') || occ === 'wedding anniversary') {
      return `I made something special for our anniversary ❤️\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // 4. Thank You (Grateful)
    if (occ === 'thank you' || occ === 'thank_you' || occ.includes('thank')) {
      return `Thank you so much, ${recipient}! 🙏 I made a special note for you.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // 5. Farewell (Warm well-wishes)
    if (occ === 'farewell' || occ.includes('farewell')) {
      return `Wishing you all the best, ${recipient}! 🌟 Here is a special farewell message for you.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // 6. Sympathy / Condolence (Respectful & Gentle)
    if (occ === 'sympathy' || occ.includes('condolence')) {
      return `Dear ${recipient}, thinking of you during this time. Here is a heartfelt note for you.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
    }

    // Default Fallback
    const displayName = wish?.occasion || 'greeting';
    return `Hey ${recipient}! I made a personalized ${displayName} message for you.\n\nOpen it here: ${url}\n\n— ${senderSignature}`;
  },

  // Generate WhatsApp Share Link (Supports with or without recipient phone number)
  getWhatsAppUrl(wish, currentUrl, recipientPhone = '') {
    const text = this.generateShareText(wish, currentUrl);
    const cleanPhone = this.formatWhatsAppNumber(recipientPhone);
    const encodedText = encodeURIComponent(text);

    if (cleanPhone && cleanPhone.length >= 7) {
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    }
    return `https://api.whatsapp.com/send?text=${encodedText}`;
  },

  // Open WhatsApp in new tab (Free Manual Share)
  openWhatsApp(wish, currentUrl, recipientPhone = '') {
    const url = this.getWhatsAppUrl(wish, currentUrl, recipientPhone);
    window.open(url, '_blank', 'noopener,noreferrer');
    if (typeof showToast === 'function') {
      showToast('Opening WhatsApp... Tap Send in WhatsApp to share your greeting.', 'info');
    }
  },

  // Generate SMS link for mobile
  getSmsUrl(wish, currentUrl) {
    const occ = (wish?.occasion || '').toLowerCase().trim();
    const recipient = wish?.recipient_name || wish?.recipientName || 'Friend';
    const sender = wish?.sender_name || wish?.senderName || 'Someone special';
    const text = (occ === 'sorry' || occ.includes('sorry'))
      ? `${recipient}, I made something I really want you to see: ${currentUrl} — ${sender}`
      : `Hi ${recipient}! ${sender} sent you a personalized digital greeting on Wish Yours: ${currentUrl}`;
    return `sms:?body=${encodeURIComponent(text)}`;
  },

  openSMS(wish, currentUrl) {
    const url = this.getSmsUrl(wish, currentUrl);
    window.location.href = url;
    if (typeof showToast === 'function') {
      showToast('Opening SMS app...', 'info');
    }
  },

  // Copy Link to clipboard with feedback
  async copyLink(url) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      if (typeof showToast === 'function') {
        showToast('🎉 Link copied to clipboard! Share it anywhere.', 'success');
      }
      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      if (typeof showToast === 'function') {
        showToast('Could not auto-copy. Please manually copy the link.', 'error');
      }
      return false;
    }
  },

  // Native Web Share API for mobile devices
  async nativeShare(wish, currentUrl) {
    const text = this.generateShareText(wish, currentUrl);
    const recipient = wish?.recipient_name || wish?.recipientName || 'Friend';
    const occ = wish?.occasion || 'Special Greeting';
    const title = (occ.toLowerCase() === 'sorry' || occ.toLowerCase().includes('sorry'))
      ? `A Heartfelt Message for ${recipient}`
      : `A Special ${occ} Greeting for ${recipient}!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: currentUrl
        });
        if (typeof showToast === 'function') {
          showToast('Shared successfully!', 'success');
        }
        return true;
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Share error:', e);
        }
      }
    } else {
      this.copyLink(currentUrl);
    }
    return false;
  },

  // Send Email via Backend Service
  async sendEmail({ wishId, slug, recipientEmail, senderName, recipientName, occasion, messageExcerpt, fontFamily }) {
    const res = await fetch('/api/share/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wishId,
        slug,
        recipientEmail,
        senderName,
        recipientName,
        occasion,
        messageExcerpt,
        fontFamily
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email');
    }
    return data;
  }
};

if (typeof window !== 'undefined') {
  window.WishShare = WishShare;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WishShare;
}
