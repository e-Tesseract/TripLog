const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const tripsController = require('../controllers/tripsController');

router.get('/', auth, tripsController.getTrips);
router.get('/:id', auth, tripsController.getTripById);
router.post('/', auth, tripsController.createTrip);
router.put('/:id', auth, tripsController.updateTrip);
router.delete('/:id', auth, tripsController.deleteTrip);

module.exports = router;