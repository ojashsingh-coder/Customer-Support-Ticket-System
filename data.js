// data.js - data store for Ojash Desk backend
// On boot, tries to load previously-saved data from db.json (via storage.js).
// If none exists yet (first run), falls back to the seed data below.

const storage = require('./storage');
const bcrypt = require('bcryptjs');

const seedTickets = [
  {
    id: 'TK-1024',
    subject: 'Unable to login to account',
    customer: 'Aarav Joshi',
    email: 'aarav.joshi@email.com',
    status: 'open',
    priority: 'High',
    category: 'Account',
    assignee: 'Ojash Singh',
    sla: '2h left',
    updated: '5m ago',
    avatar: 'av-blue',
    channel: 'web',
    tags: ['login', 'account'],
    messages: [
      { from: 'customer', name: 'Aarav Joshi', initials: 'AJ', avatar: 'av-blue', time: '10m ago', text: 'I am unable to login to my account. It says invalid credentials but I just changed my password.' },
      { from: 'agent', name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '5m ago', text: 'Hi Aarav, I can help you with that. Let me check your account status right away.' }
    ],
    aiSuggestion: 'This looks like a login issue. The customer may have reset their password recently.',
    aiActions: ['Resend the password reset email', 'Check if account is locked', 'Verify the email address on file'],
    activity: [],
    internalNotes: [],
    created: new Date().toISOString(),
  },
  {
    id: 'TK-1023',
    subject: 'Payment failed but amount deducted',
    customer: 'Simran Kaur',
    email: 'simran.k@techcorp.com',
    status: 'open',
    priority: 'Medium',
    category: 'Billing',
    assignee: 'Priya Sharma',
    sla: '5h left',
    updated: '1h ago',
    avatar: 'av-pink',
    channel: 'email',
    tags: ['billing', 'payment'],
    messages: [
      { from: 'customer', name: 'Simran Kaur', initials: 'SK', avatar: 'av-pink', time: '1h ago', text: 'My payment failed but the amount was deducted from my bank account. Please help!' }
    ],
    aiSuggestion: 'Billing issue — check the payment gateway for the original transaction.',
    aiActions: ['Check transaction status in payment gateway', 'Look for duplicate charges', 'Initiate refund if charge confirmed'],
    activity: [],
    internalNotes: [],
    created: new Date().toISOString(),
  },
  {
    id: 'TK-1022',
    subject: 'Refund not received after 7 days',
    customer: 'Rajesh Tiwari',
    email: 'rajesh.t@startup.io',
    status: 'pending',
    priority: 'Medium',
    category: 'Billing',
    assignee: 'Rohan Mehta',
    sla: '8h left',
    updated: '2h ago',
    avatar: 'av-green',
    channel: 'web',
    tags: ['refund', 'billing'],
    messages: [
      { from: 'customer', name: 'Rajesh Tiwari', initials: 'RT', avatar: 'av-green', time: '2h ago', text: 'I raised a refund request 7 days ago but have not received the amount yet.' },
      { from: 'agent', name: 'Rohan Mehta', initials: 'RM', avatar: 'av-teal', time: '1h ago', text: 'Hi Rajesh, I apologize for the delay. I am looking into this right now.' }
    ],
    aiSuggestion: 'Refund delays are often due to payment gateway processing times.',
    aiActions: ['Check refund eligibility', 'Verify original transaction', 'Process refund and send confirmation email'],
    activity: [],
    internalNotes: [],
    created: new Date().toISOString(),
  },
  {
    id: 'TK-1021',
    subject: 'API rate limit exceeded error',
    customer: 'Neha Gupta',
    email: 'neha.g@devtools.io',
    status: 'open',
    priority: 'Urgent',
    category: 'Technical Issue',
    assignee: 'Ojash Singh',
    sla: '1h left',
    updated: '30m ago',
    avatar: 'av-orange',
    channel: 'web',
    tags: ['api', 'technical'],
    messages: [
      { from: 'customer', name: 'Neha Gupta', initials: 'NG', avatar: 'av-orange', time: '30m ago', text: 'We are getting 429 rate limit errors on all our API calls. Our entire production is down!' }
    ],
    aiSuggestion: 'API rate limit issue — customer is likely hitting the plan limit.',
    aiActions: ['Check current rate limit usage', 'Verify the API key is active', 'Suggest plan upgrade if needed'],
    activity: [],
    internalNotes: [],
    created: new Date().toISOString(),
  },
  {
    id: 'TK-1020',
    subject: 'Feature request: dark mode for dashboard',
    customer: 'Arjun Sharma',
    email: 'arjun.s@designco.in',
    status: 'resolved',
    priority: 'Low',
    category: 'Feature Request',
    assignee: 'Priya Sharma',
    sla: '—',
    updated: '1d ago',
    avatar: 'av-teal',
    channel: 'email',
    tags: ['feature', 'ui'],
    messages: [
      { from: 'customer', name: 'Arjun Sharma', initials: 'AS', avatar: 'av-teal', time: '1d ago', text: 'Can you add a dark mode option to the dashboard? It would really help during late night work.' },
      { from: 'agent', name: 'Priya Sharma', initials: 'PS', avatar: 'av-blue', time: '1d ago', text: 'Great feedback! Dark mode is already on our roadmap. I will pass this along to the product team.' }
    ],
    aiSuggestion: 'Feature request — already on roadmap.',
    aiActions: ['Check roadmap for this request', 'Update customer with timeline', 'Log feedback for product team'],
    activity: [],
    internalNotes: [],
    created: new Date().toISOString(),
    resolvedAt: new Date(Date.now() + 3.5 * 60 * 60 * 1000).toISOString(),
  }
];

