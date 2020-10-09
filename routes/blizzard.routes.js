const express = require('express');
const router = express.Router();
const blizzardController = require('../controllers/blizzard.controller');

router.get('/getRealmIndex', blizzardController.getRealmIndex);

module.exports = router;
