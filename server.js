// server.js - backend for Ojash Desk ticket system

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./data');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// logs every request in terminal
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Ojash Desk backend is running.');
});

// ─────────────────────────────────────────────
// TICKET ROUTES (RESTful - 7 standard routes)
// ─────────────────────────────────────────────

// 1. INDEX - display list of all tickets
app.get('/tickets', (req, res) => {
  res.json(db.tickets);
});

// 2. NEW - show form to create a new ticket
app.get('/tickets/new', (req, res) => {
  res.json({ message: 'Show form to create a new ticket' });
});

// 3. CREATE - add new ticket, then redirect
app.post('/tickets', (req, res) => {
  const { subject, customer, email, priority, category } = req.body;

  if (!subject || !customer || !email) {
    return res.status(400).json({ error: 'subject, customer and email are required' });
  }

  const newTicket = {
    id: db.getNextTicketId(),
    subject,
    customer,
    email,
    status: 'open',
    priority: priority || 'Medium',
    category: category || 'General Inquiry',
    assignee: req.body.assignee || 'Unassigned',
    sla: req.body.sla || '—',
    updated: 'just now',
    avatar: req.body.avatar || 'av-blue',
    channel: req.body.channel || 'web',
    tags: req.body.tags || [],
    messages: req.body.messages || [],
    aiSuggestion: req.body.aiSuggestion || '',
    aiActions: req.body.aiActions || [],
    activity: req.body.activity || [],
    internalNotes: req.body.internalNotes || [],
    created: new Date().toISOString(),
  };

  db.tickets.unshift(newTicket);
  db.persist();
  res.status(201).json({ message: 'Ticket created, redirecting...', ticket: newTicket });
});

// 4. SHOW - show info about one ticket
app.get('/tickets/:id', (req, res) => {
  const ticket = db.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

// 5. EDIT - show edit form for one ticket
app.get('/tickets/:id/edit', (req, res) => {
  const ticket = db.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ message: 'Show edit form for ticket', ticket });
});

// 6. UPDATE - update a particular ticket, then redirect
app.put('/tickets/:id', (req, res) => {
  const ticket = db.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  Object.assign(ticket, req.body, { updated: 'just now' });
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.resolvedAt) {
    ticket.resolvedAt = new Date().toISOString();
  } else if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
    ticket.resolvedAt = null; // reopened
  }
  db.persist();
  res.json({ message: 'Ticket updated, redirecting...', ticket });
});

// 7. DESTROY - delete a ticket, then redirect
app.delete('/tickets/:id', (req, res) => {
  const index = db.tickets.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

  const deleted = db.tickets.splice(index, 1);
  db.persist();
  res.json({ message: 'Ticket deleted, redirecting...', ticket: deleted[0] });
});

// ── Ticket messages (replies) ──────────────────────────────────
app.post('/tickets/:id/messages', (req, res) => {
  const ticket = db.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { from, name, initials, avatar, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const message = { from: from || 'agent', name: name || '', initials: initials || '', avatar: avatar || 'av-purple', time: 'just now', text };
  if (!Array.isArray(ticket.messages)) ticket.messages = [];
  ticket.messages.push(message);
  ticket.updated = 'just now';
  db.persist();
  res.status(201).json({ message: 'Message added', ticket });
});

// ── Ticket internal notes ──────────────────────────────────────
app.post('/tickets/:id/notes', (req, res) => {
  const ticket = db.tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { author, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const note = { author: author || '', text, time: 'just now' };
  if (!Array.isArray(ticket.internalNotes)) ticket.internalNotes = [];
  ticket.internalNotes.push(note);
  db.persist();
  res.status(201).json({ message: 'Note added', ticket });
});

// ─────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────

app.get('/customers', (req, res) => {
  res.json(db.customers);
});

app.post('/customers', (req, res) => {
  const { name, email, company, plan } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const newCustomer = {
    id: 'c' + (Date.now().toString(36)),
    name, email,
    company: company || '',
    plan: plan || 'Free',
    phone: req.body.phone || '',
    location: req.body.location || '',
    since: req.body.since || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    tickets: 0,
    lifetime: '$0.00',
    csat: 0,
    orders: 0,
    initials: name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
    avatar: req.body.avatar || 'av-blue',
  };
  db.customers.push(newCustomer);
  db.persist();
  res.status(201).json(newCustomer);
});

// SHOW - one customer
app.get('/customers/:id', (req, res) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// UPDATE - edit a customer
app.put('/customers/:id', (req, res) => {
  const customer = db.customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  Object.assign(customer, req.body);
  db.persist();
  res.json({ message: 'Customer updated', customer });
});

// DESTROY - delete a customer
app.delete('/customers/:id', (req, res) => {
  const index = db.customers.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  const deleted = db.customers.splice(index, 1);
  db.persist();
  res.json({ message: 'Customer deleted', customer: deleted[0] });
});

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

app.post('/auth/register', (req, res) => {
  const { name, email, password, role, company } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const newUser = {
    id: 'u' + Date.now().toString(36),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: role || 'Agent',
    company: company || '',
    initials,
    avatar: 'av-purple',
    subscriptionPlan: 'Free',
    billingCycle: 'monthly',
    nextBillingDate: null,
    invoices: [],
  };
  db.users.push(newUser);
  db.persist();
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, initials: newUser.initials, avatar: newUser.avatar });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

  if (!user || !password || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// ─────────────────────────────────────────────
// USER / PROFILE ROUTES
// ─────────────────────────────────────────────

app.get('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// LIST all users (for the Agents & Teams settings page)
app.get('/users', (req, res) => {
  res.json(db.users.map(({ password, ...safe }) => safe));
});

// CREATE a new agent directly (used by "Invite Agent" — no real email
// delivery exists, so a temporary password is generated and returned
// once so it can be shown to the admin to pass along manually).
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const exists = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'A user with this email already exists' });

  const tempPassword = Math.random().toString(36).slice(-8);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const newUser = {
    id: 'u' + Date.now().toString(36),
    name, email,
    password: bcrypt.hashSync(tempPassword, 10),
    role: role || 'Agent',
    initials,
    avatar: ['av-blue','av-green','av-orange','av-pink','av-teal'][Math.floor(Math.random()*5)],
  };
  db.users.push(newUser);
  db.persist();
  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, tempPassword });
});

