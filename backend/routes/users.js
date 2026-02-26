const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendMessage } = require('../telegram');

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

    sendMessage(telegram_chat_id,
      `✅ *Telegram connected!*\n\nYou're all set. You'll now receive instant *Buy Now* alerts here whenever a Solana memecoin is pumping.\n\n🚀 PumpRadar is watching the market for you.`
    ).catch(() => {});

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add or update a holding
router.post('/holdings', async (req, res) => {
  try {
    const { google_id, coin_id, amount_invested, buy_price } = req.body;
    if (!google_id || !coin_id || !amount_invested || !buy_price) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const user = await User.findOne({ google_id });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const existing = user.holdings.find(h => h.coin_id === coin_id && !h.is_sold);
    if (existing) {
      existing.amount_invested = amount_invested;
      existing.buy_price = buy_price;
      existing.sell_alerted = false;
    } else {
      user.holdings.push({ coin_id, amount_invested, buy_price });
    }
    await user.save();
    res.json({ success: true, data: user.holdings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark a holding as sold (keeps it in history)
router.delete('/holdings/:google_id/:coin_id', async (req, res) => {
  try {
    const { google_id, coin_id } = req.params;
    const { sell_price } = req.body;
    const user = await User.findOne({ google_id });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const holding = user.holdings.find(h => h.coin_id === coin_id && !h.is_sold);
    if (!holding) return res.status(404).json({ success: false, error: 'Holding not found' });

    holding.is_sold = true;
    holding.sell_price = sell_price || null;
    holding.sold_at = new Date();
    user.markModified('holdings');
    await user.save();
    res.json({ success: true, data: user.holdings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all holdings for a user
router.get('/holdings/:google_id', async (req, res) => {
  try {
    const user = await User.findOne({ google_id: req.params.google_id }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user.holdings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user by google_id — must be last to avoid matching /holdings/:id
router.get('/:google_id', async (req, res) => {
  try {
    const user = await User.findOne({ google_id: req.params.google_id }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
