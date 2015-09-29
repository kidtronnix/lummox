'use strict';
var Bcrypt = require('bcrypt');
var Config = require('../config/config');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

function toLower (v) {
  return v.toLowerCase();
}

function hashPassword (v) {
  var salt = Bcrypt.genSaltSync(Config.get('/saltRounds'));
  return Bcrypt.hashSync(v, salt);
}

var UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true, set: toLower },
  password: { type: String, required: true, set: hashPassword },
  scope: { type: Array },
  active: { type: Boolean, required: true },
});

UserSchema.methods.checkPassword = function(password, cb) {
  return Bcrypt.compare(password, this.password, cb);
}

var user = mongoose.model('user', UserSchema);

module.exports = { User : user };
