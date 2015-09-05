var Code = require('code');
var Lab = require('lab');
var Joi = require('joi');
var Config = require('../../../server/config/config');
// var Mongoose = require('mongoose');
// Mongoose.connect(Config.get('/mongoose/url'));
// var db = Mongoose.connection;
var User = require('../../../server/controllers/user');
var UserModel = require('../../../server/models/user');
var lab = exports.lab = Lab.script();
// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

expect.badImplementation = function (result) {
  expect(result).to.be.an.object();
  expect(result.output.statusCode).to.be.equal(500);
  expect(result.output.payload.statusCode).to.be.equal(500);
  expect(result.output.payload.error).to.be.equal('Internal Server Error');
  expect(result.output.payload.message).to.be.equal('An internal server error occurred');
}

expect.conflict = function (result, msg) {
  expect(result).to.be.an.object();
  expect(result.output.statusCode).to.be.equal(409);
  expect(result.output.payload.statusCode).to.be.equal(409);
  expect(result.output.payload.error).to.be.equal('Conflict');
  expect(result.output.payload.message).to.be.equal(msg);
}

expect.notFound = function (result) {
  expect(result).to.be.an.object();
  expect(result.output.statusCode).to.be.equal(404);
  expect(result.output.payload.statusCode).to.be.equal(404);
  expect(result.output.payload.error).to.be.equal('Not Found');
  expect(result.output.payload.message).to.be.equal('No user found for that id');
}

var getMockDb = function(err, returnDoc) {
  var mock_db = {};
  mock_db[1] = {
    _id: 1,
    username: "me",
    email: "me@email.com",
    password: "ENCRYPTED",
    active: true,
    save: function(cb) {
      if(err) {
        return cb(err, null);
      }
      if(returnDoc) {
        var doc = {
          _id: 1,
          username: this.username,
          email: this.email,
          password: this.password,
          active: this.active
        };

        return cb(null, doc);
      }
      return cb(null, null);
    },
    remove: function(cb) {
      if(err) {
        return cb(err, null);
      }
      if(returnDoc) {
        return cb(null, {});
      }
      return cb(null, null);
    }

  }

  return mock_db;
}

