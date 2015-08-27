var Confidence = require('confidence'),
    Config = require('./config')
    ;

var criteria = {
    env: process.env.NODE_ENV
};


var manifest = {
    $meta: 'This file defines the service.',
    server: {
        debug: {
            request: ['error']
        },
        connections: {
            routes: {
                security: true
            }
        }
    },
    connections: [{
        port: Config.get('/port')
    }],
    plugins: {
        'inert': {},
        'vision': {},
        'hapi-auth-jwt2': {},
        'hapi-swagger': Config.get('/swaggerOptions')
    }
};


var store = new Confidence.Store(manifest);


exports.get = function (key) {

    return store.get(key, criteria);
};


exports.meta = function (key) {

    return store.meta(key, criteria);
};
