const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

// REGISTER
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Créer un compte
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       201:
 *         description: Compte créé avec succès, token JWT retourné
 *       400:
 *         description: Tous les champs sont requis
 *       409:
 *         description: Email déjà utilisé
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérification des champs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email a déjà été utilisé
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

// LOGIN
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion et récupération du token JWT
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie, token JWT retourné
 *       400:
 *         description: Email et mot de passe requis
 *       401:
 *         description: Identifiants incorrects
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Recherche de l'utilisateur
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

// GET USER
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer son profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Token manquant
 *       404:
 *         description: Utilisateur non trouvé
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

// UPDATE USER
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier son profil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
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

// DELETE USER
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer son compte
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 */
const deleteUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur supprime son propre compte
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

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

module.exports = {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
};