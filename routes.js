const SpreadsheetRoutes = require('./routes/spreadsheet.routes');
const BlizzardRoutes = require('./routes/blizzard.routes');

module.exports = function (app) {
	app.use('/alive', (req, res) => {
		console.log('keep-alive');
		res.send(200);
	});
	
  app.get('/', (req, res) => {
    res.sendFile(`${ __dirname }/swagger/index.html`);
  });

  app.use('/api/v1/spreadsheet', SpreadsheetRoutes);
  app.use('/api/v1/blizzard', BlizzardRoutes);
};
