const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	region: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	lastUpdate: {
		type: Number,
		required: true
	},
	dataUpdateInProgress: {
		type: Boolean,
		default: true
	},
	id: {
		type: Number,
		required: true
	},
	newInstance: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('realmInfo', schema, 'realmInfos')
