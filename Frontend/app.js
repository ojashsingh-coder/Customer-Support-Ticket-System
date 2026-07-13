//  Core app logic: auth, theme, sidebar, tickets, customers,
//  inbox, dropdowns, modals, toasts, analytics, KB, billing.

'use strict';

// CONSTANTS
const LS = {
  USER:    'ojashdesk_current_user',
  USERS:   'ojashdesk_users',
  THEME:   'ojashdesk_theme',
  TICKETS: 'ojashdesk_tickets',
  CUSTOMERS: 'ojashdesk_customers',
};

const DEFAULT_USER = {
  name: 'Ojash Singh', displayName: 'OjashSingh',
  email: 'ojash@ojashdesk.com', password: 'admin123',
  role: 'Admin', initials: 'OS', avatar: 'av-purple',
};

// UTILITIES
function $(id)     { return document.getElementById(id); }
function $q(sel, ctx) { return (ctx || document).querySelector(sel); }
function $all(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

function showToast(msg, type = 'info', duration = 3000) {
  const container = $('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// Disables a submit button and swaps its label while an async action runs,
// so double-clicks can't fire duplicate requests and the user gets feedback
// that something is actually happening (not just a frozen form).
function setBtnLoading(btn, isLoading, loadingText = 'Saving...') {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = loadingText;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || btn.textContent;
    btn.disabled = false;
  }
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeSince(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// AI COPILOT KNOWLEDGE BASE
// Lightweight keyword-matched answer engine so "Ask AI anything"
// returns a real, useful answer instead of a "coming soon" stub.
const AI_COPILOT_KB = [
  { keywords: ['password', 'login', 'log in', 'signin', 'sign in', 'locked out', 'forgot password', '2fa', 'two factor', 'otp'],
    answer: "This sounds like a login issue. Most cases come from the reset email landing in spam, or the account being temporarily locked after too many failed attempts.",
    actions: ['Resend the password reset email', 'Ask the customer to check spam/promotions folder', "Verify the account isn't locked"] },
  { keywords: ['refund', 'money back', 'reimburse', 'chargeback'],
    answer: "For refund requests, first confirm the order falls within the refund policy window, then check the payment gateway for the original transaction.",
    actions: ['Check refund eligibility against policy', 'Verify the original transaction in the payment gateway', 'Process the refund and send a confirmation email'] },
  { keywords: ['payment', 'charge', 'billing', 'invoice', 'card declined', 'subscription', 'double charged', 'duplicate charge'],
    answer: "Billing issues are usually a payment gateway timeout, a duplicate charge, or an out-of-date card on file.",
    actions: ['Check the transaction status in the payment gateway', 'Look for duplicate charges', 'Confirm the card on file is valid'] },
  { keywords: ['api', 'rate limit', 'rate limited', 'integration', 'webhook', 'api key'],
    answer: "API-related problems are most often a rate limit being hit or an expired/invalid API key.",
    actions: ['Check current rate-limit usage', 'Verify the API key is active', 'Review recent error logs for this endpoint'] },
  { keywords: ['export', 'download', 'csv', 'pdf report'],
    answer: "Export issues are frequently caused by a stale browser cache or an unsupported browser version.",
    actions: ['Ask the customer to clear their browser cache', 'Try the export in a different browser', 'Confirm the file format is supported'] },
  { keywords: ['sso', 'saml', 'okta', 'single sign-on', 'azure ad'],
    answer: "SSO failures are almost always a mismatch between the identity provider configuration and what's saved in Ojash Desk.",
    actions: ['Verify the ACS URL matches exactly', 'Confirm the Entity ID', 'Request fresh IdP metadata from the customer'] },
  { keywords: ['chat widget', 'live chat', 'widget not loading', 'widget'],
    answer: "If the live chat widget isn't appearing on the customer's site, it's usually an installation or domain-whitelist problem.",
    actions: ['Check that the widget script is installed correctly', 'Verify the domain is whitelisted', 'Test the widget in a sandbox environment'] },
  { keywords: ['sla', 'response time', 'breach', 'overdue', 'first response'],
    answer: "SLA breaches usually mean a ticket has gone unanswered past its priority window — high and urgent tickets need a first response fastest.",
    actions: ['Re-sort the queue by SLA remaining', 'Reassign overdue tickets to an available agent', 'Send a holding reply to buy time'] },
  { keywords: ['feature request', 'roadmap', 'when will'],
    answer: "For feature requests, check whether it's already tracked on the public roadmap before promising a timeline.",
    actions: ['Search the roadmap for this request', "Log it if it's new", 'Set a follow-up reminder to update the customer'] },
];

// Whole-word match — avoids false positives like "api" matching inside
// "capital" or "sla" matching inside "translate" (plain .includes() did this).
function keywordHit(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
}

function getCopilotAnswer(question) {
  const q = question.toLowerCase();

  // Score every KB entry by how many keywords genuinely match as whole
  // words, then return the strongest match instead of the first hit.
  let best = null, bestScore = 0;
  for (const entry of AI_COPILOT_KB) {
    const score = entry.keywords.filter(k => keywordHit(q, k)).length;
    if (score > bestScore) { best = entry; bestScore = score; }
  }
  if (best) return best;

  return {
    answer: `I don't have a specific match for "${question}" in the support knowledge base. AI Copilot is tuned for common ticket topics — login, billing, refunds, API/integration issues, exports, SSO, and SLAs. For anything outside that, try the Knowledge Base or check with a teammate.`,
    actions: ['Search the knowledge base', 'Check similar resolved tickets', 'Escalate to a senior agent if unresolved'],
  };
}

// THEME
function applyTheme(theme) {
  if (theme === 'system') {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = prefersDark ? 'dark' : 'light';
    document.body.classList.toggle('light-theme', resolved === 'light');
    document.body.classList.toggle('dark-theme',  resolved === 'dark');
    document.documentElement.classList.toggle('light-theme', resolved === 'light');
    document.documentElement.classList.toggle('dark-theme',  resolved === 'dark');
  } else if (theme === 'light') {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
    document.documentElement.classList.add('dark-theme');
  }
  localStorage.setItem(LS.THEME, theme);
  // Sync toggle checkboxes
  $all('#themeCheckbox, #portalThemeToggle input').forEach(cb => {
    if (cb) cb.checked = (theme === 'light');
  });
  // Sync settings theme option buttons
  if ($('themeDark'))   $('themeDark').classList.toggle('selected',  theme === 'dark');
  if ($('themeLight'))  $('themeLight').classList.toggle('selected',  theme === 'light');
  if ($('themeSystem')) $('themeSystem').classList.toggle('selected', theme === 'system');
}

function getTheme() {
  return localStorage.getItem(LS.THEME) || 'dark';
}

function toggleTheme() {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

// Called from settings.html inline onclick
window.selectTheme = function(t) {
  applyTheme(t);
  // Make sure the settings buttons reflect the selection
  ['themeDark','themeLight','themeSystem'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('selected');
  });
  const map = { dark:'themeDark', light:'themeLight', system:'themeSystem' };
  const sel = document.getElementById(map[t]);
  if (sel) sel.classList.add('selected');
};

// AUTH
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(LS.USER)) || DEFAULT_USER;
  } catch { return DEFAULT_USER; }
}

// Unlike getCurrentUser(), this does NOT fall back to DEFAULT_USER — it's
// the real "is someone actually logged in" check, used for page guards.
function isLoggedIn() {
  try {
    return !!localStorage.getItem(LS.USER);
  } catch { return false; }
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return null;
  }
  return getCurrentUser();
}

function populateUserUI(user) {
  user = user || getCurrentUser();
  const initials = user.initials || (user.name || 'OS').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  const displayedName = (user.name || user.displayName || '').trim();
  // Ojash Singh's avatar is always forced purple, regardless of stored color
  const avatarClass = (displayedName === 'Ojash Singh') ? 'av-ojash' : (user.avatar || 'av-purple');
  const photo = user.photo || '';

  function applyAvatar(el) {
    if (!el) return;
    if (photo) {
      // Show initials immediately, then swap to the photo once it's
      // confirmed to load. If it fails (corrupt/truncated data), we
      // clean it up so the avatar never gets stuck blank.
      el.style.removeProperty('background-image');
      el.textContent = initials;

      const testImg = new Image();
      testImg.onload = function() {
        // Color classes like .av-ojash set "background: ... !important",
        // which would otherwise paint over our photo. Use !important here
        // too so the photo always wins once it's confirmed to load.
        el.style.setProperty('background-image', `url(${photo})`, 'important');
        el.style.setProperty('background-size', 'cover', 'important');
        el.style.setProperty('background-position', 'center', 'important');
        el.textContent = '';
      };
      testImg.onerror = function() {
        delete user.photo;
        try { localStorage.setItem(LS.USER, JSON.stringify(user)); } catch {}
      };
      testImg.src = photo;
    } else {
      el.style.removeProperty('background-image');
      el.style.removeProperty('background-size');
      el.style.removeProperty('background-position');
      el.textContent = initials;
    }
  }

  // Sidebar
  if ($('sbAvatar'))  { $('sbAvatar').className = `sidebar-user-avatar ${avatarClass}`; applyAvatar($('sbAvatar')); }
  if ($('sbName'))    $('sbName').textContent = user.displayName || user.name || 'Ojash Singh';
  if ($('sbRole'))    $('sbRole').textContent = user.role || 'Admin';

  // Topbar
  if ($('tbAvatar'))  { $('tbAvatar').className = `topbar-avatar ${avatarClass}`; applyAvatar($('tbAvatar')); }

  // Settings page preview
  if ($('avatarPreview')) { applyAvatar($('avatarPreview')); }
  if ($('profileName'))   { $('profileName').value = user.name || 'Ojash Singh'; }
  if ($('profileDisplayName')) { $('profileDisplayName').value = user.displayName || 'OjashSingh'; }
  if ($('profileEmail'))  { $('profileEmail').value = user.email || 'ojash@ojashdesk.com'; }
}

// SIDEBAR & MOBILE
function initSidebar() {
  const overlay = $('sidebarOverlay');
  const sidebar = $('sidebar');
  const menuBtn = $('mobileMenuBtn');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar && sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('active');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar && sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // Apply saved display preferences (from Settings → Appearance) on
  // every page, not just the settings page itself.
  try {
    if (localStorage.getItem('ojashdesk_show_ticket_counts') === 'false') {
      $all('.nav-badge').forEach(b => b.style.display = 'none');
    }
    if (sidebar && localStorage.getItem('ojashdesk_collapse_sidebar') === 'true') {
      sidebar.classList.add('collapsed');
      // Additive-only styling so we don't risk touching existing CSS —
      // hides the safely-identifiable text elements. Nav item labels
      // themselves are plain text nodes (not wrapped in their own span
      // in the original markup), so a full icon-only rail would need
      // markup changes across every page; this gives a real, if partial,
      // compact effect without that risk.
      if (!document.getElementById('_collapsedSidebarStyle')) {
        const style = document.createElement('style');
        style.id = '_collapsedSidebarStyle';
        style.textContent = `
          .sidebar.collapsed .sidebar-logo-text,
          .sidebar.collapsed .sidebar-logo-sub,
          .sidebar.collapsed .sidebar-section-label,
          .sidebar.collapsed .sidebar-user-info { display: none; }
        `;
        document.head.appendChild(style);
      }
    }
  } catch {}
}

// DROPDOWNS
function initDropdowns() {
  document.addEventListener('click', function(e) {
    const dropdownParent = e.target.closest('.dropdown');
    const triggerClicked = dropdownParent && !e.target.closest('.dropdown-menu');

    // Close all dropdowns first (except the one we're about to toggle open)
    $all('.dropdown-menu.open').forEach(m => {
      if (!dropdownParent || m !== dropdownParent.querySelector('.dropdown-menu')) {
        m.classList.remove('open');
      }
    });

    if (dropdownParent && triggerClicked) {
      const menu = dropdownParent.querySelector('.dropdown-menu');
      if (menu) {
        e.stopPropagation();
        menu.classList.toggle('open');
      }
    }
  });
}

// MODALS
function openModal(id) {
  const m = $(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = $(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

function initModals() {
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      $all('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  });
}

// TICKETS DATA
function getTickets() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS.TICKETS));
    if (stored && stored.length) return stored;
  } catch {}
  return window.OD ? [...window.OD.TICKETS_DATA] : [];
}

function saveTickets(tickets) {
  localStorage.setItem(LS.TICKETS, JSON.stringify(tickets));
}

