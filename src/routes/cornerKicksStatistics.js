const express = require('express');
const router = express.Router();
const cornerKicksStatisticsService = require('../services/cornerKicksStatisticsService');

/**
 * @route   GET /api/corner-kicks-statistics/:fixtureId
 * @desc    Obtém estatísticas específicas de corner kicks de uma fixture
 * @access  Public
 */
router.get('/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team, refresh } = req.query;
    
    // Validar fixtureId
    if (!fixtureId || isNaN(parseInt(fixtureId))) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture inválido'
      });
    }

    console.log(`📊 Requisição de estatísticas de corner kicks para fixture ${fixtureId}`);
    
    // Preparar opções
    const options = {};
    if (half) options.half = half;
    if (team) options.team = team;
    if (refresh === 'true') {
      options.forceRefresh = true;
      console.log('🔄 Forçando refresh das estatísticas de corner kicks');
    }

    // Buscar estatísticas de corner kicks
    const result = await cornerKicksStatisticsService.getCornerKicksStats(parseInt(fixtureId), options);

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
    console.error('❌ Erro ao buscar estatísticas de corner kicks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/corner-kicks-statistics/refresh/:fixtureId
 * @desc    Força refresh das estatísticas de corner kicks de uma fixture
 * @access  Public
 */
router.post('/refresh/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team } = req.body;
    
    // Validar fixtureId
    if (!fixtureId || isNaN(parseInt(fixtureId))) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture inválido'
      });
    }

    console.log(`🔄 Forçando refresh das estatísticas de corner kicks para fixture ${fixtureId}`);
    
    // Preparar opções com forceRefresh = true
    const options = { forceRefresh: true };
    if (half) options.half = half;
    if (team) options.team = team;

    // Buscar estatísticas com refresh forçado
    const result = await cornerKicksStatisticsService.getCornerKicksStats(parseInt(fixtureId), options);

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
    console.error('❌ Erro ao fazer refresh das estatísticas de corner kicks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/corner-kicks-statistics/analysis/:fixtureId
 * @desc    Obtém análise detalhada de padrões de corner kicks
 * @access  Public
 */
router.get('/analysis/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half, team, refresh } = req.query;
    
    // Validar fixtureId
    if (!fixtureId || isNaN(parseInt(fixtureId))) {
      return res.status(400).json({
        success: false,
        error: 'ID da fixture inválido'
      });
    }

    console.log(`🔍 Requisição de análise de corner kicks para fixture ${fixtureId}`);
    
    // Preparar opções
    const options = {};
    if (half) options.half = half;
    if (team) options.team = team;
    if (refresh === 'true') {
      options.forceRefresh = true;
      console.log('🔄 Forçando refresh da análise de corner kicks');
    }

    // Buscar estatísticas de corner kicks
    const result = await cornerKicksStatisticsService.getCornerKicksStats(parseInt(fixtureId), options);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
        fixtureId: parseInt(fixtureId)
      });
    }

    // Extrair apenas a análise
    const analysis = {
      fixture: result.data.fixture,
      cornerKicks: result.data.cornerKicks,
      analysis: result.data.analysis,
      timestamp: result.data.timestamp
    };

    res.json({
      success: true,
      data: analysis,
      source: result.source,
      fixtureId: parseInt(fixtureId),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar análise de corner kicks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/corner-kicks-statistics/health
 * @desc    Verifica a saúde do serviço de estatísticas de corner kicks
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de Estatísticas de Corner Kicks funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
