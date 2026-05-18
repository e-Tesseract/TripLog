const express = require('express');
const router = express.Router({ mergeParams: true });
const stepsController = require('../controllers/stepsController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/trips/{tripId}/steps:
 *   get:
 *     summary: Récupérer toutes les étapes d'un voyage
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du voyage
 *     responses:
 *       200:
 *         description: Liste des étapes
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Voyage introuvable
 */
router.get('/', auth, stepsController.getSteps);

/**
 * @swagger
 * /api/trips/{tripId}/steps/{stepId}:
 *   get:
 *     summary: Récupérer une étape spécifique d'un voyage
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du voyage
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'étape
 *     responses:
 *       200:
 *         description: Étape trouvée
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Voyage ou étape introuvable
 */
router.get('/:stepId', auth, stepsController.getStepById);

/**
 * @swagger
 * /api/trips/{tripId}/steps:
 *   post:
 *     summary: Créer une nouvelle étape pour un voyage
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du voyage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *               - arrivalDate
 *             properties:
 *               city:
 *                 type: string
 *               notes:
 *                 type: string
 *               arrivalDate:
 *                 type: string
 *                 format: date
 *               departureDate:
 *                 type: string
 *                 format: date
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Étape créée
 *       400:
 *         description: Données manquantes ou invalides
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Voyage introuvable
 */
router.post('/', auth, stepsController.createStep);

/**
 * @swagger
 * /api/trips/{tripId}/steps/{stepId}:
 *   put:
 *     summary: Mettre à jour une étape
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du voyage
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'étape
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               city:
 *                 type: string
 *               notes:
 *                 type: string
 *               arrivalDate:
 *                 type: string
 *                 format: date
 *               departureDate:
 *                 type: string
 *                 format: date
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Étape mise à jour
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Voyage ou étape introuvable
 */
router.put('/:stepId', auth, stepsController.updateStep);

/**
 * @swagger
 * /api/trips/{tripId}/steps/{stepId}:
 *   delete:
 *     summary: Supprimer une étape d'un voyage
 *     tags: [Steps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du voyage
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'étape
 *     responses:
 *       200:
 *         description: Étape supprimée
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Voyage ou étape introuvable
 */
router.delete('/:stepId', auth, stepsController.deleteStep);

module.exports = router;