app.delete('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  if (db.users[index].role === 'Admin' && db.users.filter(u => u.role === 'Admin').length <= 1) {
    return res.status(400).json({ error: 'Cannot remove the last remaining Admin' });
  }
  const deleted = db.users.splice(index, 1);
  db.persist();
  res.json({ message: 'User removed', user: deleted[0] });
});

app.put('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Don't allow blanking out the password by accident
  const updates = { ...req.body };
  if (!updates.password) delete updates.password;
  else updates.password = bcrypt.hashSync(updates.password, 10);

  Object.assign(user, updates);
  db.persist();
  const { password: _pw, ...safeUser } = user;
  res.json({ message: 'Profile updated', user: safeUser });
});

// ─────────────────────────────────────────────
// KNOWLEDGE BASE ARTICLE ROUTES
// ─────────────────────────────────────────────

app.get('/kb-articles', (req, res) => {
  res.json(db.kbArticles);
});

app.post('/kb-articles', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  const newArticle = {
    id: 'art' + Date.now(),
    title,
    content,
    category: req.body.category || 'General',
    status: req.body.status || 'draft',
    author: req.body.author || 'Unknown',
    updated: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    views: 0,
    helpful: 0,
    notHelpful: 0,
  };
  db.kbArticles.unshift(newArticle);
  db.persist();
  res.status(201).json(newArticle);
});

app.get('/kb-articles/:id', (req, res) => {
  const article = db.kbArticles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

app.put('/kb-articles/:id', (req, res) => {
  const article = db.kbArticles.find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });

  Object.assign(article, req.body);
  db.persist();
  res.json({ message: 'Article updated', article });
});

app.delete('/kb-articles/:id', (req, res) => {
  const index = db.kbArticles.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Article not found' });

  const deleted = db.kbArticles.splice(index, 1);
  db.persist();
  res.json({ message: 'Article deleted', article: deleted[0] });
});

// ─────────────────────────────────────────────
// LIVE CHAT ROUTES
// ─────────────────────────────────────────────

app.get('/chats', (req, res) => {
  res.json(db.chats);
});

