const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

cleanJSON(TagSchema);

module.exports = mongoose.model('Tag', TagSchema);