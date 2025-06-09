const express = require('express');
const router = express.Router();
const {
    listarAbastecimentos,
    buscarAbastecimentoPorId,
    criarAbastecimento,
    atualizarAbastecimento,
    excluirAbastecimento,
    relatorioConsumo,
    relatorioCustos
} = require('../controllers/abastecimentosController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../controllers/authController');

// Rotas públicas (apenas visualização)
router.get('/', optionalAuth, listarAbastecimentos);
router.get('/relatorio/consumo', optionalAuth, relatorioConsumo);
router.get('/relatorio/custos', optionalAuth, relatorioCustos);
router.get('/:id', optionalAuth, buscarAbastecimentoPorId);

// Rotas protegidas (administrativas)
router.post('/', authenticateToken, requireAdmin, criarAbastecimento);
router.put('/:id', authenticateToken, requireAdmin, atualizarAbastecimento);
router.delete('/:id', authenticateToken, requireAdmin, excluirAbastecimento);

module.exports = router;