function getNextTicketId() {
  const tickets = getTickets();
  const nums = tickets.map(t => parseInt(t.id.replace('TK-', ''), 10)).filter(n => !isNaN(n));
  return 'TK-' + String((Math.max(0, ...nums) + 1));
}

// TICKET TABLE (tickets.html)
function renderTicketsTable(filter = 'all', priority = '', agent = '', search = '') {
  const tbody = $('ticketsTableBody');
  if (!tbody) return;

  let tickets = getTickets();

  if (filter !== 'all') tickets = tickets.filter(t => t.status === filter);
  if (priority)         tickets = tickets.filter(t => t.priority === priority);
  if (agent)            tickets = tickets.filter(t => t.assignee === agent);
  if (search)           tickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.customer.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  if ($('ticketsCountLabel')) $('ticketsCountLabel').textContent = `Showing ${tickets.length} ticket${tickets.length !== 1 ? 's' : ''}`;

  tbody.innerHTML = tickets.map(t => `
    <tr data-id="${t.id}" style="cursor:pointer;">
      <td><input type="checkbox" onclick="event.stopPropagation()"></td>
      <td><span class="text-muted text-xs">#${t.id}</span></td>
      <td>
        <div style="font-size:0.845rem;font-weight:500;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(t.subject)}</div>
        <div class="text-xs text-muted">${escHtml(t.category || '')}</div>
      </td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar-xs ${t.avatar || 'av-blue'}">${(t.customer||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
          <span class="text-sm">${escHtml(t.customer)}</span>
        </div>
      </td>
      <td><span class="badge badge-${t.status}">${t.status.charAt(0).toUpperCase()+t.status.slice(1)}</span></td>
      <td><span class="badge badge-${t.priority ? t.priority.toLowerCase() : 'medium'}">${t.priority || 'Medium'}</span></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar-xs ${getAgentAvatar(t.assignee)}">${getAgentInitials(t.assignee)}</div>
          <span class="text-sm">${escHtml(t.assignee || 'Unassigned')}</span>
        </div>
      </td>
      <td><span class="${t.sla === 'Breached' ? 'text-danger' : 'text-muted'} text-xs">${escHtml(t.sla || '—')}</span></td>
      <td><span class="text-muted text-xs">${escHtml(t.updated || '')}</span></td>
    </tr>
  `).join('');

  // Row click → open ticket detail
  $all('#ticketsTableBody tr[data-id]').forEach(row => {
    row.addEventListener('click', function() {
      const ticket = tickets.find(t => t.id === this.dataset.id);
      if (ticket) openTicketDetail(ticket);
    });
  });
}

function getAgentInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAgentAvatar(name) {
  const avatars = { 'Ojash Singh': 'av-purple', 'Priya Sharma': 'av-blue', 'Rohan Mehta': 'av-green', 'Arjun Gupta': 'av-orange' };
  return avatars[name] || 'av-blue';
}

// Ticket detail modal for tickets.html
function openTicketDetail(ticket) {
  // Build a quick modal view
  let existing = $('ticketDetailModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.id = 'ticketDetailModal';
  modal.innerHTML = `
    <div class="modal" style="max-width:680px;width:95vw;">
      <div class="modal-header">
        <div>
          <div class="modal-title">#${ticket.id} — ${escHtml(ticket.subject)}</div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <span class="badge badge-${ticket.status}">${ticket.status}</span>
            <span class="badge badge-${(ticket.priority||'medium').toLowerCase()}">${ticket.priority}</span>
          </div>
        </div>
        <button class="modal-close" id="closeTicketDetailModal">✕</button>
      </div>
      <div style="padding:20px;max-height:60vh;overflow-y:auto;">
        <div style="margin-bottom:16px;">
          <div class="text-xs text-muted" style="margin-bottom:4px;">Customer</div>
          <div style="font-size:0.875rem;font-weight:500;">${escHtml(ticket.customer)} &lt;${escHtml(ticket.email)}&gt;</div>
        </div>
        <div style="margin-bottom:16px;">
          <div class="text-xs text-muted" style="margin-bottom:8px;">Conversation</div>
          ${(ticket.messages||[]).map(m => `
            <div style="display:flex;gap:10px;margin-bottom:12px;flex-direction:${m.from==='agent'?'row-reverse':'row'};">
              <div class="avatar-xs ${m.avatar||'av-blue'}" style="flex-shrink:0;">${m.initials||'?'}</div>
              <div style="background:${m.from==='agent'?'var(--brand-primary)':'var(--bg-tertiary)'};color:${m.from==='agent'?'#fff':'var(--text-primary)'};padding:10px 14px;border-radius:12px;font-size:0.83rem;max-width:80%;white-space:pre-line;">${escHtml(m.text)}</div>
            </div>
          `).join('')}
        </div>
        <div class="form-group">
          <label class="form-label">Reply</label>
          <textarea class="form-textarea" id="tdReplyInput" rows="3" placeholder="Type your reply..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <div style="display:flex;gap:8px;align-items:center;">
          <label class="form-label" style="margin:0;">Status:</label>
          <select class="form-select" id="tdStatus" style="width:130px;">
            <option ${ticket.status==='open'?'selected':''}>open</option>
            <option ${ticket.status==='pending'?'selected':''}>pending</option>
            <option ${ticket.status==='resolved'?'selected':''}>resolved</option>
            <option ${ticket.status==='closed'?'selected':''}>closed</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary" id="tdCloseBtn">Cancel</button>
          <button class="btn btn-primary" id="tdSendBtn">Send Reply</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#closeTicketDetailModal').addEventListener('click', () => modal.remove());
  modal.querySelector('#tdCloseBtn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  modal.querySelector('#tdSendBtn').addEventListener('click', () => {
    const reply  = $('tdReplyInput').value.trim();
    const status = $('tdStatus').value;
    if (!reply) { showToast('Please enter a reply.', 'warning'); return; }

    const tickets  = getTickets();
    const idx      = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) {
      const user = getCurrentUser();
      tickets[idx].status  = status;
      tickets[idx].updated = 'Just now';
      (tickets[idx].messages = tickets[idx].messages || []).push({
        from: 'agent', name: user.name, initials: (user.initials || 'OS'),
        avatar: user.avatar || 'av-purple', time: 'Just now', text: reply,
      });
      saveTickets(tickets);
      if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { status, messages: tickets[idx].messages }).catch(console.error);
    }
    showToast('Reply sent successfully!', 'success');
    modal.remove();
    renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
  });
}

// Track current filters
let currentTicketFilter = 'all';
let currentPriorityFilter = '';
let currentAgentFilter = '';
let currentTicketSearch = '';

function initTicketsPage() {
  if (!$('ticketsTableBody')) return;
  renderTicketsTable();

  // Filter tabs
  $all('.filter-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      $all('.filter-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentTicketFilter = this.dataset.status || 'all';
      renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
    });
  });

  // Priority filter
  const pf = $('priorityFilter');
  if (pf) pf.addEventListener('change', () => {
    currentPriorityFilter = pf.value;
    renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
  });

  // Agent filter
  const af = $('agentFilter');
  if (af) af.addEventListener('change', () => {
    currentAgentFilter = af.value;
    renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
  });

  // Search
  const ts = $('ticketSearch');
  if (ts) ts.addEventListener('input', () => {
    currentTicketSearch = ts.value;
    renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
  });

  // Select all
  const sa = $('selectAllTickets');
  if (sa) sa.addEventListener('change', function() {
    $all('#ticketsTableBody input[type=checkbox]').forEach(cb => cb.checked = this.checked);
  });

  // Export
  const exp = $('exportBtn');
  if (exp) exp.addEventListener('click', () => {
    const tickets = getTickets();
    const rows = [
      ['ID', 'Subject', 'Customer', 'Status', 'Priority', 'Assignee', 'SLA', 'Updated'],
      ...tickets.map(t => [t.id, t.subject, t.customer, t.status, t.priority, t.assignee, t.sla, t.updated])
    ];
    const csv = rows.map(r => r.map(c => `"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'ojashdesk_tickets.csv';
    a.click();
    showToast('Tickets exported successfully!', 'success');
  });

  // New Ticket buttons → open modal
  ['newTicketBtn','topNewTicketBtn','newTicketBtn2'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => openModal('newTicketModal'));
  });
  const cn = $('cancelNewTicket');
  if (cn) cn.addEventListener('click', () => closeModal('newTicketModal'));
  const cm = $('closeNewTicketModal');
  if (cm) cm.addEventListener('click', () => closeModal('newTicketModal'));

  // New Ticket form submit
  const form = $('newTicketForm');
  if (form) form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = getCurrentUser();
    const newTicket = {
      id: getNextTicketId(),
      subject:   $('ntSubject').value.trim(),
      category:  $('ntCategory').value,
      priority:  $('ntPriority').value,
      email:     $('ntEmail').value.trim(),
      customer:  $('ntEmail').value.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
      status:    'open',
      assignee:  user.name,
      sla:       '8h left',
      updated:   'Just now',
      created:   new Date().toISOString(),
      channel:   'web',
      tags:      [],
      messages:  [{ from: 'customer', name: 'Customer', initials: '??', avatar: 'av-blue', time: 'Just now', text: $('ntDescription').value.trim() }],
      activity:  [],
      internalNotes: [],
      aiSuggestion: '',
      aiActions: [],
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    setBtnLoading(submitBtn, true, 'Creating...');

    // Send to backend first so we get its authoritative ticket ID —
    // otherwise the frontend's locally-generated ID and the backend's
    // own ID diverge, and every later update/delete for this ticket
    // silently fails against the real API.
    if (window.OjashApi) {
      try {
        const result = await window.OjashApi.createTicket(newTicket);
        if (result && result.ticket && result.ticket.id) newTicket.id = result.ticket.id;
      } catch (err) {
        console.warn('Could not reach backend, ticket saved locally only.', err.message);
        showToast('Could not reach the server — ticket saved locally only.', 'warning');
      }
    }
    setBtnLoading(submitBtn, false);

    const tickets = getTickets();
    tickets.unshift(newTicket);
    saveTickets(tickets);
    closeModal('newTicketModal');
    form.reset();
    renderTicketsTable(currentTicketFilter, currentPriorityFilter, currentAgentFilter, currentTicketSearch);
    showToast(`Ticket ${newTicket.id} created!`, 'success');
  });
}

// INBOX PAGE (index.html)
// Inbox pagination
let inboxPage = 1;
const INBOX_PAGE_SIZE = 7;

function renderInboxList(filter = 'all', search = '') {
  const list = $('ticketList');
  if (!list) return;

  let tickets = getTickets();
  if (filter !== 'all') tickets = tickets.filter(t => t.status === filter);
  if (search) tickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.customer.toLowerCase().includes(search.toLowerCase())
  );
  window._inboxFilteredTickets = tickets;

  const totalPages = Math.ceil(tickets.length / INBOX_PAGE_SIZE) || 1;
  if (inboxPage > totalPages) inboxPage = totalPages;
  const start = (inboxPage - 1) * INBOX_PAGE_SIZE;
  const paged = tickets.slice(start, start + INBOX_PAGE_SIZE);

  list.innerHTML = paged.map((t, i) => `
    <div class="ticket-item ${i===0&&inboxPage===1?'active':''}" data-id="${t.id}" tabindex="0">
      <div class="ticket-item-header">
        <div class="ticket-item-avatar ${getAgentAvatar(t.customer) || 'av-blue'}">${getAgentInitials(t.customer)}</div>
        <div class="ticket-item-meta">
          <div class="ticket-item-id">#${t.id}</div>
          <div class="badge badge-${(t.priority||'medium').toLowerCase()} badge-xs">${t.priority||'Medium'}</div>
        </div>
      </div>
      <div class="ticket-item-subject">${escHtml(t.subject)}</div>
      <div class="ticket-item-footer">
        <span>${escHtml(t.customer)}</span>
        <span class="text-muted text-xs">• ${escHtml(t.updated||'')}</span>
        <span class="ticket-item-comments"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>${(t.messages||[]).length}</span>
      </div>
    </div>
  `).join('') || '<div class="empty-state" style="padding:40px;text-align:center;"><p>No tickets found.</p></div>';

  // Update pagination buttons
  const prevBtn = $('prevPage'), nextBtn = $('nextPage');
  if (prevBtn) prevBtn.disabled = (inboxPage <= 1);
  if (nextBtn) nextBtn.disabled = (inboxPage >= totalPages);
  $all('.pagination-btn:not(#prevPage):not(#nextPage)').forEach(btn => {
    const n = parseInt(btn.textContent);
    if (!isNaN(n)) btn.classList.toggle('active', n === inboxPage);
  });

  $all('#ticketList .ticket-item').forEach(item => {
    item.addEventListener('click', function() {
      $all('#ticketList .ticket-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      const ticket = tickets.find(t => t.id === this.dataset.id);
      if (ticket) renderTicketDetail(ticket);
    });
  });

  const first = paged[0];
  if (first) renderTicketDetail(first);
}

