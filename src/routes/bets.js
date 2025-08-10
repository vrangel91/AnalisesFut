const express = require('express');
const router = express.Router();
const bettingService = require('../services/bettingService');

// GET /api/bets - Obter todas as apostas
router.get('/', async (req, res) => {
  try {
    const bets = await bettingService.getAllBets();
    res.json({
      success: true,
      data: bets,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bets/stats - Obter estatísticas de apostas
router.get('/stats', async (req, res) => {
  try {
    const [stats, marketStats] = await Promise.all([
      bettingService.getBettingStats(),
      bettingService.getMarketStats()
    ]);
    
    res.json({
      success: true,
      data: {
        stats,
        marketStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bets/status/:status - Obter apostas por status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const bets = await bettingService.getBetsByStatus(status);
    
    res.json({
      success: true,
      data: bets,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/bets/history - Obter histórico de apostas
router.get('/history', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const history = await bettingService.getBettingHistory(parseInt(limit));
    
    res.json({
      success: true,
      data: history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/bets - Adicionar nova aposta
router.post('/', async (req, res) => {
  try {
    const betData = req.body;
    const betId = await bettingService.addBet(betData);
    
    res.json({
      success: true,
      data: { id: betId },
      message: 'Aposta adicionada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/bets/:id/result - Atualizar resultado de uma aposta
router.put('/:id/result', async (req, res) => {
  try {
    const { id } = req.params;
    const { result, actualResult, profitLoss } = req.body;
    
    await bettingService.updateBetResult(id, result, actualResult, profitLoss);
    
    res.json({
      success: true,
      message: 'Resultado atualizado com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/bets/check-results - Verificar resultados pendentes
router.post('/check-results', async (req, res) => {
  try {
    await bettingService.checkPendingResults();
    
    res.json({
      success: true,
      message: 'Verificação de resultados concluída',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/bets/match-result - Salvar resultado de partida
router.post('/match-result', async (req, res) => {
  try {
    const resultData = req.body;
    const resultId = await bettingService.saveMatchResult(resultData);
    
    res.json({
      success: true,
      data: { id: resultId },
      message: 'Resultado salvo com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/bets/:id - Deletar aposta
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await bettingService.deleteBet(id);
    
    res.json({
      success: true,
      message: 'Aposta deletada com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
