const mongoose = require('mongoose');

const MetricSchema = new mongoose.Schema({
  coin_id: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  price: { type: Number },
  volume: { type: Number },
  liquidity: { type: Number },
  market_cap: { type: Number },
  holders: { type: Number },
  whale_inflow: { type: Number, default: 0 },
  whale_outflow: { type: Number, default: 0 },
  price_change_5m: { type: Number },
  price_change_1h: { type: Number },
  price_change_6h: { type: Number },
  price_change_24h: { type: Number },
  txns_buys: { type: Number },
  txns_sells: { type: Number },
  image_url: { type: String },
  launch_time: { type: Date }
});

MetricSchema.index({ coin_id: 1, timestamp: -1 });

module.exports = mongoose.model('Metric', MetricSchema);
