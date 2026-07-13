const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const SettingsSchema = new mongoose.Schema({
  id:            { type: String, default: 'singleton', unique: true },
  slaPolicy:     { type: mongoose.Schema.Types.Mixed, default: {} },
  emailSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
  nextTicketNum: { type: Number, default: 1027 },
});

cleanJSON(SettingsSchema);

module.exports = mongoose.model('Settings', SettingsSchema);