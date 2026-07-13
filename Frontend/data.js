//  Seed data: tickets, customers, agents, KB articles, etc.

// AGENTS
const AGENTS = [
  { id: 'a1', name: 'Ojash Singh',  initials: 'OS', role: 'Admin',  email: 'ojash@ojashdesk.com',   avatar: 'av-purple', status: 'online'  },
  { id: 'a2', name: 'Priya Sharma', initials: 'PS', role: 'Agent',  email: 'priya@ojashdesk.com',   avatar: 'av-blue',   status: 'online'  },
  { id: 'a3', name: 'Rohan Mehta',  initials: 'RM', role: 'Agent',  email: 'rohan@ojashdesk.com',   avatar: 'av-green',  status: 'away'    },
  { id: 'a4', name: 'Arjun Gupta',  initials: 'AG', role: 'Agent',  email: 'arjun@ojashdesk.com',   avatar: 'av-orange', status: 'offline' },
];

// CUSTOMERS
const CUSTOMERS_DATA = [
  { id: 'c1',  name: 'Aarav Joshi',       email: 'aarav.joshi@email.com',      company: 'Acme Corp',     plan: 'Pro',        location: 'Mumbai, Maharashtra',    phone: '+91 98201 23456', since: 'Jan 15, 2023', orders: 12, lifetime: '$1,245.00', avatar: 'av-blue',   initials: 'AJ', csat: 4.8, tickets: 5  },
  { id: 'c2',  name: 'Simran Kaur', email: 'simran.k@techcorp.com',     company: 'TechCorp',      plan: 'Enterprise', location: 'Bengaluru, Karnataka',        phone: '+91 98765 43210',   since: 'Mar 3, 2023',  orders: 8,  lifetime: '$3,420.00', avatar: 'av-pink',   initials: 'SK', csat: 4.5, tickets: 8  },
  { id: 'c3',  name: 'Rajesh Tiwari',email: 'rajesh.t@startup.io',      company: 'StartupIO',     plan: 'Pro',        location: 'Hyderabad, Telangana',        phone: '+91 87654 32109', since: 'Feb 20, 2023', orders: 3,  lifetime: '$780.00',   avatar: 'av-orange', initials: 'RT', csat: 3.9, tickets: 3  },
  { id: 'c4',  name: 'Anushka Bose',     email: 'anushka.b@design.co',     company: 'DesignCo',      plan: 'Free',       location: 'Pune, Maharashtra', phone: '+91 76543 21098', since: 'Apr 10, 2023', orders: 1,  lifetime: '$0.00',     avatar: 'av-green',  initials: 'AB', csat: 5.0, tickets: 1  },
  { id: 'c5',  name: 'Deepak Malhotra',    email: 'deepak.m@enterprise.com',   company: 'Enterprise Ltd',plan: 'Enterprise', location: 'Delhi, NCR',       phone: '+91 99001 23456', since: 'Dec 1, 2022',  orders: 22, lifetime: '$8,900.00', avatar: 'av-purple', initials: 'DM', csat: 4.2, tickets: 12 },
  { id: 'c6',  name: 'Anjali Iyer',     email: 'anjali.i@devhouse.com',       company: 'DevHouse',      plan: 'Pro',        location: 'Chennai, Tamil Nadu',         phone: '+91 88012 34567', since: 'Jun 5, 2023',  orders: 6,  lifetime: '$1,560.00', avatar: 'av-teal',   initials: 'AI', csat: 4.7, tickets: 4  },
  { id: 'c7',  name: 'Manish Kulkarni',     email: 'manish.k@solutions.net',     company: 'Solutions.net', plan: 'Pro',        location: 'Kolkata, West Bengal',       phone: '+91 77901 23456', since: 'Jul 19, 2023', orders: 9,  lifetime: '$2,100.00', avatar: 'av-red',    initials: 'MK', csat: 4.1, tickets: 6  },
  { id: 'c8',  name: 'Lavanya Reddy',    email: 'lavanya.r@mediagroup.com',    company: 'MediaGroup',    plan: 'Free',       location: 'Ahmedabad, Gujarat',        phone: '+91 66890 12345', since: 'Aug 8, 2023',  orders: 0,  lifetime: '$0.00',     avatar: 'av-yellow', initials: 'LR', csat: 0,   tickets: 2  },
  { id: 'c9',  name: 'Chirag Pandey',     email: 'chirag.p@cloudpro.io',      company: 'CloudPro',      plan: 'Enterprise', location: 'Jaipur, Rajasthan',   phone: '+91 93456 78901', since: 'Sep 14, 2023', orders: 18, lifetime: '$5,600.00', avatar: 'av-blue',   initials: 'CP', csat: 4.9, tickets: 9  },
  { id: 'c10', name: 'Neha Jain',     email: 'neha.j@innovate.co',       company: 'Innovate Co',   plan: 'Pro',        location: 'Lucknow, Uttar Pradesh',       phone: '+91 82345 67890', since: 'Oct 22, 2023', orders: 4,  lifetime: '$920.00',   avatar: 'av-pink',   initials: 'NJ', csat: 4.3, tickets: 3  },
];

