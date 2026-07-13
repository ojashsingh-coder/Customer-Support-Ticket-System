// features.js
// extra features for Ojash Desk - live chat, canned replies, SLA, CSAT etc.
// Ojash Singh

'use strict';

// LIVE CHAT
let activeChatId  = null;
let chatMessages  = {};
let typingTimers  = {};

function initLiveChat() {
  const chatListBody = document.getElementById('chatListBody');
  if (!chatListBody || !window.OD) return;

  // Deep-copy chat messages so we can mutate per session
  chatMessages = JSON.parse(JSON.stringify(window.OD.CHAT_MESSAGES_DATA));

  renderChatList();

  // Open first chat by default
  if (window.OD.CHAT_SESSIONS.length) {
    openChat(window.OD.CHAT_SESSIONS[0].id);
  }
}

function renderChatList(filter) {
  const chatListBody = document.getElementById('chatListBody');
  if (!chatListBody || !window.OD) return;

  const sessions = filter
    ? window.OD.CHAT_SESSIONS.filter(s => s.status === filter)
    : window.OD.CHAT_SESSIONS;

  chatListBody.innerHTML = sessions.map(s => `
    <div class="chat-item ${activeChatId === s.id ? 'active' : ''}" data-chat-id="${s.id}" onclick="openChat('${s.id}')">
      <div class="chat-item-avatar ${s.avatar}">
        ${s.initials}
        <span class="status-dot status-${s.status}"></span>
      </div>
      <div class="chat-item-body">
        <div class="chat-item-header">
          <span class="chat-item-name">${escHtml(s.customer)}</span>
          <span class="chat-item-time">${s.time}</span>
        </div>
        <div class="chat-item-preview">${escHtml(s.lastMsg)}</div>
      </div>
      ${s.unread ? `<span class="nav-badge" style="flex-shrink:0;">${s.unread}</span>` : ''}
    </div>
  `).join('');
}

function openChat(chatId) {
  if (!window.OD) return;
  activeChatId = chatId;
  const session = window.OD.CHAT_SESSIONS.find(s => s.id === chatId);
  if (!session) return;

  // Mark as read
  session.unread = 0;

  // Show chat main, hide empty state
  const emptyState = document.getElementById('chatEmptyState');
  const chatActive = document.getElementById('chatActiveArea') || document.querySelector('.chat-active-area');
  if (emptyState) emptyState.style.display = 'none';

  // Update chat header
  const hName   = document.getElementById('chatHeaderName');
  const hAvatar = document.getElementById('chatHeaderAvatar');
  if (hName)   hName.textContent = session.customer;
  if (hAvatar) { hAvatar.textContent = session.initials; hAvatar.className = `chat-item-avatar ${session.avatar}`; }

  // Update right panel
  const crpAvatar  = document.getElementById('crpAvatar');
  const crpName    = document.getElementById('crpName');
  const crpEmail   = document.getElementById('crpEmail');
  const crpLoc     = document.getElementById('crpLoc');
  const crpTickets = document.getElementById('crpTickets');
  if (crpAvatar)  { crpAvatar.textContent = session.initials; crpAvatar.className = `chat-item-avatar ${session.avatar}`; }
  if (crpName)    crpName.textContent    = session.customer;
  if (crpEmail)   crpEmail.textContent   = session.email;
  if (crpLoc)     crpLoc.textContent     = session.location;
  if (crpTickets) crpTickets.textContent = session.totalTickets;

  // Show right panel
  const rightPanel = document.getElementById('chatRightPanel');
  if (rightPanel) rightPanel.style.display = '';

  // AI suggestion in right panel
  const aiSuggText = document.getElementById('aiSuggText');
  const suggestions = {
    ch1: 'Customer cannot login. Password reset email not received — likely an email delivery issue.',
    ch2: 'Customer was charged twice. Check payment gateway for duplicate transaction.',
    ch3: 'Customer wants to export data. Direct to Analytics > Export button.',
    ch4: 'Issue resolved. Customer confirmed the fix is working.',
    ch5: 'Customer is idle/waiting. Send a proactive message to re-engage.',
    ch6: 'Conversation closed. Customer expressed satisfaction.',
  };
  if (aiSuggText) aiSuggText.textContent = suggestions[chatId] || 'No suggestion available for this conversation.';

  renderChatMessages(chatId);
  renderChatList();

  // Simulate typing indicator for active chats
  if (session.status === 'active' && chatId !== 'ch4' && chatId !== 'ch6') {
    setTimeout(() => simulateTyping(chatId, session.customer), 3000 + Math.random()*4000);
  }
}

