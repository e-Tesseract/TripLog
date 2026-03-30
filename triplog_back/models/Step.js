const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const Step = sequelize.define('Step', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false          
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true          
  },
  arrivalDate: {
    type: DataTypes.DATE,
    allowNull: false         
  },
  departureDate: {
    type: DataTypes.DATE,
    allowNull: true           
  },

 
  latitude: {
    type: DataTypes.FLOAT,    
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,    
    allowNull: true
  },

 
  weatherInfo: {
    type: DataTypes.STRING,
    allowNull: true           
  },

  
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Trips',         
      key: 'id'
    }
  }
}, {
  timestamps: true,           
  tableName: 'Steps'
});

module.exports = Step;
