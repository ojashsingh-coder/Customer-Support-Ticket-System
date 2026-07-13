require('dotenv').config();
const fs = require('fs');
const path = require('path');
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

const DB_JSON_PATH = path.join(__dirname, 'db.json');

async function seed() {
  await connectDB();

  if (!fs.existsSync(DB_JSON_PATH)) {
    console.error(`No db.json found at ${DB_JSON_PATH}. Copy your old db.json into this folder first.`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(DB_JSON_PATH, 'utf-8'));

  if (Array.isArray(raw.tickets) && raw.tickets.length) {
    await Ticket.deleteMany({});
    await Ticket.insertMany(raw.tickets);
    console.log(`Seeded ${raw.tickets.length} tickets`);
  }

  if (Array.isArray(raw.customers) && raw.customers.length) {
    await Customer.deleteMany({});
    await Customer.insertMany(raw.customers);
    console.log(`Seeded ${raw.customers.length} customers`);
  }

  if (Array.isArray(raw.users) && raw.users.length) {
    await User.deleteMany({});
    await User.insertMany(raw.users);
    console.log(`Seeded ${raw.users.length} users`);
  }

  if (Array.isArray(raw.kbArticles) && raw.kbArticles.length) {
    await KbArticle.deleteMany({});
    await KbArticle.insertMany(raw.kbArticles);
    console.log(`Seeded ${raw.kbArticles.length} KB articles`);
  }

  if (Array.isArray(raw.cannedResponses) && raw.cannedResponses.length) {
    await CannedResponse.deleteMany({});
    await CannedResponse.insertMany(raw.cannedResponses);
  }
  if (Array.isArray(raw.chats) && raw.chats.length) {
    await Chat.deleteMany({});
    await Chat.insertMany(raw.chats);
  }
  if (Array.isArray(raw.tags) && raw.tags.length) {
    await Tag.deleteMany({});
    await Tag.insertMany(raw.tags.map(name => ({ name })));
  }
  if (Array.isArray(raw.apiKeys) && raw.apiKeys.length) {
    await ApiKey.deleteMany({});
    await ApiKey.insertMany(raw.apiKeys);
  }
  if (Array.isArray(raw.webhooks) && raw.webhooks.length) {
    await Webhook.deleteMany({});
    await Webhook.insertMany(raw.webhooks);
  }

  const defaultSlaPolicy = {
    urgent: { response: '30m', resolution: '4h' },
    high:   { response: '2h',  resolution: '8h' },
    medium: { response: '8h',  resolution: '24h' },
    low:    { response: '24h', resolution: '72h' },
  };
  await Settings.findOneAndUpdate(
    { id: 'singleton' },
    {
      id: 'singleton',
      slaPolicy: raw.slaPolicy || defaultSlaPolicy,
      emailSettings: raw.emailSettings || {},
      nextTicketNum: raw.nextTicketNum || 1027,
    },
    { upsert: true }
  );
  console.log('Seeded settings (SLA policy, email settings, next ticket number)');

  console.log('Migration complete');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});