const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/hostel");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  bookedHostels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
  }],
});

module.exports = mongoose.model('User', userSchema);
