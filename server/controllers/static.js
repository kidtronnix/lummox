'use strict';

/** load client folder*/
exports.get = {
  handler: {
    directory: {
      path: __dirname+'/../../client/src',
      listing: true,
      defaultExtension: 'html'
    }
  }
};
