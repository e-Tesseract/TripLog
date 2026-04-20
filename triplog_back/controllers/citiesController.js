const { searchCities, getMeteo, getInfosPays } = require('../services/externalApi');

const searchCity = async (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Entrez au moins 2 caractères.' });
    }

    const cities = await searchCities(query);
    res.json(cities);
};


const getCityMeteo = async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude et longitude requises.' });
    }

    const meteo = await getMeteo(parseFloat(lat), parseFloat(lon));
    if (!meteo) {
        return res.status(404).json({ error: 'Météo indisponible pour ces coordonnées.' });
    }

    res.json(meteo);
};

const getCountryInfo = async (req, res) => {
    const { nom } = req.query;
    if (!nom) {
        return res.status(400).json({ error: 'Nom du pays requis.' });
    }

    const infos = await getInfosPays(nom);
    if (!infos) {
        return res.status(404).json({ error: `Pays "${nom}" introuvable.` });
    }

    res.json(infos);
};

module.exports = {
    searchCity,
    getCityMeteo,
    getCountryInfo
};