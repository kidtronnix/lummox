var Confidence  = require('confidence'),
  Package       = require('../../package')
  ;

var criteria = {
    env: process.env.NODE_ENV
};


var config = {
    $meta: 'This file configures the service.',
    version: Package.version,
    port: {
        $filter: 'env',
        production: process.env.PORT,
        test: 9000,
        $default: 8000
    },
    server: {
        debug: {
          $filter: 'env',
          production: false,
          test: false,
          $default: { request: ['error'] }
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    api: {
      prefix: '/api',
      version: 'v1'
    },
    mongoUri: {
      $filter: 'env',
      production: process.env.MONGO_URI,
      test: 'mongodb://localhost:27017/lummox-test',
      $default: 'mongodb://localhost:27017/lummox'
    },
    jwt: {
      $filter: 'env',
      production: {
        key: process.env.JWT_SECRET,
        expiresInMinutes: 15,
        verifyOptions: { algorithms: [ 'HS256' ] }
      },
      $default: {
        key: 'NeverShareYourSecret',
        expiresInMinutes: 4*60,
        verifyOptions: { algorithms: [ 'HS256' ] }
      },
    },
    auth: {
      scopes: ['admin'],
      getAll: {
        strategy: 'jwt',
        scope: ['admin']
      },
      getOne: {
        strategy: 'jwt',
      },
      create: false,
      update: {
        strategy: 'jwt'
      },
      delete: {
        strategy: 'jwt'
      },
      getScopes: {
        strategy: 'jwt',
      }
    },
    saltRounds: 10,
    swaggerOptions: {
      apiVersion: Package.version,
      documentationPath: '/docs',
      endpoint: '/api/specs',
      info: {
        title: 'Lummox',
        description: 'A user service designed for SOA systems.'
      }
    }
};


var store = new Confidence.Store(config);


exports.get = function (key) {
    return store.get(key, criteria);
};


exports.meta = function (key) {
    return store.meta(key, criteria);
};
