exports.register = function (server, options, next) {
  
  server.auth.strategy('jwt', 'jwt', false,
  {
    key: options.key,
    verifyOptions: options.verifyOptions,
    validateFunc: function (decoded, request, callback) {

      if (!decoded['sub']) {
        return callback(null, false);
      } else {
        return callback(null, true);
      }

      // Extra auth step to check db
      // User.findById(decoded['sub'], function(err, results) {
      //   if (err || !results) {
      //     return callback(null, false);
      //   }
      //   else {
      //     return callback(null, true);
      //   }
      // });
    }
  });
  // server.auth.default('jwt');
  next();
}

exports.register.attributes = {
    name: 'auth'
};
