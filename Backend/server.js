require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

const Ticket = require('./models/Ticket');
const Customer = require('./models/Customer');
const User = require('./models/User');
const KbArticle = require('./models/KbArticle');
const CannedResponse = require('./models/CannedResponse');
const Chat = require('./models/Chat');
const Tag = require('./models/Tag');
const ApiKey = require('./models/ApiKey');
const Webhook = require('./models/Webhook');
const Settings = require('./models/Settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Ojash Desk backend is running (MongoDB).');
});

async function getSettings() {
  let s = await Settings.findOne({ id: 'singleton' });
  if (!s) s = await Settings.create({ id: 'singleton' });
  return s;
}

async function nextTicketId() {
  const s = await getSettings();
  const num = s.nextTicketNum;
  s.nextTicketNum = num + 1;
  await s.save();
  return `TK-${num}`;
}

// ticket routes
app.get('/tickets', async (req, res) => {
  const tickets = await Ticket.find().sort({ created: -1 });
  res.json(tickets);
});

app.get('/tickets/new', (req, res) => {
  res.json({ message: 'Show form to create a new ticket' });
});

app.post('/tickets', async (req, res) => {
  const { subject, customer, email, priority, category } = req.body;
  if (!subject || !customer || !email) {
    return res.status(400).json({ error: 'subject, customer and email are required' });
  }

  const newTicket = await Ticket.create({
    id: await nextTicketId(),
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
  });

  res.status(201).json({ message: 'Ticket created, redirecting...', ticket: newTicket });
});

app.get('/tickets/:id', async (req, res) => {
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json(ticket);
});

app.get('/tickets/:id/edit', async (req, res) => {
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ message: 'Show edit form for ticket', ticket });
});

app.put('/tickets/:id', async (req, res) => {
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  Object.assign(ticket, req.body, { updated: 'just now' });
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && !ticket.resolvedAt) {
    ticket.resolvedAt = new Date().toISOString();
  } else if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
    ticket.resolvedAt = null;
  }
  await ticket.save();
  res.json({ message: 'Ticket updated, redirecting...', ticket });
});

app.delete('/tickets/:id', async (req, res) => {
  const deleted = await Ticket.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Ticket not found' });
  res.json({ message: 'Ticket deleted, redirecting...', ticket: deleted });
});

app.post('/tickets/:id/messages', async (req, res) => {
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { from, name, initials, avatar, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const message = { from: from || 'agent', name: name || '', initials: initials || '', avatar: avatar || 'av-purple', time: 'just now', text };
  ticket.messages = ticket.messages || [];
  ticket.messages.push(message);
  ticket.updated = 'just now';
  await ticket.save();
  res.status(201).json({ message: 'Message added', ticket });
});

app.post('/tickets/:id/notes', async (req, res) => {
  const ticket = await Ticket.findOne({ id: req.params.id });
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { author, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const note = { author: author || '', text, time: 'just now' };
  ticket.internalNotes = ticket.internalNotes || [];
  ticket.internalNotes.push(note);
  await ticket.save();
  res.status(201).json({ message: 'Note added', ticket });
});

// customer routes
app.get('/customers', async (req, res) => {
  res.json(await Customer.find());
});

app.post('/customers', async (req, res) => {
  const { name, email, company, plan } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const newCustomer = await Customer.create({
    id: 'c' + Date.now().toString(36),
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
  });
  res.status(201).json(newCustomer);
});

app.get('/customers/:id', async (req, res) => {
  const customer = await Customer.findOne({ id: req.params.id });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.put('/customers/:id', async (req, res) => {
  const customer = await Customer.findOne({ id: req.params.id });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  Object.assign(customer, req.body);
  await customer.save();
  res.json({ message: 'Customer updated', customer });
});

app.delete('/customers/:id', async (req, res) => {
  const deleted = await Customer.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Customer not found' });
  res.json({ message: 'Customer deleted', customer: deleted });
});

// auth routes
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role, company } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const exists = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  if (exists) return res.status(409).json({ error: 'User already exists' });

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const newUser = await User.create({
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
  });
  res.status(201).json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, initials: newUser.initials, avatar: newUser.avatar });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: new RegExp(`^${email || ''}$`, 'i') });

  if (!user || !password || !bcrypt.compareSync(password, user.password || '')) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const safeUser = user.toObject();
  delete safeUser.password;
  res.json(safeUser);
});

