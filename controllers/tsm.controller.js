const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const debug = require('./debug.controller')('tsm-controller');

function getTsmItemStats(itemId, region, realm) {
	return new Promise((resolve, reject) => {
		const now = moment().valueOf();
		global.db.collection(`tsm-${realm}-${region}`).findOne({ItemId: itemId}).then((item) => {
			if (_.isNil(item)) {
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${region}/${realm}/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				axios(tsmApiRequestOptions).then((response) => {
					global.db.collection(`tsm-${realm}-${region}`).insertOne({
						...response.data,
						timestamp: now
					});

					resolve(response.data);
				});
			} else if (moment.duration(now.diff(moment(item.timestamp))) > 0) {
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${region}/${realm}/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				resolve(axios(tsmApiRequestOptions).then((response) => {
					global.db.collection(`tsm-${realm}-${region}`).updateOne({ItemId: itemId}, {
						$set: {
							...response.data,
							timestamp: now
						}
					});

					return response.data;
				}));
			} else {
				resolve(item);
			}
		});
	})
};

exports.getTsmItemStats = getTsmItemStats;