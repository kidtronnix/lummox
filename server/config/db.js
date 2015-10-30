'use strict';

var Mongoose = require('mongoose')
  , Config = require('./config');

Mongoose.connect(Config.get('/mongoUri'));  
var db = Mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

exports.Mongoose = Mongoose;
exports.db = db;
