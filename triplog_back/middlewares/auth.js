const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification pour protéger les routes nécessitant une authentification.
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * 
 * @param {Object} req - La requête HTTP, avec un en-tête Authorization contenant le token JWT.
 * @param {Object} res - La réponse HTTP, avec une erreur 401
 * @returns {void}
 * @throws {Object} Erreur 401 si le token est manquant, mal formaté, invalide ou expiré.
 * 
 */
const authMiddleware = (req, res, next) => {

  // Récupérer le token JWT depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;

  // Vérifier présence et format Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou mal formaté' });
  }

  // Extraire le token du format "Bearer
  const token = authHeader.split(' ')[1];

  try {
    // Vérifier la validité du token et extraire les données utilisateur
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;