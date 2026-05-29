const { sequelize } = require('../config/database');

// Importation des modèles
const User = require('./User')(sequelize);
const Trip = require('./Trip')(sequelize);
const Step = require('./Step')(sequelize);

// Définition des associations entre les modèles
User.hasMany(Trip, { foreignKey: 'userId', onDelete: 'CASCADE' });
Trip.belongsTo(User, { foreignKey: 'userId' });

Trip.hasMany(Step, { foreignKey: 'tripId', onDelete: 'CASCADE' });
Step.belongsTo(Trip, { foreignKey: 'tripId' });

module.exports = {
  sequelize,
  User,
  Trip,
  Step
};