function renderChatMessages(chatId) {
  const msgsEl = document.getElementById('chatMessages');
  if (!msgsEl) return;

  const messages = chatMessages[chatId] || [];
  msgsEl.innerHTML = messages.map(m => `
    <div class="chat-msg ${m.from === 'agent' ? 'chat-msg-agent' : 'chat-msg-customer'}">
      ${m.from !== 'agent' ? `<div class="chat-item-avatar ${m.avatar || 'av-blue'}" style="width:30px;height:30px;font-size:0.7rem;">${m.initials}</div>` : ''}
      <div class="chat-bubble ${m.from === 'agent' ? 'chat-bubble-agent' : 'chat-bubble-customer'}">
        ${escHtml(m.text)}
        <div class="chat-msg-time">${m.time}</div>
      </div>
      ${m.from === 'agent' ? `<div class="chat-item-avatar av-purple" style="width:30px;height:30px;font-size:0.7rem;">OS</div>` : ''}
    </div>
  `).join('');

  // Scroll to bottom
  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function simulateTyping(chatId, customerName) {
  if (activeChatId !== chatId) return;
  const indicator = document.getElementById('typingIndicator');
  const typerName = document.getElementById('typerName');
  if (!indicator) return;
  if (typerName) typerName.textContent = customerName;
  indicator.style.display = 'flex';

  typingTimers[chatId] = setTimeout(() => {
    indicator.style.display = 'none';
    // Add a simulated customer reply
    const replies = [
      "Thanks, let me try that.",
      "I see, that makes sense.",
      "Okay, I'll check and get back to you.",
      "Perfect, thank you so much!",
      "Still not working unfortunately.",
      "Could you clarify that a bit more?",
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    const session = window.OD && window.OD.CHAT_SESSIONS.find(s => s.id === chatId);
    (chatMessages[chatId] = chatMessages[chatId] || []).push({
      from: 'customer', name: customerName,
      initials: (session && session.initials) || '??',
      avatar:   (session && session.avatar)   || 'av-blue',
      time: 'Just now', text: reply,
    });
    if (session) { session.lastMsg = reply; session.unread++; }
    if (activeChatId === chatId) {
      renderChatMessages(chatId);
      renderChatList();
    }
    showToast(`💬 ${customerName}: ${reply}`, 'info', 3000);
  }, 2500);
}

function sendChatMessage(text) {
  if (!text || !activeChatId) return;
  const user = window.getCurrentUser ? window.getCurrentUser() : { name: 'Ojash Singh', initials: 'OS' };
  const msg = {
    from: 'agent', name: user.name,
    initials: user.initials || 'OS',
    avatar: user.avatar || 'av-purple',
    time: 'Just now', text,
  };
  (chatMessages[activeChatId] = chatMessages[activeChatId] || []).push(msg);
  const session = window.OD && window.OD.CHAT_SESSIONS.find(s => s.id === activeChatId);
  if (session) session.lastMsg = text;
  renderChatMessages(activeChatId);
  renderChatList();

  // Simulate customer typing response after agent sends
  if (session && session.status === 'active') {
    setTimeout(() => simulateTyping(activeChatId, session.customer), 2000 + Math.random()*3000);
  }
}

// Wire chat input
window.handleChatInput = function(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  handleCannedTrigger(el);
};

window.handleChatKey = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const inp = document.getElementById('chatInput');
    if (inp && inp.value.trim()) {
      sendChatMessage(inp.value.trim());
      inp.value = '';
      inp.style.height = 'auto';
      closeCannedDropdown();
    }
  }
  if (e.key === 'Escape') closeCannedDropdown();
};

