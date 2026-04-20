require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
const usersRoutes = require('./routes/users');
const citiesRoutes = require('./routes/cities.js');
  
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Route test 
app.get('/', (req, res) => {
  res.json({
    message: 'API TripLog fonctionne',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
    },
  });
});

// Routes 
app.use('/api/users', usersRoutes);
app.use('/api/cities', citiesRoutes);

// 404 
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' non trouvée` });
});

// Gestion des erreurs globale 
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur :', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
  });
});

//Démarrage 
sequelize.sync()
  .then(() => {
    console.log('Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur de synchronisation BDD :', err);
    process.exit(1);
  });

module.exports = app;