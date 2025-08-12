const express = require('express');
const router = express.Router();
const predictionsService = require('../services/predictionsService');
const axios = require('axios');
const cacheService = require('../services/cacheService');

/**
 * @route   GET /api/predictions/:fixtureId
 * @desc    Obtém predições para uma fixture específica
 * @access  Public
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { refresh } = req.query;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const forceRefresh = refresh === 'true';
    const result = await predictionsService.getFixturePredictions(parseInt(fixtureId), forceRefresh);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao buscar predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/predictions/refresh/:fixtureId
 * @desc    Força atualização das predições para uma fixture
 * @access  Public
 */
router.post('/refresh/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    console.log(`🔄 Forçando atualização das predições para fixture ${fixtureId}`);
    
    const result = await predictionsService.getFixturePredictions(parseInt(fixtureId), true);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('❌ Erro ao atualizar predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/predictions/multiple
 * @desc    Obtém predições para múltiplas fixtures
 * @access  Public
 */
router.post('/multiple', async (req, res) => {
  try {
    const { fixtureIds } = req.body;
    
    if (!fixtureIds || !Array.isArray(fixtureIds) || fixtureIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Array de IDs das fixtures é obrigatório'
      });
    }

    if (fixtureIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Máximo de 10 fixtures por requisição'
      });
    }

    console.log(`🔮 Buscando predições para ${fixtureIds.length} fixtures`);
    
    const results = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições múltiplas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/predictions/cache/:fixtureId
 * @desc    Limpa cache de predições para uma fixture
 * @access  Public
 */
router.delete('/cache/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    
    if (!fixtureId) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture é obrigatório'
      });
    }

    const success = await predictionsService.clearPredictionCache(parseInt(fixtureId));

    if (success) {
      res.json({
        success: true,
        message: `Cache de predições limpo para fixture ${fixtureId}`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao limpar cache'
      });
    }

  } catch (error) {
    console.error('❌ Erro ao limpar cache de predições:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/predictions/health
 * @desc    Verifica a saúde do serviço de predições
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de predições funcionando',
    timestamp: new Date().toISOString()
  });
});

// ===== ROTAS ANTIGAS PARA COMPATIBILIDADE =====

/**
 * @route   GET /api/predictions/today
 * @desc    Obtém predições para jogos de hoje (compatibilidade)
 * @access  Public
 */
router.get('/today', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Buscar fixtures de hoje
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'NS-LIVE-FT'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      return res.json({
        success: true,
        data: [],
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    res.json({
      success: true,
      data: Object.values(predictions).filter(p => p.success).map(p => p.data),
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições de hoje:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições de hoje',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/predictions/live
 * @desc    Obtém predições para jogos ao vivo (compatibilidade)
 * @access  Public
 */
router.get('/live', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Buscar fixtures ao vivo
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        status: 'LIVE'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      return res.json({
        success: true,
        data: [],
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures ao vivo
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    res.json({
      success: true,
      data: Object.values(predictions).filter(p => p.success).map(p => p.data),
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições ao vivo:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições ao vivo',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/predictions/finished
 * @desc    Obtém predições para jogos finalizados (compatibilidade)
 * @access  Public
 */
router.get('/finished', async (req, res) => {
  try {
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true';
    
    // Buscar fixtures finalizadas hoje
    const fixturesResponse = await axios.get(`${process.env.API_SPORTS_BASE_URL || 'https://v3.football.api-sports.io'}/fixtures`, {
      params: { 
        date: new Date().toISOString().split('T')[0],
        status: 'FT'
      },
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.API_SPORTS_KEY
      }
    });

    if (!fixturesResponse.data.response || fixturesResponse.data.response.length === 0) {
      return res.json({
        success: true,
        data: [],
        fromCache: false,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar predições para as primeiras 5 fixtures finalizadas
    const fixtureIds = fixturesResponse.data.response.slice(0, 5).map(f => f.fixture.id);
    const predictions = await predictionsService.getMultipleFixturePredictions(fixtureIds);

    res.json({
      success: true,
      data: Object.values(predictions).filter(p => p.success).map(p => p.data),
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar predições finalizadas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar predições finalizadas',
      details: error.message
    });
  }
});

module.exports = router;
