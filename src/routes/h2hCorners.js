const express = require('express');
const router = express.Router();
const h2hCornerAnalysisService = require('../services/h2hCornerAnalysisService');
const cacheService = require('../services/cacheService');

/**
 * @route   GET /api/h2h-corners/:team1Id/:team2Id
 * @desc    Obtém análise H2H de corner kicks entre dois times
 * @access  Public
 */
router.get('/:team1Id/:team2Id', async (req, res) => {
  try {
    const { team1Id, team2Id } = req.params;
    const { last = '10', season, league, from, to } = req.query;
    
    // Verificar cache primeiro
    const cacheKey = `h2h-corners:${team1Id}:${team2Id}:${last}:${season || 'current'}`;
    const cachedData = await cacheService.getCache('h2h-corners', { team1Id, team2Id, last, season });
    
    if (cachedData) {
      console.log('📦 Retornando análise H2H de corner kicks do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Analisando H2H de corner kicks: ${team1Id} vs ${team2Id}`);
    
    const options = {
      last: parseInt(last),
      season: season ? parseInt(season) : new Date().getFullYear()
    };
    
    if (league) options.league = parseInt(league);
    if (from) options.from = from;
    if (to) options.to = to;
    
    const analysis = await h2hCornerAnalysisService.getH2HCornerData(
      parseInt(team1Id), 
      parseInt(team2Id), 
      options
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Análise H2H de corner kicks não disponível para estes times'
      });
    }

    // Salvar no cache por 1 hora (dados H2H mudam pouco)
    await cacheService.setCache('h2h-corners', { team1Id, team2Id, last, season }, analysis);

    res.json({
      success: true,
      data: analysis,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao analisar H2H de corner kicks:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/h2h-corners/fixture
 * @desc    Obtém análise H2H de corner kicks para uma fixture específica
 * @access  Public
 */
router.post('/fixture', async (req, res) => {
  try {
    const { fixture } = req.body;
    
    if (!fixture || !fixture.teams) {
      return res.status(400).json({
        success: false,
        error: 'Fixture com times é obrigatória'
      });
    }

    // Verificar cache primeiro
    const fixtureId = fixture.fixture?.id || fixture.id;
    const cacheKey = `h2h-corners-fixture:${fixtureId}`;
    const cachedData = await cacheService.getCache('h2h-corners-fixture', { fixtureId });
    
    if (cachedData) {
      console.log('📦 Retornando análise H2H de corner kicks da fixture do cache');
      return res.json({
        success: true,
        data: cachedData,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Analisando H2H de corner kicks para fixture ${fixtureId}`);
    
    const analysis = await h2hCornerAnalysisService.getCompleteH2HCornerAnalysis(fixture);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Análise H2H de corner kicks não disponível para esta fixture'
      });
    }

    // Salvar no cache por 1 hora
    await cacheService.setCache('h2h-corners-fixture', { fixtureId }, analysis);

    res.json({
      success: true,
      data: analysis,
      fromCache: false,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao analisar H2H de corner kicks da fixture:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/h2h-corners/health
 * @desc    Verifica a saúde do serviço H2H de corner kicks
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serviço H2H de corner kicks funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
