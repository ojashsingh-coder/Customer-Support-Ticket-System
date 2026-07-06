// storage.js - simple JSON file persistence
// Saves the whole app state (tickets, customers, users, ticket id counter)
// to db.json so data survives server restarts.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw.trim()) return JSON.parse(raw);
    }
  } catch (err) {
    console.error('storage.js: failed to read db.json, starting fresh.', err.message);
  }
  return null;
}

// Debounce writes slightly so a burst of requests doesn't hammer the disk
let saveTimer = null;

function save(state) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('storage.js: failed to write db.json.', err.message);
    }
  }, 150);
}

// Force an immediate synchronous save (used on process exit)
function saveSync(state) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('storage.js: failed to write db.json.', err.message);
  }
}

module.exports = { load, save, saveSync, DB_FILE };