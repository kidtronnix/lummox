var UserModel = require('./models/user');

exports.register = function (server, options, next) {

  server.auth.strategy('jwt', 'jwt', false,
  {
    key: options.key,
    verifyOptions: options.verifyOptions,
    validateFunc: function (decoded, request, callback) {
      if (!decoded['sub'] || decoded['scope'].indexOf('refresh') !== -1) {
        return callback(null, false);
      } else {
        return callback(null, true);
      }
    }
  });
  
  server.auth.strategy('jwt-refresh', 'jwt', false,
  {
    key: options.key,
    verifyOptions: options.verifyOptions,
    validateFunc: function (decoded, request, callback) {
      if (!decoded['sub']) {
        return callback(null, false);
      } else {
        var User = UserModel.User;
        User.findOne({ _id: decoded.sub, active: true}, function(err, user) {
          if (err || !user || user.jti !== decoded.jti) {
            return callback(null, false);
          }
          return callback(null, true);
        });
      }
    }
  });
  // server.auth.default('jwt');
  next();
}

exports.register.attributes = {
    name: 'auth'
};
