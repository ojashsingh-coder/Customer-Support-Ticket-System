const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const ChatSchema = new mongoose.Schema({
  id:      { type: String, required: true, unique: true },
  preview: { type: String, default: '' },
  msgs:    { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { strict: false });

cleanJSON(ChatSchema);

module.exports = mongoose.model('Chat', ChatSchema);