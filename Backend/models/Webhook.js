const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const WebhookSchema = new mongoose.Schema({
  id:     { type: String, required: true, unique: true },
  event:  String,
  url:    String,
  active: { type: Boolean, default: true },
});

cleanJSON(WebhookSchema);

module.exports = mongoose.model('Webhook', WebhookSchema);