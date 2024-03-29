const path     = require('path');
const mongo = require('mongodb');
const moment = require('moment');

const config = require('../config');
const debug  = require('./debug.controller')('db-controller');
const blizzardController = require('./blizzard.controller');

const retryTimeout = 5000;

function getConnection() {
	let localDbUrl = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;

	mongo.MongoClient.connect(process.env.MONGO, {
	  useUnifiedTopology: true,
	  useNewUrlParser: true,
	  poolSize: 50
	}).then((client) => {
		debug(`Mongo Client connected`);
		global.db = client.db('spreadsheet');

		setInterval(() => {
			let now = moment();

			global.db.collection('realmInfos').find({}).toArray().then((realms) => {
				realms.map((realm) => {
					if (moment.duration(now.diff(moment(realm.timestamp))).asHours() >= 1) {
						debug(`Queueing data update for ${realm.name}`);
						blizzardController.getAuctionHouseData(realm);
					}
				});
			})
		}, 3600000 );
	});
};


exports.getConnection = getConnection;