// TICKETS
const TICKETS_DATA = [
  {
    id: 'TK-1024', subject: 'Unable to login to account', customer: 'Aarav Joshi', customerId: 'c1',
    email: 'aarav.joshi@email.com', status: 'open', priority: 'High', category: 'Account',
    assignee: 'Ojash Singh', assigneeId: 'a1', sla: '2h left', updated: '2m ago',
    created: '2026-06-24T09:00:00', channel: 'web',
    tags: ['Login Issue', 'Account'],
    messages: [
      { from: 'customer', name: 'Aarav Joshi',    initials: 'AJ', avatar: 'av-blue',   time: '2m ago',        text: "I'm unable to login to my account. I tried resetting my password but didn't receive any email." },
      { from: 'agent',    name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '1m ago (Edited)', text: "Hi Aarav,\n\nI'm sorry you're facing this issue. Let me help you with that.\nCould you please confirm the email associated with your account?" },
      { from: 'customer', name: 'Aarav Joshi',    initials: 'AJ', avatar: 'av-blue',   time: 'Just now',      text: "Yes, it's aarav.joshi@email.com" },
    ],
    activity: [
      { text: 'Password reset requested', time: '2m ago' },
      { text: 'Email change (Pending)',    time: '3d ago' },
      { text: 'Login attempt failed',      time: '3d ago' },
    ],
    internalNotes: [
      { name: 'Priya Sharma', initials: 'PS', avatar: 'av-blue', time: '5m ago', text: 'Checked the email server — delivery seems to be delayed. Will escalate if no resolution in 1hr.' }
    ],
    aiSuggestion: 'This customer is unable to login. Password reset email not received. This seems to be an email delivery issue.',
    aiActions: ['Verify email address', 'Resend password reset email', 'Check spam or promotions folder'],
  },
  {
    id: 'TK-1023', subject: 'Payment failed but amount deducted', customer: 'Simran Kaur', customerId: 'c2',
    email: 'simran.k@techcorp.com', status: 'open', priority: 'Medium', category: 'Billing',
    assignee: 'Priya Sharma', assigneeId: 'a2', sla: '5h left', updated: '15m ago',
    created: '2026-06-24T08:45:00', channel: 'email',
    tags: ['Billing', 'Payment'],
    messages: [
      { from: 'customer', name: 'Simran Kaur', initials: 'SK', avatar: 'av-pink', time: '15m ago', text: 'My payment failed but I can see the amount has been deducted from my bank account. Please help urgently!' },
      { from: 'agent',    name: 'Priya Sharma',   initials: 'PS', avatar: 'av-blue', time: '10m ago', text: 'Hi Simran, I completely understand your concern. Let me check this with our billing team right away. Could you please share the transaction ID from your bank statement?' },
    ],
    activity: [{ text: 'Ticket escalated to billing team', time: '10m ago' }],
    internalNotes: [],
    aiSuggestion: 'Payment deducted but order failed. Likely a gateway timeout. Check the payment gateway dashboard for the transaction.',
    aiActions: ['Check payment gateway logs', 'Initiate refund if duplicate charge', 'Contact bank if needed'],
  },
  {
    id: 'TK-1022', subject: 'Refund not received after 7 days', customer: 'Rajesh Tiwari', customerId: 'c3',
    email: 'rajesh.t@startup.io', status: 'pending', priority: 'Medium', category: 'Billing',
    assignee: 'Rohan Mehta', assigneeId: 'a3', sla: 'Breached', updated: '1h ago',
    created: '2026-06-23T10:00:00', channel: 'web',
    tags: ['Refund', 'Billing'],
    messages: [
      { from: 'customer', name: 'Rajesh Tiwari', initials: 'RT', avatar: 'av-orange', time: '1h ago', text: "I requested a refund 7 days ago but haven't received it yet. Order #ORD-8821." },
    ],
    activity: [{ text: 'SLA breached — escalating', time: '30m ago' }],
    internalNotes: [],
    aiSuggestion: 'Refund delay beyond 7 days. Check payment processor for refund status. May require manual processing.',
    aiActions: ['Check refund status in payment gateway', 'Contact finance team', 'Issue manual refund if stuck'],
  },
  {
    id: 'TK-1021', subject: 'Feature request: Dark mode', customer: 'Anushka Bose', customerId: 'c4',
    email: 'anushka.b@design.co', status: 'open', priority: 'Low', category: 'Feature Request',
    assignee: 'Ojash Singh', assigneeId: 'a1', sla: '48h left', updated: '3h ago',
    created: '2026-06-24T06:00:00', channel: 'web',
    tags: ['Feature Request', 'UI'],
    messages: [
      { from: 'customer', name: 'Anushka Bose', initials: 'AB', avatar: 'av-green', time: '3h ago', text: 'Would love to see a dark mode option in the app! My eyes would thank you. 😊' },
      { from: 'agent',    name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '2h ago', text: "Hi Anushka! Great suggestion — dark mode is actually on our roadmap for Q3. I've added your vote to the feature request. Thanks for the feedback!" },
    ],
    activity: [{ text: 'Added to feature request tracker', time: '2h ago' }],
    internalNotes: [],
    aiSuggestion: 'Feature request for dark mode. Already on roadmap. Link customer to public roadmap page.',
    aiActions: ['Share roadmap link', 'Mark as tracked', 'Set follow-up reminder'],
  },
  {
    id: 'TK-1020', subject: 'How to update billing information?', customer: 'Deepak Malhotra', customerId: 'c5',
    email: 'deepak.m@enterprise.com', status: 'open', priority: 'Medium', category: 'Billing',
    assignee: 'Priya Sharma', assigneeId: 'a2', sla: '6h left', updated: '5h ago',
    created: '2026-06-24T04:00:00', channel: 'email',
    tags: ['Billing', 'Account'],
    messages: [
      { from: 'customer', name: 'Deepak Malhotra', initials: 'DM', avatar: 'av-purple', time: '5h ago', text: "I need to update my credit card on file. Can't figure out where to do it in the settings." },
    ],
    activity: [],
    internalNotes: [],
    aiSuggestion: 'Customer needs to update billing info. Direct them to Settings > Billing > Payment Methods.',
    aiActions: ['Share billing settings guide', 'Offer to update via secure link'],
  },
  {
    id: 'TK-1019', subject: 'API rate limit issue', customer: 'Anjali Iyer', customerId: 'c6',
    email: 'anjali.i@devhouse.com', status: 'resolved', priority: 'High', category: 'Technical Issue',
    assignee: 'Rohan Mehta', assigneeId: 'a3', sla: 'Met', updated: '1d ago',
    created: '2026-06-23T09:00:00', channel: 'web',
    tags: ['API', 'Technical'],
    messages: [
      { from: 'customer', name: 'Anjali Iyer', initials: 'AI', avatar: 'av-teal', time: '1d ago', text: 'Getting 429 Too Many Requests errors on the /api/v2/tickets endpoint.' },
      { from: 'agent',    name: 'Rohan Mehta', initials: 'RM', avatar: 'av-green', time: '1d ago', text: 'Hi Anjali! Your account was hitting the 100 req/min limit. I have increased it to 500 req/min for your Enterprise plan. The change is live now.' },
      { from: 'customer', name: 'Anjali Iyer', initials: 'AI', avatar: 'av-teal', time: '23h ago', text: 'Perfect, working now! Thank you so much.' },
    ],
    activity: [{ text: 'Rate limit increased', time: '1d ago' }, { text: 'Ticket resolved', time: '23h ago' }],
    internalNotes: [],
    aiSuggestion: 'Issue resolved. Customer confirmed fix.',
    aiActions: [],
  },
  {
    id: 'TK-1018', subject: "Can't export reports", customer: 'Manish Kulkarni', customerId: 'c7',
    email: 'manish.k@solutions.net', status: 'resolved', priority: 'Medium', category: 'Technical Issue',
    assignee: 'Ojash Singh', assigneeId: 'a1', sla: 'Met', updated: '1d ago',
    created: '2026-06-23T07:00:00', channel: 'chat',
    tags: ['Reports', 'Export'],
    messages: [
      { from: 'customer', name: 'Manish Kulkarni', initials: 'MK', avatar: 'av-red', time: '1d ago', text: 'The export to CSV button does nothing when I click it.' },
      { from: 'agent',    name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '1d ago', text: "Hi Manish! This was a known bug with Chrome 124. We pushed a fix — please clear your cache with Ctrl+Shift+R and try again." },
    ],
    activity: [{ text: 'Bug fix deployed', time: '1d ago' }, { text: 'Ticket resolved', time: '22h ago' }],
    internalNotes: [],
    aiSuggestion: 'Export bug — fixed in latest release. Ask customer to clear cache.',
    aiActions: ['Share cache-clearing guide'],
  },
  {
    id: 'TK-1017', subject: 'Need to add team members', customer: 'Lavanya Reddy', customerId: 'c8',
    email: 'lavanya.r@mediagroup.com', status: 'closed', priority: 'Low', category: 'Account',
    assignee: 'Priya Sharma', assigneeId: 'a2', sla: 'Met', updated: '2d ago',
    created: '2026-06-22T10:00:00', channel: 'email',
    tags: ['Account', 'Team'],
    messages: [
      { from: 'customer', name: 'Lavanya Reddy', initials: 'LR', avatar: 'av-yellow', time: '2d ago', text: 'How do I invite team members to my account? I checked Settings but cannot find it.' },
      { from: 'agent',    name: 'Priya Sharma', initials: 'PS', avatar: 'av-blue', time: '2d ago', text: "Hi Lavanya! Go to Settings > Agents > Invite Agent. You can add up to 5 agents on the Free plan." },
    ],
    activity: [{ text: 'Ticket closed', time: '2d ago' }],
    internalNotes: [],
    aiSuggestion: 'Team invite question. Point to Settings > Agents.',
    aiActions: ['Share agents settings guide'],
  },
  {
    id: 'TK-1016', subject: 'SAML SSO configuration help', customer: 'Chirag Pandey', customerId: 'c9',
    email: 'chirag.p@cloudpro.io', status: 'pending', priority: 'Urgent', category: 'Technical Issue',
    assignee: 'Ojash Singh', assigneeId: 'a1', sla: '1h left', updated: '3h ago',
    created: '2026-06-24T07:00:00', channel: 'email',
    tags: ['SSO', 'Enterprise', 'Security'],
    messages: [
      { from: 'customer', name: 'Chirag Pandey', initials: 'CP', avatar: 'av-blue', time: '3h ago', text: 'We are trying to configure SAML SSO with our Okta instance and getting an ACS URL mismatch error.' },
    ],
    activity: [],
    internalNotes: [
      { name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '2h ago', text: 'Enterprise account — priority escalation. Looping in the security team.' }
    ],
    aiSuggestion: 'SAML SSO ACS URL mismatch. Check that the ACS URL in Okta matches the one in our SSO settings exactly.',
    aiActions: ['Share SSO configuration guide', 'Request Okta metadata XML', 'Escalate to security team'],
  },
  {
    id: 'TK-1015', subject: 'Invoice download not working', customer: 'Neha Jain', customerId: 'c10',
    email: 'neha.j@innovate.co', status: 'open', priority: 'Medium', category: 'Billing',
    assignee: 'Rohan Mehta', assigneeId: 'a3', sla: '8h left', updated: '6h ago',
    created: '2026-06-24T03:00:00', channel: 'web',
    tags: ['Billing', 'Invoice'],
    messages: [
      { from: 'customer', name: 'Neha Jain', initials: 'NJ', avatar: 'av-pink', time: '6h ago', text: 'I cannot download my invoice from May 2026. The download button shows a 404 error.' },
    ],
    activity: [],
    internalNotes: [],
    aiSuggestion: 'Invoice 404 error — likely a broken storage link. Regenerate the invoice PDF and re-upload.',
    aiActions: ['Regenerate invoice', 'Send via email directly'],
  },
];

