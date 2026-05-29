const { searchCities, getMeteo, getInfosPays } = require('../services/externalApi');

/**
 * Recherche les villes correspondant à un terme de recherche.
 * 
 * @param {Object} req - La requête HTTP, avec un paramètre de query "q" pour le terme de recherche.
 * @param {Object} res - La réponse HTTP, avec un tableau de villes correspondantes ou une erreur.
 */
const searchCity = async (req, res) => {
    // Au moins 2 caractères pour lancer la recherche
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Entrez au moins 2 caractères.' });
    }

    // Recherche les villes correspondant au terme de recherche
    const cities = await searchCities(query);
    res.json(cities);
};

/**
 * Récupère les informations météorologiques pour une ville donnée.
 * 
 * @param {Object} req - La requête HTTP, avec des paramètres de query "lat" et "lon" pour les coordonnées.
 * @param {Object} res - La réponse HTTP, avec les données météorologiques ou une erreur.
 */
const getCityMeteo = async (req, res) => {
    // Vérifie que les coordonnées sont fournies
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude et longitude requises.' });
    }

    // Récupère les informations météorologiques pour les coordonnées fournies
    const meteo = await getMeteo(parseFloat(lat), parseFloat(lon));
    if (!meteo) {
        return res.status(404).json({ error: 'Météo indisponible pour ces coordonnées.' });
    }

    res.json(meteo);
};

/**
 * Récupère les informations sur un pays donné.
 * 
 * @param {Object} req - La requête HTTP, avec un paramètre de query "codePays" pour le code du pays.
 * @param {Object} res - La réponse HTTP, avec les données du pays ou une erreur.
 */
const getCountryInfo = async (req, res) => {
    // Vérifie que le code pays est fourni
    const { codePays } = req.query;
    if (!codePays) {
        return res.status(400).json({ error: 'Code pays requis.' });
    }

    // Récupère les informations sur le pays correspondant au code fourni
    const infos = await getInfosPays(codePays.toUpperCase());
    if (!infos) {
        return res.status(404).json({ error: `Pays "${codePays}" introuvable.` });
    }

    res.json(infos);
};

// Exportation des fonctions
module.exports = {
    searchCity,
    getCityMeteo,
    getCountryInfo
};