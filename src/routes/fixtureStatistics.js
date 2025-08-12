const express = require('express');
const router = express.Router();
const fixtureStatisticsService = require('../services/fixtureStatisticsService');

/**
 * @route   GET /api/fixture-statistics/:fixtureId
 * @desc    Obtém estatísticas completas de uma fixture específica
 * @access  Public
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team, type, refresh } = req.query;
    
    // Validar fixtureId
    if (!fixtureId || isNaN(parseInt(fixtureId))) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture inválido'
      });
    }

    console.log(`📊 Requisição de estatísticas completas para fixture ${fixtureId}`);
    
    // Preparar opções
    const options = {};
    if (half) options.half = half;
    if (team) options.team = team;
    if (type) options.type = type;
    if (refresh === 'true') {
      options.forceRefresh = true;
      console.log('🔄 Forçando refresh das estatísticas completas');
    }

    // Buscar estatísticas
    const result = await fixtureStatisticsService.getFixtureStats(parseInt(fixtureId), options);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
        fixtureId: parseInt(fixtureId)
      });
    }

    res.json({
      success: true,
      data: result.data,
      source: result.source,
      fixtureId: parseInt(fixtureId),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas completas da fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/fixture-statistics/refresh/:fixtureId
 * @desc    Força refresh das estatísticas completas de uma fixture
 * @access  Public
 */
router.post('/refresh/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team, type } = req.body;
    
    // Validar fixtureId
    if (!fixtureId || isNaN(parseInt(fixtureId))) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture inválido'
      });
    }

    console.log(`🔄 Forçando refresh das estatísticas completas para fixture ${fixtureId}`);
    
    // Preparar opções com forceRefresh = true
    const options = { forceRefresh: true };
    if (half) options.half = half;
    if (team) options.team = team;
    if (type) options.type = type;

    // Buscar estatísticas com refresh forçado
    const result = await fixtureStatisticsService.getFixtureStats(parseInt(fixtureId), options);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
        fixtureId: parseInt(fixtureId)
      });
    }

    res.json({
      success: true,
      data: result.data,
      source: result.source,
      fixtureId: parseInt(fixtureId),
      refreshed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao fazer refresh das estatísticas completas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/fixture-statistics/health
 * @desc    Verifica a saúde do serviço de estatísticas completas
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de Estatísticas Completas da Fixture funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
