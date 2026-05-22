const { Step, Trip } = require('../models');
const { getMeteo } = require('../services/externalApi');

/**
 * Vérifie que le voyage appartient à l'utilisateur connecté.
 * 
 * @param {number} tripId - L'ID du voyage à vérifier.
 * @param {number} userId - L'ID de l'utilisateur connecté.
 * @returns {Promise<Trip|null>} - Le voyage si l'utilisateur en est le propriétaire, sinon null.
 */
async function checkTripOwnership(tripId, userId) {
    return await Trip.findOne({ where: { id: tripId, userId } }); // Vérifie que le voyage appartient à l'utilisateur connecté
}

/**
 * Récupère toutes les étapes d'un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec un paramètre de route "tripId" pour l'ID du voyage.
 * @param {Object} res - La réponse HTTP, avec un tableau d'étapes ou une erreur.
 * @returns {Promise<void>}
 */
const getSteps = async (req, res) => {
    try {
        // Vérifie que le voyage appartient à l'utilisateur connecté
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        // Récupère les étapes du voyage triées par date d'arrivée
        const steps = await Step.findAll({
            where: { tripId: req.params.tripId },
            order: [['arrivalDate', 'ASC']]
        });
        res.json(steps);

    } catch (error) {
        // En cas d'erreur, retourne une réponse 500 avec le message d'erreur
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Récupère une étape spécifique d'un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec des paramètres de route "tripId" et "stepId".
 * @param {Object} res - La réponse HTTP, avec les données de l'étape ou une erreur.
 * @returns {Promise<void>}
 */
const getStepById = async (req, res) => {
    try {
        // Vérifie que le voyage appartient à l'utilisateur connecté
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        // Récupère l'étape avec l'ID donné qui appartient au voyage
        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });

        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        res.json(step);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

/**
 * Crée une nouvelle étape pour un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec un paramètre de route "tripId" pour l'ID du voyage et un corps de requête contenant les données de l'étape.
 * @param {Object} res - La réponse HTTP, avec les données de la nouvelle étape ou une erreur.
 * @returns {Promise<void>}
 */
const createStep = async (req, res) => {
    try {
        // Vérifie que le voyage appartient à l'utilisateur connecté
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        // Valide les données d'entrée
        const { city, notes, arrivalDate, departureDate, latitude, longitude } = req.body;

        // La ville et la date d'arrivée sont obligatoires
        if (!city || !arrivalDate) {
            return res.status(400).json({ message: 'La ville et la date d\'arrivée sont obligatoires' });
        }
        
        // Si les coordonnées sont fournies, tente de récupérer les informations météorologiques pour les stocker avec l'étape
        let weatherInfo = null;
        if (latitude && longitude) {
            try {
                // Récupère les informations météorologiques pour les coordonnées fournies
                const meteo = await getMeteo(parseFloat(latitude), parseFloat(longitude));
                if (meteo && meteo.length > 0) {
                    const j = meteo[0];
                    weatherInfo = `${j.descriptionMeteo}, ${j.temperatureMin}°C–${j.temperatureMax}°C`;
                }
            } catch (e) {
                console.log('Météo indisponible:', e.message);
            }
        }

        // Crée l'étape avec les données fournies et les informations météorologiques si disponibles
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

/**
 * Met à jour une étape d'un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec des paramètres de route "tripId" et "stepId" pour les IDs du voyage et de l'étape, et un corps de requête contenant les données mises à jour.
 * @param {Object} res - La réponse HTTP, avec les données de l'étape mise à jour ou une erreur.
 * @returns {Promise<void>}
 */
const updateStep = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        // Récupère l'étape avec l'ID donné qui appartient au voyage
        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });
        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        // Met à jour les champs de l'étape avec les données fournies, en conservant les valeurs existantes si elles ne sont pas fournies
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

/**
 * Supprime une étape d'un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec des paramètres de route "tripId" et "stepId" pour les IDs du voyage et de l'étape.
 * @param {Object} res - La réponse HTTP, avec un message de confirmation ou une erreur.
 * @returns {Promise<void>}
 */
const deleteStep = async (req, res) => {
    try {
        const trip = await checkTripOwnership(req.params.tripId, req.user.id);
        if (!trip) return res.status(404).json({ message: 'Voyage introuvable' });

        const step = await Step.findOne({
            where: { id: req.params.stepId, tripId: req.params.tripId }
        });
        if (!step) return res.status(404).json({ message: 'Étape introuvable' });

        // Supprime l'étape et retourne un message de confirmation
        await step.destroy();
        res.json({ message: 'Étape supprimée !' });

    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};

module.exports = { getSteps, getStepById, createStep, updateStep, deleteStep };