// user / profile routes
app.get('/users/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safeUser = user.toObject();
  delete safeUser.password;
  res.json(safeUser);
});

app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users.map(u => { const o = u.toObject(); delete o.password; return o; }));
});

app.post('/users', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const exists = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
  if (exists) return res.status(409).json({ error: 'A user with this email already exists' });

  const tempPassword = Math.random().toString(36).slice(-8);
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const newUser = await User.create({
    id: 'u' + Date.now().toString(36),
    name, email,
    password: bcrypt.hashSync(tempPassword, 10),
    role: role || 'Agent',
    initials,
    avatar: ['av-blue', 'av-green', 'av-orange', 'av-pink', 'av-teal'][Math.floor(Math.random() * 5)],
  });
  const safeUser = newUser.toObject();
  delete safeUser.password;
  res.status(201).json({ user: safeUser, tempPassword });
});

app.delete('/users/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'Admin') {
    const adminCount = await User.countDocuments({ role: 'Admin' });
    if (adminCount <= 1) return res.status(400).json({ error: 'Cannot remove the last remaining Admin' });
  }
  await user.deleteOne();
  res.json({ message: 'User removed', user });
});

app.put('/users/:id', async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updates = { ...req.body };
  if (!updates.password) delete updates.password;
  else updates.password = bcrypt.hashSync(updates.password, 10);

  Object.assign(user, updates);
  await user.save();
  const safeUser = user.toObject();
  delete safeUser.password;
  res.json({ message: 'Profile updated', user: safeUser });
});

// knowledge base article routes
app.get('/kb-articles', async (req, res) => {
  res.json(await KbArticle.find());
});

app.post('/kb-articles', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

  const newArticle = await KbArticle.create({
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
  });
  res.status(201).json(newArticle);
});

