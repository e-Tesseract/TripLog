const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// On décrit la table "Trips"
const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false          // Le titre est obligatoire
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: true           // Optionnel
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true           // Optionnel
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false          // Date de début obligatoire
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true           // Date de fin optionnelle
  },

  // 🏳️ Ces champs seront remplis automatiquement par RestCountries
  countryFlag: {
    type: DataTypes.STRING,
    allowNull: true           // Ex: 🇫🇷
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true           // Ex: Euro
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true           // Ex: French
  },

  // 🔗 Lien vers l'utilisateur propriétaire du voyage
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',         // Fait référence à la table Users
      key: 'id'
    }
  }
}, {
  timestamps: true,           // Crée automatiquement createdAt
  tableName: 'Trips'
});

module.exports = Trip;