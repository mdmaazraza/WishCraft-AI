/**
 * WishCraft AI — User Dashboard Controller
 */

const UserDashboard = {
  wishes: [],

  async init() {
    AuthManager.updateNavUI();
    await this.loadUserWishes();
  },

  async loadUserWishes() {
    const listContainer = document.getElementById('userWishesList');
    const user = AuthManager.getUser();

    try {
      const url = user ? `/api/wishes?sender_id=${encodeURIComponent(user.id)}` : `/api/wishes?limit=20`;
      const res = await fetch(url);
      const data = await res.json();

      this.wishes = data.wishes || [];
      this.renderWishes();
      this.updateStats();
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (listContainer) {
        listContainer.innerHTML = `<div class="p-8 text-center text-rose-400">Failed to load wishes. Please refresh.</div>`;
      }
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