// KNOWLEDGE BASE ARTICLES
const KB_ARTICLES = [
  { id: 'kb1', title: 'How to reset your password', category: 'Account', views: 2840, helpful: 142, notHelpful: 8,  status: 'published', author: 'Ojash Singh', updated: '2d ago', content: 'To reset your password, click "Forgot Password" on the login page. Enter your email address and check your inbox for a reset link. The link expires in 24 hours.' },
  { id: 'kb2', title: 'Setting up two-factor authentication', category: 'Security', views: 1920, helpful: 98,  notHelpful: 3,  status: 'published', author: 'Priya Sharma', updated: '5d ago', content: 'Navigate to Settings > Security > Two-Factor Authentication. Scan the QR code with your authenticator app (Google Authenticator or Authy). Enter the 6-digit code to confirm.' },
  { id: 'kb3', title: 'How to invite team members', category: 'Account', views: 1540, helpful: 76,  notHelpful: 5,  status: 'published', author: 'Ojash Singh', updated: '1w ago', content: 'Go to Settings > Agents > Invite Agent. Enter the team member\'s email and select their role. They will receive an invitation email valid for 48 hours.' },
  { id: 'kb4', title: 'Understanding your invoice', category: 'Billing', views: 1230, helpful: 61,  notHelpful: 12, status: 'published', author: 'Rohan Mehta', updated: '3d ago', content: 'Your invoice includes a line item for each service, applicable taxes, and the total due. Invoices are generated on the 1st of each month and available in Settings > Billing > Invoices.' },
  { id: 'kb5', title: 'API rate limits explained', category: 'API',      views: 980,  helpful: 54,  notHelpful: 2,  status: 'published', author: 'Ojash Singh', updated: '4d ago', content: 'Free plan: 60 req/min. Pro plan: 300 req/min. Enterprise plan: 1000 req/min. Rate limit headers are included in every API response. Contact support to request a higher limit.' },
  { id: 'kb6', title: 'SAML SSO configuration guide', category: 'Security', views: 720, helpful: 38, notHelpful: 4, status: 'published', author: 'Ojash Singh', updated: '1w ago', content: 'To configure SAML SSO, navigate to Settings > Security > SSO. Copy the ACS URL and Entity ID. In your identity provider (Okta, Azure AD, etc.), create a new SAML application using these values.' },
  { id: 'kb7', title: 'How to export reports', category: 'Analytics',  views: 650,  helpful: 32,  notHelpful: 7,  status: 'published', author: 'Priya Sharma', updated: '6d ago', content: 'On any Analytics page, click the Export button in the top right. Choose CSV or PDF format. For large reports, the file will be emailed to you within a few minutes.' },
  { id: 'kb8', title: 'Getting started with Live Chat', category: 'Live Chat', views: 1100, helpful: 88, notHelpful: 6, status: 'published', author: 'Rohan Mehta', updated: '2d ago', content: 'Install the Ojash Desk chat widget by adding a single script tag to your website. Configure the widget\'s appearance in Settings > Live Chat. Agents can manage chats from the Live Chat page.' },
  { id: 'kb9', title: 'How to set up SLA policies', category: 'General', views: 430, helpful: 22, notHelpful: 1, status: 'draft', author: 'Ojash Singh', updated: '1d ago', content: 'SLA policies define response and resolution time targets for tickets based on priority. Configure them in Settings > SLA. Tickets that breach SLA are automatically escalated.' },
  { id: 'kb10', title: 'Updating your payment method', category: 'Billing', views: 890, helpful: 45, notHelpful: 9, status: 'published', author: 'Priya Sharma', updated: '3d ago', content: 'Go to Settings > Billing > Payment Methods. Click "Update Card". Enter your new card details. Your next invoice will be charged to the new card.' },
  { id: 'kb11', title: 'Connecting Slack integration', category: 'Integrations', views: 621, helpful: 41, notHelpful: 3, status: 'published', author: 'Rohan Mehta', updated: '2d ago', content: 'Go to Settings > Integrations > Slack and click "Connect". Authorize Ojash Desk in the Slack OAuth screen and choose a channel to post new-ticket and SLA-breach alerts to. You can change the channel or disconnect at any time from the same page.' },
];

