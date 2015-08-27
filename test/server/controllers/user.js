var Code = require('code');
var Lab = require('lab');
var Config = require('../../../server/config/config');
var Mongoose = require('mongoose');
Mongoose.connect(Config.get('/mongoose/url'));
var db = Mongoose.connection;
var User = require('../../../server/controllers/user');

var lab = exports.lab = Lab.script();
// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;


describe('User controller', function () {
    var testUsers = [{
      userId : 'id2',
      username : 'me',
    },{
      userId : 'ip2',
      username : 'you',
    }];

    before(function (done) {
      db.collection('users').insert(testUsers, function(err, docs) {
        expect(err).to.not.exist;
        expect(docs.length).to.be.equal(testUsers.length);
        done();
      });
    });

    it('can get all users', function (done) {
      var request = {};

      User.getAll.handler(request, function(docs) {
        expect(docs.length).to.be.equal(testUsers.length);
        done();
      });
    });

    after(function (done) {
      db.collection('users').remove({}, function(err) {
        expect(err).to.not.exist;
        done();
      });
    });
});


// For mocking errors
// Model.exec = function(callback) {
//   process.nextTick(function() {
//     callback(new Error('this is an error'));
//   });
// };