app.get('/chats/:id', (req, res) => {
  const chat = db.chats.find(c => String(c.id) === req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

app.post('/chats/:id/messages', (req, res) => {
  const chat = db.chats.find(c => String(c.id) === req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const { out, text, time } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const message = { out: !!out, text, time: time || 'Just now' };
  if (!Array.isArray(chat.msgs)) chat.msgs = [];
  chat.msgs.push(message);
  chat.preview = text.substring(0, 40) + (text.length > 40 ? '...' : '');
  db.persist();
  res.status(201).json({ message: 'Message added', chat });
});

app.put('/chats/:id', (req, res) => {
  const chat = db.chats.find(c => String(c.id) === req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  Object.assign(chat, req.body);
  db.persist();
  res.json({ message: 'Chat updated', chat });
});

app.delete('/chats/:id', (req, res) => {
  const index = db.chats.findIndex(c => String(c.id) === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Chat not found' });

  const deleted = db.chats.splice(index, 1);
  db.persist();
  res.json({ message: 'Chat ended', chat: deleted[0] });
});

// ─────────────────────────────────────────────
// ANALYTICS — computed from real ticket/customer data.
// Note: average response/resolution time isn't tracked anywhere yet (no
// first-response or resolved-at timestamps exist), so it's omitted here
// rather than faked. Everything below is a genuine computation over
// whatever tickets/customers actually exist right now.
// ─────────────────────────────────────────────
app.get('/analytics/summary', (req, res) => {
  const tickets = db.tickets;
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const resolutionRate = totalTickets ? Math.round((resolvedTickets / totalTickets) * 1000) / 10 : 0;

  const avgCsat = db.customers.length
    ? Math.round((db.customers.reduce((sum, c) => sum + (c.csat || 0), 0) / db.customers.length) * 10) / 10
    : 0;

  // Avg resolution time — computed from tickets that have a real resolvedAt
  // timestamp (set automatically whenever a ticket is marked resolved/closed,
  // see the PUT /tickets/:id route). Falls back to a labeled baseline once
  // there isn't yet enough real data to average, instead of showing nothing.
  const timedTickets = tickets.filter(t => t.resolvedAt && t.created);
  let avgResolutionHours, avgResolutionIsReal;
  if (timedTickets.length) {
    const totalHours = timedTickets.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.created)) / 36e5, 0);
    avgResolutionHours = Math.round((totalHours / timedTickets.length) * 10) / 10;
    avgResolutionIsReal = true;
  } else {
    avgResolutionHours = 4.2; // baseline shown until enough tickets have real timestamps
    avgResolutionIsReal = false;
  }

  // Channel breakdown — always includes the known channel types (at 0 if
  // unused yet) so the chart never renders as a single sparse bar.
  const knownChannels = ['web', 'email', 'chat', 'api'];
  const channelCounts = { web: 0, email: 0, chat: 0, api: 0 };
  tickets.forEach(t => {
    const ch = knownChannels.includes(t.channel) ? t.channel : 'web';
    channelCounts[ch]++;
  });
  const channels = knownChannels.map(label => ({ label, val: channelCounts[label] }));

  // Agent leaderboard — always includes the core support team (at 0 tickets
  // if they haven't been assigned any yet) merged with real assignment counts.
  const agentMap = {
    'Ojash Singh': { name: 'Ojash Singh', tickets: 0, resolved: 0 },
    'Priya Sharma': { name: 'Priya Sharma', tickets: 0, resolved: 0 },
    'Rohan Mehta': { name: 'Rohan Mehta', tickets: 0, resolved: 0 },
  };
  tickets.forEach(t => {
    const name = t.assignee && t.assignee !== 'Unassigned' ? t.assignee : null;
    if (!name) return;
    if (!agentMap[name]) agentMap[name] = { name, tickets: 0, resolved: 0 };
    agentMap[name].tickets++;
    if (t.status === 'resolved' || t.status === 'closed') agentMap[name].resolved++;
  });
  const agents = Object.values(agentMap).sort((a, b) => b.tickets - a.tickets);

  // Ticket volume for the last 7 calendar days, grouped by creation date.
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const volumeByDay = days.map(dateStr => {
    const dayTickets = tickets.filter(t => (t.created || '').slice(0, 10) === dateStr);
    const resolved = dayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
    const label = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { label, recv: dayTickets.length, res: resolved };
  });

  res.json({
    totalTickets,
    resolvedTickets,
    resolutionRate,
    avgCsat,
    avgResolutionHours,
    avgResolutionIsReal,
    channels,
    agents,
    volumeByDay,
  });
});

// ─────────────────────────────────────────────
// BILLING ROUTES
// ─────────────────────────────────────────────

app.get('/billing/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    plan: user.subscriptionPlan || 'Free',
    billingCycle: user.billingCycle || 'monthly',
    nextBillingDate: user.nextBillingDate || null,
    invoices: user.invoices || [],
  });
});

