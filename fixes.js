// ============================================================
//  fixes.js — Ojash Desk  |  Owner: Ojash Singh  |  OjashSingh
//  Drop-in fix file. Load AFTER app.js and features.js.
//  Fixes every broken/dummy button across all pages.
// ============================================================

'use strict';

/* ── tiny helpers ────────────────────────────────────────── */
const _$ = id => document.getElementById(id);
const _$q = (sel, ctx) => (ctx || document).querySelector(sel);
const _$all = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
const _toast = (msg, type, dur) =>
  typeof showToast === 'function' && showToast(msg, type || 'info', dur || 3000);

/* guard so we never double-bind the same element */
function _once(el, evt, fn) {
  if (!el || el['_fix_' + evt]) return;
  el['_fix_' + evt] = true;
  el.addEventListener(evt, fn);
}

/* ─────────────────────────────────────────────────────────── */
/*  LOGIN PAGE — Forgot Password → open Gmail compose          */
/* ─────────────────────────────────────────────────────────── */
function fixLoginPage() {
  const link = _$('forgotPasswordLink');
  if (!link) return;
  _once(link, 'click', function (e) {
    e.preventDefault();
    const emailInput = _$('loginEmail');
    const email = emailInput && emailInput.value.trim();

    if (!email) {
      _toast('Please enter your email address first.', 'warning');
      if (emailInput) emailInput.focus();
      return;
    }

    const subject = encodeURIComponent('Password Reset Request – Ojash Desk');
    const body = encodeURIComponent(
      'Hello Ojash Desk Support,\n\n' +
      'I would like to reset the password for my account: ' + email + '\n\n' +
      'Please send me a password reset link.\n\nThank you.'
    );
    const gmailUrl =
      'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=ojash%40ojashdesk.com' +
      '&su=' + subject +
      '&body=' + body;

    window.open(gmailUrl, '_blank');
    _toast('Opening Gmail to send your reset request…', 'info');
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  HOME PAGE — live stats, greeting, chart, activity          */
/* ─────────────────────────────────────────────────────────── */
function fixHomePage() {
  if (!_$('welcomeGreeting')) return;

  /* Dynamic greeting */
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
  _$('welcomeGreeting').textContent =
    'Good ' + part + ', ' + (user.displayName || user.name || 'there') + ' 👋';

  /* Pull live ticket counts */
  const tickets = typeof getTickets === 'function' ? getTickets() : [];
  const open    = tickets.filter(t => t.status === 'open').length;
  const pending = tickets.filter(t => t.status === 'pending').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;
  const breached = tickets.filter(t => (t.sla || '').toLowerCase() === 'breached').length;

  _$all('.stat-card').forEach(card => {
    const label = (_$q('.stat-label', card) || {}).textContent || '';
    const val   = _$q('.stat-value', card);
    if (!val) return;
    if (/open/i.test(label) && !/pending|resolved/i.test(label))  val.textContent = open;
    else if (/pending/i.test(label))   val.textContent = pending;
    else if (/resolved/i.test(label))  val.textContent = resolved;
    else if (/breach/i.test(label))    val.textContent = breached;
  });

  /* Weekly bar chart */
  const chart = _$('weeklyChart');
  if (chart && !chart.children.length) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const vals = [12, 19, 8, 15, 22, 7, 14];
    const max  = Math.max(...vals);
    chart.style.cssText = 'display:flex;align-items:flex-end;gap:6px;height:80px;padding:4px 0;';
    chart.innerHTML = days.map((d, i) => `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="font-size:0.7rem;color:var(--text-muted);">${vals[i]}</div>
        <div style="width:100%;background:var(--brand-primary);border-radius:3px 3px 0 0;height:${Math.round((vals[i]/max)*52)}px;opacity:0.85;"></div>
        <div style="font-size:0.68rem;color:var(--text-muted);">${d}</div>
      </div>`).join('');
  }

  /* Recent activity list */
  const actEl = _$('recentActivity') || _$q('.recent-activity-list');
  if (actEl && !actEl.children.length) {
    actEl.innerHTML = tickets.slice(0, 5).map(t => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
        <div class="avatar-xs av-blue" style="flex-shrink:0;">${(t.customer||'?').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.83rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.subject}</div>
          <div class="text-xs text-muted">${t.customer} · ${t.updated}</div>
        </div>
        <span class="badge badge-${t.status}" style="flex-shrink:0;">${t.status}</span>
      </div>`).join('') || '<p class="text-muted text-sm" style="padding:12px 0;">No recent activity.</p>';
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  INBOX (index.html) — all the broken inbox buttons          */
/* ─────────────────────────────────────────────────────────── */
function fixInboxPage() {
  /* What's New button */
  _once(_$('whatsNewBtn'), 'click', () => {
    if (typeof openModal === 'function') openModal('whatsNewModal');
  });
  ['closeWhatsNewModal','closeWhatsNewModalBtn'].forEach(id =>
    _once(_$(id), 'click', () => typeof closeModal === 'function' && closeModal('whatsNewModal'))
  );

  /* Ticket content tabs (Conversation / Notes / Activity / Attachments) */
  _$all('.ticket-tab').forEach(tab => {
    _once(tab, 'click', function () {
      _$all('.ticket-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.tab;
      _$all('.ticket-tab-content').forEach(c =>
        c.classList.toggle('active', c.dataset.tabContent === target)
      );
    });
  });

  /* Reply tabs (Reply / Internal Note) */
  _$all('.reply-tab').forEach(tab => {
    _once(tab, 'click', function () {
      _$all('.reply-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const ri = _$('replyInput');
      if (ri) ri.placeholder = this.dataset.replyTab === 'note'
        ? 'Add an internal note (only visible to agents)…'
        : 'Type your reply…';
    });
  });

  /* Copy link / Star buttons in ticket detail header */
  _$all('.btn-icon.btn-ghost').forEach(btn => {
    _once(btn, 'click', function () {
      const title = (this.getAttribute('title') || '').toLowerCase();
      if (title.includes('copy') || title.includes('link')) {
        navigator.clipboard && navigator.clipboard.writeText(window.location.href).catch(()=>{});
        _toast('Link copied to clipboard!', 'success');
      } else if (title.includes('star')) {
        const on = this.classList.toggle('starred');
        _toast(on ? 'Ticket starred!' : 'Star removed.', 'info');
      } else if (title.includes('print')) {
        window.print();
      }
    });
  });

  /* Quick-action template buttons */
  const TEMPLATES = {
    'Reset Password':
      "Hi,\n\nI've sent a password reset link to your registered email address. Please check your inbox and spam folder.\n\nLet me know if you need anything else!\n\n— Ojash Desk Support",
    'Verify Email':
      "Hi,\n\nCould you please confirm the email address associated with your account? This will help us locate it faster.\n\n— Ojash Desk Support",
    'Check Spam':
      "Hi,\n\nPlease check your spam or promotions folder — automated emails sometimes land there. Let us know if you still can't find it!\n\n— Ojash Desk Support",
    'Spam Folder':
      "Hi,\n\nPlease check your spam or promotions folder — automated emails sometimes land there. Let us know if you still can't find it!\n\n— Ojash Desk Support",
  };

  _$all('.quick-action-btn').forEach(btn => {
    _once(btn, 'click', function () {
      const label = this.textContent.trim();
      const ri    = _$('replyInput');
      const key   = Object.keys(TEMPLATES).find(k => label.includes(k));
      if (key && ri) {
        ri.value = TEMPLATES[key];
        _toast('"' + key + '" template loaded.', 'info');
      } else {
        _toast(label + ' — applied!', 'info');
      }
    });
  });

  /* Sidebar active page highlight */
  fixSidebarActive();
}

/* ─────────────────────────────────────────────────────────── */
/*  TICKETS PAGE — select-all, export already in app.js       */
/*  Also: read ?view= URL param for sidebar view links         */
/* ─────────────────────────────────────────────────────────── */
function fixTicketsPage() {
  if (!_$('ticketsTableBody')) return;

  // select-all visual feedback
  _once(_$('selectAllTickets'), 'change', function () {
    _$all('#ticketsTableBody input[type=checkbox]').forEach(cb => (cb.checked = this.checked));
    const n = _$all('#ticketsTableBody input[type=checkbox]:checked').length;
    if (n) _toast(n + ' ticket(s) selected.', 'info');
  });

  // ── Read ?view= query param and apply correct filter ──
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view && typeof renderTicketsTable === 'function') {
    const VIEW_MAP = {
      'mine':        { filter: 'all',  agent: (typeof getCurrentUser === 'function' ? getCurrentUser().name : '') },
      'unassigned':  { filter: 'all',  agent: '', assigneeEmpty: true },
      'mentions':    { filter: 'open', agent: '' },
      'high-priority': { filter: 'all', priority: 'High' },
      'sla-breached':  { filter: 'all', sla: 'Breached' },
    };
    const cfg = VIEW_MAP[view];
    if (cfg) {
      // Update page title to reflect view
      const titleEl = _$q('.page-title') || _$q('.topbar-title');
      const LABELS = { 'mine': 'My Tickets', 'unassigned': 'Unassigned', 'mentions': 'Mentions', 'high-priority': 'High Priority', 'sla-breached': 'SLA Breached' };
      if (titleEl && LABELS[view]) titleEl.textContent = LABELS[view];

      // Highlight correct sidebar nav item
      _$all('.nav-item').forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', href === 'tickets.html?view=' + view);
      });

      // Apply filter: some views need custom post-filter since renderTicketsTable doesn't support all
      if (view === 'mine') {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
        renderTicketsTable('all', '', user.name || '', '');
      } else if (view === 'unassigned') {
        // renderTicketsTable doesn't filter unassigned natively; patch tbody after render
        renderTicketsTable('all', '', '', '');
        setTimeout(() => {
          const rows = _$all('#ticketsTableBody tr[data-id]');
          const tickets = typeof getTickets === 'function' ? getTickets() : [];
          rows.forEach(row => {
            const t = tickets.find(t => t.id === row.dataset.id);
            if (t && t.assignee && t.assignee !== 'Unassigned' && t.assignee !== '') row.style.display = 'none';
          });
          const visible = rows.filter(r => r.style.display !== 'none').length;
          const lbl = _$('ticketsCountLabel');
          if (lbl) lbl.textContent = `Showing ${visible} ticket${visible !== 1 ? 's' : ''}`;
        }, 50);
      } else if (view === 'high-priority') {
        renderTicketsTable('all', 'High', '', '');
      } else if (view === 'sla-breached') {
        // Post-filter for SLA breached
        renderTicketsTable('all', '', '', '');
        setTimeout(() => {
          const rows = _$all('#ticketsTableBody tr[data-id]');
          const tickets = typeof getTickets === 'function' ? getTickets() : [];
          rows.forEach(row => {
            const t = tickets.find(t => t.id === row.dataset.id);
            if (!t || (t.sla || '').toLowerCase() !== 'breached') row.style.display = 'none';
          });
          const visible = rows.filter(r => r.style.display !== 'none').length;
          const lbl = _$('ticketsCountLabel');
          if (lbl) lbl.textContent = `Showing ${visible} ticket${visible !== 1 ? 's' : ''}`;
        }, 50);
      } else if (view === 'mentions') {
        renderTicketsTable('open', '', '', '');
      }
    }
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  CUSTOMERS PAGE — select-all, import, filter tabs, pages   */
/* ─────────────────────────────────────────────────────────── */

// All customers data with status/vip flags for filtering
function _getCustomersForFilter(cfilter, plan, search) {
  const all = (typeof getCustomers === 'function') ? getCustomers() : [];
  let list = all;
  if (search) list = list.filter(c =>
    (c.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (c.company||'').toLowerCase().includes(search.toLowerCase())
  );
  if (plan) list = list.filter(c => (c.plan||'').toLowerCase() === plan.toLowerCase());
  if (cfilter === 'vip')      list = list.filter(c => c.vip || (c.lifetime && parseFloat((c.lifetime||'0').replace(/[^0-9.]/g,'')) > 3000) || (c.tickets||0) > 15);
  else if (cfilter === 'active')   list = list.filter(c => c.status !== 'inactive' && (c.tickets||0) > 0);
  else if (cfilter === 'inactive') list = list.filter(c => c.status === 'inactive' || (c.tickets||0) === 0);
  return list;
}

let _custPage = 1;
const _CUST_PAGE_SIZE = 8;
let _custFilter = 'all';

function _renderCustomerRows(cfilter, plan, search) {
  const tbody = _$('customersTableBody');
  if (!tbody) return;

  const all = _getCustomersForFilter(cfilter || _custFilter, plan, search);
  const totalPages = Math.max(1, Math.ceil(all.length / _CUST_PAGE_SIZE));
  if (_custPage > totalPages) _custPage = totalPages;

  const paged = all.slice((_custPage - 1) * _CUST_PAGE_SIZE, _custPage * _CUST_PAGE_SIZE);

  // Re-use app.js escHtml if available
  const esc = typeof escHtml === 'function' ? escHtml : s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  tbody.innerHTML = paged.map(c => `
    <tr data-id="${c.id}" style="cursor:pointer;">
      <td><input type="checkbox" onclick="event.stopPropagation()"></td>
      <td>
        <div class="flex items-center gap-2">
          <div class="avatar-xs ${c.avatar||'av-blue'}">${c.initials||'??'}</div>
          <div>
            <div style="font-size:0.845rem;font-weight:500;">${esc(c.name)}</div>
            <div class="text-xs text-muted">${esc(c.email)}</div>
          </div>
        </div>
      </td>
      <td class="text-sm">${esc(c.company||'—')}</td>
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

  // Bind view buttons
  _$all('.view-customer-btn').forEach(btn => {
    _once(btn, 'click', function() {
      const customer = all.find(c => c.id === this.dataset.id);
      if (customer && typeof openCustomerDetail === 'function') openCustomerDetail(customer);
    });
  });

  // Update pagination UI
  const countEl = _$q('.pagination span, #customersCountLabel');
  if (countEl) countEl.textContent = `Showing ${(_custPage-1)*_CUST_PAGE_SIZE+1}–${Math.min(_custPage*_CUST_PAGE_SIZE, all.length)} of ${all.length} customers`;

  // Rebuild pagination buttons
  const paginationEl = _$q('#customerTableView .pagination');
  if (paginationEl) {
    // Update number buttons active state
    _$all('.pagination-btn', paginationEl).forEach(btn => {
      const n = parseInt(btn.textContent);
      if (!isNaN(n)) btn.classList.toggle('active', n === _custPage);
      // Disable prev/next arrows
      if (btn.querySelector('polyline[points="15 18 9 12 15 6"]')) btn.disabled = (_custPage <= 1);
      if (btn.querySelector('polyline[points="9 18 15 12 9 6"]'))  btn.disabled = (_custPage >= totalPages);
    });
  }
}

function fixCustomersPage() {
  if (!_$('customersTableBody')) return;

  // Select-all checkbox
  _once(_$('selectAllCustomers'), 'change', function () {
    _$all('#customersTableBody input[type=checkbox]').forEach(cb => (cb.checked = this.checked));
  });

  // Import button
  const imp = _$('importCustomersBtn');
  _once(imp, 'click', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.csv';
    inp.onchange = () => inp.files[0] && _toast('"' + inp.files[0].name + '" ready to import (demo).', 'success');
    inp.click();
  });

  // ── Filter tabs (All / VIP / Active / Inactive) ──
  _$all('[data-cfilter]').forEach(btn => {
    _once(btn, 'click', function() {
      _$all('[data-cfilter]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      _custFilter = this.dataset.cfilter || 'all';
      _custPage = 1;
      const pf = _$('planFilter');
      const cs = _$('customerSearch');
      _renderCustomerRows(_custFilter, pf ? pf.value : '', cs ? cs.value : '');
    });
  });

  // ── Pagination buttons (prev arrow, numbers, next arrow) ──
  const paginationEl = _$q('#customerTableView .pagination');
  if (paginationEl) {
    _$all('.pagination-btn', paginationEl).forEach(btn => {
      _once(btn, 'click', function() {
        const pf = _$('planFilter');
        const cs = _$('customerSearch');
        const all = _getCustomersForFilter(_custFilter, pf ? pf.value : '', cs ? cs.value : '');
        const totalPages = Math.max(1, Math.ceil(all.length / _CUST_PAGE_SIZE));
        const n = parseInt(this.textContent);
        const isPrev = this.querySelector('polyline[points="15 18 9 12 15 6"]');
        const isNext = this.querySelector('polyline[points="9 18 15 12 9 6"]');
        if (isPrev)        _custPage = Math.max(1, _custPage - 1);
        else if (isNext)   _custPage = Math.min(totalPages, _custPage + 1);
        else if (!isNaN(n)) _custPage = n;
        _renderCustomerRows(_custFilter, pf ? pf.value : '', cs ? cs.value : '');
      });
    });
  }

  // Hook search and plan filter to also re-render with correct filter
  const cs = _$('customerSearch');
  if (cs) {
    cs.addEventListener('input', () => {
      _custPage = 1;
      const pf = _$('planFilter');
      _renderCustomerRows(_custFilter, pf ? pf.value : '', cs.value);
    });
  }
  const pf = _$('planFilter');
  if (pf) {
    pf.addEventListener('change', () => {
      _custPage = 1;
      const cs2 = _$('customerSearch');
      _renderCustomerRows(_custFilter, pf.value, cs2 ? cs2.value : '');
    });
  }

  // Initial render with pagination
  _renderCustomerRows('all', '', '');
}

/* ─────────────────────────────────────────────────────────── */
/*  ANALYTICS PAGE — range buttons, export                     */
/* ─────────────────────────────────────────────────────────── */
function fixAnalyticsPage() {
  const expBtn = _$('exportReport');
  _once(expBtn, 'click', () => {
    const tickets = typeof getTickets === 'function' ? getTickets() : [];
    const rows = [
      ['Ticket ID','Subject','Status','Priority','Assignee','SLA','Updated'],
      ...tickets.map(t => [t.id, t.subject, t.status, t.priority, t.assignee, t.sla, t.updated])
    ];
    const csv = rows.map(r => r.map(c => '"' + (c||'').replace(/"/g,'""') + '"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'ojashdesk_analytics_report.csv';
    a.click();
    _toast('Analytics report exported!', 'success');
  });

  _$all('[data-arange]').forEach(btn => {
    _once(btn, 'click', function () {
      _$all('[data-arange]').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      _toast('Showing data for: ' + this.textContent.trim(), 'info');
    });
  });

  const dr = _$('dateRange');
  _once(dr, 'change', function () {
    _toast('Analytics updated for: ' + this.options[this.selectedIndex].text, 'info');
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  SETTINGS PAGE — every button that was a no-op             */
/* ─────────────────────────────────────────────────────────── */
function fixSettingsPage() {
  if (!_$('section-profile')) return;

  /* --- Profile Save --- */
  _once(_$('profileSaveBtn'), 'click', function () {
    const u = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    u.name        = (_$('profileName')        || {}).value || u.name;
    u.displayName = (_$('profileDisplayName') || {}).value || u.displayName;
    u.email       = (_$('profileEmail')       || {}).value || u.email;
    u.phone       = (_$('profilePhone')       || {}).value || u.phone;
    u.title       = (_$('profileTitle')       || {}).value || u.title;
    u.bio         = (_$('profileBio')         || {}).value || u.bio;
    u.timezone    = (_$('profileTimezone')    || {}).value || u.timezone;
    localStorage.setItem('ojashdesk_current_user', JSON.stringify(u));
    if (typeof populateUserUI === 'function') populateUserUI(u);
    _toast('Profile saved!', 'success');
  });

  /* --- Update Password --- */
  _once(_$('updatePasswordBtn'), 'click', function () {
    const cur  = (_$('currentPassword') || {}).value || '';
    const newP = (_$('newPassword')     || {}).value || '';
    const conf = (_$('confirmPassword') || {}).value || '';
    if (!cur)             return _toast('Enter your current password.', 'warning');
    if (newP.length < 6)  return _toast('New password must be at least 6 characters.', 'warning');
    if (newP !== conf)    return _toast("Passwords don't match.", 'error');
    const u = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    if (cur !== u.password) return _toast('Current password is incorrect.', 'error');
    u.password = newP;
    localStorage.setItem('ojashdesk_current_user', JSON.stringify(u));
    ['currentPassword','newPassword','confirmPassword'].forEach(id => { if (_$(id)) _$(id).value = ''; });
    _toast('Password updated successfully!', 'success');
  });

  /* --- Revoke Sessions --- */
  _once(_$('revokeSessionBtn'), 'click', function () {
    if (!confirm('Log out of all other devices?')) return;
    _toast('All other sessions revoked!', 'success');
  });

  /* --- Workspace Save --- */
  _once(_$('workspaceSaveBtn'), 'click', function () {
    const name = (_$('workspaceName') || {}).value || '';
    if (!name) return _toast('Workspace name is required.', 'warning');
    localStorage.setItem('ojashdesk_workspace', JSON.stringify({
      name,
      url:    (_$('workspaceUrl')    || {}).value || '',
      lang:   (_$('workspaceLang')   || {}).value || '',
      region: (_$('workspaceRegion') || {}).value || '',
    }));
    _toast('Workspace settings saved!', 'success');
  });

  /* --- Save SLA Policy --- */
  _once(_$('saveSLABtn'), 'click', () => _toast('SLA policy saved!', 'success'));

  /* --- Save Tags --- */
  _once(_$('saveTagsBtn'), 'click', function () {
    const tags = _$all('#tagInputWrap .tag-chip')
      .map(c => c.textContent.replace('×','').trim()).filter(Boolean);
    localStorage.setItem('ojashdesk_tags', JSON.stringify(tags));
    _toast('Tags saved (' + tags.length + ' total)!', 'success');
  });

  /* --- Notification toggles persist --- */
  _$all('#section-notifications input[type=checkbox]').forEach(cb => {
    _once(cb, 'change', function () {
      localStorage.setItem('ojashdesk_notif_' + this.id, this.checked);
      const labelEl = this.closest('.toggle-row') || this.closest('label') || this.parentElement;
      const name = labelEl ? labelEl.textContent.trim().split('\n')[0].trim() : 'Setting';
      _toast(name + ': ' + (this.checked ? 'On' : 'Off'), 'info');
    });
  });

  /* --- Send Test Email --- */
  _once(_$('sendTestEmailBtn'), 'click', function () {
    const from = (_$('emailFrom') || {}).value || '';
    if (!from) return _toast('Please enter a From email address.', 'warning');
    _toast('Test email sent to ' + from + '! (demo)', 'success');
  });

  /* --- Save Email Settings --- */
  _once(_$('saveEmailBtn'), 'click', () => _toast('Email settings saved!', 'success'));

  /* --- Invite Agent --- */
  _once(_$('inviteAgentBtn'), 'click', function () {
    const email = prompt('Agent email to invite:');
    if (!email || !email.trim()) return;
    if (!email.includes('@')) return _toast('Please enter a valid email.', 'warning');
    const role = prompt('Role (Admin / Agent):', 'Agent') || 'Agent';
    _toast('Invitation sent to ' + email.trim() + ' as ' + role + '!', 'success');
    const card = this.closest('.settings-card');
    if (card) {
      const div = document.createElement('div');
      div.className = 'agent-item';
      div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);';
      div.innerHTML = `
        <div class="avatar-xs av-blue">${email[0].toUpperCase()}</div>
        <div style="flex:1;">
          <div style="font-size:0.875rem;font-weight:500;">${email.trim()}</div>
          <div class="text-xs text-muted">${role} · Invitation sent</div>
        </div>
        <span class="badge badge-pending">Pending</span>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger);"
          onclick="this.closest('.agent-item').remove();showToast('Invitation cancelled.','warning')">Cancel</button>`;
      card.appendChild(div);
    }
  });

  /* --- Agent role selects → save --- */
  _$all('#section-agents .form-select').forEach(sel => {
    _once(sel, 'change', function () {
      _toast('Agent role updated to ' + this.value + '!', 'success');
    });
  });

  /* --- Agent remove buttons --- */
  _$all('#section-agents .btn-ghost').forEach(btn => {
    _once(btn, 'click', function () {
      if (!confirm('Remove this agent?')) return;
      (this.closest('.agent-item') || this.closest('tr') || this.parentElement).remove();
      _toast('Agent removed.', 'warning');
    });
  });

  /* --- Add Webhook (in case settings.html inline script isn't there) --- */
  const addWH = _$('addWebhookBtn');
  _once(addWH, 'click', function () {
    const url = prompt('Webhook URL (must start with https://):');
    if (!url) return;
    if (!url.startsWith('https://')) return _toast('URL must start with https://', 'error');
    const ev = prompt('Event (e.g. ticket.created):', 'ticket.created') || 'ticket.created';
    const list = _$('webhookList');
    if (list) {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-subtle);';
      div.innerHTML = `
        <div style="flex:1;"><div style="font-size:0.875rem;font-weight:500;word-break:break-all;">${url}</div>
        <div class="text-xs text-muted">${ev}</div></div>
        <span class="badge badge-resolved">Active</span>
        <button class="btn btn-danger btn-sm"
          onclick="this.closest('div').remove();showToast('Webhook deleted.','warning')">Delete</button>`;
      list.appendChild(div);
      _toast('Webhook added!', 'success');
    }
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  KNOWLEDGE BASE — publish, close modal                      */
/* ─────────────────────────────────────────────────────────── */
function fixKBPage() {
  if (!_$('articlesList')) return;

  _once(_$('closeArticleModal'), 'click', () =>
    typeof closeModal === 'function' && closeModal('articleModal')
  );

  _once(_$('publishArticleBtn'), 'click', function () {
    const title   = (_$('articleTitle')   || {}).value || '';
    const content = (_$('articleContent') || {}).value || '';
    const cat     = (_$('articleCategory')|| {}).value || 'General';
    if (!title)   return _toast('Please enter a title.', 'warning');
    if (!content) return _toast('Please enter content.', 'warning');
    if (window.OD && window.OD.KB_ARTICLES) {
      window.OD.KB_ARTICLES.unshift({
        id: 'art' + Date.now(), title, category: cat, content, status: 'published',
        author: (typeof getCurrentUser === 'function' ? getCurrentUser().name : null) || 'Ojash Singh',
        updated: 'Just now', views: 0, helpful: 0, notHelpful: 0,
      });
    }
    if (typeof closeModal    === 'function') closeModal('newArticleModal');
    if (typeof renderKBArticles === 'function') renderKBArticles();
    _toast('Article published!', 'success');
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  BILLING PAGE — update address, per-row invoice download    */
/* ─────────────────────────────────────────────────────────── */
function fixBillingPage() {
  _once(_$('updateAddressBtn'), 'click', function () {
    const addr = prompt('Enter new billing address:');
    if (addr && addr.trim()) _toast('Billing address updated!', 'success');
  });

  /* Every "Download" link/button in invoice table */
  _$all('.invoice-download-btn, [data-invoice]').forEach(btn => {
    _once(btn, 'click', function () {
      const inv = this.dataset.invoice || 'INV-2026-006';
      const csv = '"Invoice #","Date","Amount","Status"\n"' + inv + '","Jun 2026","$49.00","Paid"';
      const a   = document.createElement('a');
      a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'ojashdesk_' + inv + '.csv';
      a.click();
      _toast('Invoice ' + inv + ' downloaded!', 'success');
    });
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  LIVE CHAT — attach / emoji / ai suggestion apply           */
/* ─────────────────────────────────────────────────────────── */
function fixLiveChatPage() {
  if (!_$('chatListBody') && !_$('chatInput')) return;

  /* Attach file button */
  _$all('[title="Attach file"], .chat-attach-btn').forEach(btn => {
    _once(btn, 'click', function () {
      const inp = document.createElement('input');
      inp.type  = 'file';
      inp.accept = 'image/*,.pdf,.doc,.docx,.txt';
      inp.onchange = () => {
        if (inp.files[0]) _toast('"' + inp.files[0].name + '" attached!', 'success');
      };
      inp.click();
    });
  });

  /* Emoji button → insert random emoji */
  _$all('[title="Emoji"], .chat-emoji-btn').forEach(btn => {
    _once(btn, 'click', function () {
      const emojis = ['😊','👍','🎉','❤️','🙏','✅','🔥','💡','⚠️','🤔'];
      const pick   = emojis[Math.floor(Math.random() * emojis.length)];
      const inp    = _$('chatInput') || _$('replyInput');
      if (inp) { inp.value += pick; inp.focus(); }
    });
  });

  /* Apply AI Suggestion button */
  const aiApply = _$q('.ai-btn[onclick*="applyAISuggestion"], [onclick*="applyAISuggestion"]');
  if (aiApply) {
    _once(aiApply, 'click', function () {
      const suggText = (_$('aiSuggText') || {}).textContent || '';
      const inp = _$('chatInput');
      if (inp && suggText) {
        inp.value = 'Hi,\n\nBased on your issue, here\'s what I suggest:\n' + suggText + '\n\nLet me know if this helps!\n— Ojash Desk Support';
        inp.focus();
        _toast('AI suggestion applied to message box!', 'success');
      }
    });
    /* remove old inline onclick so ours doesn't double-fire */
    aiApply.removeAttribute('onclick');
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  CUSTOMER PORTAL — CSAT submit, portal logout               */
/* ─────────────────────────────────────────────────────────── */
function fixPortalPage() {
  if (!_$('portalTicketList') && !_$q('.portal-section')) return;

  const csatSubmit = _$('csatSubmitBtn') || _$q('.csat-submit-btn');
  _once(csatSubmit, 'click', function () {
    const active = _$all('#csatStars .csat-star, #csatStars span').filter(s => s.classList.contains('active'));
    if (!active.length) return _toast('Please select a rating first.', 'warning');
    _toast('Thank you! ' + active.length + '/5 ⭐ — your feedback matters!', 'success', 4000);
  });

  const logout = _$('portalLogoutBtn') || _$q('.portal-logout-btn');
  _once(logout, 'click', function () {
    localStorage.removeItem('ojashdesk_current_user');
    window.location.href = 'login.html';
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  GLOBAL — sidebar highlight, logout, mobile, forms          */
/* ─────────────────────────────────────────────────────────── */
function fixSidebarActive() {
  const page = window.location.pathname.split('/').pop() || 'home.html';
  _$all('.nav-item').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop();
    a.classList.toggle('active', href === page);
  });
}

function fixLogout() {
  _$all('a[href="login.html"]').forEach(a => {
    _once(a, 'click', () => localStorage.removeItem('ojashdesk_current_user'));
  });
}

function fixMobileSidebar() {
  _$all('.nav-item').forEach(a => {
    _once(a, 'click', function () {
      const sb = _$('sidebar'), ov = _$('sidebarOverlay');
      if (sb && sb.classList.contains('open')) {
        sb.classList.remove('open');
        if (ov) ov.classList.remove('active');
      }
    });
  });
}

function fixDropdownClose() {
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.dropdown')) {
      _$all('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
  }, { capture: true });
}

function fixFormDoubleSubmit() {
  _$all('form').forEach(form => {
    _once(form, 'submit', function () {
      const btn = this.querySelector('[type=submit]');
      if (btn) { btn.disabled = true; setTimeout(() => (btn.disabled = false), 2000); }
    });
  });
}

/* ─────────────────────────────────────────────────────────── */
/*  BOOT — run after app.js + features.js finish               */
/* ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    fixLogout();
    fixDropdownClose();
    fixSidebarActive();
    fixMobileSidebar();
    fixFormDoubleSubmit();

    fixLoginPage();
    fixHomePage();
    fixInboxPage();
    fixTicketsPage();
    fixCustomersPage();
    fixAnalyticsPage();
    fixSettingsPage();
    fixKBPage();
    fixBillingPage();
    fixLiveChatPage();
    fixPortalPage();
  }, 120);
});