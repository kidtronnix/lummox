var User = require('./server/models/user').User;

var Config = require('./server/config/config');
var Mongoose = require('mongoose');
var mongo_uri = Config.get('/mongoose/url')
Mongoose.connect(mongo_uri);
var db = Mongoose.connection;
var ObjectId = Mongoose.Schema.ObjectId;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log("Connection with database succeeded.");
    var user = new User({ 
      username: "me",
      email: "me@email.com",
      password: "1234567",
      active: true
    });
    user.save(function(err, usr) {
      console.log("error: ", err);
    });
});

