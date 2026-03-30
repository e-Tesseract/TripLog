const { Trip, Step, User } = require('../models');
const axios = require('axios');

// ========================================
// ✅ GET /api/trips
// Récupérer tous mes voyages
// ========================================
const getTrips = async (req, res) => {
  try {
    
    const trips = await Trip.findAll({
      where: { userId: req.user.id },  // Seulement MES voyages
      include: [{
        model: Step,                    // Inclut les étapes de chaque voyage
        as: 'Steps'
      }],
      order: [['createdAt', 'DESC']]   // Les plus récents en premier
    });

    res.json(trips);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ GET /api/trips/:id
// Récupérer UN voyage par son ID
// ========================================
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id,      // L'ID dans l'URL ex: /api/trips/3
        userId: req.user.id     // Vérifier que c'est MON voyage
      },
      include: [{ model: Step, as: 'Steps' }]
    });

    // Si le voyage n'existe pas
    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    res.json(trip);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ POST /api/trips
// Créer un nouveau voyage
// ========================================
const createTrip = async (req, res) => {
  try {
    // On récupère les données envoyées par l'utilisateur
    const { title, destination, description, startDate, endDate } = req.body;

    // Vérification — le titre est obligatoire
    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire' });
    }

    // 🌍 Appel à RestCountries pour récupérer les infos du pays
    let countryFlag = null;
    let currency = null;
    let language = null;

    if (destination) {
      try {
        const response = await axios.get(
          `https://restcountries.com/v3.1/capital/${encodeURIComponent(destination)}`
        );

        if (response.data && response.data.length > 0) {
          const country = response.data[0];
          countryFlag = country.flag;  // Ex: 🇫🇷
          
          // Récupérer la première monnaie
          const currencies = Object.values(country.currencies || {});
          currency = currencies[0]?.name || null;  // Ex: "Euro"

          // Récupérer la première langue
          const languages = Object.values(country.languages || {});
          language = languages[0] || null;  // Ex: "French"
        }
      } catch (apiError) {
        // Si RestCountries échoue, on continue quand même
        console.log('RestCountries non disponible:', apiError.message);
      }
    }

    // Créer le voyage en base de données
    const trip = await Trip.create({
      title,
      destination,
      description,
      startDate,
      endDate,
      countryFlag,
      currency,
      language,
      userId: req.user.id   // Lié à l'utilisateur connecté
    });

    res.status(201).json({ 
      message: 'Voyage créé !', 
      trip 
    });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ========================================
// ✅ PUT /api/trips/:id
// Modifier un voyage
// ========================================
const updateTrip = async (req, res) => {
  try {
    // Chercher le voyage
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id   // Vérifier que c'est MON voyage
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    // Mettre à jour les champs
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

// ========================================
// ✅ DELETE /api/trips/:id
// Supprimer un voyage
// ========================================
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id   // Vérifier que c'est MON voyage
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    await trip.destroy();   // Supprime le voyage (et ses étapes grâce au CASCADE)
    res.json({ message: 'Voyage supprimé !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// On exporte toutes les fonctions
module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
