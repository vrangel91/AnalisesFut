const express = require('express');
const router = express.Router();
const statisticsService = require('../services/statisticsService');
const cacheService = require('../services/cacheService');
const cornerAnalysisService = require('../services/cornerAnalysisService');

/**
 * @route   GET /api/statistics/fixture/:fixtureId
 * @desc    Obtém estatísticas completas de uma fixture
 * @access  Public
 */
router.get('/fixture/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half = 'false' } = req.query;
    
    // Verificar cache primeiro
    const cachedData = await cacheService.getCache('statistics:fixture', { fixtureId, half });
    
    if (cachedData) {
      console.log('📦 Retornando estatísticas do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🌐 Buscando estatísticas da fixture ${fixtureId} (half: ${half})`);
    
    const statistics = await statisticsService.getCompleteFixtureStatistics(
      parseInt(fixtureId), 
      half === 'true'
    );

    if (!statistics) {
      return res.status(404).json({
        success: false,
        error: 'Estatísticas não encontradas para esta fixture'
      });
    }

    // Salvar no cache
    await cacheService.setCache('statistics:fixture', { fixtureId, half }, statistics);

    res.json({
      success: true,
      data: statistics,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/statistics/corners/:fixtureId
 * @desc    Obtém estatísticas específicas de escanteios de uma fixture
 * @access  Public
 */
router.get('/corners/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { half = 'false' } = req.query;
    
    // Verificar cache primeiro
    const cachedData = await cacheService.getCache('statistics:corners', { fixtureId, half });
    
    if (cachedData) {
      console.log('📦 Retornando estatísticas de escanteios do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🌐 Buscando estatísticas de escanteios da fixture ${fixtureId} (half: ${half})`);
    
    const cornerStats = await statisticsService.getCornerKicksStatistics(
      parseInt(fixtureId), 
      half === 'true'
    );

    if (!cornerStats) {
      return res.status(404).json({
        success: false,
        error: 'Estatísticas de escanteios não encontradas para esta fixture'
      });
    }

    // Salvar no cache
    await cacheService.setCache('statistics:corners', { fixtureId, half }, cornerStats);

    res.json({
      success: true,
      data: cornerStats,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de escanteios:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/statistics/analysis/:fixtureId
 * @desc    Obtém análise de padrões de escanteios para Over/Under
 * @access  Public
 */
router.get('/analysis/:fixtureId', async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { historicalData = '[]' } = req.query;
    
    // Verificar cache primeiro
    const cachedData = await cacheService.getCache('statistics:analysis', { fixtureId, historicalData });
    
    if (cachedData) {
      console.log('📦 Retornando análise de escanteios do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Analisando padrões de escanteios da fixture ${fixtureId}`);
    
    let parsedHistoricalData = [];
    try {
      parsedHistoricalData = JSON.parse(historicalData);
    } catch (e) {
      console.log('⚠️ Dados históricos inválidos, usando array vazio');
    }
    
    const analysis = await cornerAnalysisService.analyzeCornerPatterns(
      parseInt(fixtureId), 
      parsedHistoricalData
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Análise de escanteios não disponível para esta fixture'
      });
    }

    // Salvar no cache
    await cacheService.setCache('statistics:analysis', { fixtureId, historicalData }, analysis);

    res.json({
      success: true,
      data: analysis,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao analisar padrões de escanteios:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/statistics/multiple
 * @desc    Obtém estatísticas de múltiplas fixtures
 * @access  Public
 */
router.get('/multiple', async (req, res) => {
  try {
    const { fixtureIds, half = 'false' } = req.query;
    
    if (!fixtureIds) {
      return res.status(400).json({
        success: false,
        error: 'IDs das fixtures são obrigatórios'
      });
    }

    const ids = fixtureIds.split(',').map(id => parseInt(id.trim()));
    
    // Verificar cache primeiro
    const cachedData = await cacheService.getCache('statistics:multiple', { fixtureIds, half });
    
    if (cachedData) {
      console.log('📦 Retornando estatísticas múltiplas do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🌐 Buscando estatísticas de ${ids.length} fixtures (half: ${half})`);
    
    const statistics = await statisticsService.getMultipleFixturesStatistics(
      ids, 
      half === 'true'
    );

    // Salvar no cache
    await cacheService.setCache('statistics:multiple', { fixtureIds, half }, statistics);

    res.json({
      success: true,
      data: statistics,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas múltiplas:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/statistics/health
 * @desc    Verifica a saúde do serviço de estatísticas
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço de estatísticas funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
