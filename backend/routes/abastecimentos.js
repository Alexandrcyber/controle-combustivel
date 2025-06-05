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

// Rotas para abastecimentos
router.get('/', listarAbastecimentos);
router.get('/relatorio/consumo', relatorioConsumo);
router.get('/relatorio/custos', relatorioCustos);
router.get('/:id', buscarAbastecimentoPorId);
router.post('/', criarAbastecimento);
router.put('/:id', atualizarAbastecimento);
router.delete('/:id', excluirAbastecimento);

module.exports = router;
