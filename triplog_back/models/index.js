const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const Trip = require('./Trip')(sequelize);
const Step = require('./Step')(sequelize);


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
