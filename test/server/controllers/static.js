var Code = require('code');
var Lab = require('lab');
var Static = require('../../../server/controllers/static');
var lab = exports.lab = Lab.script();

// BDD
var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;


describe('Static controller', function () {
    it('returns correct static handler object', function (done) {
      expect(Static.get).to.be.an.object();
      done();
    });
});