// CANNED RESPONSES
const CANNED_RESPONSES = [
  { id: 'cr1', title: 'Greeting',               shortcode: '/hi',      text: "Hi {{customer_name}},\n\nThank you for reaching out to Ojash Desk support. My name is {{agent_name}} and I'll be happy to assist you today.\n\nCould you please provide more details about your issue?" },
  { id: 'cr2', title: 'Password Reset',         shortcode: '/pwreset', text: "Hi {{customer_name}},\n\nTo reset your password:\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your inbox for a reset link (also check spam)\n\nThe link expires in 24 hours. Let me know if you need further help!" },
  { id: 'cr3', title: 'Billing Escalation',     shortcode: '/billing', text: "Hi {{customer_name}},\n\nI've escalated your billing query to our finance team. You'll receive an update within 1 business day.\n\nYour reference number is {{ticket_id}}. Please keep this handy." },
  { id: 'cr4', title: 'Closing — Resolved',     shortcode: '/close',   text: "Hi {{customer_name}},\n\nGreat news — I'm glad we were able to resolve this for you! I'll go ahead and close this ticket.\n\nIf you ever need help again, don't hesitate to reach out. Have a wonderful day! 😊\n\n— {{agent_name}}, Ojash Desk Support" },
  { id: 'cr5', title: 'Waiting for Customer',   shortcode: '/waiting', text: "Hi {{customer_name}},\n\nWe're still waiting for the information requested in our previous message. Could you please provide those details so we can continue resolving your issue?\n\nIf we don't hear back within 48 hours, we'll close this ticket automatically." },
  { id: 'cr6', title: 'Refund Acknowledgement', shortcode: '/refund',  text: "Hi {{customer_name}},\n\nI can confirm your refund has been initiated. Please allow 5–7 business days for it to reflect in your account, depending on your bank.\n\nSorry for the inconvenience and thank you for your patience." },
  { id: 'cr7', title: 'Feature Noted',          shortcode: '/feature', text: "Hi {{customer_name}},\n\nThank you for this great suggestion! I've logged it in our product feedback tracker and shared it with the team.\n\nWhile I can't promise a specific timeline, we do review all feature requests. You'll be notified if this makes it into a future release." },
  { id: 'cr8', title: 'Technical Escalation',   shortcode: '/tech',    text: "Hi {{customer_name}},\n\nThis issue requires investigation by our technical team. I've escalated it with high priority. You can expect an update within 4 business hours.\n\nTicket ID: {{ticket_id}}" },
];

