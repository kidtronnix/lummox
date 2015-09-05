var Composer = require('./index');
var Routes = require('./routes');
var db = require('./config/db');

Composer(function (err, server) {
    if (err) {
        throw err;
    }

    server.route(Routes.endpoints);

      db.db.once('open', function callback() {
        console.log("Connection with database succeeded.");
        server.start(function () {
          console.log('Started the auth service:' + server.info.uri);
        });
      });
});
