const mongoose = require('mongoose')
	
const schema = new mongoose.Schema({
	item: {
		id: String
	},
	buyout: {
		type: Number
	},
	quantity: {
		type: Number
	},
	bid: {
		type: Number
	},
	buyout: {
		type: Number
	},
	unit_price: {
		type: Number
	}
});

module.exports = (name) => mongoose.model(name, schema, name)
