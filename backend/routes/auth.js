const express = require('express');
const router = express.Router();
const {
    login,
    logout,
    verifyToken,
    authenticateToken
} = require('../controllers/authController');

// Rota de login
router.post('/login', login);

// Rota de logout
router.post('/logout', logout);

// Rota para verificar token
router.get('/verify', verifyToken);

// Rota para verificar se o usuário está autenticado
router.get('/me', authenticateToken, (req, res) => {
    res.json({
        authenticated: true,
        user: {
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
