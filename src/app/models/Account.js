const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Account = new Schema({
  id: { type: String },
  user_name: { type: String },
  password: { type: String },
  created_by: { type: String },
  name: { type: String },
  avatar: { type: String },
  email: { type: String },
  user_token: { type: String },
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', Account);