function renderTicketDetail(ticket) {
  const convArea = $('conversationArea');
  if (!convArea) return;

  // Update header info
  const setProp = (id, val) => { const el = $(id); if (el) el.textContent = val; };
  const setHtml = (id, val) => { const el = $(id); if (el) el.innerHTML = val; };
  const setVal  = (id, val) => { const el = $(id); if (el) el.value = val; };

  // Ticket header
  const headerTitle = $q('.ticket-detail-header .ticket-detail-id');
  if (headerTitle) headerTitle.textContent = `#${ticket.id}`;
  const headerSubject = $q('.ticket-detail-subject');
  if (headerSubject) headerSubject.textContent = ticket.subject;

  // Customer info (right panel)
  const customer = getCustomers().find(c => c.id === ticket.customerId) || null;

  const custName = $q('.customer-name');
  if (custName) {
    custName.innerHTML = escHtml(ticket.customer) +
      (customer && customer.plan === 'Enterprise' ? ' <span class="badge badge-vip">VIP</span>' : '');
  }
  const custEmail = $q('.customer-email');
  if (custEmail) {
    const icon = custEmail.querySelector('svg');
    custEmail.textContent = ticket.email;
    if (icon) custEmail.prepend(icon);
  }

  // Avatar (initials + color) — must match the actual customer, not whoever rendered last
  const custAvatar = $q('.customer-big-avatar');
  if (custAvatar) {
    custAvatar.className = 'customer-big-avatar ' + (customer ? customer.avatar : 'av-blue');
    custAvatar.textContent = customer ? customer.initials : (ticket.customer || '??').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }

  // Location + phone rows (first two .customer-detail-row elements)
  const detailRows = document.querySelectorAll('.customer-detail-row');
  if (detailRows[0]) {
    const icon = detailRows[0].querySelector('svg');
    detailRows[0].textContent = customer ? customer.location : '—';
    if (icon) detailRows[0].prepend(icon);
  }
  if (detailRows[1]) {
    const icon = detailRows[1].querySelector('svg');
    detailRows[1].textContent = customer ? customer.phone : '—';
    if (icon) detailRows[1].prepend(icon);
  }

  // Customer stats (Since / Total Tickets / CSAT / Plan)
  const statVals = document.querySelectorAll('.customer-stats .customer-stat-value');
  if (customer && statVals.length >= 4) {
    statVals[0].textContent = customer.since;
    statVals[1].textContent = customer.tickets;
    statVals[2].textContent = (customer.csat ? customer.csat.toFixed(1) : '0.0') + ' ★';
    statVals[3].textContent = customer.plan;
  }

  // Ticket properties
  setVal('propStatus',   ticket.status);
  setVal('propPriority', ticket.priority);
  setVal('propAssignee', ticket.assignee);

  // AI suggestion (matches the .ai-copilot-box markup in the ticket sidebar)
  const aiText = $q('.ai-copilot-body');
  if (aiText) aiText.textContent = ticket.aiSuggestion || 'No AI suggestion available for this ticket.';
  const aiActions = $q('.ai-suggestions');
  if (aiActions) {
    aiActions.innerHTML = (ticket.aiActions && ticket.aiActions.length)
      ? ticket.aiActions.map(a => `<div class="ai-suggestion-item">${escHtml(a)}</div>`).join('')
      : '<div class="ai-suggestion-item">No suggested actions for this ticket.</div>';
  }

  // Conversation
  convArea.innerHTML = (ticket.messages || []).map(m => `
    <div class="message ${m.from === 'agent' ? 'message-agent' : 'message-customer'}">
      <div class="message-avatar ${m.avatar || 'av-blue'}">${m.initials || '??'}</div>
      <div class="message-body">
        <div class="message-meta">
          <strong>${escHtml(m.name)}</strong>
          ${m.from === 'agent' ? '<span class="badge" style="font-size:0.68rem;padding:2px 6px;">Agent</span>' : ''}
          <span class="text-muted text-xs">${escHtml(m.time)}</span>
          ${m.edited ? '<span class="text-muted text-xs">(Edited)</span>' : ''}
        </div>
        <div class="message-text">${escHtml(m.text).replace(/\n/g,'<br>')}</div>
      </div>
    </div>
  `).join('');

  // Scroll to bottom of conversation
  convArea.scrollTop = convArea.scrollHeight;

  // Wire send button
  const sendBtn  = $('sendReplyBtn');
  const replyInp = $('replyInput');
  if (sendBtn && replyInp) {
    sendBtn.onclick = () => {
      const text = replyInp.value.trim();
      if (!text) { showToast('Please enter a message.', 'warning'); return; }
      const user = getCurrentUser();

      const tickets = getTickets();
      const idx = tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        (tickets[idx].messages = tickets[idx].messages || []).push({
          from: 'agent', name: user.name,
          initials: user.initials || 'OS',
          avatar: user.avatar || 'av-purple',
          time: 'Just now', text,
        });
        tickets[idx].updated = 'Just now';
        saveTickets(tickets);
        ticket.messages = tickets[idx].messages;
        if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { messages: tickets[idx].messages, updated: 'Just now' }).catch(console.error);
      }
      replyInp.value = '';
      renderTicketDetail(ticket);
      showToast('Reply sent!', 'success');
    };
  }

  // Wire property changes
  const propStatus = $('propStatus');
  if (propStatus) propStatus.onchange = () => {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) { tickets[idx].status = propStatus.value; saveTickets(tickets); }
    // also update backend
    if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { status: propStatus.value }).catch(console.error);
    showToast('Status updated.', 'success');
    renderInboxList();
  };
  const propPriority = $('propPriority');
  if (propPriority) propPriority.onchange = () => {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) { tickets[idx].priority = propPriority.value; saveTickets(tickets); }
    if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { priority: propPriority.value }).catch(console.error);
    showToast('Priority updated.', 'success');
  };
  const propAssignee = $('propAssignee');
  if (propAssignee) propAssignee.onchange = () => {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) { tickets[idx].assignee = propAssignee.value; saveTickets(tickets); }
    if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { assignee: propAssignee.value }).catch(console.error);
    showToast('Assignee updated.', 'success');
  };

  // Close ticket
  const closeBtn = $('closeTicketBtn');
  if (closeBtn) closeBtn.onclick = () => {
    const tickets = getTickets();
    const idx = tickets.findIndex(t => t.id === ticket.id);
    if (idx !== -1) { tickets[idx].status = 'closed'; saveTickets(tickets); ticket.status = 'closed'; }
    if (window.OjashApi) window.OjashApi.updateTicket(ticket.id, { status: 'closed' }).catch(console.error);
    showToast('Ticket closed.', 'info');
    renderInboxList();
  };

  // AI suggestions apply
  const applyBtn = $('applySuggestionsBtn');
  if (applyBtn && replyInp) {
    applyBtn.onclick = () => {
      if (ticket.aiActions && ticket.aiActions.length) {
        replyInp.value = `Hi ${ticket.customer.split(' ')[0]},\n\nBased on our analysis, here are the suggested steps:\n${ticket.aiActions.map(a => '• ' + a).join('\n')}\n\nPlease let us know if this helps!\n\n— Ojash Desk Support`;
        showToast('AI suggestions applied!', 'success');
      }
    };
  }

  // AI Assist button in reply area
  const aiAssist = $('aiAssistBtn');
  if (aiAssist && replyInp) {
    aiAssist.onclick = () => {
      if (ticket.aiActions && ticket.aiActions.length) {
        replyInp.value = `Hi ${ticket.customer.split(' ')[0]},\n\nThank you for reaching out! Based on the issue you described, I recommend:\n${ticket.aiActions.map(a => '• ' + a).join('\n')}\n\nPlease try these steps and let me know if you need further assistance.\n\n— ${getCurrentUser().name}`;
        showToast('AI draft loaded.', 'info');
      } else {
        replyInp.value = `Hi ${ticket.customer.split(' ')[0]},\n\nThank you for reaching out to Ojash Desk Support. I'll look into this right away and get back to you shortly.\n\n— ${getCurrentUser().name}`;
        showToast('AI draft loaded.', 'info');
      }
    };
  }
}