// CHAT SESSIONS (Live Chat)
const CHAT_SESSIONS = [
  { id: 'ch1', customer: 'Aarav Joshi',       initials: 'AJ', avatar: 'av-blue',   email: 'aarav.joshi@email.com',    location: 'Mumbai, Maharashtra', status: 'active',  lastMsg: "Yes, it's aarav.joshi@email.com",          time: 'Just now', unread: 1, totalTickets: 5 },
  { id: 'ch2', customer: 'Priya K.',       initials: 'PK', avatar: 'av-pink',   email: 'priya.k@sample.com',    location: 'Mumbai, India',  status: 'active',  lastMsg: 'I need help with my subscription',       time: '2m',       unread: 2, totalTickets: 2 },
  { id: 'ch3', customer: 'Tarun Saxena',     initials: 'TS', avatar: 'av-green',  email: 'tarun.s@saxena.io',       location: 'Surat, Gujarat',     status: 'waiting', lastMsg: 'How do I export data?',                  time: '5m',       unread: 0, totalTickets: 1 },
  { id: 'ch4', customer: 'Esha Mishra',     initials: 'EM', avatar: 'av-orange', email: 'esha.m@mishra.com',      location: 'Kochi, Kerala',  status: 'active',  lastMsg: 'Thanks! That worked perfectly.',         time: '8m',       unread: 0, totalTickets: 3 },
  { id: 'ch5', customer: 'Alok Tripathi',    initials: 'AT', avatar: 'av-teal',   email: 'alok.t@tripathi.co',      location: 'Chandigarh, Punjab',      status: 'idle',    lastMsg: 'Still waiting for a response...',        time: '15m',      unread: 0, totalTickets: 0 },
  { id: 'ch6', customer: 'Zara Siddiqui',     initials: 'ZS', avatar: 'av-purple', email: 'zara.s@siddiqui.net',      location: 'Indore, Madhya Pradesh',     status: 'closed',  lastMsg: 'Issue resolved. Thank you so much!',    time: '1h',       unread: 0, totalTickets: 4 },
];

