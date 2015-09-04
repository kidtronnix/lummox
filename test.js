var User = require('./server/models/user').User;

var Config = require('./server/config/config');
var Mongoose = require('mongoose');
var mongo_uri = Config.get('/mongoose/url')
Mongoose.connect(mongo_uri);
var db = Mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
  User.findOne({username:123},function(err, doc) {
    console.log("error: ", err);
    console.log("doc: ", doc);
  });
});

