const mongoose = require('mongoose');

const HoldingSchema = new mongoose.Schema({
  coin_id:          { type: String, required: true },
  amount_invested:  { type: Number, required: true },
  buy_price:        { type: Number, required: true },
  bought_at:        { type: Date, default: Date.now },
  sell_alerted:          { type: Boolean, default: false },
  take_profit_alerted:   { type: Number, default: 0 },
});

const UserSchema = new mongoose.Schema({
  google_id:        { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  image:            { type: String },
  telegram_chat_id: { type: String, default: null },
  holdings:         { type: [HoldingSchema], default: [] },
  created_at:       { type: Date, default: Date.now },
  last_login:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
