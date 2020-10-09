const SpreadsheetRoutes = require('./routes/spreadsheet.routes');
const BlizzardRoutes = require('./routes/blizzard.routes');

module.exports = function (app) {
  app.use('/api/v1/spreadsheet', SpreadsheetRoutes);
  app.use('/api/v1/blizzard', BlizzardRoutes);
};
