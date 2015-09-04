'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// function toLower (v) {
//  return v.toLowerCase();
// }

var UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  active: { type: Boolean, required: true },
});

var user = mongoose.model('user', UserSchema);

module.exports = { User : user };
