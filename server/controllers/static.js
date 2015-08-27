'use strict';

/** load client folder*/

exports.get = {
  handler: {
    directory: {
      path: '../client/src',
      index: true
    }
  }
};
