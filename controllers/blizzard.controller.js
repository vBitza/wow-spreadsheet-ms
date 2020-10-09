const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const async = require('async');
const debug = require('./debug.controller')('blizzard-controller');
const mongo = require('mongodb');
const config = require('../config');
var token = null;

let blizzard = require('blizzard.js').initialize({
  key: process.env.BNET_ID,
  secret: process.env.BNET_SECRET,
  origin: 'eu', // optional
  locale: 'en_EU', // optional
  token: '' // optional
});

function getAuctionHouseData(realmInfo) {
	axios.get(`https://eu.api.blizzard.com/data/wow/connected-realm/${realmInfo.id}/auctions?namespace=dynamic-eu&locale=en_EU&access_token=${blizzard.token}`).then((response) => {
		let auctionsMap = {}
		debug('Data retrieved');
		response.data.auctions = response.data.auctions.map((auction) => {
			let itemId = auction.item.id;

			return {
				...auction,
				itemId
			};
		});
		
		insertDataToMongo(response.data.auctions, realmInfo);
	}).catch((error) => {
		debug(error);
	});
};

async function insertDataToMongo(auctions, realmInfo) {
	mongo.MongoClient.connect(`mongodb://${ config.db.host }:${ config.db.port }/${ config.db.name }`, {
	  useUnifiedTopology: true,
    useNewUrlParser: true,
    poolSize: 50 // Only 1 operation can run at a time
  }).then(async(client) => {
		db = client.db('spreadsheet');
		debug('MongoDB second thread connected');
		debug(`Inserting Data for ${realmInfo.name}`);

		let collectionName = realmInfo.newInstance ? global.getCollectionName(realmInfo) : `${global.getCollectionName(realmInfo)}.tmp`;

		db.collection(`${collectionName}`).insertMany(auctions).then(() => {
			debug ('Data insertion finished');

			if (realmInfo.newInstance) {
				global.db.collection('realmInfos').updateOne(realmInfo, {
					$set: {
						dataUpdateInProgress: false,
						newInstance: false
					}
				});
			} else {
				global.db.collection('realmInfos').updateOne(realmInfo, {
					$set: {
						dataUpdateInProgress: true,
						newInstance: false
					}
				}).then(() => {
					let oldCollectionName = collectionName.split('.')[0];
					global.db.collection(oldCollectionName).drop().then(() => {
						global.db.collection(collectionName).rename(oldCollectionName).then(() => {
							global.db.collection('realmInfos').updateOne(realmInfo, {
								$set: {
									dataUpdateInProgress: false,
								}
							});
						});
					});
				});
			}
		});
	});
};


async function instantiateNewRealm(region, realmName) {
	getRealmIndex(realmName).then((realmId) => {
		let realm = {
			region,
			id: realmId,
			name: realmName,
			lastUpdate: moment().valueOf(),
			dataUpdateInProgress: true,
			newInstance: true
		};

		global.db.collection('realmInfos').insertOne(realm, (err, res) => {
			getAuctionHouseData(realm);
		});

		// let realm = new RealmInfo({
		// 	region,
		// 	id: realmId,
		// 	name: realmName,
		// 	lastUpdate: moment().valueOf(),
		// 	dataUpdateInProgress: true,
		// }).save().then((realm) => {
		// 	getAuctionHouseData(realm);
		// });
	});
};

function getToken() {
	blizzard.getApplicationToken().then((response) => {
	  blizzard.token = response.data.access_token;	
	
		setTimeout(() => {
			getToken();
		}, response.data.expires_in);
	}).catch((error) => {
		debug(error);
	});
};

function getRealmIndex(realmName) {
	return new Promise((resolve, reject) => {
		realmName = realmName.toLowerCase();

		axios.get(`https://eu.api.blizzard.com/data/wow/search/connected-realm?namespace=dynamic-eu&realms.name.en_US=${realmName}&access_token=${blizzard.token}`).then((response) => {		
			resolve(response.data.results[0].data.id);
		}).catch((error) => {
			debug(error);
		});
	});
};

function queueDataUpdate(realmInfo) {
	return new Promise(async(resolve, reject) => {
		let dataModel = Auction(global.getCollectionName(realmInfo));

		debug('Updating data');
		await dataModel.deleteMany({quantity: {$gte: 0}});
		debug('Data succesfully deleted');
		debug('Importing new data');

		resolve(getAuctionHouseData(realmInfo));
	});
	// dataModel.find({}).lean().then(async(oldAuctions) => {
	// 	await dataModel.deleteMany({$quantity: {$gte: 0}}).then((response) => {
	// 		console.log('test');
	// 	});

	// 	await getAuctionHouseData(realmInfo);
	// 	console.log(_.isArray(oldAuctions));



	// 	dataModel.deleteMany(oldAuctions).then(() => {
	// 		debug('Data succesfully updated');
	// 	});
	// });
};

exports.queueDataUpdate = queueDataUpdate;
exports.getAuctionHouseData = getAuctionHouseData;
exports.getToken = getToken;
exports.getRealmIndex = getRealmIndex;
exports.instantiateNewRealm = instantiateNewRealm;