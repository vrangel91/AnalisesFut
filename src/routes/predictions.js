const express = require('express');
const router = express.Router();
const PredictionService = require('../services/predictionService');
const cachedApiService = require('../services/cachedApiService');
const cacheService = require('../services/cacheService');

const predictionService = new PredictionService();

// GET /api/predictions/today - Predições para jogos de hoje
router.get('/today', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    if (!forceRefresh) {
      console.log('🔍 Verificando cache para predictions/today...');
      const cachedData = await cacheService.getCache('predictions', { type: 'today' });
      console.log('🔍 Resultado do cache:', cachedData ? 'encontrado' : 'não encontrado');
      
      if (cachedData) {
        console.log('📦 Retornando predições de hoje do cache');
        return res.json({
          success: true,
          data: cachedData.data || [],
          count: cachedData.data?.length || 0,
          timestamp: cachedData.timestamp,
          fromCache: true
        });
      } else {
        console.log('❌ Cache miss para predictions/today');
      }
    }

    console.log('🔄 Gerando predições de hoje (não encontradas no cache)');
    const predictions = await predictionService.getTodayPredictions();
    
    // Salvar no cache
    console.log('💾 Salvando predições no cache...');
    await cacheService.setCache('predictions', { type: 'today' }, {
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Predições salvas no cache');
    
    res.json({
      success: true,
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString(),
      fromCache: false
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
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    if (!forceRefresh) {
      const cachedData = await cacheService.getCache('predictions', { type: 'live' });
      
      if (cachedData) {
        console.log('📦 Retornando predições ao vivo do cache');
        return res.json({
          success: true,
          data: cachedData.data || [],
          count: cachedData.data?.length || 0,
          timestamp: cachedData.timestamp,
          fromCache: true
        });
      }
    }

    console.log('🔄 Gerando predições ao vivo (não encontradas no cache)');
    const predictions = await predictionService.getLivePredictions();
    
    // Salvar no cache
    await cacheService.setCache('predictions', { type: 'live' }, {
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: predictions || [],
      count: predictions?.length || 0,
      timestamp: new Date().toISOString(),
      fromCache: false
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

// POST /api/predictions/clear-cache - Limpar cache de previsões
router.post('/clear-cache', async (req, res) => {
  try {
    // Limpar cache de previsões (o cacheService não tem método delete, mas o TTL vai expirar automaticamente)
    console.log('🗑️ Cache de previsões será limpo automaticamente pelo TTL');
    
    res.json({
      success: true,
      message: 'Cache de previsões será limpo automaticamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao limpar cache de previsões:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;
