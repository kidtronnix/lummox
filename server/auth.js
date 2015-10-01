exports.register = function (server, options, next) {

  server.auth.strategy('jwt', 'jwt', false,
  {
    key: options.key,
    verifyOptions: options.verifyOptions,
    validateFunc: function (decoded, request, callback) {
      if (!decoded['sub'] || (request.route.path !== '/tokens/access' && decoded['scope'].indexOf('refresh') !== -1)) {
        return callback(null, false);
      } else {
        return callback(null, true);
      }
    }
  });
  // server.auth.default('jwt');
  next();
}

exports.register.attributes = {
    name: 'auth'
};
