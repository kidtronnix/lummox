var Code = require('code');
var Lab = require('lab');
var Composer = require('../../server/index');
var Routes = require('../../server/routes');
var db = require('../../server/config/db');
var lab = exports.lab = Lab.script();
var Bcrypt = require('bcrypt');
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
      // expect(err).to.not.exist();
      done();
    });
  });

  it('doesn\'t register a user with bad payload', function (done) {
      var req = {
        method: 'POST',
        url: '/users',
        payload: {}
      };

      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(400);
        expect(res.payload).to.equal(JSON.stringify({
          statusCode:400,
          error: 'Bad Request',
          message: 'child "username" fails because [username is required]',
          validation: { source: 'payload', keys :['username'] }
        }));
        done();
      });
  });

  it('registers a user', function (done) {
      var req = {
        method: 'POST',
        url: '/users',
        payload: { username: 'me', email: 'ME@example.com', password: 'okedoke' }
      };

      server.inject(req, function(res) {
        expect(res.statusCode).to.equal(200);
        expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
        //expect(res.payload).to.be.an.object();
        var body = JSON.parse(res.payload);
        expect(body._id).to.be.a.string();
        expect(body.username).to.equal('me');
        expect(body.email).to.equal('me@example.com');
        expect(body.password).to.not.equal('okedoke');
        expect(body.password).to.be.string();
        expect(Bcrypt.compareSync('okedoke', body.password)).to.equal(true);
        done();
      });
  });
});