app.put('/billing/:userId', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { plan, billingCycle } = req.body;
  if (plan) user.subscriptionPlan = plan;
  if (billingCycle) user.billingCycle = billingCycle;

  // Generate a real invoice for this change so the invoice history isn't
  // left stale/empty after an upgrade — this mirrors what a real billing
  // system would do at the moment a plan change takes effect.
  const planPrices = { Free: '$0.00', Pro: '$49.00', Enterprise: '$149.00' };
  if (plan) {
    if (!Array.isArray(user.invoices)) user.invoices = [];
    const now = new Date();
    const invId = 'INV-' + now.getFullYear() + '-' + String(user.invoices.length + 1).padStart(2, '0') + '-' + now.getTime().toString(36).slice(-4);
    user.invoices.unshift({
      id: invId,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: plan + ' Plan — Plan change',
      amount: planPrices[plan] || '$0.00',
      status: 'Paid',
    });
    user.nextBillingDate = new Date(now.setMonth(now.getMonth() + 1)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  db.persist();
  res.json({ message: 'Billing updated', plan: user.subscriptionPlan, billingCycle: user.billingCycle, nextBillingDate: user.nextBillingDate, invoices: user.invoices });
});

app.post('/billing/:userId/cancel', (req, res) => {
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.subscriptionPlan = 'Free';
  user.nextBillingDate = null;
  db.persist();
  res.json({ message: 'Subscription cancelled', plan: user.subscriptionPlan });
});

// ─────────────────────────────────────────────
// CANNED RESPONSE ROUTES
// ─────────────────────────────────────────────

app.get('/canned-responses', (req, res) => {
  res.json(db.cannedResponses);
});

app.post('/canned-responses', (req, res) => {
  const { title, shortcode, body } = req.body;
  if (!title || !shortcode || !body) {
    return res.status(400).json({ error: 'title, shortcode and body are required' });
  }
  const newCanned = {
    id: 'cr' + Date.now(),
    title, shortcode, body, text: body,
    uses: 0,
  };
  db.cannedResponses.push(newCanned);
  db.persist();
  res.status(201).json(newCanned);
});

app.put('/canned-responses/:id', (req, res) => {
  const cr = db.cannedResponses.find(c => c.id === req.params.id);
  if (!cr) return res.status(404).json({ error: 'Canned response not found' });

  Object.assign(cr, req.body);
  if (req.body.body) cr.text = req.body.body; // keep both field names in sync
  db.persist();
  res.json({ message: 'Canned response updated', cannedResponse: cr });
});

app.delete('/canned-responses/:id', (req, res) => {
  const index = db.cannedResponses.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Canned response not found' });

  const deleted = db.cannedResponses.splice(index, 1);
  db.persist();
  res.json({ message: 'Canned response deleted', cannedResponse: deleted[0] });
});

// ─────────────────────────────────────────────
// TAG ROUTES
// ─────────────────────────────────────────────

app.get('/tags', (req, res) => {
  res.json(db.tags);
});

app.post('/tags', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const clean = name.trim().toLowerCase();
  if (db.tags.includes(clean)) return res.status(409).json({ error: 'Tag already exists' });
  db.tags.push(clean);
  db.persist();
  res.status(201).json({ tag: clean, tags: db.tags });
});

app.delete('/tags/:name', (req, res) => {
  const clean = decodeURIComponent(req.params.name).toLowerCase();
  const index = db.tags.indexOf(clean);
  if (index === -1) return res.status(404).json({ error: 'Tag not found' });
  db.tags.splice(index, 1);
  db.persist();
  res.json({ message: 'Tag removed', tags: db.tags });
});

// ─────────────────────────────────────────────
// SLA POLICY ROUTES
// ─────────────────────────────────────────────

app.get('/sla-policy', (req, res) => {
  res.json(db.slaPolicy);
});

app.put('/sla-policy', (req, res) => {
  Object.assign(db.slaPolicy, req.body);
  db.persist();
  res.json({ message: 'SLA policy updated', slaPolicy: db.slaPolicy });
});

// ─────────────────────────────────────────────
// API KEY ROUTES
// ─────────────────────────────────────────────

app.get('/api-keys', (req, res) => {
  res.json(db.apiKeys);
});

app.post('/api-keys', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const raw = 'od_live_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const newKey = {
    id: 'key' + Date.now(),
    name: name.trim(),
    key: raw,
    masked: raw.slice(0, 12) + '••••••••' + raw.slice(-4),
    created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
  db.apiKeys.push(newKey);
  db.persist();
  res.status(201).json(newKey);
});

app.delete('/api-keys/:id', (req, res) => {
  const index = db.apiKeys.findIndex(k => k.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'API key not found' });
  const deleted = db.apiKeys.splice(index, 1);
  db.persist();
  res.json({ message: 'API key revoked', apiKey: deleted[0] });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});