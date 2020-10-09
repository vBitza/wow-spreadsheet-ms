// Instantiate .env file
require('dotenv').config();

// npm requires
const http  = require('http');
const debug = require('./controllers/debug.controller')('server');

// local requires
const dbController     = require('./controllers/db.controller');
const app              = require('./app.js');
const config           = require('./config');
const port             = process.env.PORT || config.port;

const server = http.Server(app);

debug('Starting server.');

// dbController.initConnection()
// .then(() => {
	dbController.getConnection();
  server.listen(port, function () {
    debug('Listening on port: %d', port);
  });
// })
// .catch(error => {
	// debug(error);
  // debug('App crashed on init');
// });

