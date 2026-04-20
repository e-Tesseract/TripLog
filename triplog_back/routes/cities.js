const express = require('express');

const {
    searchCity,
    getCityMeteo,
    getCountryInfo,
} = require('../controllers/citiesController');

const router = express.Router();

router.get('/search', searchCity);
router.get('/meteo', getCityMeteo);
router.get('/infos-pays', getCountryInfo);

module.exports = router;