var Code = require('code');
var Lab = require('lab');
var Hapi = require('hapi');
var UserModel = require('../../server/models/user');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;


describe('Auth plugin', function () {

  var server = new Hapi.Server();
  server.connection({ port: 3000 });

  before(function (done) {
    server.register([
    {
      register: require('hapi-auth-jwt2'),
    },
    {
      register: require('../../server/auth'),
      options: {
        key: 'testsecret',
        verifyOptions: { algorithms: [ 'HS256' ] }
      }
    }], {}, function (err) {
      expect(err).to.not.exist;

      server.route([{
        method: 'GET', path: '/restricted',
        config: {
          auth: 'jwt',
          handler: function(request, reply) { return reply({ message: 'Ok' }) }
        }
      },{
        method: 'GET', path: '/tokens/access',
        config: {
          auth: 'jwt-refresh',
          handler: function(request, reply) { return reply({ message: 'Ok' }) }
        }
      }]);

      server.start(function () {
          done();
      });
    });
  });

  describe('jwt auth strategy', function() {

    it('invalidates request without `Authorization` header', function (done) {
      var req = {method: 'GET', url: '/restricted' };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({ statusCode:401, error: 'Unauthorized', message:'Missing auth token' }));
        done();
      });
    });

    it('invalidates request using token with invalid signature', function (done) {
      var req = {
        method: 'GET',
        url: '/restricted',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJhZG1pbiJdLCJpYXQiOjE0NDAyMDEyNDcsImV4cCI6MTQ0MDI4NzY0N30.B-usJxroDNkBDdQnlYdW7sJbyI7wTGir4lhU2RvTqXs'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode:401,
          error: 'Unauthorized',
          message:'Invalid token',
          attributes: { error: 'Invalid token' }
        }));
        done();
      });
    });

    it('invalidates request using expired token', function (done) {
      var req = {
        method: 'GET',
        url: '/restricted',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJhZG1pbiJdLCJpYXQiOjE0NDAyMDEyNDcsImV4cCI6MTQ0MDI4NzY0N30.vicH7jKxhZbTvSIyYrXuHSTTO9CW2NlHVFNJkD3PUHc'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode:401,
          error: 'Unauthorized',
          message:'Token expired',
          attributes: { error: 'Token expired' }
        }));
        done();
      });
    });

    it('invalidates request using token without sub claim', function (done) {
      var req = {
        method: 'GET',
        url: '/restricted',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6WyJhZG1pbiJdLCJpYXQiOjE0NDAyMDEyNDcsImV4cCI6NDEwMjI3MjAwMH0.h0ILvdjoTbca7GNfKuKWLQ4zFBwx-FCk4VZLUtkFpWM'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });

    it('invalidates request using token with refresh scope', function (done) {
      var req = {
        method: 'GET',
        url: '/restricted',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJyZWZyZXNoIl0sImlhdCI6MTQ0MDIwMTI0NywiZXhwIjo0MTAyMjcyMDAwfQ.cbR9yHfkl9IGE0DSAnVmz_LEGmi86KsublmiA32NAiQ'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });
    
    it('validates request using valid token', function (done) {
      var req = {
        method: 'GET',
        url: '/restricted',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJhZG1pbiJdLCJpYXQiOjE0NDAyMDEyNDcsImV4cCI6NDEwMjI3MjAwMH0.fw4shJzd4ws24Pv40WP4Cpz5WX5Bf1Y21Uif4hiZL1I'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.equal(JSON.stringify({ message: 'Ok'}));
        done();
      });
    });
  });

  describe('jwt-refresh auth strategy', function() {
    it('validates request using token with refresh scope and matching jti value', function (done) {
      var req = {
        method: 'GET',
        url: '/tokens/access',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJyZWZyZXNoIl0sImlhdCI6MTQ0MDIwMTI0NywianRpIjoxMjN9.3Z_kvONzz4pwVPQ5CXd7m_qOA-4zqZwaUqt4SXO3ITI'
        }
      };
      var query = {};
      var MockUserModel = {
        findOne: function(query, cb) {
          var user = {
            jti : 123
          };
          return cb(null, user);
        }
      }
      UserModel.User = MockUserModel;
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.payload).to.equal(JSON.stringify({ message: 'Ok'}));
        done();
      });
    });
    
    it('invalidates request using token with refresh scope and not matching jti value', function (done) {
      var req = {
        method: 'GET',
        url: '/tokens/access',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJyZWZyZXNoIl0sImlhdCI6MTQ0MDIwMTI0NywianRpIjoxMjN9.3Z_kvONzz4pwVPQ5CXd7m_qOA-4zqZwaUqt4SXO3ITI'
        }
      };
      var query = {};
      var MockUserModel = {
        findOne: function(query, cb) {
          var user = {
            jti : 'notthesame'
          };
          return cb(null, user);
        }
      }
      UserModel.User = MockUserModel;
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });

    it('invalidates request using token with refresh scope and error on user lookup', function (done) {
      var req = {
        method: 'GET',
        url: '/tokens/access',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJyZWZyZXNoIl0sImlhdCI6MTQ0MDIwMTI0NywianRpIjoxMjN9.3Z_kvONzz4pwVPQ5CXd7m_qOA-4zqZwaUqt4SXO3ITI'
        }
      };
      var query = {};
      var MockUserModel = {
        findOne: function(query, cb) {
          return cb(true, null);
        }
      }
      UserModel.User = MockUserModel;
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });
    
    it('invalidates request using token with refresh scope and user not found', function (done) {
      var req = {
        method: 'GET',
        url: '/tokens/access',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1NWQ3YjkwNjIzYzlkOGUwNDgyMWViODEiLCJzY29wZSI6WyJyZWZyZXNoIl0sImlhdCI6MTQ0MDIwMTI0NywianRpIjoxMjN9.3Z_kvONzz4pwVPQ5CXd7m_qOA-4zqZwaUqt4SXO3ITI'
        }
      };
      var query = {};
      var MockUserModel = {
        findOne: function(query, cb) {
          return cb(null, null);
        }
      }
      UserModel.User = MockUserModel;
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });
    
    it('invalidates request using token without sub claim', function (done) {
      var req = {
        method: 'GET',
        url: '/tokens/access',
        headers: {
          Authorization: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzY29wZSI6WyJhZG1pbiJdLCJpYXQiOjE0NDAyMDEyNDcsImV4cCI6NDEwMjI3MjAwMH0.h0ILvdjoTbca7GNfKuKWLQ4zFBwx-FCk4VZLUtkFpWM'
        }
      };
      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(401);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode: 401,
          error: 'Unauthorized',
          message:'Invalid credentials',
          attributes: { error: 'Invalid credentials' }
        }));
        done();
      });
    });
  });
});