// CHAT MESSAGES (Live Chat)
const CHAT_MESSAGES_DATA = {
  ch1: [
    { from: 'customer', name: 'Aarav Joshi',    initials: 'AJ', avatar: 'av-blue',   time: '09:12', text: "Hi, I'm unable to login to my account. I tried resetting my password but didn't receive any email." },
    { from: 'agent',    name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '09:13', text: "Hi Aarav! I'm sorry to hear that. Let me check your account right away. Could you confirm the email address you're using?" },
    { from: 'customer', name: 'Aarav Joshi',    initials: 'AJ', avatar: 'av-blue',   time: '09:14', text: "Yes, it's aarav.joshi@email.com" },
  ],
  ch2: [
    { from: 'customer', name: 'Priya K.', initials: 'PK', avatar: 'av-pink', time: '09:10', text: 'Hello! I need help with my subscription plan.' },
    { from: 'customer', name: 'Priya K.', initials: 'PK', avatar: 'av-pink', time: '09:11', text: 'I was charged twice this month.' },
  ],
  ch3: [
    { from: 'customer', name: 'Tarun Saxena', initials: 'TS', avatar: 'av-green', time: '09:07', text: 'How do I export my data from the analytics page?' },
  ],
  ch4: [
    { from: 'customer', name: 'Esha Mishra', initials: 'EM', avatar: 'av-orange', time: '09:00', text: 'The issue with the API rate limit is fixed now!' },
    { from: 'agent',    name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '09:01', text: "That's great to hear, Esha! Happy to help. 😊" },
    { from: 'customer', name: 'Esha Mishra', initials: 'EM', avatar: 'av-orange', time: '09:04', text: 'Thanks! That worked perfectly.' },
  ],
  ch5: [
    { from: 'customer', name: 'Alok Tripathi', initials: 'AT', avatar: 'av-teal', time: '08:50', text: 'Is anyone there? Still waiting for a response...' },
  ],
  ch6: [
    { from: 'customer', name: 'Zara Siddiqui', initials: 'ZS', avatar: 'av-purple', time: '08:30', text: 'Issue resolved. Thank you so much!' },
    { from: 'agent',    name: 'Priya Sharma', initials: 'PS', avatar: 'av-blue', time: '08:31', text: "You're welcome, Zara! Have a great day! 🎉" },
  ],
};

