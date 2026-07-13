const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const KbArticleSchema = new mongoose.Schema({
  id:         { type: String, required: true, unique: true },
  title:      String,
  content:    String,
  category:   { type: String, default: 'General' },
  status:     { type: String, default: 'draft' },
  author:     { type: String, default: 'Unknown' },
  updated:    String,
  views:      { type: Number, default: 0 },
  helpful:    { type: Number, default: 0 },
  notHelpful: { type: Number, default: 0 },
}, { strict: false });

cleanJSON(KbArticleSchema);

module.exports = mongoose.model('KbArticle', KbArticleSchema);