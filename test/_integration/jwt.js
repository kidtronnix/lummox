//var Code = require('code');
//var Lab = require('lab');
//var Composer = require('../../server/index');
//var Routes = require('../../server/routes');
//var db = require('../../server/config/db');
//var lab = exports.lab = Lab.script();
//
//// BDD
//var describe = lab.describe;
//var it = lab.it;
//var before = lab.before;
//var beforeEach = lab.beforeEach;
//var after = lab.after;
//var expect = Code.expect;
//
//var server;
//
//describe('lummox', function () {
//  before(function(done) {
//  
//    Composer(function (err, srvr) {
//      server = srvr;
//      expect(err).to.not.exist;
//      server.route(Routes.endpoints);
//
//      db.db.once('open', function callback() {
//        // console.log("Connection with database succeeded.");
//        server.start(function () {
//          done();
//        });
//      });
//    });
//  });
//  
//  beforeEach(function(done) {
//    db.db.collection('users').drop(function(err) {
//      expect(err).to.not.exist();
//      // TO DO: Add User to db   
//      done();
//    });
//  });
//
//  it('user can\'t use refesh token to access a protected route', function (done) {
//    done();
//  });
//  
//  it('user can perform full auth workflow', function (done) {
//    done();
//  });
//});
