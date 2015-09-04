'use strict';

var Joi = require('joi'),
  Boom = require('boom'),
  UserModel = require('../models/user');


exports.getAll = {
  handler: function (request, reply) {
    var User = UserModel.User;
    User.find({}, function (err, user) {
      if (!err) {
        return reply(user);
      }
      return reply(Boom.badImplementation(err)); // 500 error
    });
  }
};

exports.getOne = {
  handler: function (request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function (err, user) {
      if (!err) {
        return reply(user);
      }
      return reply(Boom.badImplementation(err)); // 500 error
    });
  }
};

exports.create = {
  validate: {
    payload: {
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(5).required(),
      active: Joi.boolean()
    }
  },
  handler: function(request, reply) {
    var User = UserModel.User;
    User.save(request.payload, function(err, doc) {
      if(!err) {
        return reply(doc);
      }
      if(err.code === 11000) {
        var field = err.message.match(/email/g) || err.message.match(/username/g);
        return reply(Boom.conflict('Another user already exists with that '+field))
      }
      return reply(Boom.badImplementation(err));
    });
  }
};

exports.update = {
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function(err, user) {
      user.username = request.payload.username;
      user.email = request.payload.email;
      user.password = request.payload.password;
      user.active = request.payload.active;
      user.save(function(err, user) {
        return reply(user);
      });
    });
  }
};
