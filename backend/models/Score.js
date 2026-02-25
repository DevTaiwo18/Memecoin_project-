const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  coin_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  safety_score: { type: Number, min: 0, max: 100 },
  momentum_score: { type: Number, min: 0, max: 100 },
  composite_score: { type: Number, min: 0, max: 100 }
});

ScoreSchema.index({ coin_id: 1, timestamp: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
