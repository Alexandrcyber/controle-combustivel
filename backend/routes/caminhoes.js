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

// Rotas para caminhões
router.get('/', listarCaminhoes);
router.get('/ativos', listarCaminhoesAtivos);
router.get('/:id', buscarCaminhaoPorId);
router.post('/', criarCaminhao);
router.put('/:id', atualizarCaminhao);
router.delete('/:id', excluirCaminhao);

module.exports = router;
