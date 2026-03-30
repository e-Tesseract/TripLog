const { Step, Trip } = require('../models');
const axios = require('axios');


const getSteps = async (req, res) => {
  try {
    const steps = await Step.findAll({
      where: { tripId: req.params.id },
      order: [['arrivalDate', 'ASC']]  
    });

    res.json(steps);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


const createStep = async (req, res) => {
  try {
    const { city, notes, arrivalDate, departureDate } = req.body;

    if (!city || !arrivalDate) {
      return res.status(400).json({ 
        message: 'La ville et la date d\'arrivée sont obligatoires' 
      });
    }


    let latitude = null;
    let longitude = null;

    try {
      const nominatimResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'TripLog/1.0' } }
      );

      if (nominatimResponse.data.length > 0) {
        latitude = parseFloat(nominatimResponse.data[0].lat);
        longitude = parseFloat(nominatimResponse.data[0].lon);
      }
    } catch (err) {
      console.log('Nominatim non disponible:', err.message);
    }

   
    let weatherInfo = null;

    if (latitude && longitude) {
      try {
        const meteoResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );

        const weather = meteoResponse.data.current_weather;
        weatherInfo = `${weather.temperature}°C`;

      } catch (err) {
        console.log('Open-Meteo non disponible:', err.message);
      }
    }

    
    const step = await Step.create({
      city,
      notes,
      arrivalDate,
      departureDate,
      latitude,
      longitude,
      weatherInfo,
      tripId: req.params.id
    });

    res.status(201).json({ message: 'Étape ajoutée !', step });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


const updateStep = async (req, res) => {
  try {
    const step = await Step.findByPk(req.params.id);
    if (!step) {
      return res.status(404).json({ message: 'Étape introuvable' });
    }

    const { city, notes, arrivalDate, departureDate } = req.body;

    await step.update({
      city: city || step.city,
      notes: notes || step.notes,
      arrivalDate: arrivalDate || step.arrivalDate,
      departureDate: departureDate || step.departureDate
    });

    res.json({ message: 'Étape mise à jour !', step });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


const deleteStep = async (req, res) => {
  try {
    const step = await Step.findByPk(req.params.id);
    if (!step) {
      return res.status(404).json({ message: 'Étape introuvable' });
    }

    await step.destroy();
    res.json({ message: 'Étape supprimée !' });

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = { getSteps, createStep, updateStep, deleteStep };