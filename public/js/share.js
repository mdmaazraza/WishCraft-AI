/**
 * WishCraft AI — Sharing & Communication Controller
 */

const WishShare = {
  // Generate WhatsApp Share Link
  getWhatsAppUrl(wish, currentUrl) {
    const text = `✨ Hey ${wish.recipient_name}! ${wish.sender_name} made you an unforgettable personalized celebration greeting: ${currentUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  },

  // Open WhatsApp in new tab
  openWhatsApp(wish, currentUrl) {
    const url = this.getWhatsAppUrl(wish, currentUrl);
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('WhatsApp opened! Choose your recipient to send the wish.', 'info');
  },

  // Generate SMS link for mobile
  getSmsUrl(wish, currentUrl) {
    const text = `Hi ${wish.recipient_name}! ${wish.sender_name} sent you a personalized digital greeting: ${currentUrl}`;
    return `sms:?body=${encodeURIComponent(text)}`;
  },

  openSMS(wish, currentUrl) {
    const url = this.getSmsUrl(wish, currentUrl);
    window.location.href = url;
    showToast('Opening default SMS app...', 'info');
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
      showToast('🎉 Link copied to clipboard! Share it anywhere.', 'success');
      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      showToast('Could not auto-copy. Please manually copy the link.', 'error');
      return false;
    }
  },

  // Native Web Share API for mobile devices
  async nativeShare(wish, currentUrl) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A Special Greeting for ${wish.recipient_name}!`,
          text: `✨ ${wish.sender_name} sent you a personalized ${wish.occasion} celebration!`,
          url: currentUrl
        });
        showToast('Shared successfully!', 'success');
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
  async sendEmail({ wishId, slug, recipientEmail, senderName, recipientName, occasion, messageExcerpt }) {
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
        messageExcerpt
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email');
    }
    return data;
  },

  // Social sharing helpers
  openFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  },

  openTelegram(text, url) {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  },

  openTwitter(text, url) {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }
};

window.WishShare = WishShare;
