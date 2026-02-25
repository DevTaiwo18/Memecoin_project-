const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const Metric = require('../models/Metric');
const Score = require('../models/Score');

router.get('/', async (req, res) => {
  try {
    const coins = await Coin.find().lean();

    const results = await Promise.all(
      coins.map(async (coin) => {
        const latestMetric = await Metric.findOne({ coin_id: coin.coin_id })
          .sort({ timestamp: -1 })
          .lean();

        const latestScore = await Score.findOne({ coin_id: coin.coin_id })
          .sort({ timestamp: -1 })
          .lean();

        return { ...coin, metric: latestMetric, score: latestScore };
      })
    );

    res.json({ success: true, count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:coin_id', async (req, res) => {
  try {
    const coin = await Coin.findOne({ coin_id: req.params.coin_id }).lean();
    if (!coin) return res.status(404).json({ success: false, error: 'Coin not found' });

    const metrics = await Metric.find({ coin_id: req.params.coin_id })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    const latestScore = await Score.findOne({ coin_id: req.params.coin_id })
      .sort({ timestamp: -1 })
      .lean();

    res.json({ success: true, data: { ...coin, metrics, score: latestScore } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
