const express = require('express');
const router = express.Router();
const State = require('../models/State');

// Get all states
router.get('/states', async (req, res) => {
  try {
    const states = await State.find({}, 'state').sort('state');
    res.json(states.map(s => s.state));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get districts for a state
router.get('/districts', async (req, res) => {
  try {
    const { state } = req.query;
    if (!state) return res.status(400).json({ message: 'State is required' });
    const stateDoc = await State.findOne({ state });
    if (!stateDoc) return res.status(404).json({ message: 'State not found' });
    res.json(stateDoc.districts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 