function initInboxPage() {
  if (!$('ticketList')) return;

  renderInboxList();

  // Filter tabs
  $all('.filter-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      $all('.filter-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderInboxList(this.dataset.filter || 'all', $('globalSearch') ? $('globalSearch').value : '');
    });
  });

  // Global search
  const gs = $('globalSearch');
  if (gs) gs.addEventListener('input', () => {
    const active = $q('.filter-tab.active');
    renderInboxList(active ? active.dataset.filter || 'all' : 'all', gs.value);
  });

  // New ticket buttons → open modal
  ['newTicketBtn', 'topNewTicketBtnInbox'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => openModal('newTicketModal'));
  });

  // New Ticket modal close
  const cn = $('cancelNewTicket');
  if (cn) cn.addEventListener('click', () => closeModal('newTicketModal'));
  const cm = $('closeNewTicketModal');
  if (cm) cm.addEventListener('click', () => closeModal('newTicketModal'));

  // New Ticket form submit (inbox page)
  const ntForm = $('newTicketForm');
  if (ntForm && !ntForm.dataset.bound) {
    ntForm.dataset.bound = '1';
    ntForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const user = getCurrentUser();
      const newTicket = {
        id: getNextTicketId(),
        subject:  $('ntSubject').value.trim(),
        category: $('ntCategory').value,
        priority: $('ntPriority').value,
        email:    $('ntEmail').value.trim(),
        customer: $('ntEmail').value.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
        status:   'open',
        assignee: user.name,
        sla:      '8h left',
        updated:  'Just now',
        created:  new Date().toISOString(),
        channel:  'web',
        tags:     [],
        messages: [{ from:'customer', name:'Customer', initials:'??', avatar:'av-blue', time:'Just now', text: $('ntDescription').value.trim() }],
        activity: [], internalNotes: [], aiSuggestion: '', aiActions: [],
      };

      const submitBtn2 = ntForm.querySelector('button[type="submit"]');
      setBtnLoading(submitBtn2, true, 'Creating...');

      if (window.OjashApi) {
        try {
          const result = await window.OjashApi.createTicket(newTicket);
          if (result && result.ticket && result.ticket.id) newTicket.id = result.ticket.id;
        } catch (err) {
          console.warn('Could not reach backend, ticket saved locally only.', err.message);
          showToast('Could not reach the server — ticket saved locally only.', 'warning');
        }
      }
      setBtnLoading(submitBtn2, false);

      const tickets = getTickets();
      tickets.unshift(newTicket);
      saveTickets(tickets);
      closeModal('newTicketModal');
      ntForm.reset();
      renderInboxList();
      showToast(`Ticket ${newTicket.id} created!`, 'success');
    });
  }

  // Inbox pagination
  const prevBtn = $('prevPage');
  const nextBtn = $('nextPage');
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (inboxPage > 1) { inboxPage--; const active = $q('.filter-tab.active'); renderInboxList(active ? active.dataset.filter||'all':'all', $('globalSearch') ? $('globalSearch').value : ''); }
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const tickets = window._inboxFilteredTickets || getTickets();
    const totalPages = Math.ceil(tickets.length / INBOX_PAGE_SIZE) || 1;
    if (inboxPage < totalPages) { inboxPage++; const active = $q('.filter-tab.active'); renderInboxList(active ? active.dataset.filter||'all':'all', $('globalSearch') ? $('globalSearch').value : ''); }
  });
  // Number page buttons
  $all('.pagination-btn:not(#prevPage):not(#nextPage)').forEach(btn => {
    if (!isNaN(parseInt(btn.textContent))) {
      btn.addEventListener('click', function() {
        inboxPage = parseInt(this.textContent);
        $all('.pagination-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const active = $q('.filter-tab.active');
        renderInboxList(active ? active.dataset.filter||'all':'all', $('globalSearch') ? $('globalSearch').value : '');
      });
    }
  });

  // What's New button
  const wnBtn = $('whatsNewBtn');
  if (wnBtn) wnBtn.addEventListener('click', () => openModal('whatsNewModal'));
  const cwn1 = $('closeWhatsNewModal');
  if (cwn1) cwn1.addEventListener('click', () => closeModal('whatsNewModal'));
  const cwn2 = $('closeWhatsNewModalBtn');
  if (cwn2) cwn2.addEventListener('click', () => closeModal('whatsNewModal'));

  // Ticket tabs (Conversation / Internal Notes / Activity / Attachments)
  $all('.ticket-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      $all('.ticket-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.tab;
      $all('.ticket-tab-content').forEach(c => {
        c.classList.toggle('active', c.dataset.tabContent === target);
      });
    });
  });

  // Reply tabs (Reply / Internal Note)
  $all('.reply-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      $all('.reply-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const ri = $('replyInput');
      if (ri) ri.placeholder = this.dataset.replyTab === 'note' ? 'Add an internal note (only visible to agents)...' : 'Type your reply...';
    });
  });

  // Quick action buttons
  $all('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const label = this.textContent.trim();
      const ri = $('replyInput');
      if (label.includes('Reset Password') && ri) {
        ri.value = 'Hi, I\'ve sent a password reset link to your registered email address. Please check your inbox and spam folder. Let me know if you need further assistance!';
        showToast('Reset Password template loaded.', 'info');
      } else if (label.includes('Verify Email') && ri) {
        ri.value = 'Hi, could you please verify the email address associated with your account? This will help us locate your account and resolve the issue faster.';
        showToast('Verify Email template loaded.', 'info');
      } else if (label.includes('Spam') && ri) {
        ri.value = 'Hi, please check your spam or promotions folder for the email we sent. Sometimes automated emails can end up there. Let us know if you still can\'t find it!';
        showToast('Check Spam template loaded.', 'info');
      } else {
        showToast(`${label} — coming soon!`, 'info');
      }
    });
  });

  // Update dropdown items (Mark as Pending, Mark as Resolved, Save changes)
  $all('#updateDropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
      const label = this.textContent.trim();
      const ps = $('propStatus');
      if (label === 'Mark as Pending' && ps) { ps.value = 'Pending'; ps.dispatchEvent(new Event('change')); }
      else if (label === 'Mark as Resolved' && ps) { ps.value = 'Resolved'; ps.dispatchEvent(new Event('change')); }
      else { showToast('Changes saved!', 'success'); }
    });
  });

  // More dropdown items
  $all('#moreDropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
      const label = this.textContent.trim();
      if (label === 'Delete ticket') {
        const activeItem = $q('#ticketList .ticket-item.active');
        const ticketId = activeItem ? activeItem.dataset.id : null;
        if (!ticketId) { showToast('No ticket selected.','warning'); return; }
        if (confirm('Delete this ticket? This cannot be undone.')) {
          const tickets = getTickets();
          const filtered = tickets.filter(t => t.id !== ticketId);
          saveTickets(filtered);
          // also delete from backend
          if (window.OjashApi) window.OjashApi.deleteTicket(ticketId).catch(console.error);
          renderInboxList();
          showToast('Ticket deleted.', 'error');
        }
      } else if (label === 'Print ticket') {
        window.print();
      } else if (label === 'Merge ticket') {
        showToast('Select another ticket to merge with — coming soon!', 'info');
      } else {
        showToast(`${label} applied!`, 'info');
      }
    });
  });

  // Close AI box
  const closeAi = $('closeAiBox');
  const aiBox   = $('sidebarAiBox');
  if (closeAi && aiBox) closeAi.addEventListener('click', () => aiBox.style.display = 'none');

  // Sidebar AI ask button — generates a real keyword-matched answer
  // and renders it inline instead of a "coming soon" placeholder.
  const aiAskBtn = $q('.sidebar-ai-btn');
  if (aiAskBtn) aiAskBtn.addEventListener('click', () => {
    const q = prompt('Ask AI Copilot anything:');
    if (!q || !q.trim()) return;

    const result = getCopilotAnswer(q.trim());

    let panel = $('sidebarAiAnswer');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sidebarAiAnswer';
      panel.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border-brand);';
      aiAskBtn.insertAdjacentElement('afterend', panel);
    }
    panel.innerHTML = `
      <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">You asked: "${escHtml(q.trim())}"</div>
      <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.5;margin-bottom:8px;">${escHtml(result.answer)}</div>
      <div class="ai-suggestions" style="margin-bottom:0;">
        ${result.actions.map(a => `<div class="ai-suggestion-item">${escHtml(a)}</div>`).join('')}
      </div>
    `;
    aiAskBtn.textContent = 'Ask another question →';
    showToast('AI Copilot answered your question!', 'success');
  });

  // Filter icon button (funnel icon next to filter tabs)
  const filterIconBtn = $q('.filter-icon-btn');
  if (filterIconBtn) {
    filterIconBtn.addEventListener('click', function() {
      const filters = ['All','Open','Pending','Resolved','Closed'];
      const current = $q('.filter-tab.active');
      const currentFilter = current ? current.dataset.filter || 'all' : 'all';
      showToast('Filter: ' + filters[filters.indexOf(filters.find(f=>f.toLowerCase()===currentFilter))||0] + ' — use the tabs above to filter', 'info');
    });
  }

  // Tag add button
  $all('.tag-add-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tag = prompt('Add a tag:');
      if (!tag || !tag.trim()) return;
      const wrap = this.closest('.ticket-tags-wrap') || this.parentElement;
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.style.cssText = 'padding:2px 8px;background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:20px;font-size:0.75rem;cursor:pointer;';
      chip.textContent = tag.trim();
      chip.onclick = () => chip.remove();
      wrap.insertBefore(chip, this);
      showToast('Tag "' + tag.trim() + '" added!', 'success');
    });
  });

  // Ticket sidebar toggle (collapse/expand customer info panel)
  const sidebarToggle = $q('.ticket-sidebar-toggle');
  const ticketSidebar = $q('.ticket-sidebar');
  if (sidebarToggle && ticketSidebar) {
    sidebarToggle.addEventListener('click', function() {
      const isCollapsed = ticketSidebar.style.display === 'none';
      ticketSidebar.style.display = isCollapsed ? '' : 'none';
      this.title = isCollapsed ? 'Hide customer info' : 'Show customer info';
    });
  }

  // Reply toolbar buttons (attach, emoji, canned)
  $all('.reply-tool-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const title = (this.title || this.getAttribute('data-title') || '').toLowerCase();
      const ri = $('replyInput');
      if (title.includes('attach') || title.includes('file')) {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.multiple = true;
        inp.onchange = () => {
          if (inp.files.length) showToast(inp.files.length + ' file(s) attached!', 'success');
        };
        inp.click();
      } else if (title.includes('emoji')) {
        const emojis = ['😊','👍','🙏','✅','❌','⚠️','💡','🔧'];
        const pick = emojis[Math.floor(Math.random()*emojis.length)];
        if (ri) { ri.value += pick; ri.focus(); }
        showToast('Emoji ' + pick + ' inserted!', 'info');
      } else if (title.includes('canned') || title.includes('response')) {
        const canned = window.OD && window.OD.CANNED_RESPONSES ? window.OD.CANNED_RESPONSES : [];
        if (!canned.length) { showToast('No canned responses available.','warning'); return; }
        const opts = canned.map((c,i) => (i+1)+'. '+c.title).join('\n');
        const pick = prompt('Choose a canned response:\n' + opts + '\n\nEnter number:');
        if (pick) {
          const idx = parseInt(pick) - 1;
          if (canned[idx] && ri) { ri.value = canned[idx].body || canned[idx].title; ri.focus(); showToast('Canned response loaded!','success'); }
        }
      }
    });
  });

  // Reply send dropdown
  const replySendDropdown = $q('.reply-send-dropdown');
  if (replySendDropdown) {
    replySendDropdown.addEventListener('click', function(e) {
      e.stopPropagation();
      const existing = $q('.reply-send-menu');
      if (existing) { existing.remove(); return; }
      const menu = document.createElement('div');
      menu.className = 'reply-send-menu';
      menu.style.cssText = 'position:absolute;bottom:100%;right:0;background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:4px 0;min-width:180px;z-index:100;';
      menu.innerHTML = ['Send & Close','Send & Pending','Send as Note'].map(opt =>
        `<div class="dropdown-item" style="padding:8px 14px;cursor:pointer;font-size:0.85rem;">${opt}</div>`
      ).join('');
      menu.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          $('sendReplyBtn') && $('sendReplyBtn').click();
          menu.remove();
          showToast(item.textContent + ' — applied!', 'info');
        });
      });
      const parent = this.closest('div') || this.parentElement;
      parent.style.position = 'relative';
      parent.appendChild(menu);
      setTimeout(() => document.addEventListener('click', () => menu.remove(), {once:true}), 0);
    });
  }

  // Copy link & star buttons in ticket detail header
  $all('.btn-icon.btn-ghost').forEach(btn => {
    btn.addEventListener('click', function() {
      const title = this.getAttribute('title') || '';
      if (title.includes('Copy')) {
        navigator.clipboard?.writeText(window.location.href).catch(()=>{});
        showToast('Link copied to clipboard!', 'success');
      } else if (title.includes('Star')) {
        showToast('Ticket starred!', 'info');
      }
    });
  });
}

// CUSTOMERS PAGE
function getCustomers() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS.CUSTOMERS));
    if (stored && stored.length) return stored;
  } catch {}
  return window.OD ? [...window.OD.CUSTOMERS_DATA] : [];
}

function saveCustomers(customers) {
  localStorage.setItem(LS.CUSTOMERS, JSON.stringify(customers));
}

function renderCustomersTable(search = '', plan = '') {
  const tbody = $('customersTableBody');
  if (!tbody) return;

  let customers = getCustomers();
  if (search) customers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company||'').toLowerCase().includes(search.toLowerCase())
  );
  if (plan) customers = customers.filter(c => c.plan === plan);

  tbody.innerHTML = customers.map(c => `
    <tr data-id="${c.id}" style="cursor:pointer;">
      <td><input type="checkbox" onclick="event.stopPropagation()"></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar-xs ${c.avatar||'av-blue'}">${c.initials||'??'}</div>
          <div>
            <div style="font-size:0.845rem;font-weight:500;">${escHtml(c.name)}</div>
            <div class="text-xs text-muted">${escHtml(c.email)}</div>
          </div>
        </div>
      </td>
      <td class="text-sm">${escHtml(c.company||'—')}</td>
      <td><span class="badge badge-${c.plan==='Enterprise'?'urgent':c.plan==='Pro'?'open':'closed'}">${c.plan}</span></td>
      <td class="text-sm">${c.tickets||0}</td>
      <td class="text-sm">${c.lifetime||'$0.00'}</td>
      <td>
        <div class="csat-stars" style="font-size:0.8rem;">
          ${c.csat ? '★'.repeat(Math.round(c.csat)) + '☆'.repeat(5-Math.round(c.csat)) : '—'}
        </div>
      </td>
      <td class="text-xs text-muted">${c.since||'—'}</td>
      <td>
        <button class="btn btn-secondary btn-sm view-customer-btn" data-id="${c.id}" onclick="event.stopPropagation()">View</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted);">No customers found.</td></tr>';

  // View customer detail
  $all('.view-customer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const customer = customers.find(c => c.id === this.dataset.id);
      if (customer) openCustomerDetail(customer);
    });
  });
}

function openCustomerDetail(c) {
  const body = $('customerDetailBody');
  if (!body) return;
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
      <div class="avatar-lg ${c.avatar||'av-blue'}">${c.initials||'??'}</div>
      <div>
        <div style="font-size:1.1rem;font-weight:700;">${escHtml(c.name)}</div>
        <div class="text-muted text-sm">${escHtml(c.email)}</div>
        <div style="margin-top:6px;"><span class="badge badge-${c.plan==='Enterprise'?'urgent':c.plan==='Pro'?'open':'closed'}">${c.plan}</span></div>
      </div>
    </div>
    <div class="grid-2" style="gap:12px;margin-bottom:20px;">
      <div class="stat-card"><div class="stat-label">Total Tickets</div><div class="stat-value">${c.tickets||0}</div></div>
      <div class="stat-card"><div class="stat-label">Lifetime Value</div><div class="stat-value">${c.lifetime||'$0.00'}</div></div>
      <div class="stat-card"><div class="stat-label">CSAT Score</div><div class="stat-value">${c.csat||'—'}</div></div>
      <div class="stat-card"><div class="stat-label">Customer Since</div><div class="stat-value" style="font-size:0.875rem;">${c.since||'—'}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;font-size:0.875rem;margin-bottom:20px;">
      <div><strong>Company:</strong> ${escHtml(c.company||'—')}</div>
      <div><strong>Phone:</strong> ${escHtml(c.phone||'—')}</div>
      <div><strong>Location:</strong> ${escHtml(c.location||'—')}</div>
    </div>
    <div class="modal-footer" style="padding:0;border:none;">
      <button type="button" class="btn btn-secondary" id="editCustomerBtn">Edit</button>
      <button type="button" class="btn btn-danger" id="deleteCustomerBtn">Delete</button>
    </div>
  `;
  openModal('customerDetailModal');

  const editBtn = $('editCustomerBtn');
  if (editBtn) editBtn.onclick = () => {
    closeModal('customerDetailModal');
    openCustomerEditForm(c);
  };

  const delBtn = $('deleteCustomerBtn');
  if (delBtn) delBtn.onclick = async () => {
    if (!confirm(`Delete ${c.name}? This cannot be undone.`)) return;
    if (window.OjashApi) {
      try { await window.OjashApi.deleteCustomer(c.id); }
      catch (err) { showToast('Could not delete on server — removed locally only.', 'error'); }
    }
    const customers = getCustomers().filter(x => x.id !== c.id);
    saveCustomers(customers);
    closeModal('customerDetailModal');
    renderCustomersTable();
    if ($('customerCardsGrid')) renderCustomerGrid();
    showToast('Customer deleted.', 'info');
  };
}

