const { Trip, Step } = require('../models');

/**
 * Récupère tous les voyages de l'utilisateur connecté, avec leurs étapes associées.
 * 
 * @param {Object} req - La requête HTTP, avec l'utilisateur connecté dans req.user.
 * @param {Object} res - La réponse HTTP, avec un tableau de voyages ou une erreur.
 * @returns {Promise<void>}
 */
const getTrips = async (req, res) => {
  try {
    // Récupère tous les voyages de l'utilisateur connecté avec leurs étapes associées, triés par date de création décroissante
    const trips = await Trip.findAll({
      where: { userId: req.user.id },
      include: [{ model: Step }],
      order: [['createdAt', 'DESC']]
    });
    res.json(trips);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Récupère un voyage spécifique, avec ses étapes associées.
 *
 * @param {Object} req - La requête HTTP, avec un paramètre de route "id" pour l'ID du voyage et l'utilisateur connecté dans req.user.
 * @param {Object} res - La réponse HTTP, avec les données du voyage ou une erreur.
 * @returns {Promise<void>}
 */
const getTripById = async (req, res) => {
  try {
    // Récupère le voyage avec l'ID donné avec ses étapes associées
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Step }]
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    res.json(trip);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Crée un nouveau voyage.
 *
 * @param {Object} req - La requête HTTP, avec les données du voyage dans req.body et l'utilisateur connecté dans req.user.
 * @param {Object} res - La réponse HTTP, avec les données du voyage créé ou une erreur.
 * @returns {Promise<void>}
 */
const createTrip = async (req, res) => {
  try {
    const { title, destination, description, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire' });
    }

    let countryFlag = null;
    let currency = null;
    let language = null;

    // Si une destination est fournie, tente de récupérer les informations du pays correspondant pour enrichir le voyage
    if (destination) {
      try {

        // Utilise l'API RestCountries pour récupérer les informations du pays correspondant à la destination
        const endpoints = [
          `https://restcountries.com/v3.1/name/${encodeURIComponent(destination)}?fullText=true`,
          `https://restcountries.com/v3.1/name/${encodeURIComponent(destination)}`,
          `https://restcountries.com/v3.1/capital/${encodeURIComponent(destination)}`,
        ];

        // Tente les différentes requêtes jusqu'à en obtenir une qui fonctionne et retourne des données valides
        for (const url of endpoints) {
          const response = await fetch(url);
          if (!response.ok) continue;

          // Si la réponse est valide, parse les données et extrait les informations du pays
          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) continue;

          // Prend le premier résultat retourné par l'API, qui correspond généralement au pays recherché
          const country = data[0];

          // Extrait le drapeau, la monnaie et la langue du pays, en utilisant des valeurs par défaut si les données ne sont pas disponibles
          countryFlag = country.flags?.emoji ?? null;
          currency = Object.values(country.currencies ?? {})[0]?.name ?? null;
          language = Object.values(country.languages ?? {})[0] ?? null;
          break; 
        }
      } catch (apiError) {
        console.log('RestCountries non disponible:', apiError.message);
      }
    }

    // Crée le voyage avec les données fournies et les informations du pays 
    const trip = await Trip.create({
      title,
      destination,
      description,
      startDate,
      endDate,
      countryFlag,
      currency,
      language,
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Voyage créé !',
      trip
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Met à jour un voyage.
 *
 * @param {Object} req - La requête HTTP, avec les données du voyage dans req.body et l'utilisateur connecté dans req.user.
 * @param {Object} res - La réponse HTTP, avec les données du voyage mis à jour ou une erreur.
 * @returns {Promise<void>}
 */
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    const { title, destination, description, startDate, endDate } = req.body;

    await trip.update({
      title: title || trip.title,
      destination: destination || trip.destination,
      description: description || trip.description,
      startDate: startDate || trip.startDate,
      endDate: endDate || trip.endDate
    });

    res.json({ message: 'Voyage mis à jour !', trip });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Supprime un voyage.
 * 
 * @param {Object} req - La requête HTTP, avec un paramètre de route "id" pour l'ID du voyage et l'utilisateur connecté dans req.user.
 * @param {Object} res - La réponse HTTP, avec un message de confirmation ou une erreur.
 * @returns {Promise<void>}
 */
const deleteTrip = async (req, res) => {
  try {
    // Récupère le voyage avec l'ID donné et vérifie que son userId correspond à celui de l'utilisateur connecté
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    // Supprime le voyage et retourne un message de confirmation
    await trip.destroy();
    res.json({ message: 'Voyage supprimé !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Exportation des fonctions du contrôleur
module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
