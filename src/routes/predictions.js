const express = require('express');
const router = express.Router();
const PredictionService = require('../services/predictionService');

const predictionService = new PredictionService();

// GET /api/predictions/today - Predições para jogos de hoje
router.get('/today', async (req, res) => {
  try {
    const predictions = await predictionService.getTodayPredictions();
    
    res.json({
      success: true,
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter predições de hoje:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/predictions/live - Predições para jogos ao vivo
router.get('/live', async (req, res) => {
  try {
    const predictions = await predictionService.getLivePredictions();
    
    res.json({
      success: true,
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter predições ao vivo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/predictions/league/:leagueId/:season - Predições para uma liga específica
router.get('/league/:leagueId/:season', async (req, res) => {
  try {
    const { leagueId, season } = req.params;
    const predictions = await predictionService.getLeaguePredictions(leagueId, season);
    
    res.json({
      success: true,
      data: predictions,
      count: predictions.length,
      leagueId,
      season,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter predições da liga:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/predictions/fixture/:fixtureId - Predição para um jogo específico
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const prediction = await predictionService.getApiPredictions(fixtureId);
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Predição não encontrada',
        message: 'Não foi possível obter predições para este jogo'
      });
    }
    
    res.json({
      success: true,
      data: {
        fixture: {
          id: fixtureId,
          home: prediction.teams.home.name,
          away: prediction.teams.away.name,
          league: prediction.league.name
        },
        prediction: prediction.predictions,
        confidence: predictionService.calculateConfidence(prediction),
        recommendation: predictionService.generateRecommendation(prediction),
        riskLevel: predictionService.calculateRiskLevel(prediction),
        bestBets: predictionService.suggestBestBets(prediction)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter predição do jogo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/predictions/analysis/:fixtureId - Análise completa de um jogo
router.get('/analysis/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const analysis = await predictionService.getCompleteAnalysis(fixtureId);
    
    if (analysis.error) {
      return res.status(404).json({
        success: false,
        error: 'Análise não disponível',
        message: analysis.error
      });
    }
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter análise completa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// GET /api/predictions/stats - Estatísticas das predições
router.get('/stats', async (req, res) => {
  try {
    const todayPredictions = await predictionService.getTodayPredictions();
    const livePredictions = await predictionService.getLivePredictions();
    
    const stats = {
      today: {
        total: todayPredictions.length,
        highConfidence: todayPredictions.filter(p => p.confidence === 'alta').length,
        mediumConfidence: todayPredictions.filter(p => p.confidence === 'média').length,
        lowConfidence: todayPredictions.filter(p => p.confidence === 'baixa').length
      },
      live: {
        total: livePredictions.length,
        highConfidence: livePredictions.filter(p => p.confidence === 'alta').length,
        mediumConfidence: livePredictions.filter(p => p.confidence === 'média').length,
        lowConfidence: livePredictions.filter(p => p.confidence === 'baixa').length
      }
    };
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas das predições:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;