// Opens the Add Customer modal pre-filled for editing an existing customer
function openCustomerEditForm(c) {
  const modal = $('addCustomerModal');
  if (!modal) return;
  modal.dataset.editingId = c.id;
  const title = $('addCustomerModalTitle');
  if (title) title.textContent = 'Edit Customer';
  const submitBtn = $('addCustomerSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Save Changes';

  const [firstName, ...rest] = (c.name || '').split(' ');
  if ($('acFirstName')) $('acFirstName').value = firstName || '';
  if ($('acLastName'))  $('acLastName').value  = rest.join(' ') || '';
  if ($('acEmail'))     $('acEmail').value     = c.email || '';
  if ($('acPhone'))     $('acPhone').value     = c.phone || '';
  if ($('acCompany'))   $('acCompany').value   = c.company || '';
  if ($('acPlan'))      $('acPlan').value      = c.plan || 'Free';
  if ($('acLocation'))  $('acLocation').value  = c.location || '';

  openModal('addCustomerModal');
}

function resetCustomerForm(form) {
  if (form) form.reset();
  const modal = $('addCustomerModal');
  if (modal) delete modal.dataset.editingId;
  const title = $('addCustomerModalTitle');
  if (title) title.textContent = 'Add New Customer';
  const submitBtn = $('addCustomerSubmitBtn');
  if (submitBtn) submitBtn.textContent = 'Add Customer';
}

function initCustomersPage() {
  if (!$('customersTableBody')) return;
  renderCustomersTable();

  // Search
  const cs = $('customerSearch');
  if (cs) cs.addEventListener('input', () => {
    const pf = $('planFilter');
    renderCustomersTable(cs.value, pf ? pf.value : '');
  });

  // Plan filter
  const pf = $('planFilter');
  if (pf) pf.addEventListener('change', () => {
    const cs = $('customerSearch');
    renderCustomersTable(cs ? cs.value : '', pf.value);
  });

  // View toggle
  const tbv = $('tableViewBtn');
  const gbv = $('gridViewBtn');
  const tbl = $('customerTableView');
  const grd = $('customerGridView');
  if (tbv && gbv) {
    tbv.addEventListener('click', () => {
      tbv.classList.add('active'); gbv.classList.remove('active');
      if (tbl) tbl.style.display = ''; if (grd) grd.style.display = 'none';
    });
    gbv.addEventListener('click', () => {
      gbv.classList.add('active'); tbv.classList.remove('active');
      if (tbl) tbl.style.display = 'none';
      if (grd) { grd.style.display = ''; renderCustomerGrid(); }
    });
  }

  // Add Customer
  ['addCustomerBtn','addCustomerBtn2'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('click', () => {
      resetCustomerForm($('addCustomerForm'));
      openModal('addCustomerModal');
    });
  });
  const cac = $('closeAddCustomerModal');
  if (cac) cac.addEventListener('click', () => { closeModal('addCustomerModal'); resetCustomerForm($('addCustomerForm')); });
  const cac2 = $('cancelAddCustomer');
  if (cac2) cac2.addEventListener('click', () => { closeModal('addCustomerModal'); resetCustomerForm($('addCustomerForm')); });

  const acForm = $('addCustomerForm');
  if (acForm) acForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const firstName = ($('acFirstName') || {}).value || '';
    const lastName  = ($('acLastName')  || {}).value || '';
    const name = (firstName + ' ' + lastName).trim() || 'New Customer';
    const email   = ($('acEmail')    || {}).value || '';
    const phone   = ($('acPhone')    || {}).value || '';
    const company = ($('acCompany')  || {}).value || '';
    const plan    = ($('acPlan')     || {}).value || 'Free';
    const location= ($('acLocation') || {}).value || '';
    if (!email) { showToast('Email is required.', 'warning'); return; }

    const modal = $('addCustomerModal');
    const editingId = modal ? modal.dataset.editingId : null;
    const submitBtn = acForm.querySelector('button[type="submit"]');

    if (editingId) {
      // EDIT existing customer
      setBtnLoading(submitBtn, true, 'Saving...');
      const updates = { name, email, company, plan, phone, location };
      if (window.OjashApi) {
        try { await window.OjashApi.updateCustomer(editingId, updates); }
        catch (err) { showToast('Could not save to server — saved locally only.', 'error'); }
      }
      setBtnLoading(submitBtn, false);
      const customers = getCustomers();
      const idx = customers.findIndex(c => c.id === editingId);
      if (idx !== -1) Object.assign(customers[idx], updates);
      saveCustomers(customers);
      closeModal('addCustomerModal');
      resetCustomerForm(acForm);
      renderCustomersTable();
      if ($('customerCardsGrid')) renderCustomerGrid();
      showToast('Customer "' + name + '" updated!', 'success');
      return;
    }

    // CREATE new customer
    setBtnLoading(submitBtn, true, 'Creating...');
    const newCustomer = {
      id: 'c' + Date.now(),
      name, email, company, plan, phone, location,
      since: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      orders: 0, lifetime: '$0.00', csat: 0, tickets: 0,
      initials: name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || '??',
      avatar: ['av-blue','av-green','av-orange','av-pink','av-teal'][Math.floor(Math.random()*5)],
    };

    // Send to backend first so we adopt its authoritative ID (same reasoning
    // as tickets — otherwise later edit/delete calls silently 404).
    if (window.OjashApi) {
      try {
        const result = await window.OjashApi.createCustomer(newCustomer);
        if (result && result.id) newCustomer.id = result.id;
      } catch (err) {
        console.warn('Could not reach backend, customer saved locally only.', err.message);
        showToast('Could not reach the server — customer saved locally only.', 'warning');
      }
    }
    setBtnLoading(submitBtn, false);

    const customers = getCustomers();
    customers.unshift(newCustomer);
    saveCustomers(customers);
    closeModal('addCustomerModal');
    resetCustomerForm(acForm);
    renderCustomersTable();
    showToast('Customer "' + name + '" added!', 'success');
  });

  // Close customer detail modal
  const ccd = $('closeCustomerDetail');
  if (ccd) ccd.addEventListener('click', () => closeModal('customerDetailModal'));

  // Export
  const exp = $('exportCustomersBtn');
  if (exp) exp.addEventListener('click', () => {
    const customers = getCustomers();
    const rows = [['Name','Email','Company','Plan','Tickets','Lifetime'],
      ...customers.map(c=>[c.name,c.email,c.company,c.plan,c.tickets,c.lifetime])];
    const csv = rows.map(r=>r.map(c=>`"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
    a.download = 'ojashdesk_customers.csv'; a.click();
    showToast('Customers exported!', 'success');
  });
}

function renderCustomerGrid() {
  const grid = $('customerCardsGrid');
  if (!grid) return;
  const customers = getCustomers();
  grid.innerHTML = customers.map(c => `
    <div class="card" data-cid="${escHtml(c.id)}" style="padding:20px;text-align:center;cursor:pointer;">
      <div class="avatar-lg ${c.avatar||'av-blue'}" style="margin:0 auto 12px;">${c.initials||'??'}</div>
      <div style="font-weight:600;font-size:0.9rem;">${escHtml(c.name)}</div>
      <div class="text-muted text-xs">${escHtml(c.email)}</div>
      <div style="margin-top:8px;"><span class="badge badge-${c.plan==='Enterprise'?'urgent':c.plan==='Pro'?'open':'closed'}">${c.plan}</span></div>
      <div class="text-xs text-muted" style="margin-top:8px;">${c.tickets||0} tickets · ${c.lifetime||'$0'}</div>
    </div>
  `).join('');
  // Bind click handlers safely — avoids JSON.stringify in inline onclick
  $all('#customerCardsGrid .card[data-cid]').forEach(card => {
    card.addEventListener('click', function() {
      const customer = getCustomers().find(c => c.id === this.dataset.cid);
      if (customer) openCustomerDetail(customer);
    });
  });
}
window.openCustomerDetail = openCustomerDetail;

// ANALYTICS PAGE
function renderAnalytics() {
  const vchart = $('volumeChart');
  // analytics.html has its own complete inline chart renderer; skip to avoid overwriting
  if (!vchart || !window.OD) return;
  if (vchart.children.length > 0) return; // already rendered by page's inline script
  const data = window.OD.ANALYTICS_DATA;

  // Volume bar chart
  const maxV = Math.max(...data.volumeByDay.map(d=>d.tickets));
  vchart.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:8px;height:160px;padding:0 8px;">
      ${data.volumeByDay.map(d => `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;">
          <div style="font-size:0.72rem;color:var(--text-muted);">${d.tickets}</div>
          <div style="width:100%;background:var(--brand-primary);border-radius:4px 4px 0 0;height:${Math.round((d.tickets/maxV)*120)}px;opacity:0.85;"></div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${d.day}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Channel chart
  const cchart = $('channelChart');
  if (cchart) {
    cchart.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;padding:8px 0;">
      ${data.byChannel.map(ch => `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
            <span>${ch.channel}</span><span style="color:var(--text-muted);">${ch.count} (${ch.pct}%)</span>
          </div>
          <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${ch.pct}%;background:var(--brand-primary);border-radius:4px;"></div>
          </div>
        </div>
      `).join('')}
    </div>`;
  }

  // Agent performance
  const ap = $('agentPerformance');
  if (ap) {
    ap.innerHTML = data.agentPerformance.map(a => `
      <div class="flex items-center gap-3" style="padding:10px 0;border-bottom:1px solid var(--border-subtle);">
        <div class="avatar-xs ${a.avatar}">${a.initials}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.845rem;font-weight:500;">${a.name}</div>
          <div class="text-xs text-muted">${a.open} open</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.845rem;font-weight:600;color:var(--brand-accent);">${a.resolved}</div>
          <div class="text-xs text-muted">resolved</div>
        </div>
        <div style="text-align:right;min-width:50px;">
          <div style="font-size:0.845rem;font-weight:600;">${a.csat}</div>
          <div class="text-xs text-muted">CSAT</div>
        </div>
        <div style="text-align:right;min-width:50px;">
          <div style="font-size:0.845rem;font-weight:600;">${a.avgTime}</div>
          <div class="text-xs text-muted">avg time</div>
        </div>
      </div>
    `).join('');
  }

  // Export report
  const expBtn = $('exportReport');
  if (expBtn) expBtn.addEventListener('click', () => {
    showToast('Report downloaded as CSV!', 'success');
  });

  // Date range
  const dr = $('dateRange');
  if (dr) dr.addEventListener('change', () => showToast(`Showing data for: ${dr.options[dr.selectedIndex].text}`, 'info'));
}

// BILLING PAGE
function initBillingPage() {
  // Billing toggle (monthly/yearly)
  const bt = $('billingToggle');
  const pp = $('proPrice');
  const ep = $('entPrice');
  if (bt) bt.addEventListener('change', function() {
    if (pp) pp.innerHTML = this.checked ? '$39 <span>/month</span>' : '$49 <span>/month</span>';
    if (ep) ep.innerHTML = this.checked ? '$119 <span>/month</span>' : '$149 <span>/month</span>';
    showToast(this.checked ? 'Yearly pricing shown — save 20%!' : 'Monthly pricing shown.', 'info');
  });

  // Upgrade modal
  const ub = $('upgradeBtn');
  const ub2 = $('upgradeEntBtn');
  if (ub)  ub.addEventListener('click',  () => openModal('upgradeModal'));
  if (ub2) ub2.addEventListener('click', () => openModal('upgradeModal'));
  const cu = $('cancelUpgrade');
  const cum = $('closeUpgradeModal');
  if (cu)  cu.addEventListener('click',  () => closeModal('upgradeModal'));
  if (cum) cum.addEventListener('click', () => closeModal('upgradeModal'));

  // Card number formatting
  const cn = $('cardNum');
  if (cn) cn.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim().slice(0,19);
  });
  const ce = $('cardExp');
  if (ce) ce.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').slice(0,5);
  });

  const conf = $('confirmUpgrade');
  if (conf) conf.addEventListener('click', () => {
    const num = ($('cardNum')||{}).value || '';
    if (num.replace(/\s/g,'').length < 16) { showToast('Please enter a valid card number.','error'); return; }
    closeModal('upgradeModal');
    const user = getCurrentUser();
    if (window.OjashApi && user.id) {
      window.OjashApi.updateBilling(user.id, { plan: 'Enterprise' })
        .then(() => showToast('🎉 Upgraded to Enterprise! Welcome to the big leagues.','success', 4000))
        .catch(() => showToast('Upgrade could not be saved to the server — try again.','error'));
    } else {
      showToast('🎉 Upgraded to Enterprise! Welcome to the big leagues.','success', 4000);
    }
  });

  // Cancel plan modal
  const cpBtn = $('cancelPlanBtn');
  if (cpBtn) cpBtn.addEventListener('click', () => openModal('cancelModal'));
  const kp = $('keepPlan');
  const ccm = $('closeCancelModal');
  if (kp)  kp.addEventListener('click',  () => closeModal('cancelModal'));
  if (ccm) ccm.addEventListener('click', () => closeModal('cancelModal'));
  const cc = $('confirmCancel');
  if (cc) cc.addEventListener('click', () => {
    closeModal('cancelModal');
    const user = getCurrentUser();
    if (window.OjashApi && user.id) {
      window.OjashApi.cancelBilling(user.id)
        .then(() => showToast('Subscription cancelled. You\'ll retain access until end of billing period.','info', 4000))
        .catch(() => showToast('Cancellation could not be saved to the server — try again.','error'));
    } else {
      showToast('Subscription cancelled. You\'ll retain access until end of billing period.','info', 4000);
    }
  });

  // Download invoice / Download all — now handled in billing.html's own
  // inline script using real invoice data fetched from the backend
  // (see downloadInv() and the #downloadAllInvoices listener there).

  // Update card
  const uc = $('updateCardBtn');
  if (uc) uc.addEventListener('click', () => openModal('upgradeModal'));
  const ua = $('updateAddressBtn');
  if (ua) ua.addEventListener('click', () => {
    const addr = prompt('Enter new billing address:');
    if (addr && addr.trim()) {
      showToast('Billing address updated successfully!', 'success');
    }
  });
}

// KNOWLEDGE BASE
function renderKBArticles(search = '', category = '', sort = '') {
  const list = $('articlesList');
  if (!list) return;
  if (!window.OD) window.OD = { KB_ARTICLES: [] };
  if (!window.OD.KB_ARTICLES) window.OD.KB_ARTICLES = [];

  let articles = [...window.OD.KB_ARTICLES];
  if (search)   articles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  if (category) articles = articles.filter(a => a.category === category);
  if (sort === 'views')   articles.sort((a,b) => b.views - a.views);
  else if (sort === 'recent') articles.sort((a,b) => 0); // already ordered

  list.innerHTML = articles.map(a => `
    <div class="kb-article-card" data-id="${a.id}" style="cursor:pointer;padding:16px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:0.9rem;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${escHtml(a.title)}</div>
          <div class="text-xs text-muted">${escHtml(a.category)} · ${a.views.toLocaleString()} views · Updated ${escHtml(a.updated)}</div>
        </div>
        <span class="badge badge-${a.status==='published'?'resolved':'closed'}" style="flex-shrink:0;">${a.status}</span>
      </div>
      <div style="margin-top:8px;font-size:0.82rem;color:var(--text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escHtml(a.content)}</div>
      <div style="display:flex;gap:12px;margin-top:10px;font-size:0.78rem;color:var(--text-muted);">
        <span>👍 ${a.helpful} helpful</span>
        <span>👎 ${a.notHelpful} not helpful</span>
        <span>By ${escHtml(a.author)}</span>
      </div>
    </div>
  `).join('') || '<div class="text-muted" style="padding:40px;text-align:center;">No articles found.</div>';

  $all('.kb-article-card').forEach(card => {
    card.addEventListener('click', function() {
      const art = window.OD.KB_ARTICLES.find(a => a.id === this.dataset.id);
      if (art) openArticleModal(art);
    });
  });
}

// Called by "Trending" sidebar links: openArticle(event, 'Article Title')
function openArticle(e, title) {
  if (e && e.preventDefault) e.preventDefault();
  const list = (window.OD && window.OD.KB_ARTICLES) || [];
  const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const target = norm(title);
  let article = list.find(a => norm(a.title) === target);
  if (!article) {
    // fall back to a partial match (e.g. "Setting up 2FA" -> "Setting up two-factor authentication")
    article = list.find(a => norm(a.title).includes(target) || target.includes(norm(a.title)));
  }
  if (!article) {
    showToast('"' + title + '" isn\'t published yet.', 'info');
    return;
  }
  openArticleModal(article);
}

function openArticleModal(article) {
  const titleEl = $('articleModalTitle');
  const bodyEl  = $q('.modal-article-body');
  if (titleEl) titleEl.textContent = article.title;
  if (bodyEl) bodyEl.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
      <span class="badge badge-open">${escHtml(article.category)}</span>
      <span class="badge badge-${article.status==='published'?'resolved':'closed'}">${article.status}</span>
      <span class="text-xs text-muted" style="line-height:20px;">By ${escHtml(article.author)} · Updated ${escHtml(article.updated)}</span>
    </div>
    <div style="font-size:0.9rem;color:var(--text-secondary);line-height:1.7;">${escHtml(article.content)}</div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-subtle);">
      <div style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">Was this article helpful?</div>
    </div>
  `;
  openModal('articleModal');
  article.views = (article.views || 0) + 1;
  if (window.OjashApi) window.OjashApi.updateKBArticle(article.id, { views: article.views }).catch(console.error);

  const tu = $('thumbUp');
  const td = $('thumbDown');
  if (tu) tu.onclick = () => {
    article.helpful = (article.helpful || 0) + 1;
    if (window.OjashApi) window.OjashApi.updateKBArticle(article.id, { helpful: article.helpful }).catch(console.error);
    showToast('Thanks for your feedback!','success'); tu.style.background='var(--brand-primary)'; tu.style.color='#fff';
  };
  if (td) td.onclick = () => {
    article.notHelpful = (article.notHelpful || 0) + 1;
    if (window.OjashApi) window.OjashApi.updateKBArticle(article.id, { notHelpful: article.notHelpful }).catch(console.error);
    showToast('Sorry it wasn\'t helpful. We\'ll improve it.','info');
  };
}

function initKBPage() {
  if (!$('articlesList')) return;
  renderKBArticles();

  // The article list used to come from a static frontend data.js — now
  // load it from the real backend instead, so it's shared across sessions
  // and actually persists.
  if (window.OjashApi) {
    window.OjashApi.getKBArticles().then(articles => {
      if (Array.isArray(articles) && articles.length) {
        if (!window.OD) window.OD = {};
        window.OD.KB_ARTICLES = articles;
        renderKBArticles();
      }
    }).catch(err => console.warn('Could not load knowledge base articles from backend.', err.message));
  }

  const ks  = $('kbSearch');
  const ks2 = $('kbHeroSearch');
  const acf = $('articleCategoryFilter');
  const asf = $('articleSortFilter');

  const doFilter = () => {
    const s = (ks && ks.value) || (ks2 && ks2.value) || '';
    renderKBArticles(s, acf ? acf.value : '', asf ? asf.value : '');
  };

  if (ks)  ks.addEventListener('input',  doFilter);
  if (ks2) ks2.addEventListener('input', doFilter);
  if (acf) acf.addEventListener('change', doFilter);
  if (asf) asf.addEventListener('change', doFilter);

  const cam = $('closeArticleModal');
  if (cam) cam.addEventListener('click', () => closeModal('articleModal'));
  const nam = $('closeNewArticleModal');
  if (nam) nam.addEventListener('click', () => closeModal('newArticleModal'));

  const nab = $('newArticleBtn');
  if (nab) nab.addEventListener('click', () => openModal('newArticleModal'));

  async function saveArticle(status) {
    const titleEl = $('articleTitle') || $q('#newArticleModal input[type=text]');
    const catEl   = $('articleCategory') || $q('#newArticleModal select');
    const contEl  = $('articleContent') || $q('#newArticleModal textarea');
    const title   = titleEl ? titleEl.value.trim() : '';
    const content2 = contEl ? contEl.value.trim() : '';
    if (!title) { showToast('Please enter a title.','warning'); return; }
    if (!content2) { showToast('Please enter article content.','warning'); return; }
    const user = getCurrentUser();
    const newArt = {
      id: 'art' + Date.now(),
      title,
      category: catEl ? catEl.value : 'General',
      content: content2,
      status,
      author: user.name || 'Ojash Singh',
      updated: new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}),
      views: 0, helpful: 0, notHelpful: 0,
    };

    // Send to backend first so we adopt its authoritative ID — same
    // reasoning as tickets/customers, otherwise later edits would 404.
    if (window.OjashApi) {
      try {
        const result = await window.OjashApi.createKBArticle(newArt);
        if (result && result.id) newArt.id = result.id;
      } catch (err) {
        console.warn('Could not reach backend, article saved locally only.', err.message);
        showToast('Could not reach the server — article saved locally only.', 'warning');
      }
    }

    if (!window.OD.KB_ARTICLES) window.OD.KB_ARTICLES = [];
    window.OD.KB_ARTICLES.unshift(newArt);
    closeModal('newArticleModal');
    renderKBArticles();
    showToast(status === 'published' ? 'Article published!' : 'Article saved as draft!', status === 'published' ? 'success' : 'info');
  }
  const sdb = $('saveDraftBtn');
  if (sdb) sdb.addEventListener('click', () => saveArticle('draft'));
  const pub = $q('#newArticleModal .btn-primary:last-child') || $q('#newArticleModal [type=submit]');
  if (pub && pub !== sdb) pub.addEventListener('click', () => saveArticle('published'));
  // Wire publish button by id only if not already covered by the selector above
  const pubBtn = $('publishArticleBtn');
  if (pubBtn && pubBtn !== pub) pubBtn.addEventListener('click', () => saveArticle('published'));

  const aib = $('aiArticleBtn');
  if (aib) aib.addEventListener('click', () => {
    openModal('newArticleModal');
    const at = $('articleTitle') || $q('#newArticleModal input[type=text]');
    if (at) at.value = 'AI-Generated Article from Recent Ticket';
    const ac = $('articleContent') || $q('#newArticleModal textarea');
    if (ac) ac.value = 'This article was auto-generated based on recent support tickets. Please review and edit before publishing.\n\nCommon steps to resolve this issue:\n1. Check your account settings\n2. Clear browser cache\n3. Contact support if the issue persists';
    showToast('AI content loaded! Review before publishing.','info');
  });

  const mcb = $('manageCategoriesBtn');
  if (mcb) mcb.addEventListener('click', () => {
    const cat = prompt('Enter new category name:');
    if (cat && cat.trim()) {
      showToast('Category "' + cat.trim() + '" created!', 'success');
    }
  });
}

// SETTINGS PAGE
function initSettingsPage() {
  if (!$('section-profile')) return;

  // Section navigation
  $all('.settings-nav-item').forEach(item => {
    item.addEventListener('click', function() {
      $all('.settings-nav-item').forEach(i => i.classList.remove('active'));
      $all('.settings-section').forEach(s => s.classList.remove('active'));
      this.classList.add('active');
      const sec = $('section-' + this.dataset.section);
      if (sec) sec.classList.add('active');
    });
  });

  // Avatar upload
  window.handleAvatarUpload = function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_BYTES = 2 * 1024 * 1024; // 2MB, matches the "Max 2MB" label
    if (file.size > MAX_BYTES) {
      showToast('Photo is too large. Please choose an image under 2MB.', 'error');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file.', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
      const photoUrl = ev.target.result;

      // Verify the image actually decodes before we persist/apply it,
      // so a corrupt/unsupported file never leaves a blank avatar.
      const testImg = new Image();
      testImg.onload = function() {
        const user = getCurrentUser();
        user.photo = photoUrl;

        try {
          localStorage.setItem(LS.USER, JSON.stringify(user));
        } catch (err) {
          showToast('Could not save photo — storage is full. Try a smaller image.', 'error');
          e.target.value = '';
          return;
        }

        // Keep the users list in sync too (so it's not lost on next login)
        try {
          const users = JSON.parse(localStorage.getItem('ojashdesk_users') || '[]');
          const idx = users.findIndex(u => u.email === user.email);
          if (idx !== -1) { users[idx].photo = photoUrl; localStorage.setItem('ojashdesk_users', JSON.stringify(users)); }
        } catch {}

        // Apply everywhere immediately: settings preview, sidebar, topbar
        populateUserUI(user);
        showToast('Avatar updated!','success');
      };
      testImg.onerror = function() {
        showToast('That image could not be loaded. Please try a different file.', 'error');
        e.target.value = '';
      };
      testImg.src = photoUrl;
    };
    reader.onerror = function() {
      showToast('Could not read that file. Please try again.', 'error');
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Avatar removal
  window.handleAvatarRemove = function() {
    const user = getCurrentUser();
    if (!user.photo) {
      showToast('No profile photo to remove.', 'warning');
      return;
    }
    delete user.photo;
    localStorage.setItem(LS.USER, JSON.stringify(user));

    try {
      const users = JSON.parse(localStorage.getItem('ojashdesk_users') || '[]');
      const idx = users.findIndex(u => u.email === user.email);
      if (idx !== -1) { delete users[idx].photo; localStorage.setItem('ojashdesk_users', JSON.stringify(users)); }
    } catch {}

    if ($('avatarInput')) $('avatarInput').value = '';
    populateUserUI(user);
    showToast('Profile photo removed.', 'success');
  };

  // 2FA toggle — now persists to the real user record via PUT /users/:id
  // instead of only showing a toast (it used to reset on every reload).
  window.handle2FA = function(el) {
    const user = getCurrentUser();
    user.twoFactorEnabled = el.checked;
    localStorage.setItem(LS.USER, JSON.stringify(user));
    if (window.OjashApi && user.id) {
      window.OjashApi.updateProfile(user.id, { twoFactorEnabled: el.checked })
        .catch(() => showToast('Saved locally, but could not sync 2FA setting to the server.', 'warning'));
    }
    showToast(el.checked ? '2FA enabled! Check your authenticator app.' : '2FA disabled.', el.checked ? 'success' : 'warning');
  };
  const toggle2fa = $('toggle2fa');
  if (toggle2fa) {
    const cu2fa = getCurrentUser();
    toggle2fa.checked = !!cu2fa.twoFactorEnabled;
  }

  // Canned responses — backed by the real /canned-responses API now,
  // instead of localStorage or the (no-longer-defined) window.OD global.
  function renderCannedList() {
    const cannedList = $('cannedList');
    if (!cannedList) return;
    const list = (window.OD && window.OD.CANNED_RESPONSES) || [];
    if (!list.length) {
      cannedList.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.875rem;">No canned responses yet.</div>';
    } else {
      cannedList.innerHTML = list.map((cr) => `
        <div class="canned-item" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);" data-id="${cr.id}">
          <div style="flex:1;">
            <div style="font-size:0.875rem;font-weight:600;">${escHtml(cr.title)}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${escHtml(cr.shortcode)} — ${escHtml((cr.body||'').slice(0,60))}${(cr.body||'').length>60?'…':''}</div>
          </div>
          <button class="btn btn-secondary btn-sm canned-edit-btn" data-id="${cr.id}">Edit</button>
          <button class="btn btn-secondary btn-sm canned-del-btn" data-id="${cr.id}" style="color:var(--danger);">Delete</button>
        </div>
      `).join('');
    }
    cannedList.innerHTML += `<div style="padding:12px 0;"><button class="btn btn-secondary btn-sm" id="addCannedBtn">+ Add Canned Response</button></div>`;

    $all('.canned-edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.dataset.id;
        const cr = (window.OD.CANNED_RESPONSES || []).find(c => c.id === id);
        if (!cr) return;
        const newTitle = prompt('Edit title:', cr.title);
        if (newTitle === null) return;
        const newBody = prompt('Edit response text:', cr.body || '');
        if (newBody === null) return;
        if (window.OjashApi) {
          window.OjashApi.updateCannedResponse(id, { title: newTitle.trim() || cr.title, body: newBody.trim() || cr.body })
            .then(() => { cr.title = newTitle.trim() || cr.title; cr.body = newBody.trim() || cr.body; cr.text = cr.body; renderCannedList(); showToast('Canned response updated!', 'success'); })
            .catch(() => showToast('Could not save to the server.', 'error'));
        }
      });
    });
    $all('.canned-del-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!confirm('Delete this canned response?')) return;
        const id = this.dataset.id;
        if (window.OjashApi) {
          window.OjashApi.deleteCannedResponse(id)
            .then(() => { window.OD.CANNED_RESPONSES = (window.OD.CANNED_RESPONSES || []).filter(c => c.id !== id); renderCannedList(); showToast('Canned response deleted.', 'warning'); })
            .catch(() => showToast('Could not delete on the server.', 'error'));
        }
      });
    });
    const addBtn = $('addCannedBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
      const title = prompt('Response title (e.g. "Greeting"):');
      if (!title || !title.trim()) return;
      const shortcode = prompt('Shortcode (e.g. /greeting):');
      if (!shortcode || !shortcode.trim()) return;
      const body = prompt('Response text:');
      if (!body || !body.trim()) return;
      if (window.OjashApi) {
        window.OjashApi.createCannedResponse({ title: title.trim(), shortcode: shortcode.trim(), body: body.trim() })
          .then(newCr => { window.OD.CANNED_RESPONSES = window.OD.CANNED_RESPONSES || []; window.OD.CANNED_RESPONSES.push(newCr); renderCannedList(); showToast('Canned response added!', 'success'); })
          .catch(err => showToast(err.message || 'Could not save to the server.', 'error'));
      }
    });
  }
  window.renderCannedList = renderCannedList;
  renderCannedList();

  // Tags — backed by the real /tags API now. Previously this always
  // injected 8 hardcoded tags (Bug, Feature, Billing...) on top of the 6
  // already sitting in the static HTML (bug, billing...) on every load,
  // producing case-mismatched duplicates like "bug" + "Bug". Fixed by
  // clearing the static markup and rendering only the real tag list.
  const tagWrap = $('tagInputWrap');
  function renderTagChips(tagList) {
    if (!tagWrap) return;
    const inp = $('tagInput');
    tagWrap.querySelectorAll('.tag-chip').forEach(el => el.remove());
    tagList.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-chip';
      span.dataset.tag = tag;
      span.innerHTML = `${escHtml(tag)} <span onclick="removeTag(this)" style="cursor:pointer;margin-left:4px;opacity:0.7;">×</span>`;
      tagWrap.insertBefore(span, inp);
    });
  }
  if (tagWrap && window.OjashApi) {
    window.OjashApi.getTags().then(renderTagChips).catch(err => console.warn('Could not load tags from backend.', err.message));
  }
  window.addTag = function(e) {
    if (e.key !== 'Enter') return;
    const inp = $('tagInput');
    if (!inp || !inp.value.trim()) return;
    const name = inp.value.trim();
    if (window.OjashApi) {
      window.OjashApi.createTag(name)
        .then(result => { renderTagChips(result.tags); inp.value = ''; showToast('Tag "' + name + '" added!', 'success'); })
        .catch(err => showToast(err.message || 'Could not save tag.', 'error'));
    }
  };
  window.removeTag = function(el) {
    const chip = el.closest('.tag-chip') || el.parentElement;
    const tagName = chip ? chip.dataset.tag : null;
    if (!tagName) { if (chip) chip.remove(); return; }
    if (window.OjashApi) {
      window.OjashApi.deleteTag(tagName)
        .then(() => { chip.remove(); showToast('Tag removed.', 'warning'); })
        .catch(() => showToast('Could not remove tag on the server.', 'error'));
    }
  };

  // API keys — backed by the real /api-keys API now. This used to be
  // THREE separate, conflicting systems: static HTML with 2 fake keys,
  // this function overwriting them with a localStorage-based list (which
  // silently dropped the "Development Key" the instant the page loaded),
  // and a duplicate "Generate" button binding here alongside the one
  // already wired via settings.html's onclick="generateAPIKey()" — which
  // together would have generated two keys per click.
  function renderApiKeys(keys) {
    const apiList = $('apiKeyList');
    if (!apiList) return;
    if (!keys.length) {
      apiList.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.875rem;">No API keys yet.</div>';
      return;
    }
    apiList.innerHTML = keys.map(k => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);" data-keyid="${k.id}">
        <div style="flex:1;">
          <div style="font-size:0.875rem;font-weight:600;">${escHtml(k.name)}</div>
          <div style="font-size:0.78rem;font-family:monospace;color:var(--text-muted);">${escHtml(k.masked)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Created ${escHtml(k.created)}</div>
        </div>
        <button class="btn btn-secondary btn-sm api-copy-btn" data-key="${k.key}">Copy</button>
        <button class="btn btn-secondary btn-sm api-revoke-btn" data-keyid="${k.id}" style="color:var(--danger);">Revoke</button>
      </div>
    `).join('');
    $all('.api-copy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const key = this.dataset.key;
        navigator.clipboard ? navigator.clipboard.writeText(key).then(() => showToast('API key copied to clipboard!','success')).catch(()=>showToast('API key copied!','success'))
          : showToast('API key copied!','success');
      });
    });
    $all('.api-revoke-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!confirm('Revoke this API key? This cannot be undone.')) return;
        const kid = this.dataset.keyid;
        if (!window.OjashApi) return;
        window.OjashApi.revokeApiKey(kid)
          .then(() => { window.OD_API_KEYS = (window.OD_API_KEYS || []).filter(k => k.id !== kid); renderApiKeys(window.OD_API_KEYS); showToast('API key revoked!','warning'); })
          .catch(() => showToast('Could not revoke on the server.', 'error'));
      });
    });
  }
  window.renderApiKeys = renderApiKeys;
  window.OD_API_KEYS = [];
  if ($('apiKeyList') && window.OjashApi) {
    window.OjashApi.getApiKeys().then(keys => { window.OD_API_KEYS = keys; renderApiKeys(keys); })
      .catch(err => console.warn('Could not load API keys from backend.', err.message));
  }

  // Theme setting in appearance section
  const themeCheckbox = $('themeCheckbox');
  if (themeCheckbox) {
    themeCheckbox.checked = (getTheme() === 'light');
    themeCheckbox.addEventListener('change', toggleTheme);
  }
}

// CUSTOMER PORTAL
function initPortalPage() {
  const ptl = $('portalTicketList');
  if (!ptl || !window.OD) return;

  let portalTickets = window.OD.PORTAL_TICKETS;

  function renderPortalList(search='') {
    let filtered = portalTickets;
    if (search) filtered = filtered.filter(t => t.subject.toLowerCase().includes(search.toLowerCase()));
    if ($('portalTicketCount')) $('portalTicketCount').textContent = `Showing ${filtered.length} ticket${filtered.length!==1?'s':''}`;
    ptl.innerHTML = filtered.map(t => `
      <div class="ticket-card" data-id="${t.id}" style="cursor:pointer;padding:16px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div class="text-xs text-muted" style="margin-bottom:4px;">${t.id}</div>
            <div style="font-size:0.9rem;font-weight:600;">${escHtml(t.subject)}</div>
            <div class="text-xs text-muted" style="margin-top:4px;">${escHtml(t.category)} · Updated ${escHtml(t.updated)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
            <span class="badge badge-${t.status}">${t.status}</span>
            <span class="badge badge-${(t.priority||'medium').toLowerCase()}">${t.priority}</span>
          </div>
        </div>
      </div>
    `).join('') || '<div class="text-muted" style="text-align:center;padding:40px;">No tickets found.</div>';

    $all('[data-id]').forEach(card => {
      card.addEventListener('click', function() {
        const ticket = portalTickets.find(t => t.id === this.dataset.id);
        if (ticket) openPortalTicketDetail(ticket);
      });
    });
  }

  function openPortalTicketDetail(ticket) {
    $('ticketListView').style.display = 'none';
    $('ticketDetailView').style.display = '';
    const set = (id, val) => { const el=$(id); if(el) el.textContent=val; };
    const setHtml = (id, val) => { const el=$(id); if(el) el.innerHTML=val; };
    set('dtId', '#'+ticket.id);
    set('dtSubject', ticket.subject);
    if ($('dtStatus'))   { $('dtStatus').textContent = ticket.status;   $('dtStatus').className = `badge badge-${ticket.status}`; }
    if ($('dtPriority')) { $('dtPriority').textContent = ticket.priority; $('dtPriority').className = `badge badge-${(ticket.priority||'medium').toLowerCase()}`; }

    const msgs = $('dtMessages');
    if (msgs) msgs.innerHTML = (ticket.messages||[]).map(m => `
      <div style="display:flex;gap:10px;margin-bottom:12px;flex-direction:${m.from==='agent'?'row-reverse':'row'};">
        <div class="avatar-xs ${m.avatar||'av-blue'}" style="flex-shrink:0;">${m.initials||'?'}</div>
        <div style="background:${m.from==='agent'?'var(--brand-primary)':'var(--bg-tertiary)'};color:${m.from==='agent'?'#fff':'var(--text-primary)'};padding:10px 14px;border-radius:12px;font-size:0.83rem;max-width:80%;white-space:pre-line;">${escHtml(m.text)}</div>
      </div>
    `).join('');

    // Back button
    const backBtns = document.querySelectorAll('.portal-back-btn, [onclick*="ticketListView"]');
    backBtns.forEach(b => b.addEventListener('click', () => {
      $('ticketListView').style.display = '';
      $('ticketDetailView').style.display = 'none';
    }));

    // Reply
    const replyBtn = $q('#ticketDetailView .btn-primary');
    const replyInp = $('dtReplyInput');
    if (replyBtn && replyInp) {
      replyBtn.onclick = () => {
        const text = replyInp.value.trim();
        if (!text) { showToast('Please enter a message.','warning'); return; }
        (ticket.messages = ticket.messages||[]).push({ from:'customer', name:'You', initials:'YO', avatar:'av-blue', time:'Just now', text });
        replyInp.value = '';
        openPortalTicketDetail(ticket);
        showToast('Reply sent!','success');
      };
    }
  }

  renderPortalList();

  // Search
  const psi = $('portalSearchInput');
  if (psi) psi.addEventListener('input', () => renderPortalList(psi.value));

  // Portal sections
  $all('.portal-nav-item').forEach(item => {
    item.addEventListener('click', function() {
      $all('.portal-nav-item').forEach(i=>i.classList.remove('active'));
      $all('.portal-section').forEach(s=>s.classList.remove('active'));
      this.classList.add('active');
      const sec = $('psec-'+this.dataset.section);
      if (sec) sec.classList.add('active');
    });
  });

  // New ticket form in portal
  const ptf = $('portalNewTicketForm');
  if (ptf) ptf.addEventListener('submit', function(e) {
    e.preventDefault();
    const newT = {
      id: 'TK-' + (1025 + portalTickets.length),
      subject:  $('ptSubject') ? $('ptSubject').value : 'New Ticket',
      status:   'open',
      priority: $('ptPriority') ? $('ptPriority').value : 'Medium',
      category: $('ptCategory') ? $('ptCategory').value : 'General',
      updated:  'Just now',
      messages: [],
    };
    portalTickets.unshift(newT);
    ptf.reset();
    $all('.portal-nav-item').forEach(i=>i.classList.remove('active'));
    $all('.portal-section').forEach(s=>s.classList.remove('active'));
    const myTix = $q('[data-section="my-tickets"]');
    if (myTix) myTix.classList.add('active');
    const sec = $('psec-my-tickets');
    if (sec) sec.classList.add('active');
    renderPortalList();
    showToast('Ticket submitted! We\'ll respond shortly.','success');
  });

  // AI suggestion on subject input
  window.triggerAISuggestion = function(val) {
    const banner = $('aiSuggestionBanner');
    if (!banner || !window.OD) return;
    if (val.length > 8) {
      const relevant = window.OD.KB_ARTICLES.find(a =>
        a.title.toLowerCase().includes(val.toLowerCase().split(' ')[0])
      );
      if (relevant) {
        banner.style.display = '';
        const st = $('aiSuggestionText');
        if (st) st.textContent = `We found a related article: "${relevant.title}"`;
      } else {
        banner.style.display = 'none';
      }
    } else {
      banner.style.display = 'none';
    }
  };

  // CSAT stars
  const stars = $all('#csatStars .csat-star');
  stars.forEach((star, i) => {
    star.addEventListener('click', () => {
      stars.forEach((s, j) => { s.classList.toggle('active', j <= i); });
      const label = $('csatRatingLabel');
      const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
      if (label) label.textContent = labels[i+1] || 'Excellent';
    });
  });

  // Portal theme toggle
  const ptt = $('portalThemeToggle');
  if (ptt) {
    ptt.checked = (getTheme() === 'light');
    ptt.addEventListener('change', toggleTheme);
  }

  // CSAT ticket list
  const csatList = $('csatTicketList');
  if (csatList) {
    csatList.innerHTML = portalTickets.filter(t=>t.status==='resolved').map(t=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);">
        <div style="flex:1;"><div style="font-size:0.875rem;font-weight:500;">${escHtml(t.subject)}</div><div class="text-xs text-muted">${t.id}</div></div>
        <div class="csat-stars" style="font-size:1rem;">⭐⭐⭐⭐⭐</div>
      </div>
    `).join('') || '<div class="text-muted" style="text-align:center;padding:20px;">No resolved tickets yet.</div>';
  }
}

