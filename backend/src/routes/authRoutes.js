const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator, profileUpdateValidator } = require('../validators/authValidator');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, profileUpdateValidator, validate, authController.updateProfile);

module.exports = router;
