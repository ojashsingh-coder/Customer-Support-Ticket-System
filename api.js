'use strict';

const API_BASE = 'http://localhost:3000';

const OjashApi = {

  // ── TICKETS ──────────────────────────────────────────
  async getTickets() {
    const r = await fetch(`${API_BASE}/tickets`);
    if (!r.ok) throw new Error('Failed to fetch tickets');
    return r.json();
  },

  async createTicket(data) {
    const r = await fetch(`${API_BASE}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  async updateTicket(id, data) {
    const r = await fetch(`${API_BASE}/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  async deleteTicket(id) {
    const r = await fetch(`${API_BASE}/tickets/${id}`, { method: 'DELETE' });
    return r.json();
  },

  // ── CUSTOMERS ─────────────────────────────────────────
  async getCustomers() {
    const r = await fetch(`${API_BASE}/customers`);
    if (!r.ok) throw new Error('Failed to fetch customers');
    return r.json();
  },

  async createCustomer(data) {
    const r = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  async updateCustomer(id, data) {
    const r = await fetch(`${API_BASE}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update customer');
    return r.json();
  },

  async deleteCustomer(id) {
    const r = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete customer');
    return r.json();
  },

  // ── AUTH ──────────────────────────────────────────────
  async login(email, password) {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return r.json();
  },

  async register(name, email, password, role, company) {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, company })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  logout() {
    localStorage.removeItem('ojashdesk_current_user');
  },

  // ── API KEYS ──────────────────────────────────────────────
  async getApiKeys() {
    const r = await fetch(`${API_BASE}/api-keys`);
    if (!r.ok) throw new Error('Failed to fetch API keys');
    return r.json();
  },

  async createApiKey(name) {
    const r = await fetch(`${API_BASE}/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || 'Failed to create API key');
    return result;
  },

  async revokeApiKey(id) {
    const r = await fetch(`${API_BASE}/api-keys/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to revoke API key');
    return r.json();
  },

  // ── SLA POLICY ────────────────────────────────────────────
  async getSlaPolicy() {
    const r = await fetch(`${API_BASE}/sla-policy`);
    if (!r.ok) throw new Error('Failed to fetch SLA policy');
    return r.json();
  },

  async updateSlaPolicy(data) {
    const r = await fetch(`${API_BASE}/sla-policy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update SLA policy');
    return r.json();
  },

  // ── TAGS ──────────────────────────────────────────────────
  async getTags() {
    const r = await fetch(`${API_BASE}/tags`);
    if (!r.ok) throw new Error('Failed to fetch tags');
    return r.json();
  },

  async createTag(name) {
    const r = await fetch(`${API_BASE}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || 'Failed to create tag');
    return result;
  },

  async deleteTag(name) {
    const r = await fetch(`${API_BASE}/tags/${encodeURIComponent(name)}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete tag');
    return r.json();
  },

  // ── CANNED RESPONSES ──────────────────────────────────────
  async getCannedResponses() {
    const r = await fetch(`${API_BASE}/canned-responses`);
    if (!r.ok) throw new Error('Failed to fetch canned responses');
    return r.json();
  },

  async createCannedResponse(data) {
    const r = await fetch(`${API_BASE}/canned-responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || 'Failed to create canned response');
    return result;
  },

  async updateCannedResponse(id, data) {
    const r = await fetch(`${API_BASE}/canned-responses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update canned response');
    return r.json();
  },

  async deleteCannedResponse(id) {
    const r = await fetch(`${API_BASE}/canned-responses/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete canned response');
    return r.json();
  },

  // ── AGENTS / TEAM MANAGEMENT ──────────────────────────────
  async getUsers() {
    const r = await fetch(`${API_BASE}/users`);
    if (!r.ok) throw new Error('Failed to fetch users');
    return r.json();
  },

  async createAgent(data) {
    const r = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || 'Failed to invite agent');
    return result;
  },

  async removeAgent(id) {
    const r = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    const result = await r.json();
    if (!r.ok) throw new Error(result.error || 'Failed to remove agent');
    return result;
  },

  // ── BILLING ───────────────────────────────────────────────
  async getBilling(userId) {
    const r = await fetch(`${API_BASE}/billing/${userId}`);
    if (!r.ok) throw new Error('Failed to fetch billing info');
    return r.json();
  },

  async updateBilling(userId, data) {
    const r = await fetch(`${API_BASE}/billing/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update billing');
    return r.json();
  },

  async cancelBilling(userId) {
    const r = await fetch(`${API_BASE}/billing/${userId}/cancel`, { method: 'POST' });
    if (!r.ok) throw new Error('Failed to cancel subscription');
    return r.json();
  },

  // ── ANALYTICS ─────────────────────────────────────────────
  async getAnalyticsSummary() {
    const r = await fetch(`${API_BASE}/analytics/summary`);
    if (!r.ok) throw new Error('Failed to fetch analytics');
    return r.json();
  },

  // ── LIVE CHAT ─────────────────────────────────────────────
  async getChats() {
    const r = await fetch(`${API_BASE}/chats`);
    if (!r.ok) throw new Error('Failed to fetch chats');
    return r.json();
  },

  async sendChatMessage(chatId, data) {
    const r = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to send message');
    return r.json();
  },

  async updateChat(chatId, data) {
    const r = await fetch(`${API_BASE}/chats/${chatId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update chat');
    return r.json();
  },

  async endChat(chatId) {
    const r = await fetch(`${API_BASE}/chats/${chatId}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to end chat');
    return r.json();
  },

  // ── KNOWLEDGE BASE ───────────────────────────────────────
  async getKBArticles() {
    const r = await fetch(`${API_BASE}/kb-articles`);
    if (!r.ok) throw new Error('Failed to fetch articles');
    return r.json();
  },

  async createKBArticle(data) {
    const r = await fetch(`${API_BASE}/kb-articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to create article');
    return r.json();
  },

  async updateKBArticle(id, data) {
    const r = await fetch(`${API_BASE}/kb-articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update article');
    return r.json();
  },

  async deleteKBArticle(id) {
    const r = await fetch(`${API_BASE}/kb-articles/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Failed to delete article');
    return r.json();
  },

  // ── PROFILE ───────────────────────────────────────────
  async updateProfile(id, data) {
    const r = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Failed to update profile');
    return r.json();
  },

  // ── SYNC ──────────────────────────────────────────────
  // Called on page load — fetches latest data from backend
  // and stores it in localStorage so existing app code works
  async syncFromBackend() {
    try {
      const [tickets, customers, cannedResponses] = await Promise.all([
        this.getTickets(),
        this.getCustomers(),
        this.getCannedResponses().catch(() => [])
      ]);

      if (tickets && Array.isArray(tickets) && tickets.length) {
        localStorage.setItem('ojashdesk_tickets', JSON.stringify(tickets));
        console.log(`Synced ${tickets.length} tickets from backend.`);
      }

      if (customers && Array.isArray(customers) && customers.length) {
        localStorage.setItem('ojashdesk_customers', JSON.stringify(customers));
        console.log(`Synced ${customers.length} customers from backend.`);
      }

      // Populate the shared window.OD global used by the canned-response
      // autocomplete (ticket replies, live chat) and the Settings page.
      // This used to come from a static frontend data.js that no longer
      // defines it, so this is now the single real source of truth.
      window.OD = window.OD || {};
      if (Array.isArray(cannedResponses)) {
        window.OD.CANNED_RESPONSES = cannedResponses;
        console.log(`Synced ${cannedResponses.length} canned responses from backend.`);
      }

      return true;
    } catch (e) {
      console.warn('Backend not reachable, using local data.', e.message);
      return false;
    }
  }
};

window.OjashApi = OjashApi;