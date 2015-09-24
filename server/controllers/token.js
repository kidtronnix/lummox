'use strict';
var Boom = require('boom');
var UserModel = require('../models/user');
var JWT = require('jsonwebtoken');
var Bcrypt = require('bcrypt');
var Config = require('../config/config');

exports.refresh = {
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ username: request.payload.username, active: true }, function(err, user) {
      if(!user) {
        return reply(Boom.unauthorized('Invalid credentials'));
      }

      Bcrypt.compare(request.payload.password, user.password, function(err, valid) {
        if(!valid) {
          return reply(Boom.unauthorized('Invalid credentials'));
        }
        
        var payload = {
          scope: ['refresh']
        }

        var opts = { subject: user._id };
        var token = JWT.sign(payload, Config.get('/jwtAuth/key'), opts);
        return reply({ token: token });
      });
    });
  }
};

exports.access = {
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.auth.credentials.sub, active: true }, function(err, user) {
      if(!user) {
        return reply(Boom.unauthorized('User not found'));
      }

      var payload = {
        scope: user.scope
      }

      var opts = { 
        subject: user._id,
        expiresInMinutes: Config.get('/jwtAuth/expiresInMinutes')
      };

      var token = JWT.sign(payload, Config.get('/jwtAuth/key'), opts);
      return reply({ token: token });
    });
  }
};

