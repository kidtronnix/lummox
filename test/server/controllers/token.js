var Code = require('code');
var Lab = require('lab');
var Token = require('../../../server/controllers/token');
var lab = exports.lab = Lab.script();
var JWT = require('jsonwebtoken');
var UserModel = require('../../../server/models/user');
var Bcrypt = require('bcrypt');
// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

expect.unauthorized = function (result, msg) {
  expect(result).to.be.an.object();
  expect(result.output).to.be.an.object();
  expect(result.output.statusCode).to.be.equal(401);
  expect(result.output.payload.statusCode).to.be.equal(401);
  expect(result.output.payload.error).to.be.equal('Unauthorized');
  expect(result.output.payload.message).to.be.equal(msg);
}

var getMockDb = function(err, returnDoc) {
    var pass = 'password123';
    var salt = Bcrypt.genSaltSync(1);
    var hash = Bcrypt.hashSync(pass, salt);

    var user = { _id: 'abc123', username: 'me', password: hash, scope: ['admin'] };
}

describe('Token controller', function () {
    describe('refresh', function() {
      var pass = 'password123';
      var salt = Bcrypt.genSaltSync(1);
      var hash = Bcrypt.hashSync(pass, salt);
      
      it('handler() returns JWT with refresh scope', function (done) {
        var user = { _id: 'abc123', username: 'me', password: hash, scope: ['admin'] };
        var MockUserModel = {
          findOne: function(query, cb) {
            if(query.username === 'me' && query.active === true) {
              return cb(null, user);
            }
            return cb(true, null);
          }
        };

        UserModel.User = MockUserModel;
        Token.refresh.handler({ payload: { username: 'me', password: pass } }, function(result) {
          expect(result).to.be.an.object();
          JWT.verify(result.token, 'NeverShareYourSecret',{}, function(err, decoded) {
            expect(err).to.not.exist();
            expect(decoded.sub).to.be.equal(user._id);
            expect(decoded.scope).to.only.include(['refresh']);
            done();
          });
        });
      });
      
      it('handler() returns 401 with bad username', function (done) {
        Token.refresh.handler({ payload: { username: 'noUser'} }, function(result) {
          expect.unauthorized(result, 'Invalid credentials');
          done();
        });
      });

      it('handler() returns 401 with bad password', function (done) {
        var user = { _id: 'abc123', username: 'me', scope: ['admin'] };
        var MockUserModel = {
          findOne: function(query, cb) {
            if(query.username === 'me' && query.active === true) {
              return cb(null, user);
            }
            return cb(true, null);
          }
        };
        
        Token.refresh.handler({ payload: { username: 'me', password: 'wrong' } }, function(result) {
          expect.unauthorized(result, 'Invalid credentials');
          done();
        });
      });
    });
    
    describe('access', function() {
      it('handler() returns JWT access token with good refresh token', function(done) {
        var user = { _id: 'abc123', username: 'me', scope: ['admin'] };
        var MockUserModel = {
          findOne: function(query, cb) {
            if(query._id === 2 && query.active === true) {
              return cb(null, user);
            }
            return cb(true, null);
          }
        };

        UserModel.User = MockUserModel;
        Token.access.handler({ auth: { credentials: { sub: 2 } } }, function(result) {
          expect(result).to.be.object();
          JWT.verify(result.token, 'NeverShareYourSecret',{}, function(err, decoded) {
            expect(err).to.not.exist();
            expect(decoded.sub).to.be.equal(user._id);
            expect(decoded.scope).to.only.include(['admin']);
            var exp = new Date(decoded.exp*1000);
            var now = new Date();
            expect(exp.getTime() - now.getTime()).to.be.about(4*60*60*1000, 1000);
            done();
          });
        });
      });
      
      it('handler() returns 401 when user not found', function (done) {
        var MockUserModel = {
          findOne: function(query, cb) {
            return cb(null, null);
          }
        };
        
        UserModel.User = MockUserModel;
        Token.access.handler({ auth: { credentials: { sub: 2 } } }, function(result) {
          expect.unauthorized(result, 'User not found');
          done();
        });
      });
    });
});