// ANALYTICS DATA
const ANALYTICS_DATA = {
  overview: {
    totalTickets: 1284,
    openTickets: 42,
    resolvedToday: 18,
    avgResolutionTime: '3.2h',
    csatScore: 4.7,
    slaBreached: 3,
    firstResponseAvg: '12m',
    agentUtilization: '78%',
  },
  volumeByDay: [
    { day: 'Mon', tickets: 42 },
    { day: 'Tue', tickets: 58 },
    { day: 'Wed', tickets: 35 },
    { day: 'Thu', tickets: 71 },
    { day: 'Fri', tickets: 63 },
    { day: 'Sat', tickets: 28 },
    { day: 'Sun', tickets: 19 },
  ],
  byChannel: [
    { channel: 'Web Form', count: 580, pct: 45 },
    { channel: 'Email',    count: 385, pct: 30 },
    { channel: 'Live Chat',count: 257, pct: 20 },
    { channel: 'API',      count: 62,  pct: 5  },
  ],
  agentPerformance: [
    { name: 'Ojash Singh',  initials: 'OS', avatar: 'av-purple', resolved: 48, avgTime: '2.8h', csat: 4.9, open: 5  },
    { name: 'Priya Sharma', initials: 'PS', avatar: 'av-blue',   resolved: 41, avgTime: '3.1h', csat: 4.7, open: 8  },
    { name: 'Rohan Mehta',  initials: 'RM', avatar: 'av-green',  resolved: 35, avgTime: '3.8h', csat: 4.3, open: 6  },
    { name: 'Arjun Gupta',  initials: 'AG', avatar: 'av-orange', resolved: 29, avgTime: '4.2h', csat: 4.1, open: 11 },
  ],
};

