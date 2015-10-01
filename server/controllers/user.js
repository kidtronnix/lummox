'use strict';

var Joi = require('joi'),
  Boom = require('boom'),
  Config = require('../config/config'),
  UserModel = require('../models/user');

var handleError = function(err, callback) {
  if(err.code === 11000) {
    var field = err.message.match(/email/g) || err.message.match(/username/g);
    return callback(Boom.conflict('Another user already exists with that '+field))
  }
  return callback(Boom.badImplementation());
}

exports.getAll = {
  description: 'Get all users',
  notes: 'Returns a list of all system users',
  tags: ['api'],
  auth: Config.get('/auth/getAll'),
  handler: function (request, reply) {
    var User = UserModel.User;
    User.find({}, function (err, user) {
      if (err) return handleError(err, reply);
      return reply(user);
    });
  }
};

exports.getOne = {
  description: 'Get a user',
  notes: 'Returns an individual user',
  tags: ['api'],
  auth: Config.get('/auth/getOne'),
  handler: function (request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function (err, user) {
      if (err) return handleError(err, reply);
      if(!user) {
        return reply(Boom.notFound('No user found for that id'));
      }
      return reply(user);
    });
  }
};

exports.create = {
  description: 'Create a user',
  notes: 'Create a single user',
  tags: ['api'],
  auth: Config.get('/auth/create'),
  validate: {
    payload: {
      username: Joi.string().required().description('A unique username'),
      email: Joi.string().email().required().description('A valid email address'),
      password: Joi.string().min(5).required().description('A password. Must be at least 5 charachters'),
      scope: Joi.array().min(1).includes(Joi.string().valid(Config.get('/auth/scopes'))).description('Array of user scopes/permissions'),
      active: Joi.boolean().description('A flag to see if the user is active.')
    }
  },
  handler: function(request, reply) {
    var payload = request.payload
    payload.active = true;
    var u = new UserModel.User(payload);
    u.save(function(err) {
      if (err) return handleError(err, reply);
      UserModel.User.findById(u, function(err, doc) {
        if (err) return handleError(err, reply);
        return reply(doc);
      });
    });
  }
};

exports.update = {
  description: 'Update a user',
  notes: 'Returns an updated user',
  tags: ['api'],
  auth: Config.get('/auth/update'),
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function(err, user) {
      if(err) return handleError(err, reply);
      if(!user) {
        return reply(Boom.notFound('No user found for that id'));
      }
      user.username = request.payload.username;
      user.email = request.payload.email;
      user.password = request.payload.password;
      user.active = request.payload.active;
      user.save(function(err, user) {
        if (err) return handleError(err, reply);
        return reply(user);
      });
    });
  }
};

exports.delete = {
  description: 'Remove a user',
  notes: 'Returns a user deleted message',
  tags: ['api'],
  auth: Config.get('/auth/delete'),
  handler: function(request, reply) {
      
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function(err, user) {
      if(err) return handleError(err, reply);
      if(!user) {
        return reply(Boom.notFound('No user found for that id'));
      }
      user.remove(function(err, user) {
        if(err) return handleError(err, reply);
        return reply({ message: 'User was successfully deleted' });
      });
    });
  }
}


