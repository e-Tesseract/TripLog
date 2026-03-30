const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './triplog.db',
  logging: false
});

module.exports = sequelize;