// BILLING DATA
const BILLING_DATA = {
  currentPlan: 'Pro',
  nextBillDate: 'July 1, 2026',
  amount: '$49.00',
  seats: 4,
  ticketsThisMonth: 284,
  invoices: [
    { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: '$49.00', status: 'Paid',    period: 'Jun 2026' },
    { id: 'INV-2026-05', date: 'May 1, 2026', amount: '$49.00', status: 'Paid',    period: 'May 2026' },
    { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: '$49.00', status: 'Paid',    period: 'Apr 2026' },
    { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: '$49.00', status: 'Paid',    period: 'Mar 2026' },
    { id: 'INV-2026-02', date: 'Feb 1, 2026', amount: '$49.00', status: 'Paid',    period: 'Feb 2026' },
    { id: 'INV-2026-01', date: 'Jan 1, 2026', amount: '$49.00', status: 'Paid',    period: 'Jan 2026' },
  ],
};

// NOTIFICATIONS
const NOTIFICATIONS_DATA = [
  { id: 'n1', text: 'New ticket #TK-1025 assigned to you',     time: '2m ago',  read: false },
  { id: 'n2', text: 'SLA breach warning on #TK-1022',          time: '10m ago', read: false },
  { id: 'n3', text: 'Simran Kaur replied to #TK-1023',      time: '15m ago', read: false },
  { id: 'n4', text: 'Chirag Pandey opened a new urgent ticket',   time: '1h ago',  read: true  },
  { id: 'n5', text: '#TK-1019 resolved by Rohan Mehta',        time: '3h ago',  read: true  },
];

// SLA POLICIES
const SLA_POLICIES = [
  { priority: 'Urgent', firstResponse: '30m',  resolution: '4h'  },
  { priority: 'High',   firstResponse: '2h',   resolution: '8h'  },
  { priority: 'Medium', firstResponse: '8h',   resolution: '24h' },
  { priority: 'Low',    firstResponse: '24h',  resolution: '72h' },
];

// PORTAL TICKETS (Customer-facing)
const PORTAL_TICKETS = [
  { id: 'TK-1024', subject: 'Unable to login to account', status: 'open',    priority: 'High',   category: 'Account',          updated: '2m ago',  messages: [
    { from: 'customer', name: 'Aarav Joshi', initials: 'AJ', avatar: 'av-blue', time: '2m ago', text: "I'm unable to login. Password reset email not received." },
    { from: 'agent', name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '1m ago', text: "Hi! I'm looking into this now. Could you confirm your registered email?" },
  ]},
  { id: 'TK-1021', subject: 'Feature request: Dark mode', status: 'open',    priority: 'Low',    category: 'Feature Request',  updated: '3h ago',  messages: [
    { from: 'customer', name: 'Aarav Joshi', initials: 'AJ', avatar: 'av-blue', time: '3h ago', text: 'Would love a dark mode option!' },
    { from: 'agent', name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '2h ago', text: "Great idea! Dark mode is on our Q3 roadmap. I've logged your vote." },
  ]},
  { id: 'TK-1018', subject: "Can't export reports", status: 'resolved', priority: 'Medium', category: 'Technical Issue', updated: '1d ago', messages: [
    { from: 'customer', name: 'Aarav Joshi', initials: 'AJ', avatar: 'av-blue', time: '1d ago', text: 'Export button not working.' },
    { from: 'agent', name: 'Ojash Singh', initials: 'OS', avatar: 'av-purple', time: '1d ago', text: "This was a bug with Chrome 124. Fixed! Please clear your cache." },
  ]},
  { id: 'TK-1015', subject: 'Invoice download not working', status: 'pending', priority: 'Medium', category: 'Billing', updated: '6h ago', messages: [
    { from: 'customer', name: 'Aarav Joshi', initials: 'AJ', avatar: 'av-blue', time: '6h ago', text: 'Cannot download May 2026 invoice. Getting 404.' },
  ]},
];

// EXPORT (make available globally)
window.OD = window.OD || {};
Object.assign(window.OD, {
  AGENTS,
  CUSTOMERS_DATA,
  TICKETS_DATA,
  KB_ARTICLES,
  CANNED_RESPONSES,
  CHAT_SESSIONS,
  CHAT_MESSAGES_DATA,
  ANALYTICS_DATA,
  BILLING_DATA,
  NOTIFICATIONS_DATA,
  SLA_POLICIES,
  PORTAL_TICKETS,
});