const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TripLog API',
      version: '1.0.0',
      description: 'API pour gérer les voyages'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement'
      }
    ]
  },
  apis: ['./routes/*.js'] 
};

module.exports = swaggerJsdoc(options);