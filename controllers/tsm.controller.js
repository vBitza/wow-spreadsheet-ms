const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const debug = require('./debug.controller')('tsm-controller');

function getTsmItemStats(itemId) {
	return new Promise((resolve, reject) => {
		const now = moment().valueOf();
		global.db.collection('tsmItemStats').findOne({ItemId: itemId}).then((item) => {
			debug(moment(item.timestamp).subtract(1, 'hours') < now)
			if (_.isNil(item)) {
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				axios(tsmApiRequestOptions).then((response) => {
					global.db.collection('tsmItemStats').insertOne({
						...response.data,
						timestamp: now
					});

					resolve(response.data);
				});
			} else if (moment(now).subtract(1, 'hours') < item.timestamp) {
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				axios(tsmApiRequestOptions).then((response) => {
					global.db.collection('tsmItemStats').updateOne({ItemId: itemId}, {
						$set: {
							...response.data,
							timestamp: now
						}
					});

					resolve(response.data);
				});
			} else {
				resolve(item);
			}
		});
	})
};

exports.getTsmItemStats = getTsmItemStats;