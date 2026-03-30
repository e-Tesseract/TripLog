const sequelize = require('../config/database');
const User = require('./User');
const Trip = require('./Trip');
const Step = require('./Step');


User.hasMany(Trip, { 
  foreignKey: 'userId',
  onDelete: 'CASCADE'     
});


Trip.belongsTo(User, { 
  foreignKey: 'userId' 
});


Trip.hasMany(Step, { 
  foreignKey: 'tripId',
  onDelete: 'CASCADE'
});


Step.belongsTo(Trip, { 
  foreignKey: 'tripId' 
});


module.exports = { 
  sequelize, 
  User, 
  Trip, 
  Step 
};
