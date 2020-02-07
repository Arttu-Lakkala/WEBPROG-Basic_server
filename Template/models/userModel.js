const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    default: 1
  },
  erapaiva: {
    type: Date
  }
});

module.exports =  mongoose.model('User', userSchema);