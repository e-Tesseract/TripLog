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

// PUBLIC
router.post('/register', register);
router.post('/login', login);

// PROTECTED
router.get('/:id', authMiddleware, getUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);


module.exports = router;