// Send button
document.addEventListener('DOMContentLoaded', function() {
  const sendBtn = document.getElementById('chatSendBtn') || document.querySelector('.chat-send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const inp = document.getElementById('chatInput');
      if (inp && inp.value.trim()) {
        sendChatMessage(inp.value.trim());
        inp.value = '';
        inp.style.height = 'auto';
        closeCannedDropdown();
      }
    });
  }

  // Chat list filter tabs
  document.querySelectorAll('.chat-filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.chat-filter-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderChatList(this.dataset.status || undefined);
    });
  });

  // Emoji picker (demo)
  const emojiBtn = document.querySelector('.chat-emoji-btn');
  if (emojiBtn) {
    emojiBtn.addEventListener('click', () => {
      const emojis = ['😊','👍','🎉','❤️','🙏','✅','🔥','💡','⚠️','🤔'];
      const inp = document.getElementById('chatInput');
      if (inp) inp.value += emojis[Math.floor(Math.random()*emojis.length)];
    });
  }

  // Attach file (demo)
  const attachBtn = document.querySelector('.chat-attach-btn');
  if (attachBtn) {
    attachBtn.addEventListener('click', () => {
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = 'image/*,.pdf,.doc,.docx,.txt';
      inp.onchange = function() {
        if (inp.files[0]) {
          window.showToast && showToast('File "' + inp.files[0].name + '" attached!', 'success');
        }
      };
      inp.click();
    });
  }

  // Convert chat to ticket
  const convertBtn = document.querySelector('.convert-to-ticket-btn') || document.getElementById('convertToTicketBtn');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      if (!activeChatId || !window.OD) return;
      const session = window.OD.CHAT_SESSIONS.find(s => s.id === activeChatId);
      if (session) {
        showToast(`Chat with ${session.customer} converted to ticket!`, 'success');
      }
    });
  }

  initLiveChat();
});

// CANNED RESPONSES
function handleCannedTrigger(el) {
  const val = el.value;
  const lastSlash = val.lastIndexOf('/');
  if (lastSlash === -1) { closeCannedDropdown(); return; }

  const query = val.slice(lastSlash + 1).toLowerCase();
  if (!window.OD) return;
  // shortcodes are stored as '/hi', '/pwreset', etc.
  // query is the text after the last '/' so match shortcode against '/' + query
  const matches = window.OD.CANNED_RESPONSES.filter(cr =>
    cr.shortcode.toLowerCase().startsWith('/' + query) || cr.title.toLowerCase().includes(query)
  );

  const dropdown = document.getElementById('cannedDropdown');
  if (!dropdown) return;

  if (!matches.length) { closeCannedDropdown(); return; }

  dropdown.innerHTML = matches.map(cr => `
    <div class="canned-item" data-shortcode="${cr.shortcode}" data-text="${encodeURIComponent(cr.text)}">
      <div class="canned-item-title">${escHtml(cr.title)}</div>
      <div class="canned-item-code">${escHtml(cr.shortcode)}</div>
    </div>
  `).join('');
  dropdown.classList.add('open');
  dropdown.style.display = '';

  dropdown.querySelectorAll('.canned-item').forEach(item => {
    item.addEventListener('click', function() {
      const text = decodeURIComponent(this.dataset.text);
      const user = window.getCurrentUser ? window.getCurrentUser() : { name: 'Ojash Singh' };
      const session = activeChatId && window.OD ? window.OD.CHAT_SESSIONS.find(s => s.id === activeChatId) : null;
      const filled = text
        .replace(/\{\{customer_name\}\}/g, session ? session.customer.split(' ')[0] : 'Customer')
        .replace(/\{\{agent_name\}\}/g,    user.name || 'Ojash Singh')
        .replace(/\{\{ticket_id\}\}/g,     '#TK-' + Math.floor(1000+Math.random()*9000));
      const inp = document.getElementById('chatInput') || document.getElementById('replyInput');
      if (inp) {
        inp.value = filled;
        inp.focus();
      }
      closeCannedDropdown();
    });
  });
}

function closeCannedDropdown() {
  const d = document.getElementById('cannedDropdown');
  if (d) { d.classList.remove('open'); d.style.display = 'none'; d.innerHTML = ''; }
}

// SLA ENGINE
const SLA_THRESHOLDS = {
  Urgent: { response: 30  * 60 * 1000, resolution: 4  * 60 * 60 * 1000 },
  High:   { response: 2   * 60 * 60 * 1000, resolution: 8  * 60 * 60 * 1000 },
  Medium: { response: 8   * 60 * 60 * 1000, resolution: 24 * 60 * 60 * 1000 },
  Low:    { response: 24  * 60 * 60 * 1000, resolution: 72 * 60 * 60 * 1000 },
};

