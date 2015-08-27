var Code = require('code');
var Lab = require('lab');
var Routes = require('../../server/routes');
var lab = exports.lab = Lab.script();

// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;


describe('Routes file', function () {
    it('returns an array of endpoints', function (done) {
      expect(Routes.endpoints).to.be.an.array();
      done();
    });
});
