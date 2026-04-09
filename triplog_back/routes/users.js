const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', usersController.register);
router.post('/login', usersController.login);

router.get('/:id', authMiddleware, usersController.getById);
router.put('/:id', authMiddleware, usersController.update);
router.delete('/:id', authMiddleware, usersController.remove);

module.exports = router;