// NOTIFICATIONS
function initNotifications() {
  const notifDot = $q('.topbar-notif-dot');
  const notifDropdown = $('notifDropdown');
  if (!notifDot || !notifDropdown) return;

  // Build real notification-like entries from actual ticket data instead
  // of the old window.OD.NOTIFICATIONS_DATA, which never existed (this
  // dropdown silently showed nothing on every page that has it).
  function renderRealNotifications() {
    const tickets = typeof getTickets === 'function' ? getTickets() : [];
    if (!tickets.length) {
      notifDot.textContent = '0';
      notifDot.style.display = 'none';
      notifDropdown.innerHTML = '<div class="dropdown-item text-muted">No notifications yet.</div>';
      return;
    }
    const items = [...tickets]
      .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0))
      .slice(0, 4)
      .map(t => {
        const isNew = t.status === 'open';
        const text = isNew
          ? `New ticket ${escHtml(t.id)} from ${escHtml(t.customer || 'a customer')}`
          : `${escHtml(t.id)} is ${escHtml(t.status)} — ${escHtml(t.subject || '')}`;
        return { text, unread: isNew };
      });
    const unread = items.filter(n => n.unread).length;
    notifDot.textContent = unread;
    notifDot.style.display = unread > 0 ? '' : 'none';
    notifDropdown.innerHTML = items.map(n => `
      <div class="dropdown-item" style="${n.unread ? 'font-weight:600;' : ''}">${n.text}</div>
    `).join('') + '<div class="dropdown-divider"></div><a class="dropdown-item" href="index.html">View all tickets</a>';
  }

  renderRealNotifications();
  // Tickets load asynchronously via syncFromBackend — refresh shortly
  // after so the dropdown reflects real data once it arrives.
  setTimeout(renderRealNotifications, 500);
}

