var Code = require('code');
var Lab = require('lab');
var Composer = require('../../server/index');
var Routes = require('../../server/routes');
var db = require('../../server/config/db');
var User = require('../../server/models/user').User;
var JWT = require('jsonwebtoken');
var lab = exports.lab = Lab.script();

// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var expect = Code.expect;

var server;

describe('lummox', function () {
  before(function(done) {
  
    Composer(function (err, srvr) {
      server = srvr;
      expect(err).to.not.exist;
      server.route(Routes.endpoints);
      server.start(function () {
        done();
      });
    });
  });
  
  beforeEach(function(done) {
    db.db.collection('users').drop(function(err) {
      done();
    });
  });

  it('user can\'t use refesh token to access a protected route', function (done) {
    var payload = {
      scope: ['refresh']
    }

    var opts = { subject: 1 };
    var token = JWT.sign(payload, 'NeverShareYourSecret', opts);
    var req = {
      method: 'GET',
      url: '/users/1',
      headers: { Authorization: token }
    }

    server.inject(req, function(res) {
      expect(res.statusCode).to.equal(401);
      done();
    });
  });
  
  it('user can perform full auth workflow', function (done) {
    var username = 'me';
    var password = 'badboy4life';
    var req = {
        method: 'POST',
        url: '/users',
        payload: { username: username, email: 'me@example.com', password: password, scope: ['admin'], active: true }
      };

      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
        var body = JSON.parse(res.payload);
        expect(body._id).to.be.a.string();
        expect(body.username).to.equal('me');
        expect(body.email).to.equal('me@example.com');
        expect(body.password).to.not.equal(password);
        expect(body.password).to.be.string();
        expect(body.scope).to.be.array();
        expect(body.scope[0]).to.equal('admin');
        expect(body.active).to.be.true();
        
        var req = {
          method: 'POST',
          url: '/tokens/refresh',
          payload: { username: username, password: password }
        }
        server.inject(req, function(res) {
          expect(res.statusCode).to.equal(200);
          expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
          var body = JSON.parse(res.payload);
          expect(body.token).to.be.a.string();
          var decoded = JWT.verify(body.token, 'NeverShareYourSecret');
          expect(decoded.sub).to.be.a.string();
          expect(decoded.scope).to.be.an.array();
          expect(decoded.scope[0]).to.equal('refresh');

          var req = {
            method: 'POST',
            url: '/tokens/access',
            headers: { Authorization: body.token }
          }
          server.inject(req, function(res) {
            expect(res.statusCode).to.equal(200);
            var body = JSON.parse(res.payload);
            expect(body.token).to.be.a.string();
            var decoded = JWT.verify(body.token, 'NeverShareYourSecret');
            expect(decoded.sub).to.be.a.string();
            expect(decoded.scope).to.be.an.array();
            expect(decoded.scope[0]).to.equal('admin');
            
            var req = {
              method: 'GET',
              url: '/users',
              headers: { Authorization: body.token }
            }

            server.inject(req, function(res) {
              expect(res.statusCode).to.equal(200);
              done();
            });
          });
        });
      });
  });
});
