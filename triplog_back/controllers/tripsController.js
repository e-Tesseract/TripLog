const { Trip, Step } = require('../models');


const getTrips = async (req, res) => {
  try {
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


const getTripById = async (req, res) => {
  try {
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

// POST /api/trips
const createTrip = async (req, res) => {
  try {
    const { title, destination, description, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Le titre est obligatoire' });
    }

    let countryFlag = null;
    let currency = null;
    let language = null;

    if (destination) {
      try {
        const url = `https://restcountries.com/v3.1/capital/${encodeURIComponent(destination)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const country = data[0];

          countryFlag = country.flag || null;

          const currencies = Object.values(country.currencies || {});
          currency = currencies[0]?.name || null;

          const languages = Object.values(country.languages || {});
          language = languages[0] || null;
        }
      } catch (apiError) {
        console.log('RestCountries non disponible:', apiError.message);
      }
    }

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

// DELETE /api/trips/:id
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Voyage introuvable' });
    }

    await trip.destroy();
    res.json({ message: 'Voyage supprimé !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
