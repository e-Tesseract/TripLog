const express = require('express');
const router = express.Router();
const tripsController = require('../controllers/tripsController');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Voir tous mes voyages
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des voyages
 *       401:
 *         description: Token manquant
 */
router.get('/', auth, tripsController.getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Voir un voyage
 *     tags: [Trips]
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
 *         description: Voyage trouvé
 *       404:
 *         description: Voyage introuvable
 */
router.get('/:id', auth, tripsController.getTripById);

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Créer un voyage
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startDate]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Voyage au Japon
 *               destination:
 *                 type: string
 *                 example: Tokyo
 *               description:
 *                 type: string
 *                 example: Mon premier voyage en Asie
 *               startDate:
 *                 type: string
 *                 example: "2026-06-01"
 *               endDate:
 *                 type: string
 *                 example: "2026-06-15"
 *     responses:
 *       201:
 *         description: Voyage créé avec infos pays
 *       400:
 *         description: Titre obligatoire
 */
router.post('/', auth, tripsController.createTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Modifier un voyage
 *     tags: [Trips]
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
 *               title:
 *                 type: string
 *               destination:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voyage mis à jour
 *       404:
 *         description: Voyage introuvable
 */
router.put('/:id', auth, tripsController.updateTrip);

/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Supprimer un voyage
 *     tags: [Trips]
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
 *         description: Voyage supprimé
 *       404:
 *         description: Voyage introuvable
 */
router.delete('/:id', auth, tripsController.deleteTrip);

module.exports = router;