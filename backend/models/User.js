const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  history: [{
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    browsingTime: Number, // Duration in seconds
    timestamp: { type: Date, default: Date.now }
  }]
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);