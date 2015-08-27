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
    var User = user.User;
    User.findOne({ 'userId': request.params.userId }, function (err, user) {
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
      userId   : Joi.string().required(),
      username  : Joi.string().required()
    }
  },
  handler: function (request, reply) {
    var User = user.User;
    var usr = new User(request.payload);
    usr.save(function (err, doc) {
      if (!err) {
        return reply(doc).created('/user/' + doc._id); // HTTP 201
      }
      if (11000 === err.code || 11001 === err.code) {
        return reply(Boom.forbidden("please provide another user id, it already exist"));
      }
      return reply(Boom.forbidden(err)); // HTTP 403
    });
  }
};

exports.update = {
  validate: {
    payload: {
      username  : Joi.string().required()
    }
  },
  handler: function (request, reply) {
    var User = user.User;
    User.findOne({ 'userId': request.params.userId }, function (err, doc) {
      if (!err) {
        doc.username = request.payload.username;
        doc.save(function (err, user) {
          if (!err) {
            return reply(user); // HTTP 201
          }
          if (11000 === err.code || 11001 === err.code) {
            return reply(Boom.forbidden("please provide another user id, it already exist"));
          }
          return reply(Boom.forbidden(err)); // HTTP 403
        });
      }
      else{
        return reply(Boom.badImplementation(err)); // 500 error
      }
    });
  }
};

exports.remove = {
  handler: function (request, reply) {
    User.findOne({ 'userId': request.params.userId }, function (err, doc) {
      if (!err && user) {
        user.remove();
        return reply({ message: "User deleted successfully"});
      }
      if (!err) {
        return reply(Boom.notFound());
      }
      return reply(Boom.badRequest("Could not delete user"));
    });
  }
};
