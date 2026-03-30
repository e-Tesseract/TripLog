require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const app = express();


app.use(express.json());


const tripsRoutes = require('./routes/trips');
app.use('/api/trips', tripsRoutes);


const PORT = process.env.PORT || 3000;


sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de données synchronisée');
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Erreur base de données:', err);
  });