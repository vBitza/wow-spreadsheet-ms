const express = require('express');
const router = express.Router();
const spreadsheetController = require('../controllers/spreadsheet.controller');

router.get('/getItem', spreadsheetController.getItemData);

module.exports = router;
