
var Code = require('code');
var Lab = require('lab');
var User = require('../../../server/models/user').User;
var lab = exports.lab = Lab.script();
var Bcrypt = require('bcrypt');

// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var expect = Code.expect;

describe('User model', function () {

  it('it sets email to lowercase before save', function (done) {
    var u = new User({username: 'me', email: 'ME@example.com', password: 'boooooooooom' });
    expect(u.email).to.equal('me@example.com');
    done();
  });
  
  it('it sets password to bcrypt hash before save', function (done) {
    var u = new User({username: 'me', email: 'ME@example.com', password: 'boom123' });
    expect(u.password).to.not.equal('boom123');
    expect(u.password).to.be.string();
    expect(Bcrypt.compareSync('boom123', u.password)).to.equal(true);
    done();
  });

  it('it can check password against bcrypt hash', function (done) {
    var u = new User({username: 'me', email: 'ME@example.com', password: 'boom123' });
    expect(u.password).to.not.equal('boom123');
    expect(u.password).to.be.string();
    u.checkPassword('boom123', function(err, res) {
      expect(err).to.not.exist();
      expect(res).to.be.true();
      done();
    });
  });
});