app.get('/kb-articles/:id', async (req, res) => {
  const article = await KbArticle.findOne({ id: req.params.id });
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

app.put('/kb-articles/:id', async (req, res) => {
  const article = await KbArticle.findOne({ id: req.params.id });
  if (!article) return res.status(404).json({ error: 'Article not found' });
  Object.assign(article, req.body);
  await article.save();
  res.json({ message: 'Article updated', article });
});

app.delete('/kb-articles/:id', async (req, res) => {
  const deleted = await KbArticle.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Article not found' });
  res.json({ message: 'Article deleted', article: deleted });
});

// live chat routes
app.get('/chats', async (req, res) => {
  res.json(await Chat.find());
});

app.get('/chats/:id', async (req, res) => {
  const chat = await Chat.findOne({ id: req.params.id });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

app.post('/chats/:id/messages', async (req, res) => {
  const chat = await Chat.findOne({ id: req.params.id });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const { out, text, time } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const message = { out: !!out, text, time: time || 'Just now' };
  chat.msgs = chat.msgs || [];
  chat.msgs.push(message);
  chat.preview = text.substring(0, 40) + (text.length > 40 ? '...' : '');
  await chat.save();
  res.status(201).json({ message: 'Message added', chat });
});

app.put('/chats/:id', async (req, res) => {
  const chat = await Chat.findOne({ id: req.params.id });
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  Object.assign(chat, req.body);
  await chat.save();
  res.json({ message: 'Chat updated', chat });
});

app.delete('/chats/:id', async (req, res) => {
  const deleted = await Chat.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Chat not found' });
  res.json({ message: 'Chat ended', chat: deleted });
});

// analytics
app.get('/analytics/summary', async (req, res) => {
  const tickets = await Ticket.find();
  const customers = await Customer.find();

  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const resolutionRate = totalTickets ? Math.round((resolvedTickets / totalTickets) * 1000) / 10 : 0;

  const avgCsat = customers.length
    ? Math.round((customers.reduce((sum, c) => sum + (c.csat || 0), 0) / customers.length) * 10) / 10
    : 0;

  const timedTickets = tickets.filter(t => t.resolvedAt && t.created);
  let avgResolutionHours, avgResolutionIsReal;
  if (timedTickets.length) {
    const totalHours = timedTickets.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.created)) / 36e5, 0);
    avgResolutionHours = Math.round((totalHours / timedTickets.length) * 10) / 10;
    avgResolutionIsReal = true;
  } else {
    avgResolutionHours = 4.2;
    avgResolutionIsReal = false;
  }

  const knownChannels = ['web', 'email', 'chat', 'api'];
  const channelCounts = { web: 0, email: 0, chat: 0, api: 0 };
  tickets.forEach(t => {
    const ch = knownChannels.includes(t.channel) ? t.channel : 'web';
    channelCounts[ch]++;
  });
  const channels = knownChannels.map(label => ({ label, val: channelCounts[label] }));

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

  res.json({ totalTickets, resolvedTickets, resolutionRate, avgCsat, avgResolutionHours, avgResolutionIsReal, channels, agents, volumeByDay });
});

// billing
app.get('/billing/:userId', async (req, res) => {
  const user = await User.findOne({ id: req.params.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    plan: user.subscriptionPlan || 'Free',
    billingCycle: user.billingCycle || 'monthly',
    nextBillingDate: user.nextBillingDate || null,
    invoices: user.invoices || [],
  });
});

app.put('/billing/:userId', async (req, res) => {
  const user = await User.findOne({ id: req.params.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { plan, billingCycle } = req.body;
  if (plan) user.subscriptionPlan = plan;
  if (billingCycle) user.billingCycle = billingCycle;

  const planPrices = { Free: '$0.00', Pro: '$49.00', Enterprise: '$149.00' };
  if (plan) {
    user.invoices = user.invoices || [];
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

  await user.save();
  res.json({ message: 'Billing updated', plan: user.subscriptionPlan, billingCycle: user.billingCycle, nextBillingDate: user.nextBillingDate, invoices: user.invoices });
});

app.post('/billing/:userId/cancel', async (req, res) => {
  const user = await User.findOne({ id: req.params.userId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.subscriptionPlan = 'Free';
  user.nextBillingDate = null;
  await user.save();
  res.json({ message: 'Subscription cancelled', plan: user.subscriptionPlan });
});

// canned responses
app.get('/canned-responses', async (req, res) => {
  res.json(await CannedResponse.find());
});

app.post('/canned-responses', async (req, res) => {
  const { title, shortcode, body } = req.body;
  if (!title || !shortcode || !body) return res.status(400).json({ error: 'title, shortcode and body are required' });

  const newCanned = await CannedResponse.create({ id: 'cr' + Date.now(), title, shortcode, body, text: body, uses: 0 });
  res.status(201).json(newCanned);
});

app.put('/canned-responses/:id', async (req, res) => {
  const cr = await CannedResponse.findOne({ id: req.params.id });
  if (!cr) return res.status(404).json({ error: 'Canned response not found' });
  Object.assign(cr, req.body);
  if (req.body.body) cr.text = req.body.body;
  await cr.save();
  res.json({ message: 'Canned response updated', cannedResponse: cr });
});

app.delete('/canned-responses/:id', async (req, res) => {
  const deleted = await CannedResponse.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Canned response not found' });
  res.json({ message: 'Canned response deleted', cannedResponse: deleted });
});

// tags
app.get('/tags', async (req, res) => {
  const tags = await Tag.find();
  res.json(tags.map(t => t.name));
});

app.post('/tags', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const clean = name.trim().toLowerCase();
  const exists = await Tag.findOne({ name: clean });
  if (exists) return res.status(409).json({ error: 'Tag already exists' });
  await Tag.create({ name: clean });
  const tags = await Tag.find();
  res.status(201).json({ tag: clean, tags: tags.map(t => t.name) });
});

app.delete('/tags/:name', async (req, res) => {
  const clean = decodeURIComponent(req.params.name).toLowerCase();
  const deleted = await Tag.findOneAndDelete({ name: clean });
  if (!deleted) return res.status(404).json({ error: 'Tag not found' });
  const tags = await Tag.find();
  res.json({ message: 'Tag removed', tags: tags.map(t => t.name) });
});

// sla policy
app.get('/sla-policy', async (req, res) => {
  const s = await getSettings();
  res.json(s.slaPolicy);
});

app.put('/sla-policy', async (req, res) => {
  const s = await getSettings();
  s.slaPolicy = { ...s.slaPolicy, ...req.body };
  s.markModified('slaPolicy');
  await s.save();
  res.json({ message: 'SLA policy updated', slaPolicy: s.slaPolicy });
});

// api keys
app.get('/api-keys', async (req, res) => {
  res.json(await ApiKey.find());
});

app.post('/api-keys', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'name is required' });
  const raw = 'od_live_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const newKey = await ApiKey.create({
    id: 'key' + Date.now(),
    name: name.trim(),
    key: raw,
    masked: raw.slice(0, 12) + '••••••••' + raw.slice(-4),
    created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  });
  res.status(201).json(newKey);
});

