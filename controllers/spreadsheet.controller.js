const _ = require('lodash');
const moment = require('moment');
const async = require('async');
const debug = require('./debug.controller')('spreadsheet-controller');
const blizzardController = require('./blizzard.controller');
const tsmController = require('./tsm.controller');

const {
	jsonResponse, 
	errorResponse, 
	succesResponse
} = require('./response.controller');

async function getItemData(req, res) {
	const data = {
		id: parseInt(req.query.itemId),
		region: req.query.region, 
		realm: req.query.realm, 
		source: req.query.source, 
		customPrice: req.query.customPrice
	};

	if (_.filter(data, (item) => _.isNil(item)).length !== 0) {
		return errorResponse(res, 'Missing input parameters');
	};

	if (data.source === 'tsm') {
		jsonResponse(res, item);
	} else {
		let realmInfo = await global.db.collection('realmInfos').findOne({
			region: data.region,
			name: data.realm
		}).then((realm) => realm);

		if (_.isNil(realmInfo)) {
			dataUpdateInProgress = true;
			blizzardController.instantiateNewRealm(data.region, data.realm);

			let RealmInfo = {
				dataUpdateInProgress: true,
				newInstance: true
			};

			return jsonResponse(res, {RealmInfo});
		} else {
			if (realmInfo.newInstance && realmInfo.dataUpdateInProgress) {
				return jsonResponse(res, realmInfo);
			}	else if (realmInfo.dataUpdateInProgress) {
				debug('Update in progress.');
				setTimeout(() => {
					getItemData(req, res);
				}, 5000);
			} else {
				let tsmItemData = await tsmController.getTsmItemStats(data.id);

				global.db.collection(global.getCollectionName(realmInfo)).find({itemId: data.id}).toArray().then((auctions) => {
					let ahPrices = auctions.map((auction) => auction.buyout ? auction.buyout : (auction.unit_price ? auction.unit_price : auction.bid));

					

					jsonResponse(res, {...tsmItemData, ahMinBuyout: _.min(ahPrices)});
				}).catch((error) => {
					console.log(error);
				});
			}
		}
	}
};


exports.getItemData = getItemData;