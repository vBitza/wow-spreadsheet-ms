const express = require('express');
const router = express.Router();
const spreadsheetController = require('../controllers/spreadsheet.controller');

/**
  * @swagger
  * /getItem:
  *   get:
  *     description: Get informations about an item
  *     tags: [Items]
  *     produces:
  *       - application/json
  *     parameters:
  *       - name: id
  *         description: The id of the item
  *         in: query
  *         type: string
  *       - name: region
  *         description: The Region of the Server (Currently only supporting eu)
  *         in: query
  *         type: string  
  *       - name: realm
  *         description: The Realm name 
  *         in: query
  *         type: string
  *     responses:
  *       200:
  *         description: Returns information about an item
  *         schema:
  *           type: object
  */
router.get('/getItem', spreadsheetController.getItemData);

module.exports = router;