function getSLAStatus(ticket) {
  if (!ticket.created) return { label: '—', status: 'normal' };
  const age = Date.now() - new Date(ticket.created).getTime();
  const threshold = SLA_THRESHOLDS[ticket.priority];
  if (!threshold) return { label: '—', status: 'normal' };

  if (ticket.status === 'resolved' || ticket.status === 'closed') {
    return { label: 'Met', status: 'met' };
  }

  const remaining = threshold.resolution - age;
  if (remaining <= 0) return { label: 'Breached', status: 'breached' };

  const hours = Math.floor(remaining / 3600000);
  const mins  = Math.floor((remaining % 3600000) / 60000);

  if (hours < 1)  return { label: `${mins}m left`, status: 'warning' };
  if (hours < 4)  return { label: `${hours}h left`, status: 'warning' };
  return { label: `${hours}h left`, status: 'normal' };
}

function checkSLABreaches() {
  if (!window.OD || !window.OD.TICKETS_DATA) return;
  const tickets = window.OD.TICKETS_DATA.filter(t => t.status === 'open' || t.status === 'pending');
  tickets.forEach(ticket => {
    const sla = getSLAStatus(ticket);
    if (sla.status === 'breached' || sla.status === 'warning') {
      // Update ticket SLA label in memory
      ticket.sla = sla.label;
    }
  });
}

// Run SLA check on load
document.addEventListener('DOMContentLoaded', () => setTimeout(checkSLABreaches, 500));

// AI COPILOT
const AI_KEYWORDS = {
  login:    { suggestion: 'Customer is experiencing a login issue. Check if password reset email was delivered. May be in spam folder.', actions: ['Resend password reset', 'Verify email delivery', 'Check if account is locked'] },
  payment:  { suggestion: 'Payment-related issue. Check the payment gateway dashboard for transaction status. Look for duplicate charges.', actions: ['Check transaction in gateway', 'Verify charge amount', 'Initiate refund if applicable'] },
  refund:   { suggestion: 'Customer requesting a refund. Verify the refund policy applies. Check order date and payment method.', actions: ['Check refund eligibility', 'Initiate refund in payment gateway', 'Send confirmation email'] },
  billing:  { suggestion: 'Billing inquiry. Check the customer\'s subscription plan and invoice history.', actions: ['View invoice history', 'Check subscription status', 'Update billing information'] },
  api:      { suggestion: 'API-related issue. Check rate limits and API key validity. Review error logs.', actions: ['Check rate limit status', 'Verify API key', 'Review API documentation'] },
  export:   { suggestion: 'Export functionality issue. May be a browser compatibility problem. Try Chrome with cache cleared.', actions: ['Clear browser cache', 'Try a different browser', 'Check file format support'] },
  password: { suggestion: 'Password reset issue. Verify the customer\'s email address and check if the reset email was sent.', actions: ['Resend password reset email', 'Check spam folder', 'Verify account email'] },
  invoice:  { suggestion: 'Invoice access issue. Check if the invoice was generated correctly and the download link is valid.', actions: ['Regenerate invoice', 'Send invoice via email', 'Check invoice generation status'] },
  sso:      { suggestion: 'SSO configuration issue. Verify ACS URL and Entity ID match between the IdP and Ojash Desk settings.', actions: ['Share SSO configuration guide', 'Verify ACS URL', 'Request IdP metadata'] },
  chat:     { suggestion: 'Live chat integration issue. Verify the widget script is installed correctly on the customer\'s website.', actions: ['Check widget installation', 'Verify domain whitelist', 'Test widget in sandbox'] },
};

function getAISuggestion(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [keyword, data] of Object.entries(AI_KEYWORDS)) {
    if (lower.includes(keyword)) return data;
  }
  return {
    suggestion: 'Review the ticket details and check our knowledge base for relevant articles.',
    actions: ['Search knowledge base', 'Check similar resolved tickets', 'Escalate if needed'],
  };
}

// AI Assist in ticket reply (wired from app.js but enhanced here)
document.addEventListener('DOMContentLoaded', () => {
  const aiBtn = document.getElementById('aiAssistBtn');
  const replyInp = document.getElementById('replyInput');
  if (aiBtn && replyInp) {
    aiBtn.addEventListener('click', () => {
      // Get context from the active ticket subject visible in DOM
      const subject = document.querySelector('.ticket-detail-subject');
      const subjectText = subject ? subject.textContent : replyInp.value;
      const ai = getAISuggestion(subjectText);
      if (ai) {
        const user = window.getCurrentUser ? window.getCurrentUser() : { name: 'Ojash Singh' };
        replyInp.value = `Hi,\n\nThank you for reaching out to Ojash Desk!\n\n${ai.actions.map(a => '• ' + a).join('\n')}\n\nPlease try the above steps and let me know if you need further assistance.\n\nBest regards,\n${user.name}\nOjash Desk Support`;
        window.showToast && showToast('AI draft applied!', 'success');
      }
    });
  }
});

