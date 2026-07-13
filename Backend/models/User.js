const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const UserSchema = new mongoose.Schema({
  id:                { type: String, required: true, unique: true },
  name:              String,
  email:             { type: String, required: true, unique: true },
  password:          String,
  role:              { type: String, default: 'Agent' },
  company:           { type: String, default: '' },
  initials:          String,
  avatar:            { type: String, default: 'av-purple' },
  subscriptionPlan:  { type: String, default: 'Free' },
  billingCycle:      { type: String, default: 'monthly' },
  nextBillingDate:   { type: String, default: null },
  invoices:          { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { strict: false });

cleanJSON(UserSchema);

module.exports = mongoose.model('User', UserSchema);