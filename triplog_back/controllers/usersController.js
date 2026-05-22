const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Enregistre un nouvel utilisateur.
 *
 * @param {Object} req - La requête HTTP, avec les données de l'utilisateur dans req.body.
 * @param {Object} res - La réponse HTTP, avec les données de l'utilisateur créé ou une erreur.
 * @returns {Promise<void>}
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérification des champs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email a déjà  été utilisé
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création utilisateur
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Génération token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de l\'inscription',
      details: err.message,
    });
  }
};


/**
 * Connecte un utilisateur.
 *
 * @param {Object} req - La requête HTTP, avec les données de connexion dans req.body.
 * @param {Object} res - La réponse HTTP, avec le token JWT et les données de l'utilisateur ou une erreur.
 * @returns {Promise<void>}
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Recherche de l' utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Génération token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la connexion',
      details: err.message,
    });
  }
};

/**
 * Récupère les informations d'un utilisateur.
 *
 * @param {Object} req - La requête HTTP, avec un paramètre de route "id" pour l'ID de l'utilisateur.
 * @param {Object} res - La réponse HTTP, avec les données de l'utilisateur ou une erreur.
 * @returns {Promise<void>}
 */
const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({
      error: 'Erreur serveur',
      details: err.message,
    });
  }
};

/**
 * Met à jour les informations d'un utilisateur.
 *
 * @param {Object} req - La requête HTTP, avec un paramètre de route "id" pour l'ID de l'utilisateur et les données de mise à jour dans req.body.
 * @param {Object} res - La réponse HTTP, avec les données de l'utilisateur mis à jour ou une erreur.
 * @returns {Promise<void>}
 */
const updateUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur modifie son propre compte
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const { username, email, password } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);

    res.json({
      message: 'Profil mis à jour',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la mise à jour',
      details: err.message,
    });
  }
};

/**
 * Supprime un utilisateur.
 *
 * @param {Object} req - La requête HTTP, avec un paramètre de route "id" pour l'ID de l'utilisateur.
 * @param {Object} res - La réponse HTTP, avec un message de confirmation ou une erreur.
 * @returns {Promise<void>}
 */
const deleteUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur supprime son propre compte
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Rechercher l'utilisateur et le supprimer
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    await user.destroy();

    res.json({ message: 'Compte supprimé avec succès' });

  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la suppression',
      details: err.message,
    });
  }
};

// Exportation des fonctions du contrôleur
module.exports = {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
};