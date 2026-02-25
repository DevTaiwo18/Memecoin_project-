const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  google_id:        { type: String, required: true, unique: true },
  name:             { type: String, required: true },
  email:            { type: String, required: true, unique: true },
  image:            { type: String },
  telegram_chat_id: { type: String, default: null },
  created_at:       { type: Date, default: Date.now },
  last_login:       { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