const seedCustomers = [
  { id: 'c1', name: 'Aarav Joshi', email: 'aarav.joshi@email.com', company: 'Acme Corp', plan: 'Pro', phone: '+91 98765 43210', location: 'Mumbai, India', since: 'Jan 15, 2025', tickets: 8, lifetime: '$480.00', csat: 4.2, orders: 12, initials: 'AJ', avatar: 'av-blue' },
  { id: 'c2', name: 'Simran Kaur', email: 'simran.k@techcorp.com', company: 'TechCorp', plan: 'Enterprise', phone: '+91 91234 56789', location: 'Bangalore, India', since: 'Mar 3, 2024', tickets: 23, lifetime: '$2,400.00', csat: 4.8, orders: 36, initials: 'SK', avatar: 'av-pink' },
  { id: 'c3', name: 'Rajesh Tiwari', email: 'rajesh.t@startup.io', company: 'StartupIO', plan: 'Pro', phone: '+91 99876 54321', location: 'Delhi, India', since: 'Sep 10, 2024', tickets: 5, lifetime: '$300.00', csat: 3.9, orders: 6, initials: 'RT', avatar: 'av-green' },
  { id: 'c4', name: 'Neha Gupta', email: 'neha.g@devtools.io', company: 'DevTools IO', plan: 'Enterprise', phone: '+91 90000 11111', location: 'Pune, India', since: 'Jun 1, 2023', tickets: 41, lifetime: '$5,800.00', csat: 4.6, orders: 72, initials: 'NG', avatar: 'av-orange' },
  { id: 'c5', name: 'Arjun Sharma', email: 'arjun.s@designco.in', company: 'DesignCo', plan: 'Free', phone: '+91 88888 99999', location: 'Chennai, India', since: 'Nov 20, 2025', tickets: 2, lifetime: '$0.00', csat: 5.0, orders: 0, initials: 'AS', avatar: 'av-teal' }
];

const seedUsers = [
  {
    id: 'u1', name: 'Ojash Singh', email: 'ojash@ojashdesk.com', password: 'admin123', role: 'Admin', initials: 'OS', avatar: 'av-purple',
    subscriptionPlan: 'Pro',
    billingCycle: 'monthly',
    nextBillingDate: 'July 23, 2026',
    invoices: [
      { id: 'INV-2026-06', date: 'Jun 1, 2026', description: 'Pro Plan — June 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-05', date: 'May 1, 2026', description: 'Pro Plan — May 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-04', date: 'Apr 1, 2026', description: 'Pro Plan — April 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-03', date: 'Mar 1, 2026', description: 'Pro Plan — March 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-02', date: 'Feb 1, 2026', description: 'Pro Plan — February 2026', amount: '$49.00', status: 'Paid' },
      { id: 'INV-2026-01', date: 'Jan 1, 2026', description: 'Pro Plan — January 2026 + Add-on: Extra AI (500 q)', amount: '$64.00', status: 'Paid' },
    ],
  },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@ojashdesk.com', password: 'agent123', role: 'Agent', initials: 'PS', avatar: 'av-pink' },
  { id: 'u3', name: 'Rohan Mehta', email: 'rohan@ojashdesk.com', password: 'agent123', role: 'Agent', initials: 'RM', avatar: 'av-orange' },
  { id: 'u4', name: 'Ananya Kumar', email: 'ananya@ojashdesk.com', password: 'viewer123', role: 'Viewer', initials: 'AK', avatar: 'av-teal' },
];

