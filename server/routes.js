var User      = require('./controllers/user'),
  Token = require('./controllers/token'),
  Static    = require('./controllers/static'),
  Config = require('./config/config');

var prefix = Config.get('/api/prefix') +'/'+ Config.get('/api/version');

exports.endpoints = [
  { method: 'GET',    path: '/{somethingss*}',  config: Static.get },
  { method: 'POST',   path: prefix +'/users',           config: User.create },
  { method: 'GET',    path: prefix +'/users',           config: User.getAll },
  { method: 'GET',    path: prefix +'/users/scopes',    config: User.getScopes },
  { method: 'GET',    path: prefix +'/users/{userId}',  config: User.getOne },
  { method: 'PUT',    path: prefix +'/users/{userId}',  config: User.update },
  { method: 'DELETE', path: prefix +'/users/{userId}',  config: User.delete },
  { method: 'POST',   path: prefix +'/tokens/refresh',  config: Token.refresh },
  { method: 'POST',   path: prefix +'/tokens/access',   config: Token.access },
];
