const express = require('express');
const router = express.Router();
const {
    listarCaminhoes,
    buscarCaminhaoPorId,
    criarCaminhao,
    atualizarCaminhao,
    excluirCaminhao,
    listarCaminhoesAtivos
} = require('../controllers/caminhoesController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../controllers/authController');

// Rotas públicas (apenas visualização)
router.get('/', optionalAuth, listarCaminhoes);
router.get('/ativos', optionalAuth, listarCaminhoesAtivos);
router.get('/:id', optionalAuth, buscarCaminhaoPorId);

// Rotas protegidas (administrativas)
router.post('/', authenticateToken, requireAdmin, criarCaminhao);
router.put('/:id', authenticateToken, requireAdmin, atualizarCaminhao);
router.delete('/:id', authenticateToken, requireAdmin, excluirCaminhao);

module.exports = router;
