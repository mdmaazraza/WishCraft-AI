/**
 * Wish Yours — User Dashboard Controller
 * Multi-tab support: Celebrations & Scheduled Delivery Management.
 */

const UserDashboard = {
  currentTab: 'celebrations',
  wishes: [],
  scheduledWishes: [],

  async init() {
    AuthManager.updateNavUI();
    if (window.location.hash === '#scheduled') {
      this.switchTab('scheduled');
    }
    await this.loadUserWishes();
    await this.loadScheduledWishes();
  },

  switchTab(tab) {
    this.currentTab = tab;
    const tabCelContent = document.getElementById('tabCelebrationsContent');
    const tabSchedContent = document.getElementById('tabScheduledContent');
    const btnCel = document.getElementById('tabBtnCelebrations');
    const btnSched = document.getElementById('tabBtnScheduled');

    if (tab === 'celebrations') {
      if (tabCelContent) tabCelContent.style.display = 'block';
      if (tabSchedContent) tabSchedContent.style.display = 'none';

      if (btnCel) {
        btnCel.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800 border border-slate-700 flex items-center gap-2 transition';
      }
      if (btnSched) {
        btnSched.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-white hover:bg-slate-900 border border-transparent flex items-center gap-2 transition';
      }
      history.replaceState(null, null, '#celebrations');
    } else {
      if (tabCelContent) tabCelContent.style.display = 'none';
      if (tabSchedContent) tabSchedContent.style.display = 'block';

      if (btnSched) {
        btnSched.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-800 border border-slate-700 flex items-center gap-2 transition';
      }
      if (btnCel) {
        btnCel.className = 'px-5 py-2.5 rounded-xl font-bold text-xs text-gray-400 hover:text-white hover:bg-slate-900 border border-transparent flex items-center gap-2 transition';
      }
      history.replaceState(null, null, '#scheduled');
    }
  },

  async loadUserWishes() {
    const listContainer = document.getElementById('userWishesList');
    const user = AuthManager.getUser();

    try {
      const url = user ? `/api/wishes?sender_id=${encodeURIComponent(user.id)}` : `/api/wishes?limit=25`;
      const res = await fetch(url);
      const data = await res.json();

      this.wishes = data.wishes || [];
      this.renderWishes();
      this.updateStats();

      const tabCount = document.getElementById('tabCountCelebrations');
      if (tabCount) tabCount.innerText = this.wishes.length;
    } catch (err) {
      console.error('Failed to load dashboard celebrations:', err);
      if (listContainer) {
        listContainer.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load wishes. Please refresh.</div>`;
      }
    }
  },

  async loadScheduledWishes() {
    const user = AuthManager.getUser();
    try {
      const url = user ? `/api/scheduled-wishes?user_id=${encodeURIComponent(user.id)}` : `/api/scheduled-wishes?limit=50`;
      const res = await fetch(url);
      const data = await res.json();

      this.scheduledWishes = data.scheduled_wishes || [];
      this.renderScheduledWishes();
      this.updateScheduledStats();

      const tabCount = document.getElementById('tabCountScheduled');
      if (tabCount) tabCount.innerText = this.scheduledWishes.length;
    } catch (err) {
      console.error('Failed to load scheduled wishes:', err);
    }
  },

  updateStats() {
    const totalCount = this.wishes.length;
    const totalViews = this.wishes.reduce((sum, w) => sum + (w.views_count || 0), 0);
    const activeCount = this.wishes.filter(w => w.is_public).length;

    const countEl = document.getElementById('statTotalWishes');
    const viewsEl = document.getElementById('statTotalViews');
    const activeEl = document.getElementById('statActiveLinks');

    if (countEl) countEl.innerText = totalCount;
    if (viewsEl) viewsEl.innerText = totalViews;
    if (activeEl) activeEl.innerText = activeCount;
  },

  updateScheduledStats() {
    const pending = this.scheduledWishes.filter(s => s.status === 'scheduled' || s.status === 'processing').length;
    const sent = this.scheduledWishes.filter(s => s.status === 'sent').length;
    const cancelled = this.scheduledWishes.filter(s => s.status === 'cancelled').length;
    const total = this.scheduledWishes.length;

    const pendingEl = document.getElementById('statSchedPending');
    const sentEl = document.getElementById('statSchedSent');
    const cancelledEl = document.getElementById('statSchedCancelled');
    const totalEl = document.getElementById('statSchedTotal');

    if (pendingEl) pendingEl.innerText = pending;
    if (sentEl) sentEl.innerText = sent;
    if (cancelledEl) cancelledEl.innerText = cancelled;
    if (totalEl) totalEl.innerText = total;
  },

  renderWishes() {
    const container = document.getElementById('userWishesList');
    if (!container) return;

    if (this.wishes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full glass-card p-12 text-center rounded-2xl">
          <div class="text-5xl mb-4">✨💌</div>
          <h3 class="text-xl font-bold mb-2">No Greetings Created Yet</h3>
          <p class="text-gray-400 mb-6">Create your first unforgettable digital greeting in less than 2 minutes!</p>
          <a href="/create" class="btn-gradient px-6 py-3 rounded-xl font-bold inline-block text-white shadow-lg">Create Your First Wish</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.wishes.map(w => {
      const wishUrl = `${window.location.origin}/wish/${w.slug}`;
      const previewPhoto = w.images?.[0]?.url;

      return `
        <div class="glass-card rounded-2xl p-5 flex flex-col justify-between hover:border-pink-500 hover:border-opacity-40 transition">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-pink-900 bg-opacity-40 text-pink-300 border border-pink-700 border-opacity-30">${w.occasion}</span>
              <span class="text-xs text-gray-400 flex items-center gap-1">
                👁️ ${w.views_count || 0} views
              </span>
            </div>

            ${previewPhoto ? `<img src="${previewPhoto}" class="w-full h-32 object-cover rounded-xl mb-3">` : ''}

            <h4 class="text-lg font-bold text-white mb-1">For ${w.recipient_name}</h4>
            <p class="text-xs text-gray-400 mb-3">Relationship: <span class="text-gray-300">${w.relationship}</span> • Style: <span class="text-gray-300">${w.style}</span></p>
            <p class="text-sm text-gray-300 line-clamp-2 italic mb-4">"${w.message}"</p>
          </div>

          <div class="pt-4 border-t border-white border-opacity-10 flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <a href="/wish/${w.slug}" target="_blank" class="flex-1 text-center py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg text-xs font-bold text-white hover:opacity-90">Open Wish ↗</a>
              <button onclick="WishShare.copyLink('${wishUrl}')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-gray-300" title="Copy Link">📋 Copy</button>
              <button onclick="UserDashboard.openShareModal('${w.slug}')" class="px-3 py-2 bg-emerald-900 bg-opacity-40 hover:bg-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold" title="Share via WhatsApp or Email">📤 Share</button>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <button onclick="UserDashboard.reuseWish('${w.slug}')" class="text-indigo-400 hover:underline">Reuse Template</button>
              <div class="flex items-center gap-3">
                <button onclick="UserDashboard.openEditModal('${w.slug}')" class="text-gray-400 hover:text-white">Edit</button>
                <button onclick="UserDashboard.deleteWish('${w.slug}')" class="text-rose-400 hover:text-rose-300">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderScheduledWishes() {
    const container = document.getElementById('scheduledWishesList');
    if (!container) return;

    if (this.scheduledWishes.length === 0) {
      container.innerHTML = `
        <div class="glass-card p-12 text-center rounded-2xl">
          <div class="text-5xl mb-4">⏰✨</div>
          <h3 class="text-xl font-bold mb-2">No Scheduled Deliveries Yet</h3>
          <p class="text-gray-400 mb-6">Never miss a birthday, anniversary, or midnight surprise. Schedule an automatic delivery ahead of time!</p>
          <a href="/create" class="btn-gradient px-6 py-3 rounded-xl font-bold inline-block text-white shadow-lg">Schedule a Celebration Wish</a>
        </div>
      `;
      return;
    }

    container.innerHTML = this.scheduledWishes.map(item => {
      // Channel Badge
      let channelIcon = '💌';
      let channelLabel = 'Email';
      let channelColor = 'text-pink-400 bg-pink-950 border-pink-700';

      if (item.delivery_method === 'sms') {
        channelIcon = '📱';
        channelLabel = 'SMS';
        channelColor = 'text-purple-400 bg-purple-950 border-purple-700';
      } else if (item.delivery_method === 'call') {
        channelIcon = '📞';
        channelLabel = 'Voice Call';
        channelColor = 'text-cyan-400 bg-cyan-950 border-cyan-700';
      }

      // Status Badge
      let statusBadge = '';
      if (item.status === 'scheduled') {
        statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600 border-opacity-50"><span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span> Scheduled</span>';
      } else if (item.status === 'processing') {
        statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-600 border-opacity-50"><span class="w-2 h-2 rounded-full bg-blue-400 animate-spin"></span> Processing</span>';
      } else if (item.status === 'sent') {
        statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 border-opacity-50">✓ Delivered</span>';
      } else if (item.status === 'failed') {
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-600 border-opacity-50" title="${item.error_message || 'Delivery error'}">⚠ Failed</span>`;
      } else if (item.status === 'cancelled') {
        statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-gray-400 border border-slate-700">✕ Cancelled</span>';
      }

      // Local Time Formatting
      let timeFormatted = item.scheduled_at;
      try {
        const d = new Date(item.scheduled_at);
        timeFormatted = d.toLocaleString('en-US', {
          timeZone: item.timezone || 'UTC',
          dateStyle: 'medium',
          timeStyle: 'short'
        }) + ' (' + (item.timezone ? item.timezone.split('/').pop().replace(/_/g, ' ') : 'UTC') + ')';
      } catch (e) {
        timeFormatted = item.scheduled_at;
      }

      const destination = item.recipient_email || item.recipient_phone || 'Recipient';
      const isPending = item.status === 'scheduled';

      return `
        <div class="glass-card rounded-2xl p-5 border border-white border-opacity-10 hover:border-purple-500 hover:border-opacity-30 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2.5 mb-2 flex-wrap">
              ${statusBadge}
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${channelColor}">
                <span>${channelIcon}</span> ${channelLabel}
              </span>
              <span class="text-xs text-gray-400">
                Occasion: <strong class="text-gray-200">${item.occasion || 'Celebration'}</strong>
              </span>
            </div>

            <h4 class="text-base font-extrabold text-white mb-1">
              For ${item.recipient_name}
              <span class="text-xs font-normal text-gray-400 ml-2 font-mono">(${destination})</span>
            </h4>

            <p class="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mb-2">
              <span>⏰ Scheduled for:</span>
              <span class="font-bold">${timeFormatted}</span>
            </p>

            ${item.personal_message ? `<p class="text-xs text-gray-300 italic line-clamp-1 bg-black bg-opacity-20 px-3 py-1.5 rounded-lg border border-white border-opacity-5">Note: "${item.personal_message}"</p>` : ''}
            ${item.error_message ? `<p class="text-xs text-rose-400 mt-1 font-mono">Error: ${item.error_message}</p>` : ''}
          </div>

          <div class="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-white border-opacity-10 flex-wrap">
            <a href="/wish/${item.greeting_slug || item.greeting_id}" target="_blank" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition flex items-center gap-1">
              <span>View Wish</span> ↗
            </a>

            ${isPending ? `
              <button onclick="UserDashboard.openRescheduleModal('${item.id}')" class="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 rounded-xl text-xs font-bold text-white shadow transition flex items-center gap-1">
                <span>Reschedule</span> ✏️
              </button>

              <button onclick="UserDashboard.cancelSchedule('${item.id}')" class="px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition">
                Cancel
              </button>
            ` : ''}

            <button onclick="UserDashboard.deleteScheduleRecord('${item.id}')" class="px-3 py-2 text-gray-400 hover:text-rose-400 text-xs font-semibold" title="Delete Schedule Record">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openRescheduleModal(id) {
    const item = this.scheduledWishes.find(s => s.id === id);
    if (!item) return;

    document.getElementById('reschedWishId').value = item.id;

    // Date & Time prefill
    try {
      const d = new Date(item.scheduled_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');

      document.getElementById('reschedDateInput').value = `${yyyy}-${mm}-${dd}`;
      document.getElementById('reschedTimeInput').value = `${hh}:${min}`;
    } catch (e) {}

    const tzSelect = document.getElementById('reschedTimezoneSelect');
    if (tzSelect && item.timezone) {
      tzSelect.value = item.timezone;
    }

    const emailInput = document.getElementById('reschedEmailInput');
    const phoneInput = document.getElementById('reschedPhoneInput');
    const noteInput = document.getElementById('reschedPersonalNote');

    if (emailInput) emailInput.value = item.recipient_email || '';
    if (phoneInput) phoneInput.value = item.recipient_phone || '';
    if (noteInput) noteInput.value = item.personal_message || '';

    // Toggle email vs phone input visibility
    const emailCont = document.getElementById('reschedEmailContainer');
    const phoneCont = document.getElementById('reschedPhoneContainer');

    if (item.delivery_method === 'email') {
      if (emailCont) emailCont.style.display = 'block';
      if (phoneCont) phoneCont.style.display = 'none';
    } else {
      if (emailCont) emailCont.style.display = 'none';
      if (phoneCont) phoneCont.style.display = 'block';
    }

    const modal = document.getElementById('rescheduleModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  async saveReschedule() {
    const id = document.getElementById('reschedWishId').value;
    const dateVal = document.getElementById('reschedDateInput').value;
    const timeVal = document.getElementById('reschedTimeInput').value;
    const tzVal = document.getElementById('reschedTimezoneSelect').value || 'UTC';
    const email = document.getElementById('reschedEmailInput').value.trim();
    const phone = document.getElementById('reschedPhoneInput').value.trim();
    const note = document.getElementById('reschedPersonalNote').value.trim();

    if (!dateVal || !timeVal) {
      showToast('Please enter both date and time', 'error');
      return;
    }

    // Convert to ISO
    let scheduledAtIso = '';
    try {
      const localGuess = new Date(dateVal + 'T' + timeVal + ':00Z');
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzVal,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      });
      const parts = {};
      formatter.formatToParts(localGuess).forEach(p => { parts[p.type] = p.value; });
      let th = parseInt(parts.hour, 10);
      if (th === 24) th = 0;
      const formattedAsUtcMs = Date.UTC(parseInt(parts.year, 10), parseInt(parts.month, 10) - 1, parseInt(parts.day, 10), th, parseInt(parts.minute, 10));
      const diffMs = formattedAsUtcMs - localGuess.getTime();
      const [y, m, d] = dateVal.split('-').map(Number);
      const [h, min] = timeVal.split(':').map(Number);
      const desiredUtcMs = Date.UTC(y, m - 1, d, h, min) - diffMs;
      scheduledAtIso = new Date(desiredUtcMs).toISOString();
    } catch (e) {
      scheduledAtIso = new Date(dateVal + 'T' + timeVal).toISOString();
    }

    const saveBtn = document.getElementById('saveRescheduleBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerText = 'Saving...';
    }

    try {
      const res = await fetch(`/api/scheduled-wishes/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_at: scheduledAtIso,
          timezone: tzVal,
          recipient_email: email || undefined,
          recipient_phone: phone || undefined,
          personal_message: note
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Reschedule failed');

      showToast('⏰ Scheduled delivery updated!', 'success');
      document.getElementById('rescheduleModal').classList.add('hidden');
      document.getElementById('rescheduleModal').classList.remove('flex');
      await this.loadScheduledWishes();
    } catch (err) {
      showToast(err.message || 'Could not reschedule', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Save Changes ⏰';
      }
    }
  },

  async cancelSchedule(id) {
    if (!confirm('Are you sure you want to cancel this scheduled delivery?')) return;

    try {
      const res = await fetch(`/api/scheduled-wishes/${encodeURIComponent(id)}/cancel`, {
        method: 'POST'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Cancellation failed');

      showToast('Scheduled wish cancelled.', 'info');
      await this.loadScheduledWishes();
    } catch (err) {
      showToast(err.message || 'Could not cancel schedule', 'error');
    }
  },

  async deleteScheduleRecord(id) {
    if (!confirm('Delete this scheduled delivery record?')) return;

    try {
      const res = await fetch(`/api/scheduled-wishes/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Deletion failed');

      showToast('Record deleted.', 'info');
      this.scheduledWishes = this.scheduledWishes.filter(s => s.id !== id);
      this.renderScheduledWishes();
      this.updateScheduledStats();
    } catch (err) {
      showToast(err.message || 'Could not delete record', 'error');
    }
  },

  reuseWish(slug) {
    const wish = this.wishes.find(w => w.slug === slug);
    if (!wish) return;
    const params = new URLSearchParams({
      occasion: wish.occasion,
      relationship: wish.relationship,
      theme: wish.theme,
      style: wish.style,
      message: wish.message
    });
    window.location.href = `/create?${params.toString()}`;
  },

  async deleteWish(slug) {
    if (!confirm('Are you sure you want to delete this greeting? The link will no longer work.')) return;

    try {
      const res = await fetch(`/api/wishes/${encodeURIComponent(slug)}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Deletion failed');

      showToast('Greeting deleted', 'info');
      this.wishes = this.wishes.filter(w => w.slug !== slug);
      this.renderWishes();
      this.updateStats();
    } catch (err) {
      showToast(err.message || 'Could not delete wish', 'error');
    }
  },

  openEditModal(slug) {
    const wish = this.wishes.find(w => w.slug === slug);
    if (!wish) return;

    const modal = document.getElementById('editWishModal');
    if (!modal) return;

    document.getElementById('editWishSlug').value = wish.slug;
    document.getElementById('editRecipientName').value = wish.recipient_name;
    document.getElementById('editSenderName').value = wish.sender_name;
    document.getElementById('editWishMessage').value = wish.message;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  async saveWishEdit() {
    const slug = document.getElementById('editWishSlug').value;
    const recipient_name = document.getElementById('editRecipientName').value.trim();
    const sender_name = document.getElementById('editSenderName').value.trim();
    const message = document.getElementById('editWishMessage').value.trim();

    if (!recipient_name || !message) {
      showToast('Recipient name and message cannot be empty', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/wishes/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_name, sender_name, message })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');

      showToast('Greeting updated successfully! ✨', 'success');
      document.getElementById('editWishModal').classList.add('hidden');
      document.getElementById('editWishModal').classList.remove('flex');
      await this.loadUserWishes();
    } catch (err) {
      showToast(err.message || 'Could not update wish', 'error');
    }
  },

  openShareModal(slug) {
    const wish = this.wishes.find(w => w.slug === slug);
    if (!wish) return;
    if (window.WishCreator?.showShareModal) {
      window.WishCreator.showShareModal(wish);
    } else {
      WishShare.copyLink(`${window.location.origin}/wish/${wish.slug}`);
    }
  }
};

window.UserDashboard = UserDashboard;

document.addEventListener('DOMContentLoaded', () => {
  UserDashboard.init();
});
