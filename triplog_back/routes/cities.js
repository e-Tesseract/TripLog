const express = require('express');

const {
    searchCity,
    getCityMeteo,
    getCountryInfo,
} = require('../controllers/citiesController');

const router = express.Router();

/**
 * @swagger
 * /api/cities/search:
 *   get:
 *     summary: Rechercher une ville par nom
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de la ville (min 2 caractères)
 *     responses:
 *       200:
 *         description: Liste des villes trouvées
 *       400:
 *         description: Paramètre q invalide
 */
router.get('/search', searchCity);

/**
 * @swagger
 * /api/cities/meteo:
 *   get:
 *     summary: Récupérer la météo d'une ville par ses coordonnées
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *     responses:
 *       200:
 *         description: Prévisions météo sur 7 jours
 *       400:
 *         description: Latitude et longitude requises
 */
router.get('/meteo', getCityMeteo);

/**
 * @swagger
 * /api/cities/infos-pays:
 *   get:
 *     summary: Obtenir les informations d'un pays par son code
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: code pays
 *         required: true
 *         schema:
 *           type: string
 *         description: code
 *     responses:
 *       200:
 *         description: Informations du pays
 *       400:
 *         description: Code pays requis
 *       404:
 *         description: Pays introuvable
 */
router.get('/infos-pays', getCountryInfo);

module.exports = router;