// ACCENT COLOR (applied on every page)
function applyAccentColor(color) {
  if (!color) return;
  const hex = color.replace('#','');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  let styleEl = document.getElementById('_accentOverride');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = '_accentOverride';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    :root {
      --brand-primary: ${color} !important;
      --brand-accent:  ${color} !important;
      --brand-light:   rgba(${r},${g},${b},0.15) !important;
      --border-brand:  rgba(${r},${g},${b},0.4) !important;
    }
    .btn-primary, .sidebar-new-btn { background: ${color} !important; border-color: ${color} !important; }
    .nav-item.active { color: ${color} !important; background: rgba(${r},${g},${b},0.12) !important; }
    .nav-item.active svg { stroke: ${color} !important; }
    .settings-nav-item.active { color: ${color} !important; background: rgba(${r},${g},${b},0.12) !important; }
    .badge-brand, .text-brand { color: ${color} !important; }
    .theme-option.selected .theme-option-label { color: ${color} !important; }
    .theme-option.selected { border-color: ${color} !important; }
    .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: ${color} !important; box-shadow: 0 0 0 3px rgba(${r},${g},${b},0.15) !important; }
    .nav-badge { background: ${color} !important; }
  `;
}
window.applyAccentColor = applyAccentColor;

// DENSITY (applied on every page)
function applyDensity(mode) {
  let densityEl = document.getElementById('_densityOverride');
  if (!densityEl) {
    densityEl = document.createElement('style');
    densityEl.id = '_densityOverride';
    document.head.appendChild(densityEl);
  }
  if (mode === 'compact') {
    densityEl.textContent = `
      .nav-item           { padding: 5px 12px !important; font-size: 0.78rem !important; }
      .page-body          { padding: 14px 16px !important; }
      .card               { padding: 12px !important; }
      .stat-card          { padding: 12px !important; }
      .stat-value         { font-size: 1.3rem !important; }
      .data-table td, .data-table th { padding: 6px 10px !important; font-size: 0.78rem !important; }
      .ticket-item        { padding: 8px 10px !important; }
      .form-group         { margin-bottom: 10px !important; }
      .settings-card      { padding: 12px 14px !important; margin-bottom: 12px !important; }
      .topbar             { height: 48px !important; padding: 0 14px !important; }
    `;
  } else {
    densityEl.textContent = `
      .nav-item           { padding: 8px 14px !important; font-size: 0.845rem !important; }
      .page-body          { padding: 20px 24px !important; }
      .data-table td, .data-table th { padding: 10px 14px !important; font-size: 0.845rem !important; }
      .topbar             { height: 56px !important; padding: 0 20px !important; }
    `;
  }
}
window.applyDensity = applyDensity;

// INIT
document.addEventListener('DOMContentLoaded', async function() {
  // Apply saved theme
  applyTheme(getTheme());

  // Apply saved accent color
  const savedAccent = localStorage.getItem('ojashdesk_accent');
  if (savedAccent) applyAccentColor(savedAccent);

  // Apply saved density
  const savedDensity = localStorage.getItem('ojashdesk_density');
  if (savedDensity) applyDensity(savedDensity);

  // Check auth on protected pages
  const publicPages = ['login.html', 'register.html', 'customer-portal.html'];
  const isPublic = publicPages.some(p => location.pathname.endsWith(p));
  if (!isPublic) {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
    populateUserUI(getCurrentUser());
  }

  // Core UI
  initSidebar();
  initDropdowns();
  initModals();
  initNotifications();

  // Sync data from backend before rendering pages
  if (window.OjashApi) {
    await window.OjashApi.syncFromBackend();
  }

  // Page-specific init
  initInboxPage();
  initTicketsPage();
  initCustomersPage();
  initBillingPage();
  initKBPage();
  initSettingsPage();
  initPortalPage();
  renderAnalytics();

  // Theme checkbox in settings/live-chat topbar
  const tc = $('themeCheckbox');
  if (tc) {
    tc.checked = (getTheme() === 'light');
    tc.addEventListener('change', toggleTheme);
  }

  // Global search shortcut (⌘K / Ctrl+K)
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const gs = $('globalSearch');
      if (gs) { gs.focus(); gs.select(); }
    }
  });

  // Log out links — clear user session
  $all('a[href="login.html"]').forEach(a => {
    a.addEventListener('click', () => {
      if (window.OjashApi) window.OjashApi.logout();
      else localStorage.removeItem(LS.USER);
      showToast('Logged out.','info');
    });
  });
});

// Expose helpers globally
window.showToast = showToast;
window._appShowToast = showToast;  // stable alias for features.js delegation (avoids circular ref)
window.openModal = openModal;
window.closeModal = closeModal;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.getCurrentUser = getCurrentUser;