describe('User controller', function () {
    var testUsers = [{
      userId : 'id2',
      username : 'me',
    },{
      userId : 'ip2',
      username : 'you',
    }];

    describe('getAll', function () {
      it('handler() can get all users', function (done) {
        var request = {};
        var MockUserModel = {
          find: function(query, cb) {
            return cb(null, testUsers);
          }
        }
        UserModel.User = MockUserModel;
        User.getAll.handler(request, function(result) {
          expect(result).to.be.an.array();
          expect(result.length).to.be.equal(testUsers.length);
          expect(result[0].userId).to.be.equal(testUsers[0].userId);
          done();
        });
      });

      it('returns 500 on error', function (done) {
        var request = {};
        var err = 'Mock error';
        var MockUserModel = {
          find: function(query, cb) {
            return cb(err, null);
          }
        }
        UserModel.User = MockUserModel;
        User.getAll.handler(request, function(result) {
          expect.badImplementation(result);
          done();
        });
      });
    });

    describe('getOne', function() {
      it('handler() can get a single user', function (done) {
        var request = { params: { userId: 1 } };
        var MockUserModel = {
          findOne: function(query, cb) {
            var user = {
              userId: query._id,
              username: 'me'
            }
            return cb(null, user);
          }
        }
        UserModel.User = MockUserModel;
        User.getOne.handler(request, function(result) {
          expect(result).to.be.an.object();
          expect(result.userId).to.be.equal(request.params.userId);
          expect(result.username).to.be.equal('me');
          done();
        });
      });

      it('returns 500 on error', function (done) {
        var request = { params: { userId: 1 } };
        var err = 'Mock error';
        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(err, null);
          }
        }
        UserModel.User = MockUserModel;
        User.getOne.handler(request, function(result) {
          expect.badImplementation(result);
          done();
        });
      });

      
      it('handler() returns 404 on no user found', function (done) {
        var request = { params: { userId: 1 } };
        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, null);
          }
        }
        UserModel.User = MockUserModel;
        User.getOne.handler(request, function(result) {
          expect.notFound(result);
          done();
        });
      });
    });




    describe('create()', function() {
      it('can create a user', function (done) {
        var request = { params: { userId: 1 } };
        var user = { _id: 2, username: 'me' };
        var MockUserModel = {
          save: function(query, cb) {
            return cb(null, user);
          }
        }
        UserModel.User = MockUserModel;
        User.create.handler(request, function(result) {
          expect(result).to.be.an.object();
          expect(result._id).to.be.equal(2);
          expect(result.username).to.be.equal('me');
          done();
        });
      });

      it('returns 500 on error', function (done) {
        var request = { params: { userId: 1 } };
        var err = 'Error in db';
        var MockUserModel = {
          save: function(query, cb) {
            return cb(err, null);
          }
        }
        UserModel.User = MockUserModel;
        User.create.handler(request, function(result) {
          expect.badImplementation(result);
          done();
        });
      });

      it('returns conflict for already taken email', function (done) {
        var request = { params: { userId: 1 } };
        var err = {
          "code" : 11000,
		      "message" : "E11000 duplicate key error index: test.boom.$email_1  dup key: { : 1.0 }"
        };
        var MockUserModel = {
          save: function(query, cb) {
            return cb(err, null);
          }
        }
        UserModel.User = MockUserModel;
        User.create.handler(request, function(result) {
          expect.conflict(result, 'Another user already exists with that email');
          done();
        });
      });

      it('returns conflict for already taken username', function (done) {
        var request = { params: { userId: 1 } };
        var err = {
          "code" : 11000,
		      "message" : "E11000 duplicate key error index: test.boom.$username_1  dup key: { : 1.0 }"
        };
        var MockUserModel = {
          save: function(query, cb) {
            return cb(err, null);
          }
        }
        UserModel.User = MockUserModel;
        User.create.handler(request, function(result) {
          expect.conflict(result, 'Another user already exists with that username');
          done();
        });
      });

      it('validates good payload', function (done) {
        var payload = {
          username: "me",
          email: "me@email.com",
          password: "password123",
          active: true
        }
        Joi.assert(payload, User.create.validate.payload);
        done();
      });
    });

    describe('update', function() {
      it('handler() returns updated doc after good call', function(done) {
        var payload = {
          username: "new_me",
          email: "me2@rmail.com",
          password: "NEW_PASS",
          active: false
        };
        var userId = 1;

        var mock_db = getMockDb(null, true);      

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: userId }, payload: payload }, function(result) {
          expect(result._id).to.be.equal(userId);
          expect(result.username).to.be.equal(payload.username);
          expect(result.email).to.be.equal(payload.email);
          expect(result.password).to.be.equal(payload.password);
          expect(result.active).to.be.equal(payload.active);
          done();
        });
      });
      
      it('handler() returns 409 doc after username conflict', function(done) {
        var payload = {
          username: "new_me",
          email: "me2@rmail.com",
          password: "NEW_PASS",
          active: false
        };
        var userId = 1;

        var err = { "code" : 11000,
		  "message" : "E11000 duplicate key error index: test.boom.$username_1  dup key: { : 1.0 }"
        };

        var mock_db = getMockDb(err);

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: userId }, payload: payload }, function(result) {
          expect.conflict(result, 'Another user already exists with that username');
          done();
        });
      });

      it('handler() returns 409 doc after email conflict', function(done) {
        var payload = {
          username: "new_me",
          email: "me2@rmail.com",
          password: "NEW_PASS",
          active: false
        };
        var userId = 1;

        var err = { "code" : 11000,
          "message" : "E11000 duplicate key error index: test.boom.$email_1  dup key: { : 1.0 }"
        };

        var mock_db = getMockDb(err); 

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: userId }, payload: payload }, function(result) {
          expect.conflict(result, 'Another user already exists with that email');
          done();
        });
      });
      it('handler() returns 404 when user not found', function(done) {
        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, null);
          }
        }
        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: 1 }, payload: {} }, function(result) {
          expect.notFound(result);
          done();
        });
      });
      
      it('handler() returns 500 when error is passed on finding', function(done) {
        var MockUserModel = {
          findOne: function(query, cb) {
            var error = new Error('Something went wrong');
            return cb(error, null);
          }
        }
        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: 1 }, payload: {} }, function(result) {
          expect.badImplementation(result);
          done();
        });
      });
      
      it('handler() returns 500 when error is passed on saving', function(done) {
        var userId = 1;

        var err = new Error('Something went wrong');
        var mock_db = getMockDb(err);

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.update.handler({ params: { userId: userId }, payload: {} }, function(result) {
          expect.badImplementation(result);
          done();
        });
      });
    });
    
    describe('delete', function() {
      it('handler() should return successfully deleted on deletion', function(done) {
        var userId = 1;

        var mock_db = getMockDb(null, true);

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.delete.handler({ params: { userId: userId }, payload: {} }, function(result) {
          expect(result).to.be.object();
          expect(result.message).to.be.equal('User was successfully deleted');
          done();
        });
      });

      it('handler() should return 500 on saving error', function(done) {
        var userId = 1;

        var mock_db = getMockDb(new Error('Something went wrong'), null);

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, mock_db[query._id]);
          }
        }

        UserModel.User = MockUserModel;
        User.delete.handler({ params: { userId: userId }, payload: {} }, function(result) {
          expect.badImplementation(result);
          done();
        });
      });

      it('handler() should return 500 on findOne error', function(done) {
        var userId = 1;

        var MockUserModel = {
          findOne: function(query, cb) {
            var err = new Error('Something went wrong');
            return cb(err, null);
          }
        }

        UserModel.User = MockUserModel;
        User.delete.handler({ params: { userId: userId }, payload: {} }, function(result) {
          expect.badImplementation(result);
          done();
        });
      });
      
      it('handler() should return 404 when no user', function(done) {
        var userId = 1;

        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, null);
          }
        }

        UserModel.User = MockUserModel;
        User.delete.handler({ params: { userId: userId }, payload: {} }, function(result) {
          expect.notFound(result);
          done();
        });
      });
    });
});
