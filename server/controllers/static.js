'use strict';

/** load client folder*/
exports.get = {
  handler: {
    directory: {
      path: __dirname+'/../../client/src',
      index: true
    }
  }
};
