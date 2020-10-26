const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const debug = require('./debug.controller')('tsm-controller');

function getTsmItemStats(itemId, region, realm) {
	return new Promise((resolve, reject) => {
		const now = moment();
		global.db.collection(`tsm-${realm}-${region}`).findOne({Id: itemId}).then((item) => {
			console.log(item)
			if (_.isNil(item)) {
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${region}/${realm}/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				axios(tsmApiRequestOptions).then((response) => {
					global.db.collection(`tsm-${realm}-${region}`).insertOne({
						...response.data,
						timestamp: now.valueOf()
					}).then((data) => {
						resolve(response.data);
					});
				});
			} else if (moment.duration(now.diff(moment(item.timestamp))).asHours() >= 1) {
				console.log(moment.duration(now.diff(moment(item.timestamp))).asHours())
				tsmApiRequestOptions = {
					url: `http://api.tradeskillmaster.com/v1/item/${region}/${realm}/${itemId}?format=json&apiKey=${process.env.TSM_KEY}`,
					method: 'GET'
				};

				resolve(axios(tsmApiRequestOptions).then((response) => {
					global.db.collection(`tsm-${realm}-${region}`).updateOne({Id: itemId}, {
						$set: {
							...response.data,
							timestamp: now.valueOf()
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