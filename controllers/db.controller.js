const path     = require('path');
const mongo = require('mongodb');
const moment = require('moment');

const config = require('../config');
const debug  = require('./debug.controller')('db-controller');
const blizzardController = require('./blizzard.controller');

const retryTimeout = 5000;

function getConnection() {
	mongo.MongoClient.connect(process.env.MONGO, {
	  useUnifiedTopology: true,
	  useNewUrlParser: true,
	  poolSize: 50
	}).then((client) => {
		debug(`Mongo Client connected`);
		global.db = client.db('spreadsheet');

		setInterval(() => {
			console.log('test')
			let now = moment().format('h');
			console.log(now)
			global.db.collection('realmInfos').find({}).toArray().then((realms) => {
				console.log(realms);
				console.log('Checking realms');
				realms.map((realm) => {
					if (Math.abs(moment(realm.timestamp).format('h') - moment().format('h')) !== 0) {
						debug(`Queueing data update for ${realm.name}`);
						blizzardController.getAuctionHouseData(realm);
					}
				});
			})
		}, 3600000 );
	});
};


exports.getConnection = getConnection;
