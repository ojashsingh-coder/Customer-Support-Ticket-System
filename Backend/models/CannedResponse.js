const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const CannedResponseSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  title:     String,
  shortcode: String,
  body:      String,
  text:      String,
  uses:      { type: Number, default: 0 },
}, { strict: false });

cleanJSON(CannedResponseSchema);

module.exports = mongoose.model('CannedResponse', CannedResponseSchema);