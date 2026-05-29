const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
    register,
    login,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/usersController');

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
 *         description: Compte créé avec succès
 *       400:
 *         description: Champs manquants
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', register);

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
 *         description: Champs manquants
 *       401:
 *         description: Identifiants invalides
 */
router.post('/login', login);

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
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:id', authMiddleware, getUser);

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
 *         description: Accès interdit
 *       404:
 *         description: Utilisateur introuvable
 */
router.put('/:id', authMiddleware, updateUser);

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
 *         description: Compte supprimé
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Utilisateur introuvable
 */
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;