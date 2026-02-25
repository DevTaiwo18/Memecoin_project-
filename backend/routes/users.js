const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Called by frontend after Google sign-in to upsert the user in MongoDB
router.post('/sync', async (req, res) => {
  try {
    const { google_id, name, email, image } = req.body;

    if (!google_id || !email) {
      return res.status(400).json({ success: false, error: 'google_id and email are required' });
    }

    const existing = await User.findOne({ google_id });
    const user = await User.findOneAndUpdate(
      { google_id },
      { name, email, image, last_login: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: user, isNew: !existing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user by google_id
router.get('/:google_id', async (req, res) => {
  try {
    const user = await User.findOne({ google_id: req.params.google_id }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Connect Telegram — user sends their chat_id after starting the bot
router.post('/connect-telegram', async (req, res) => {
  try {
    const { google_id, telegram_chat_id } = req.body;
    if (!google_id || !telegram_chat_id) {
      return res.status(400).json({ success: false, error: 'google_id and telegram_chat_id are required' });
    }
    const user = await User.findOneAndUpdate(
      { google_id },
      { telegram_chat_id },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
