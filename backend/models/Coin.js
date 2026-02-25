const mongoose = require('mongoose');

const CoinSchema = new mongoose.Schema({
  coin_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  contract_address: { type: String },
  chain: { type: String, default: 'solana' },
  launch_time: { type: Date },
  image_url: { type: String },
  twitter: { type: String },
  telegram: { type: String },
  website: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coin', CoinSchema);
