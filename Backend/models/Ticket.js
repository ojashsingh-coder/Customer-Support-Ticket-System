const mongoose = require('mongoose');
const cleanJSON = require('./cleanJSON');

const TicketSchema = new mongoose.Schema({
  id:            { type: String, required: true, unique: true },
  subject:       String,
  customer:      String,
  customerId:    String,
  email:         String,
  status:        { type: String, default: 'open' },
  priority:      { type: String, default: 'Medium' },
  category:      String,
  assignee:      { type: String, default: 'Unassigned' },
  assigneeId:    String,
  sla:           { type: String, default: '—' },
  updated:       { type: String, default: 'just now' },
  avatar:        { type: String, default: 'av-blue' },
  channel:       { type: String, default: 'web' },
  tags:          { type: [String], default: [] },
  messages:      { type: [mongoose.Schema.Types.Mixed], default: [] },
  aiSuggestion:  { type: String, default: '' },
  aiActions:     { type: [String], default: [] },
  activity:      { type: [mongoose.Schema.Types.Mixed], default: [] },
  internalNotes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  created:       { type: String, default: () => new Date().toISOString() },
  resolvedAt:    { type: String, default: null },
}, { strict: false });

cleanJSON(TicketSchema);

module.exports = mongoose.model('Ticket', TicketSchema);