app.delete('/api-keys/:id', async (req, res) => {
  const deleted = await ApiKey.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'API key not found' });
  res.json({ message: 'API key revoked', apiKey: deleted });
});

// webhooks
app.get('/webhooks', async (req, res) => {
  res.json(await Webhook.find());
});

app.post('/webhooks', async (req, res) => {
  const { event, url } = req.body;
  if (!event || !url) return res.status(400).json({ error: 'event and url are required' });
  if (!url.startsWith('http')) return res.status(400).json({ error: 'url must start with http:// or https://' });
  const newWebhook = await Webhook.create({ id: 'wh' + Date.now(), event: event.trim(), url: url.trim(), active: true });
  res.status(201).json(newWebhook);
});

app.put('/webhooks/:id', async (req, res) => {
  const wh = await Webhook.findOne({ id: req.params.id });
  if (!wh) return res.status(404).json({ error: 'Webhook not found' });
  Object.assign(wh, req.body);
  await wh.save();
  res.json({ message: 'Webhook updated', webhook: wh });
});

app.delete('/webhooks/:id', async (req, res) => {
  const deleted = await Webhook.findOneAndDelete({ id: req.params.id });
  if (!deleted) return res.status(404).json({ error: 'Webhook not found' });
  res.json({ message: 'Webhook deleted', webhook: deleted });
});

// email settings
app.get('/email-settings', async (req, res) => {
  const s = await getSettings();
  res.json(s.emailSettings);
});

app.put('/email-settings', async (req, res) => {
  const s = await getSettings();
  s.emailSettings = { ...s.emailSettings, ...req.body };
  s.markModified('emailSettings');
  await s.save();
  res.json({ message: 'Email settings updated', emailSettings: s.emailSettings });
});

// dashboard summary
function parseDurationToMinutes(str) {
  if (!str) return null;
  const match = String(str).match(/(\d+)\s*(h|m|d)/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit === 'd') return n * 24 * 60;
  if (unit === 'h') return n * 60;
  return n;
}

app.get('/dashboard/summary', async (req, res) => {
  const tickets = await Ticket.find();
  const s = await getSettings();
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'pending').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const resolvedToday = tickets.filter(t => t.resolvedAt && t.resolvedAt.slice(0, 10) === todayStr).length;

  const timedTickets = tickets.filter(t => t.resolvedAt && t.created);
  let avgResponseHours = 1.4;
  if (timedTickets.length) {
    const totalHours = timedTickets.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.created)) / 36e5, 0);
    avgResponseHours = Math.round((totalHours / timedTickets.length) * 10) / 10;
  }

  let slaBreached = 0;
  tickets.forEach(t => {
    if (t.status !== 'open' && t.status !== 'pending') return;
    const key = (t.priority || 'medium').toLowerCase();
    const policy = s.slaPolicy[key];
    if (!policy) return;
    const responseMinutes = parseDurationToMinutes(policy.response);
    if (responseMinutes === null || !t.created) return;
    const ageMinutes = (Date.now() - new Date(t.created)) / 60000;
    if (ageMinutes > responseMinutes) slaBreached++;
  });

  res.json({ openTickets, resolvedToday, avgResponseHours, slaBreached });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});