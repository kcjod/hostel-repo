const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/hostel");

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
  },
  pricePerDay: Number,
  img: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  bookedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

module.exports = mongoose.model('Hostel', hostelSchema);
