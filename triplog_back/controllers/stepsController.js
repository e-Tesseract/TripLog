const { Step, Trip } = require('../models');
const { getMeteo } = require('../services/externalApi');

// Vérifie que le trip appartient à l'utilisateur connecté
async function checkTripOwnership(tripId, userId) {
    return await Trip.findOne({ where: { id: tripId, userId } });
}

// Récupérer toutes les étapes d'un voyage
const getSteps = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const steps = await Step.findAll({
            where: { tripId: req.params.tripId },
            order: [['arrivalDate', 'ASC']]
        });
        res.json(steps);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer une étape spécifique d'un voyage
const getStepById = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });
        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        res.json(step);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

//  Créer une nouvelle étape pour un voyage
const createStep = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const { city, notes, arrivalDate, departureDate, latitude, longitude } = req.body;
        if (!city || !arrivalDate) {
            return res.status(400).json({ message: 'La ville et la date d\'arrivée sont obligatoires' });
        }
        
        let weatherInfo = null;
        if (latitude && longitude) {
            try {
                const meteo = await getMeteo(parseFloat(latitude), parseFloat(longitude));
                if (meteo && meteo.length > 0) {
                    const j = meteo[0];
                    weatherInfo = `${j.descriptionMeteo}, ${j.temperatureMin}°C–${j.temperatureMax}°C`;
                }
            } catch (e) {
                console.log('Météo indisponible:', e.message);
            }
        }

        const step = await Step.create({
            city, notes, arrivalDate, departureDate,
            latitude, longitude, weatherInfo,
            tripId: req.params.tripId
        });

        res.status(201).json({ message: 'Étape créée !', step });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Met à jour une étape d'un voyage
const updateStep = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });
        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        const { city, notes, arrivalDate, departureDate, latitude, longitude } = req.body;
        await step.update({
            city: city || step.city,
            notes: notes !== undefined ? notes : step.notes,
            arrivalDate: arrivalDate || step.arrivalDate,
            departureDate: departureDate !== undefined ? departureDate : step.departureDate,
            latitude: latitude !== undefined ? latitude : step.latitude,
            longitude: longitude !== undefined ? longitude : step.longitude,
        });
        
        res.json({ message: 'Étape mise à jour !', step });
    
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

// Supprime une étape d'un voyage
const deleteStep = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });
        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        await step.destroy();
        res.json({ message: 'Étape supprimée !' });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

module.exports = { getSteps, getStepById, createStep, updateStep, deleteStep };