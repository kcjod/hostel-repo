const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/hostel");

const adminSchema = new mongoose.Schema({
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
  username: String,
  password: {
    type: String,
    required: true,
  },
  hostelsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
  }],
});

module.exports = mongoose.model('Admin', adminSchema);
