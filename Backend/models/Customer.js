const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const CustomerSchema = new mongoose.Schema({
  id:        { type: String, required: true, unique: true },
  name:      String,
  email:     String,
  company:   { type: String, default: '' },
  plan:      { type: String, default: 'Free' },
  phone:     { type: String, default: '' },
  location:  { type: String, default: '' },
  since:     String,
  tickets:   { type: Number, default: 0 },
  lifetime:  { type: String, default: '$0.00' },
  csat:      { type: Number, default: 0 },
  orders:    { type: Number, default: 0 },
  initials:  String,
  avatar:    { type: String, default: 'av-blue' },
}, { strict: false });

cleanJSON(CustomerSchema);

module.exports = mongoose.model('Customer', CustomerSchema);