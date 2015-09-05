'use strict';

var Joi = require('joi'),
  Boom = require('boom'),
  UserModel = require('../models/user');


exports.getAll = {
  description: 'Get all users',
  notes: 'Returns a list of all system users',
  tags: ['api'],
  handler: function (request, reply) {
    var User = UserModel.User;
    User.find({}, function (err, user) {
      if (err) {
        return reply(Boom.badImplementation(err));
      }
      return reply(user);
    });
  }
};

exports.getOne = {
  description: 'Get a user',
  notes: 'Returns an individual user',
  tags: ['api'],
  handler: function (request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function (err, user) {
      if (err) {
        return reply(Boom.badImplementation(err)); // 500 error
      }
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
  validate: {
    payload: {
      username: Joi.string().required().description('A unique username'),
      email: Joi.string().email().required('A valid email address'),
      password: Joi.string().min(5).required('A password. Must be at least 5 charachters'),
      active: Joi.boolean().description('A flag to see if the user is active.')
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
  description: 'Update a user',
  notes: 'Returns an updated user',
  tags: ['api'],
  handler: function(request, reply) {
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function(err, user) {
      if(err) {
        return reply(Boom.badImplementation(err)); // 500 error
      }
      if(!user) {
        return reply(Boom.notFound('No user found for that id'));
      }
      user.username = request.payload.username;
      user.email = request.payload.email;
      user.password = request.payload.password;
      user.active = request.payload.active;
      user.save(function(err, user) {
        if(err && err.code === 11000) {
          var field = err.message.match(/email/g) || err.message.match(/username/g);
          return reply(Boom.conflict('Another user already exists with that '+field))
        }
        if(err) {
          return reply(Boom.badImplementation());
        }
        return reply(user);
      });
    });
  }
};

exports.delete = {
  description: 'Remove a user',
  notes: 'Returns a user deleted message',
  tags: ['api'],
  handler: function(request, reply) {
      
    var User = UserModel.User;
    User.findOne({ _id: request.params.userId }, function(err, user) {
      if(err) {
        return reply(Boom.badImplementation(err)); // 500 error
      }
      if(!user) {
        return reply(Boom.notFound('No user found for that id'));
      }
      user.remove(function(err, user) {
        if(err) {
          return reply(Boom.badImplementation());
        }
        return reply({message: 'User was successfully deleted'});
      });
    });
  }
}
