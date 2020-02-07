const mongoose = require('mongoose');
//model for users
var Schema = mongoose.Schema;
const path = "http://localhost:3000/";

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

//virtual links for rest purposes
userSchema.virtual('links').get(function() {
  return [{
    'self': path + 'api/users/' + this._id,
    'admin' : path + 'api/admin/' + this._id,
    'payment': path +  'api/payment/' + this._id
  }];
});

//We don't return hashed password
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
  }
})

module.exports =  mongoose.model('User', userSchema);