const seedKBArticles = [
  { id: 'art1', title: 'How to reset your password', category: 'Account & Settings', content: 'If you\'ve forgotten your password, click "Forgot password?" on the login page and follow the emailed link to set a new one. Passwords must be at least 6 characters.', status: 'published', author: 'Ojash Singh', updated: 'Jun 20, 2026', views: 1240, helpful: 58, notHelpful: 3 },
  { id: 'art2', title: 'Setting up 2FA', category: 'Account & Settings', content: 'Two-factor authentication adds an extra layer of security to your account. Go to Settings → Security and follow the on-screen steps to link an authenticator app.', status: 'published', author: 'Ojash Singh', updated: 'Jun 18, 2026', views: 860, helpful: 41, notHelpful: 2 },
  { id: 'art3', title: 'API rate limits explained', category: 'API Reference', content: 'Each plan has a request-per-minute limit. Free plans allow 60 req/min, Pro allows 300 req/min, and Enterprise is custom. Exceeding the limit returns a 429 response.', status: 'published', author: 'Ojash Singh', updated: 'Jun 15, 2026', views: 2100, helpful: 97, notHelpful: 5 },
  { id: 'art4', title: 'Connecting Slack integration', category: 'Integrations', content: 'Navigate to Settings → Integrations → Slack and click Connect. You\'ll be asked to authorize the app in your Slack workspace, after which new tickets can post to a channel of your choice.', status: 'published', author: 'Ojash Singh', updated: 'Jun 10, 2026', views: 640, helpful: 30, notHelpful: 1 },
];

const seedChats = [
  { id: 1, name: 'Aarav Sharma', avatar: 'AS', color: 'av-blue', preview: "I'm unable to login to my account", time: '2m', unread: 2, online: true, email: 'aarav.sharma@gmail.com', loc: 'Mumbai, Maharashtra', tickets: 12, plan: 'VIP', assignee: 'me', msgs: [
    { out: false, text: "Hi! I need help with my account login.", time: '10:31 AM' },
    { out: true, text: "Hi Aarav! I'd be happy to help. Can you describe the issue?", time: '10:32 AM' },
    { out: false, text: "I'm unable to login. I tried resetting my password but didn't receive any email.", time: '10:33 AM' },
  ]},
  { id: 2, name: 'Sneha Kapoor', avatar: 'SK', color: 'av-pink', preview: "Payment failed but amount deducted", time: '15m', unread: 1, online: true, email: 'sneha.kapoor@techcorp.in', loc: 'Bengaluru, Karnataka', tickets: 3, plan: 'Pro', msgs: [
    { out: false, text: "Hello, my payment failed but the amount was deducted from my card.", time: '10:15 AM' },
    { out: true, text: "Hi Sneha! I'm sorry to hear that. Can you share the last 4 digits of your card?", time: '10:16 AM' },
  ]},
  { id: 3, name: 'Vikram Yadav', avatar: 'VY', color: 'av-orange', preview: "Refund not received after 7 days", time: '1h', unread: 0, online: false, email: 'vikram.y@startupwala.in', loc: 'Hyderabad, Telangana', tickets: 5, plan: 'Basic', assignee: 'me', msgs: [
    { out: false, text: "I requested a refund 7 days ago but haven't received it yet.", time: '9:00 AM' },
    { out: true, text: "Hi Vikram! I'm checking on this. Please give me a moment.", time: '9:02 AM' },
  ]},
  { id: 4, name: 'Ananya Nair', avatar: 'AN', color: 'av-green', preview: "Feature request: Dark mode", time: '3h', unread: 0, online: false, email: 'ananya.nair@designco.in', loc: 'Kochi, Kerala', tickets: 1, plan: 'Free', msgs: [
    { out: false, text: "Hi! Can you add dark mode to the mobile app?", time: '7:30 AM' },
    { out: true, text: "Thanks for the suggestion Ananya! I've logged this as a feature request.", time: '7:35 AM' },
  ]},
];

