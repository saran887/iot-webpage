const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  districts: { type: [String], required: true }
});

module.exports = mongoose.model('State', stateSchema); 