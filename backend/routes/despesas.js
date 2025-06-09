const express = require('express');
const router = express.Router();
const {
    listarDespesas,
    buscarDespesaPorId,
    criarDespesa,
    atualizarDespesa,
    excluirDespesa,
    relatorioPorCategoria,
    relatorioPorPeriodo
} = require('../controllers/despesasController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../controllers/authController');

// Rotas públicas (apenas visualização)
router.get('/', optionalAuth, listarDespesas);
router.get('/relatorio/categoria', optionalAuth, relatorioPorCategoria);
router.get('/relatorio/periodo', optionalAuth, relatorioPorPeriodo);
router.get('/:id', optionalAuth, buscarDespesaPorId);

// Rotas protegidas (administrativas)
router.post('/', authenticateToken, requireAdmin, criarDespesa);
router.put('/:id', authenticateToken, requireAdmin, atualizarDespesa);
router.delete('/:id', authenticateToken, requireAdmin, excluirDespesa);

module.exports = router;