const seedCannedResponses = [
  { id: 'cr1', shortcode: '/greeting', title: 'Greeting', body: "Hi there! Welcome to Ojash Desk support. How can I help you today?", text: "Hi there! Welcome to Ojash Desk support. How can I help you today?", uses: 47 },
  { id: 'cr2', shortcode: '/refund', title: 'Refund Processed', body: "I've processed your refund. Please allow 5-7 business days for it to reflect in your account.", text: "I've processed your refund. Please allow 5-7 business days for it to reflect in your account.", uses: 23 },
  { id: 'cr3', shortcode: '/escalate', title: 'Escalation Notice', body: "I'm escalating this to our senior team for priority handling. You'll hear back shortly.", text: "I'm escalating this to our senior team for priority handling. You'll hear back shortly.", uses: 12 },
];

const seedTags = ['billing', 'login-issue', 'refund', 'feature-request', 'bug', 'account'];

const seedSlaPolicy = {
  urgent: { response: '1h response', resolution: '4h resolution' },
  high:   { response: '4h response', resolution: '8h resolution' },
  medium: { response: '8h response', resolution: '24h resolution' },
  low:    { response: '24h response', resolution: '72h resolution' },
  escalation: { notifyAdmin: true, autoEscalate: true, smsUrgent: false },
};

const seedApiKeys = [
  { id: 'key1', name: 'Production Key', key: 'od_live_xxxxxxxxxxxxxxxxxxxxxxab12', masked: 'od_live_••••••••••••••••ab12', created: 'Jun 1, 2026' },
  { id: 'key2', name: 'Development Key', key: 'od_test_xxxxxxxxxxxxxxxxxxxxxxcd34', masked: 'od_test_••••••••••••••••cd34', created: 'May 10, 2026' },
];

// ── Load persisted state, or fall back to seed data on first run ──
const persisted = storage.load();

let tickets   = (persisted && persisted.tickets)   || seedTickets;
let customers = (persisted && persisted.customers) || seedCustomers;
let users     = (persisted && persisted.users)     || seedUsers;
let kbArticles = (persisted && persisted.kbArticles) || seedKBArticles;
let chats      = (persisted && persisted.chats)      || seedChats;
let cannedResponses = (persisted && persisted.cannedResponses) || seedCannedResponses;
let tags = (persisted && persisted.tags) || seedTags;
let slaPolicy = (persisted && persisted.slaPolicy) || seedSlaPolicy;
let apiKeys = (persisted && persisted.apiKeys) || seedApiKeys;
let nextTicketNum = (persisted && persisted.nextTicketNum) || 1025;

if (!persisted) {
  console.log('data.js: no db.json found — starting from seed data.');
} else {
  console.log('data.js: loaded persisted data from db.json.');
}

// Migrate any plaintext passwords (seed data, or accounts created before
// hashing was added) to bcrypt hashes. Hashes always start with "$2" —
// anything else is treated as plaintext and re-hashed in place.
let migrated = false;
users.forEach(u => {
  if (u.password && !u.password.startsWith('$2')) {
    u.password = bcrypt.hashSync(u.password, 10);
    migrated = true;
  }
});
if (migrated) {
  console.log('data.js: migrated plaintext password(s) to bcrypt hashes.');
  storage.saveSync({ tickets, customers, users, kbArticles, chats, cannedResponses, tags, slaPolicy, apiKeys, nextTicketNum });
}

// Call this after any mutation (create/update/delete) to persist to disk
function persist() {
  storage.save({ tickets, customers, users, kbArticles, chats, cannedResponses, tags, slaPolicy, apiKeys, nextTicketNum });
}

function getNextTicketId() {
  const id = `TK-${nextTicketNum++}`;
  persist();
  return id;
}

module.exports = {
  tickets,
  customers,
  users,
  kbArticles,
  chats,
  cannedResponses,
  tags,
  slaPolicy,
  apiKeys,
  getNextTicketId,
  persist,
};