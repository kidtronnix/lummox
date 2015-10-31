'use strict';
var Boom = require('boom');
var UserModel = require('../models/user');
var JWT = require('jsonwebtoken');
var Bcrypt = require('bcrypt');
var Config = require('../config/config');

function generateJti()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

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
        var jti = generateJti();
        user.jti = jti;

        user.save(function(err, u) {
          if (err) return reply(Boom.badImplementation());
          var payload = {
            scope: ['refresh'],
            jti: jti
          }
          var opts = { subject: u._id };
          var token = JWT.sign(payload, Config.get('/jwt/key'), opts);
          return reply({ token: token });
        });

      });
    });
  }
};

exports.access = {
  auth: {
    strategy: 'jwt-refresh',
    scope: ['refresh']
  },
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.auth.credentials.sub, active: true }, function(err, user) {
      if(!user) {
        return reply(Boom.unauthorized('User not found'));
      }

      user.scope.push('user-'+user._id);

      var payload = {
        scope: user.scope
      }

      var opts = {
        subject: user._id,
        expiresInMinutes: Config.get('/jwt/expiresInMinutes')
      };

      var token = JWT.sign(payload, Config.get('/jwt/key'), opts);
      return reply({ token: token });
    });
  }
};
