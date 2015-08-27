var Composer = require('./index');
var Routes = require('./routes');


Composer(function (err, server) {
    if (err) {
        throw err;
    }

    server.route(Routes.endpoints);

    server.start(function () {
        console.log('Started the auth service:' + server.info.uri);
    });
});