// CSAT (Customer Satisfaction)
const CSAT_LABELS = ['','Poor 😞','Fair 😐','Good 🙂','Great 😊','Excellent 🌟'];

document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.csat-star, #csatStars span');
  if (!stars.length) return;

  let selectedRating = 0;

  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, j) => s.classList.toggle('hover', j <= i));
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
    star.addEventListener('click', () => {
      selectedRating = i + 1;
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
      const label = document.getElementById('csatRatingLabel');
      if (label) label.textContent = CSAT_LABELS[selectedRating] || 'Excellent';
    });
  });

  // CSAT submit
  const csatSubmit = document.querySelector('.csat-submit-btn, #csatSubmit');
  if (csatSubmit) {
    csatSubmit.addEventListener('click', () => {
      if (!selectedRating) { window.showToast && showToast('Please select a rating.','warning'); return; }
      const comment = document.getElementById('csatComment');
      window.showToast && showToast(`Thank you for your ${CSAT_LABELS[selectedRating]} rating! 🙏`, 'success', 4000);
      stars.forEach(s => s.classList.remove('active'));
      selectedRating = 0;
      if (comment) comment.value = '';
      const label = document.getElementById('csatRatingLabel');
      if (label) label.textContent = 'Select a rating above';
    });
  }
});

// TEAM COLLABORATION
function addInternalNote(ticketId, note) {
  const user = window.getCurrentUser ? window.getCurrentUser() : { name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple' };
  const tickets = window.getTickets ? getTickets() : [];
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx !== -1) {
    (tickets[idx].internalNotes = tickets[idx].internalNotes || []).push({
      name: user.name, initials: user.initials || 'OS',
      avatar: user.avatar || 'av-purple', time: 'Just now', text: note,
    });
    if (window.saveTickets) saveTickets(tickets);
    if (window.OjashApi) window.OjashApi.updateTicket(ticketId, { internalNotes: tickets[idx].internalNotes }).catch(console.error);
    window.showToast && showToast('Internal note added!', 'info');
  }
}
window.addInternalNote = addInternalNote;

// MULTI-CHANNEL BADGE
const CHANNEL_ICONS = {
  web:   '🌐',
  email: '📧',
  chat:  '💬',
  api:   '🔌',
  phone: '📞',
};

window.getChannelIcon = function(channel) {
  return CHANNEL_ICONS[channel] || '🌐';
};

// KEYBOARD SHORTCUTS
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    // / to focus search
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const s = document.getElementById('globalSearch') || document.getElementById('ticketSearch');
      if (s) s.focus();
    }
    // Escape closes modals
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => {
        m.classList.remove('open');
        document.body.style.overflow = '';
      });
      closeCannedDropdown();
    }
    // N to create new ticket
    if (e.key === 'n' && (e.ctrlKey || e.metaKey) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const ntm = document.getElementById('newTicketModal');
      if (ntm && window.openModal) openModal('newTicketModal');
    }
  });
});

// MOBILE CHAT PANEL TOGGLE
document.addEventListener('DOMContentLoaded', () => {
  const chatMain = document.getElementById('chatMain');
  if (!chatMain) return;

  // On mobile, tapping a chat item shows the chat main panel
  document.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      chatMain.classList.add('mobile-active');
    });
  });

  // Back button in chat (mobile)
  const backBtn = document.querySelector('.chat-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => chatMain.classList.remove('mobile-active'));
  }
});

// INLINE HELPERS
function escHtml(str) {
  if (str === null || str === undefined) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function showToast(msg, type, duration) {
  // Prefer app.js's showToast registered on window; fall back to inline implementation
  if (typeof window._appShowToast === 'function') {
    window._appShowToast(msg, type, duration);
    return;
  }
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast ${type || 'info'}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, duration || 3000);
}

// Expose for external use
window.OdFeatures = {
  openChat, sendChatMessage, renderChatList, renderChatMessages,
  getSLAStatus, getAISuggestion, addInternalNote,
  initLiveChat, handleCannedTrigger, closeCannedDropdown,
};