/**
 * WishCraft AI — Admin Dashboard Controller
 */

const AdminApp = {
  adminKey: '',

  init() {
    this.adminKey = sessionStorage.getItem('wishcraft_admin_key') || '';
    if (this.adminKey) {
      this.loadDashboardData();
    } else {
      this.showLoginModal();
    }
  },

  showLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  submitLogin() {
    const input = document.getElementById('adminKeyInput');
    const key = input ? input.value.trim() : '';
    if (!key) {
      showToast('Please enter the Admin Secret Key', 'error');
      return;
    }

    this.adminKey = key;
    sessionStorage.setItem('wishcraft_admin_key', key);
    document.getElementById('adminLoginModal')?.classList.add('hidden');
    document.getElementById('adminLoginModal')?.classList.remove('flex');
    this.loadDashboardData();
  },

  async loadDashboardData() {
    const loading = document.getElementById('adminLoading');
    if (loading) loading.style.display = 'block';

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-key': this.adminKey }
      });

      if (res.status === 401) {
        sessionStorage.removeItem('wishcraft_admin_key');
        showToast('Invalid Admin Secret Key. Try again.', 'error');
        this.showLoginModal();
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      this.renderAnalytics(data.analytics);
      this.renderEmailLogs(data.recentEmailLogs || []);
      this.renderWishesTable(data.analytics.recentWishes || []);

      document.getElementById('adminContent').style.display = 'block';
    } catch (err) {
      console.error('Admin error:', err);
      showToast(err.message || 'Error loading admin data', 'error');
    } finally {
      if (loading) loading.style.display = 'none';
    }
  },

  renderAnalytics(stats) {
    document.getElementById('adminTotalWishes').innerText = stats.totalWishes || 0;
    document.getElementById('adminTotalViews').innerText = stats.totalViews || 0;
    document.getElementById('adminActiveLinks').innerText = stats.activeLinks || 0;
    document.getElementById('adminEmailsSent').innerText = stats.emailsSent || 0;

    // Render Occasion distribution
    const occContainer = document.getElementById('adminOccasionBreakdown');
    if (occContainer && stats.occasionBreakdown) {
      const total = stats.totalWishes || 1;
      occContainer.innerHTML = Object.entries(stats.occasionBreakdown).map(([occ, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
          <div class="mb-3">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-bold text-gray-300">${occ}</span>
              <span class="text-gray-400">${count} wishes (${pct}%)</span>
            </div>
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderWishesTable(wishes) {
    const tbody = document.getElementById('adminWishesTableBody');
    if (!tbody) return;

    tbody.innerHTML = wishes.map(w => `
      <tr class="border-b border-white border-opacity-5 hover:bg-slate-900 transition">
        <td class="p-3 text-xs font-mono text-gray-400">${w.slug}</td>
        <td class="p-3 text-sm font-bold text-white">${w.recipient_name}</td>
        <td class="p-3 text-xs text-gray-300">${w.sender_name}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-bold bg-pink-900 text-pink-300">${w.occasion}</span></td>
        <td class="p-3 text-xs text-gray-300">👁️ ${w.views_count || 0}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded text-xs font-bold ${w.is_public ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}">
            ${w.is_public ? 'Public' : 'Hidden'}
          </span>
        </td>
        <td class="p-3 flex items-center gap-2">
          <a href="/wish/${w.slug}" target="_blank" class="text-xs text-indigo-400 hover:underline">View ↗</a>
          <button onclick="AdminApp.toggleVisibility('${w.slug}')" class="text-xs text-yellow-400 hover:text-yellow-300">Toggle</button>
          <button onclick="AdminApp.deleteWish('${w.slug}')" class="text-xs text-rose-400 hover:text-rose-300">Delete</button>
        </td>
      </tr>
    `).join('');
  },

  renderEmailLogs(logs) {
    const tbody = document.getElementById('adminEmailLogsTableBody');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-xs text-gray-500">No email dispatches recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map(e => `
      <tr class="border-b border-white border-opacity-5 text-xs text-gray-300">
        <td class="p-3 font-medium text-white">${e.recipient_email}</td>
        <td class="p-3">${e.sender_name}</td>
        <td class="p-3">
          <span class="px-2 py-0.5 rounded font-bold ${e.status === 'sent' ? 'bg-emerald-900 text-emerald-300' : (e.status === 'simulated' ? 'bg-blue-900 text-blue-300' : 'bg-rose-900 text-rose-300')}">
            ${e.status}
          </span>
        </td>
        <td class="p-3 text-gray-400">${e.provider}</td>
        <td class="p-3 text-gray-500">${new Date(e.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
  },

  async toggleVisibility(slug) {
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': this.adminKey
        },
        body: JSON.stringify({ slug, action: 'toggle_visibility' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(data.message, 'success');
      this.loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  async deleteWish(slug) {
    if (!confirm(`Permanently remove greeting "${slug}"?`)) return;

    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': this.adminKey
        },
        body: JSON.stringify({ slug, action: 'delete' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('Wish deleted by administrator', 'info');
      this.loadDashboardData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
};

window.AdminApp = AdminApp;

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
